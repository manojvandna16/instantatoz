"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFullAccount = exports.stopBeingWorker = void 0;
/**
 * account.ts � Cloud Functions for account management
 * Ported from apps/web/src/app/actions/account.ts
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
/**
 * Stop being a worker � removes worker capability, keeps customer account.
 * Worker profile is anonymized (not deleted).
 */
exports.stopBeingWorker = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const db = (0, firestore_1.getFirestore)();
    await db.collection('workers').doc(uid).update({
        status: 'DELETED',
        isOnline: false,
        liveLocation: null,
        geohash: null,
        name: 'Former Worker',
        profilePhoto: '',
        phone: 'Anonymized',
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await db.collection('users').doc(uid).update({
        hasWorkerProfile: false,
        activeMode: 'customer',
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
/**
 * Full account deletion � Play Store compliance requirement.
 * Anonymizes customer + worker data.
 * Retains financial/legal records (marked for legal review).
 * Deletes Firebase Auth account.
 */
exports.deleteFullAccount = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const db = (0, firestore_1.getFirestore)();
    // 1. Check for active jobs � cannot delete during active job
    const activeJobsSnap = await db
        .collection('jobs')
        .where('customerId', '==', uid)
        .where('status', 'in', ['CREATED', 'FINDING_WORKERS', 'WORKER_ASSIGNED', 'WORKER_ARRIVING', 'OTP_VERIFIED', 'IN_PROGRESS'])
        .limit(1)
        .get();
    if (!activeJobsSnap.empty) {
        throw new https_1.HttpsError('failed-precondition', 'Cannot delete account while you have an active job. Please wait for the job to complete.');
    }
    // 2. Anonymize customer profile
    await db.collection('users').doc(uid).update({
        status: 'DELETED',
        phone: 'Anonymized',
        name: 'Deleted User',
        email: firestore_1.FieldValue.delete(),
        profilePhoto: firestore_1.FieldValue.delete(),
        fcmTokens: firestore_1.FieldValue.delete(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        // NOTE: userNumber, consent, createdAt retained for audit
    });
    // 3. Anonymize worker profile if exists
    const workerDoc = await db.collection('workers').doc(uid).get();
    if (workerDoc.exists) {
        await db.collection('workers').doc(uid).update({
            status: 'DELETED',
            verificationStatus: 'DELETED',
            isOnline: false,
            liveLocation: null,
            geohash: null,
            name: 'Deleted Worker',
            phone: 'Anonymized',
            email: firestore_1.FieldValue.delete(),
            profilePhoto: firestore_1.FieldValue.delete(),
            fcmTokens: firestore_1.FieldValue.delete(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            // NOTE: workerNumber, consent, joinedAt, stats retained for audit
            // NOTE: Financial records (payouts) retained per legal requirements
            // TODO: Retention periods must be reviewed by legal counsel
        });
    }
    // 4. Delete Firebase Auth � prevents future logins
    await (0, auth_1.getAuth)().deleteUser(uid);
    return { success: true };
});
//# sourceMappingURL=account.js.map