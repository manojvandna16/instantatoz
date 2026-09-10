// lib/finance-utils.ts — Shared financial helpers for Admin Panel

/** Detects mock/demo payments that must be excluded from real finance calculations */
export function isMockPayment(payment: { id?: string; gatewayTransactionId?: string }): boolean {
  const id = payment?.id || '';
  const txId = payment?.gatewayTransactionId || '';
  return (
    id.startsWith('mock_') ||
    id.startsWith('pay_simulated') ||
    txId.startsWith('mock_') ||
    txId.startsWith('pay_simulated') ||
    id.includes('_demo_') ||
    id.includes('_test_')
  );
}

/** Format currency in Indian Rupees */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Calculate commission breakdown from gross amount + rate */
export function calculateCommission(grossAmount: number, ratePercent: number): {
  platformCommission: number;
  workerPayable: number;
} {
  const platformCommission = Math.round((grossAmount * ratePercent) / 100);
  const workerPayable = grossAmount - platformCommission;
  return { platformCommission, workerPayable };
}

/** Get the status badge style */
export const PAYOUT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  APPROVED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  PAID: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
};

export const REFUND_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  PROCESSED: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
};

/** Get start of day (local midnight) as Date */
export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get date N days ago */
export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}
