// =============================================================
// Firestore Database Helpers — Instantatoz
// apps/web/src/lib/db.ts
//
// Typed helpers for reading/writing core Firestore collections.
// All collection names are centralised here to avoid typos.
// =============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------------------------------------------------------------------------
// Collection names — single source of truth
// ---------------------------------------------------------------------------
export const COLLECTIONS = {
  USERS: 'users',
  WORKERS: 'workers',
  JOBS: 'jobs',
  PAYMENTS: 'payments',
  PAYOUTS: 'payouts',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  SUPPORT_TICKETS: 'support_tickets',
  CONTACT_FORMS: 'contact_forms',
} as const;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/** Get a single document by ID */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

/** Get multiple documents from a collection with optional query constraints */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const ref = collection(db, collectionName);
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

/** Add a new document (auto-ID) */
export async function addDocument(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

/** Update an existing document */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** Delete a document */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
}

// ---------------------------------------------------------------------------
// Contact form submission (website-specific)
// ---------------------------------------------------------------------------

export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Save a contact form submission to Firestore.
 * Returns the document ID of the saved record.
 */
export async function saveContactForm(data: ContactFormData): Promise<string> {
  return addDocument(COLLECTIONS.CONTACT_FORMS, {
    ...data,
    source: 'website',
    status: 'new',
  });
}

// ---------------------------------------------------------------------------
// Re-export Firestore query helpers for convenience
// ---------------------------------------------------------------------------
export { where, orderBy, limit, serverTimestamp };
