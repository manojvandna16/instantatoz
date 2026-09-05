/**
 * workers.ts — Cloud Functions for worker profile management
 * Ported and extended from apps/web/src/app/become-a-worker/actions.ts
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const WORKER_TERMS_VERSION = '2026-08-01';

interface WorkerRegistrationData {
  fullName: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;
  category: string;
  skills: string[];           // Multiple skills — required array
  hourlyRate: number;
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
  workerTermsAccepted: boolean;
}

/**
 * Registers the current user as a worker.
 * Uses the SAME Firebase UID — no new account created.
 * Generates WRK-XXXXXX via secure transaction.
 * 
 * Called from mobile: (shared)/become-worker.tsx
 */
export const registerWorker = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const data = request.data as WorkerRegistrationData;

    // Validate required fields
    if (!data.category) {
      throw new HttpsError('invalid-argument', 'Service category is required.');
    }
    if (!data.skills || data.skills.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one skill is required.');
    }
    if (!data.hourlyRate || data.hourlyRate < 1) {
      throw new HttpsError('invalid-argument', 'A valid hourly rate is required.');
    }
    if (!data.workerTermsAccepted) {
      throw new HttpsError('invalid-argument', 'Worker Terms acceptance is required.');
    }

    const db = getFirestore();
    const workerRef = db.collection('workers').doc(uid);
    const userRef = db.collection('users').doc(uid);
    const counterRef = db.collection('counters').doc('worker');

    const result = await db.runTransaction(async (transaction) => {
      const workerDoc = await transaction.get(workerRef);

      // Prevent duplicate registration
      if (workerDoc.exists && workerDoc.data()?.verificationStatus !== 'DELETED') {
        throw new HttpsError(
          'already-exists',
          'Worker profile already exists for this account.'
        );
      }

      // Increment WRK counter
      const counterDoc = await transaction.get(counterRef);
      let count = 1;
      if (counterDoc.exists) {
        count = (counterDoc.data()?.value || 0) + 1;
      }
      transaction.set(counterRef, { value: count }, { merge: true });

      const workerNumber = `WRK-${count.toString().padStart(6, '0')}`;

      const newWorkerData = {
        id: uid,
        name: data.fullName,
        phone: data.phone,
        email: data.email || '',
        profilePhoto: data.profilePhotoUrl || '',
        category: data.category,
        skills: data.skills,            // Array of skills
        hourlyRate: data.hourlyRate,
        experience: data.experience,
        registeredLocation: data.location, // PERMANENT ADDRESS — never used for matching

        workerNumber,
        verificationStatus: 'PENDING',
        status: 'OFFLINE',
        isOnline: false,
        liveLocation: null,             // Set only when GO ONLINE
        geohash: null,                  // Set only when GO ONLINE
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
          acceptedAt: FieldValue.serverTimestamp(),
        },

        fcmTokens: {},
        adminNotes: '',
        joinedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(workerRef, newWorkerData);

      // Update user profile to mark hasWorkerProfile = true
      transaction.update(userRef, {
        hasWorkerProfile: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { workerNumber, verificationStatus: 'PENDING' };
    });

    return { success: true, result };
  }
);

/**
 * GO ONLINE / GO OFFLINE for verified workers.
 * Live location is set ONLY when going ONLINE.
 * Permanent address is NEVER used for matching.
 * 
 * Called from mobile: (worker)/dashboard.tsx
 */
export const updateWorkerOnlineStatus = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const { isOnline, lat, lng } = request.data as {
      isOnline: boolean;
      lat?: number;
      lng?: number;
    };

    const db = getFirestore();
    const workerRef = db.collection('workers').doc(uid);
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      throw new HttpsError('not-found', 'Worker profile not found.');
    }

    const workerData = workerDoc.data()!;

    // Only APPROVED workers can go online
    if (workerData.verificationStatus !== 'APPROVED') {
      throw new HttpsError(
        'permission-denied',
        'Only verified workers can go online. Your account is: ' +
          workerData.verificationStatus
      );
    }

    if (isOnline) {
      // Going ONLINE — requires live location
      if (!lat || !lng) {
        throw new HttpsError(
          'invalid-argument',
          'Live location (lat, lng) is required to go online.'
        );
      }

      const geohash = geohashForLocation([lat, lng]);

      await workerRef.update({
        isOnline: true,
        status: 'ONLINE',
        liveLocation: {
          lat,
          lng,
          geohash,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        geohash, // Top-level for Firestore geohash range queries
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Going OFFLINE — clear live location
      await workerRef.update({
        isOnline: false,
        status: 'OFFLINE',
        liveLocation: null,
        geohash: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { success: true, isOnline };
  }
);

/**
 * Get public worker profile — safe fields only.
 * Customers call this to view a worker's profile.
 * Phone, address, documents, GPS are NEVER returned.
 * 
 * Called from mobile: (customer)/worker/[id].tsx
 */
export const getPublicWorkerProfile = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const { workerId } = request.data as { workerId: string };

    if (!workerId) {
      throw new HttpsError('invalid-argument', 'workerId is required.');
    }

    const db = getFirestore();
    const workerDoc = await db.collection('workers').doc(workerId).get();

    if (!workerDoc.exists) {
      return null;
    }

    const data = workerDoc.data()!;

    // Only show APPROVED workers
    if (data.verificationStatus !== 'APPROVED') {
      return null;
    }

    // Return ONLY safe public fields — never expose private data
    return {
      id: workerDoc.id,
      workerNumber: data.workerNumber,
      name: data.name,           // Only first name shown on client
      profilePhoto: data.profilePhoto || null,
      category: data.category,
      skills: data.skills || [],
      experience: data.experience || '',
      hourlyRate: data.hourlyRate || 0,
      isOnline: data.isOnline || false,
      stats: {
        completedJobs: data.stats?.completedJobs || 0,
        averageRating: data.stats?.averageRating || 0,
        ratingCount: data.stats?.ratingCount || 0,
      },
      // NOTE: phone, email, registeredLocation, liveLocation, documents are NOT returned
    };
  }
);


