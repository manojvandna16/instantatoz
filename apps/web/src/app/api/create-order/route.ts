import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// ⚠️ Initialized inside handler (not at module level) so env vars are
// available at runtime on Vercel, not just during local builds.
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount (minimum 100 paise = ₹1)
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1)' },
        { status: 400 }
      );
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error('[Razorpay] Create order error:', error);
    const err = error as { statusCode?: number; message?: string };
    if (err?.statusCode === 401) {
      return NextResponse.json(
        { error: 'Payment gateway authentication failed' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
