/**
 * ratings.ts — Two-way rating system
 * Idempotent: review_{jobId}_{raterUid} prevents duplicates
 * Server controls averageRating and completedJobs — clients cannot modify
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const submitRating = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const raterUid = request.auth.uid;
    const { jobId, rating, comment } = request.data as {
      jobId: string;
      rating: number;
      comment?: string;
    };

    // Validate
    if (!jobId) throw new HttpsError('invalid-argument', 'jobId is required.');
    if (!rating || rating < 1 || rating > 5) {
      throw new HttpsError('invalid-argument', 'Rating must be between 1 and 5.');
    }

    const db = getFirestore();
    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      throw new HttpsError('not-found', 'Job not found.');
    }

    const jobData = jobDoc.data()!;

    // Job must be COMPLETED to rate
    if (jobData.status !== 'COMPLETED') {
      throw new HttpsError(
        'failed-precondition',
        'Only completed jobs can be rated.'
      );
    }

    // Determine who is rating whom
    const isCustomer = jobData.customerId === raterUid;
    const isWorker = jobData.workerId === raterUid;

    if (!isCustomer && !isWorker) {
      throw new HttpsError(
        'permission-denied',
        'You are not a participant in this job.'
      );
    }

    // Idempotent review key — prevents duplicate ratings
    const reviewKey = `review_${jobId}_${raterUid}`;
    const reviewRef = db.collection('reviews').doc(reviewKey);
    const existingReview = await reviewRef.get();

    if (existingReview.exists) {
      throw new HttpsError('already-exists', 'You have already rated this job.');
    }

    const revieweeId = isCustomer ? jobData.workerId : jobData.customerId;
    const isWorkerReview = isCustomer; // true = customer rating the worker

    // Write review + update stats in a transaction
    await db.runTransaction(async (transaction) => {
      // Create review document
      transaction.set(reviewRef, {
        jobId,
        reviewerId: raterUid,
        revieweeId,
        rating,
        comment: comment || '',
        isWorkerReview,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Update job to mark rating submitted
      if (isCustomer) {
        transaction.update(jobRef, { customerRatedWorker: true });
      } else {
        transaction.update(jobRef, { workerRatedCustomer: true });
      }

      // Update worker stats (server-controlled — clients cannot do this)
      if (isWorkerReview) {
        const workerRef = db.collection('workers').doc(revieweeId);
        const workerDoc = await transaction.get(workerRef);
        if (workerDoc.exists) {
          const current = workerDoc.data()!;
          const currentCount = current.stats?.ratingCount || 0;
          const currentAvg = current.stats?.averageRating || 0;
          const newCount = currentCount + 1;
          const newAvg = (currentAvg * currentCount + rating) / newCount;

          transaction.update(workerRef, {
            'stats.ratingCount': newCount,
            'stats.averageRating': Math.round(newAvg * 10) / 10,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    });

    return { success: true };
  }
);
