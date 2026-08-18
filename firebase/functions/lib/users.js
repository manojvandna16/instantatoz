"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserProfile = void 0;
/**
 * users.ts � Cloud Functions for user profile management
 * Ported from apps/web/src/app/actions/user.ts
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const CURRENT_TERMS_VERSION = '2026-08-01';
const CURRENT_PRIVACY_VERSION = '2026-08-01';
/**
 * Creates or retrieves a user profile.
 * Generates USR-XXXXXX ID securely via Firestore transaction.
 * Stores legal consent server-side.
 *
 * Called from mobile: (auth)/consent.tsx for new users
 */
exports.createUserProfile = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    // 1. Must be authenticated
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const phone = request.auth.token.phone_number || '';
    const { consentVersions, name } = request.data;
    const db = (0, firestore_1.getFirestore)();
    const userRef = db.collection('users').doc(uid);
    const counterRef = db.collection('counters').doc('user');
    const result = await db.runTransaction(async (transaction) => {
        var _a;
        const userDoc = await transaction.get(userRef);
        // Returning user � just return existing profile
        if (userDoc.exists) {
            return { isNew: false, data: userDoc.data() };
        }
        // New user � consent is required
        if (!consentVersions) {
            throw new https_1.HttpsError('invalid-argument', 'Legal consent is required for new accounts.');
        }
        // Validate consent versions
        if (consentVersions.termsVersion !== CURRENT_TERMS_VERSION ||
            consentVersions.privacyVersion !== CURRENT_PRIVACY_VERSION) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid consent version. Please accept the latest terms.');
        }
        // Increment user counter for USR-XXXXXX
        const counterDoc = await transaction.get(counterRef);
        let count = 1;
        if (counterDoc.exists) {
            count = (((_a = counterDoc.data()) === null || _a === void 0 ? void 0 : _a.currentCount) || 0) + 1;
        }
        transaction.set(counterRef, { currentCount: count }, { merge: true });
        const userNumber = `USR-${count.toString().padStart(6, '0')}`;
        const newUserData = {
            id: uid,
            phone,
            name: name || '',
            userNumber,
            status: 'ACTIVE',
            hasWorkerProfile: false,
            activeMode: 'customer',
            consent: {
                termsAccepted: true,
                privacyPolicyAccepted: true,
                termsVersion: consentVersions.termsVersion,
                privacyVersion: consentVersions.privacyVersion,
                acceptedAt: firestore_1.FieldValue.serverTimestamp(),
            },
            savedAddresses: [],
            currentLocation: null,
            fcmTokens: {},
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        transaction.set(userRef, newUserData);
        return { isNew: true, data: newUserData };
    });
    return result;
});
//# sourceMappingURL=users.js.map