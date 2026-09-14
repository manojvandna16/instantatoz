// src/constants/index.ts
// Central constants for the Instantatoz mobile app

export const APP_VERSION = '1.0.0';
export const TERMS_VERSION = '2026-08-01';
export const PRIVACY_VERSION = '2026-08-01';
export const WORKER_TERMS_VERSION = '2026-08-01';

// Default matching radius (km) — configurable, not hardcoded
export const DEFAULT_RADIUS_KM = 5;
export const MATCHING_RADII_KM = [2, 5, 10] as const;

// Firestore collection names — must match web + admin + Cloud Functions
export const COLLECTIONS = {
  USERS: 'users',
  WORKERS: 'workers',
  JOBS: 'jobs',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  COUNTERS: 'counters',
  CATEGORIES: 'categories',
  PAYMENTS: 'payments',
  PAYOUTS: 'payouts',
} as const;

// Legal document URLs — all hosted on the website
export const LEGAL_URLS = {
  terms: 'https://instantatoz.vercel.app/terms-and-conditions',
  privacy: 'https://instantatoz.vercel.app/privacy-policy',
  userTerms: 'https://instantatoz.vercel.app/user-terms',
  workerTerms: 'https://instantatoz.vercel.app/worker-terms',
  workerVerification: 'https://instantatoz.vercel.app/worker-verification-policy',
  cancellation: 'https://instantatoz.vercel.app/cancellation-policy',
  refund: 'https://instantatoz.vercel.app/refund-policy',
  payment: 'https://instantatoz.vercel.app/payment-policy',
  communityGuidelines: 'https://instantatoz.vercel.app/community-guidelines',
  grievance: 'https://instantatoz.vercel.app/grievance-redressal',
  deleteAccount: 'https://instantatoz.vercel.app/delete-account',
  support: 'https://instantatoz.vercel.app/support',
} as const;

// Worker verification statuses (mirror of WorkerStatus enum)
export const WORKER_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

// Job status (mirror of JobStatus enum)
export const JOB_STATUS = {
  CREATED: 'CREATED',
  FINDING_WORKERS: 'FINDING_WORKERS',
  FULLY_ASSIGNED: 'FULLY_ASSIGNED',
  NEEDS_RESOLUTION: 'NEEDS_RESOLUTION',
  WORKER_ASSIGNED: 'WORKER_ASSIGNED',
  WORKER_ARRIVING: 'WORKER_ARRIVING',
  WORKER_ARRIVED: 'WORKER_ARRIVED',
  OTP_VERIFIED: 'OTP_VERIFIED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;

// Service categories (must match web site.ts)
export const SERVICE_CATEGORIES = [
  { id: 'skilled-services', name: 'Skilled Services', icon: '\u26a1', color: '#f59e0b' },
  { id: 'cleaning-maintenance', name: 'Cleaning', icon: '\ud83e\uddf9', color: '#06b6d4' },
  { id: 'delivery-transport', name: 'Delivery', icon: '\ud83d\udef5', color: '#8b5cf6' },
  { id: 'domestic-work', name: 'Domestic Work', icon: '\ud83c\udfe0', color: '#10b981' },
  { id: 'labour-construction', name: 'Labour', icon: '\ud83d\udd28', color: '#f97316' },
  { id: 'computer-office', name: 'Computer & Office', icon: '\ud83d\udcbb', color: '#3b82f6' },
  { id: 'healthcare', name: 'Healthcare', icon: '\ud83c\udfe5', color: '#ef4444' },
  { id: 'education', name: 'Education', icon: '\ud83d\udcda', color: '#eab308' },
  { id: 'agriculture-gardening', name: 'Agriculture', icon: '\ud83c\udf31', color: '#84cc16' },
  { id: 'hotel-event', name: 'Hotel & Events', icon: '\ud83c\udfe8', color: '#a855f7' },
  { id: 'retail-store', name: 'Retail', icon: '\ud83d\uded2', color: '#f43f5e' },
  { id: 'other-work', name: 'Other Work', icon: '\ud83e\udd1d', color: '#64748b' },
] as const;

// Brand colors
export const COLORS = {
  primary: '#1d4ed8',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
  white: '#ffffff',
  card: '#ffffff',
} as const;
