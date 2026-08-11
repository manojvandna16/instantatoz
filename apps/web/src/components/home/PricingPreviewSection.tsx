'use client';

import { motion } from 'framer-motion';
import { Calculator, Info } from 'lucide-react';
import Link from 'next/link';

export function PricingPreviewSection() {
  return (
    <section className="section-padding bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Transparent Pricing
          </span>
          <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pay Only for What You Use
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Hourly-based billing. Clear charges. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Billing formula */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 card-premium p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-jakarta font-bold text-gray-900 text-lg">How Billing Works</h3>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 mb-5">
              <p className="text-sm text-blue-700 font-semibold mb-2 uppercase tracking-wide">Billing Formula</p>
              <p className="text-2xl font-black text-gray-900 font-jakarta">
                Hourly Rate × Hours × Workers = Service Amount
              </p>
              <p className="text-sm text-gray-500 mt-2">
                + Platform fee (if applicable) + Applicable taxes = Total Amount
              </p>
            </div>

            {/* Illustrative example */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Illustrative Example Only — Not Actual Rates
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Worker Hourly Rate</span>
                  <span className="font-semibold">₹300 / hour</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Number of Workers</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Hours Worked</span>
                  <span className="font-semibold">3 hours</span>
                </div>
                <div className="border-t border-amber-200 pt-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Service Amount</span>
                    <span className="font-semibold">₹900</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Platform fee (if applicable)</span>
                    <span>Shown at checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Applicable taxes</span>
                    <span>Shown at checkout</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 mt-1">
                    <span>Total Payable</span>
                    <span>Calculated at booking</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key pricing points */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6"
          >
            <h3 className="font-jakarta font-bold text-gray-900 mb-5">What Affects Price?</h3>
            <ul className="space-y-4">
              {[
                { label: 'Worker hourly rate', icon: '💰', note: 'Varies by category & skill' },
                { label: 'Number of workers', icon: '👥', note: 'More workers = more cost' },
                { label: 'Hours worked', icon: '⏱️', note: 'Server-verified timer' },
                { label: 'Category of service', icon: '📋', note: 'Skilled vs unskilled' },
                { label: 'Platform charges', icon: '📊', note: 'Disclosed clearly' },
                { label: 'Applicable taxes', icon: '🧾', note: 'As per Indian law' },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
          >
            View Full Pricing Details
          </Link>
        </div>
      </div>
    </section>
  );
}
