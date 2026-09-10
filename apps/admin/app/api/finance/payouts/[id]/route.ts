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

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'FAILED'],
  APPROVED: ['PROCESSING', 'FAILED'],
  PROCESSING: ['PAID', 'FAILED'],
  PAID: [],
  FAILED: ['PENDING'],
};

// PATCH: Update payout status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = claims.role;
  if (role !== 'SUPER_ADMIN' && role !== 'FINANCE_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { newStatus, payoutReference, notes } = body;

  if (!newStatus) return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });

  try {
    const db = adminDb();
    const ref = db.collection('payouts').doc(id);
    const doc = await ref.get();

    if (!doc.exists) return NextResponse.json({ error: 'Payout not found' }, { status: 404 });

    const current = doc.data()!;
    const currentStatus = current.payoutStatus;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json({
        error: `Cannot transition from ${currentStatus} to ${newStatus}`
      }, { status: 400 });
    }

    const update: Record<string, any> = {
      payoutStatus: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
      approvedBy: claims.email || claims.uid,
    };

    if (newStatus === 'PAID') {
      update.paidAt = FieldValue.serverTimestamp();
    }
    if (payoutReference) update.payoutReference = payoutReference;
    if (notes) update.notes = notes;

    await ref.update(update);

    // Audit log
    await db.collection('audit_logs').add({
      adminId: claims.uid,
      adminRole: claims.role ?? 'ADMIN',
      action: `PAYOUT_${newStatus}`,
      targetId: id,
      oldValue: { status: currentStatus },
      newValue: { status: newStatus },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Payouts PATCH] Error:', error.message);
    return NextResponse.json({ error: 'Failed to update payout status' }, { status: 500 });
  }
}
