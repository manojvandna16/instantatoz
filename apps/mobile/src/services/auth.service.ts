import { auth } from "./firebase";
import { signInWithPhoneNumber, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";

export async function sendOTP(phoneNumber: string): Promise<any> {
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
  return confirmation;
}

export async function verifyOTP(confirmation: any, otp: string) {
  const result = await confirmation.confirm(otp);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthStateChanged(callback: (user: any) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}
