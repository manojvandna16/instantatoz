'use server';

import { adminDb, adminAuth, verifyIdToken } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/db';

export async function stopBeingWorker(idToken: string) {
  try {
    const decoded = await verifyIdToken(idToken);
    const uid = decoded.uid;

    const workerRef = adminDb().collection(COLLECTIONS.WORKERS).doc(uid);
    
    // Stop being a worker means removing capability, not deleting customer profile
    await workerRef.update({
      status: 'DELETED',
      isOnline: false,
      name: 'Anonymized Worker',
      profilePhoto: '',
      phone: 'Anonymized',
      updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (err: any) {
    console.error('stopBeingWorker error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteFullAccount(idToken: string) {
  try {
    const decoded = await verifyIdToken(idToken);
    const uid = decoded.uid;

    // We must process Firestore BEFORE deleting the Auth user
    const userRef = adminDb().collection(COLLECTIONS.USERS).doc(uid);
    const workerRef = adminDb().collection(COLLECTIONS.WORKERS).doc(uid);

    // 1. Soft Delete / Anonymize Customer Profile
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        status: 'DELETED',
        phone: 'Anonymized',
        email: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    // 2. Soft Delete / Anonymize Worker Profile
    const workerDoc = await workerRef.get();
    if (workerDoc.exists) {
      await workerRef.update({
        status: 'DELETED',
        isOnline: false,
        name: 'Anonymized Worker',
        profilePhoto: '',
        phone: 'Anonymized',
        email: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    // 3. Delete Firebase Auth User (prevents future logins)
    await adminAuth().deleteUser(uid);

    return { success: true };
  } catch (err: any) {
    console.error('deleteFullAccount error:', err);
    return { success: false, error: err.message };
  }
}
