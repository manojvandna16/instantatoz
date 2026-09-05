// app/api/auth/session/route.ts — Session cookie management
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { adminAuth, getAdminApp } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth().verifyIdToken(token);
    const claims = decodedToken.claims;
    if (claims.admin !== true) {
      return NextResponse.json({ success: false, error: 'Not an admin' }, { status: 403 });
    }

    const sessionCookie = await adminAuth().createSessionCookie(token, { expiresIn: SESSION_EXPIRY_MS });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: '/',
    });
    return response;
  } catch (err: any) {
    console.error('[Session] Error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
