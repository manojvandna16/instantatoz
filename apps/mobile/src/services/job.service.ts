/**
 * src/services/job.service.ts
 * Complete Job lifecycle management using Firestore directly
 */
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { auth } from './firebase';
import { COLLECTIONS, JOB_STATUS } from '../constants';
import { callApi } from './api';

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName?: string;
  cancelReason?: string;
  workerIdAssigned?: string; // Legacy
  workerName?: string;
  category: string;
  requiredWorkers?: number;
  assignedWorkerIds?: string[];
  description: string;
  address: string;
  location: { latitude: number; longitude: number };
  hourlyRate: number;
  estimatedHours?: number; // Added for prepaid amount calculation
  status: string; // From JOB_STATUS
  refundedAllocations?: number; // Number of allocations resolved via refund
  refundedAmount?: number; // Total amount refunded
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
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  startedAt?: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  cancelledAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface JobAssignment {
  id?: string;
  jobId: string;
  workerId: string;
  grossWorkerAmount: number;
  commissionAmount: number;
  netWorkerAmount: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'WORKER_NO_SHOW' | 'ABANDONED';
  resolutionType?: 'REPLACED' | 'REFUNDED' | 'DISPUTED';
  refundStatus?: 'NONE' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  startOtp?: string;
  endOtp?: string;
  startedAt?: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  resolvedAt?: FirebaseFirestoreTypes.Timestamp;
  abandonedAt?: FirebaseFirestoreTypes.Timestamp;
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
  requiredWorkers: number;
  paymentId: string;
}): Promise<string> {
  const result = await callApi('createJobDirect', params);
  return result.jobId;
}

/** Worker accepts a job */
export async function acceptJob(jobId: string, workerId: string, workerName: string): Promise<void> {
  await callApi('acceptJob', { jobId, workerId, workerName });
}

export async function cancelWorkerAssignment(jobId: string, workerId: string, reason: string): Promise<void> {
  await callApi('cancelWorkerAssignment', { jobId, workerId, reason });
}

export async function reportNoShow(jobId: string, workerId: string): Promise<void> {
  await callApi('reportNoShow', { jobId, workerId });
}

export async function resolveCancellation(jobId: string, workerId: string, action: 'replace' | 'refund'): Promise<void> {
  await callApi('resolveCancellation', { jobId, workerId, action });
}

export async function reportMidJobAbandonment(jobId: string, workerId: string): Promise<void> {
  await callApi('reportMidJobAbandonment', { jobId, workerId });
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
  try {
    await callApi('verifyStartOtp', { jobId, otp: enteredOtp.trim() });
    return true;
  } catch (error: any) {
    console.error('verifyJobOTP error:', error);
    return false;
  }
}

/** End a job — worker provides endOtp from customer */
export async function endJob(jobId: string, enteredEndOtp: string): Promise<{ totalMinutes: number; totalAmount: number }> {
  try {
    const result = await callApi('verifyEndOtp', { jobId, endOtp: enteredEndOtp.trim() });
    return { 
      totalMinutes: result.totalMinutes, 
      totalAmount: result.totalAmount 
    };
  } catch (error: any) {
    console.error('endJob error:', error);
    throw new Error(error.message || 'Failed to end job');
  }
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

export async function getUnresolvedAssignments(jobId: string): Promise<any[]> {
  const snap = await db.collection('job_assignments')
    .where('jobId', '==', jobId)
    .where('status', 'in', ['CANCELLED', 'WORKER_NO_SHOW'])
    .get();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter((a: any) => !a.resolutionType);
}
