'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Shield, Star } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-bg pt-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-200/40 rounded-full animate-blob" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-200/40 rounded-full animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-200/30 rounded-full animate-blob animation-delay-4000" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #1e40af 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 badge-live" />
              <span className="text-sm font-medium text-blue-700">India&apos;s On-Demand Workforce Marketplace</span>
            </motion.div>

            <h1 className="font-jakarta text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              Get the Right Worker,{' '}
              <span className="text-gradient">Right When You Need Them.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              Book verified local workers for short-term and hourly tasks through Instantatoz.
              Electricians, cleaners, delivery workers, data entry staff, and more — nearby and ready.
            </p>

            {/* Location hint */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Need help today? Find available workers near your location.</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/find-a-worker"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold text-base hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
              >
                Find a Worker
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/become-a-worker"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-base border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all hover:-translate-y-0.5"
              >
                Become a Worker
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 mt-10">
              {[
                { icon: Shield, text: 'OTP-Based Work Start' },
                { icon: Clock, text: 'Hourly Billing' },
                { icon: Star, text: 'Ratings & Reviews' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Main app card mockup */}
              <div className="glass rounded-3xl p-6 shadow-2xl border border-white/60">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">IA</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Instantatoz</p>
                    <p className="text-xs text-gray-500">Find Help · Get Work · Instantly</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Quick Request</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-xl">💻</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Computer Operator</p>
                        <p className="text-xs text-gray-500">Data Entry · Office Work</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 p-3 bg-white rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Workers</p>
                        <p className="font-bold text-gray-900">1</p>
                      </div>
                      <div className="flex-1 p-3 bg-white rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="font-bold text-gray-900">4</p>
                      </div>
                      <div className="flex-1 p-3 bg-white rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-bold text-gray-900">Now</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
                  Find Nearby Workers →
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  App launching soon · Website available now
                </p>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-3 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Worker Nearby</p>
                    <p className="text-xs text-gray-500">0.8 km away</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-3 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">OTP Verified</p>
                    <p className="text-xs text-gray-500">Work in progress</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
