import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = adminDb();
    const paymentsSnap = await db.collection('payments').get();
    const payoutsSnap = await db.collection('payouts').get();
    const jobsSnap = await db.collection('jobs').get();

    const payouts = payoutsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const jobs = new Map(jobsSnap.docs.map(d => [d.id, { id: d.id, ...d.data() }]));

    let totalPayments = paymentsSnap.docs.length;
    let mappableToEarning = 0;
    let alreadyPayoutRecorded = 0;
    let unmappable = 0;
    
    for (const doc of paymentsSnap.docs) {
      const payment: any = { id: doc.id, ...doc.data() };
      const job: any = jobs.get(payment.jobId);
      
      const existingPayout = payouts.find((p: any) => p.paymentId === payment.id);
      
      if (payment.status === 'success' || payment.status === 'captured') {
        if (job && job.status === 'COMPLETED' && job.workerIdAssigned) {
          mappableToEarning++;
          if (existingPayout) alreadyPayoutRecorded++;
        } else {
          unmappable++;
        }
      } else {
        unmappable++;
      }
    }

    return NextResponse.json({
      totalPayments,
      mappableToEarning,
      alreadyPayoutRecorded,
      unmappable,
      totalPayouts: payouts.length,
      pendingPayouts: payouts.filter((p: any) => p.payoutStatus === 'PENDING').length,
      paidPayouts: payouts.filter((p: any) => p.payoutStatus === 'PAID').length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
