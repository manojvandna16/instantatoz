'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/db';

export async function getOrCreateUserProfile(
  idToken: string, 
  consentVersions?: { termsVersion: string; privacyVersion: string }
) {
  try {
    // 1. Verify token securely
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const phone = decodedToken.phone_number || '';

    // 2. Transactionally get or create the user document
    const userRef = adminDb().collection(COLLECTIONS.USERS).doc(uid);
    const counterRef = adminDb().collection('counters').doc('user');

    const result = await adminDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists) {
        // User already exists, return current data
        // We only check consent if the user already exists. If terms radically changed, 
        // we'd prompt them again, but for now we just return.
        return { isNew: false, data: userDoc.data() };
      }

      // If user does not exist, they MUST provide consent during the flow.
      if (!consentVersions) {
        throw new Error('Mandatory legal consent missing for new user.');
      }

      // 3. User does not exist, get counter and increment
      const counterDoc = await transaction.get(counterRef);
      let count = 1;
      if (counterDoc.exists) {
        count = (counterDoc.data()?.value || 0) + 1;
      }
      
      transaction.set(counterRef, { value: count }, { merge: true });

      // 4. Format userNumber
      const userNumber = `USR-${count.toString().padStart(6, '0')}`;

      // 5. Create user profile with consent
      const newUserData = {
        id: uid,
        phone: phone,
        userNumber,
        status: 'ACTIVE',
        consent: {
          termsAccepted: true,
          privacyPolicyAccepted: true,
          termsVersion: consentVersions.termsVersion,
          privacyVersion: consentVersions.privacyVersion,
          acceptedAt: FieldValue.serverTimestamp(),
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(userRef, newUserData);

      return { isNew: true, data: newUserData };
    });

    return { success: true, result };
  } catch (error: any) {
    console.error('[UserAction] Failed to get or create user profile:', error);
    return { success: false, error: error.message };
  }
}
