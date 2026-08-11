import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Cancellation Policy | Instantatoz',
  description:
    'Understand the cancellation rules for customers and workers on Instantatoz at each stage of the job lifecycle.',
};

const LAST_UPDATED = '10 August 2026';

export default function CancellationPolicyPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancellation Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This Cancellation Policy should
          be reviewed with qualified legal counsel. Fees and timelines in this document are
          configurable and subject to change upon Platform notice.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-700 leading-relaxed">
            The Instantatoz Cancellation Policy governs the rights and obligations of both Users
            (Customers) and Workers when a Job is cancelled at any stage of the job lifecycle.
            The policy aims to be fair to all parties while discouraging frivolous cancellations
            that negatively impact Workers&apos; income and Users&apos; experience.
          </p>
        </section>

        {/* Job Lifecycle Overview */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Job Lifecycle Stages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { stage: '1', label: 'Posted', desc: 'Job created, seeking Worker' },
              { stage: '2', label: 'Accepted', desc: 'Worker matched & en route' },
              { stage: '3', label: 'Started', desc: 'OTP Work Start confirmed' },
              { stage: '4', label: 'Completed', desc: 'Job done, billing finalised' },
            ].map(({ stage, label, desc }) => (
              <div key={stage} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {stage}
                </div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION A: User Cancellations */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">A. User (Customer) Cancellations</h2>

          <div className="space-y-5">
            {/* Stage 1 */}
            <div className="border border-green-200 rounded-xl overflow-hidden">
              <div className="bg-green-50 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-green-800 text-sm">Stage 1: Before Worker Acceptance</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Full Refund</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  A User may cancel their Job request at any time before a Worker accepts it with
                  no penalty. A full refund of the authorised payment amount will be initiated
                  (less any non-refundable payment gateway charges). No negative record will be
                  made against the User&apos;s Account for single such cancellations.
                </p>
              </div>
            </div>

            {/* Stage 2 — Before arrival */}
            <div className="border border-yellow-200 rounded-xl overflow-hidden">
              <div className="bg-yellow-50 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-yellow-800 text-sm">Stage 2A: After Acceptance — Before Worker Arrival</h3>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Partial Refund</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  If a User cancels after a Worker has accepted and is en route, a cancellation fee
                  may apply to compensate the Worker for travel time and opportunity cost. The
                  applicable fee depends on the time elapsed since acceptance:
                </p>
                <ul className="space-y-1 text-gray-700 text-xs leading-relaxed list-disc pl-5">
                  <li>Within [X] minutes of acceptance: Minimal or no cancellation fee.</li>
                  <li>After [X] minutes: A fixed cancellation fee of [₹Y] applies.</li>
                  <li>After Worker is confirmed en route: Higher cancellation fee.</li>
                </ul>
                <p className="text-gray-500 text-xs mt-2">Specific amounts are configured in the Platform and shown at the time of cancellation.</p>
              </div>
            </div>

            {/* Stage 2 — After arrival */}
            <div className="border border-orange-200 rounded-xl overflow-hidden">
              <div className="bg-orange-50 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-orange-800 text-sm">Stage 2B: After Worker Arrival — Before OTP Work Start</h3>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Cancellation Fee</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  If a User cancels after the Worker has arrived at the work site but before the
                  OTP Work Start has been confirmed, a higher cancellation fee applies. This fee
                  compensates the Worker for travel time, waiting time, and the loss of another
                  job opportunity. The cancellation fee will be deducted from the held payment
                  and the remaining balance refunded to the User.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="border border-red-200 rounded-xl overflow-hidden">
              <div className="bg-red-50 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-red-800 text-sm">Stage 3: After OTP Work Start — Job in Progress</h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Non-Refundable for Hours Worked</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Once the OTP Work Start has been confirmed, the Worker has formally commenced
                  services. The User is obligated to pay for all hours worked up to the point of
                  cancellation. Billing is calculated based on the time elapsed since OTP Work
                  Start. Any pre-authorised amount exceeding the hours worked will be refunded.
                  No refund is available for hours already worked except in cases of verified
                  Worker misconduct, as determined through the dispute process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: Worker Cancellations */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">B. Worker Cancellations</h2>

          <div className="space-y-5">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3">
                <h3 className="font-semibold text-gray-800 text-sm">Before Arrival — Worker-Initiated Cancellation</h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  Workers may cancel an accepted Job before arriving at the work site under genuine
                  circumstances (emergency, illness, inability). However:
                </p>
                <ul className="space-y-1 text-gray-700 text-xs leading-relaxed list-disc pl-5">
                  <li>The Worker&apos;s reliability rating will be reduced.</li>
                  <li>The Platform will attempt to find an alternative Worker for the User.</li>
                  <li>The User will receive a full refund of any cancellation impact caused by the Worker&apos;s withdrawal.</li>
                  <li>Repeated Worker-initiated cancellations will result in progressive penalties including temporary suspension of job acceptance privileges.</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3">
                <h3 className="font-semibold text-gray-800 text-sm">No-Show — Worker Failure to Arrive</h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  If a Worker accepts a Job but fails to arrive within the expected arrival window
                  and does not cancel through the Platform, it is recorded as a &quot;No-Show&quot;. The
                  User will be entitled to a full refund. The Worker will receive an automatic
                  negative rating and no earnings for the Job. Repeated no-shows will result in
                  account suspension.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3">
                <h3 className="font-semibold text-gray-800 text-sm">After OTP Work Start — Worker-Initiated Abandonment</h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  A Worker abandoning a Job after OTP Work Start without a genuine emergency is a
                  serious breach of these Terms. The Worker will be paid only for hours actually
                  worked. The incident will be recorded and may result in account suspension. The
                  User may be entitled to a partial or full refund for unworked hours and any
                  demonstrable damages, subject to dispute resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* C. Repeated Cancellation Penalties */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">C. Repeated Cancellation Consequences</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Party</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Threshold</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Consequence</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">User</td>
                  <td className="border border-gray-200 px-4 py-2">[X] cancellations in [Y] days</td>
                  <td className="border border-gray-200 px-4 py-2">Warning issued</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">User</td>
                  <td className="border border-gray-200 px-4 py-2">Continued pattern</td>
                  <td className="border border-gray-200 px-4 py-2">Temporary account restriction</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Worker</td>
                  <td className="border border-gray-200 px-4 py-2">[X] cancellations in [Y] days</td>
                  <td className="border border-gray-200 px-4 py-2">Rating reduction, deprioritised in matching</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">Worker</td>
                  <td className="border border-gray-200 px-4 py-2">Continued pattern</td>
                  <td className="border border-gray-200 px-4 py-2">Account suspension</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">D. Contact for Cancellation Issues</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Subject:</span> &quot;Cancellation Issue — [Job Reference ID]&quot;</p>
          </div>
        </section>

      </div>
    </div>
  );
}
