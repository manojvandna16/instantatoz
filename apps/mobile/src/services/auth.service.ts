import auth from '@react-native-firebase/auth';

export async function sendOTP(phoneNumber: string): Promise<any> {
  // Returns confirmation object with confirmationResult.confirm method
  return await auth().signInWithPhoneNumber(phoneNumber);
}

export async function verifyOTP(confirmationResult: any, otp: string) {
  const userCredential = await confirmationResult.confirm(otp);
  return userCredential.user;
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}

export async function getIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export function onAuthStateChanged(callback: (user: any) => void) {
  return auth().onAuthStateChanged(callback);
}
