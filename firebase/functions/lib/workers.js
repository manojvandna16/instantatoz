"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicWorkerProfile = exports.updateWorkerOnlineStatus = exports.registerWorker = void 0;
/**
 * workers.ts — Cloud Functions for worker profile management
 * Ported and extended from apps/web/src/app/become-a-worker/actions.ts
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const WORKER_TERMS_VERSION = '2026-08-01';
/**
 * Registers the current user as a worker.
 * Uses the SAME Firebase UID — no new account created.
 * Generates WRK-XXXXXX via secure transaction.
 *
 * Called from mobile: (shared)/become-worker.tsx
 */
exports.registerWorker = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const data = request.data;
    // Validate required fields
    if (!data.category) {
        throw new https_1.HttpsError('invalid-argument', 'Service category is required.');
    }
    if (!data.skills || data.skills.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'At least one skill is required.');
    }
    if (!data.hourlyRate || data.hourlyRate < 1) {
        throw new https_1.HttpsError('invalid-argument', 'A valid hourly rate is required.');
    }
    if (!data.workerTermsAccepted) {
        throw new https_1.HttpsError('invalid-argument', 'Worker Terms acceptance is required.');
    }
    const db = (0, firestore_1.getFirestore)();
    const workerRef = db.collection('workers').doc(uid);
    const userRef = db.collection('users').doc(uid);
    const counterRef = db.collection('counters').doc('worker');
    const result = await db.runTransaction(async (transaction) => {
        var _a, _b;
        const workerDoc = await transaction.get(workerRef);
        // Prevent duplicate registration
        if (workerDoc.exists && ((_a = workerDoc.data()) === null || _a === void 0 ? void 0 : _a.verificationStatus) !== 'DELETED') {
            throw new https_1.HttpsError('already-exists', 'Worker profile already exists for this account.');
        }
        // Increment WRK counter
        const counterDoc = await transaction.get(counterRef);
        let count = 1;
        if (counterDoc.exists) {
            count = (((_b = counterDoc.data()) === null || _b === void 0 ? void 0 : _b.currentCount) || 0) + 1;
        }
        transaction.set(counterRef, { currentCount: count }, { merge: true });
        const workerNumber = `WRK-${count.toString().padStart(6, '0')}`;
        const newWorkerData = {
            id: uid,
            name: data.fullName,
            phone: data.phone,
            email: data.email || '',
            profilePhoto: data.profilePhotoUrl || '',
            category: data.category,
            skills: data.skills, // Array of skills
            hourlyRate: data.hourlyRate,
            experience: data.experience,
            registeredLocation: data.location, // PERMANENT ADDRESS — never used for matching
            workerNumber,
            verificationStatus: 'PENDING',
            status: 'OFFLINE',
            isOnline: false,
            liveLocation: null, // Set only when GO ONLINE
            geohash: null, // Set only when GO ONLINE
            activeJobId: null,
            rating: 0,
            totalJobs: 0,
            stats: {
                completedJobs: 0,
                averageRating: 0,
                ratingCount: 0,
            },
            consent: {
                workerTermsAccepted: true,
                workerTermsVersion: WORKER_TERMS_VERSION,
                acceptedAt: firestore_1.FieldValue.serverTimestamp(),
            },
            fcmTokens: {},
            adminNotes: '',
            joinedAt: firestore_1.FieldValue.serverTimestamp(),
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        transaction.set(workerRef, newWorkerData);
        // Update user profile to mark hasWorkerProfile = true
        transaction.update(userRef, {
            hasWorkerProfile: true,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { workerNumber, verificationStatus: 'PENDING' };
    });
    return { success: true, result };
});
/**
 * GO ONLINE / GO OFFLINE for verified workers.
 * Live location is set ONLY when going ONLINE.
 * Permanent address is NEVER used for matching.
 *
 * Called from mobile: (worker)/dashboard.tsx
 */
exports.updateWorkerOnlineStatus = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const uid = request.auth.uid;
    const { isOnline, lat, lng } = request.data;
    const db = (0, firestore_1.getFirestore)();
    const workerRef = db.collection('workers').doc(uid);
    const workerDoc = await workerRef.get();
    if (!workerDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Worker profile not found.');
    }
    const workerData = workerDoc.data();
    // Only ACTIVE/VERIFIED workers can go online
    if (workerData.verificationStatus !== 'ACTIVE') {
        throw new https_1.HttpsError('permission-denied', 'Only verified workers can go online. Your account is: ' +
            workerData.verificationStatus);
    }
    if (isOnline) {
        // Going ONLINE — requires live location
        if (!lat || !lng) {
            throw new https_1.HttpsError('invalid-argument', 'Live location (lat, lng) is required to go online.');
        }
        const geohash = (0, geofire_common_1.geohashForLocation)([lat, lng]);
        await workerRef.update({
            isOnline: true,
            status: 'ONLINE',
            liveLocation: {
                lat,
                lng,
                geohash,
                lastUpdated: firestore_1.FieldValue.serverTimestamp(),
            },
            geohash, // Top-level for Firestore geohash range queries
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    else {
        // Going OFFLINE — clear live location
        await workerRef.update({
            isOnline: false,
            status: 'OFFLINE',
            liveLocation: null,
            geohash: null,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    return { success: true, isOnline };
});
/**
 * Get public worker profile — safe fields only.
 * Customers call this to view a worker's profile.
 * Phone, address, documents, GPS are NEVER returned.
 *
 * Called from mobile: (customer)/worker/[id].tsx
 */
exports.getPublicWorkerProfile = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    var _a, _b, _c;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const { workerId } = request.data;
    if (!workerId) {
        throw new https_1.HttpsError('invalid-argument', 'workerId is required.');
    }
    const db = (0, firestore_1.getFirestore)();
    const workerDoc = await db.collection('workers').doc(workerId).get();
    if (!workerDoc.exists) {
        return null;
    }
    const data = workerDoc.data();
    // Only show ACTIVE workers
    if (data.verificationStatus !== 'ACTIVE') {
        return null;
    }
    // Return ONLY safe public fields — never expose private data
    return {
        id: workerDoc.id,
        workerNumber: data.workerNumber,
        name: data.name, // Only first name shown on client
        profilePhoto: data.profilePhoto || null,
        category: data.category,
        skills: data.skills || [],
        experience: data.experience || '',
        hourlyRate: data.hourlyRate || 0,
        isOnline: data.isOnline || false,
        stats: {
            completedJobs: ((_a = data.stats) === null || _a === void 0 ? void 0 : _a.completedJobs) || 0,
            averageRating: ((_b = data.stats) === null || _b === void 0 ? void 0 : _b.averageRating) || 0,
            ratingCount: ((_c = data.stats) === null || _c === void 0 ? void 0 : _c.ratingCount) || 0,
        },
        // NOTE: phone, email, registeredLocation, liveLocation, documents are NOT returned
    };
});
//# sourceMappingURL=workers.js.map