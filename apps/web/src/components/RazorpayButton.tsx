'use client';

import { useState } from 'react';
import Script from 'next/script';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayButtonProps {
  /** Amount in RUPEES (we convert to paise internally) */
  amountInRupees: number;
  description?: string;
  /** Pre-fill user details if available */
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  /** Called after successful payment verification */
  onSuccess?: (paymentId: string, orderId: string) => void;
  /** Called on failure or cancellation */
  onFailure?: (error: string) => void;
  /** Button label */
  label?: string;
  /** Tailwind classes for the button */
  className?: string;
  disabled?: boolean;
}

export default function RazorpayButton({
  amountInRupees,
  description = 'Instantatoz Service Payment',
  prefill,
  onSuccess,
  onFailure,
  label = `Pay ₹${amountInRupees}`,
  className = '',
  disabled = false,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment system is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // STEP 1: Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInRupees * 100, // convert ₹ to paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: { description },
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to initiate payment');
      }

      const { order_id, amount, currency } = await orderRes.json();

      // STEP 2: Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: 'Instantatoz',
        description,
        order_id,
        prefill: prefill || {},
        theme: { color: '#1d4ed8' }, // Instantatoz blue
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure?.('Payment cancelled by user');
          },
        },
        handler: async (response: RazorpayResponse) => {
          // STEP 3: Verify signature on backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            setPaid(true);
            setLoading(false);
            onSuccess?.(response.razorpay_payment_id, response.razorpay_order_id);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Verification failed';
            setError(msg);
            setLoading(false);
            onFailure?.(msg);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed';
        setError(msg);
        setLoading(false);
        onFailure?.(msg);
      });

      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setLoading(false);
      onFailure?.(msg);
    }
  };

  if (paid) {
    return (
      <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-semibold text-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Payment Successful!
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay checkout.js */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setError('Failed to load payment gateway')}
        strategy="lazyOnload"
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={handlePayment}
          disabled={disabled || loading || !scriptLoaded}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {label}
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        <p className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Razorpay. UPI, Cards, Net Banking accepted.
        </p>
      </div>
    </>
  );
}
