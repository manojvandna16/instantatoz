"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRating = void 0;
/**
 * ratings.ts � Two-way rating system
 * Idempotent: review_{jobId}_{raterUid} prevents duplicates
 * Server controls averageRating and completedJobs � clients cannot modify
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
exports.submitRating = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const raterUid = request.auth.uid;
    const { jobId, rating, comment } = request.data;
    // Validate
    if (!jobId)
        throw new https_1.HttpsError('invalid-argument', 'jobId is required.');
    if (!rating || rating < 1 || rating > 5) {
        throw new https_1.HttpsError('invalid-argument', 'Rating must be between 1 and 5.');
    }
    const db = (0, firestore_1.getFirestore)();
    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Job not found.');
    }
    const jobData = jobDoc.data();
    // Job must be COMPLETED to rate
    if (jobData.status !== 'COMPLETED') {
        throw new https_1.HttpsError('failed-precondition', 'Only completed jobs can be rated.');
    }
    // Determine who is rating whom
    const isCustomer = jobData.customerId === raterUid;
    const isWorker = jobData.workerId === raterUid;
    if (!isCustomer && !isWorker) {
        throw new https_1.HttpsError('permission-denied', 'You are not a participant in this job.');
    }
    // Idempotent review key � prevents duplicate ratings
    const reviewKey = `review_${jobId}_${raterUid}`;
    const reviewRef = db.collection('reviews').doc(reviewKey);
    const existingReview = await reviewRef.get();
    if (existingReview.exists) {
        throw new https_1.HttpsError('already-exists', 'You have already rated this job.');
    }
    const revieweeId = isCustomer ? jobData.workerId : jobData.customerId;
    const isWorkerReview = isCustomer; // true = customer rating the worker
    // Write review + update stats in a transaction
    await db.runTransaction(async (transaction) => {
        var _a, _b;
        // Create review document
        transaction.set(reviewRef, {
            jobId,
            reviewerId: raterUid,
            revieweeId,
            rating,
            comment: comment || '',
            isWorkerReview,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Update job to mark rating submitted
        if (isCustomer) {
            transaction.update(jobRef, { customerRatedWorker: true });
        }
        else {
            transaction.update(jobRef, { workerRatedCustomer: true });
        }
        // Update worker stats (server-controlled � clients cannot do this)
        if (isWorkerReview) {
            const workerRef = db.collection('workers').doc(revieweeId);
            const workerDoc = await transaction.get(workerRef);
            if (workerDoc.exists) {
                const current = workerDoc.data();
                const currentCount = ((_a = current.stats) === null || _a === void 0 ? void 0 : _a.ratingCount) || 0;
                const currentAvg = ((_b = current.stats) === null || _b === void 0 ? void 0 : _b.averageRating) || 0;
                const newCount = currentCount + 1;
                const newAvg = (currentAvg * currentCount + rating) / newCount;
                transaction.update(workerRef, {
                    'stats.ratingCount': newCount,
                    'stats.averageRating': Math.round(newAvg * 10) / 10,
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
            }
        }
    });
    return { success: true };
});
//# sourceMappingURL=ratings.js.map