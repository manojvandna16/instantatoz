import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyIdToken } from '@/lib/firebase-admin';

async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return await verifyIdToken(authHeader.slice('Bearer '.length));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // HMAC-SHA256 signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const body_str = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body_str)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — possible tampered request
      console.error('[Razorpay] Signature mismatch — possible fraud attempt');
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    // ✅ Payment verified successfully
    // TODO (Phase 2): Save payment record to Firestore here
    // await adminDb.collection('payments').add({
    //   paymentId: razorpay_payment_id,
    //   orderId: razorpay_order_id,
    //   status: 'captured',
    //   verifiedAt: FieldValue.serverTimestamp(),
    // });

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('[Razorpay] Verify payment error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
