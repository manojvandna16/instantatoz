/**
 * notifications/send.ts — Minimal FCM notification sender
 *
 * Sends push notifications to a user's registered devices.
 * Intentionally minimal: just enough for the marketplace loop.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const db = getFirestore();
const messaging = getMessaging();

interface SendNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendNotification = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const { userId, title, body, data } = request.data as SendNotificationRequest;

    if (!userId || !title || !body) {
      throw new HttpsError('invalid-argument', 'userId, title, and body are required.');
    }

    const devicesSnap = await db
      .collection('users')
      .doc(userId)
      .collection('devices')
      .get();

    const tokens: string[] = [];
    devicesSnap.forEach((doc) => {
      const token = doc.data()?.fcmToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) {
      return { success: true, message: 'No devices registered.' };
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    return {
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    };
  }
);