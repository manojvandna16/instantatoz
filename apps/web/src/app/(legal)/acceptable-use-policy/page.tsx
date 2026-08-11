import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Instantatoz',
  description:
    'Instantatoz Acceptable Use Policy — what users and workers are permitted and not permitted to do on the platform.',
};

const LAST_UPDATED = '10 August 2026';

export default function AcceptableUsePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">
          Acceptable Use Policy
        </h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800">
        This Acceptable Use Policy ("AUP") governs how you may use the Instantatoz platform. It supplements and must be read alongside the Terms and Conditions, User Terms, and Worker Terms. Violations may result in account suspension or termination.
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">1. Permitted Uses</h2>
          <p className="mb-2">You may use the Instantatoz platform to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post legitimate job requirements within the available service categories</li>
            <li>Register as a worker in categories where you have genuine skills and experience</li>
            <li>Accept jobs that match your registered category and skill set</li>
            <li>Communicate with the platform support team for genuine issues</li>
            <li>Rate and review jobs or workers honestly and accurately</li>
            <li>Access and manage your account, job history, and earnings/payment information</li>
          </ul>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">2. Prohibited Uses</h2>
          <p className="mb-2">You must not use the Instantatoz platform to:</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.1 Illegal Activities</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post or accept jobs that involve illegal activities under Indian law</li>
                <li>Facilitate money laundering, fraud, or financial crime through the platform</li>
                <li>Impersonate any person, organisation, or authority</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.2 Fraudulent Activity</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create fake accounts, duplicate registrations, or false worker profiles</li>
                <li>Submit fraudulent documents, false identity information, or forged credentials</li>
                <li>Manipulate the OTP system to misrepresent work start or end times</li>
                <li>Submit false reviews, ratings, or dispute claims</li>
                <li>Solicit or offer off-platform work after a connection is made through Instantatoz</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.3 Harmful or Abusive Behaviour</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Harass, threaten, abuse, or intimidate any user, worker, or platform staff</li>
                <li>Use discriminatory language based on religion, caste, gender, sexual orientation, disability, or ethnicity</li>
                <li>Engage in sexual harassment or any form of physical misconduct during a job</li>
                <li>Post threatening, obscene, or hateful content on the platform</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.4 Platform Integrity</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reverse-engineer, decompile, or attempt to extract the source code of the app or website</li>
                <li>Use automated bots, scripts, or crawlers to access the platform without authorisation</li>
                <li>Attempt to gain unauthorised access to any part of the platform or another user's account</li>
                <li>Interfere with or disrupt the platform's servers, networks, or infrastructure</li>
                <li>Introduce malware, viruses, or any harmful code into the platform</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">2.5 Intellectual Property</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Instantatoz name, logo, or branding without prior written authorisation</li>
                <li>Reproduce, copy, or redistribute platform content without permission</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">3. Reporting Violations</h2>
          <p>
            If you encounter content or behaviour that violates this Acceptable Use Policy, report it to{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
              support@instantatoz.online
            </a>{' '}
            with the subject line "AUP Violation Report". Provide relevant details, screenshots, and job or user IDs where applicable.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">4. Consequences of Violations</h2>
          <p>
            Instantatoz reserves the right to take appropriate action against violations, including but not limited to: issuing a warning, temporarily suspending the account, permanently terminating the account, recovering any damages, or reporting the matter to law enforcement as required by applicable Indian law.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">5. Updates to This Policy</h2>
          <p>
            This policy may be updated periodically. Continued use of the platform after any update constitutes acceptance of the revised policy.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/terms-and-conditions" className="text-blue-600 text-sm hover:underline">Terms & Conditions</Link>
          <Link href="/community-guidelines" className="text-blue-600 text-sm hover:underline">Community Guidelines</Link>
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
