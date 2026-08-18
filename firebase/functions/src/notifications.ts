/**
 * notifications.ts — Cloud Function for device token management
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/**
 * Register FCM device token for the current user.
 * Supports multiple devices per account.
 * Stored at /users/{uid}/devices/{deviceId}
 */
export const registerDeviceToken = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const { fcmToken, deviceId, platform, appVersion } = request.data as {
      fcmToken: string;
      deviceId: string;
      platform: 'android' | 'ios';
      appVersion: string;
    };

    if (!fcmToken || !deviceId) {
      throw new HttpsError('invalid-argument', 'fcmToken and deviceId are required.');
    }

    const db = getFirestore();
    await db
      .collection('users')
      .doc(uid)
      .collection('devices')
      .doc(deviceId)
      .set({
        fcmToken,
        platform,
        appVersion: appVersion || '1.0.0',
        lastSeen: FieldValue.serverTimestamp(),
      }, { merge: true });

    return { success: true };
  }
);
