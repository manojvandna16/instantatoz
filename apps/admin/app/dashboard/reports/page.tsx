import { redirect } from 'next/navigation';

// Redirect /dashboard/reports to /dashboard/analytics/reports
export default function ReportsRedirectPage() {
  redirect('/dashboard/analytics/reports');
}
