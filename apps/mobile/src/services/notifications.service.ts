import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../constants';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  let token;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '2535d47a-8f30-4e50-8a75-a6e06b5a2422'
    })).data;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Save token to Firestore if user is logged in
    const user = auth().currentUser;
    if (user && token) {
      await db.collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .collection('devices')
        .doc(token) // use token string as doc ID
        .set({
          expoToken: token,
          platform: Platform.OS,
          updatedAt: firestore.Timestamp.now(),
        });
    }

    return token;
  } catch (e) {
    console.log('Push notification registration error:', e);
    return null;
  }
}
