/**
 * jobs.ts — Job lifecycle Cloud Functions
 * PHASE 5 IMPLEMENTATION
 * Stub created — functions will be implemented in Phase 5
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const createJobRequest = onCall(
  { region: 'asia-south1' },
  async (_request) => {
    throw new HttpsError('unimplemented', 'Job requests will be implemented in Phase 5.');
  }
);

export const respondToJobRequest = onCall(
  { region: 'asia-south1' },
  async (_request) => {
    throw new HttpsError('unimplemented', 'Job response will be implemented in Phase 5.');
  }
);

export const verifyJobOTP = onCall(
  { region: 'asia-south1' },
  async (_request) => {
    throw new HttpsError('unimplemented', 'OTP verification will be implemented in Phase 6.');
  }
);

export const completeJob = onCall(
  { region: 'asia-south1' },
  async (_request) => {
    throw new HttpsError('unimplemented', 'Job completion will be implemented in Phase 6.');
  }
);

export const cancelJob = onCall(
  { region: 'asia-south1' },
  async (_request) => {
    throw new HttpsError('unimplemented', 'Job cancellation will be implemented in Phase 5.');
  }
);


