import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility | Instantatoz',
  description:
    'Instantatoz is committed to making its website accessible to all users. Learn about our accessibility standards and how to report issues.',
};

const LAST_UPDATED = '10 August 2026';

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Legal</span>
        <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">Accessibility</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Our Commitment</h2>
          <p>
            Instantatoz is committed to ensuring its website (instantatoz.online) and digital products are accessible to people with disabilities and to all users regardless of device, browser, or assistive technology. We aim to meet widely recognised accessibility standards and continuously improve the usability of our platform.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Standards We Aim to Follow</h2>
          <p>
            We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> where possible. These guidelines explain how to make web content more accessible to people with disabilities, including visual, auditory, physical, speech, cognitive, and neurological disabilities.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Semantic HTML structure with appropriate heading hierarchy</li>
            <li>Descriptive alt text for images and icons where applicable</li>
            <li>ARIA labels on interactive elements and buttons</li>
            <li>Sufficient colour contrast ratios for text and UI elements</li>
            <li>Keyboard-navigable interface elements</li>
            <li>Responsive design that adapts to different screen sizes and zoom levels</li>
            <li>Legible font sizes and line heights</li>
          </ul>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Known Limitations</h2>
          <p>
            We acknowledge that some parts of the website and mobile applications may not yet fully meet accessibility standards. We are actively working to identify and address accessibility issues as the platform is developed. If you encounter a specific accessibility barrier, please report it to us.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Report an Accessibility Issue</h2>
          <p className="mb-2">
            If you experience any accessibility barriers while using the Instantatoz website or apps, we would like to hear from you. Please contact us with:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A description of the barrier you encountered</li>
            <li>The specific page URL or section of the app</li>
            <li>The assistive technology you are using (if applicable)</li>
            <li>Your contact details so we can follow up</li>
          </ul>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p><strong>Email:</strong>{' '}
              <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
                support@instantatoz.online
              </a>
            </p>
            <p className="text-xs text-blue-700 mt-1">Subject line: "Accessibility Issue"</p>
            <p className="text-xs text-blue-700 mt-1">We will acknowledge your report within 48 hours and aim to resolve identified issues as part of our development roadmap.</p>
          </div>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Alternative Formats</h2>
          <p>
            If you require any information on this website in an alternative format, please email us at support@instantatoz.online. We will do our best to provide the information in a suitable format.
          </p>
        </section>

        <section>
          <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-3">Ongoing Improvement</h2>
          <p>
            Accessibility is an ongoing effort. We regularly review our platform with accessibility in mind and incorporate feedback from users. We are committed to making Instantatoz accessible and usable for everyone.
          </p>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <Link href="/contact-us" className="text-blue-600 text-sm hover:underline">Contact Us</Link>
          <Link href="/privacy-policy" className="text-blue-600 text-sm hover:underline">Privacy Policy</Link>
          <Link href="/grievance-redressal" className="text-blue-600 text-sm hover:underline">Grievance Redressal</Link>
        </div>
      </div>
    </div>
  );
}
