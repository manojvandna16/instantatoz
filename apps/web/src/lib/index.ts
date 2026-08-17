// =============================================================
// lib/index.ts — barrel export for all Firebase helpers
// =============================================================

// Client SDK
export { default as app, auth, db } from './firebase';

// Analytics
export { logEvent, logPageView, analyticsEvents } from './analytics';

// Firestore helpers
export {
  COLLECTIONS,
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  saveContactForm,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from './db';

// Auth helpers
export {
  sendOtp,
  verifyOtp,
  signOut,
  onAuthChange,
  getCurrentUser,
  getIdToken,
} from './auth';

// NOTE: firebase-admin exports are NOT included here.
// Import firebase-admin directly in server files only:
//   import { adminDb, adminAuth, verifyIdToken } from '@/lib/firebase-admin';
