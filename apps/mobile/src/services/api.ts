/**
 * src/services/api.ts
 * Unified API Client to call Vercel (Next.js) backend instead of Firebase Cloud Functions
 */
import { auth } from './firebase';

// Update this to your deployed Vercel domain in production
// For Android Emulator targeting localhost, use 10.0.2.2
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api/mobile' 
  : 'https://instantatoz.vercel.app/api/mobile';

export async function callApi(action: string, data: any = {}) {
  const user = auth().currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, data }),
  });

  const result = await response.json();
  
  if (!response.ok || result.error) {
    throw new Error(result.error || 'API Request Failed');
  }

  return result;
}


