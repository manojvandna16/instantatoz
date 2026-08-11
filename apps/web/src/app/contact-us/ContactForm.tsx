'use client';

import { useActionState } from 'react';
import { useRef } from 'react';
import { submitContactForm, type ContactFormState } from './actions';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const initialState: ContactFormState = { status: 'idle', message: '' };

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  // Reset form on success
  if (state.status === 'success' && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Success banner */}
      {state.status === 'success' && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-800 text-sm font-medium">{state.message}</p>
        </div>
      )}

      {/* Error banner */}
      {state.status === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm font-medium">{state.message}</p>
        </div>
      )}

      {/* Name row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            disabled={isPending}
            placeholder="Your first name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            disabled={isPending}
            placeholder="Your last name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          disabled={isPending}
          placeholder="+91 XXXXX XXXXX"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          disabled={isPending}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition"
        >
          <option value="">Select a subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Worker Registration">Worker Registration</option>
          <option value="Payment / Billing">Payment / Billing</option>
          <option value="Complaint">Complaint</option>
          <option value="Business Partnership">Business Partnership</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={isPending}
          placeholder="Describe your question or concern..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Send Message'
        )}
      </button>

      <p className="text-gray-400 text-xs text-center">
        By submitting, you agree to our{' '}
        <Link href="/privacy-policy" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
        . Or email us directly at{' '}
        <a href="mailto:support@instantatoz.online" className="text-blue-500 hover:underline">
          support@instantatoz.online
        </a>
        .
      </p>
    </form>
  );
}
