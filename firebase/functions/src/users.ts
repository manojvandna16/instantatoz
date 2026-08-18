/**
 * users.ts — Cloud Functions for user profile management
 * Ported from apps/web/src/app/actions/user.ts
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const CURRENT_TERMS_VERSION = '2026-08-01';
const CURRENT_PRIVACY_VERSION = '2026-08-01';

interface ConsentVersions {
  termsVersion: string;
  privacyVersion: string;
}

/**
 * Creates or retrieves a user profile.
 * Generates USR-XXXXXX ID securely via Firestore transaction.
 * Stores legal consent server-side.
 * 
 * Called from mobile: (auth)/consent.tsx for new users
 */
export const createUserProfile = onCall(
  { region: 'asia-south1' },
  async (request) => {
    // 1. Must be authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const phone = request.auth.token.phone_number || '';
    const { consentVersions, name } = request.data as {
      consentVersions?: ConsentVersions;
      name?: string;
    };

    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const counterRef = db.collection('counters').doc('user');

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      // Returning user — just return existing profile
      if (userDoc.exists) {
        return { isNew: false, data: userDoc.data() };
      }

      // New user — consent is required
      if (!consentVersions) {
        throw new HttpsError(
          'invalid-argument',
          'Legal consent is required for new accounts.'
        );
      }

      // Validate consent versions
      if (
        consentVersions.termsVersion !== CURRENT_TERMS_VERSION ||
        consentVersions.privacyVersion !== CURRENT_PRIVACY_VERSION
      ) {
        throw new HttpsError(
          'invalid-argument',
          'Invalid consent version. Please accept the latest terms.'
        );
      }

      // Increment user counter for USR-XXXXXX
      const counterDoc = await transaction.get(counterRef);
      let count = 1;
      if (counterDoc.exists) {
        count = (counterDoc.data()?.currentCount || 0) + 1;
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
          acceptedAt: FieldValue.serverTimestamp(),
        },
        savedAddresses: [],
        currentLocation: null,
        fcmTokens: {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(userRef, newUserData);
      return { isNew: true, data: newUserData };
    });

    return result;
  }
);
