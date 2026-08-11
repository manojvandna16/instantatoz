'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Smartphone } from 'lucide-react';

const userFeatures = [
  'Post a job with category, location & hours',
  'Nearby workers are automatically notified',
  'Track worker arrival in real-time',
  'Verify worker with OTP before work starts',
  'Hourly work timer begins after OTP',
  'Review and pay after work completion',
  'Rate and review the worker',
  'Full job history and invoices',
];

export function ForUsersSection() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: App card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-jakarta font-bold text-gray-900">Instantatoz User App</p>
                  <p className="text-xs text-gray-500">For Customers</p>
                </div>
              </div>

              {/* Fake screen steps */}
              <div className="space-y-3">
                {[
                  { emoji: '📍', text: 'Allow Location' },
                  { emoji: '🔍', text: 'Select Service Category' },
                  { emoji: '📋', text: 'Enter Job Details' },
                  { emoji: '🔔', text: 'Nearby Workers Notified' },
                  { emoji: '✅', text: 'Worker Arrives + OTP' },
                  { emoji: '⏱️', text: 'Work Timer Starts' },
                  { emoji: '💳', text: 'Pay After Completion' },
                ].map((item) => (
                  <div key={item.emoji} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  📱 User App — Coming Soon
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
              For Customers
            </span>
            <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Find the Right Worker,<br />Fast.
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Instantatoz connects you with nearby verified workers available for short-term and hourly tasks.
              No long-term commitments. Pay only for the hours worked.
            </p>

            <ul className="space-y-3 mb-8">
              {userFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-gray-700 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/find-a-worker"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
              >
                Find a Worker
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
