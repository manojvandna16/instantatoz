import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // Simple health check for Razorpay integration
  // In a real scenario, you could ping Razorpay's base URL or verify the key exists
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Razorpay keys not configured' },
      { status: 503 }
    );
  }

  // If keys are present, we assume it's healthy for this dashboard
  return NextResponse.json({ success: true, status: 'operational' }, { status: 200 });
}
