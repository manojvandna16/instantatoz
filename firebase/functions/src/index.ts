/**
 * Instantatoz Firebase Cloud Functions
 * Mobile backend — all secure operations run here
 * Web app Server Actions are NOT used by mobile
 */
import { initializeApp } from 'firebase-admin/app';
initializeApp();

export { createUserProfile } from './users';
export { registerWorker, updateWorkerOnlineStatus, getPublicWorkerProfile } from './workers';
export { getNearbyWorkers } from './geo';
export { createJobRequest, respondToJobRequest, verifyJobOTP, completeJob, cancelJob } from './jobs';
export { submitRating } from './ratings';
export { deleteFullAccount, stopBeingWorker } from './account';
export { registerDeviceToken } from './notifications';
