'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { sendOtp, verifyOtp } from '@/lib/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { Loader2, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { user, loading } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Consent
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Hardcoded current document versions (must match database constants usually)
  const CURRENT_TERMS_VERSION = '2026-08-01';
  const CURRENT_PRIVACY_VERSION = '2026-08-01';

  // Timer for resend
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // If user is already logged in, redirect them
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!phone) return;
    if (!termsAccepted || !privacyAccepted) {
      setError('You must accept the Terms & Conditions and Privacy Policy to register.');
      return;
    }
    
    // Format to +91 if needed
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Store consent securely for the FirebaseProvider to pick up if it's a new user
      sessionStorage.setItem('pendingConsent', JSON.stringify({
        termsVersion: CURRENT_TERMS_VERSION,
        privacyVersion: CURRENT_PRIVACY_VERSION
      }));

      const confirmation = await sendOtp(formattedPhone, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setStep('OTP');
      setCountdown(30); // 30 sec cooldown
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setSubmitting(true);
    setError('');

    try {
      await verifyOtp(confirmationResult, otp);
      // Success! The AuthProvider / FirebaseProvider will automatically catch the state change,
      // create the USR profile if needed, and then the useEffect above will redirect.
    } catch (err: unknown) {
      console.error(err);
      setError('Invalid OTP. Please check and try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white font-bold text-lg">IA</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-plus-jakarta">Login to {siteConfig.name}</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your mobile number to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">Terms &amp; Conditions</a>.
                  </span>
                </label>
                
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={submitting || phone.length < 10 || !termsAccepted || !privacyAccepted}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors bg-white text-gray-900 tracking-[0.2em] font-mono text-center text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  OTP sent to +91 {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length < 6}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify & Login'
                )}
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-medium text-gray-900">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={submitting}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" className="hidden"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
