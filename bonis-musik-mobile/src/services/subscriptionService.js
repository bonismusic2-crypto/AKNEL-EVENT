import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Cache mémoire rapide pour synchronisation synchrone
const memorySubscriptionCache = new Map();

// Clé de stockage persistant ExpoSecureStore
const SECURE_STORE_PREFIX = 'bonis_vip_sub_';

const StorageAdapter = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('Subscription SecureStore setItem warning:', e);
    }
  },
  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('Subscription SecureStore removeItem warning:', e);
    }
  },
};

export const SubscriptionService = {
  /**
   * Enregistre l'état d'abonnement dans le cache mémoire ET le stockage persistant permanent
   */
  async setSubscribedPermanently(userId, isSubscribed = true, plan = 'Abonnement Mensuel (1 000 FCFA = 1,50 €)', expiresAt = null, planType = 'monthly') {
    if (!userId) return;
    const now = new Date();
    const expiry = expiresAt || new Date(now.getTime() + (planType === 'annual' ? 365 : 30) * 24 * 3600 * 1000).toISOString();
    const isAnnual = planType === 'annual' || (typeof plan === 'string' && plan.toLowerCase().includes('annuel'));

    const subData = {
      isSubscribed: !!isSubscribed,
      plan: plan || (isAnnual ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)' : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)'),
      planType: isAnnual ? 'annual' : 'monthly',
      amount: isAnnual ? '10 000 FCFA = 15,00 €' : '1 000 FCFA = 1,50 €',
      expiresAt: expiry,
      timestamp: Date.now(),
      userId,
    };

    // 1. Cache mémoire synchrone
    memorySubscriptionCache.set(userId, subData);

    // 2. Persistance permanente SecureStore
    try {
      await StorageAdapter.setItem(`${SECURE_STORE_PREFIX}${userId}`, JSON.stringify(subData));
      // Clé globale du dernier utilisateur actif
      await StorageAdapter.setItem('bonis_last_active_sub', JSON.stringify(subData));
    } catch (err) {
      console.warn('Erreur écriture persistance abonnement:', err);
    }
  },

  /**
   * Alias synchrone / rapide pour le cache mémoire
   */
  setSubscribedInMemory(userId, isSubscribed = true, plan = 'Abonnement Mensuel (1 000 FCFA = 1,50 €)', expiresAt = null) {
    if (!userId) return;
    const isAnnual = typeof plan === 'string' && plan.toLowerCase().includes('annuel');
    this.setSubscribedPermanently(userId, isSubscribed, plan, expiresAt, isAnnual ? 'annual' : 'monthly');
  },

  /**
   * Lecture synchrone rapide depuis le cache mémoire (sans promesse)
   */
  getFastSubscriptionState(userId) {
    if (!userId) return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    const cached = memorySubscriptionCache.get(userId);
    if (cached) {
      if (cached.expiresAt && new Date(cached.expiresAt) <= new Date()) {
        memorySubscriptionCache.delete(userId);
        return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
      }
      return cached;
    }
    return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
  },

  /**
   * Récupère l'abonnement depuis le stockage persistant SecureStore (résiste aux redémarrages)
   */
  async getPersistedSubscription(userId) {
    if (!userId) return null;
    try {
      const raw = await StorageAdapter.getItem(`${SECURE_STORE_PREFIX}${userId}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.isSubscribed) {
          // Vérifier si la date d'expiration est encore valide
          if (!data.expiresAt || new Date(data.expiresAt) > new Date()) {
            // Remettre dans le cache mémoire
            memorySubscriptionCache.set(userId, data);
            return data;
          }
        }
      }
    } catch (e) {
      console.warn('Erreur lecture persistance abonnement:', e);
    }
    return null;
  },

  /**
   * Vérifie si l'utilisateur est marqué abonné dans le cache mémoire instantané
   */
  isSubscribedInMemory(userId) {
    if (!userId) return false;
    const state = this.getFastSubscriptionState(userId);
    return state.isSubscribed === true;
  },

  /**
   * Réinitialise le cache mémoire et la persistance locale
   */
  async clearMemoryCache(userId = null) {
    if (userId) {
      memorySubscriptionCache.delete(userId);
      await StorageAdapter.removeItem(`${SECURE_STORE_PREFIX}${userId}`);
    } else {
      memorySubscriptionCache.clear();
      await StorageAdapter.removeItem('bonis_last_active_sub');
    }
  },

  /**
   * Helper ultra-rapide pour vérifier si l'utilisateur est abonné (avec persistance locale prioritaire)
   */
  async isUserSubscribed(user) {
    if (!user || !user.id) return false;
    if (user.isGuest || user.email === 'visiteur@bonismusik.com') return false;

    // 1. Cache mémoire synchrone
    if (this.isSubscribedInMemory(user.id)) {
      return true;
    }

    // 2. Persistance permanente SecureStore locale (accès instantané hors-ligne / redémarrage)
    const persisted = await this.getPersistedSubscription(user.id);
    if (persisted && persisted.isSubscribed) {
      return true;
    }

    // 3. Métadonnées utilisateur Auth directes (si synchronisées)
    if (user.user_metadata?.is_vip === true || user.user_metadata?.subscription_status === 'active') {
      const expiry = user.user_metadata?.vip_until || user.user_metadata?.expires_at;
      if (!expiry || new Date(expiry) > new Date()) {
        const plan = user.user_metadata?.plan_name || 'Abonnement Bonis Musik';
        await this.setSubscribedPermanently(user.id, true, plan, expiry);
        return true;
      }
    }

    // 4. Vérification complète auprès de Supabase
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

    // 1. Vérification prioritaire dans la persistance locale SecureStore
    const persisted = await this.getPersistedSubscription(user.id);
    if (persisted && persisted.isSubscribed && (!persisted.expiresAt || new Date(persisted.expiresAt) > new Date())) {
      // Si la donnée locale a moins de 5 minutes, on peut la renvoyer directement et synchroniser en tâche de fond
      if (persisted.timestamp && (Date.now() - persisted.timestamp < 5 * 60 * 1000)) {
        return persisted;
      }
    }

    try {
      // 2. Table 'subscriptions' (supporte toutes les variantes de colonnes)
      const { data: subs, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!subError && subs && subs.length > 0) {
        const sub = subs[0];
        const isActive =
          sub.status === 'active' ||
          sub.status === 'completed' ||
          sub.status === 'trialing' ||
          sub.status === 'paid' ||
          sub.is_active === true;

        const expiry = sub.expires_at || sub.current_period_end || sub.vip_until;
        const isNotExpired = !expiry || new Date(expiry) > new Date();

        if (isActive && isNotExpired) {
          const isAnnual =
            (sub.plan_name && sub.plan_name.toLowerCase().includes('annuel')) ||
            Number(sub.amount) >= 10 ||
            Number(sub.plan_price) >= 5000;

          const planName =
            sub.plan_name ||
            (isAnnual
              ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)'
              : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)');

          const result = {
            isSubscribed: true,
            plan: planName,
            planType: isAnnual ? 'annual' : 'monthly',
            amount: isAnnual ? '10 000 FCFA = 15,00 €' : '1 000 FCFA = 1,50 €',
            expiresAt: expiry || null,
          };

          // Sauvegarder immédiatement dans le stockage permanent
          await this.setSubscribedPermanently(user.id, true, result.plan, result.expiresAt, result.planType);
          return result;
        }
      }

      // 3. Table 'profiles'
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profError && profile) {
        const isProfileVip =
          profile.is_vip === true ||
          profile.subscription_status === 'active' ||
          profile.subscription_status === 'completed' ||
          profile.role === 'vip' ||
          profile.role === 'admin';

        const profExpiry = profile.vip_until || profile.expires_at || profile.subscription_end;
        const isNotExpired = !profExpiry || new Date(profExpiry) > new Date();

        if (isProfileVip && isNotExpired) {
          const isAnnual =
            (profile.plan_name && profile.plan_name.toLowerCase().includes('annuel')) ||
            profile.plan_type === 'annual';

          const planName =
            profile.plan_name ||
            (isAnnual
              ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)'
              : 'Abonnement Bonis Musik');

          const result = {
            isSubscribed: true,
            plan: planName,
            planType: isAnnual ? 'annual' : 'monthly',
            amount: isAnnual ? '10 000 FCFA = 15,00 €' : '1 000 FCFA = 1,50 €',
            expiresAt: profExpiry || null,
          };

          // Sauvegarder dans le stockage permanent
          await this.setSubscribedPermanently(user.id, true, result.plan, result.expiresAt, result.planType);
          return result;
        }
      }

      // 4. Métadonnées du compte utilisateur Auth
      if (user.user_metadata?.is_vip === true || user.user_metadata?.subscription_status === 'active') {
        const expiry = user.user_metadata?.vip_until || user.user_metadata?.expires_at;
        if (!expiry || new Date(expiry) > new Date()) {
          const isAnnual = user.user_metadata?.plan_type === 'annual';
          const planName =
            user.user_metadata?.plan_name ||
            (isAnnual
              ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)'
              : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)');

          const result = {
            isSubscribed: true,
            plan: planName,
            planType: isAnnual ? 'annual' : 'monthly',
            amount: isAnnual ? '10 000 FCFA = 15,00 €' : '1 000 FCFA = 1,50 €',
            expiresAt: expiry || null,
          };

          await this.setSubscribedPermanently(user.id, true, result.plan, result.expiresAt, result.planType);
          return result;
        }
      }

      // Si le stockage local avait une entrée valide et que l'appel Supabase a échoué silencieusement, conserver le local
      if (persisted && persisted.isSubscribed && (!persisted.expiresAt || new Date(persisted.expiresAt) > new Date())) {
        return persisted;
      }

      return { isSubscribed: false, plan: null, planType: 'monthly', expiresAt: null };
    } catch (err) {
      console.warn('Erreur vérification abonnement Supabase:', err);
      // En cas d'erreur réseau, s'appuyer sur la persistance locale si valide
      if (persisted && persisted.isSubscribed && (!persisted.expiresAt || new Date(persisted.expiresAt) > new Date())) {
        return persisted;
      }
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
      const amountFcfa = isAnnual ? 10000.00 : 1000.00;

      // 1. Stockage permanent immédiat (mémoire + SecureStore)
      await this.setSubscribedPermanently(user.id, true, planName, expiryDate, isAnnual ? 'annual' : 'monthly');

      // 2. Mise à jour des métadonnées Auth utilisateur Supabase
      try {
        await supabase.auth.updateUser({
          data: {
            is_vip: true,
            subscription_status: 'active',
            vip_until: expiryDate,
            plan_name: planName,
            plan_type: isAnnual ? 'annual' : 'monthly',
          }
        });
      } catch (authErr) {
        console.warn('Auth metadata update warning:', authErr);
      }

      // 3. Persistance dans la table 'subscriptions' (vérification de l'existence d'une ligne)
      try {
        const { data: existingSubs } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (existingSubs && existingSubs.length > 0) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              plan_name: planName,
              amount: amount,
              plan_price: amountFcfa,
              currency: 'XOF',
              starts_at: now.toISOString(),
              expires_at: expiryDate,
              current_period_end: expiryDate,
            })
            .eq('id', existingSubs[0].id);
        } else {
          await supabase.from('subscriptions').insert({
            user_id: user.id,
            status: 'active',
            plan_name: planName,
            amount: amount,
            plan_price: amountFcfa,
            currency: 'XOF',
            starts_at: now.toISOString(),
            expires_at: expiryDate,
            current_period_end: expiryDate,
            created_at: now.toISOString(),
          });
        }
      } catch (subErr) {
        console.warn('Subscriptions table write warning:', subErr);
      }

      // 4. Persistance dans la table 'profiles'
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          is_vip: true,
          subscription_status: 'active',
          vip_until: expiryDate,
          updated_at: now.toISOString(),
        });
      } catch (profErr) {
        console.warn('Profiles table write warning:', profErr);
      }

      // 5. 🔔 Déclenchement de la Notification Push et In-App
      try {
        const { NotificationService } = require('./notificationService');
        await NotificationService.notifySubscriptionActivated(user, planName, expiryDate);
      } catch (notifErr) {
        console.warn('Notification trigger warning:', notifErr);
      }

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
      // 1. Vider le cache mémoire et la persistance locale
      await this.clearMemoryCache(user.id);

      // 2. Mettre à jour les métadonnées Auth Supabase
      try {
        await supabase.auth.updateUser({
          data: {
            is_vip: false,
            subscription_status: 'cancelled',
          }
        });
      } catch (e) {}

      // 3. Mettre à jour Supabase subscriptions et profiles
      await Promise.allSettled([
        supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            expires_at: new Date().toISOString(),
            current_period_end: new Date().toISOString(),
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

      // 4. 🔔 Déclenchement de la Notification Push et In-App d'Annulation
      try {
        const { NotificationService } = require('./notificationService');
        await NotificationService.notifySubscriptionCancelled(user);
      } catch (notifErr) {
        console.warn('Notification cancel trigger warning:', notifErr);
      }

      return true;
    } catch (err) {
      console.warn('Erreur annulation abonnement Supabase:', err);
      return false;
    }
  }
};

