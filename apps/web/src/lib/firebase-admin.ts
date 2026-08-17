// =============================================================
// Firebase Admin SDK — Server-Side Only
// apps/web/src/lib/firebase-admin.ts
//
// Used by API Routes and Server Actions (NOT client components).
// Reads private keys from server-side environment variables.
// =============================================================

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// ---------------------------------------------------------------------------
// Singleton admin app
// ---------------------------------------------------------------------------
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines in private key (required for some environments)
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ---------------------------------------------------------------------------
// Admin service exports
// ---------------------------------------------------------------------------

/** Admin Firestore — bypasses security rules (server-only) */
export const adminDb = () => getAdminFirestore(getAdminApp());

/** Admin Auth — verify ID tokens, manage users (server-only) */
export const adminAuth = () => getAdminAuth(getAdminApp());

// ---------------------------------------------------------------------------
// Token verification helper
// ---------------------------------------------------------------------------

/**
 * Verify a Firebase ID token from an incoming API request.
 * Returns the decoded token (with uid, phone_number, etc.) or throws.
 *
 * Usage in an API Route:
 *   const token = req.headers.authorization?.split('Bearer ')[1];
 *   const decoded = await verifyIdToken(token);
 */
export async function verifyIdToken(idToken: string) {
  return adminAuth().verifyIdToken(idToken);
}
