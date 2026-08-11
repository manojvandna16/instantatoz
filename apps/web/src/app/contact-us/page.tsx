import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Mail, Clock, Globe, MessageSquare } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Instantatoz',
  description:
    'Get in touch with the Instantatoz team. Support for customers and workers. Email: support@instantatoz.online',
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Contact Us
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            We&apos;re Here to Help
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Have a question, concern, or feedback? Reach out to the Instantatoz support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-jakarta font-bold text-gray-900 mb-1">Support Email</h3>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {siteConfig.supportEmail}
                  </a>
                  <p className="text-gray-500 text-xs mt-1">
                    We respond within 1–2 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-jakarta font-bold text-gray-900 mb-1">Website</h3>
                  <a
                    href={siteConfig.url}
                    className="text-blue-600 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteConfig.domain}
                  </a>
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-jakarta font-bold text-gray-900 mb-1">Support Hours</h3>
                  <p className="text-gray-700 font-medium">{siteConfig.contact.workingHours}</p>
                  <p className="text-gray-500 text-xs mt-1">Indian Standard Time (IST)</p>
                </div>
              </div>
            </div>

            {/* Business details placeholder */}
            <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900 mb-2">Business Details</p>
              <p><span className="font-medium">Brand:</span> Instantatoz</p>
              <p><span className="font-medium">Website:</span> instantatoz.online</p>
              <p><span className="font-medium">Email:</span> support@instantatoz.online</p>
              <p className="text-gray-400 text-xs mt-2">
                * Business registration, GST, and address details will be added upon completion of business registration.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">Quick Links</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Support Center', href: '/support' },
                  { label: 'Grievance Redressal', href: '/grievance-redressal' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card-premium p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-jakarta font-bold text-gray-900 text-lg">Send a Message</h2>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
