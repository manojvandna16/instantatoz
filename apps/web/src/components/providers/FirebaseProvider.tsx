'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/lib/analytics';

/**
 * FirebaseProvider
 *
 * A lightweight client component that:
 * 1. Logs page views to Firebase Analytics on every route change
 * 2. Can be extended later for auth state context, FCM, etc.
 *
 * Place this inside the root layout, wrapping {children}.
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Log page view whenever the route changes
    if (pathname) {
      logPageView(document.title, pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
