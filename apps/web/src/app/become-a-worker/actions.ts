'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/db';

export type WorkerRegistrationInput = {
  fullName: string;
  phone: string;
  email?: string;
  profilePhotoUrl: string;
  category: string;         // e.g. "Electrician" — was missing, now added
  skills: string[];         // Multiple skills array
  hourlyRate: number;       // Worker's rate per hour — was missing, now added
  experience: string;
  location: {
    country: string;
    state: string;
    stateId: string;
    district: string;
    districtId: string;
    tehsil: string;
    tehsilId: string;
    village: string;
    villageId: string;
  };
};


export async function registerWorkerAction(idToken: string, data: WorkerRegistrationInput) {
  try {
    // 1. Verify token securely
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const workerRef = adminDb().collection(COLLECTIONS.WORKERS).doc(uid);
    const counterRef = adminDb().collection('counters').doc('worker');

    // 2. Transactionally get or create the worker document
    const result = await adminDb().runTransaction(async (transaction) => {
      const workerDoc = await transaction.get(workerRef);

      // Check for duplicate profile
      if (workerDoc.exists) {
        throw new Error('Worker profile already exists.');
      }

      // 3. Increment counter
      const counterDoc = await transaction.get(counterRef);
      let count = 1;
      if (counterDoc.exists) {
        count = (counterDoc.data()?.currentCount || 0) + 1;
      }
      
      transaction.set(counterRef, { currentCount: count }, { merge: true });

      // 4. Format workerNumber
      const workerNumber = `WRK-${count.toString().padStart(6, '0')}`;

      // 5. Create worker profile
      const newWorkerData = {
        id: uid,
        name: data.fullName,
        phone: data.phone,
        email: data.email || '',
        profilePhoto: data.profilePhotoUrl,
        category: data.category,           // ✅ Now stored
        skills: data.skills,
        hourlyRate: data.hourlyRate,        // ✅ Now stored
        experience: data.experience,
        registeredLocation: data.location,
        
        workerNumber,
        verificationStatus: 'PENDING',
        status: 'OFFLINE',
        isOnline: false,
        liveLocation: null,
        geohash: null,
        activeJobId: null,
        rating: 0,
        totalJobs: 0,
        consent: {
          workerTermsAccepted: true,
          workerTermsVersion: '2026-08-01',
          acceptedAt: FieldValue.serverTimestamp(),
        },
        stats: {
          completedJobs: 0,
          averageRating: 0,
          ratingCount: 0
        },
        joinedAt: FieldValue.serverTimestamp(),  // ✅ Now stored (admin queue uses this)
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(workerRef, newWorkerData);

      return newWorkerData;
    });

    return { success: true, result };
  } catch (error: any) {
    console.error('[WorkerRegistrationAction] Failed:', error);
    return { success: false, error: error.message };
  }
}
