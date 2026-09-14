/**
 * src/services/api.ts
 * Unified API Client to call Vercel (Next.js) backend instead of Firebase Cloud Functions
 */
import { auth } from './firebase';

// Update this to your deployed Vercel domain in production
// For physical Android testing, always use the live Vercel backend.
const BASE_URL = 'https://instantatoz.vercel.app/api/mobile';

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


