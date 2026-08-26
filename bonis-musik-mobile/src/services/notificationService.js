import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configuration du comportement des notifications lorsqu'elles arrivent quand l'application est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  /**
   * Enregistre les permissions de notification auprès du système d'exploitation
   */
  async registerForPushNotificationsAsync() {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Bonis Musik Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C59B27',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission de notification non accordée.');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) {
      console.log('Info Push Token (nécessite un projectId Expo en standalone):', e.message);
    }

    return token;
  },

  /**
   * Envoie une notification locale instantanée sur le téléphone de l'utilisateur
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: true,
          color: '#C59B27',
        },
        trigger: null, // trigger immédiat
      });
    } catch (err) {
      console.warn('Erreur envoi notification locale:', err);
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
