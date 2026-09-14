import { adminDb } from './firebase-admin';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  try {
    // 1. Check user notification preferences
    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    const userData = userDoc.data();
    
    // If settings explicitly disable notifications, skip sending push
    if (userData?.settings?.notifications === false) {
      console.log(`Push notifications disabled for user ${userId}`);
      return;
    }

    // 2. Save notification to user's notifications collection for the in-app inbox
    const notificationRef = adminDb().collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      userId,
      title,
      body,
      data,
      isRead: false,
      createdAt: new Date(),
    });

    // 3. Get device tokens
    const devicesSnap = await adminDb().collection('users').doc(userId).collection('devices').get();
    if (devicesSnap.empty) {
      console.log(`No devices found for user ${userId}`);
      return;
    }

    const expoPushTokens: string[] = [];
    devicesSnap.forEach(doc => {
      const { expoToken } = doc.data();
      if (expoToken) expoPushTokens.push(expoToken);
    });

    if (expoPushTokens.length === 0) return;

    // 4. Send via Expo Push API
    const messages = expoPushTokens.map(pushToken => ({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: { ...data, notificationId: notificationRef.id },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Push notification dispatched:', result);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
