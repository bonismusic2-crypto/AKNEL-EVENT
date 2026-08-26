import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Chargement sécurisé et dynamique de expo-notifications pour éviter tout blocage bundler
let NotificationsModule = null;
try {
  NotificationsModule = require('expo-notifications');
  if (NotificationsModule && NotificationsModule.setNotificationHandler) {
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('Info expo-notifications fallback mode:', e.message);
}

export const NotificationService = {
  /**
   * Enregistre les permissions de notification auprès du système d'exploitation
   */
  async registerForPushNotificationsAsync() {
    let token = null;
    if (!NotificationsModule) return null;

    try {
      if (Platform.OS === 'android' && NotificationsModule.setNotificationChannelAsync) {
        await NotificationsModule.setNotificationChannelAsync('default', {
          name: 'Bonis Musik Notifications',
          importance: NotificationsModule.AndroidImportance ? NotificationsModule.AndroidImportance.MAX : 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C59B27',
        });
      }

      if (NotificationsModule.getPermissionsAsync && NotificationsModule.requestPermissionsAsync) {
        const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await NotificationsModule.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return null;
        }

        if (NotificationsModule.getExpoPushTokenAsync) {
          token = (await NotificationsModule.getExpoPushTokenAsync()).data;
        }
      }
    } catch (e) {
      console.log('Info Push Token setup:', e.message);
    }

    return token;
  },

  /**
   * Envoie une notification locale instantanée sur le téléphone de l'utilisateur
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      if (NotificationsModule && NotificationsModule.scheduleNotificationAsync) {
        await NotificationsModule.scheduleNotificationAsync({
          content: {
            title: title,
            body: body,
            data: data,
            sound: true,
            color: '#C59B27',
          },
          trigger: null, // trigger immédiat
        });
      }
    } catch (err) {
      console.warn('Notification locale non affichée:', err?.message || err);
    }
  },

  /**
   * Enregistre une notification dans la table Supabase 'notifications'
   */
  async recordNotificationInDatabase({ userId, type, title, message, badge, badgeBg, badgeTextColor, actionType, actionText }) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId || null,
        type: type || 'general',
        title: title,
        message: message,
        badge: badge || 'Bonis Musik',
        badge_bg: badgeBg || '#FEF3C7',
        badge_text_color: badgeTextColor || '#92400E',
        action_type: actionType || 'home',
        action_text: actionText || 'Consulter',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erreur enregistrement notification DB:', e);
    }
  },

  /**
   * Événement 1 : Notification Souscription / Activation d'Abonnement
   */
  async notifySubscriptionActivated(user, planName, expiryDate) {
    const title = '🎉 Abonnement Confirmé !';
    const formattedDate = expiryDate ? new Date(expiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '30 jours';
    const message = `Félicitations ! Votre ${planName} est désormais actif jusqu'au ${formattedDate}. Tous les albums et clips sont débloqués.`;

    // 1. Notification Push Système Locale
    await this.sendLocalNotification(title, message, { type: 'subscription', action: 'paywall' });

    // 2. Enregistrement Base de données
    await this.recordNotificationInDatabase({
      userId: user?.id,
      type: 'subscription',
      title: title,
      message: message,
      badge: 'Abonnement Actif',
      badgeBg: '#DCFCE7',
      badgeTextColor: '#166534',
      actionType: 'paywall',
      actionText: 'Voir mon abonnement',
    });
  },

  /**
   * Événement 2 : Notification Changement de Formule (Mensuel <-> Annuel)
   */
  async notifyPlanChanged(user, newPlanName, expiryDate) {
    const title = '🔄 Formule d\'Abonnement Modifiée';
    const formattedDate = expiryDate ? new Date(expiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 an';
    const message = `Votre formule a été mise à jour avec succès : ${newPlanName} (Valable jusqu'au ${formattedDate}).`;

    await this.sendLocalNotification(title, message, { type: 'subscription', action: 'paywall' });

    await this.recordNotificationInDatabase({
      userId: user?.id,
      type: 'subscription',
      title: title,
      message: message,
      badge: 'Formule Modifiée',
      badgeBg: '#FEF3C7',
      badgeTextColor: '#B45309',
      actionType: 'paywall',
      actionText: 'Voir mon profil',
    });
  },

  /**
   * Événement 3 : Notification Résiliation / Annulation d'Abonnement
   */
  async notifySubscriptionCancelled(user) {
    const title = '⚠️ Abonnement Résilié';
    const message = 'Votre abonnement a bien été résilié. Vous pouvez vous réabonner à tout moment pour retrouver l\'accès illimité.';

    await this.sendLocalNotification(title, message, { type: 'subscription', action: 'paywall' });

    await this.recordNotificationInDatabase({
      userId: user?.id,
      type: 'subscription',
      title: title,
      message: message,
      badge: 'Abonnement Résilié',
      badgeBg: '#FEE2E2',
      badgeTextColor: '#B91C1C',
      actionType: 'paywall',
      actionText: 'Se réabonner',
    });
  },

  /**
   * Événement 4 : Notification Sortie Nouveau Clip / Média / Concert
   */
  async notifyNewMediaRelease(title, artistOrSpeaker, category = 'clip') {
    const notifTitle = category === 'clip' ? '🎬 Nouveau Clip Vidéo HD !' : '📖 Nouvel Enseignement Disponible';
    const message = `Découvrez "${title}" par ${artistOrSpeaker || 'le Chantre Boniface'} sur Bonis Musik.`;

    await this.sendLocalNotification(notifTitle, message, { type: category, action: 'media' });

    await this.recordNotificationInDatabase({
      userId: null, // Global à tous
      type: category,
      title: notifTitle,
      message: message,
      badge: category === 'clip' ? 'Nouveau Clip 4K' : 'Enseignement',
      badgeBg: category === 'clip' ? '#FEF3C7' : '#E0E7FF',
      badgeTextColor: category === 'clip' ? '#92400E' : '#3730A3',
      actionType: category,
      actionText: 'Écouter / Regarder',
    });
  }
};
