import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | Instantatoz',
  description:
    'Learn about the cookies and tracking technologies used on the Instantatoz website and how to manage your cookie preferences.',
};

const LAST_UPDATED = '10 August 2026';

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">Cookie Policy</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800">
        This Cookie Policy explains how Instantatoz uses cookies and similar technologies on its website (instantatoz.online). It does not apply to the mobile applications.
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work correctly, remember your preferences, and provide analytical information to website owners.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">2. Types of Cookies We Use</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">2.1 Essential / Strictly Necessary Cookies</h3>
              <p>These cookies are required for the website to function. They cannot be disabled. Examples include session management and security tokens.</p>
              <p className="text-xs text-gray-500 mt-1">Legal basis: Legitimate interest / technical necessity</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">2.2 Analytics Cookies</h3>
              <p>
                We use <strong>Firebase Analytics</strong> (Google) to understand how visitors interact with our website — including pages visited, time spent, and device/browser type. This data is aggregated and anonymised. No personally identifiable information is linked to analytics data by default.
              </p>
              <p className="text-xs text-gray-500 mt-1">Provider: Google Firebase Analytics | Data: Anonymised usage data | Retention: As per Firebase retention settings</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">2.3 Preference / Functional Cookies</h3>
              <p>These cookies remember your preferences to improve your experience (e.g., language, dark mode preferences). They are only set if such features are active on the website.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">2.4 Third-Party Cookies</h3>
              <p>
                Third-party cookies may be set by embedded services such as Google Analytics, Google Fonts, or Google Maps. These services have their own cookie and privacy policies. Instantatoz does not control third-party cookies.
              </p>
              <p className="text-xs text-gray-500 mt-1">Refer to Google's Privacy Policy: <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">3. We Do Not Use Advertising Cookies</h2>
          <p>
            Instantatoz does not use advertising or marketing tracking cookies. We do not share cookie data with advertising networks or use retargeting technologies.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">4. How to Manage Cookies</h2>
          <p className="mb-3">You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect website functionality.</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1 text-sm">
            <p><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</p>
            <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
            <p><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</p>
            <p><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</p>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            You can also opt out of Google Analytics tracking using the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">5. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. The "Last Updated" date at the top of this page reflects the most recent revision. Continued use of the website after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">6. Contact</h2>
          <p>
            For questions about this Cookie Policy, contact us at{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
              support@instantatoz.online
            </a>.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/privacy-policy" className="text-blue-600 text-sm hover:underline">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="text-blue-600 text-sm hover:underline">Terms & Conditions</Link>
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
