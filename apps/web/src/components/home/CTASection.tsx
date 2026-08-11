'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Customer CTA */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-jakarta text-2xl font-bold text-white mb-3">
              Need a Worker?
            </h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Post your job requirement and find verified local workers available for short-term and hourly tasks near you.
            </p>
            <Link
              href="/find-a-worker"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-800 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Find a Worker
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Worker CTA */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="font-jakarta text-2xl font-bold text-white mb-3">
              Want Flexible Work?
            </h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Register as a worker on Instantatoz. Choose your category, set your availability, go online, and receive nearby job opportunities.
            </p>
            <Link
              href="/become-a-worker"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              Become a Worker
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-blue-300 text-sm mt-10"
        >
          Questions? Email us at{' '}
          <a href="mailto:support@instantatoz.online" className="text-white hover:underline">
            support@instantatoz.online
          </a>
        </motion.p>
      </div>
    </section>
  );
}
