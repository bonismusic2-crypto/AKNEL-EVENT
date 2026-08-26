import { supabase } from '../lib/supabase';

export const SubscriptionService = {
  /**
   * Helper pour vérifier si l'utilisateur est abonné
   */
  async isUserSubscribed(user) {
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
          return {
            isSubscribed: true,
            plan: sub.plan_name || 'Abonnement VIP 2 € / mois',
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
        return {
          isSubscribed: true,
          plan: 'Abonnement VIP 2 € / mois',
          expiresAt: null,
        };
      }

      return { isSubscribed: false, plan: null, expiresAt: null };
    } catch (err) {
      console.warn('Erreur vérification abonnement Supabase:', err);
      return { isSubscribed: false, plan: null, expiresAt: null };
    }
  },

  /**
   * Enregistre ou met à jour l'abonnement VIP de l'utilisateur
   */
  async activateVipSubscription(user) {
    if (!user || !user.id) return false;

    try {
      const now = new Date();
      const oneMonthLater = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

      // Mettre à jour profiles ou subscriptions
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        status: 'active',
        plan_name: 'Abonnement VIP 2 € / mois',
        amount: 2.00,
        currency: 'EUR',
        current_period_end: oneMonthLater,
        created_at: new Date().toISOString(),
      });

      await supabase.from('profiles').upsert({
        id: user.id,
        is_vip: true,
        subscription_status: 'active',
        vip_until: oneMonthLater,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.warn('Erreur activation abonnement:', err);
      return true;
    }
  }
};
