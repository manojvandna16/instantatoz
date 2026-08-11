import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Instantatoz',
  description:
    'Learn how Instantatoz collects, uses, stores, and protects your personal data in accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act.',
};

const LAST_UPDATED = '10 August 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This Privacy Policy should be
          reviewed by qualified legal counsel before relying upon it. This document is subject to
          the Information Technology Act, 2000, the Information Technology (Reasonable Security
          Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and
          the Digital Personal Data Protection Act, 2023 (DPDP Act) to the extent applicable.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        {/* Intro */}
        <section>
          <p className="text-gray-700 leading-relaxed">
            {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to
            protecting the privacy and security of your personal data. This Privacy Policy explains
            what information we collect, how we use it, with whom we share it, and your rights in
            relation to your personal data. By accessing or using the Platform, you acknowledge
            that you have read and understood this Privacy Policy.
          </p>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-semibold">
              We do not sell your personal data to third parties. Your data is used solely for the
              purpose of operating, improving, and securing the Instantatoz Platform.
            </p>
          </div>
        </section>

        {/* 1. Data Collected */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Data We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We collect the following categories of personal data:
          </p>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.1 Identity and Contact Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>Mobile phone number (used as primary identifier and for OTP authentication)</li>
            <li>Full name</li>
            <li>Email address (optional, for communication)</li>
            <li>Profile photograph</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.2 Location Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>GPS-based real-time location (collected when the app is in use, for matching and navigation)</li>
            <li>Saved addresses (home, work, or job site addresses entered by the User)</li>
            <li>Approximate location derived from IP address</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.3 Device and Technical Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>Device model, operating system version, and device identifiers</li>
            <li>App version and session data</li>
            <li>IP address, browser type, and access timestamps</li>
            <li>Firebase Cloud Messaging (FCM) tokens for push notifications</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.4 Worker-Specific Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>Government-issued identity documents (Aadhaar card number, PAN card — subject to applicable law)</li>
            <li>Skill categories and self-declared experience</li>
            <li>Bank account or UPI details for payout purposes</li>
            <li>Verification status and history</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.5 Transaction and Payment Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6 mb-4">
            <li>Payment method type (UPI, card, net banking, wallet — not raw card numbers)</li>
            <li>Transaction ID, payment status, and amount</li>
            <li>Order history and job records</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">1.6 Usage Data</h3>
          <ul className="space-y-1 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>In-app actions, feature interactions, and search history</li>
            <li>Ratings and reviews submitted</li>
            <li>Support queries and communications with us</li>
          </ul>
        </section>

        {/* 2. How We Use Data */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Data</h2>
          <p className="text-gray-700 leading-relaxed mb-3">We use your personal data to:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Create and manage your Account and verify your identity via OTP authentication.</li>
            <li>Match job requests from Users with available, verified Workers nearby using GPS location data and Google Maps APIs.</li>
            <li>Process payments and disburse payouts to Workers through our integrated payment gateway.</li>
            <li>Send notifications, alerts, and status updates via Firebase Cloud Messaging (FCM).</li>
            <li>Verify Worker documents and manage their verification status on the Platform.</li>
            <li>Resolve disputes, investigate complaints, and enforce our Terms and Conditions.</li>
            <li>Improve our Platform through analytics (Firebase Analytics, Crashlytics).</li>
            <li>Comply with legal obligations, respond to lawful requests from courts or government authorities, and prevent fraud.</li>
            <li>Communicate important policy changes, security updates, or service announcements.</li>
          </ul>
        </section>

        {/* 3. Firebase */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Firebase Services</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We use Google Firebase, a platform provided by Google LLC, for the following purposes:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li><span className="font-semibold">Firebase Authentication:</span> OTP-based mobile number verification and session management.</li>
            <li><span className="font-semibold">Cloud Firestore:</span> Real-time database for storing user profiles, job data, and platform activity.</li>
            <li><span className="font-semibold">Firebase Storage:</span> Secure storage of Worker identity documents and profile photographs.</li>
            <li><span className="font-semibold">Firebase Cloud Messaging (FCM):</span> Push notifications for job updates, confirmations, and alerts.</li>
            <li><span className="font-semibold">Firebase Analytics and Crashlytics:</span> Aggregated, anonymised analytics for improving app performance and stability.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Data processed through Firebase is subject to Google&apos;s Privacy Policy (available at{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              policies.google.com/privacy
            </a>
            ). Firebase infrastructure may process data on servers outside India. We take
            contractual measures to ensure appropriate data protection standards are maintained.
          </p>
        </section>

        {/* 4. Google Maps */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Google Maps</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the Google Maps Platform APIs to display maps, enable location-based job
            matching, and provide navigation guidance to Workers. Your location data shared with
            Google Maps is subject to Google&apos;s Terms of Service and Privacy Policy. We use this
            data solely for service functionality and do not independently store location traces
            beyond what is required for active Jobs.
          </p>
        </section>

        {/* 5. Payment Providers */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payment Providers</h2>
          <p className="text-gray-700 leading-relaxed">
            Payments are processed through third-party payment gateways integrated with the
            Platform. These providers handle sensitive financial data (card numbers, bank account
            details) directly and are compliant with applicable Payment Card Industry Data Security
            Standards (PCI DSS). Instantatoz does not store raw card numbers, CVVs, or full bank
            account details on its servers. We store only tokenised payment references and
            transaction metadata necessary for order management and dispute resolution.
          </p>
        </section>

        {/* 6. Data Sharing */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We share your personal data only in the following circumstances:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li><span className="font-semibold">Between Users and Workers:</span> Limited profile information (name, photo, rating, general location) is shared between matched parties to facilitate the Job.</li>
            <li><span className="font-semibold">Service Providers:</span> We share data with trusted third-party service providers (Firebase, Google Maps, payment gateways) who act as data processors under our instructions.</li>
            <li><span className="font-semibold">Legal Compliance:</span> We may disclose your data to law enforcement, courts, or regulatory authorities in response to lawful orders or to protect the legal rights of the Company.</li>
            <li><span className="font-semibold">Business Transfers:</span> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity, subject to equivalent privacy protections.</li>
          </ul>
        </section>

        {/* 7. Data Retention */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your personal data for as long as your Account is active or as needed to
            provide services, comply with legal obligations, resolve disputes, and enforce
            agreements. Worker verification documents are retained for a minimum period required
            by Applicable Law. Upon account deletion, we will delete or anonymise personal data
            within a reasonable period, except where retention is required by law (e.g., financial
            records, tax records under the Income Tax Act, 1961).
          </p>
        </section>

        {/* 8. User Rights */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Subject to Applicable Law, including the DPDP Act, you have the following rights:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li><span className="font-semibold">Right to Access:</span> Request a copy of the personal data we hold about you.</li>
            <li><span className="font-semibold">Right to Correction:</span> Request correction of inaccurate or incomplete personal data.</li>
            <li><span className="font-semibold">Right to Erasure:</span> Request deletion of your personal data, subject to our legal retention obligations.</li>
            <li><span className="font-semibold">Right to Grievance Redressal:</span> File a complaint with our Grievance Officer (see Grievance Redressal Policy).</li>
            <li><span className="font-semibold">Right to Consent Withdrawal:</span> Withdraw consent for processing where consent is the legal basis. This may affect your ability to use the Platform.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            To exercise these rights, write to us at{' '}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
              {siteConfig.supportEmail}
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        {/* 9. Deletion */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Account and Data Deletion Requests</h2>
          <p className="text-gray-700 leading-relaxed">
            You may request deletion of your Account and associated personal data by contacting us
            at {siteConfig.supportEmail} with the subject line &quot;Data Deletion Request&quot;. We will
            process your request within 30 days of receipt, subject to legal retention requirements.
            Please note that deletion of your Account may render ongoing disputes or pending
            transactions irresolvable, for which the Company shall bear no liability.
          </p>
        </section>

        {/* 10. Security */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement commercially reasonable technical and organisational measures to protect
            your personal data against unauthorised access, alteration, disclosure, or destruction.
            These include encryption in transit (TLS/HTTPS), Firebase security rules, access
            controls, and regular security reviews. However, no method of transmission over the
            internet is 100% secure. You are responsible for maintaining the security of your
            Account credentials and OTPs.
          </p>
        </section>

        {/* 11. Governing Law */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            This Privacy Policy is governed by the laws of India, including the Information
            Technology Act, 2000, the IT (Amendment) Act, 2008, the Information Technology
            (Reasonable Security Practices and Procedures and Sensitive Personal Data or
            Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (DPDP Act)
            to the extent it is notified and applicable. Any disputes shall be subject to the
            exclusive jurisdiction of courts in Bengaluru, Karnataka.
          </p>
        </section>

        {/* 12. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact and Grievance Officer</h2>
          <p className="text-gray-700 leading-relaxed">
            For privacy-related queries, complaints, or requests, please contact:
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p><span className="font-semibold">Platform:</span> {siteConfig.name}</p>
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
            <p><span className="font-semibold">Grievance Officer:</span> See{' '}
              <a href="/grievance-redressal" className="text-orange-600 hover:underline">
                Grievance Redressal Policy
              </a>
            </p>
            <p><span className="font-semibold">Response Time:</span> Within 30 days of receipt</p>
          </div>
        </section>

      </div>
    </div>
  );
}
