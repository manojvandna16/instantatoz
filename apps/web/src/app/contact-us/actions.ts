'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/db';

export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const firstName = formData.get('firstName')?.toString().trim() ?? '';
  const lastName = formData.get('lastName')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';
  const phone = formData.get('phone')?.toString().trim() ?? '';
  const subject = formData.get('subject')?.toString().trim() ?? '';
  const message = formData.get('message')?.toString().trim() ?? '';

  // Basic validation
  if (!firstName || !email || !subject || !message) {
    return { status: 'error', message: 'Please fill in all required fields.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  if (message.length < 10) {
    return { status: 'error', message: 'Message must be at least 10 characters.' };
  }

  try {
    await adminDb.collection(COLLECTIONS.CONTACT_FORMS).add({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      source: 'website_contact_page',
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      status: 'success',
      message: "Thank you! We've received your message and will respond within 1–2 business days.",
    };
  } catch (error) {
    console.error('[ContactForm] Firestore save failed:', error);
    return {
      status: 'error',
      message:
        'Something went wrong on our end. Please email us directly at support@instantatoz.online.',
    };
  }
}
