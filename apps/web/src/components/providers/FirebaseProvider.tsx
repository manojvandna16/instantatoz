'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/lib/analytics';
import { onAuthChange } from '@/lib/auth';
import { getOrCreateUserProfile } from '@/app/actions/user';

/**
 * FirebaseProvider
 *
 * A lightweight client component that:
 * 1. Logs page views to Firebase Analytics on every route change
 * 2. Can be extended later for auth state context, FCM, etc.
 * 3. Initializes the user profile (USR-XXXXXX) safely on login.
 *
 * Place this inside the root layout, wrapping {children}.
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initAttempted = useRef(false);

  useEffect(() => {
    // Log page view whenever the route changes
    if (pathname) {
      logPageView(document.title, pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user && !initAttempted.current) {
        initAttempted.current = true;
        try {
          const token = await user.getIdToken();
          
          let consent = undefined;
          const consentJson = sessionStorage.getItem('pendingConsent');
          if (consentJson) {
            consent = JSON.parse(consentJson);
            // Optionally remove it, or keep it until successful
          }

          // Safely verify or create the USR-XXXXXX profile
          const res = await getOrCreateUserProfile(token, consent);
          if (res.success && consentJson) {
            sessionStorage.removeItem('pendingConsent');
          }
        } catch (error) {
          console.error('Failed to initialize user profile:', error);
          initAttempted.current = false;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
