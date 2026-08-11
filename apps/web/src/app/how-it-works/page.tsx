import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'How It Works | Instantatoz',
  description:
    'Learn how Instantatoz connects customers and workers through a transparent, OTP-verified, hourly billing process.',
};

export default function HowItWorksPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Simple Process
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How Instantatoz Works
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A transparent, OTP-protected, hourly-based process connecting customers and workers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* For Customers */}
        <div className="mb-20">
          <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-10 text-center">
            For Customers — Finding a Worker
          </h2>
          <div className="space-y-5 max-w-3xl mx-auto">
            {[
              { step: 1, title: 'Log In / Register', desc: 'Open the Instantatoz User App, enter your mobile number and verify with OTP.', icon: '📱' },
              { step: 2, title: 'Allow Location', desc: 'Grant location permission so the app can find workers near you. Your location is used only for job matching.', icon: '📍' },
              { step: 3, title: 'Select Service Category', desc: 'Choose from 12+ main categories and relevant subcategories that match your requirement.', icon: '🗂️' },
              { step: 4, title: 'Enter Job Details', desc: 'Specify: number of workers needed, expected hours, preferred start time, job address, and a brief description.', icon: '📋' },
              { step: 5, title: 'Review Estimated Cost', desc: 'The app shows an estimated cost based on the category rate, hours, and number of workers. Review before confirming.', icon: '💰' },
              { step: 6, title: 'Confirm & Post Job', desc: 'Confirm the job. The system immediately searches for eligible workers within the configured radius.', icon: '✅' },
              { step: 7, title: 'Workers Are Notified', desc: 'Nearby verified workers with the correct category and skills receive a job notification with key details.', icon: '🔔' },
              { step: 8, title: 'Worker Accepts', desc: 'A worker accepts the job. You are notified. The worker navigates to your location.', icon: '👷' },
              { step: 9, title: 'Worker Arrives', desc: 'The worker arrives at your location. You can track their arrival status in the app.', icon: '🗺️' },
              { step: 10, title: 'OTP Verification', desc: 'The app generates a work-start OTP. Share it with the worker. After OTP entry, the server-side work timer begins.', icon: '🔐' },
              { step: 11, title: 'Work in Progress', desc: 'The work is performed. The timer runs on the server, not the device, preventing manipulation.', icon: '⏱️' },
              { step: 12, title: 'Work Completed & Payment', desc: 'Mark work as complete. The final bill is calculated based on actual billable hours. Proceed to payment.', icon: '💳' },
              { step: 13, title: 'Rate the Worker', desc: 'Rate the worker and leave a review to help maintain quality and accountability on the platform.', icon: '⭐' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center font-bold text-blue-700 text-sm">
                    {item.step}
                  </div>
                  {item.step < 13 && <div className="w-0.5 h-5 bg-blue-100 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <h3 className="font-jakarta font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For Workers */}
        <div className="mb-20 bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-10 text-center">
            For Workers — Earning on Instantatoz
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { step: 1, title: 'Register via OTP', desc: 'Install the Worker App and register with your mobile number.', icon: '📱' },
              { step: 2, title: 'Complete Profile', desc: 'Add personal details, category, skills, hourly rate, and documents.', icon: '📝' },
              { step: 3, title: 'Verification', desc: 'Submit required identity documents. Wait for verification and activation.', icon: '✅' },
              { step: 4, title: 'Go Online', desc: 'When available for work, tap "Go Online" in the Worker App.', icon: '🟢' },
              { step: 5, title: 'Receive Job Notification', desc: 'Nearby matching jobs send you a notification with key details and estimated earnings.', icon: '🔔' },
              { step: 6, title: 'Accept or Decline', desc: 'Review the job and accept if it suits you. You have a limited response window.', icon: '👍' },
              { step: 7, title: 'Navigate to Location', desc: 'Use the navigation feature to reach the job location on time.', icon: '🗺️' },
              { step: 8, title: 'OTP Verification', desc: 'Enter the OTP provided by the customer. Work timer starts after successful verification.', icon: '🔐' },
              { step: 9, title: 'Perform Work', desc: 'Complete the assigned work professionally and safely.', icon: '🛠️' },
              { step: 10, title: 'Work Completed', desc: 'The customer marks completion. Billable hours are recorded.', icon: '✅' },
              { step: 11, title: 'Earnings Recorded', desc: 'Your earnings (after platform commission) are added to your payout ledger.', icon: '💰' },
              { step: 12, title: 'Payout', desc: 'Payouts are processed according to the platform schedule to your bank/UPI.', icon: '🏦' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold text-emerald-600">STEP {item.step}</span>
                </div>
                <h3 className="font-jakarta font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key mechanics */}
        <div className="mb-14">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-8 text-center">Key Mechanics</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card-premium p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-2">🔐 OTP-Based Work Start</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The work session starts only after the customer shares a valid OTP with the worker and the worker enters it in the Worker App.
                The start timestamp is recorded on the server, not the device.
              </p>
            </div>
            <div className="card-premium p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-2">⏱️ Server-Controlled Timer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The work timer runs on the Instantatoz server. Changing the device clock has no effect on billing.
                This ensures fair and accurate billing for both parties.
              </p>
            </div>
            <div className="card-premium p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-2">📍 Location-Based Matching</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Only verified workers within the configured radius who are online and available, and who match the
                correct category and skill, are notified for each job.
              </p>
            </div>
            <div className="card-premium p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-2">💰 Transparent Billing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The final bill is based on the actual server-recorded hours. Platform charges, if any, are clearly shown.
                Workers receive their payable amount after commission deduction.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Have questions about the process?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/faq" className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors">
              View FAQ
            </Link>
            <Link href="/contact-us" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
