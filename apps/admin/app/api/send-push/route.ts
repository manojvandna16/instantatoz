import { NextResponse } from 'next/server';
import { adminDb, getAdminApp } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { verifyAdmin } from '@/lib/verify-admin';

export async function POST(request: Request) {
  try {
    const claims = await verifyAdmin('notifications');
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, targetUserType, title, body, type, data, imageUrl, link } = await request.json();

    if (!targetUserId && !targetUserType) {
      const role = claims.role;
      if (role !== 'SUPER_ADMIN' && role !== 'OPERATIONS_ADMIN') {
        return NextResponse.json({ error: 'Forbidden: broadcast requires elevated role' }, { status: 403 });
      }
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const db = adminDb();

    // 1. Collect FCM tokens from devices subcollection
    let tokens: string[] = [];
    let targetUids: Set<string> | null = null;

    // Determine which user UIDs to target
    if (targetUserType && !targetUserId) {
      // Filter by user type (customer vs worker)
      targetUids = new Set<string>();
      if (targetUserType === 'customer') {
        const usersSnap = await db.collection('users')
          .where('activeMode', '==', 'customer')
          .get();
        usersSnap.forEach(doc => targetUids!.add(doc.id));
      } else if (targetUserType === 'worker') {
        const workersSnap = await db.collection('workers').get();
        workersSnap.forEach(doc => targetUids!.add(doc.id));
      }
    }

    if (targetUserId) {
      // Single user
      const devicesSnap = await db.collection('users').doc(targetUserId).collection('devices').get();
      devicesSnap.forEach(doc => {
        const d = doc.data();
        if (d.fcmToken) tokens.push(d.fcmToken);
      });
    } else if (targetUids) {
      // Filtered broadcast by user type (queries users/workers then devices)
      for (const uid of targetUids) {
        const devicesSnap = await db.collection('users').doc(uid).collection('devices').get();
        devicesSnap.forEach(doc => {
          const d = doc.data();
          if (d.fcmToken) tokens.push(d.fcmToken);
        });
      }
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
          ...(imageUrl && { image: imageUrl }),
        },
        data: {
          type: type || 'ADMIN_BROADCAST',
          ...(link && { link }),
          ...(data || {}),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            ...(imageUrl && { imageUrl }),
          },
        },
        ...(link && {
          webpush: {
            fcmOptions: {
              link,
            },
          },
        }),
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
      userId: targetUserId || targetUserType ? `FILTERED:${targetUserType || targetUserId}` : 'ALL_USERS',
      userType: targetUserType || null,
      data: data || {},
      imageUrl: imageUrl || null,
      link: link || null,
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
