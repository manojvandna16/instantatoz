import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    if (!decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, notes } = await request.json(); // ACTIVE, REJECTED, etc.
    const resolvedParams = await params;
    const workerId = resolvedParams.id;

    if (!['ACTIVE', 'REJECTED', 'MORE_INFO_REQUIRED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const workerRef = db().collection('workers').doc(workerId);
    
    // Update worker document
    await workerRef.update({
      verificationStatus: status,
      adminNotes: notes || '',
      verifiedByAdminId: decodedClaims.uid,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });

    // Also update audit log
    await db().collection('adminLogs').add({
      action: 'WORKER_VERIFICATION',
      workerId: workerId,
      adminId: decodedClaims.uid,
      previousStatus: 'PENDING',
      newStatus: status,
      notes: notes || '',
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying worker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
