// lib/firebase-admin.ts — Server-side Firebase Admin SDK (lazy initialization)
// ⚠️ All exports are functions/getters — initialized at request time, NOT build time.
import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    // Remove surrounding quotes if present (common when pasting into Vercel/env files)
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    // Convert escaped newlines to real newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/^["']|["']$/g, '');
  const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/^["']|["']$/g, '');

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not fully set in environment variables.');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Lazy getters — safe to import anywhere, only runs on actual use
export const adminDb = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
export const adminStorage = () => getStorage(getAdminApp());
