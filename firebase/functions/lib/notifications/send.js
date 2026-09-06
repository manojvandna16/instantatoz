"use strict";
/**
 * notifications/send.ts — Minimal FCM notification sender
 *
 * Sends push notifications to a user's registered devices.
 * Intentionally minimal: just enough for the marketplace loop.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
const db = (0, firestore_1.getFirestore)();
const messaging = (0, messaging_1.getMessaging)();
exports.sendNotification = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const { userId, title, body, data } = request.data;
    if (!userId || !title || !body) {
        throw new https_1.HttpsError('invalid-argument', 'userId, title, and body are required.');
    }
    const devicesSnap = await db
        .collection('users')
        .doc(userId)
        .collection('devices')
        .get();
    const tokens = [];
    devicesSnap.forEach((doc) => {
        var _a;
        const token = (_a = doc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
        if (token)
            tokens.push(token);
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
});
//# sourceMappingURL=send.js.map