import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Worker Requirements | Instantatoz',
  description:
    'Requirements to join Instantatoz as a worker. Learn about eligibility, documents, category-specific requirements, and the verification process.',
};

export default function WorkerRequirementsPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
            Worker Requirements
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What It Takes to Join as a Worker
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Review the requirements before registering as a worker on Instantatoz.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Basic eligibility */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-5">Basic Eligibility</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Age', req: '18 years or older (subject to applicable law)' },
              { label: 'Nationality/Residence', req: 'Indian resident with valid Indian mobile number' },
              { label: 'Device', req: 'Smartphone with internet access to use the Worker App' },
              { label: 'Language', req: 'Basic ability to communicate in local language or Hindi/English' },
              { label: 'Skills', req: 'Genuine skills/experience in at least one registered category' },
              { label: 'Legal Standing', req: 'No legal prohibition on providing the selected service' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.req}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-5">Required Documents</h2>
          <div className="space-y-4">
            {[
              { doc: 'Government-Issued Identity Document', detail: 'Aadhaar Card, PAN Card, Voter ID, Driving License, or Passport. At least one valid ID is required.', required: true },
              { doc: 'Profile Photo', detail: 'Recent clear photo of yourself (not a group photo). Used for customer verification.', required: true },
              { doc: 'Bank Account / UPI Details', detail: 'For payout processing. Bank account number + IFSC code, or valid UPI ID.', required: true },
              { doc: 'Category-Specific Documents', detail: 'May vary by service. See category-specific requirements below.', required: false },
            ].map((item) => (
              <div key={item.doc} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${item.required ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.required ? 'Required' : 'If Applicable'}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.doc}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category-specific */}
        <div className="card-premium p-8 mb-8">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-5">Category-Specific Requirements</h2>
          <div className="space-y-4">
            {[
              {
                cat: '⚡ Skilled Services (Electrician, Plumber, Carpenter, Painter, Mechanic)',
                req: 'Relevant vocational training, experience, or trade certificate preferred. Workers representing themselves as licensed professionals in regulated trades are expected to hold applicable licences.',
              },
              {
                cat: '🏥 Healthcare Assistance (Nursing Assistant, Patient Attendant)',
                req: 'Relevant training, certification, or experience in healthcare support. Workers claiming professional healthcare qualifications must hold valid documentation.',
              },
              {
                cat: '📚 Education & Tutoring',
                req: 'Relevant educational qualifications for the subject being taught. Tutors must be truthful about their qualifications.',
              },
              {
                cat: '🚗 Driver / Delivery',
                req: 'Valid Indian driving licence for the applicable vehicle category.',
              },
              {
                cat: '💻 Computer & Office Work',
                req: 'Demonstrated proficiency in the selected skills (data entry, computer operation, etc.).',
              },
              {
                cat: 'All Other Categories',
                req: 'Genuine relevant experience. Workers must not misrepresent their skills or experience.',
              },
            ].map((item) => (
              <div key={item.cat} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.cat}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{item.req}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conduct expectations */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-5">Conduct Expectations</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Arrive on time to accepted jobs',
              'Perform work professionally and safely',
              'Treat customers with respect at all times',
              'Only enter OTP when physically at the job location',
              'Do not request payment outside the platform',
              'Do not misrepresent your skills or qualifications',
              'Do not accept jobs you are not qualified to perform',
              'Follow all applicable safety standards',
              'Maintain your availability status accurately',
              'Cancel only when genuinely unavoidable',
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2 text-gray-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {rule}
              </div>
            ))}
          </div>
        </div>

        {/* What leads to suspension */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-7 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 mb-3">What May Lead to Account Suspension or Termination</h3>
              <ul className="space-y-1 text-red-700 text-sm">
                {[
                  'Providing false information during registration',
                  'Repeated job cancellations or no-shows without valid reason',
                  'Harassment, misconduct, or inappropriate behavior toward customers',
                  'Requesting payment outside the platform',
                  'Fraudulent OTP entry (entering OTP without being at the location)',
                  'Using another person\'s documents or identity',
                  'Violation of platform conduct rules or applicable laws',
                  'Consistently low ratings with substantiated complaints',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/become-a-worker" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Become a Worker
            </Link>
            <Link href="/worker-terms" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Read Worker Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
