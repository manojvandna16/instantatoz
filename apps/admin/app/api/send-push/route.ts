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
        // Workers are stored in 'workers' collection — get their UIDs
        const workersSnap = await db.collection('workers').get();
        workersSnap.forEach(doc => targetUids!.add(doc.id));
      }
    }

    if (targetUserId) {
      // Single user — check both users and workers collection for their device token
      const devicesSnap = await db.collection('users').doc(targetUserId).collection('devices').get();
      devicesSnap.forEach(doc => {
        const d = doc.data();
        if (d.fcmToken) tokens.push(d.fcmToken);
      });
      const workerDevicesSnap = await db.collection('workers').doc(targetUserId).collection('devices').get();
      workerDevicesSnap.forEach(doc => {
        const d = doc.data();
        if (d.fcmToken) tokens.push(d.fcmToken);
      });
    } else if (targetUids) {
      // Filtered broadcast by user type (look up devices under each UID in users and workers collections)
      const uidsArray = Array.from(targetUids);
      const batchPromises = uidsArray.map(async (uid) => {
        try {
          const [devicesSnap, workerDevicesSnap] = await Promise.all([
            db.collection('users').doc(uid).collection('devices').get(),
            db.collection('workers').doc(uid).collection('devices').get()
          ]);
          
          devicesSnap.forEach(doc => {
            if (doc.data().fcmToken) tokens.push(doc.data().fcmToken);
          });
          workerDevicesSnap.forEach(doc => {
            if (doc.data().fcmToken) tokens.push(doc.data().fcmToken);
          });
        } catch (err) {
          console.error(`Failed to fetch devices for uid ${uid}`, err);
        }
      });
      
      // Execute all device fetches concurrently
      await Promise.all(batchPromises);
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

    // 2. Send via Firebase Admin SDK (FCM)
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
          ...(data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : {}),
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
    const failedCount = results.filter(r => r === null).length;

    // 3. Save to Firestore notifications log
    // FIX: Correct userId logic — operator precedence was wrong before
    let notifUserId: string;
    if (targetUserId) {
      notifUserId = targetUserId;
    } else if (targetUserType) {
      notifUserId = `FILTERED:${targetUserType}`;
    } else {
      notifUserId = 'ALL_USERS';
    }

    // FIX: Use Firestore server timestamp so mobile can call .toDate() on it
    const { FieldValue } = await import('firebase-admin/firestore');
    await db.collection('notifications').add({
      title,
      body,
      type: type || 'ADMIN_BROADCAST',
      userId: notifUserId,
      userType: targetUserType || null,
      data: data || {},
      imageUrl: imageUrl || null,
      link: link || null,
      read: false,
      sentCount,
      failedCount,
      createdAt: FieldValue.serverTimestamp(),
    });

    let message = `Successfully sent to ${sentCount} devices.`;
    if (failedCount > 0) message += ` Failed to send to ${failedCount} devices (tokens might be invalid/expired).`;
    if (sentCount === 0 && failedCount === 0) message = 'No registered devices found for the target audience.';

    return NextResponse.json({ success: true, sentCount, message });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
