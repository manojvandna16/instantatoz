// lib/date-utils.ts — Robust date formatting for all Finance pages
// Handles: Firestore Timestamp, {seconds, nanoseconds}, ISO string, Unix number

export function formatDate(val: any, includeTime = true): string {
  if (!val) return 'Date unavailable';
  try {
    let date: Date;

    // Firestore Timestamp with toDate()
    if (typeof val?.toDate === 'function') {
      date = val.toDate();
    }
    // Plain object with seconds (Firestore Timestamp serialized)
    else if (typeof val?.seconds === 'number') {
      date = new Date(val.seconds * 1000);
    }
    // Unix timestamp (number in ms or seconds)
    else if (typeof val === 'number') {
      date = val > 1e10 ? new Date(val) : new Date(val * 1000);
    }
    // ISO string
    else if (typeof val === 'string') {
      date = new Date(val);
    }
    else {
      return 'Date unavailable';
    }

    if (isNaN(date.getTime())) return 'Date unavailable';

    const opts: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };

    return date.toLocaleDateString('en-IN', opts);
  } catch {
    return 'Date unavailable';
  }
}

export function formatDateShort(val: any): string {
  return formatDate(val, false);
}

/** Returns a Date object or null */
export function toDate(val: any): Date | null {
  if (!val) return null;
  try {
    if (typeof val?.toDate === 'function') return val.toDate();
    if (typeof val?.seconds === 'number') return new Date(val.seconds * 1000);
    if (typeof val === 'number') return val > 1e10 ? new Date(val) : new Date(val * 1000);
    if (typeof val === 'string') return new Date(val);
    return null;
  } catch {
    return null;
  }
}

/** Returns YYYY-MM-DD string for date inputs */
export function toInputDate(val: any): string {
  const d = toDate(val);
  if (!d) return '';
  return d.toISOString().split('T')[0];
}
