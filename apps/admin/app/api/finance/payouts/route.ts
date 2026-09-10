import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session')?.value;
  if (!sessionCookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
    return claims.admin ? claims : null;
  } catch { return null; }
}

// GET: List payouts
export async function GET(request: Request) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const db = adminDb();
    let query = db.collection('payouts').orderBy('createdAt', 'desc').limit(limit) as FirebaseFirestore.Query;
    if (status && status !== 'ALL') {
      query = db.collection('payouts').where('payoutStatus', '==', status).orderBy('createdAt', 'desc').limit(limit);
    }

    const snap = await query.get();
    const payouts = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        workerId: data.workerId,
        workerName: data.workerName,
        jobId: data.jobId,
        paymentId: data.paymentId,
        grossAmount: data.grossAmount,
        platformCommission: data.platformCommission,
        workerPayable: data.workerPayable,
        payoutStatus: data.payoutStatus,
        payoutMethod: data.payoutMethod || 'MANUAL',
        payoutReference: data.payoutReference || null,
        notes: data.notes || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        paidAt: data.paidAt?.toDate?.()?.toISOString() ?? null,
        approvedBy: data.approvedBy || null,
      };
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error: any) {
    console.error('[Payouts API] GET error:', error.message);
    return NextResponse.json({ error: 'Failed to load payouts' }, { status: 500 });
  }
}

// POST: Create a payout record from a payment
export async function POST(request: Request) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = claims.role;
  if (role !== 'SUPER_ADMIN' && role !== 'FINANCE_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { paymentId, workerId, workerName, jobId, grossAmount, platformCommission, workerPayable } = body;

    if (!paymentId || !workerId || !workerPayable) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = adminDb();

    // Check for duplicate payout for same payment
    const existingSnap = await db.collection('payouts').where('paymentId', '==', paymentId).get();
    const successfulPayout = existingSnap.docs.find(d => ['PAID', 'PROCESSING', 'APPROVED'].includes(d.data().payoutStatus));
    if (successfulPayout) {
      return NextResponse.json({ error: 'A payout already exists for this payment. Cannot create duplicate.' }, { status: 409 });
    }

    const payoutRef = await db.collection('payouts').add({
      paymentId,
      workerId,
      workerName: workerName || 'Unknown',
      jobId: jobId || null,
      grossAmount: grossAmount || 0,
      platformCommission: platformCommission || 0,
      workerPayable,
      payoutStatus: 'PENDING',
      payoutMethod: 'MANUAL',
      payoutReference: null,
      createdAt: FieldValue.serverTimestamp(),
      paidAt: null,
      approvedBy: null,
      notes: `Created by ${claims.email || claims.uid}`,
    });

    return NextResponse.json({ success: true, id: payoutRef.id });
  } catch (error: any) {
    console.error('[Payouts API] POST error:', error.message);
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 });
  }
}
