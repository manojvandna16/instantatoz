import auth from '@react-native-firebase/auth';

const API_BASE_URL = 'https://www.instantatoz.online/api/auth/otp';

/**
 * Send OTP using our Custom Next.js API (Fast2SMS)
 */
export async function sendOTP(phoneNumber: string): Promise<any> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', phone: phoneNumber })
  });
  
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to send OTP');
  }
  
  // Return a dummy confirmation object that OTP screen can use
  return { isCustomAuth: true, phone: phoneNumber };
}

/**
 * Verify OTP using our Custom Next.js API
 */
export async function verifyOTP(confirmationResult: any, otp: string) {
  if (confirmationResult && confirmationResult.isCustomAuth) {
    // 1. Verify with backend
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', phone: confirmationResult.phone, otp })
    });
    
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Invalid OTP');
    }
    
    // 2. Login to Firebase using the Custom Token from backend
    const userCredential = await auth().signInWithCustomToken(data.customToken);
    return userCredential.user;
  } else {
    // Fallback for native Firebase (if ever needed)
    const userCredential = await confirmationResult.confirm(otp);
    return userCredential.user;
  }
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
