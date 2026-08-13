// app/api/auth/session/route.ts — Session cookie management
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { adminAuth, getAdminApp } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  const diagnosticSummary = {
    stageReached: 'START',
    adminInitialized: false,
    tokenReceived: false,
    tokenVerified: false,
    projectMatch: false,
    firebaseUserFound: false,
    sessionCookieCreated: false,
    finalStatus: 401,
    diagnosticCode: 'UNKNOWN'
  };

  try {
    // STEP 2: SAFE FIREBASE CONFIG DIAGNOSTIC
    diagnosticSummary.stageReached = 'ENV_CHECK';
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const normalizedKey = privateKey.replace(/\\n/g, '\n');

    console.log('[AUTH_DIAGNOSTIC]');
    console.log(`FIREBASE_PROJECT_ID: ${projectId ? 'EXISTS' : 'MISSING'} length=${projectId.length}`);
    console.log(`FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'EXISTS' : 'MISSING'} length=${clientEmail.length}`);
    console.log(`FIREBASE_PRIVATE_KEY: ${privateKey ? 'EXISTS' : 'MISSING'} length=${privateKey.length}`);
    console.log(`PRIVATE_KEY_BEGIN_MARKER: ${privateKey.includes('-----BEGIN PRIVATE KEY-----') ? 'YES' : 'NO'}`);
    console.log(`PRIVATE_KEY_END_MARKER: ${privateKey.includes('-----END PRIVATE KEY-----') ? 'YES' : 'NO'}`);
    console.log(`PRIVATE_KEY_ESCAPED_NEWLINES: ${privateKey.includes('\\n') ? 'YES' : 'NO'}`);
    console.log(`PRIVATE_KEY_REAL_NEWLINES_AFTER_NORMALIZATION: ${normalizedKey.includes('\n') ? 'YES' : 'NO'}`);
    console.log(`PROJECT_ID_HAS_QUOTES: ${projectId.includes('"') || projectId.includes("'") ? 'YES' : 'NO'}`);

    // STEP 3: VERIFY FIREBASE ADMIN INITIALIZATION
    diagnosticSummary.stageReached = 'ADMIN_INIT';
    console.log('[AUTH_DIAGNOSTIC] ADMIN_INIT_START');
    try {
      getAdminApp();
      console.log('[AUTH_DIAGNOSTIC] ADMIN_INIT_SUCCESS');
      diagnosticSummary.adminInitialized = true;
    } catch (initErr: any) {
      console.error('[AUTH_DIAGNOSTIC] ADMIN_INIT_FAILED');
      console.error(`errorName=${initErr?.name}`);
      console.error(`errorCode=${initErr?.code}`);
      console.error(`errorMessage=${initErr?.message}`);
      diagnosticSummary.diagnosticCode = 'FIREBASE_ADMIN_INIT_FAILED';
      throw initErr;
    }

    // STEP 7: CHECK SERVICE ACCOUNT
    console.log('[AUTH_DIAGNOSTIC] SERVICE_ACCOUNT_CHECK');
    console.log(`serviceAccountEmail=${clientEmail}`);
    console.log(`projectId=${projectId}`);
    console.log(`credentialLoaded=YES`);

    // STEP 4: DIAGNOSE THE ID TOKEN
    diagnosticSummary.stageReached = 'REQUEST_PARSE';
    console.log('[AUTH_DIAGNOSTIC] REQUEST_RECEIVED');
    let body;
    try {
      body = await request.json();
    } catch {
      console.warn('bodyExists=NO');
      diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_MISSING';
      throw new Error('Invalid JSON');
    }
    console.log('bodyExists=YES');

    const { token } = body;
    if (!token) {
      console.warn('tokenExists=NO');
      diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_MISSING';
      throw new Error('No token');
    }
    console.log('tokenExists=YES');
    console.log(`tokenLength=${token.length}`);
    diagnosticSummary.tokenReceived = true;

    diagnosticSummary.stageReached = 'VERIFY_ID_TOKEN';
    console.log('[AUTH_DIAGNOSTIC] VERIFY_ID_TOKEN_START');
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifyIdToken(token);
      console.log('[AUTH_DIAGNOSTIC] VERIFY_ID_TOKEN_SUCCESS');
      console.log(`uid=${decodedToken.uid}`);
      console.log(`email=${decodedToken.email}`);
      console.log(`audience=${decodedToken.aud}`);
      console.log(`issuer=${decodedToken.iss}`);
      diagnosticSummary.tokenVerified = true;
    } catch (verifyErr: any) {
      console.error('[AUTH_DIAGNOSTIC] VERIFY_ID_TOKEN_FAILED');
      console.error(`errorName=${verifyErr?.name}`);
      console.error(`errorCode=${verifyErr?.code}`);
      console.error(`errorMessage=${verifyErr?.message}`);
      
      const code = verifyErr?.code || '';
      if (code === 'auth/id-token-expired') diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_EXPIRED';
      else if (code === 'auth/id-token-revoked') diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_REVOKED';
      else if (code === 'auth/argument-error') diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_INVALID';
      else if (code === 'auth/invalid-credential') diagnosticSummary.diagnosticCode = 'FIREBASE_CREDENTIAL_INVALID';
      else diagnosticSummary.diagnosticCode = 'AUTH_TOKEN_INVALID';
      throw verifyErr;
    }

    // STEP 6: CHECK PROJECT ID CONSISTENCY
    diagnosticSummary.stageReached = 'PROJECT_CHECK';
    console.log('[AUTH_DIAGNOSTIC] PROJECT_CHECK');
    const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
    console.log(`ADMIN_PROJECT_ID=${projectId}`);
    console.log(`CLIENT_PROJECT_ID=${clientProjectId}`);
    console.log(`TOKEN_AUDIENCE=${decodedToken.aud}`);
    console.log(`TOKEN_ISSUER=${decodedToken.iss}`);
    
    const projectMatch = projectId === clientProjectId && projectId === decodedToken.aud;
    if (projectMatch) {
      console.log('PROJECT_MATCH: YES');
      diagnosticSummary.projectMatch = true;
    } else {
      console.log('PROJECT_MATCH: NO');
      diagnosticSummary.diagnosticCode = 'FIREBASE_PROJECT_MISMATCH';
      if (projectId !== clientProjectId) console.log(`MISMATCH: ADMIN_PROJECT_ID (${projectId}) != CLIENT_PROJECT_ID (${clientProjectId})`);
      if (projectId !== decodedToken.aud) console.log(`MISMATCH: ADMIN_PROJECT_ID (${projectId}) != TOKEN_AUDIENCE (${decodedToken.aud})`);
    }

    // STEP 8: CHECK FIREBASE AUTH USER
    diagnosticSummary.stageReached = 'FIREBASE_USER_CHECK';
    try {
      await adminAuth().getUser(decodedToken.uid);
      console.log('[AUTH_DIAGNOSTIC] FIREBASE_USER_CHECK_SUCCESS');
      diagnosticSummary.firebaseUserFound = true;
    } catch (userErr: any) {
      console.error('[AUTH_DIAGNOSTIC] FIREBASE_USER_CHECK_FAILED');
      console.error(`errorCode=${userErr?.code}`);
      console.error(`errorMessage=${userErr?.message}`);
      diagnosticSummary.diagnosticCode = 'FIREBASE_USER_LOOKUP_FAILED';
      throw userErr;
    }

    // STEP 5: DIAGNOSE createSessionCookie SEPARATELY
    diagnosticSummary.stageReached = 'CREATE_SESSION_COOKIE';
    console.log('[AUTH_DIAGNOSTIC] CREATE_SESSION_COOKIE_START');
    let sessionCookie;
    try {
      sessionCookie = await adminAuth().createSessionCookie(token, { expiresIn: SESSION_EXPIRY_MS });
      console.log('[AUTH_DIAGNOSTIC] CREATE_SESSION_COOKIE_SUCCESS');
      diagnosticSummary.sessionCookieCreated = true;
    } catch (cookieErr: any) {
      console.error('[AUTH_DIAGNOSTIC] CREATE_SESSION_COOKIE_FAILED');
      console.error(`errorName=${cookieErr?.name}`);
      console.error(`errorCode=${cookieErr?.code}`);
      console.error(`errorMessage=${cookieErr?.message}`);
      console.error(`errorStatus=${(cookieErr as any)?.status}`);
      diagnosticSummary.diagnosticCode = 'SESSION_COOKIE_CREATE_FAILED';
      throw cookieErr;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: '/',
    });
    
    diagnosticSummary.finalStatus = 200;
    diagnosticSummary.diagnosticCode = 'SUCCESS';
    console.log('[AUTH_DIAGNOSTIC_SUMMARY]');
    console.log(JSON.stringify(diagnosticSummary, null, 2));
    return response;

  } catch (err) {
    if (diagnosticSummary.diagnosticCode === 'UNKNOWN') {
      diagnosticSummary.diagnosticCode = 'UNHANDLED_ERROR';
    }
    console.log('[AUTH_DIAGNOSTIC_SUMMARY]');
    console.log(JSON.stringify(diagnosticSummary, null, 2));
    return NextResponse.json(
      { success: false, error: 'Authentication failed', diagnosticCode: diagnosticSummary.diagnosticCode },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
