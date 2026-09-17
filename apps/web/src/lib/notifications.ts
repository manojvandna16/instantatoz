import { adminDb } from './firebase-admin';

/**
 * Send FCM push notification to a specific user (customer or worker).
 * Also saves notification to Firestore for in-app inbox.
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  try {
    // 1. Save to notifications collection (in-app inbox)
    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb().collection('notifications').add({
      userId,
      title,
      body,
      type: data.type || 'SYSTEM',
      data,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 2. Get FCM device tokens from users collection (customers)
    const userDevicesSnap = await adminDb()
      .collection('users').doc(userId).collection('devices').get();

    // 3. Also try workers collection (workers)
    const workerDevicesSnap = await adminDb()
      .collection('workers').doc(userId).collection('devices').get();

    const fcmTokens: string[] = [];

    userDevicesSnap.forEach(doc => {
      const { fcmToken } = doc.data();
      if (fcmToken) fcmTokens.push(fcmToken);
    });
    workerDevicesSnap.forEach(doc => {
      const { fcmToken } = doc.data();
      if (fcmToken && !fcmTokens.includes(fcmToken)) fcmTokens.push(fcmToken);
    });

    if (fcmTokens.length === 0) {
      console.log(`No FCM device tokens found for user ${userId}`);
      return;
    }

    // 4. Send via FCM using Admin SDK
    const { getMessaging } = await import('firebase-admin/messaging');
    const messaging = getMessaging();

    const sendPromises = fcmTokens.map(token =>
      messaging.send({
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries({ ...data, notificationId: userId })
            .map(([k, v]) => [k, String(v)])
        ),
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      }).catch(err => {
        console.error(`FCM send failed for token ${token.substring(0, 20)}:`, err.message);
        return null;
      })
    );

    const results = await Promise.all(sendPromises);
    const sent = results.filter(r => r !== null).length;
    console.log(`Push sent to ${sent}/${fcmTokens.length} devices for user ${userId}`);
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}

/**
 * Send FCM push notification to multiple workers (nearby workers for a new job).
 * Sends one FCM notification per worker concurrently.
 */
export async function notifyNearbyWorkers(
  workerIds: string[],
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  if (!workerIds || workerIds.length === 0) return;

  const { FieldValue } = await import('firebase-admin/firestore');
  const { getMessaging } = await import('firebase-admin/messaging');
  const messaging = getMessaging();

  const allTokens: { workerId: string; token: string }[] = [];

  // Fetch all tokens concurrently
  await Promise.all(
    workerIds.map(async (workerId) => {
      try {
        const snap = await adminDb()
          .collection('workers').doc(workerId).collection('devices').get();
        snap.forEach(doc => {
          const { fcmToken } = doc.data();
          if (fcmToken) allTokens.push({ workerId, token: fcmToken });
        });
      } catch (err) {
        console.error(`Failed to fetch devices for worker ${workerId}`, err);
      }
    })
  );

  if (allTokens.length === 0) {
    console.log('No worker devices found for job notification');
    return;
  }

  // Save one in-app notification per worker
  const batch = adminDb().batch();
  for (const workerId of workerIds) {
    const ref = adminDb().collection('notifications').doc();
    batch.set(ref, {
      userId: workerId,
      title,
      body,
      type: data.type || 'NEW_JOB',
      data,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  // Send FCM to all devices
  const sendPromises = allTokens.map(({ token }) =>
    messaging.send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'default' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    }).catch(() => null)
  );

  const results = await Promise.all(sendPromises);
  const sent = results.filter(r => r !== null).length;
  console.log(`Job notification sent to ${sent}/${allTokens.length} worker devices`);
}
