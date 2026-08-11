import Link from 'next/link';
import { siteConfig } from '@/config/site';

const legalLinks = [
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'User Terms', href: '/user-terms' },
  { label: 'Worker Terms', href: '/worker-terms' },
  { label: 'Payment Policy', href: '/payment-policy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Cancellation Policy', href: '/cancellation-policy' },
  { label: 'Worker Verification Policy', href: '/worker-verification-policy' },
  { label: 'Grievance Redressal', href: '/grievance-redressal' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Community Guidelines', href: '/community-guidelines' },
  { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
  { label: 'Accessibility', href: '/accessibility' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
              {siteConfig.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm font-medium">Legal Documents</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-8 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Legal Documents
              </h2>
              <nav className="space-y-0.5">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Questions about our policies? Contact us at{' '}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-orange-600 hover:underline"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
