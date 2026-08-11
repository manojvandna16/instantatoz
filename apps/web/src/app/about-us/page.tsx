import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Instantatoz',
  description:
    'Learn about Instantatoz — an Indian technology platform being developed to connect customers who need short-term workers with flexible service providers nearby.',
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            About Us
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Building the Future of Flexible Work in India
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Instantatoz is an Indian technology platform being developed to make short-term and hourly local services more accessible, transparent, and reliable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Our Story */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <div>
            <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-5">Our Vision</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Instantatoz is being developed as an Indian technology platform designed to bring convenience,
                transparency, and reliability to the short-term and hourly local services sector.
              </p>
              <p>
                The long-term vision is to create a trusted bridge between people who need temporary assistance
                and workers looking for flexible, location-based opportunities — without long-term commitments on either side.
              </p>
              <p>
                We believe in fair, transparent dealings. Customers should know exactly what they are paying for.
                Workers should know exactly how much they will earn and for how many hours.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 border border-blue-100">
            <div className="space-y-5">
              {[
                {
                  emoji: '🎯',
                  title: 'Mission',
                  desc: 'To create a trusted, transparent on-demand workforce marketplace connecting customers and workers fairly.',
                },
                {
                  emoji: '🔭',
                  title: 'Vision',
                  desc: 'To become a reliable platform for short-term and hourly work across Indian cities and towns.',
                },
                {
                  emoji: '💡',
                  title: 'Values',
                  desc: 'Transparency, honesty, fairness, safety, and accountability — for both customers and workers.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-jakarta font-bold text-gray-900">{item.title}</p>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-3">What Instantatoz Does</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Connects Customers & Workers',
                desc: 'Customers post job requirements. Workers receive notifications. The platform facilitates the connection.',
              },
              {
                icon: '⏱️',
                title: 'Hourly Service Model',
                desc: 'Work is billed by the hour, verified by a server-controlled timer that starts only after OTP verification.',
              },
              {
                icon: '📍',
                title: 'Location-Based Matching',
                desc: 'Workers within a configured radius who match the job category are notified, ensuring proximity.',
              },
              {
                icon: '🔐',
                title: 'OTP Work Verification',
                desc: 'Customers verify workers with a one-time OTP before work begins — protecting both parties.',
              },
              {
                icon: '⭐',
                title: 'Ratings & Accountability',
                desc: 'Both customers and workers are rated after each job, building accountability and trust.',
              },
              {
                icon: '📋',
                title: 'Transparent Policies',
                desc: 'Clear policies on pricing, cancellation, refunds, and payouts — accessible from the website.',
              },
            ].map((item) => (
              <div key={item.title} className="card-premium p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-jakarta font-bold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we are not */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-5">Important Clarifications</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              'Instantatoz is a technology marketplace — it is not an employer of the workers on the platform.',
              'Workers on Instantatoz are independent service providers, not employees of the company.',
              'We do not guarantee worker availability at any given time or location.',
              'We do not guarantee earnings or a minimum number of jobs for workers.',
              'We do not claim government approval, certification, or awards.',
              'We do not claim universal police verification for all workers.',
              'We do not provide insurance unless specifically stated and documented.',
              'Payment gateway integration will be activated only after proper merchant onboarding.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-gray-600">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="font-jakarta font-bold text-xl text-gray-900 mb-4">
            Want to Know More?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/how-it-works" className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors">
              How It Works
            </Link>
            <Link href="/contact-us" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
