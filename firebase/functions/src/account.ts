/**
 * account.ts — Cloud Functions for account management
 * Ported from apps/web/src/app/actions/account.ts
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Stop being a worker — removes worker capability, keeps customer account.
 * Worker profile is anonymized (not deleted).
 */
export const stopBeingWorker = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    await db.collection('workers').doc(uid).update({
      status: 'DELETED',
      isOnline: false,
      liveLocation: null,
      geohash: null,
      name: 'Former Worker',
      profilePhoto: '',
      phone: 'Anonymized',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(uid).update({
      hasWorkerProfile: false,
      activeMode: 'customer',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

/**
 * Full account deletion — Play Store compliance requirement.
 * Anonymizes customer + worker data.
 * Retains financial/legal records (marked for legal review).
 * Deletes Firebase Auth account.
 */
export const deleteFullAccount = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    // 1. Check for active jobs — cannot delete during active job
    const activeJobsSnap = await db
      .collection('jobs')
      .where('customerId', '==', uid)
      .where('status', 'in', ['CREATED', 'FINDING_WORKERS', 'WORKER_ASSIGNED', 'WORKER_ARRIVING', 'OTP_VERIFIED', 'IN_PROGRESS'])
      .limit(1)
      .get();

    if (!activeJobsSnap.empty) {
      throw new HttpsError(
        'failed-precondition',
        'Cannot delete account while you have an active job. Please wait for the job to complete.'
      );
    }

    // 2. Anonymize customer profile
    await db.collection('users').doc(uid).update({
      status: 'DELETED',
      phone: 'Anonymized',
      name: 'Deleted User',
      email: FieldValue.delete(),
      profilePhoto: FieldValue.delete(),
      fcmTokens: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
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
        email: FieldValue.delete(),
        profilePhoto: FieldValue.delete(),
        fcmTokens: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
        // NOTE: workerNumber, consent, joinedAt, stats retained for audit
        // NOTE: Financial records (payouts) retained per legal requirements
        // TODO: Retention periods must be reviewed by legal counsel
      });
    }

    // 4. Delete Firebase Auth — prevents future logins
    await getAuth().deleteUser(uid);

    return { success: true };
  }
);


