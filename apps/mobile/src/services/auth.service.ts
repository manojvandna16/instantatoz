/**
 * src/services/auth.service.ts
 * Firebase Phone OTP Authentication
 */
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Send OTP to Indian phone number.
 * @param phone - 10-digit number (will be prefixed with +91)
 */
export async function sendOTP(phone: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
  const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
  return auth().signInWithPhoneNumber(formatted);
}

/**
 * Verify OTP and complete authentication.
 */
export async function verifyOTP(
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  otp: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return confirmation.confirm(otp);
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  return auth().signOut();
}

/** Get current authenticated user (or null). */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * Get Firebase ID token for current user.
 * Used to call secure Cloud Functions via REST or SDK.
 */
export async function getIdToken(): Promise<string> {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.getIdToken();
}

/** Subscribe to auth state changes. Returns unsubscribe function. */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onAuthStateChanged(callback);
}
