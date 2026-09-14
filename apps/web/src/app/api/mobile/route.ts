import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { sendPushNotification } from '@/lib/notifications';
import { FieldValue } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
import { createClient } from '@supabase/supabase-js';

// Helper to verify Firebase Auth Token from Mobile App
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }
  const token = authHeader.split('Bearer ')[1];
  return await adminAuth().verifyIdToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyToken(req);
    const uid = decodedToken.uid;
    const body = await req.json();
    const { action, data } = body;

    // 1. Create User Profile (Consent)
    if (action === 'createUserProfile') {
      const userRef = adminDb().collection('users').doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        return NextResponse.json({ success: true, message: 'Profile already exists' });
      }

      let userNumber = '';
      await adminDb().runTransaction(async (transaction: any) => {
        const counterRef = adminDb().collection('counters').doc('users');
        const counterSnap = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterSnap.exists) {
          currentCount = counterSnap.data()?.value || 0;
        }
        const nextCount = currentCount + 1;
        userNumber = `USR-${nextCount.toString().padStart(6, '0')}`;
        transaction.set(counterRef, { value: nextCount }, { merge: true });
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

    // 1.5 Upload Profile Photo to Supabase
    if (action === 'uploadProfilePhoto') {
      const { base64Image } = data;
      if (!base64Image) throw new Error('Missing base64Image');

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing on server');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const buffer = Buffer.from(base64Image, 'base64');
      const filePath = `${uid}/profile.jpg`;

      const { data: uploadData, error } = await supabase.storage
        .from('worker-profile-images')
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Failed to upload image to Supabase: ' + error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('worker-profile-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update Firestore users collection
      await adminDb().collection('users').doc(uid).update({
        profilePhoto: publicUrl,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, url: publicUrl });
    }

    // 2. Register Worker
    if (action === 'registerWorker') {
      const userRef = adminDb().collection('users').doc(uid);
      const workerRef = adminDb().collection('workers').doc(uid);

      let workerNumber = '';
      await adminDb().runTransaction(async (transaction: any) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists) throw new Error('User profile not found');
        
        const workerSnap = await transaction.get(workerRef);
        if (workerSnap.exists) throw new Error('Worker profile already exists');

        const counterRef = adminDb().collection('counters').doc('workers');
        const counterSnap = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterSnap.exists) currentCount = counterSnap.data()?.value || 0;
        const nextCount = currentCount + 1;
        workerNumber = `WRK-${nextCount.toString().padStart(6, '0')}`;

        transaction.set(counterRef, { value: nextCount }, { merge: true });
        
        transaction.set(workerRef, {
          uid,
          workerNumber,
          name: userSnap.data()?.name || 'Worker',
          category: data.category,
          skills: data.skills || [],
          hourlyRate: Number(data.hourlyRate),
          experience: data.experience || '',
          profileUrl: data.profileUrl || null,
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
      const workerRef = adminDb().collection('workers').doc(uid);
      const workerSnap = await workerRef.get();
      
      if (!workerSnap.exists) throw new Error('Worker not found');
      if (workerSnap.data()?.verificationStatus !== 'APPROVED') {
        throw new Error('Worker is not APPROVED');
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

    // 4. Telemetry: Report App Error
    if (action === 'reportError') {
      const { errorMessage, stackTrace, os, appVersion, deviceModel, type = 'ERROR', metadata = {} } = data;
      await adminDb().collection('app_errors').add({
        userId: uid,
        errorMessage: errorMessage || 'Unknown Error',
        stackTrace: stackTrace || null,
        os: os || 'unknown',
        appVersion: appVersion || 'unknown',
        deviceModel: deviceModel || 'unknown',
        type,
        metadata,
        timestamp: FieldValue.serverTimestamp(),
        resolved: false
      });
      return NextResponse.json({ success: true });
    }

    // 5. Create Razorpay Order & Pending Job
    if (action === 'createRazorpayOrder') {
      const { jobData } = data;
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!keyId || !keySecret) {
        throw new Error('Payment configuration missing on server.');
      }

      const hourlyRate = jobData.hourlyRate || 150;
      const hours = parseInt(jobData.estimatedHours || 1, 10);
      const workersCount = parseInt(jobData.requiredWorkers || 1, 10);
      const totalAmount = hourlyRate * hours * workersCount;

      const authHeader = 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64');
      
      const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });
      
      const rpData = await orderResponse.json();
      
      if (!orderResponse.ok || !rpData.id) {
        throw new Error(rpData.error?.description || 'Failed to create payment order on backend.');
      }

      // Create a pending job securely on the server
      const db = adminDb();
      const jobRef = db.collection('jobs').doc();
      const now = FieldValue.serverTimestamp();

      const otp = String(Math.floor(1000 + Math.random() * 9000));
      const endOtp = String(Math.floor(1000 + Math.random() * 9000));
      
      // Generate job number logic (simplified, can use transaction for strict sequence but timestamp is fine here)
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const jobNumber = `JOB-${dateStr}-${randomStr}`;

      await jobRef.set({
        jobNumber,
        status: 'PAYMENT_PENDING',
        customerId: uid,
        customerName: jobData.customerName,
        workerIdAssigned: null,
        workerName: null,
        category: jobData.category,
        description: jobData.description,
        address: jobData.address,
        location: {
          latitude: jobData.latitude,
          longitude: jobData.longitude
        },
        hourlyRate,
        estimatedHours: hours,
        requiredWorkers: workersCount,
        assignedWorkerIds: [],
        razorpayOrderId: rpData.id,
        otp, 
        endOtp, 
        jobStartedAt: null,
        startedAt: null,
        completedAt: null,
        totalMinutes: null,
        totalAmount,
        paymentStatus: 'PENDING',
        customerRating: null,
        workerRating: null,
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json({
        success: true,
        order_id: rpData.id,
        amount: rpData.amount,
        currency: rpData.currency,
        jobId: jobRef.id,
        key: keyId
      });
    }

    // 6. Verify Payment & Activate Job
    if (action === 'verifyPayment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId } = data;
      
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) throw new Error('Payment configuration missing on server.');
      
      // Verify signature
      const crypto = require('crypto');
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');
        
      if (generated_signature !== razorpay_signature) {
        throw new Error('Payment verification failed (Invalid signature)');
      }

      const db = adminDb();
      const jobRef = db.collection('jobs').doc(jobId);
      
      await db.runTransaction(async (transaction) => {
        const jobSnap = await transaction.get(jobRef);
        if (!jobSnap.exists) throw new Error('Job not found');
        
        const jobData = jobSnap.data()!;
        if (jobData.razorpayOrderId !== razorpay_order_id) {
          throw new Error('Order ID mismatch');
        }
        
        if (jobData.status !== 'PAYMENT_PENDING') {
          // Already verified
          return;
        }

        const now = FieldValue.serverTimestamp();

        // Update Job
        transaction.update(jobRef, {
          status: 'FINDING_WORKERS',
          paymentStatus: 'PAID_TO_PLATFORM',
          paymentId: razorpay_payment_id,
          updatedAt: now
        });

        // Create Payment record
        const paymentRef = db.collection('payments').doc(razorpay_payment_id);
        const commissionRate = 0.10; // 10% platform commission
        const commission = Math.round(jobData.totalAmount * commissionRate);
        const workerPayable = jobData.totalAmount - commission;

        transaction.set(paymentRef, {
          jobId: jobId,
          customerId: uid,
          grossAmount: jobData.totalAmount,
          platformCommission: commission,
          workerPayable: workerPayable,
          gatewayName: 'RAZORPAY',
          gatewayTransactionId: razorpay_payment_id,
          status: 'CAPTURED',
          createdAt: now,
          updatedAt: now,
        });
      });

      return NextResponse.json({ success: true, verified: true });
    }

    // 6.5. Accept Job (Multi-Worker)
    if (action === 'acceptJob') {
      const { jobId, workerId, workerName } = data;
      const db = adminDb();
      
      await db.runTransaction(async (transaction) => {
        // 1. Verify Worker Eligibility
        const workerRef = db.collection('workers').doc(workerId);
        const userRef = db.collection('users').doc(workerId);
        const [workerSnap, userSnap] = await Promise.all([
          transaction.get(workerRef),
          transaction.get(userRef)
        ]);

        if (!workerSnap.exists || !userSnap.exists) {
          throw new Error('Worker profile not found.');
        }

        const workerData = workerSnap.data();
        const userData = userSnap.data();

        if (workerData?.verificationStatus !== 'APPROVED') {
          throw new Error('Worker is not approved to accept jobs.');
        }

        if (['DELETED', 'SUSPENDED', 'DEACTIVATED'].includes(userData?.status)) {
          throw new Error('Worker account is currently inactive.');
        }

        // 2. Check if worker already has an active assignment
        const activeAssignmentsQuery = db.collection('job_assignments')
          .where('workerId', '==', workerId)
          .where('status', 'in', ['ASSIGNED', 'IN_PROGRESS']);
        
        const activeSnap = await transaction.get(activeAssignmentsQuery);
        if (!activeSnap.empty) {
          throw new Error('You already have an active or in-progress job assignment.');
        }

        // 2. Get parent job
        const jobRef = db.collection('jobs').doc(jobId);
        const jobSnap = await transaction.get(jobRef);
        
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();
        
        const requiredWorkers = jobData?.requiredWorkers || 1;
        const assignedWorkerIds = jobData?.assignedWorkerIds || [];
        const refundedAllocations = jobData?.refundedAllocations || 0;
        
        if (assignedWorkerIds.includes(workerId)) {
          throw new Error('You have already accepted this job.');
        }
        
        if (assignedWorkerIds.length + refundedAllocations >= requiredWorkers) {
          throw new Error('This job already has the required number of workers.');
        }
        
        if (jobData?.status === 'CANCELLED' || jobData?.status === 'COMPLETED') {
          throw new Error('This job is no longer available.');
        }

        // 3. Calculate Financials
        const hourlyRate = jobData?.hourlyRate || 150;
        const expectedHours = jobData?.estimatedHours || 1;
        const grossWorkerAmount = hourlyRate * expectedHours;
        const commissionRate = 0.10; // 10%
        const commissionAmount = Math.round(grossWorkerAmount * commissionRate);
        const netWorkerAmount = grossWorkerAmount - commissionAmount;

        // 4. Generate OTPs server-side
        const startOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const endOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // 5. Create job_assignment record
        const assignmentRef = db.collection('job_assignments').doc();
        transaction.set(assignmentRef, {
          jobId,
          workerId,
          workerName,
          status: 'ASSIGNED',
          grossWorkerAmount,
          commissionAmount,
          netWorkerAmount,
          startOtp,
          endOtp,
          createdAt: FieldValue.serverTimestamp(),
        });

        // 6. Update parent job
        const newAssignedIds = [...assignedWorkerIds, workerId];
        const isFullyAssigned = newAssignedIds.length === requiredWorkers;
        
        const jobUpdate: any = {
          assignedWorkerIds: newAssignedIds,
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        if (isFullyAssigned) {
          jobUpdate.status = 'FULLY_ASSIGNED';
        } else if (jobData?.status === 'FINDING_WORKERS') {
          // If we are still finding workers, but someone joined, status stays FINDING_WORKERS 
          // or we can just leave it.
        }
        
        // Legacy fallback support for older UI components
        if (newAssignedIds.length === 1) {
          jobUpdate.workerIdAssigned = workerId;
          jobUpdate.workerName = workerName;
          if (!isFullyAssigned) {
             jobUpdate.status = 'WORKER_ASSIGNED';
          }
        }

        transaction.update(jobRef, jobUpdate);
      });

      // Notify customer
      const jobDoc = await adminDb().collection('jobs').doc(jobId).get();
      if (jobDoc.exists && jobDoc.data()?.customerId) {
        await sendPushNotification(
          jobDoc.data()?.customerId,
          'Worker Assigned',
          `${workerName} has accepted your job!`,
          { type: 'JOB_UPDATE', jobId }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 7. Verify Start OTP (Server Authoritative Time)
    if (action === 'verifyStartOtp') {
      const { jobId, otp } = data;
      const db = adminDb();
      
      let startedAtDate: string | null = null;
      
      await db.runTransaction(async (transaction) => {
        const jobRef = db.collection('jobs').doc(jobId);
        const jobSnap = await transaction.get(jobRef);
        
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();

        const requiredWorkers = jobData?.requiredWorkers || 1;
        const assignedWorkerIds = jobData?.assignedWorkerIds || [];

        const refundedAllocations = jobData?.refundedAllocations || 0;

        // Check if fully assigned (including refunded unfulfilled slots)
        if ((assignedWorkerIds.length + refundedAllocations) < requiredWorkers || (jobData?.status !== 'FULLY_ASSIGNED' && jobData?.status !== 'IN_PROGRESS')) {
          throw new Error('Cannot start job until all required workers have been assigned or unfulfilled slots resolved.');
        }

        // 1. Try multi-worker assignment first
        const assignmentQuery = db.collection('job_assignments')
          .where('jobId', '==', jobId)
          .where('startOtp', '==', otp.trim());
        
        const assignmentSnap = await transaction.get(assignmentQuery);
        
        if (!assignmentSnap.empty) {
          const assignmentDoc = assignmentSnap.docs[0];
          const assignmentData = assignmentDoc.data();
          
          if (assignmentData.status === 'IN_PROGRESS') throw new Error('This worker has already started.');
          if (assignmentData.status !== 'ASSIGNED') throw new Error('Worker is not in ASSIGNED state.');
          
          const now = FieldValue.serverTimestamp();
          
          // Update Assignment
          transaction.update(assignmentDoc.ref, {
            status: 'IN_PROGRESS',
            startedAt: now,
          });
          
          // Update Parent Job
          const jobUpdate: any = {
            status: 'IN_PROGRESS',
            updatedAt: now,
          };
          
          if (!jobData?.jobStartedAt) {
            jobUpdate.jobStartedAt = now; // Starts the 5-minute global window
          }
          
          transaction.update(jobRef, jobUpdate);
          startedAtDate = new Date().toISOString();
        } else {
          // 2. Legacy fallback
          if (jobData?.otp !== otp.trim()) throw new Error('Invalid Start OTP');
          if (jobData?.status === 'IN_PROGRESS') throw new Error('Job already started');

          const now = FieldValue.serverTimestamp();
          transaction.update(jobRef, {
            status: 'IN_PROGRESS',
            startedAt: now,
            jobStartedAt: now,
            startOtpVerifiedAt: now,
            updatedAt: now,
          });
          startedAtDate = new Date().toISOString();
        }
      });

      const jobDoc = await adminDb().collection('jobs').doc(jobId).get();
      if (jobDoc.exists && jobDoc.data()?.customerId) {
        await sendPushNotification(
          jobDoc.data()?.customerId,
          'Job Started',
          'A worker has officially started the job.',
          { type: 'JOB_UPDATE', jobId }
        );
      }

      return NextResponse.json({ success: true, startedAt: startedAtDate });
    }

    // 8. Verify End OTP (Server Authoritative Time)
    if (action === 'verifyEndOtp') {
      const { jobId, endOtp } = data;
      const db = adminDb();
      let responseData: any = {};
      
      await db.runTransaction(async (transaction) => {
        const jobRef = db.collection('jobs').doc(jobId);
        const jobSnap = await transaction.get(jobRef);
        
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();

        // 1. Try multi-worker assignment first
        const assignmentQuery = db.collection('job_assignments')
          .where('jobId', '==', jobId)
          .where('endOtp', '==', endOtp.trim());
        
        const assignmentSnap = await transaction.get(assignmentQuery);
        
        if (!assignmentSnap.empty) {
          const assignmentDoc = assignmentSnap.docs[0];
          const assignmentData = assignmentDoc.data();
          
          if (assignmentData.status !== 'IN_PROGRESS') throw new Error('Worker is not in progress.');
          
          const now = FieldValue.serverTimestamp();
          
          const startedAt = assignmentData.startedAt?.toDate ? assignmentData.startedAt.toDate() : new Date();
          const elapsedMs = new Date().getTime() - startedAt.getTime();
          const totalMinutes = Math.ceil(elapsedMs / 60000);
          
          // Update Assignment
          transaction.update(assignmentDoc.ref, {
            status: 'COMPLETED',
            completedAt: now,
            totalMinutes,
          });
          
          // Update worker stats
          const workerRef = db.collection('workers').doc(assignmentData.workerId);
          transaction.update(workerRef, {
            'stats.completedJobs': FieldValue.increment(1),
            'stats.totalEarnings': FieldValue.increment(assignmentData.netWorkerAmount || 0),
          });

          // Check if parent job should be completed
          const allAssignmentsQuery = db.collection('job_assignments').where('jobId', '==', jobId);
          const allAssignmentsSnap = await transaction.get(allAssignmentsQuery);
          
          // Find all non-cancelled assignments
          const activeAssignments = allAssignmentsSnap.docs.filter(doc => {
            const data = doc.data();
            return data.status !== 'CANCELLED' && data.status !== 'WORKER_NO_SHOW';
          });
          
          // If all active assignments (except the one we just completed) are COMPLETED
          const isAllCompleted = activeAssignments.every(doc => 
            doc.id === assignmentDoc.id || doc.data().status === 'COMPLETED'
          );
          
          if (isAllCompleted && activeAssignments.length > 0) {
            transaction.update(jobRef, {
              status: 'COMPLETED',
              completedAt: now,
              updatedAt: now,
            });
          }
          
          responseData = { success: true, totalMinutes, totalAmount: assignmentData.grossWorkerAmount };
        } else {
          // 2. Legacy fallback
          if (jobData?.endOtp !== endOtp.trim()) throw new Error('Invalid End OTP');
          if (jobData?.status !== 'IN_PROGRESS') throw new Error('Job is not in progress');

          const now = FieldValue.serverTimestamp();
          
          const startedAt = jobData.startedAt?.toDate ? jobData.startedAt.toDate() : new Date();
          const elapsedMs = new Date().getTime() - startedAt.getTime();
          const totalMinutes = Math.ceil(elapsedMs / 60000);

          const totalAmount = jobData.totalAmount || 0;

          transaction.update(jobRef, {
            status: 'COMPLETED',
            completedAt: now,
            endOtpVerifiedAt: now,
            totalMinutes,
            updatedAt: now,
          });

          if (jobData.workerIdAssigned) {
            const workerRef = db.collection('workers').doc(jobData.workerIdAssigned);
            transaction.update(workerRef, {
              'stats.completedJobs': FieldValue.increment(1),
              'stats.totalEarnings': FieldValue.increment(totalAmount),
            });
          }

          responseData = { success: true, totalMinutes, totalAmount };
        }
      });

      const jobDoc = await adminDb().collection('jobs').doc(jobId).get();
      if (jobDoc.exists && jobDoc.data()?.customerId) {
        await sendPushNotification(
          jobDoc.data()?.customerId,
          'Job Completed',
          'A worker has completed their assignment.',
          { type: 'JOB_UPDATE', jobId }
        );
      }

      return NextResponse.json(responseData);
    }

    // 9. Get Worker Wallet & History
    if (action === 'getWorkerWallet') {
      const db = adminDb();
      
      // 1. Fetch new multi-worker assignments
      const assignmentsSnap = await db.collection('job_assignments')
        .where('workerId', '==', uid)
        .where('status', '==', 'COMPLETED')
        .get();
        
      // 2. Fetch legacy single-worker jobs
      const legacyJobsSnap = await db.collection('jobs')
        .where('workerIdAssigned', '==', uid)
        .where('status', '==', 'COMPLETED')
        .get();
        
      // 3. Fetch payouts
      const payoutsSnap = await db.collection('payouts')
        .where('workerId', '==', uid)
        .get();

      let totalEarnings = 0;
      let totalWithdrawn = 0;
      let pendingWithdrawals = 0;
      const history: any[] = [];
      const handledJobIds = new Set<string>();

      // Process assignments
      assignmentsSnap.forEach(doc => {
        const data = doc.data();
        handledJobIds.add(data.jobId);
        totalEarnings += data.netWorkerAmount || 0;
        history.push({
          id: doc.id,
          type: 'EARNING',
          jobId: data.jobId,
          amount: data.netWorkerAmount || 0,
          date: data.completedAt?.toDate() || new Date(),
          status: 'COMPLETED',
          isLegacy: false
        });
      });

      // Process legacy jobs (exclude if already handled by assignment)
      legacyJobsSnap.forEach(doc => {
        if (handledJobIds.has(doc.id)) return; // prevent double counting
        const data = doc.data();
        const amount = data.totalAmount || 0;
        const commissionRate = 0.10;
        const netAmount = amount - (amount * commissionRate);
        
        totalEarnings += netAmount;
        history.push({
          id: doc.id,
          type: 'EARNING',
          jobId: doc.id,
          amount: netAmount,
          date: data.completedAt?.toDate() || new Date(),
          status: 'COMPLETED',
          isLegacy: true,
          jobNumber: data.jobNumber
        });
      });

      // Process payouts
      payoutsSnap.forEach(doc => {
        const data = doc.data();
        const amount = data.grossAmount || 0;
        if (data.payoutStatus === 'PAID') {
          totalWithdrawn += amount;
        } else if (data.payoutStatus === 'PENDING') {
          pendingWithdrawals += amount;
        }
        
        history.push({
          id: doc.id,
          type: 'WITHDRAWAL',
          amount: amount,
          date: data.createdAt?.toDate() || new Date(),
          status: data.payoutStatus,
        });
      });

      const currentBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;
      
      // Sort history descending by date
      history.sort((a, b) => b.date.getTime() - a.date.getTime());

      return NextResponse.json({
        success: true,
        totalEarnings,
        totalWithdrawn,
        pendingWithdrawals,
        currentBalance,
        history
      });
    }

    // 10. Request Withdrawal
    if (action === 'requestWithdrawal') {
      const db = adminDb();
      const { amount } = data; // Note: For safety, we can either trust the requested amount or just withdraw the entire balance.
      // Let's just calculate their available balance on the server to prevent spoofing
      
      let totalEarnings = 0;
      let totalWithdrawnAndPending = 0;
      
      await db.runTransaction(async (transaction) => {
        // Fetch new multi-worker assignments
        const assignmentsSnap = await transaction.get(db.collection('job_assignments')
          .where('workerId', '==', uid)
          .where('status', '==', 'COMPLETED'));
          
        const legacyJobsSnap = await transaction.get(db.collection('jobs')
          .where('workerIdAssigned', '==', uid)
          .where('status', '==', 'COMPLETED'));
          
        const payoutsSnap = await transaction.get(db.collection('payouts')
          .where('workerId', '==', uid));

        const handledJobIds = new Set<string>();
        
        assignmentsSnap.forEach(doc => {
          const d = doc.data();
          handledJobIds.add(d.jobId);
          totalEarnings += d.netWorkerAmount || 0;
        });
        
        legacyJobsSnap.forEach(doc => {
          if (handledJobIds.has(doc.id)) return;
          const d = doc.data();
          const amt = d.totalAmount || 0;
          totalEarnings += (amt - (amt * 0.10)); // 10% commission
        });
        
        payoutsSnap.forEach(doc => {
          const d = doc.data();
          if (d.payoutStatus === 'PAID' || d.payoutStatus === 'PENDING') {
            totalWithdrawnAndPending += (d.grossAmount || 0);
          }
        });

        const currentBalance = totalEarnings - totalWithdrawnAndPending;
        const requestedAmount = amount || currentBalance; // Use requested or max
        
        if (currentBalance <= 0 || requestedAmount <= 0) {
          throw new Error('Insufficient balance.');
        }
        
        if (requestedAmount > currentBalance) {
          throw new Error(`Cannot withdraw more than current balance (₹${currentBalance}).`);
        }
        
        // Minimum withdrawal threshold if desired, e.g. ₹100
        if (requestedAmount < 100) {
           throw new Error('Minimum withdrawal amount is ₹100');
        }

        // Create payout request
        const payoutRef = db.collection('payouts').doc();
        transaction.set(payoutRef, {
          workerId: uid,
          grossAmount: requestedAmount,
          netAmount: requestedAmount, // Assuming platform fee already deducted from earnings
          platformFee: 0,
          payoutStatus: 'PENDING',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      return NextResponse.json({ success: true, message: 'Withdrawal requested successfully.' });
    }

    // --- PHASE 10: Cancellations & Refunds ---

    if (action === 'cancelWorkerAssignment') {
      const { jobId, workerId, reason } = data;
      if (!jobId || !workerId) throw new Error('Missing parameters');
      if (workerId !== uid) throw new Error('Unauthorized');
      
      await adminDb().runTransaction(async (t: any) => {
        const jobRef = adminDb().collection('jobs').doc(jobId);
        const jobSnap = await t.get(jobRef);
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();

        if (jobData?.workerIdAssigned && !jobData?.assignedWorkerIds) {
           throw new Error('Legacy job cancellation is not supported here.');
        }

        const assignRef = adminDb().collection('job_assignments').doc(`${jobId}_${workerId}`);
        const assignSnap = await t.get(assignRef);
        if (!assignSnap.exists) throw new Error('Assignment not found');
        const assignData = assignSnap.data();

        if (assignData?.status !== 'ASSIGNED') {
           throw new Error('Can only cancel before starting');
        }

        t.update(assignRef, {
          status: 'CANCELLED',
          cancelledAt: FieldValue.serverTimestamp(),
          cancelReason: reason || 'Worker cancelled'
        });

        const newAssigned = (jobData?.assignedWorkerIds || []).filter((id: string) => id !== workerId);
        t.update(jobRef, {
          assignedWorkerIds: newAssigned,
          status: 'NEEDS_RESOLUTION',
          updatedAt: FieldValue.serverTimestamp()
        });
        
        const auditRef = adminDb().collection('audit_logs').doc();
        t.set(auditRef, {
           type: 'worker_cancelled',
           jobId,
           assignmentId: `${jobId}_${workerId}`,
           workerId,
           actor: uid,
           timestamp: FieldValue.serverTimestamp()
        });
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'reportNoShow') {
      const { jobId, workerId } = data;
      if (!jobId || !workerId) throw new Error('Missing parameters');
      
      await adminDb().runTransaction(async (t: any) => {
        const jobRef = adminDb().collection('jobs').doc(jobId);
        const jobSnap = await t.get(jobRef);
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();

        if (jobData?.customerId !== uid) throw new Error('Unauthorized');
        if (jobData?.workerIdAssigned && !jobData?.assignedWorkerIds) {
           throw new Error('Legacy job handling is separate.');
        }

        const assignRef = adminDb().collection('job_assignments').doc(`${jobId}_${workerId}`);
        const assignSnap = await t.get(assignRef);
        if (!assignSnap.exists) throw new Error('Assignment not found');
        const assignData = assignSnap.data();
        
        if (assignData?.status !== 'ASSIGNED') {
           throw new Error('Can only report NO_SHOW before starting');
        }

        t.update(assignRef, {
          status: 'WORKER_NO_SHOW',
          resolvedAt: FieldValue.serverTimestamp()
        });

        const newAssigned = (jobData?.assignedWorkerIds || []).filter((id: string) => id !== workerId);
        t.update(jobRef, {
          assignedWorkerIds: newAssigned,
          status: 'NEEDS_RESOLUTION',
          updatedAt: FieldValue.serverTimestamp()
        });
        
        const auditRef = adminDb().collection('audit_logs').doc();
        t.set(auditRef, {
           type: 'worker_no_show',
           jobId,
           assignmentId: `${jobId}_${workerId}`,
           workerId,
           actor: uid,
           timestamp: FieldValue.serverTimestamp()
        });
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'reportMidJobAbandonment') {
      const { jobId, workerId } = data;
      if (!jobId || !workerId) throw new Error('Missing parameters');
      
      await adminDb().runTransaction(async (t: any) => {
        const jobRef = adminDb().collection('jobs').doc(jobId);
        const jobSnap = await t.get(jobRef);
        if (!jobSnap.exists) throw new Error('Job not found');
        const jobData = jobSnap.data();

        if (jobData?.customerId !== uid) throw new Error('Unauthorized');
        
        const assignRef = adminDb().collection('job_assignments').doc(`${jobId}_${workerId}`);
        const assignSnap = await t.get(assignRef);
        if (!assignSnap.exists) throw new Error('Assignment not found');
        
        t.update(assignRef, {
          status: 'ABANDONED',
          resolutionType: 'DISPUTED',
          abandonedAt: FieldValue.serverTimestamp()
        });

        t.update(jobRef, {
          status: 'DISPUTED',
          updatedAt: FieldValue.serverTimestamp()
        });
        
        const auditRef = adminDb().collection('audit_logs').doc();
        t.set(auditRef, {
           type: 'mid_job_abandonment_reported',
           jobId,
           assignmentId: `${jobId}_${workerId}`,
           workerId,
           actor: uid,
           timestamp: FieldValue.serverTimestamp()
        });
      });
      return NextResponse.json({ success: true });
    }
    
    if (action === 'resolveCancellation') {
      const { jobId, workerId, action: resolveAction } = data; // resolveAction = 'replace' | 'refund'
      if (!jobId || !workerId || !resolveAction) throw new Error('Missing parameters');
      
      const jobRef = adminDb().collection('jobs').doc(jobId);
      const assignRef = adminDb().collection('job_assignments').doc(`${jobId}_${workerId}`);
      
      if (resolveAction === 'replace') {
        await adminDb().runTransaction(async (t: any) => {
           const jobSnap = await t.get(jobRef);
           if (!jobSnap.exists) throw new Error('Job not found');
           if (jobSnap.data()?.customerId !== uid) throw new Error('Unauthorized');
           
           t.update(assignRef, { resolutionType: 'REPLACED', resolvedAt: FieldValue.serverTimestamp() });
           t.update(jobRef, { status: 'FINDING_WORKERS', updatedAt: FieldValue.serverTimestamp() });
           
           const auditRef = adminDb().collection('audit_logs').doc();
           t.set(auditRef, {
             type: 'replacement_requested',
             jobId,
             assignmentId: `${jobId}_${workerId}`,
             timestamp: FieldValue.serverTimestamp()
           });
        });
        return NextResponse.json({ success: true });
      }
      
      if (resolveAction === 'refund') {
        let paymentDocRef: any = null;
        let amountToRefund = 0;
        let pId = '';
        let paymentData: any = null;

        // STEP 1: Transaction
        await adminDb().runTransaction(async (t: any) => {
           const jobSnap = await t.get(jobRef);
           if (!jobSnap.exists) throw new Error('Job not found');
           if (jobSnap.data()?.customerId !== uid) throw new Error('Unauthorized');
           
           const assignSnap = await t.get(assignRef);
           if (!assignSnap.exists) throw new Error('Assignment not found');
           const assignData = assignSnap.data();
           
           if (assignData?.refundStatus === 'PROCESSING' || assignData?.refundStatus === 'REFUNDED') {
             throw new Error('Refund already processing or completed.');
           }
           
           amountToRefund = assignData?.grossWorkerAmount || 0;
           
           const paymentsRef = adminDb().collection('payments').where('jobId', '==', jobId);
           const paymentsSnap = await t.get(paymentsRef);
           if (paymentsSnap.empty) throw new Error('Payment not found');
           
           paymentDocRef = paymentsSnap.docs[0].ref;
           paymentData = paymentsSnap.docs[0].data();
           pId = paymentData?.paymentId;
           
           const currentRefunded = paymentData?.amountRefunded || 0;
           const maxRefundable = paymentData?.amount || 0;
           
           if (currentRefunded + amountToRefund > maxRefundable) {
             throw new Error('Refund amount exceeds refundable balance');
           }
           
           t.update(assignRef, { refundStatus: 'PROCESSING' });
           
           const opsRef = adminDb().collection('refund_operations').doc(`${jobId}_${workerId}`);
           t.set(opsRef, {
             assignmentId: `${jobId}_${workerId}`,
             jobId,
             paymentId: pId,
             expectedAmount: amountToRefund,
             status: 'PROCESSING',
             createdAt: FieldValue.serverTimestamp()
           });
        });
        
        // STEP 2: Razorpay API
        let rzpRefundId = '';
        try {
          const Razorpay = (await import('razorpay')).default;
          const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || ''
          });
          
          const rzpResponse = await rzp.payments.refund(pId, {
            amount: Math.round(amountToRefund * 100)
          });
          
          rzpRefundId = rzpResponse.id;
        } catch (e: any) {
          console.error('Razorpay refund error', e);
          await assignRef.update({ refundStatus: 'FAILED' });
          await adminDb().collection('refund_operations').doc(`${jobId}_${workerId}`).update({ status: 'FAILED' });
          throw new Error('Payment gateway refund failed: ' + e.message);
        }
        
        // STEP 3: Success Transaction
        await adminDb().runTransaction(async (t: any) => {
           const jobSnap = await t.get(jobRef);
           const pSnap = await t.get(paymentDocRef);
           
           const currentRefunds = pSnap.data()?.refunds || [];
           const currentRefunded = pSnap.data()?.amountRefunded || 0;
           
           t.update(paymentDocRef, {
             amountRefunded: currentRefunded + amountToRefund,
             refunds: [...currentRefunds, {
               refundId: rzpRefundId,
               amount: amountToRefund,
               reason: 'Unfulfilled Worker Slot',
               status: 'SUCCESS',
               createdAt: FieldValue.serverTimestamp(),
               assignmentId: `${jobId}_${workerId}`
             }]
           });
           
           t.update(assignRef, {
             refundStatus: 'REFUNDED',
             resolutionType: 'REFUNDED',
             resolvedAt: FieldValue.serverTimestamp()
           });
           
           const rAlloc = (jobSnap.data()?.refundedAllocations || 0) + 1;
           const rAmt = (jobSnap.data()?.refundedAmount || 0) + amountToRefund;
           
           const reqWorkers = jobSnap.data()?.requiredWorkers || 1;
           const assigned = jobSnap.data()?.assignedWorkerIds || [];
           const newStatus = (assigned.length + rAlloc) === reqWorkers ? 'FULLY_ASSIGNED' : 'FINDING_WORKERS';
           
           t.update(jobRef, {
             refundedAllocations: rAlloc,
             refundedAmount: rAmt,
             status: newStatus,
             updatedAt: FieldValue.serverTimestamp()
           });
           
           t.update(adminDb().collection('refund_operations').doc(`${jobId}_${workerId}`), {
             status: 'SUCCESS',
             razorpayRefundId: rzpRefundId
           });
           
           const auditRef = adminDb().collection('audit_logs').doc();
           t.set(auditRef, {
             type: 'partial_refund_issued',
             jobId,
             assignmentId: `${jobId}_${workerId}`,
             paymentId: pId,
             amount: amountToRefund,
             timestamp: FieldValue.serverTimestamp()
           });
        });
        
        return NextResponse.json({ success: true, refundedAmount: amountToRefund });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Mobile API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
