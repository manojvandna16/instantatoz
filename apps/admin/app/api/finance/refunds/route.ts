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

function getRzpCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return { keyId, keySecret };
}

// GET: List refunds
export async function GET() {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = adminDb();
    const snap = await db.collection('refunds').orderBy('initiatedAt', 'desc').limit(100).get();

    const refunds = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        razorpayRefundId: data.razorpayRefundId,
        paymentId: data.paymentId,
        jobId: data.jobId,
        customerId: data.customerId,
        customerName: data.customerName,
        workerId: data.workerId,
        workerName: data.workerName,
        originalAmount: data.originalAmount,
        refundAmount: data.refundAmount,
        reason: data.reason,
        status: data.status,
        razorpayStatus: data.razorpayStatus,
        initiatedBy: data.initiatedBy,
        initiatedAt: data.initiatedAt?.toDate?.()?.toISOString() ?? null,
        processedAt: data.processedAt?.toDate?.()?.toISOString() ?? null,
        failureReason: data.failureReason || null,
      };
    });

    return NextResponse.json({ success: true, data: refunds });
  } catch (error: any) {
    console.error('[Refunds API] GET error:', error.message);
    return NextResponse.json({ error: 'Failed to load refunds' }, { status: 500 });
  }
}

// POST: Initiate a Razorpay refund
export async function POST(request: Request) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = claims.role;
  if (role !== 'SUPER_ADMIN' && role !== 'FINANCE_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { paymentId, refundAmount, reason, jobId, customerId, customerName, workerId, workerName, originalAmount } = body;

    if (!paymentId || !refundAmount || !reason) {
      return NextResponse.json({ error: 'paymentId, refundAmount, and reason are required' }, { status: 400 });
    }

    if (typeof refundAmount !== 'number' || refundAmount <= 0) {
      return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 });
    }

    if (refundAmount > originalAmount) {
      return NextResponse.json({ error: 'Refund amount cannot exceed original payment amount' }, { status: 400 });
    }

    const db = adminDb();

    // Check previous refunds for this payment
    const prevRefundsSnap = await db.collection('refunds')
      .where('paymentId', '==', paymentId)
      .where('status', 'in', ['PENDING', 'PROCESSED'])
      .get();

    const alreadyRefunded = prevRefundsSnap.docs.reduce((sum, d) => sum + (d.data().refundAmount || 0), 0);
    const remainingRefundable = originalAmount - alreadyRefunded;

    if (refundAmount > remainingRefundable) {
      return NextResponse.json({
        error: `Refund amount (₹${refundAmount}) exceeds remaining refundable amount (₹${remainingRefundable})`
      }, { status: 400 });
    }

    // Initiate Razorpay refund
    const { keyId, keySecret } = getRzpCredentials();
    let razorpayRefundId: string | null = null;
    let rzpStatus = 'unknown';
    let refundDocStatus = 'PENDING';

    if (keyId && keySecret && !paymentId.startsWith('mock_')) {
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(refundAmount * 100), // paise
          notes: { reason, initiatedBy: claims.email || claims.uid },
        }),
        cache: 'no-store',
      });

      const rzpData = await rzpRes.json();

      if (!rzpRes.ok) {
        const errMsg = rzpData?.error?.description || 'Razorpay refund failed';
        return NextResponse.json({ error: errMsg }, { status: 422 });
      }

      razorpayRefundId = rzpData.id;
      rzpStatus = rzpData.status;
      refundDocStatus = rzpData.status === 'processed' ? 'PROCESSED' : 'PENDING';
    } else {
      // Mock payment — record manual refund without gateway
      refundDocStatus = 'PROCESSED';
      rzpStatus = 'manual';
    }

    // Save refund record in Firestore
    const refundRef = await db.collection('refunds').add({
      razorpayRefundId,
      paymentId,
      jobId: jobId || null,
      customerId: customerId || null,
      customerName: customerName || 'Unknown',
      workerId: workerId || null,
      workerName: workerName || 'Unknown',
      originalAmount,
      refundAmount,
      reason,
      status: refundDocStatus,
      razorpayStatus: rzpStatus,
      initiatedBy: claims.email || claims.uid,
      initiatedAt: FieldValue.serverTimestamp(),
      processedAt: refundDocStatus === 'PROCESSED' ? FieldValue.serverTimestamp() : null,
      failureReason: null,
    });

    // Update payment record status
    try {
      const paymentRef = db.collection('payments').doc(paymentId);
      const totalRefunded = alreadyRefunded + refundAmount;
      const isFullRefund = totalRefunded >= originalAmount;
      await paymentRef.update({
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: FieldValue.increment(refundAmount),
      });
    } catch (e) {
      console.warn('[Refunds API] Could not update payment status:', e);
    }

    // Audit log
    await db.collection('audit_logs').add({
      adminId: claims.uid,
      adminRole: claims.role ?? 'ADMIN',
      action: 'REFUND_INITIATED',
      targetId: paymentId,
      newValue: { refundId: refundRef.id, amount: refundAmount, reason },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: refundRef.id, razorpayRefundId, status: refundDocStatus });
  } catch (error: any) {
    console.error('[Refunds API] POST error:', error.message);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
