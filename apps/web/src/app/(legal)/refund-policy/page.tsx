import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Refund Policy | Instantatoz',
  description:
    'Learn about Instantatoz refund rules based on job status, cancellation timing, payment failures, and dispute outcomes.',
};

const LAST_UPDATED = '10 August 2026';

export default function RefundPolicyPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This Refund Policy should be
          reviewed by qualified legal counsel. Specific timelines and amounts noted herein are
          configurable and may vary. Users are encouraged to read this policy carefully before
          making a payment.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-700 leading-relaxed">
            Instantatoz is committed to fair and transparent refund practices. Refund eligibility
            depends on the stage at which a Job is cancelled, the circumstances of the cancellation,
            and the outcome of any dispute resolution process. All refunds are credited to the
            original payment instrument used at the time of booking. Processing times are subject
            to the timelines of the User&apos;s bank or payment provider and are beyond the direct
            control of Instantatoz.
          </p>
        </section>

        {/* 1. Before Worker Acceptance */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            1. Cancellation Before Worker Acceptance
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-green-800 font-semibold">✓ Full Refund Eligible</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            If a User cancels a Job request before any Worker has accepted it, the User is eligible
            for a full refund of the amount paid (less any payment gateway processing charges that
            are non-refundable by the gateway provider, if applicable). The refund will be initiated
            within <span className="font-semibold">[X] business days</span> of cancellation and
            credited to the original payment instrument within{' '}
            <span className="font-semibold">5–10 working days</span>, subject to bank processing
            times.
          </p>
        </section>

        {/* 2. After Acceptance Before Arrival */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            2. Cancellation After Worker Acceptance — Before Worker Arrival
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-yellow-800 font-semibold">⚡ Partial or Full Refund — Timing Dependent</p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-3">
            If a User cancels after a Worker has accepted but before the Worker arrives at the
            work site, refund eligibility depends on how far in advance the cancellation occurs
            relative to the scheduled Job time:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Time of Cancellation</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">More than [X] minutes before scheduled start</td>
                  <td className="border border-gray-200 px-4 py-2">Full refund (less gateway charges)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">Between [Y] and [X] minutes before scheduled start</td>
                  <td className="border border-gray-200 px-4 py-2">Partial refund — cancellation fee of [₹Z] applies</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Less than [Y] minutes before scheduled start</td>
                  <td className="border border-gray-200 px-4 py-2">Higher cancellation fee; reduced refund</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 text-xs leading-relaxed mt-2 text-gray-500">
            Note: Values in [brackets] are configurable and will be specified in the Platform at
            the time of cancellation.
          </p>
        </section>

        {/* 3. After OTP Work Start */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            3. After OTP Work Start — Job in Progress
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-red-800 font-semibold">✗ No Refund for Hours Worked</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Once the OTP Work Start has been confirmed, the Job is officially in progress. No
            refund is available for the hours already worked and billed. If a User wishes to end
            the Job before the originally scheduled completion time, the billing will be calculated
            for the actual hours worked. Refunds for the remaining unworked hours (if pre-paid)
            will be processed after the Job is formally ended through the Platform.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            In cases of genuine Worker misconduct, non-performance, or safety incidents after OTP
            Work Start, Users may file a dispute. The Company will investigate and may issue a
            partial or full refund at its sole discretion based on evidence.
          </p>
        </section>

        {/* 4. Payment Failure */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            4. Payment Failure Auto-Refund
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-blue-800 font-semibold">⟳ Automatic Refund</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            If a payment is debited from your account but the Job order is not confirmed due to a
            payment gateway or technical error, an automatic refund will be triggered within{' '}
            <span className="font-semibold">5–10 working days</span>. The amount will be credited
            to the original payment instrument. If you do not receive the refund within this
            period, contact us at {siteConfig.supportEmail} with your transaction reference number.
          </p>
        </section>

        {/* 5. Duplicate Payment */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            5. Duplicate Payment Auto-Refund
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-blue-800 font-semibold">⟳ Automatic Reversal</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            In the event of a duplicate payment for the same Job (two charges for one transaction
            due to a system error), the duplicate amount will be automatically identified and
            reversed within <span className="font-semibold">7 working days</span>. To report a
            suspected duplicate, write to {siteConfig.supportEmail} with:
          </p>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mt-3">
            <li>Your registered mobile number.</li>
            <li>The Job reference ID.</li>
            <li>The transaction IDs of both charges.</li>
            <li>Bank statement screenshot confirming the double debit.</li>
          </ul>
        </section>

        {/* 6. Dispute-Based Refunds */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Dispute-Based Refunds</h2>
          <p className="text-gray-700 leading-relaxed">
            Disputes arising from Worker non-arrival, false OTP entry, poor service quality, or
            safety incidents may be filed with the Platform support team at {siteConfig.supportEmail}.
            Disputes will be reviewed within <span className="font-semibold">7 working days</span>.
            Where a dispute is resolved in the User&apos;s favour, a full or partial refund will be
            processed. The Company&apos;s decision on disputes is final and binding.
          </p>
        </section>

        {/* 7. Non-Refundable Items */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Non-Refundable Items</h2>
          <p className="text-gray-700 leading-relaxed mb-3">The following are not refundable:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Platform commission once a Job has been completed.</li>
            <li>Hours worked and billed through the OTP Work Start mechanism.</li>
            <li>Cancellation fees as per the applicable cancellation tier.</li>
            <li>Payment gateway processing charges (where non-refundable by the gateway).</li>
          </ul>
        </section>

        {/* 8. Refund Timelines */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Refund Processing Timelines</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Refunds are processed by Instantatoz within the following timelines after approval:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Refund Type</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Initiation</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Credit to Account</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Pre-acceptance cancellation</td>
                  <td className="border border-gray-200 px-4 py-2">Within 24 hours</td>
                  <td className="border border-gray-200 px-4 py-2">5–10 working days</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">Post-acceptance cancellation</td>
                  <td className="border border-gray-200 px-4 py-2">Within 48 hours</td>
                  <td className="border border-gray-200 px-4 py-2">5–10 working days</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Payment failure auto-refund</td>
                  <td className="border border-gray-200 px-4 py-2">Automatic</td>
                  <td className="border border-gray-200 px-4 py-2">5–10 working days</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">Duplicate payment reversal</td>
                  <td className="border border-gray-200 px-4 py-2">Within 48 hours</td>
                  <td className="border border-gray-200 px-4 py-2">7 working days</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Dispute-based refund</td>
                  <td className="border border-gray-200 px-4 py-2">Within 7 working days of resolution</td>
                  <td className="border border-gray-200 px-4 py-2">5–10 working days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact for Refund Queries</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Subject Line:</span> &quot;Refund Request — [Job Reference ID]&quot;</p>
            <p><span className="font-semibold">Response Time:</span> Within 48 business hours</p>
          </div>
        </section>

      </div>
    </div>
  );
}
