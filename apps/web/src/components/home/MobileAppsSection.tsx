'use client';

import { motion } from 'framer-motion';
import { Smartphone, Apple, Play } from 'lucide-react';

export function MobileAppsSection() {
  return (
    <section className="section-padding bg-gradient-to-br from-gray-950 to-blue-950 text-white" id="download-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 text-blue-300 text-sm font-semibold rounded-full mb-6 border border-white/10">
              Mobile Apps
            </span>
            <h2 className="font-jakarta text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Two Apps. One Platform.
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              The Instantatoz User App and Worker App are separate Android applications — designed specifically for their respective users.
              Both connect to the same platform for seamless service delivery.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="bg-white/8 rounded-2xl p-5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-jakarta font-bold text-white mb-1">User App</h3>
                <p className="text-gray-400 text-sm">Find workers · Post jobs · Track · Pay</p>
                <span className="inline-block mt-3 px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-700/50">
                  Coming Soon
                </span>
              </div>

              <div className="bg-white/8 rounded-2xl p-5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-jakarta font-bold text-white mb-1">Worker App</h3>
                <p className="text-gray-400 text-sm">Register · Go online · Accept jobs · Earn</p>
                <span className="inline-block mt-3 px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded-full border border-emerald-700/50">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* App store buttons (placeholder) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled
                className="flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors cursor-not-allowed opacity-60"
                aria-label="Google Play Store - Coming Soon"
              >
                <Play className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </button>
              <button
                disabled
                className="flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors cursor-not-allowed opacity-60"
                aria-label="Apple App Store - Coming Soon"
              >
                <Apple className="w-5 h-5 text-blue-300" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </button>
            </div>

            <p className="text-gray-500 text-xs mt-4">
              App store links will be activated once the applications are published. This website is available now.
            </p>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Phone mockup */}
              <div className="w-64 h-[480px] bg-gray-800 rounded-[3rem] border-4 border-gray-700 shadow-2xl overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="bg-gray-900 px-6 pt-3 pb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">9:41</span>
                  <div className="w-16 h-4 bg-gray-800 rounded-full" />
                  <span className="text-xs text-gray-400">●●●</span>
                </div>

                {/* App screen */}
                <div className="flex-1 bg-white p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">IA</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">Instantatoz</span>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 mb-3">Find Workers Near You</p>

                  <div className="space-y-2">
                    {['💻 Computer Work', '🔧 Skilled Services', '🏠 Domestic Work', '🧹 Cleaning'].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-700 rounded-xl text-center">
                    <p className="text-white text-xs font-semibold">Find a Worker →</p>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
