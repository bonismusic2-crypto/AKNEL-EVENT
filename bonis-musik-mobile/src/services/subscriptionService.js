import { supabase } from '../lib/supabase';

// Cache mémoire rapide pour éviter tout flash ou aller-retour paywall
const memorySubscriptionCache = new Map();

export const SubscriptionService = {
  /**
   * Enregistre l'état VIP directement dans le cache mémoire instantané
   */
  setSubscribedInMemory(userId, isSubscribed = true, plan = 'Abonnement VIP 2 € / mois', expiresAt = null) {
    if (!userId) return;
    const expiry = expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    memorySubscriptionCache.set(userId, {
      isSubscribed: !!isSubscribed,
      plan: plan || 'Abonnement VIP 2 € / mois',
      expiresAt: expiry,
      timestamp: Date.now(),
    });
  },

  /**
   * Vérifie si l'utilisateur est marqué abonné dans le cache mémoire instantané
   */
  isSubscribedInMemory(userId) {
    if (!userId) return false;
    const cached = memorySubscriptionCache.get(userId);
    if (!cached) return false;
    if (cached.expiresAt && new Date(cached.expiresAt) <= new Date()) {
      memorySubscriptionCache.delete(userId);
      return false;
    }
    return cached.isSubscribed === true;
  },

  /**
   * Réinitialise le cache mémoire
   */
  clearMemoryCache(userId = null) {
    if (userId) {
      memorySubscriptionCache.delete(userId);
    } else {
      memorySubscriptionCache.clear();
    }
  },

  /**
   * Helper ultra-rapide pour vérifier si l'utilisateur est abonné
   */
  async isUserSubscribed(user) {
    if (!user || !user.id) return false;
    // 1. Vérification synchrone instantanée en mémoire
    if (this.isSubscribedInMemory(user.id)) {
      return true;
    }
    const result = await this.checkSubscription(user);
    return result.isSubscribed;
  },

  /**
   * Vérifie si l'utilisateur possède un abonnement VIP actif
   */
  async checkSubscription(user) {
    if (!user || !user.id) {
      return { isSubscribed: false, plan: null, expiresAt: null };
    }

    // Utilisateur invité / visiteur sans abonnement actif
    if (user.isGuest || user.email === 'visiteur@bonismusik.com') {
      return { isSubscribed: false, plan: null, expiresAt: null };
    }

    // 0. Vérification du cache mémoire prioritaire
    if (memorySubscriptionCache.has(user.id)) {
      const cached = memorySubscriptionCache.get(user.id);
      if (cached && cached.isSubscribed) {
        const isNotExpired = !cached.expiresAt || new Date(cached.expiresAt) > new Date();
        if (isNotExpired) {
          return {
            isSubscribed: true,
            plan: cached.plan || 'Abonnement VIP 2 € / mois',
            expiresAt: cached.expiresAt,
          };
        }
      }
    }

    try {
      // 1. Vérification dans la table 'subscriptions'
      const { data: subs, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!subError && subs && subs.length > 0) {
        const sub = subs[0];
        const isActive = sub.status === 'active' || sub.status === 'trialing' || sub.is_active === true;
        const expiry = sub.expires_at || sub.current_period_end;
        const isNotExpired = !expiry || new Date(expiry) > new Date();

        if (isActive && isNotExpired) {
          const planName = sub.plan_name || 'Abonnement VIP 2 € / mois';
          this.setSubscribedInMemory(user.id, true, planName, expiry);
          return {
            isSubscribed: true,
            plan: planName,
            expiresAt: expiry,
          };
        }
      }

      // 2. Vérification dans la table 'profiles'
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('is_vip, subscription_status, vip_until')
        .eq('id', user.id)
        .maybeSingle();

      if (!profError && profile) {
        if (profile.is_vip === true || profile.subscription_status === 'active') {
          const isNotExpired = !profile.vip_until || new Date(profile.vip_until) > new Date();
          if (isNotExpired) {
            this.setSubscribedInMemory(user.id, true, 'Abonnement VIP 2 € / mois', profile.vip_until);
            return {
              isSubscribed: true,
              plan: 'Abonnement VIP 2 € / mois',
              expiresAt: profile.vip_until,
            };
          }
        }
      }

      // 3. Vérification dans user_metadata
      if (user.user_metadata?.is_vip === true || user.user_metadata?.subscription_status === 'active') {
        const vipUntil = user.user_metadata?.vip_until;
        const isNotExpired = !vipUntil || new Date(vipUntil) > new Date();
        if (isNotExpired) {
          this.setSubscribedInMemory(user.id, true, 'Abonnement VIP 2 € / mois', vipUntil || null);
          return {
            isSubscribed: true,
            plan: 'Abonnement VIP 2 € / mois',
            expiresAt: vipUntil || null,
          };
        }
      }

      return { isSubscribed: false, plan: null, expiresAt: null };
    } catch (err) {
      console.warn('Erreur vérification abonnement Supabase:', err);
      if (memorySubscriptionCache.has(user.id)) {
        const cached = memorySubscriptionCache.get(user.id);
        return {
          isSubscribed: !!cached.isSubscribed,
          plan: cached.plan,
          expiresAt: cached.expiresAt,
        };
      }
      return { isSubscribed: false, plan: null, expiresAt: null };
    }
  },

  /**
   * Enregistre ou met à jour l'abonnement VIP de l'utilisateur (Mémoire + Supabase)
   */
  async activateVipSubscription(user) {
    if (!user || !user.id) return false;

    const now = new Date();
    const oneMonthLater = new Date(new Date().setMonth(now.getMonth() + 1)).toISOString();

    // ⚡ 1. MAJ IMMÉDIATE du cache mémoire local (garantit 0 délai et 0 flash UI)
    this.setSubscribedInMemory(user.id, true, 'Abonnement VIP 2 € / mois', oneMonthLater);

    try {
      // 2. MAJ asynchrone persistante dans Supabase
      const subPromise = supabase.from('subscriptions').upsert({
        user_id: user.id,
        status: 'active',
        plan_name: 'Abonnement VIP 2 € / mois',
        amount: 2.00,
        currency: 'EUR',
        current_period_end: oneMonthLater,
        created_at: new Date().toISOString(),
      });

      const profPromise = supabase.from('profiles').upsert({
        id: user.id,
        is_vip: true,
        subscription_status: 'active',
        vip_until: oneMonthLater,
        updated_at: new Date().toISOString(),
      });

      await Promise.allSettled([subPromise, profPromise]);
      return true;
    } catch (err) {
      console.warn('Avertissement sync Supabase (actif en cache mémoire):', err);
      return true;
    }
  }
};
