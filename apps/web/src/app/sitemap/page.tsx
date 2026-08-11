import type { Metadata } from 'next';
import Link from 'next/link';
import { serviceCategories } from '@/config/site';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Site Map | Instantatoz',
  description: 'A complete list of all pages on the Instantatoz website.',
};

const legalPages = [
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

function SitemapSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-jakarta font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SitemapPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Site Map</h1>
          <p className="text-gray-500">A complete list of all pages available on instantatoz.online</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <SitemapSection
            title="Main Pages"
            links={[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'Find a Worker', href: '/find-a-worker' },
              { label: 'How It Works', href: '/how-it-works' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Become a Worker', href: '/become-a-worker' },
              { label: 'Worker Requirements', href: '/worker-requirements' },
              { label: 'Download App', href: '/download-app' },
            ]}
          />
          <SitemapSection
            title="Company"
            links={[
              { label: 'About Us', href: '/about-us' },
              { label: 'Safety', href: '/safety' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Support', href: '/support' },
              { label: 'Contact Us', href: '/contact-us' },
              { label: 'Grievance Redressal', href: '/grievance-redressal' },
            ]}
          />
          <SitemapSection title="Legal & Policies" links={legalPages} />

          <div className="sm:col-span-2 lg:col-span-3">
            <SitemapSection
              title="Service Categories"
              links={serviceCategories.map((cat) => ({
                label: cat.name,
                href: `/services/${cat.slug}`,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
