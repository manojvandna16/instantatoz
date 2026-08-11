'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Bell, MapPin, ShieldCheck } from 'lucide-react';

const userSteps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Post Your Requirement',
    description:
      'Select the service category, enter work details, number of workers needed, expected hours, and your location.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Bell,
    step: '02',
    title: 'Nearby Workers Are Notified',
    description:
      'Eligible and online workers near your job location receive a job notification with details and estimated earnings.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: MapPin,
    step: '03',
    title: 'Worker Accepts & Arrives',
    description:
      'The worker accepts the job and navigates to your location. You can track their arrival status.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: ShieldCheck,
    step: '04',
    title: 'OTP, Work & Payment',
    description:
      'Verify the worker with an OTP. The work timer starts. After completion, the bill is calculated and payment is processed.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Simple & Transparent
          </span>
          <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How Instantatoz Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            From posting a job to getting it done — a straightforward, OTP-protected process.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {userSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="relative"
            >
              <div className={`bg-white rounded-2xl p-6 border ${step.border} shadow-sm h-full`}>
                {/* Step number */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className="text-4xl font-black text-gray-100 font-jakarta">{step.step}</span>
                </div>
                <h3 className="font-jakarta font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Connector arrow (desktop only) */}
              {index < userSteps.length - 1 && (
                <div className="hidden lg:flex absolute top-10 -right-3 w-6 h-6 items-center justify-center z-10">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* OTP callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 md:p-8 text-white text-center"
        >
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-blue-200" />
          <h3 className="font-jakarta font-bold text-xl mb-2">OTP-Protected Work Start</h3>
          <p className="text-blue-100 max-w-lg mx-auto text-sm leading-relaxed">
            The work timer only starts after the customer verifies the worker with a one-time password (OTP).
            All timestamps are recorded server-side to ensure accurate billing and transparency.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
