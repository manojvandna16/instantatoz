'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'What is Instantatoz?',
    a: 'Instantatoz is an on-demand hourly workforce marketplace that connects customers needing short-term workers with registered service providers available nearby. Customers post jobs and nearby eligible workers are notified.',
  },
  {
    q: 'How do I hire a worker?',
    a: 'Select your service category, enter job details (number of workers, expected hours, location), and post your requirement. Nearby eligible workers will be notified and can accept the job. The system will update you when a worker accepts and is on the way.',
  },
  {
    q: 'How does hourly billing work?',
    a: 'Billing is based on: Hourly Rate × Number of Workers × Hours Worked = Service Amount. Platform charges and applicable taxes may also apply. All charges are clearly disclosed before payment.',
  },
  {
    q: 'How does OTP verification work?',
    a: 'When the worker arrives at your location, you will receive a one-time OTP in the User App. You share this OTP with the worker. After the worker enters the correct OTP, the work timer starts on the server.',
  },
  {
    q: 'Can I cancel a job?',
    a: 'Cancellation is possible depending on the job status. Cancellation charges, if any, depend on whether a worker has accepted, is en route, or has arrived. Please refer to our Cancellation Policy for complete details.',
  },
  {
    q: 'How can I become a worker?',
    a: 'Register via the Instantatoz Worker App using your mobile number. Complete your profile, select your category and skills, upload required documents, and wait for verification. After activation, you can go online and receive job notifications.',
  },
  {
    q: 'How are workers verified?',
    a: 'Verification requirements may vary by category and service type. Workers submit identity and relevant documents during registration. The Instantatoz team reviews submissions before activation. We do not claim universal police verification.',
  },
  {
    q: 'How does payment work?',
    a: 'Payment is processed through the platform after work completion. Supported methods may include UPI, Credit/Debit Cards, Net Banking, and Wallets. Payment gateway integration will be enabled after merchant onboarding and activation.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-gray-500 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQPreviewSection() {
  return (
    <section className="section-padding bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            FAQ
          </span>
          <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-gray-500 text-lg">
            Can&apos;t find your answer? Contact us at{' '}
            <a href="mailto:support@instantatoz.online" className="text-blue-600 hover:underline">
              support@instantatoz.online
            </a>
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <FAQItem q={faq.q} a={faq.a} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            View All FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
