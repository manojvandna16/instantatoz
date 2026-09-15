import { NextResponse } from 'next/server';
import { adminDb, getAdminApp } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(request: Request) {
  try {
    const { targetUserId, title, body, type, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const db = adminDb();

    // 1. Collect FCM tokens from devices subcollection
    let tokens: string[] = [];
    if (targetUserId) {
      // Single user
      const devicesSnap = await db.collection('users').doc(targetUserId).collection('devices').get();
      devicesSnap.forEach(doc => {
        const d = doc.data();
        if (d.fcmToken) tokens.push(d.fcmToken);
      });
    } else {
      // Broadcast to all users
      const devicesSnap = await db.collectionGroup('devices').get();
      devicesSnap.forEach(doc => {
        const d = doc.data();
        if (d.fcmToken) tokens.push(d.fcmToken);
      });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No registered devices found. Please open the app first to register.' });
    }

    // 2. Send via Firebase Admin SDK (FCM) - no Expo dependency!
    const uniqueTokens = [...new Set(tokens)];
    const messaging = getMessaging(getAdminApp());

    const sendPromises = uniqueTokens.map(token =>
      messaging.send({
        token,
        notification: {
          title,
          body,
        },
        data: {
          type: type || 'ADMIN_BROADCAST',
          ...(data || {}),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      }).catch(err => {
        console.error('Failed to send to token:', token.substring(0, 20), err.message);
        return null;
      })
    );

    const results = await Promise.all(sendPromises);
    const sentCount = results.filter(r => r !== null).length;

    // 3. Save to Firestore notifications log
    await db.collection('notifications').add({
      title,
      body,
      type: type || 'ADMIN_BROADCAST',
      userId: targetUserId || 'ALL_USERS',
      data: data || {},
      read: false,
      sentCount,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
