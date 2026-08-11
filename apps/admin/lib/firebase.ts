// lib/firebase.ts — Client-side Firebase SDK (lazy initialization)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApp_(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Lazy getters — only initialize when first called (safe in SSR/build)
export const getFirebaseAuth = (): Auth => getAuth(getApp_());
export const getFirebaseDb = (): Firestore => getFirestore(getApp_());
export const getFirebaseStorage = (): FirebaseStorage => getStorage(getApp_());

// Keep named exports for compatibility but as lazy functions
export const auth = { get current() { return getFirebaseAuth(); } };
export const db = { get current() { return getFirebaseDb(); } };

export default { get app() { return getApp_(); } };

