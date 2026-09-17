import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
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

// Handle notification opened from background/killed state
messaging().onNotificationOpenedApp(remoteMessage => {
  const link = remoteMessage.data?.link;
  if (link && typeof link === 'string') {
    Linking.canOpenURL(link).then(supported => {
      if (supported) Linking.openURL(link);
    });
  }
});

// Handle notification opened from quit state (cold start)
messaging().getInitialNotification().then(remoteMessage => {
  if (remoteMessage) {
    const link = remoteMessage.data?.link;
    if (link && typeof link === 'string') {
      setTimeout(() => {
        Linking.openURL(link).catch(console.warn);
      }, 1000);
    }
  }
});

/**
 * Register FCM token and save to Firestore under users/{uid}/devices.
 * Also saves userType so admin can target by 'customer' | 'worker'.
 * Pass userType explicitly when known (e.g. after login) to avoid an extra DB read.
 */
export async function registerForPushNotificationsAsync(userType?: 'customer' | 'worker') {
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

    // 2. Get FCM token directly from Firebase
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

    // 4. Save token to Firestore with correct userType
    const user = auth().currentUser;
    if (user && fcmToken) {
      const resolvedType = userType || (await determineUserType(user.uid));

      await db
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .collection('devices')
        .doc(fcmToken)
        .set(
          {
            fcmToken,
            platform: Platform.OS,
            userType: resolvedType,
            updatedAt: firestore.Timestamp.now(),
          },
          { merge: true }
        );

      console.log(`FCM token saved [${resolvedType}]:`, fcmToken.substring(0, 20) + '...');
    }

    return fcmToken;
  } catch (e) {
    console.log('Push notification registration error:', e);
    return null;
  }
}

/**
 * Determines whether the current user is a customer or worker by checking Firestore.
 */
async function determineUserType(uid: string): Promise<'customer' | 'worker'> {
  try {
    const workerSnap = await db.collection(COLLECTIONS.WORKERS).doc(uid).get();
    if (workerSnap.exists) {
      const data = workerSnap.data()!;
      if (data.verificationStatus !== 'DELETED' && data.status !== 'DELETED') {
        return 'worker';
      }
    }
    return 'customer';
  } catch {
    return 'customer';
  }
}

/**
 * Listen for foreground FCM messages and display them as local notifications.
 */
export function setupForegroundNotificationListener() {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage.notification?.title);
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

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  userId: string;
  read: boolean;
  createdAt: any;
  data?: Record<string, any>;
}

/**
 * Real-time listener for a user's notifications.
 * Includes personal (uid), broadcast (ALL_USERS), and filtered (FILTERED:customer/worker).
 */
export function listenNotifications(
  uid: string,
  userType: 'customer' | 'worker',
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: Error) => void
) {
  // Removed .orderBy('createdAt', 'desc') to avoid requiring a composite index.
  // We'll sort the results client-side instead.
  const q = db
    .collection('notifications')
    .where('userId', 'in', [uid, 'ALL_USERS', `FILTERED:${userType}`])
    .limit(50);

  return q.onSnapshot(
    snapshot => {
      if (!snapshot) return;
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      
      // Sort client-side
      notifications.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (new Date(a.createdAt || 0)).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (new Date(b.createdAt || 0)).getTime();
        return timeB - timeA; // descending
      });
      
      callback(notifications);
    },
    error => {
      console.error('Error listening to notifications:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Mark a personal notification as read.
 * Broadcast notifications (ALL_USERS / FILTERED:*) cannot be individually marked.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db.collection('notifications').doc(notificationId).update({ read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Save an in-app notification to Firestore for job lifecycle events
 * (e.g. job accepted, worker arrived) when no backend push is triggered.
 */
export async function saveLocalNotification(params: {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
}) {
  try {
    await db.collection('notifications').add({
      ...params,
      read: false,
      createdAt: firestore.Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving local notification:', error);
  }
}
