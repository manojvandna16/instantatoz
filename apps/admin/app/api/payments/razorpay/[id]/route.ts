import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify Authentication & Admin Authorization
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (!decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const paymentId = resolvedParams.id;

    // 2. Validate Payment ID (reject mocks)
    if (!paymentId || paymentId.startsWith('mock_')) {
      return NextResponse.json({ error: 'Invalid or mock payment ID' }, { status: 400 });
    }

    // 3. Check for Razorpay credentials on server
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[Razorpay API] Missing Razorpay environment variables.');
      return NextResponse.json({ error: 'Payment gateway configuration is missing on the server' }, { status: 500 });
    }

    // 4. Fetch from Razorpay API
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found in Razorpay' }, { status: 404 });
    }

    // 5. Return safe/relevant details
    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        entity: payment.entity,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        order_id: payment.order_id,
        invoice_id: payment.invoice_id,
        method: payment.method,
        description: payment.description,
        bank: payment.bank,
        wallet: payment.wallet,
        vpa: payment.vpa,
        email: payment.email,
        contact: payment.contact,
        fee: payment.fee,
        tax: payment.tax,
        captured: payment.captured,
        created_at: payment.created_at,
        acquirer_data: payment.acquirer_data,
        card: payment.card,
      }
    });

  } catch (error: any) {
    console.error('[Razorpay API] Error fetching payment:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details from Razorpay' },
      { status: 500 }
    );
  }
}
