// =============================================================
// Firebase Analytics — Instantatoz
// apps/web/src/lib/analytics.ts
//
// Analytics is client-only and must only be called in the browser.
// Usage:
//   import { logEvent } from '@/lib/analytics';
//   logEvent('job_posted', { category: 'computer-office-work' });
// =============================================================

import { getAnalytics, logEvent as firebaseLogEvent, type Analytics } from 'firebase/analytics';
import app from './firebase';

let analyticsInstance: Analytics | null = null;

/**
 * Returns the Analytics instance (browser-only).
 * Returns null on the server or if measurementId is not set.
 */
function getAnalyticsInstance(): Analytics | null {
  if (typeof window === 'undefined') return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;

  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(app);
    } catch {
      console.warn('[Analytics] Firebase Analytics could not be initialized.');
      return null;
    }
  }
  return analyticsInstance;
}

/**
 * Log a custom analytics event.
 * Safely no-ops on the server or if Analytics is unavailable.
 *
 * @param eventName - Firebase Analytics event name
 * @param params    - Optional event parameters
 */
export function logEvent(eventName: string, params?: Record<string, unknown>): void {
  const analytics = getAnalyticsInstance();
  if (!analytics) return;
  firebaseLogEvent(analytics, eventName, params);
}

/**
 * Log a page view event.
 * Call this from client components when the route changes.
 *
 * @param pageTitle - Human-readable page title
 * @param pagePath  - URL path (e.g. '/services/cleaning-maintenance')
 */
export function logPageView(pageTitle: string, pagePath: string): void {
  logEvent('page_view', { page_title: pageTitle, page_path: pagePath });
}

// Pre-defined event helpers for common platform actions
export const analyticsEvents = {
  /** Customer posted a job requirement */
  jobPosted: (category: string) => logEvent('job_posted', { category }),

  /** Worker accepted a job */
  jobAccepted: (category: string) => logEvent('job_accepted', { category }),

  /** OTP verification completed */
  otpVerified: () => logEvent('otp_verified'),

  /** User navigated to Find a Worker */
  findWorkerClicked: () => logEvent('find_worker_clicked'),

  /** User navigated to Become a Worker */
  becomeWorkerClicked: () => logEvent('become_worker_clicked'),

  /** App download link clicked (even if disabled) */
  appDownloadClicked: (appType: 'user' | 'worker') => logEvent('app_download_clicked', { app_type: appType }),

  /** Contact form submitted */
  contactFormSubmitted: (subject: string) => logEvent('contact_form_submitted', { subject }),
};
