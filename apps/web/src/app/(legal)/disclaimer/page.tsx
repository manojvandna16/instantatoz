import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer | Instantatoz',
  description:
    'Read the Instantatoz disclaimer covering platform scope, limitation of liability, and honest statements about service guarantees.',
};

const LAST_UPDATED = '10 August 2026';

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">Disclaimer</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800">
        Please read this Disclaimer carefully before using the Instantatoz website or platform. By using our services, you acknowledge and accept the terms of this Disclaimer. This document should be reviewed alongside our Terms and Conditions and Privacy Policy.
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">1. Platform as Intermediary</h2>
          <p>
            Instantatoz is a technology platform and online marketplace that facilitates connections between customers seeking short-term or hourly workers and independent service providers ("Workers"). Instantatoz is an intermediary under the Information Technology Act, 2000 and its amendments. It is not an employer, contractor, or principal to the Workers listed on its platform.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">2. No Guaranteed Worker Availability</h2>
          <p>
            Instantatoz does not guarantee the availability of workers at any given time, location, or for any specific category. Worker availability depends on several factors including the number of registered workers in an area, their online status, and their willingness to accept a particular job. The platform matches customers with available workers on a best-effort basis.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">3. No Guaranteed Earnings for Workers</h2>
          <p>
            Instantatoz does not guarantee a minimum income, number of jobs, or earnings for any Worker registered on the platform. Earnings depend on job availability, hours worked, category demand, and other market factors. Workers are independent service providers responsible for their own income and financial planning.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">4. No Government Approval or Affiliation</h2>
          <p>
            Instantatoz does not claim, imply, or represent any government approval, recognition, certification, award, or affiliation unless explicitly documented and verifiable. Any such claims, if found to be false, should be reported to us immediately at support@instantatoz.online.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">5. Worker Verification Disclaimer</h2>
          <p>
            While Instantatoz takes reasonable steps to verify the identity and documents submitted by Workers before activation, it does not guarantee the accuracy of all submitted information, claim universal police verification, or warrant that Workers hold any particular professional qualification unless specifically verified as part of a category-specific process. Verification requirements may vary by category.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">6. Limitation of Liability</h2>
          <p className="mb-2">
            To the fullest extent permitted by applicable Indian law, Instantatoz, its directors, officers, employees, and agents shall not be liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Any direct, indirect, incidental, special, or consequential damages arising from use of the platform</li>
            <li>The quality, safety, or legality of services provided by Workers</li>
            <li>Any disputes between customers and Workers</li>
            <li>Any personal injury, property damage, or financial loss arising from a job</li>
            <li>Worker no-shows, incomplete work, or misconduct</li>
            <li>Platform downtime, technical errors, or loss of data</li>
          </ul>
          <p className="mt-2">
            In all cases, Instantatoz's aggregate liability shall not exceed the amount paid by the customer for the specific job in dispute.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">7. Third-Party Links & Services</h2>
          <p>
            The Instantatoz website and platform may contain links to third-party websites or use third-party services (e.g., Google Maps, payment gateways). Instantatoz is not responsible for the content, privacy practices, or terms of any third-party service. Use of third-party services is at your own risk.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">8. Website Content Accuracy</h2>
          <p>
            We strive to keep information on the Instantatoz website accurate and up to date. However, we do not warrant the completeness, accuracy, or timeliness of any content. Prices, policies, category rates, and platform features are subject to change without notice.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">9. No Legal or Financial Advice</h2>
          <p>
            Content on the Instantatoz website does not constitute legal, financial, tax, or professional advice. Workers and customers should consult appropriate qualified professionals for any such advice relevant to their specific situation.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">10. Governing Law</h2>
          <p>
            This Disclaimer is governed by and construed in accordance with the laws of India. Any disputes arising from or relating to this Disclaimer shall be subject to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/terms-and-conditions" className="text-blue-600 text-sm hover:underline">Terms & Conditions</Link>
          <Link href="/privacy-policy" className="text-blue-600 text-sm hover:underline">Privacy Policy</Link>
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
