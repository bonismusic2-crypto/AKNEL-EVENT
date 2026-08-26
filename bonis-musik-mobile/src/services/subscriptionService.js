import { supabase } from '../lib/supabase';

// Cache mémoire rapide pour synchronisation instantanée
const memorySubscriptionCache = new Map();

export const SubscriptionService = {
  /**
   * Enregistre l'état d'abonnement directement dans le cache mémoire instantané
   */
  setSubscribedInMemory(userId, isSubscribed = true, plan = 'Abonnement Mensuel (1 000 FCFA = 1,50 €)', expiresAt = null) {
    if (!userId) return;
    const expiry = expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    memorySubscriptionCache.set(userId, {
      isSubscribed: !!isSubscribed,
      plan: plan || 'Abonnement Mensuel (1 000 FCFA = 1,50 €)',
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
    if (this.isSubscribedInMemory(user.id)) {
      return true;
    }
    const result = await this.checkSubscription(user);
    return result.isSubscribed;
  },

  /**
   * Vérifie si l'utilisateur possède un abonnement actif et retourne les détails complets
   */
  async checkSubscription(user) {
    if (!user || !user.id) {
      return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    }

    if (user.isGuest || user.email === 'visiteur@bonismusik.com') {
      return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    }

    try {
      // 1. Table 'subscriptions'
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
          const isAnnual = sub.plan_name?.toLowerCase().includes('annuel') || Number(sub.amount) >= 10;
          this.setSubscribedInMemory(user.id, true, sub.plan_name, expiry);
          return {
            isSubscribed: true,
            plan: sub.plan_name || (isAnnual ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)' : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)'),
            planType: isAnnual ? 'annual' : 'monthly',
            amount: isAnnual ? '10 000 FCFA = 15,00 €' : '1 000 FCFA = 1,50 €',
            expiresAt: expiry || null,
          };
        }
      }

      // 2. Table 'profiles'
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('is_vip, subscription_status, vip_until')
        .eq('id', user.id)
        .maybeSingle();

      if (!profError && profile) {
        if (profile.is_vip === true || profile.subscription_status === 'active') {
          const isNotExpired = !profile.vip_until || new Date(profile.vip_until) > new Date();
          if (isNotExpired) {
            this.setSubscribedInMemory(user.id, true, 'Abonnement Bonis Musik', profile.vip_until);
            return {
              isSubscribed: true,
              plan: 'Abonnement Bonis Musik',
              planType: 'monthly',
              amount: '1 000 FCFA = 1,50 €',
              expiresAt: profile.vip_until,
            };
          }
        }
      }

      return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    } catch (err) {
      console.warn('Erreur vérification abonnement Supabase:', err);
      return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    }
  },

  /**
   * Enregistre ou met à jour l'abonnement de l'utilisateur (mensuel ou annuel)
   */
  async activateVipSubscription(user, planType = 'monthly') {
    if (!user || !user.id) return false;

    try {
      const now = new Date();
      const isAnnual = planType === 'annual';
      const durationDays = isAnnual ? 365 : 30;
      const expiryDate = new Date(now.getTime() + durationDays * 24 * 3600 * 1000).toISOString();
      const planName = isAnnual
        ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)'
        : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)';
      const amount = isAnnual ? 15.00 : 1.50;

      // 1. Cache mémoire immédiat
      this.setSubscribedInMemory(user.id, true, planName, expiryDate);

      // 2. Persistance asynchrone Supabase
      await Promise.allSettled([
        supabase.from('subscriptions').upsert({
          user_id: user.id,
          status: 'active',
          plan_name: planName,
          amount: amount,
          currency: 'EUR',
          current_period_end: expiryDate,
          created_at: new Date().toISOString(),
        }),
        supabase.from('profiles').upsert({
          id: user.id,
          is_vip: true,
          subscription_status: 'active',
          vip_until: expiryDate,
          updated_at: new Date().toISOString(),
        })
      ]);

      return true;
    } catch (err) {
      console.warn('Erreur activation abonnement:', err);
      return false;
    }
  },

  /**
   * Annule l'abonnement en cours de l'utilisateur
   */
  async cancelSubscription(user) {
    if (!user || !user.id) return false;

    try {
      // 1. Vider le cache mémoire immédiat
      this.clearMemoryCache(user.id);

      // 2. Mettre à jour Supabase subscriptions et profiles
      await Promise.allSettled([
        supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id),
        supabase
          .from('profiles')
          .update({
            is_vip: false,
            subscription_status: 'cancelled',
            vip_until: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      ]);

      return true;
    } catch (err) {
      console.warn('Erreur annulation abonnement Supabase:', err);
      return false;
    }
  }
};
