import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session')?.value;
  if (!sessionCookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
    return claims.admin ? claims : null;
  } catch { return null; }
}

function isMock(data: any) {
  const id = data?.id || data?.paymentId || '';
  return id.startsWith('mock_') || id.startsWith('pay_simulated');
}

// GET: Aggregated finance stats for analytics + dashboard
export async function GET(request: Request) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from'); // ISO string
  const to = searchParams.get('to');     // ISO string

  try {
    const db = adminDb();

    // Fetch all collections in parallel
    const [paymentsSnap, jobsSnap, workersSnap, usersSnap, payoutsSnap] = await Promise.all([
      db.collection('payments').get(),
      db.collection('jobs').get(),
      db.collection('workers').get(),
      db.collection('users').get(),
      db.collection('payouts').get(),
    ]);

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    toDate?.setHours(23, 59, 59, 999);

    function inRange(ts: any): boolean {
      if (!fromDate && !toDate) return true;
      const d = ts?.toDate?.() ?? (ts?.seconds ? new Date(ts.seconds * 1000) : null);
      if (!d) return false;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    }

    // Payments — filter out mocks
    const allPayments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    const realPayments = allPayments.filter(p => !isMock(p));
    const rangePayments = realPayments.filter(p => inRange(p.createdAt));

    const capturedPayments = rangePayments.filter((p: any) => p.status === 'CAPTURED');
    const refundedPayments = rangePayments.filter((p: any) => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status));

    const totalRevenue = capturedPayments.reduce((s: number, p: any) => s + (p.grossAmount || 0), 0);
    const totalCommission = capturedPayments.reduce((s: number, p: any) => s + (p.platformCommission || 0), 0);
    const totalWorkerEarnings = capturedPayments.reduce((s: number, p: any) => s + (p.workerPayable || 0), 0);
    const totalRefundAmount = refundedPayments.reduce((s: number, p: any) => s + (p.refundAmount || p.grossAmount || 0), 0);
    const totalGatewayFees = capturedPayments.reduce((s: number, p: any) => s + (p.gatewayFee || 0), 0);

    // Jobs
    const allJobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    const rangeJobs = allJobs.filter(j => inRange(j.createdAt));
    const completedJobs = rangeJobs.filter((j: any) => j.status === 'COMPLETED').length;
    const cancelledJobs = rangeJobs.filter((j: any) => j.status === 'CANCELLED').length;
    const activeJobs = allJobs.filter((j: any) => !['COMPLETED', 'CANCELLED'].includes(j.status)).length;

    // Workers
    const allWorkers = workersSnap.docs.map(d => d.data()) as any[];
    const verifiedWorkers = allWorkers.filter(w => w.verificationStatus === 'APPROVED').length;

    // Payouts
    const allPayouts = payoutsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    const realPayouts = allPayouts.filter(p => !isMock(p));
    const pendingPayouts = realPayouts.filter((p: any) => p.payoutStatus === 'PENDING');
    const pendingPayoutAmount = pendingPayouts.reduce((s: number, p: any) => s + (p.workerPayable || 0), 0);

    // Time-series revenue (group by day for last 30d)
    const last30 = realPayments
      .filter(p => {
        const d = p.createdAt?.toDate?.() ?? (p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : null);
        if (!d) return false;
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
        return d >= cutoff && (p as any).status === 'CAPTURED';
      })
      .map((p: any) => {
        const d = p.createdAt?.toDate?.() ?? new Date(p.createdAt?.seconds * 1000);
        return { date: d.toISOString().split('T')[0], revenue: p.grossAmount || 0, commission: p.platformCommission || 0 };
      });

    // Group by date
    const revenueByDay = last30.reduce((acc: Record<string, { revenue: number; commission: number }>, item) => {
      if (!acc[item.date]) acc[item.date] = { revenue: 0, commission: 0 };
      acc[item.date].revenue += item.revenue;
      acc[item.date].commission += item.commission;
      return acc;
    }, {});

    const revenueTimeSeries = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    // Job status distribution
    const jobStatusCounts = {
      COMPLETED: allJobs.filter((j: any) => j.status === 'COMPLETED').length,
      CANCELLED: allJobs.filter((j: any) => j.status === 'CANCELLED').length,
      IN_PROGRESS: allJobs.filter((j: any) => j.status === 'IN_PROGRESS').length,
      BROADCASTING: allJobs.filter((j: any) => j.status === 'BROADCASTING').length,
      ACCEPTED: allJobs.filter((j: any) => j.status === 'ACCEPTED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        // Finance
        totalRevenue,
        totalCommission,
        totalWorkerEarnings,
        totalRefundAmount,
        totalGatewayFees,
        netPlatformRevenue: totalCommission - totalGatewayFees,
        // Counts
        totalPayments: rangePayments.length,
        capturedPayments: capturedPayments.length,
        failedPayments: rangePayments.filter((p: any) => p.status === 'FAILED').length,
        refundedCount: refundedPayments.length,
        // Jobs
        totalJobs: rangeJobs.length,
        completedJobs,
        cancelledJobs,
        activeJobs,
        completionRate: rangeJobs.length > 0 ? Math.round((completedJobs / rangeJobs.length) * 100) : 0,
        // Users & Workers
        totalUsers: usersSnap.size,
        totalWorkers: workersSnap.size,
        verifiedWorkers,
        // Payouts
        pendingPayouts: pendingPayouts.length,
        pendingPayoutAmount,
        // Charts
        revenueTimeSeries,
        jobStatusCounts,
      }
    });
  } catch (error: any) {
    console.error('[Finance Stats API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to load finance statistics' }, { status: 500 });
  }
}
