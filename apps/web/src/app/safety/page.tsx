import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Safety | Instantatoz',
  description:
    'Learn how Instantatoz approaches worker screening, OTP-based work verification, and platform safety. Important disclaimers and guidance for customers and workers.',
  openGraph: {
    title: 'Safety | Instantatoz',
    description:
      'Our approach to safety: worker identity verification, OTP-based work start protection, ratings, and how to report issues.',
    url: `${siteConfig.url}/safety`,
  },
};

const sections = [
  {
    icon: '🪪',
    title: 'Worker Identity Verification',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
    content: [
      'Every worker who registers on Instantatoz must submit a valid government-issued photo ID — typically an Aadhaar Card — along with a clear recent photograph.',
      'Our platform team reviews submitted documents before activating a worker account. Workers whose documents appear invalid or mismatched are not activated.',
      'For skilled service categories (electricians, plumbers, healthcare workers), we request additional qualification or experience documents where applicable.',
    ],
    disclaimer:
      'Important: Verification requirements may vary by service category. We verify the identity documents submitted by workers but cannot independently verify the authenticity of all credentials or professional claims. We do not claim universal police verification for all workers on the platform. Customers should exercise their own judgment and take appropriate precautions.',
  },
  {
    icon: '🔐',
    title: 'OTP-Based Work Start Protection',
    color: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    content: [
      'The Instantatoz platform uses a One-Time Password (OTP) system to verify that the correct worker has arrived at your location before any work begins.',
      'After a worker accepts your job, you will receive an OTP on your registered mobile number. Share this OTP with the worker only after physically confirming they are the assigned person and are present at your location.',
      'The worker enters the OTP into the worker app. This action starts the server-controlled work timer. Billing begins from this moment — not from job acceptance.',
      'This mechanism protects customers from being billed for work that has not started and creates an auditable work-start record.',
    ],
    disclaimer:
      'Do not share your OTP with anyone remotely or before the worker arrives. Sharing OTP prematurely starts your billing. Instantatoz support staff will never ask for your OTP.',
  },
  {
    icon: '⭐',
    title: 'Ratings & Review System',
    color: 'bg-yellow-50 border-yellow-200',
    iconBg: 'bg-yellow-100 text-yellow-700',
    content: [
      'After each completed job, customers can rate and review workers on a 1–5 star scale and leave a text review. Workers can also rate customers.',
      'Worker ratings are visible on their profiles and influence which workers are surfaced first in your area. Consistently low-rated workers may be suspended pending review.',
      'Customers who repeatedly cancel last-minute, behave inappropriately, or submit fraudulent complaints may also see restrictions applied to their accounts.',
      'Reviews must be honest and related to the actual work experience. Fake reviews, coerced reviews, or reviews that violate our Community Guidelines will be removed.',
    ],
  },
  {
    icon: '🚨',
    title: 'How to Report Issues',
    color: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100 text-red-700',
    content: [
      'In-App Reporting: Use the "Report a Problem" option in the app after a job to report conduct issues, billing disputes, or concerns.',
      'Email Reporting: Send a detailed description of your concern to support@instantatoz.online. Include the job ID, date, description of the issue, and any supporting screenshots.',
      'Grievance Redressal: For formal grievances under the IT Act or Consumer Protection Act, use the Grievance Redressal form or email our grievance officer as specified on the Grievance Redressal page.',
    ],
    disclaimer:
      'Emergency: If you are in immediate danger, please call the local police emergency number (100 in India) first. Instantatoz is a technology platform and cannot provide real-time emergency response.',
  },
  {
    icon: '👤',
    title: 'Customer Safety Responsibilities',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-700',
    content: [
      'Verify the worker\'s identity and match their name and photo in the app before sharing the OTP.',
      'For sensitive locations (home interior, private spaces), ensure another person is present if possible.',
      'Keep communication within the platform. Do not share personal financial information with workers.',
      'Report any misconduct immediately through the app or by email. Timely reports help us act faster.',
      'Read the worker\'s profile, category, and ratings before confirming a booking.',
    ],
  },
  {
    icon: '🔧',
    title: 'Worker Safety Responsibilities',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100 text-orange-700',
    content: [
      'Arrive on time and in professional attire appropriate for the job.',
      'Carry your registered government ID to the job site. Customers are encouraged to verify your identity.',
      'Do not ask customers for personal financial details, advances outside the platform, or off-platform payments.',
      'If you feel unsafe at a job site, you have the right to leave. Report the incident to support immediately.',
      'Maintain professional conduct at all times. Workers involved in misconduct are permanently deactivated.',
    ],
  },
  {
    icon: '📜',
    title: 'Platform Conduct Rules',
    color: 'bg-slate-50 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-700',
    content: [
      'No harassment, discrimination, or abuse based on gender, religion, caste, ethnicity, or any protected characteristic.',
      'No solicitation of off-platform payments to circumvent Instantatoz\'s fees or policies.',
      'No sharing of personal contact details for the purpose of conducting business outside the platform.',
      'No fraudulent booking creation, fake reviews, or manipulation of the rating system.',
      'No use of the platform for illegal services or activities.',
      'Violations are taken seriously and may result in permanent deactivation without refund of any pending amounts.',
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Safety First
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Approach to Safety
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Instantatoz uses identity verification, OTP-based work-start protection, and
            accountability systems to help maintain a safer experience. Read our honest assessment
            below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Important disclaimer banner */}
        <div className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-jakarta font-bold text-amber-900 mb-1">Honest Platform Disclaimer</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Instantatoz is a technology marketplace, not a security or vetting agency. While we
              take reasonable steps to verify worker identities and screen documents, we cannot
              guarantee the safety of any transaction, meeting, or work engagement. We do not claim
              to provide a risk-free environment. Customers and workers must take personal
              responsibility for their safety. If you are in immediate danger, call emergency
              services (100) first.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className={`rounded-2xl border p-8 ${section.color}`}
            >
              <div className="flex items-start gap-4 mb-5">
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${section.iconBg}`}
                >
                  {section.icon}
                </span>
                <h2 className="font-jakarta text-xl font-bold text-gray-900 mt-2">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3 mb-4">
                {section.content.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              {'disclaimer' in section && section.disclaimer && (
                <div className="mt-4 bg-white/70 rounded-xl p-4 border border-gray-200 text-xs text-gray-600 leading-relaxed">
                  <strong className="font-semibold text-gray-800">Note: </strong>
                  {section.disclaimer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency guidance */}
        <div className="mt-12 bg-red-600 rounded-3xl p-8 text-white text-center">
          <div className="text-4xl mb-4">🆘</div>
          <h3 className="font-jakarta text-2xl font-bold mb-3">Emergency Guidance</h3>
          <p className="text-red-100 mb-4 max-w-xl mx-auto text-sm leading-relaxed">
            Instantatoz is a technology platform and cannot provide emergency response. In any
            emergency situation involving physical danger, please contact emergency services
            immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-center">
            <div className="bg-white/20 rounded-xl px-6 py-4">
              <p className="text-sm text-red-100">Police</p>
              <p className="font-jakarta font-bold text-2xl">100</p>
            </div>
            <div className="bg-white/20 rounded-xl px-6 py-4">
              <p className="text-sm text-red-100">Ambulance</p>
              <p className="font-jakarta font-bold text-2xl">108</p>
            </div>
            <div className="bg-white/20 rounded-xl px-6 py-4">
              <p className="text-sm text-red-100">Women Helpline</p>
              <p className="font-jakarta font-bold text-2xl">1091</p>
            </div>
          </div>
          <p className="mt-4 text-red-200 text-xs">
            After ensuring your safety, report incidents to{' '}
            <span className="text-white font-medium">support@instantatoz.online</span>
          </p>
        </div>

        {/* Related links */}
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { href: '/worker-verification-policy', label: 'Worker Verification Policy', icon: '📋' },
            { href: '/community-guidelines', label: 'Community Guidelines', icon: '🤝' },
            { href: '/grievance-redressal', label: 'Grievance Redressal', icon: '⚖️' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-jakarta font-semibold text-sm text-gray-800 group-hover:text-blue-700">
                {link.label}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
