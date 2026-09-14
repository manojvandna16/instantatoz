/**
 * src/services/api.ts
 * Unified API Client to call Vercel (Next.js) backend instead of Firebase Cloud Functions
 */
import { auth } from './firebase';

// Force the app to point to the live Vercel backend so it doesn't fail on a physical device
const BASE_URL = 'https://instantatoz.online/api/mobile';

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


