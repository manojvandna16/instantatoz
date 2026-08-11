// proxy.ts — Route protection for /dashboard (Next.js 16)
// Next.js 16 uses proxy.ts with exported function named "proxy" or "default"
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and API routes through
  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get('admin-session');
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
