import type { Metadata } from 'next';
import Link from 'next/link';
import { serviceCategories, siteConfig } from '@/config/site';
import { MapPin, Clock, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find a Worker | Instantatoz',
  description:
    'Post your job requirement and find verified local workers available for hourly tasks near you. Select category, enter details, and connect with nearby workers.',
};

export default function FindAWorkerPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            For Customers
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Find the Right Worker,<br />Right When You Need Them.
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Post your job requirement and connect with verified local workers available for short-term and hourly tasks near you.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Location-based matching — workers within your area are notified</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* App launch notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12 text-center">
          <p className="text-amber-800 font-semibold mb-1">
            📱 Instantatoz User App — Coming Soon
          </p>
          <p className="text-amber-700 text-sm">
            The User App is currently under development. Job posting will be available through the app after launch.
            In the meantime, you can explore service categories and learn how the platform works.
          </p>
        </div>

        {/* How to find a worker steps */}
        <div className="mb-16">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-8 text-center">
            How to Find a Worker on Instantatoz
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '1', icon: '📋', title: 'Select Category', desc: 'Choose the type of service you need from our 12 categories.' },
              { step: '2', icon: '📍', title: 'Enter Job Details', desc: 'Specify location, number of workers, expected hours and start time.' },
              { step: '3', icon: '🔔', title: 'Workers Are Notified', desc: 'Nearby eligible workers receive a notification with job details.' },
              { step: '4', icon: '✅', title: 'OTP & Work Begins', desc: 'Verify the worker with OTP. Work timer starts. Pay after completion.' },
            ].map((step) => (
              <div key={step.step} className="card-premium p-5 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <p className="text-blue-700 text-xs font-bold mb-1">STEP {step.step}</p>
                <h3 className="font-jakarta font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Browse categories */}
        <div className="mb-16">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-8 text-center">
            Available Service Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services/${cat.slug}`}
                className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Key info grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: MapPin,
              title: 'Location-Based Matching',
              desc: 'Workers within the configured radius who match your required category are notified when you post a job.',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              icon: Clock,
              title: 'Hourly Billing',
              desc: 'You are billed based on actual hours worked, verified by the server-controlled timer that starts after OTP.',
              color: 'text-violet-600',
              bg: 'bg-violet-50',
            },
            {
              icon: Users,
              title: 'Multiple Workers',
              desc: 'Need more than one worker? Specify the number when posting a job and multiple workers can be assigned.',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
          ].map((item) => (
            <div key={item.title} className="card-premium p-6">
              <div className={`w-11 h-11 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="font-jakarta font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* What to prepare */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-12">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-6">
            What You&apos;ll Need When Posting a Job
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Specific service category and subcategory required',
              'Accurate job location / address',
              'Number of workers needed',
              'Expected number of hours',
              'Preferred start time',
              'Brief description of the work',
              'Any specific requirements or preferences',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Policies notice */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">
            By using Instantatoz, you agree to our{' '}
            <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link href="/user-terms" className="text-blue-600 hover:underline">User Terms</Link>.
            Please review our{' '}
            <Link href="/cancellation-policy" className="text-blue-600 hover:underline">Cancellation</Link>
            {' '}and{' '}
            <Link href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link>.
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
          >
            Have questions? Contact us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
