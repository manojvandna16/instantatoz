// =============================================================
// Firebase Client SDK — Instantatoz
// apps/web/src/lib/firebase.ts
//
// Architecture:
//   Firebase Auth   → OTP / Phone Authentication
//   Firestore       → Primary database
//
//   ⚠️ Storage NOTE: Worker profile images and all file storage
//   are handled via NestJS backend → Supabase Storage (private bucket).
//   Do NOT use Firebase Storage for file uploads from this app.
//
// Environment variables required (add to .env.local):
//   NEXT_PUBLIC_FIREBASE_API_KEY
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
//   NEXT_PUBLIC_FIREBASE_APP_ID
// =============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Firebase configuration — values are read from environment variables
// Never hard-code API keys directly in source code
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// Initialize app — singleton pattern (safe for Next.js hot reloads)
// ---------------------------------------------------------------------------
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------------------------
// Firebase services
// ---------------------------------------------------------------------------

/** Firebase Auth — OTP / Phone authentication */
export const auth: Auth = getAuth(app);

/** Cloud Firestore — Primary database */
export const db: Firestore = getFirestore(app);

/** The initialized Firebase app instance */
export default app;
