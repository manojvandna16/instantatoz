import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.RAZORPAY_KEY_ID || '';
  return NextResponse.json({
    isLive: key.startsWith('rzp_live')
  });
}
