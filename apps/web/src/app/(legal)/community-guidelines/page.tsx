import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Guidelines | Instantatoz',
  description:
    'Instantatoz Community Guidelines for customers and workers — professional conduct, prohibited behaviour, and platform standards.',
};

const LAST_UPDATED = '10 August 2026';

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">
          Community Guidelines
        </h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 text-sm text-blue-800">
        These Community Guidelines apply to all users (customers) and workers on the Instantatoz platform. Violations may result in warnings, temporary suspension, or permanent deactivation of your account, depending on severity.
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">1. Our Community Values</h2>
          <p>
            Instantatoz is built on the principles of trust, transparency, fairness, and mutual respect. Every interaction on the platform — between customers and workers — should reflect these values. We are committed to maintaining a safe, professional, and honest environment for everyone.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">2. Guidelines for Customers</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.1 Respectful Communication</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Treat workers with dignity and professional respect at all times.</li>
                <li>Do not use abusive, offensive, threatening, or discriminatory language.</li>
                <li>Do not harass, intimidate, or demean workers.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.2 Honest Job Posting</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate job details — location, expected hours, and nature of work.</li>
                <li>Do not misrepresent the scope or type of work to attract workers.</li>
                <li>Do not request work that is outside the registered category.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.3 OTP & Payment</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Share the work-start OTP only with the verified, physically present worker at your location.</li>
                <li>Do not withhold OTP to delay billing unfairly.</li>
                <li>Make payments through the platform only. Do not pay workers in cash or off-platform to circumvent fees.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.4 Safety & Legality</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not ask workers to perform illegal, unsafe, or unethical work.</li>
                <li>Ensure the job environment is reasonably safe for the worker.</li>
                <li>Report any safety incidents promptly via the app or support email.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">3. Guidelines for Workers</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">3.1 Professional Conduct</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Treat customers with courtesy and maintain professional behaviour.</li>
                <li>Arrive on time to accepted jobs. Notify promptly if you are delayed.</li>
                <li>Perform only the work you are registered and qualified to do.</li>
                <li>Do not enter premises beyond what is required for the job scope.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">3.2 Honest Representation</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not misrepresent your skills, experience, or qualifications during registration or to customers.</li>
                <li>Do not accept jobs for which you do not have the required skills.</li>
                <li>Do not use another person's profile or identity to register or work.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">3.3 OTP & Timing</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enter the OTP only after physically arriving at the customer's location.</li>
                <li>Do not attempt to manipulate the billing timer or falsify work hours.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">3.4 Payment</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not request payment outside the platform.</li>
                <li>Do not ask customers for additional cash payments beyond the platform-calculated amount.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">3.5 Cancellations</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Only accept jobs you can genuinely complete. Cancel well in advance if unavoidable.</li>
                <li>Excessive cancellations or no-shows may result in rating penalties or suspension.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">4. Prohibited Behaviour (All Users)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Creating multiple accounts for the purpose of fraud or manipulation</li>
            <li>Providing false information, fake reviews, or fabricated disputes</li>
            <li>Engaging in any form of discrimination based on religion, caste, gender, region, or disability</li>
            <li>Sexual harassment, inappropriate physical contact, or any form of assault</li>
            <li>Attempting to solicit work outside the platform after connecting through it</li>
            <li>Any activity that violates applicable Indian law or the rights of other users</li>
            <li>Tampering with platform systems, attempting unauthorized access, or reverse-engineering the app</li>
          </ul>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">5. Enforcement</h2>
          <p>Violations of these Community Guidelines may result in:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>A formal warning</li>
            <li>Temporary suspension of your account</li>
            <li>Permanent deactivation of your account</li>
            <li>Reporting to law enforcement if illegal activity is involved</li>
          </ul>
          <p className="mt-2">The severity of action depends on the nature and seriousness of the violation.</p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">6. Reporting Violations</h2>
          <p>
            If you witness or experience a violation of these guidelines, please report it through the app's Support section or email{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
              support@instantatoz.online
            </a>. Include relevant details, job ID, and any evidence.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/terms-and-conditions" className="text-blue-600 text-sm hover:underline">Terms & Conditions</Link>
          <Link href="/acceptable-use-policy" className="text-blue-600 text-sm hover:underline">Acceptable Use Policy</Link>
          <Link href="/safety" className="text-blue-600 text-sm hover:underline">Safety</Link>
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
