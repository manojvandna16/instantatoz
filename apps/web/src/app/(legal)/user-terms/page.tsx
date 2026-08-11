import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'User Terms | Instantatoz',
  description:
    'Specific terms and conditions for customers using the Instantatoz platform to post jobs, hire workers, and manage payments.',
};

const LAST_UPDATED = '10 August 2026';

export default function UserTermsPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Terms</h1>
        <p className="text-sm text-gray-500">
          Applicable to Customers / Users of the Instantatoz Platform
        </p>
        <p className="text-sm text-gray-400 mt-1">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> These User Terms form part of our
          overall Terms and Conditions. We recommend reviewing this document with qualified legal
          counsel. By using the Platform as a Customer, you agree to these User Terms in addition
          to our general Terms and Conditions.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-700 leading-relaxed">
            These User Terms govern the specific rights and responsibilities of persons who access
            the Instantatoz Platform as Customers (also referred to as &quot;Users&quot;) for the purpose
            of posting job requests and engaging Workers. These terms supplement and must be read
            in conjunction with the general Terms and Conditions available at{' '}
            <a href="/terms-and-conditions" className="text-orange-600 hover:underline">
              /terms-and-conditions
            </a>.
          </p>
        </section>

        {/* 1. Creating Jobs */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Creating a Job Request</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            As a User, you may create a job request by:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Selecting a service category from the available categories on the Platform.</li>
            <li>Specifying the number of hours required, the work location, the preferred date and time, and any specific instructions for the Worker.</li>
            <li>Reviewing the estimated total cost (hourly rate × hours + platform commission) before confirming the request.</li>
            <li>Completing the payment authorisation step as required by the Platform.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            By confirming a job request, you enter into a service agreement with the matched Worker
            and a technology services agreement with Instantatoz. You agree that the job description
            is accurate, lawful, and does not involve any prohibited activity.
          </p>
        </section>

        {/* 2. Matching Process */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. The Matching Process</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Once a job request is confirmed and payment is authorised:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>The Platform algorithm broadcasts the request to eligible, verified Workers in your vicinity.</li>
            <li>Workers may accept or decline the request. The first Worker to accept is matched to your job.</li>
            <li>You will receive a notification with the matched Worker&apos;s name, photograph, rating, and estimated arrival time.</li>
            <li>If no Worker accepts within a specified time, the request may expire and the payment authorisation will be released.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Instantatoz does not guarantee that a Worker will always be available. Availability
            depends on real-time conditions including Worker supply in your area.
          </p>
        </section>

        {/* 3. Cancellation */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cancellation Rules for Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse mt-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Cancellation Stage</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Refund Eligibility</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Before Worker acceptance</td>
                  <td className="border border-gray-200 px-4 py-2">Full refund eligible</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">After acceptance, before Worker arrival</td>
                  <td className="border border-gray-200 px-4 py-2">Partial refund or cancellation fee may apply</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">After Worker arrival but before OTP Work Start</td>
                  <td className="border border-gray-200 px-4 py-2">Cancellation fee applies; refund of balance</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">After OTP Work Start</td>
                  <td className="border border-gray-200 px-4 py-2">No refund for hours worked; dispute required for remaining hours</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            Repeated cancellations after Worker acceptance may result in temporary restrictions
            on your Account. Please refer to the full{' '}
            <a href="/cancellation-policy" className="text-orange-600 hover:underline">
              Cancellation Policy
            </a>{' '}
            for detailed rules.
          </p>
        </section>

        {/* 4. Payment */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payment Obligations</h2>
          <p className="text-gray-700 leading-relaxed mb-3">As a User, you agree to:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Pay for all confirmed Jobs through the Platform&apos;s payment system. Direct cash payments to Workers are strictly prohibited.</li>
            <li>Authorise payment at the time of job creation. Funds may be held in escrow until Job completion.</li>
            <li>Pay for actual hours worked as tracked by the Platform (OTP Work Start to Work End).</li>
            <li>Accept responsibility for any additional hours agreed upon during the Job execution.</li>
            <li>Not share OTPs, CVVs, card numbers, or UPI PINs with any Worker or third party.</li>
          </ul>
        </section>

        {/* 5. Refund Eligibility */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Refund Eligibility</h2>
          <p className="text-gray-700 leading-relaxed">
            Refunds are processed in accordance with our{' '}
            <a href="/refund-policy" className="text-orange-600 hover:underline">
              Refund Policy
            </a>
            . Refunds are generally not available for services that have been rendered through the
            OTP Work Start mechanism. Users may file disputes in cases of Worker misconduct,
            non-arrival, or service not rendered. Disputes are reviewed within 7 working days and
            decisions are communicated via the registered contact details.
          </p>
        </section>

        {/* 6. Rating System */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Rating System</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            After Job completion, Users are encouraged to rate the Worker on a scale of 1 to 5
            stars and provide a written review. Ratings:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Must reflect your genuine experience of the services provided.</li>
            <li>Must not be defamatory, discriminatory, or contain personal attacks.</li>
            <li>Directly affect the Worker&apos;s visibility, ranking, and job eligibility on the Platform.</li>
            <li>Can be reported if you believe a Worker has attempted to manipulate your rating.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            False or manipulated ratings submitted by Users may result in account penalties,
            including suspension.
          </p>
        </section>

        {/* 7. Prohibited Activities */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Prohibited Activities for Users</h2>
          <p className="text-gray-700 leading-relaxed mb-2">As a User, you must not:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Request Workers to perform tasks that are illegal, hazardous without proper safety equipment, or outside the scope of the posted job category.</li>
            <li>Harass, intimidate, or abuse Workers verbally or physically.</li>
            <li>Record Workers without their consent in violation of applicable law.</li>
            <li>Solicit Workers to bypass the Platform for future engagements to avoid platform commission.</li>
            <li>Create fictitious job requests to manipulate Worker availability or Platform algorithms.</li>
            <li>Engage Workers in activities that involve handling of controlled substances, illegal goods, or activities prohibited under Indian law.</li>
            <li>Misrepresent the nature, location, or duration of work to a Worker.</li>
          </ul>
        </section>

        {/* 8. Safety Guidelines */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Safety Guidelines for Users</h2>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Ensure that the work site is safe, accessible, and free from conditions that could endanger the Worker.</li>
            <li>Provide Workers with basic amenities (drinking water, restroom access) during their engagement.</li>
            <li>Do not share Work Start OTPs until the Worker has physically arrived at the work site.</li>
            <li>Verify the Worker&apos;s identity against their Platform profile before allowing access to your premises.</li>
            <li>In case of an emergency or safety concern, contact local emergency services (100, 112) immediately before contacting Platform support.</li>
          </ul>
        </section>

        {/* 9. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact and Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For support as a User, contact us at:
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
