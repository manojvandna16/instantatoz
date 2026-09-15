import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../constants';

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Handle background messages (when app is in background or killed)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage.notification?.title);
});

export async function registerForPushNotificationsAsync() {
  try {
    // 1. Request permission from user
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Push notification permission denied');
      return null;
    }

    // 2. Get FCM token directly from Firebase (no Expo dashboard needed!)
    const fcmToken = await messaging().getToken();

    if (!fcmToken) {
      console.log('Failed to get FCM token');
      return null;
    }

    // 3. Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1d4ed8',
      });
    }

    // 4. Save FCM token to Firestore under user's devices subcollection
    const user = auth().currentUser;
    if (user && fcmToken) {
      await db.collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .collection('devices')
        .doc(fcmToken)
        .set({
          fcmToken,
          platform: Platform.OS,
          updatedAt: firestore.Timestamp.now(),
        });
      console.log('FCM token saved to Firestore:', fcmToken.substring(0, 20) + '...');
    }

    return fcmToken;
  } catch (e) {
    console.log('Push notification registration error:', e);
    return null;
  }
}

// Listen for foreground messages
export function setupForegroundNotificationListener() {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage.notification?.title);
    // Show the notification using expo-notifications when app is open
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
      },
      trigger: null, // show immediately
    });
  });
}
