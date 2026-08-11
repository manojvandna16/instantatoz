import type { Metadata } from 'next';
import Link from 'next/link';
import { serviceCategories } from '@/config/site';
import { ArrowRight, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services | Instantatoz',
  description:
    'Browse all on-demand hourly worker categories on Instantatoz — from skilled trades and cleaning to computer work, healthcare assistance, domestic help, and more.',
};

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            All Services
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Browse Service Categories
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Instantatoz connects you with nearby workers across a wide range of hourly service categories.
            Select a category to learn more about available subcategories.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/services/${category.slug}`}
              className="group card-premium p-6 hover:border-blue-100"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${category.bgLight} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-jakarta font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{category.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 3).map((sub) => (
                      <span key={sub} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {sub}
                      </span>
                    ))}
                    {category.subcategories.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                        +{category.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Not found CTA */}
        <div className="mt-16 bg-gray-50 rounded-3xl p-8 sm:p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-jakarta font-bold text-xl text-gray-900 mb-2">
            Don&apos;t see what you need?
          </h3>
          <p className="text-gray-500 mb-6">
            Instantatoz also covers &quot;Other Local Work&quot; for requirements that don&apos;t fit standard categories.
            Contact us to discuss your specific requirement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/find-a-worker"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              Find a Worker
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
