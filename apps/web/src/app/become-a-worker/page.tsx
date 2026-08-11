import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Become a Worker | Instantatoz',
  description:
    'Join Instantatoz as a worker. Register, select your category and skills, complete verification, and start receiving flexible hourly job opportunities near you.',
};

export default function BecomeAWorkerPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
            For Workers
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Flexible Work. On Your Terms.
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Join Instantatoz to find short-term and hourly work opportunities near you. Choose your availability, select your category, and receive job notifications when you are online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold opacity-60 cursor-not-allowed">
              Worker App Registration — Coming Soon
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">
            Worker registration will be available through the Instantatoz Worker App after launch.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Who can join */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-3">Who Can Join as a Worker?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Instantatoz welcomes workers from a variety of backgrounds and skill levels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Age Requirement', desc: 'Must be 18 years of age or older (subject to applicable law).', icon: '👤' },
              { title: 'Indian Resident', desc: 'Must be a resident of India with a valid mobile number for OTP verification.', icon: '🇮🇳' },
              { title: 'Relevant Skills', desc: 'Must have genuine skills or experience in the selected category.', icon: '🛠️' },
              { title: 'Valid Documents', desc: 'Must provide government-issued identity documents as required during registration.', icon: '📄' },
              { title: 'Smartphone', desc: 'Must have a smartphone with internet access to use the Instantatoz Worker App.', icon: '📱' },
              { title: 'Compliance', desc: 'Must comply with applicable laws, platform terms, and worker conduct rules.', icon: '✅' },
            ].map((item) => (
              <div key={item.title} className="card-premium p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-jakarta font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration steps */}
        <div className="mb-16 bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-3">How Registration Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'Enter mobile number and verify with OTP',
              'Fill in personal details and upload profile photo',
              'Select your main service category',
              'Choose subcategories and skills',
              'Enter availability and expected hourly rate',
              'Upload required identity documents',
              'Provide bank account or UPI payout details',
              'Accept Worker Terms & Conditions',
              'Wait for verification review',
              'Receive activation notification',
              'Go online and start receiving job notifications',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Earnings section */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-4">How Earnings Work</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  Workers on Instantatoz are paid on an hourly basis for the work they perform. The work timer starts
                  only after successful OTP verification and runs on the server.
                </p>
                <p>
                  After the job is completed, the system calculates your earnings based on the billable hours recorded.
                  A platform commission is deducted, and the remaining amount is credited to your payout ledger.
                </p>
                <p>
                  Payouts are processed through the platform&apos;s approved payout mechanism. Details will be visible in
                  your Worker App dashboard.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Pay Basis', value: 'Per hour worked (server-verified)', icon: '⏱️' },
                { label: 'Work Start', value: 'Only after OTP verification', icon: '🔐' },
                { label: 'Platform Commission', value: 'Deducted from job amount (disclosed)', icon: '📊' },
                { label: 'Payout Mechanism', value: 'Bank transfer or UPI (after job completion)', icon: '💳' },
                { label: 'Payout Timeline', value: 'As per platform payout schedule', icon: '📅' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important disclaimers */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-2">Important Information for Workers</p>
              <ul className="space-y-1 text-amber-700 text-sm">
                <li>• Instantatoz does not guarantee a minimum number of jobs or guaranteed earnings.</li>
                <li>• Workers are responsible for complying with applicable tax obligations on their earnings.</li>
                <li>• Instantatoz is a technology marketplace. Workers are not employees of Instantatoz.</li>
                <li>• Verification requirements may vary by category and service type.</li>
                <li>• Workers must follow platform conduct rules and applicable laws at all times.</li>
                <li>• Repeated cancellations or no-shows may affect your worker rating and platform access.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Read the{' '}
            <Link href="/worker-terms" className="text-blue-600 hover:underline">Worker Terms</Link>
            {' '}and{' '}
            <Link href="/worker-requirements" className="text-blue-600 hover:underline">Worker Requirements</Link>
            {' '}before registering.
          </p>
          <p className="text-gray-400 text-sm">
            Questions? Email us at{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
              support@instantatoz.online
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
