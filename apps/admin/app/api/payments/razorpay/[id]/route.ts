import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

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
    if (!paymentId || paymentId.startsWith('mock_') || paymentId.startsWith('pay_simulated')) {
      return NextResponse.json({ error: 'Invalid or mock payment ID' }, { status: 400 });
    }

    // 3. Check for Razorpay credentials on server
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Log which key is being used (masked for security)
    console.log('[Razorpay API] Key ID present:', keyId ? `${keyId.slice(0, 14)}...` : 'MISSING');
    console.log('[Razorpay API] Key Secret present:', !!keySecret);

    if (!keyId || !keySecret) {
      console.error('[Razorpay API] Missing Razorpay environment variables.');
      return NextResponse.json({ error: 'Payment gateway configuration is missing on the server' }, { status: 500 });
    }

    // 4. Fetch from Razorpay REST API directly using fetch()
    // Using direct REST API instead of SDK to avoid any env var loading issues
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await rzpResponse.json();

    console.log('[Razorpay API] Razorpay response status:', rzpResponse.status);

    if (!rzpResponse.ok) {
      console.error('[Razorpay API] Error from Razorpay:', JSON.stringify(data));
      const errMsg = data?.error?.description || data?.error?.code || 'Failed to fetch payment from Razorpay';
      return NextResponse.json({ error: errMsg }, { status: rzpResponse.status });
    }

    // 5. Return safe/relevant details
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        entity: data.entity,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        order_id: data.order_id,
        invoice_id: data.invoice_id,
        method: data.method,
        description: data.description,
        bank: data.bank,
        wallet: data.wallet,
        vpa: data.vpa,
        email: data.email,
        contact: data.contact,
        fee: data.fee,
        tax: data.tax,
        captured: data.captured,
        created_at: data.created_at,
        acquirer_data: data.acquirer_data,
        card: data.card,
      }
    });

  } catch (error: any) {
    console.error('[Razorpay API] Unexpected error:', error?.message || String(error));
    return NextResponse.json(
      { error: 'Server error while fetching payment details', detail: error?.message },
      { status: 500 }
    );
  }
}
