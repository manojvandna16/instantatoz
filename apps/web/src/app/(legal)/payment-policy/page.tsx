import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Payment Policy | Instantatoz',
  description:
    'Understand payment methods, processing, transaction states, invoices, and platform commission on the Instantatoz platform.',
};

const LAST_UPDATED = '10 August 2026';

export default function PaymentPolicyPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This Payment Policy should be
          reviewed by qualified legal counsel. By making or receiving payments through the Platform,
          you agree to the terms set out herein.
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-red-800 leading-relaxed font-semibold">
          ⚠️ Security Warning: Never share your OTP, card number, CVV, PIN, UPI PIN, or any payment
          credentials with Workers or any third party. Instantatoz support will never ask for
          these details. Report any such requests immediately to {siteConfig.supportEmail}.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        {/* Gateway Notice */}
        <section>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-semibold">Payment Gateway Status:</span> Payment gateway
              integration will be fully enabled after merchant onboarding and activation with our
              payment partner. During the pre-launch or limited-access phase, payment processing
              may be restricted or unavailable. Users will be notified of the activation date via
              the app and email.
            </p>
          </div>
        </section>

        {/* 1. Supported Methods */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Supported Payment Methods</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Instantatoz supports the following payment methods through its integrated payment gateway:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { method: 'UPI', detail: 'PhonePe, GPay, Paytm, BHIM, and all UPI-enabled apps' },
              { method: 'Debit / Credit Cards', detail: 'Visa, Mastercard, RuPay — Indian-issued cards' },
              { method: 'Net Banking', detail: 'Major Indian banks via payment gateway integration' },
              { method: 'Digital Wallets', detail: 'Supported wallets as enabled by the payment gateway' },
            ].map(({ method, detail }) => (
              <div key={method} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{method}</p>
                <p className="text-gray-600 text-xs mt-1">{detail}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            Cash payments are not supported. All transactions must be made through the Platform.
            Making direct cash payments to Workers for Platform-booked Jobs is a violation of
            these terms.
          </p>
        </section>

        {/* 2. Payment Processing */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How Payments Are Processed</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Payments on Instantatoz follow a structured flow:
          </p>
          <ol className="space-y-3 text-gray-700 text-sm leading-relaxed list-decimal pl-6">
            <li>
              <span className="font-semibold">Payment Initiation:</span> When a User confirms a Job
              request, the Platform calculates the estimated total charge (hours × hourly rate +
              platform commission) and initiates a payment transaction.
            </li>
            <li>
              <span className="font-semibold">Authorisation / Hold:</span> The payment gateway
              authorises and may hold the estimated amount from the User&apos;s payment instrument pending
              Job completion.
            </li>
            <li>
              <span className="font-semibold">Capture:</span> Upon Job completion (Work End
              confirmation), the actual amount based on tracked hours is captured by the payment
              gateway.
            </li>
            <li>
              <span className="font-semibold">Settlement:</span> After deduction of the platform
              commission, the net amount is disbursed to the Worker via bank transfer or UPI within
              the applicable payout cycle.
            </li>
            <li>
              <span className="font-semibold">Refund (if applicable):</span> If a cancellation or
              dispute results in a refund, the amount is reversed to the User&apos;s original payment
              instrument within the timeline specified in our Refund Policy.
            </li>
          </ol>
        </section>

        {/* 3. Payment Status States */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Payment Status States</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Each payment transaction progresses through the following states:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Status</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">CREATED</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">Payment order created; awaiting User&apos;s payment action.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">PENDING</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">Payment initiated by User; awaiting bank or gateway confirmation. Do not re-attempt payment in this state.</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">AUTHORIZED</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">Payment authorised by the bank/gateway; funds held. Job is now confirmed.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">CAPTURED</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">Payment captured upon Job completion. Settlement to Worker initiated.</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">FAILED</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">Payment failed due to bank decline, network error, or user abandonment. No charge applied; auto-refund where applicable.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Invoices */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Invoices and Receipts</h2>
          <p className="text-gray-700 leading-relaxed">
            Upon successful payment capture, an electronic receipt will be available in your
            Account transaction history within the Platform. The receipt will detail the Job
            reference, service category, hours worked, hourly rate, platform commission, applicable
            taxes, and total amount charged. GST invoices, where applicable, will be issued in
            accordance with the Goods and Services Tax Act, 2017. For formal GST invoices, contact
            us at {siteConfig.supportEmail}.
          </p>
        </section>

        {/* 5. Commission */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Platform Commission</h2>
          <p className="text-gray-700 leading-relaxed">
            Instantatoz charges a platform commission on each completed Job. This commission is
            inclusive of the technology service fee, payment processing costs, and operational
            charges. The commission rate is displayed to both Users (as part of the total charge)
            and Workers (as a deduction from gross earnings) within the Platform. The commission
            rate may vary by service category and is subject to revision upon 30 days&apos; notice.
            Commission is not refundable once a Job has been completed and payment captured.
          </p>
        </section>

        {/* 6. Failed Payments */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Failed and Duplicate Payments</h2>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>
              <span className="font-semibold">Failed Payments:</span> If your payment fails after
              funds are debited from your account, the amount will be automatically refunded to
              your original payment instrument within 5–10 working days, subject to your bank or
              payment provider&apos;s processing times.
            </li>
            <li>
              <span className="font-semibold">Duplicate Payments:</span> In the event of a
              duplicate charge for the same transaction (due to a technical error), the duplicate
              amount will be automatically reversed within 7 working days. Report suspected
              duplicates to {siteConfig.supportEmail} with your transaction reference number.
            </li>
          </ul>
        </section>

        {/* 7. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For any payment-related queries, disputes, or concerns:
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Include:</span> Your registered mobile number, Job reference ID, and payment transaction ID.</p>
            <p><span className="font-semibold">Response Time:</span> Within 48 business hours</p>
          </div>
        </section>

      </div>
    </div>
  );
}
