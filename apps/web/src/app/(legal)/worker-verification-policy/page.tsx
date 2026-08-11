import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Worker Verification Policy | Instantatoz',
  description:
    'Learn how Instantatoz verifies workers, the documents required, verification statuses, and the review process.',
};

const LAST_UPDATED = '10 August 2026';

const statuses = [
  {
    status: 'PENDING',
    color: 'bg-gray-100 text-gray-700',
    description:
      'The Worker has registered and submitted their application but it has not yet entered the review queue.',
  },
  {
    status: 'UNDER_REVIEW',
    color: 'bg-blue-100 text-blue-700',
    description:
      'The Worker\'s submitted documents are currently being reviewed by the Instantatoz team.',
  },
  {
    status: 'VERIFIED',
    color: 'bg-green-100 text-green-700',
    description:
      'The Worker has passed document review and is eligible to accept Jobs on the Platform.',
  },
  {
    status: 'REJECTED',
    color: 'bg-red-100 text-red-700',
    description:
      'The verification was unsuccessful due to incomplete, inaccurate, or unacceptable documentation. The Worker may reapply after addressing the stated reasons.',
  },
  {
    status: 'SUSPENDED',
    color: 'bg-orange-100 text-orange-700',
    description:
      'The Worker\'s account has been temporarily suspended due to policy violations or pending investigation. Job acceptance is restricted during this period.',
  },
  {
    status: 'BLOCKED',
    color: 'bg-rose-100 text-rose-700',
    description:
      'The Worker\'s account has been permanently blocked due to serious violations, criminal conduct, or repeated policy breaches. This action is generally irreversible.',
  },
];

export default function WorkerVerificationPolicyPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Verification Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This policy should be reviewed with
          qualified legal counsel. Verification requirements may vary by service category, region,
          or regulatory updates.
        </p>
      </div>

      {/* Police verification notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-blue-800 leading-relaxed">
          <span className="font-semibold">Important Disclaimer:</span> Verification requirements
          vary by service category. Instantatoz does not claim universal police verification for
          all Workers. The verification process involves document-based identity checks and does
          not constitute a criminal background clearance. Users are advised to exercise due
          diligence when allowing Workers access to their homes or sensitive premises.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-700 leading-relaxed">
            Instantatoz is committed to building trust and safety on its Platform by ensuring that
            all Workers who are eligible to accept Jobs have undergone a structured verification
            process. This policy describes the registration requirements, document submission
            process, verification criteria, and Worker status classifications.
          </p>
        </section>

        {/* 1. Registration */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Worker Registration</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To begin the verification process, a Worker must:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Download the Instantatoz Worker application and register using a valid Indian mobile number.</li>
            <li>Complete the profile setup including full legal name, profile photograph, and date of birth.</li>
            <li>Select one or more skill categories and subcategories in which they wish to offer services.</li>
            <li>Provide a valid bank account or UPI ID for receiving payouts.</li>
            <li>Read and accept the Worker Terms and Conditions.</li>
          </ul>
        </section>

        {/* 2. Document Submission */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Document Submission</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            All Workers are required to submit the following documents for identity verification:
          </p>

          <h3 className="text-base font-semibold text-gray-800 mb-2">Mandatory Documents (All Categories)</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>Government-issued photo identity proof (Aadhaar card, Voter ID, Driving Licence, or Passport)</li>
            <li>A clear, recent selfie photograph for biometric matching with the identity document</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">Additional Documents (Category-Specific)</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li><span className="font-semibold">Skilled Services</span> (electrician, plumber, etc.): Trade certification or ITI certificate (where available)</li>
            <li><span className="font-semibold">Healthcare Assistance:</span> Relevant nursing or care-giving certificate</li>
            <li><span className="font-semibold">Driving / Delivery:</span> Valid driving licence with applicable vehicle category</li>
            <li><span className="font-semibold">Education / Tutoring:</span> Educational qualification certificates</li>
          </ul>

          <p className="text-gray-700 text-sm leading-relaxed">
            Additional documents may be requested by the review team on a case-by-case basis.
            All documents are stored securely using Firebase Storage and are not shared with Users
            or third parties except as required by law.
          </p>
        </section>

        {/* 3. Review Process */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Verification Review Process</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Upon submission of the required documents, the verification process proceeds as follows:
          </p>
          <ol className="space-y-3 text-gray-700 text-sm leading-relaxed list-decimal pl-6">
            <li>
              <span className="font-semibold">Document Receipt:</span> The Worker&apos;s application
              status changes to &quot;PENDING&quot;.
            </li>
            <li>
              <span className="font-semibold">Document Review:</span> The Instantatoz review team
              examines the submitted documents for authenticity, clarity, and completeness. Status
              changes to &quot;UNDER_REVIEW&quot;.
            </li>
            <li>
              <span className="font-semibold">Verification Decision:</span> If documents are
              satisfactory, the Worker is marked as &quot;VERIFIED&quot; and activated for job acceptance.
              If documents are insufficient or rejected, the Worker is notified with the reason and
              given an opportunity to resubmit.
            </li>
            <li>
              <span className="font-semibold">Ongoing Compliance:</span> Verified Workers are
              expected to maintain accurate profile information. The Company reserves the right to
              re-verify Workers at any time.
            </li>
          </ol>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            The target review timeline is <span className="font-semibold">[X] working days</span>{' '}
            from submission, subject to volume and document quality.
          </p>
        </section>

        {/* 4. Activation Criteria */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Verification Activation Criteria</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A Worker will be activated (status: VERIFIED) only when all of the following
            conditions are met:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>All mandatory and category-specific documents have been submitted and approved.</li>
            <li>The selfie photograph matches the identity document to a satisfactory standard.</li>
            <li>The Worker has accepted the Worker Terms and Conditions.</li>
            <li>A valid payout account (bank or UPI) has been linked.</li>
            <li>No red flags or adverse information has been identified during the review.</li>
          </ul>
        </section>

        {/* 5. Status Definitions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Worker Account Statuses</h2>
          <div className="space-y-3">
            {statuses.map(({ status, color, description }) => (
              <div key={status} className="flex gap-4 items-start border border-gray-100 rounded-xl p-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${color}`}>
                  {status}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Re-verification */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Re-verification and Document Updates</h2>
          <p className="text-gray-700 leading-relaxed">
            Workers must update their documents when their identity document expires, when they
            add a new skill category that requires additional documentation, or when requested by
            the Company. Failure to provide updated documents may result in the Worker&apos;s status
            being changed to PENDING or SUSPENDED until re-verification is complete.
          </p>
        </section>

        {/* 7. Appeal */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Rejection Appeal Process</h2>
          <p className="text-gray-700 leading-relaxed">
            Workers whose verification is rejected may appeal the decision by writing to{' '}
            {siteConfig.supportEmail} with the subject line &quot;Verification Appeal — [Registered
            Mobile Number]&quot;. Appeals should include the original rejection reason, corrected or
            additional documents, and any clarifying information. Appeals will be reviewed within
            [X] working days.
          </p>
        </section>

        {/* 8. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact for Verification Queries</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Subject:</span> &quot;Worker Verification — [Mobile Number]&quot;</p>
            <p><span className="font-semibold">Response Time:</span> Within 48–72 business hours</p>
          </div>
        </section>

      </div>
    </div>
  );
}
