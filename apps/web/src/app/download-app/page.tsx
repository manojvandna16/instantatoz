import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download App | Instantatoz',
  description:
    'Download the Instantatoz User App or Worker App. Find workers for hourly tasks or register as a worker. Apps coming soon on Android.',
};

export default function DownloadAppPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="bg-gradient-to-br from-gray-950 to-blue-950 py-20 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-blue-300 text-sm font-semibold rounded-full mb-4 border border-white/10">
            Mobile Apps
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-white mb-4">
            Two Apps. One Platform.
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            The Instantatoz User App and Worker App are being developed as separate Android applications, each designed for their specific users.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* App cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* User App */}
          <div className="card-premium p-8 border-t-4 border-t-blue-600">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5">
              <span className="text-white text-2xl">👤</span>
            </div>
            <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-1">Instantatoz User App</h2>
            <p className="text-gray-500 text-sm mb-1">Package: com.instantatoz.user</p>
            <p className="text-blue-700 font-medium text-sm mb-5">For Customers</p>

            <div className="space-y-2 mb-6">
              {[
                'Find and book workers for hourly tasks',
                'Select from 12+ service categories',
                'GPS-based location for worker matching',
                'Real-time job status updates',
                'OTP-based work verification',
                'Server-tracked work timer',
                'Transparent billing and payment',
                'Rate and review workers',
                'Full job history and invoices',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="text-blue-500 font-bold">✓</span>
                  {f}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-blue-800 font-bold mb-1">📱 Coming Soon on Android</p>
              <p className="text-blue-600 text-xs">App store links will be activated upon publication.</p>
            </div>
          </div>

          {/* Worker App */}
          <div className="card-premium p-8 border-t-4 border-t-emerald-600">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-5">
              <span className="text-white text-2xl">💼</span>
            </div>
            <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-1">Instantatoz Worker App</h2>
            <p className="text-gray-500 text-sm mb-1">Package: com.instantatoz.worker</p>
            <p className="text-emerald-700 font-medium text-sm mb-5">For Service Providers</p>

            <div className="space-y-2 mb-6">
              {[
                'Register with mobile OTP',
                'Select category, skills, hourly rate',
                'Submit documents for verification',
                'Go Online/Offline for job availability',
                'Receive nearby job notifications',
                'Navigate to job location',
                'Enter customer OTP to start work',
                'Track earnings and payout status',
                'Rating and review system',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="text-emerald-500 font-bold">✓</span>
                  {f}
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-emerald-800 font-bold mb-1">📱 Coming Soon on Android</p>
              <p className="text-emerald-600 text-xs">App store links will be activated upon publication.</p>
            </div>
          </div>
        </div>

        {/* Stay informed */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center mb-12">
          <h2 className="font-jakarta font-bold text-2xl text-gray-900 mb-3">Be the First to Know</h2>
          <p className="text-gray-600 mb-6">
            Enter your email to get notified when the Instantatoz apps are available for download.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            action={`mailto:support@instantatoz.online?subject=Notify me when Instantatoz app launches`}
            method="get"
          >
            <input
              type="email"
              name="body"
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              Notify Me
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-3">
            Your email will only be used to notify you about the app launch. See our{' '}
            <Link href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        {/* In the meantime */}
        <div className="text-center">
          <h3 className="font-jakarta font-bold text-xl text-gray-900 mb-5">
            While You Wait...
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/services" className="card-premium p-5 hover:border-blue-200 text-center">
              <span className="text-3xl mb-2 block">🗂️</span>
              <p className="font-semibold text-gray-900 text-sm">Browse Services</p>
              <p className="text-gray-500 text-xs mt-1">Explore available categories</p>
            </Link>
            <Link href="/how-it-works" className="card-premium p-5 hover:border-blue-200 text-center">
              <span className="text-3xl mb-2 block">📋</span>
              <p className="font-semibold text-gray-900 text-sm">How It Works</p>
              <p className="text-gray-500 text-xs mt-1">Learn the platform process</p>
            </Link>
            <Link href="/become-a-worker" className="card-premium p-5 hover:border-emerald-200 text-center">
              <span className="text-3xl mb-2 block">💼</span>
              <p className="font-semibold text-gray-900 text-sm">Become a Worker</p>
              <p className="text-gray-500 text-xs mt-1">Learn about worker registration</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
