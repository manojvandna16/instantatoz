import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from './firebase-admin';
import { hasPermission, isAdminRole } from './roles';
import type { AdminRole } from '@/types';

export type AdminClaims = DecodedIdToken & { admin?: boolean; role?: AdminRole };

export async function verifyAdmin(permission?: string): Promise<AdminClaims | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session')?.value;
  if (!sessionCookie) return null;

  try {
    const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (claims.admin !== true || !isAdminRole(claims.role)) {
      return null;
    }
    if (permission && !hasPermission(claims.role, permission)) {
      return null;
    }
    return claims as AdminClaims;
  } catch {
    return null;
  }
}
