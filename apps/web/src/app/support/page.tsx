import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Support Centre | Instantatoz',
  description:
    'Get help with your Instantatoz jobs, payments, account, or refunds. Contact our support team at support@instantatoz.online. Response within 1-2 business days.',
  openGraph: {
    title: 'Support Centre | Instantatoz',
    description:
      'Contact Instantatoz support for job issues, payment disputes, worker complaints, and more.',
    url: `${siteConfig.url}/support`,
  },
};

const categories = [
  {
    icon: '💼',
    title: 'Job Issue',
    desc: 'Worker did not show up, work incomplete, wrong category assigned, job not started, or timer issue.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    subject: 'Job Issue - Instantatoz Support',
  },
  {
    icon: '💳',
    title: 'Payment Issue',
    desc: 'Payment deducted but booking not confirmed, double charge, payment gateway error, or transaction failure.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    subject: 'Payment Issue - Instantatoz Support',
  },
  {
    icon: '🚩',
    title: 'Worker Complaint',
    desc: 'Report worker misconduct, inappropriate behaviour, fraud, or safety concerns.',
    color: 'bg-red-50 border-red-200 text-red-700',
    subject: 'Worker Complaint - Instantatoz Support',
  },
  {
    icon: '👤',
    title: 'Account Issue',
    desc: 'Unable to log in, account suspended, profile update, or phone number change requests.',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    subject: 'Account Issue - Instantatoz Support',
  },
  {
    icon: '↩️',
    title: 'Refund Request',
    desc: 'Request a refund for a cancelled booking, unaccepted job, or payment error.',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    subject: 'Refund Request - Instantatoz Support',
  },
  {
    icon: '🛠️',
    title: 'Technical Issue',
    desc: 'App crash, OTP not received, notification not working, or any technical bug on the platform.',
    color: 'bg-slate-50 border-slate-200 text-slate-700',
    subject: 'Technical Issue - Instantatoz Support',
  },
];

const helpLinks = [
  { href: '/faq', icon: '❓', label: 'Browse the FAQ', desc: '20+ answered questions' },
  { href: '/grievance-redressal', icon: '⚖️', label: 'Grievance Redressal', desc: 'Formal grievance process' },
  { href: '/privacy-policy', icon: '🔒', label: 'Privacy Policy', desc: 'How we use your data' },
  { href: '/refund-policy', icon: '↩️', label: 'Refund Policy', desc: 'Refund rules & timelines' },
  { href: '/cancellation-policy', icon: '❌', label: 'Cancellation Policy', desc: 'When & how to cancel' },
  { href: '/worker-requirements', icon: '📋', label: 'Worker Requirements', desc: 'Documents & eligibility' },
];

export default function SupportPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <div className="hero-bg py-16 mb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Help & Support
          </span>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Support Centre
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We are here to help. Choose a support category below or write to us directly at{' '}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-blue-600 font-medium hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Working hours: {siteConfig.contact.workingHours} &bull; Response time: 1–2 business days
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support Categories */}
        <div className="mb-16">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-2 text-center">
            What do you need help with?
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Click a category to send a pre-formatted email to our support team.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <a
                key={cat.title}
                href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(cat.subject)}&body=${encodeURIComponent(`Hello Instantatoz Support,\n\nI need help with: ${cat.title}\n\n[Please describe your issue here]\n\nJob ID (if applicable):\nDate/Time:\nRegistered Phone/Email:\n\nThank you`)}`}
                className={`block rounded-2xl border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 group ${cat.color.replace('text-', 'hover:border-')}`}
                style={{ background: 'white' }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-4 ${cat.color.split(' ')[0]}`}>
                  {cat.icon}
                </div>
                <h3 className="font-jakarta font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{cat.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  <span>Send Email</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-10">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                ✉️
              </div>
              <div>
                <h2 className="font-jakarta text-2xl font-bold text-gray-900">Send a Message</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Fill in the form and we will respond within 1–2 business days.
                </p>
              </div>
            </div>

            <form
              action={`mailto:${siteConfig.supportEmail}`}
              method="get"
              encType="text/plain"
              className="space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="name">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="phone">
                    Registered Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="category">
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.title} value={`${c.title} - Instantatoz Support`}>
                        {c.icon} {c.title}
                      </option>
                    ))}
                    <option value="Other - Instantatoz Support">🔹 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="jobid">
                  Job ID / Transaction ID (if applicable)
                </label>
                <input
                  id="jobid"
                  name="jobid"
                  type="text"
                  placeholder="e.g. JOB-20260810-XXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="message">
                  Describe Your Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="body"
                  rows={5}
                  required
                  placeholder="Please describe your issue in detail, including what happened, when it happened, and what you expect as a resolution..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed">
                  I confirm that the information provided is accurate. I understand that Instantatoz
                  will use this information solely to address my support request as described in the{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send Support Request
              </button>
              <p className="text-xs text-gray-400 mt-2">
                This will open your email client. If it does not open, email us directly at{' '}
                <a href={`mailto:${siteConfig.supportEmail}`} className="text-blue-600 hover:underline">
                  {siteConfig.supportEmail}
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Helpful resources */}
        <div className="mb-16">
          <h2 className="font-jakarta text-2xl font-bold text-gray-900 mb-6 text-center">
            Helpful Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{link.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-semibold text-sm text-gray-900 group-hover:text-blue-700 truncate">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* SLA note */}
        <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-600 text-center border border-gray-200">
          <p>
            <strong className="text-gray-800">Response Time:</strong> We aim to respond to all support
            requests within <strong className="text-gray-800">1–2 business days</strong> (Monday–Saturday,
            excluding public holidays). Complex disputes may take longer. For urgent safety issues, email us
            with the subject line <strong className="text-gray-800">"URGENT"</strong> for priority handling.
          </p>
        </div>
      </div>
    </div>
  );
}
