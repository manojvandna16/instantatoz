/**
 * src/services/job.service.ts
 * Complete Job lifecycle management using Firestore directly
 */
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { auth } from './firebase';
import { COLLECTIONS, JOB_STATUS } from '../constants';

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  workerIdAssigned?: string;
  workerName?: string;
  category: string;
  description: string;
  address: string;
  location: { latitude: number; longitude: number };
  hourlyRate: number;
  estimatedHours?: number; // Added for prepaid amount calculation
  status: string; // From JOB_STATUS
  otp?: string; // Start OTP
  endOtp?: string; // End OTP for job completion
  paymentStatus?: 'PENDING' | 'PAID' | 'PAID_TO_PLATFORM';
  paymentId?: string; // Payment Gateway ID
  totalMinutes?: number;
  totalAmount?: number;
  customerRating?: number;
  customerReview?: string;
  workerRating?: number;
  workerReview?: string;
  cancelReason?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  startedAt?: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  cancelledAt?: FirebaseFirestoreTypes.Timestamp;
}

const db = firestore();

function generateJobNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'JOB-';
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function generateOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Create a new job */
export async function createJob(params: {
  customerId: string;
  customerName: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  estimatedHours: number;
  paymentId: string;
}): Promise<string> {
  const otp = generateOTP();
  const endOtp = generateOTP();
  const ref = db.collection(COLLECTIONS.JOBS).doc();
  const now = firestore.Timestamp.now();
  const totalAmount = params.hourlyRate * params.estimatedHours;

  await ref.set({
    jobNumber: generateJobNumber(),
    status: JOB_STATUS.FINDING_WORKERS,
    customerId: params.customerId,
    customerName: params.customerName,
    workerIdAssigned: null,
    workerName: null,
    category: params.category,
    description: params.description,
    address: params.address,
    location: new firestore.GeoPoint(params.latitude, params.longitude),
    hourlyRate: params.hourlyRate,
    estimatedHours: params.estimatedHours,
    paymentId: params.paymentId,
    otp,
    endOtp,
    startedAt: null,
    completedAt: null,
    totalMinutes: null,
    totalAmount,
    paymentStatus: 'PAID_TO_PLATFORM',
    customerRating: null,
    workerRating: null,
    createdAt: now,
    updatedAt: now,
  });

  if (params.paymentId) {
    const paymentRef = db.collection(COLLECTIONS.PAYMENTS).doc(params.paymentId);
    const commissionRate = 0.10; // 10% platform commission
    const commission = Math.round(totalAmount * commissionRate);
    const workerPayable = totalAmount - commission;

    await paymentRef.set({
      jobId: ref.id,
      customerId: params.customerId,
      grossAmount: totalAmount,
      platformCommission: commission,
      workerPayable: workerPayable,
      gatewayName: 'RAZORPAY',
      gatewayTransactionId: params.paymentId,
      status: 'CAPTURED',
      createdAt: now,
      updatedAt: now,
    });
  }

  return ref.id;
}

/** Worker accepts a job */
export async function acceptJob(jobId: string, workerId: string, workerName: string): Promise<void> {
  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    status: JOB_STATUS.WORKER_ASSIGNED,
    workerIdAssigned: workerId,
    workerName,
    updatedAt: firestore.Timestamp.now(),
  });
}

/** Worker marks they have arrived */
export async function workerArrived(jobId: string): Promise<void> {
  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    status: JOB_STATUS.WORKER_ARRIVED,
    updatedAt: firestore.Timestamp.now(),
  });
}

/** Worker verifies OTP entered by customer — starts the job timer */
export async function verifyJobOTP(jobId: string, enteredOtp: string): Promise<boolean> {
  const snap = await db.collection(COLLECTIONS.JOBS).doc(jobId).get();
  const data = snap.data();
  if (!data || data.otp !== enteredOtp.trim()) return false;

  const now = firestore.Timestamp.now();
  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    status: JOB_STATUS.IN_PROGRESS,
    startedAt: now,
    updatedAt: now,
  });
  return true;
}

/** End a job — worker provides endOtp from customer */
export async function endJob(jobId: string, enteredEndOtp: string): Promise<{ totalMinutes: number; totalAmount: number }> {
  const snap = await db.collection(COLLECTIONS.JOBS).doc(jobId).get();
  const data = snap.data();
  if (!data) throw new Error('Job not found');

  if (data.endOtp && data.endOtp !== enteredEndOtp.trim()) {
    throw new Error('Invalid End OTP');
  }

  const startedAt = data.startedAt as FirebaseFirestoreTypes.Timestamp;
  const now = firestore.Timestamp.now();
  const elapsedMs = now.toMillis() - startedAt.toMillis();
  const totalMinutes = Math.ceil(elapsedMs / 60000);
  
  // Total amount was already calculated based on estimatedHours in createJob,
  // but if we need to adjust based on actual time, we could do it here.
  // For now, keeping the prepaid amount.
  const totalAmount = data.totalAmount || 0;

  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    status: JOB_STATUS.COMPLETED,
    completedAt: now,
    totalMinutes,
    updatedAt: now,
  });

  // Update worker stats
  if (data.workerIdAssigned) {
    const workerRef = db.collection(COLLECTIONS.WORKERS).doc(data.workerIdAssigned);
    await workerRef.update({
      'stats.completedJobs': firestore.FieldValue.increment(1),
      // Worker's commission is typically added, for now we add full amount to their stats
      'stats.totalEarnings': firestore.FieldValue.increment(totalAmount),
    });
  }

  return { totalMinutes, totalAmount };
}

/** Cancel a job */
export async function cancelJob(jobId: string, reason: string): Promise<void> {
  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    status: JOB_STATUS.CANCELLED,
    cancelReason: reason,
    updatedAt: firestore.Timestamp.now(),
  });
}

/** Rate a job (by customer or worker) */
export async function rateJob(params: {
  jobId: string;
  rating: number;
  review: string;
  ratedBy: 'customer' | 'worker';
}): Promise<void> {
  const updateData: Record<string, any> = {
    updatedAt: firestore.Timestamp.now(),
  };
  if (params.ratedBy === 'customer') {
    updateData.customerRating = params.rating;
    updateData.customerReview = params.review;
  } else {
    updateData.workerRating = params.rating;
    updateData.workerReview = params.review;
  }
  await db.collection(COLLECTIONS.JOBS).doc(params.jobId).update(updateData);

  // Update worker's average rating
  const snap = await db.collection(COLLECTIONS.JOBS).doc(params.jobId).get();
  const data = snap.data();
  if (params.ratedBy === 'customer' && data?.workerIdAssigned) {
    const workerRef = db.collection(COLLECTIONS.WORKERS).doc(data.workerIdAssigned);
    const workerSnap = await workerRef.get();
    const workerData = workerSnap.data();
    if (workerData) {
      const oldCount = workerData.stats?.ratingCount || 0;
      const oldAvg = workerData.stats?.averageRating || 0;
      const newCount = oldCount + 1;
      const newAvg = ((oldAvg * oldCount) + params.rating) / newCount;
      await workerRef.update({
        'stats.averageRating': Math.round(newAvg * 10) / 10,
        'stats.ratingCount': newCount,
      });
    }
  }
}

/** Mark job payment as done */
export async function markJobPaid(jobId: string): Promise<void> {
  await db.collection(COLLECTIONS.JOBS).doc(jobId).update({
    paymentStatus: 'PAID',
    updatedAt: firestore.Timestamp.now(),
  });
}

/** Real-time listener for customer's jobs */
export function listenCustomerJobs(
  customerId: string,
  onUpdate: (jobs: Job[]) => void
): () => void {
  return db
    .collection(COLLECTIONS.JOBS)
    .where('customerId', '==', customerId)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      const jobs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job));
      onUpdate(jobs);
    });
}

/** Real-time listener for pending jobs (worker discovery) */
export function listenPendingJobs(
  category: string,
  onUpdate: (jobs: Job[]) => void
): () => void {
  return db
    .collection(COLLECTIONS.JOBS)
    .where('status', '==', JOB_STATUS.FINDING_WORKERS)
    .where('category', '==', category)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      const jobs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job));
      onUpdate(jobs);
    });
}

/** Real-time listener for worker's active/completed jobs */
export function listenWorkerJobs(
  workerId: string,
  onUpdate: (jobs: Job[]) => void
): () => void {
  return db
    .collection(COLLECTIONS.JOBS)
    .where('workerIdAssigned', '==', workerId)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      const jobs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job));
      onUpdate(jobs);
    });
}

/** Get a single job by ID */
export function listenJob(
  jobId: string,
  onUpdate: (job: Job | null) => void
): () => void {
  return db
    .collection(COLLECTIONS.JOBS)
    .doc(jobId)
    .onSnapshot((snap) => {
      if (!snap.exists) { onUpdate(null); return; }
      onUpdate({ id: snap.id, ...snap.data() } as Job);
    });
}

/** Format minutes to HH:MM */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format elapsed seconds to HH:MM:SS */
export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
