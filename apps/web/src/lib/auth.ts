// =============================================================
// Firebase Auth Helpers — Instantatoz
// apps/web/src/lib/auth.ts
//
// Phone / OTP authentication helpers for the web.
// The User App and Worker App will use Flutter Firebase Auth.
// This file is for any auth needed on the website itself.
// =============================================================

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from './firebase';

// ---------------------------------------------------------------------------
// reCAPTCHA setup
// ---------------------------------------------------------------------------

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialise an invisible reCAPTCHA verifier.
 * Must be called from a browser environment.
 *
 * @param containerId - The ID of the DOM element for the reCAPTCHA widget
 */
export function initRecaptcha(containerId: string): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('initRecaptcha must be called in a browser environment.');
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — proceed with phone sign-in
    },
  });
  return recaptchaVerifier;
}

// ---------------------------------------------------------------------------
// Phone / OTP sign-in
// ---------------------------------------------------------------------------

/**
 * Send an OTP to the given phone number (E.164 format).
 *
 * @param phoneNumber - Phone in E.164 format, e.g. "+919876543210"
 * @param containerId - DOM element ID for reCAPTCHA widget
 * @returns ConfirmationResult — use to verify OTP
 */
export async function sendOtp(
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const verifier = recaptchaVerifier ?? initRecaptcha(containerId);
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return confirmation;
}

/**
 * Verify the OTP entered by the user.
 *
 * @param confirmationResult - Returned by sendOtp()
 * @param otp - The 6-digit OTP entered by the user
 * @returns Firebase User on success
 */
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<User> {
  const result = await confirmationResult.confirm(otp);
  return result.user;
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

/** Sign out the currently authenticated user */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ---------------------------------------------------------------------------
// Auth state observer
// ---------------------------------------------------------------------------

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it to stop listening.
 *
 * @param callback - Called with the User object or null
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the currently signed-in user, or null */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/** Get the current user's ID token (for API calls) */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
