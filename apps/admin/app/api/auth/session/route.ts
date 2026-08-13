// app/api/auth/session/route.ts — Session cookie management
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { adminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  try {
    console.log('[DIAGNOSTIC] POST /api/auth/session: Started');
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[DIAGNOSTIC] JSON_PARSE_FAILED', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { token } = body;
    if (!token) {
      console.warn('[DIAGNOSTIC] TOKEN_MISSING');
      return NextResponse.json({ error: 'No token' }, { status: 400 });
    }

    console.log('[DIAGNOSTIC] TOKEN_RECEIVED (Length: ' + token.length + ')');

    let sessionCookie;
    try {
      console.log('[DIAGNOSTIC] Calling createSessionCookie...');
      sessionCookie = await adminAuth().createSessionCookie(token, {
        expiresIn: SESSION_EXPIRY_MS,
      });
      console.log('[DIAGNOSTIC] SESSION_COOKIE_CREATED');
    } catch (cookieError: any) {
      console.error('[DIAGNOSTIC] SESSION_COOKIE_FAILED', cookieError?.code, cookieError?.message);
      throw cookieError; // Re-throw to be caught by outer catch for the 401 response
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: '/',
    });
    console.log('[DIAGNOSTIC] COMPLETED SUCCESSFULLY');
    return response;
  } catch (error: any) {
    console.error('[DIAGNOSTIC] CAUGHT UNHANDLED ERROR IN POST', error?.code, error?.message, error?.stack);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
