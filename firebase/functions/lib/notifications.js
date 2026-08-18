"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeviceToken = void 0;
/**
 * notifications.ts � Cloud Function for device token management
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
/**
 * Register FCM device token for the current user.
 * Supports multiple devices per account.
 * Stored at /users/{uid}/devices/{deviceId}
 */
exports.registerDeviceToken = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const { fcmToken, deviceId, platform, appVersion } = request.data;
    if (!fcmToken || !deviceId) {
        throw new https_1.HttpsError('invalid-argument', 'fcmToken and deviceId are required.');
    }
    const db = (0, firestore_1.getFirestore)();
    await db
        .collection('users')
        .doc(uid)
        .collection('devices')
        .doc(deviceId)
        .set({
        fcmToken,
        platform,
        appVersion: appVersion || '1.0.0',
        lastSeen: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
});
//# sourceMappingURL=notifications.js.map