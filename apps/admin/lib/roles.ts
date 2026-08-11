// lib/roles.ts — Role-Based Access Control helpers
import type { AdminRole } from '@/types';

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  OPERATIONS_ADMIN: ['workers', 'jobs', 'matching', 'live-operations', 'locations', 'service-areas'],
  WORKER_MANAGER: ['workers', 'workers.verification', 'workers.documents', 'categories'],
  JOB_MANAGER: ['jobs', 'jobs.requests', 'jobs.live', 'disputes'],
  FINANCE_ADMIN: ['payments', 'refunds', 'commission', 'payouts', 'reports.financial'],
  SUPPORT_ADMIN: ['support', 'complaints', 'disputes', 'contacts'],
  CONTENT_ADMIN: ['categories', 'content', 'legal', 'faq'],
  ANALYTICS_VIEWER: ['analytics', 'reports'],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.some(p => permission.startsWith(p));
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  OPERATIONS_ADMIN: 'Operations Admin',
  WORKER_MANAGER: 'Worker Manager',
  JOB_MANAGER: 'Job Manager',
  FINANCE_ADMIN: 'Finance Admin',
  SUPPORT_ADMIN: 'Support Admin',
  CONTENT_ADMIN: 'Content Admin',
  ANALYTICS_VIEWER: 'Analytics Viewer',
};

export const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  OPERATIONS_ADMIN: 'bg-blue-100 text-blue-800',
  WORKER_MANAGER: 'bg-green-100 text-green-800',
  JOB_MANAGER: 'bg-yellow-100 text-yellow-800',
  FINANCE_ADMIN: 'bg-red-100 text-red-800',
  SUPPORT_ADMIN: 'bg-orange-100 text-orange-800',
  CONTENT_ADMIN: 'bg-pink-100 text-pink-800',
  ANALYTICS_VIEWER: 'bg-gray-100 text-gray-800',
};
