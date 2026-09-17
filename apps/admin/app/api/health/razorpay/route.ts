import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';

export const runtime = 'nodejs';

export async function GET() {
  const claims = await verifyAdmin();
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Razorpay keys not configured' },
      { status: 503 }
    );
  }

  // If keys are present, we assume it's healthy for this dashboard
  return NextResponse.json({ success: true, status: 'operational' }, { status: 200 });
}
