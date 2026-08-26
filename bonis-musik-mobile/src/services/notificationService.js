import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  }
};
