import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Worker Terms | Instantatoz',
  description:
    'Terms and conditions specific to Workers registered on the Instantatoz platform, covering eligibility, verification, billing, payouts, and conduct.',
};

const LAST_UPDATED = '10 August 2026';

export default function WorkerTermsPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Terms</h1>
        <p className="text-sm text-gray-500">
          Applicable to Workers / Service Providers registered on the Instantatoz Platform
        </p>
        <p className="text-sm text-gray-400 mt-1">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> These Worker Terms form part of our
          overall Terms and Conditions and the Worker Verification Policy. We strongly recommend
          that all Workers review this document with qualified legal counsel. By registering as a
          Worker, you confirm acceptance of these terms.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-700 leading-relaxed">
            These Worker Terms govern the specific rights, obligations, and responsibilities of
            individuals who register on the Instantatoz Platform as Workers (also referred to as
            &quot;Service Providers&quot;). These terms must be read in conjunction with the general Terms
            and Conditions and the Worker Verification Policy. Workers are independent contractors
            and not employees of Instantatoz.
          </p>
        </section>

        {/* 1. Registration */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Registration</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To register as a Worker on the Platform, you must:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Be at least 18 years of age.</li>
            <li>Possess a valid mobile number linked to an Indian SIM card for OTP verification.</li>
            <li>Complete the Worker registration form accurately with your name, photograph, and skill categories.</li>
            <li>Submit the required identity and verification documents as specified in the Worker Verification Policy.</li>
            <li>Provide valid bank account or UPI details for receiving payouts.</li>
          </ul>
        </section>

        {/* 2. Eligibility */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            You are eligible to register as a Worker only if:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>You are a citizen or legal resident of India with the right to work.</li>
            <li>You are not currently banned or suspended from the Platform.</li>
            <li>You have not been convicted of a criminal offence that would make you unsuitable to work with members of the public (disclosure is required).</li>
            <li>You have the physical capability and appropriate skills to perform the services in your selected categories.</li>
            <li>You agree to maintain your profile, availability status, and skill details accurately and up to date.</li>
          </ul>
        </section>

        {/* 3. Verification */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Verification Process</h2>
          <p className="text-gray-700 leading-relaxed">
            All Workers must undergo the verification process described in our{' '}
            <a href="/worker-verification-policy" className="text-orange-600 hover:underline">
              Worker Verification Policy
            </a>
            . Your Account will be activated and set to &quot;VERIFIED&quot; status only after successful
            completion of the verification review. Until verified, you will not be eligible to
            accept Jobs on the Platform. Verification does not constitute a guarantee or
            endorsement by Instantatoz of your skills or conduct.
          </p>
        </section>

        {/* 4. Skills and Availability */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Skills and Availability</h2>
          <p className="text-gray-700 leading-relaxed mb-3">You are responsible for:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Accurately selecting and updating the skill categories and subcategories in which you are competent to provide services.</li>
            <li>Keeping your availability status current on the Platform to ensure Users are not matched with unavailable Workers.</li>
            <li>Not accepting Jobs in categories for which you are not trained, qualified, or experienced.</li>
            <li>Informing the Platform of any changes in your circumstances that may affect your eligibility or ability to perform certain services.</li>
          </ul>
        </section>

        {/* 5. Job Acceptance */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Job Acceptance and Conduct</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            When you accept a Job request:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>You commit to arriving at the specified work location within the estimated arrival time shown on the Platform.</li>
            <li>You must wear any required safety or identity identification as requested by the Platform or User.</li>
            <li>You must not accept Jobs while under the influence of alcohol or controlled substances.</li>
            <li>You must treat Users, their families, and their property with courtesy and professionalism at all times.</li>
            <li>Any disputes arising during a Job must be reported to Platform support immediately.</li>
          </ul>
        </section>

        {/* 6. OTP Work Start */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. OTP Work Start</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Billable hours begin only when the User shares a One-Time Password (OTP) with you
            at the work site and you enter it into the Platform. You acknowledge that:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>You must not request, solicit, or coerce the User into sharing the OTP before physically arriving at the work site.</li>
            <li>Entering a fraudulent or estimated OTP is a serious violation and will result in immediate account suspension.</li>
            <li>The OTP Work Start timestamp is the definitive record of your work commencement and will be used for all billing calculations.</li>
          </ul>
        </section>

        {/* 7. Hourly Billing and Payout */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Hourly Billing and Payout</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your earnings are calculated as follows:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Earnings are based on the number of hours tracked from OTP Work Start to Work End, multiplied by the applicable category hourly rate.</li>
            <li>The platform commission is deducted from your gross earnings before payout.</li>
            <li>Payouts are disbursed to your registered bank account or UPI ID within the payout cycle specified in the Platform (subject to change upon notice).</li>
            <li>Instantatoz is not responsible for delays caused by incorrect bank or UPI details provided by you.</li>
          </ul>
        </section>

        {/* 8. Commission */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Platform Commission</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree to the platform commission rate applicable to your service category, which
            is displayed during registration and may be revised upon 30 days&apos; prior notice. The
            commission covers the cost of platform technology, matching, payment processing,
            insurance (if applicable), and support. The commission is non-negotiable and applies
            to all Jobs completed through the Platform. Any attempt to circumvent the commission
            by transacting directly with Users outside the Platform is a serious breach of these
            Terms and may result in permanent account termination.
          </p>
        </section>

        {/* 9. Cancellation and No-Show */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cancellation and No-Show Penalties</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            As a Worker, you are expected to honour accepted Job requests. The following penalties
            apply:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li><span className="font-semibold">Cancellation after acceptance:</span> Reduces your reliability rating and may affect future job allocation.</li>
            <li><span className="font-semibold">No-show (failure to arrive without cancellation):</span> Results in an automatic negative rating, and repeated no-shows may lead to account suspension.</li>
            <li><span className="font-semibold">Repeated cancellations:</span> More than [X] cancellations within [Y] days may result in temporary restriction of job acceptance privileges.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Cancellations due to genuine emergencies should be reported to support at{' '}
            {siteConfig.supportEmail} with supporting information. The Company may review and
            waive penalties on a case-by-case basis.
          </p>
        </section>

        {/* 10. Ratings */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Ratings and Performance</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your performance on the Platform is measured by:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>User ratings (1–5 stars) after each completed Job.</li>
            <li>Acceptance rate (proportion of job requests accepted vs. received).</li>
            <li>Completion rate (proportion of accepted Jobs completed without cancellation or dispute).</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Workers with consistently low ratings or high cancellation rates may have their job
            allocation limited, be placed under review, or have their Account suspended.
          </p>
        </section>

        {/* 11. Suspension */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">11. Suspension and Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            Your Worker Account may be suspended or permanently terminated for: violations of
            these Terms, verified User complaints of misconduct, fraudulent OTP entry, criminal
            activity, providing false verification documents, or sustained poor performance. In
            case of suspension, all pending payouts for completed Jobs will be processed. Payouts
            for disputed Jobs will be held pending resolution.
          </p>
        </section>

        {/* 12. Tax Responsibilities */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">12. Tax Responsibilities</h2>
          <p className="text-gray-700 leading-relaxed">
            Workers are independent contractors and are solely responsible for their own tax
            obligations, including income tax under the Income Tax Act, 1961, and any applicable
            GST obligations where applicable. Instantatoz may issue TDS (Tax Deducted at Source)
            certificates as required under Indian tax law. The Company will not provide tax advice
            and recommends that Workers consult a qualified chartered accountant for guidance on
            their tax obligations arising from income earned through the Platform.
          </p>
        </section>

        {/* 13. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact and Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For queries related to these Worker Terms, contact us at:
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Response Time:</span> Within 24–48 business hours</p>
          </div>
        </section>

      </div>
    </div>
  );
}
