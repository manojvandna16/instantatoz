// proxy.ts — Route protection for /dashboard (Next.js 16)
// Next.js 16 uses proxy.ts with exported function named "proxy" or "default"
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './lib/firebase-admin';
import { hasPermission } from './lib/roles';

const SESSION_COOKIE_NAME = 'admin-session';

async function getRequiredPermission(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'dashboard') return null;
  if (segments.length < 2) return null;
  const resource = segments[1];
  if (resource === 'jobs') {
    if (segments[2] === 'live') return 'jobs.live';
    if (segments[2] === 'requests') return 'jobs.requests';
    return 'jobs';
  }
  if (resource === 'workers') {
    if (segments[2] === 'verification') return 'workers.verification';
    return 'workers';
  }
  if (resource === 'reports') return 'reports';
  if (resource === 'payouts') return 'payouts';
  if (resource === 'payments') return 'payments';
  if (resource === 'disputes') return 'disputes';
  if (resource === 'support') return 'support';
  if (resource === 'notifications') return 'notifications';
  if (resource === 'analytics') return 'analytics';
  if (resource === 'locations') return 'locations';
  if (resource === 'categories') return 'categories';
  if (resource === 'settings') return 'settings';
  return resource;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and API routes through
  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie.value, true);
    const claims = decoded.claims;
    if (claims.admin !== true) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const role = (claims.role as string) || 'SUPER_ADMIN';
    const requiredPermission = getRequiredPermission(pathname);
    if (requiredPermission && !hasPermission(role, requiredPermission)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    request.headers.set('x-admin-uid', decoded.uid);
    request.headers.set('x-admin-role', role);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
