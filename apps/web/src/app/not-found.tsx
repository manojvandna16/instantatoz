import Link from 'next/link';
import { Home, Search, HelpCircle, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white font-bold text-xs">IA</span>
          </div>
          <span className="font-jakarta font-bold text-xl text-gray-900">Instantatoz</span>
        </div>

        <p className="text-8xl font-black text-gray-100 font-jakarta mb-2">404</p>
        <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Please check the URL or navigate using the links below.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Home, label: 'Home', href: '/' },
            { icon: Search, label: 'Find a Worker', href: '/find-a-worker' },
            { icon: HelpCircle, label: 'FAQ', href: '/faq' },
            { icon: Phone, label: 'Contact', href: '/contact-us' },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
