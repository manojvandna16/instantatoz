import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Grievance Redressal | Instantatoz',
  description:
    'File a formal grievance with Instantatoz. Our Grievance Redressal mechanism ensures complaints are addressed within 30 days as required by applicable Indian law.',
};

const LAST_UPDATED = '10 August 2026';

export default function GrievanceRedressalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">
          Grievance Redressal
        </h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800">
        This Grievance Redressal Policy is provided in accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and other applicable Indian laws. Users are encouraged to seek independent legal advice for matters requiring formal legal action.
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">1. Scope</h2>
          <p>
            This policy applies to all users (customers) and workers registered on the Instantatoz platform. If you have a complaint, concern, or grievance regarding the platform's services, conduct of another user or worker, content on the platform, or any other matter, you may use this mechanism to seek redressal.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">2. Grievance Officer</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-2">
            <p><span className="font-semibold text-gray-900">Name:</span> [To be appointed — details will be published upon finalisation]</p>
            <p><span className="font-semibold text-gray-900">Email:</span>{' '}
              <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
                support@instantatoz.online
              </a>
            </p>
            <p><span className="font-semibold text-gray-900">Business Address:</span> [To be updated upon business registration completion]</p>
            <p><span className="font-semibold text-gray-900">Available:</span> Monday to Saturday, 9:00 AM – 6:00 PM IST (excluding public holidays)</p>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            As required under Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021, the Grievance Officer's name and contact details will be prominently published on this page and updated as applicable.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">3. How to File a Grievance</h2>
          <p className="mb-3">To file a formal grievance, please email the Grievance Officer with the following information:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Your full name and registered mobile number / email address</li>
            <li>Nature of the grievance (e.g., job dispute, payment issue, worker misconduct, data privacy, content complaint)</li>
            <li>Relevant job ID, transaction ID, or date and time of the incident</li>
            <li>Description of the issue and steps already taken (if any)</li>
            <li>Supporting evidence (screenshots, documents) if available</li>
            <li>The resolution you are seeking</li>
          </ol>
          <p className="mt-3">
            Email subject line should read: <span className="font-semibold">"Formal Grievance – [Brief Description]"</span>
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">4. Response Timeline</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p><span className="font-semibold text-blue-900">Acknowledgement:</span> Within 24–48 hours of receiving a valid grievance.</p>
            <p><span className="font-semibold text-blue-900">Resolution:</span> We aim to resolve grievances within <strong>30 calendar days</strong> of receipt, as required under applicable Indian law.</p>
            <p className="text-xs text-blue-700">Complex disputes or those requiring third-party verification may take longer. We will communicate delays proactively.</p>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">5. Types of Grievances Covered</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Job disputes (worker no-show, incomplete work, OTP fraud)</li>
            <li>Payment or billing disputes</li>
            <li>Worker misconduct or safety complaints</li>
            <li>Refund grievances not resolved through support</li>
            <li>Account suspension or termination disputes</li>
            <li>Privacy or data-related complaints</li>
            <li>Platform content or policy complaints</li>
            <li>Any other matter relating to the Instantatoz platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">6. Escalation</h2>
          <p>
            If you are not satisfied with the resolution provided by the Grievance Officer within 30 days, you may escalate the matter to relevant statutory authorities as per applicable Indian law, including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Consumer disputes: National Consumer Helpline or consumer courts</li>
            <li>Data-related complaints: Relevant data protection authority under applicable law</li>
            <li>Other matters: Appropriate civil courts in India</li>
          </ul>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">7. Good Faith</h2>
          <p>
            Instantatoz is committed to handling all grievances in good faith, fairly, and without undue delay. Users are also expected to file grievances in good faith and not for frivolous or vexatious purposes.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/privacy-policy" className="text-blue-600 text-sm hover:underline">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="text-blue-600 text-sm hover:underline">Terms & Conditions</Link>
          <Link href="/support" className="text-blue-600 text-sm hover:underline">Support Centre</Link>
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
