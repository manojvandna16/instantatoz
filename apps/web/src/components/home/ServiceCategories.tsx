'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serviceCategories } from '@/config/site';

export function ServiceCategories() {
  return (
    <section className="section-padding bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            What We Offer
          </span>
          <h2 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse Service Categories
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Find the right worker for your specific need. From skilled trades to daily assistance — all available on-demand.
          </p>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
            >
              <Link
                href={`/services/${category.slug}`}
                className="group block card-premium p-5 hover:border-blue-100"
              >
                <div className={`w-12 h-12 rounded-2xl ${category.bgLight} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-jakarta font-semibold text-gray-900 text-sm leading-tight mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
