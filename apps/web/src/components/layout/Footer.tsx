import Link from 'next/link';
import { Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig, footerLinks } from '@/config/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IA</span>
              </div>
              <span className="text-white font-bold text-xl font-jakarta">{siteConfig.name}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              {siteConfig.tagline}
              <br />
              <span className="text-gray-500 text-xs mt-1 block">
                An on-demand hourly workforce marketplace connecting customers with nearby service providers.
              </span>
            </p>

            {/* Contact details */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-blue-400 transition-colors">
                  {siteConfig.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>{siteConfig.contact.workingHours}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { label: 'Instagram', href: siteConfig.social.instagram, symbol: '📸' },
                { label: 'Facebook', href: siteConfig.social.facebook, symbol: '📘' },
                { label: 'Twitter', href: siteConfig.social.twitter, symbol: '🐦' },
                { label: 'LinkedIn', href: siteConfig.social.linkedin, symbol: '💼' },
                { label: 'YouTube', href: siteConfig.social.youtube, symbol: '▶️' },
              ].map(({ label, href, symbol }) => (
                <a
                  key={label}
                  href={href || '#'}
                  aria-label={label}
                  title={label}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-blue-700 transition-colors"
                >
                  {symbol}
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 font-jakarta">Platform</h3>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 font-jakarta">For Workers</h3>
            <ul className="space-y-2.5">
              {footerLinks.forWorkers.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold text-sm mt-6 mb-4 font-jakarta">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 font-jakarta">Legal & Policies</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment methods note */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 text-center md:text-left">
              <span className="text-gray-400 font-medium">Payment Methods:</span>{' '}
              UPI · Credit Card · Debit Card · Net Banking · Wallets
              <span className="block mt-1 text-gray-600">
                Payment gateway integration will be enabled after merchant onboarding and activation.
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['UPI', 'VISA', 'Mastercard', 'RuPay', 'Net Banking'].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 bg-gray-800 text-gray-400 text-xs rounded-md border border-gray-700"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>
              © {currentYear} {siteConfig.name}. All rights reserved. |{' '}
              <Link href={siteConfig.url} className="hover:text-blue-400 transition-colors">
                {siteConfig.domain}
              </Link>
            </p>
            <p>
              {siteConfig.name} is a technology platform facilitating connections between customers and service providers.
              It is not an employer.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
