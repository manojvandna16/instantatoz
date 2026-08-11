'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Briefcase } from 'lucide-react';

const workerFeatures = [
  'Register with your mobile number via OTP',
  'Choose your main category and skills',
  'Set your availability and hourly rate',
  'Go Online to receive nearby job notifications',
  'Accept jobs that suit your schedule',
  'Navigate to the job location',
  'Start work after OTP verification',
  'Receive earnings for completed jobs',
  'Build your rating and grow your profile',
];

export function ForWorkersSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              For Workers
            </span>
            <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Flexible Work.<br />On Your Terms.
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Join Instantatoz as a worker to find flexible short-term opportunities near you.
              Go online when you are available and accept jobs that match your skills.
            </p>

            <ul className="space-y-3 mb-8">
              {workerFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-gray-700 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/become-a-worker"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Become a Worker
              </a>
              <a
                href="/worker-requirements"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Worker Requirements
              </a>
            </div>
          </motion.div>

          {/* Right: Worker app card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-jakarta font-bold text-gray-900">Instantatoz Worker App</p>
                  <p className="text-xs text-gray-500">For Service Providers</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { emoji: '📱', text: 'OTP Registration' },
                  { emoji: '🗂️', text: 'Select Category & Skills' },
                  { emoji: '✅', text: 'Complete Verification' },
                  { emoji: '🟢', text: 'Go Online' },
                  { emoji: '🔔', text: 'Receive Job Notifications' },
                  { emoji: '🗺️', text: 'Navigate to Location' },
                  { emoji: '🔐', text: 'OTP Work Start' },
                  { emoji: '💰', text: 'Earn Per Hour' },
                ].map((item) => (
                  <div key={item.emoji} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  📱 Worker App — Coming Soon
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
