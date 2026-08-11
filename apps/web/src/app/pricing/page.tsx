import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Instantatoz',
  description:
    'Understand how pricing works on Instantatoz. Hourly-based billing, transparent charges, no hidden fees. Pricing depends on category, hours, workers, and applicable charges.',
};

export default function PricingPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Pricing
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Transparent, Hourly-Based Pricing
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pay only for the hours worked. No hidden fees. All charges disclosed before payment.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Billing formula */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-5">How Billing is Calculated</h2>
          <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-2">Core Billing Formula</p>
            <p className="font-jakarta text-2xl sm:text-3xl font-black text-gray-900">
              Hourly Rate × Billable Hours × Number of Workers
            </p>
            <p className="text-gray-500 mt-2 text-sm">= Service Amount</p>
            <p className="text-gray-500 text-sm mt-1">
              + Platform Fee (if applicable) + Applicable Taxes = <strong>Total Payable</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Hourly Rate', desc: 'Set by the worker for their category. Visible before job confirmation.' },
              { label: 'Billable Hours', desc: 'Recorded by the server-controlled timer starting from OTP verification.' },
              { label: 'Number of Workers', desc: 'The number of workers you requested for the job.' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Illustrative example */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-7 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-600" />
            <p className="font-bold text-amber-800 uppercase text-sm tracking-wide">
              Illustrative Example Only — Not Actual Rates
            </p>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-amber-100">
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: 'Service Category', value: 'Computer Operator (Example)' },
                  { label: 'Worker Hourly Rate (Example)', value: '₹300 per hour' },
                  { label: 'Number of Workers', value: '1' },
                  { label: 'Hours Worked (Server-Recorded)', value: '3 hours' },
                  { label: 'Service Amount', value: '₹900 (₹300 × 3 × 1)' },
                  { label: 'Platform Fee (if applicable)', value: 'Shown separately at checkout' },
                  { label: 'Applicable Taxes', value: 'Shown at checkout per applicable law' },
                  { label: 'Total Payable', value: 'Calculated at booking confirmation' },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-5 py-3 text-gray-600">{row.label}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-amber-700 text-xs mt-3">
            * This is a hypothetical example for illustration purposes only. Actual rates vary by category, worker, and location.
            Final charges are always disclosed before payment.
          </p>
        </div>

        {/* Factors affecting price */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-5">Factors That May Affect Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { factor: 'Service category', detail: 'Skilled services may have different rates than general labour.' },
              { factor: 'Worker\'s hourly rate', detail: 'Each worker sets their own rate based on category and experience.' },
              { factor: 'Number of workers', detail: 'Requesting multiple workers multiplies the hourly cost.' },
              { factor: 'Number of hours', detail: 'Longer jobs cost more. Billed in server-verified increments.' },
              { factor: 'Location', detail: 'Rates may vary by city or service area.' },
              { factor: 'Platform charges', detail: 'A platform service fee may apply. Always shown before payment.' },
              { factor: 'Applicable taxes', detail: 'GST or other applicable taxes as per Indian law.' },
              { factor: 'Cancellation charges', detail: 'May apply if a confirmed job is cancelled after worker acceptance. Refer to Cancellation Policy.' },
            ].map((item) => (
              <div key={item.factor} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{item.factor}:</span>
                  <span className="text-gray-600 text-sm ml-1">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-5">Payment Methods</h2>
          <p className="text-gray-600 mb-5">
            Instantatoz is designed to support the following payment methods once the payment gateway is activated after merchant onboarding:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Mobile Wallet', 'Other (gateway-supported)'].map((method) => (
              <div key={method} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                <span className="text-blue-500">✓</span>
                {method}
              </div>
            ))}
          </div>
          <div className="mt-5 bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> Payment gateway integration will be enabled after merchant onboarding and activation by the selected payment provider.
              Do not share OTP, card details, or passwords with workers or anyone claiming to be from Instantatoz.
            </p>
          </div>
        </div>

        {/* Worker payout */}
        <div className="bg-gray-50 rounded-2xl p-7 mb-8">
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-4">Worker Payout</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            After job completion and payment, the platform calculates:
          </p>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-sm space-y-2">
            <p className="text-gray-700">Total Customer Payment</p>
            <p className="text-gray-500">− Platform Commission (percentage, disclosed)</p>
            <p className="text-gray-500">− Any other applicable deductions</p>
            <p className="font-bold text-gray-900 border-t border-gray-100 pt-2">= Worker Payable Amount</p>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            The exact commission percentage will be disclosed in the Worker Terms and the Worker App dashboard.
            It is not hard-coded and may vary by category or platform policy.
          </p>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/payment-policy" className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors">
              View Payment Policy
            </Link>
            <Link href="/refund-policy" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Refund Policy
            </Link>
            <Link href="/cancellation-policy" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
