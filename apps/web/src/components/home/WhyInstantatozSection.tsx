'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, Star, MessageSquare, Wallet, AlertCircle, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'OTP-Based Work Start',
    description: 'Work only begins after the customer verifies the worker with a one-time OTP. No verification, no timer.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Server-Controlled Timer',
    description: 'The work timer is managed server-side. Device clock cannot be manipulated to affect billing.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: MapPin,
    title: 'Nearby Worker Matching',
    description: 'Only verified workers within the configured radius and in the right category are notified for each job.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Wallet,
    title: 'Transparent Pricing',
    description: 'Pricing is based on hourly rate, hours worked, and number of workers. All charges are clearly disclosed.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Both customers and workers can rate each other after job completion to build trust and accountability.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: MessageSquare,
    title: 'Support & Dispute',
    description: 'Dedicated support for complaints and disputes. Issues are handled through a structured resolution process.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: AlertCircle,
    title: 'Category-Based Verification',
    description: 'Verification requirements may vary by category and service type. Workers are screened before activation.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart3,
    title: 'Honest Platform',
    description: 'We do not make false claims about guaranteed work, guaranteed earnings, or government approvals.',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
  },
];

export function WhyInstantatozSection() {
  return (
    <section className="section-padding bg-white" id="why-instantatoz">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built on Trust & Transparency
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Instantatoz is designed to protect both customers and workers through clear processes, honest policies, and accountable systems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="card-premium p-6"
            >
              <div className={`w-11 h-11 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-jakarta font-semibold text-gray-900 mb-2 text-sm">{feature.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
