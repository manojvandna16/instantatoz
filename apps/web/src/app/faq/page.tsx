'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: 'What is Instantatoz?',
        a: 'Instantatoz is an Indian on-demand hourly workforce marketplace — a technology platform that connects customers who need short-term workers with registered service providers available nearby. It is not an employment agency. Workers on the platform are independent service providers.',
      },
      {
        q: 'Is Instantatoz available in my city?',
        a: 'Instantatoz is in its early launch phase. Availability depends on the number of registered workers in your area. Job matching is radius-based — if no eligible workers are online in your area at the time of posting, no notifications will be sent. Platform availability will expand as more workers join.',
      },
      {
        q: 'Are workers employees of Instantatoz?',
        a: 'No. Workers on Instantatoz are independent service providers, not employees of the company. Instantatoz is a technology platform that facilitates the connection. Workers are responsible for their own conduct, taxes, and compliance with applicable law.',
      },
    ],
  },
  {
    category: 'For Customers',
    items: [
      {
        q: 'How do I hire a worker on Instantatoz?',
        a: 'Through the Instantatoz User App (coming soon): select your service category, enter job details (location, number of workers, expected hours, start time), and post the job. Nearby eligible workers who are online will receive a notification and can accept your job.',
      },
      {
        q: 'Can I hire multiple workers for the same job?',
        a: 'Yes. When posting a job, you can specify the number of workers you need. The system will notify multiple workers and assign the required number as workers accept.',
      },
      {
        q: 'How does hourly billing work?',
        a: 'Billing is based on: Hourly Rate × Number of Workers × Billable Hours = Service Amount. Platform fees (if any) and applicable taxes are added and disclosed before payment. The billable hours are recorded by a server-side timer, not the device clock.',
      },
      {
        q: 'How does OTP verification work?',
        a: 'When the worker arrives, the User App generates a one-time OTP. You share this OTP only with the arriving worker. After the worker enters it in the Worker App, the server-side work timer begins. Never share your OTP in advance or with anyone else.',
      },
      {
        q: 'When does the work timer start?',
        a: 'The work timer starts only after the worker successfully enters the correct OTP in the Worker App. The timer is controlled by the Instantatoz server — changing the device clock has no effect on billing.',
      },
      {
        q: 'How do I track a worker?',
        a: 'After a worker accepts your job, you can track their arrival status in the User App. Live GPS tracking features will be available depending on the app version and permissions.',
      },
      {
        q: 'What if a worker does not show up?',
        a: 'If a worker accepts but does not arrive within a reasonable time, you can cancel the job and report the no-show. Depending on the situation, you may be eligible for a refund. Repeated no-shows by a worker are reviewed and may result in the worker being suspended.',
      },
      {
        q: 'Can I cancel a job?',
        a: 'Yes, but cancellation charges may apply depending on the job status: (1) Before worker acceptance — typically eligible for full refund. (2) After acceptance, before arrival — partial charge may apply. (3) After OTP work start — billed for hours worked. Refer to our Cancellation Policy for complete details.',
      },
      {
        q: 'How does payment work?',
        a: 'Payment is processed through the platform after work completion. Supported methods include UPI, Credit/Debit Cards, Net Banking, and Wallets. Payment gateway integration will be enabled after merchant onboarding. All charges are shown before you confirm payment.',
      },
      {
        q: 'How are refunds handled?',
        a: 'Refunds depend on the job status and reason. Payment failures are auto-refunded. Cancelled jobs before worker acceptance are typically fully refunded. After work starts, refunds are only considered for documented disputes. Refer to the Refund Policy for details.',
      },
    ],
  },
  {
    category: 'For Workers',
    items: [
      {
        q: 'How can I become a worker on Instantatoz?',
        a: 'Register via the Instantatoz Worker App (coming soon) using your mobile number and OTP. Complete your profile, select your category and skills, upload required documents, enter your availability and hourly rate, and submit for verification. After activation, you can go online and receive job notifications.',
      },
      {
        q: 'What documents do workers need?',
        a: 'A government-issued identity document (Aadhaar, PAN, Voter ID, Driving Licence, or Passport), a profile photo, and bank account / UPI details for payout. Category-specific documents may also be required (e.g., driving licence for delivery workers).',
      },
      {
        q: 'How are workers verified?',
        a: 'Workers submit identity documents and profile information during registration. The Instantatoz team reviews and verifies submissions before activation. Verification requirements may vary by category. We do not claim universal police verification for all workers on the platform.',
      },
      {
        q: 'How does Instantatoz earn money?',
        a: 'Instantatoz deducts a platform commission from the job amount paid by the customer. This commission is disclosed to workers through the Worker Terms and the Worker App dashboard. The exact percentage may vary by category or platform policy.',
      },
      {
        q: 'How are payouts processed for workers?',
        a: 'After job completion and payment, the platform calculates your payable amount (total job amount minus platform commission and any applicable deductions). Payouts are processed to your registered bank account or UPI ID on the platform\'s payout schedule.',
      },
    ],
  },
  {
    category: 'Platform & Policies',
    items: [
      {
        q: 'How are disputes handled?',
        a: 'Disputes can be raised through the Support section in the app or by emailing support@instantatoz.online. Provide the job ID, date, description of the issue, and any evidence. The Instantatoz team will review the dispute and communicate the outcome. Unresolved disputes can be escalated through our Grievance Redressal process.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'We collect and process only the data needed to operate the platform. We use Firebase (Google Cloud) for data storage and security. We do not sell your personal data to third parties. For complete details, refer to our Privacy Policy.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-sm pr-4 leading-snug">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// JSON-LD FAQ schema (all questions)
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap((cat) =>
    cat.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="pt-24 pb-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            FAQ
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Can&apos;t find your answer?{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline font-medium">
              Email our support team
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {faqs.map((cat) => (
          <div key={cat.category} className="mb-10">
            <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
              {cat.category}
            </h2>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
          <p className="font-jakarta font-bold text-gray-900 text-lg mb-2">Still have questions?</p>
          <p className="text-gray-600 text-sm mb-5">
            Our support team is available Monday – Saturday to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@instantatoz.online"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm"
            >
              Email Support
            </a>
            <Link
              href="/support"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Visit Support Centre
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
