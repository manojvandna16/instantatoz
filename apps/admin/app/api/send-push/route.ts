import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Reusing the Expo Push logic
async function sendExpoPushNotification(token: string, title: string, body: string, data: any = {}) {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  return response.json();
}

export async function POST(request: Request) {
  try {
    const { targetUserId, title, body, type, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const db = adminDb();

    // 1. Get tokens
    let tokens: string[] = [];
    if (targetUserId) {
      // Single user
      const userDoc = await db.collection('users').doc(targetUserId).get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        if (userData.pushTokens && userData.pushTokens.length > 0 && userData.settings?.notificationsEnabled !== false) {
          tokens = userData.pushTokens;
        }
      }
    } else {
      // All users (this is a simplified approach, for large apps use batched queries or topics)
      const usersSnap = await db.collection('users').get();
      usersSnap.docs.forEach((doc: any) => {
        const userData = doc.data() || {};
        if (userData.pushTokens && userData.pushTokens.length > 0 && userData.settings?.notificationsEnabled !== false) {
          tokens.push(...userData.pushTokens);
        }
      });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No valid push tokens found for target' });
    }

    // 2. Send via Expo
    const uniqueTokens = [...new Set(tokens)];
    const expoPromises = uniqueTokens.map((token: string) => sendExpoPushNotification(token, title, body, data));
    await Promise.all(expoPromises);

    // 3. Save to Firestore (optional, but good for admin log)
    await db.collection('notifications').add({
      title,
      body,
      type: type || 'ADMIN_BROADCAST',
      userId: targetUserId || 'ALL_USERS',
      data: data || {},
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, sentCount: uniqueTokens.length });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
