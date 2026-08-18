import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

// Helper to verify Firebase Auth Token from Mobile App
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }
  const token = authHeader.split('Bearer ')[1];
  return await adminAuth.verifyIdToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyToken(req);
    const uid = decodedToken.uid;
    const body = await req.json();
    const { action, data } = body;

    // 1. Create User Profile (Consent)
    if (action === 'createUserProfile') {
      const userRef = adminDb.collection('users').doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        return NextResponse.json({ success: true, message: 'Profile already exists' });
      }

      let userNumber = '';
      await adminDb.runTransaction(async (transaction) => {
        const counterRef = adminDb.collection('counters').doc('users');
        const counterSnap = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterSnap.exists) {
          currentCount = counterSnap.data()?.count || 0;
        }
        const nextCount = currentCount + 1;
        userNumber = `USR-${nextCount.toString().padStart(6, '0')}`;
        transaction.set(counterRef, { count: nextCount }, { merge: true });
        transaction.set(userRef, {
          uid,
          userNumber,
          name: data.name || 'User',
          phone: decodedToken.phone_number || '',
          status: 'ACTIVE',
          hasWorkerProfile: false,
          activeMode: 'customer',
          consent: {
            termsVersion: data.consentVersions?.termsVersion,
            privacyVersion: data.consentVersions?.privacyVersion,
            acceptedAt: FieldValue.serverTimestamp(),
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          },
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      return NextResponse.json({ success: true, userNumber });
    }

    // 2. Register Worker
    if (action === 'registerWorker') {
      const userRef = adminDb.collection('users').doc(uid);
      const workerRef = adminDb.collection('workers').doc(uid);

      let workerNumber = '';
      await adminDb.runTransaction(async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists) throw new Error('User profile not found');
        
        const workerSnap = await transaction.get(workerRef);
        if (workerSnap.exists) throw new Error('Worker profile already exists');

        const counterRef = adminDb.collection('counters').doc('workers');
        const counterSnap = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterSnap.exists) currentCount = counterSnap.data()?.count || 0;
        const nextCount = currentCount + 1;
        workerNumber = `WRK-${nextCount.toString().padStart(6, '0')}`;

        transaction.set(counterRef, { count: nextCount }, { merge: true });
        
        transaction.set(workerRef, {
          uid,
          workerNumber,
          name: userSnap.data()?.name || 'Worker',
          category: data.category,
          skills: data.skills || [],
          hourlyRate: Number(data.hourlyRate),
          experience: data.experience || '',
          verificationStatus: 'PENDING',
          isOnline: false,
          liveLocation: null,
          geohash: null,
          stats: { completedJobs: 0, averageRating: 0, ratingCount: 0 },
          joinedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.update(userRef, { hasWorkerProfile: true });
      });
      return NextResponse.json({ success: true, workerNumber });
    }

    // 3. Update Online Status (Live Location)
    if (action === 'updateWorkerOnlineStatus') {
      const { isOnline, location } = data;
      const workerRef = adminDb.collection('workers').doc(uid);
      const workerSnap = await workerRef.get();
      
      if (!workerSnap.exists) throw new Error('Worker not found');
      if (workerSnap.data()?.verificationStatus !== 'ACTIVE') {
        throw new Error('Worker is not ACTIVE');
      }

      if (!isOnline) {
        await workerRef.update({
          isOnline: false,
          liveLocation: FieldValue.delete(),
          geohash: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        return NextResponse.json({ success: true, isOnline: false });
      }

      if (!location || !location.latitude || !location.longitude) {
        throw new Error('Location is required to go online');
      }

      const hash = geohashForLocation([location.latitude, location.longitude]);
      await workerRef.update({
        isOnline: true,
        liveLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          geohash: hash,
          updatedAt: FieldValue.serverTimestamp(),
        },
        geohash: hash,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, isOnline: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Mobile API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
