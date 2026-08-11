import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serviceCategories } from '@/config/site';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return serviceCategories.map((cat) => ({ category: cat.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = serviceCategories.find((c) => c.slug === slug);
  if (!cat) return { title: 'Service Not Found | Instantatoz' };
  return {
    title: `${cat.name} | Instantatoz Services`,
    description: `Book verified ${cat.name.toLowerCase()} workers on-demand through Instantatoz. ${cat.description}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = serviceCategories.find((c) => c.slug === slug);

  if (!category) notFound();

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/services" className="hover:text-blue-600 transition-colors">Services</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className={`${category.bgLight} py-14 mb-14`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl ${category.bgLight} border-2 border-white shadow-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-4xl">{category.icon}</span>
            </div>
            <div>
              <h1 className="font-jakarta text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Subcategories */}
          <div className="lg:col-span-2">
            <h2 className="font-jakarta font-bold text-xl text-gray-900 mb-5">
              Available Subcategories
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {category.subcategories.map((sub) => (
                <div
                  key={sub}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-800 font-medium text-sm">{sub}</span>
                </div>
              ))}
            </div>

            {/* How it works for this category */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-3">
                How to Book a {category.name} Worker
              </h3>
              <ol className="space-y-3">
                {[
                  `Select "${category.name}" as your service category`,
                  'Choose the specific subcategory or skill you need',
                  'Enter job details: location, number of workers, expected hours',
                  'Post your requirement — nearby eligible workers will be notified',
                  'A worker accepts and navigates to your location',
                  'Verify the worker with OTP before work begins',
                  'Work timer starts after OTP verification',
                  'Pay after work completion based on actual hours worked',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card-premium p-6">
              <h3 className="font-jakarta font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/find-a-worker"
                  className="block w-full text-center px-4 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                >
                  Find a {category.name.split(' ')[0]} Worker
                </Link>
                <Link
                  href="/how-it-works"
                  className="block w-full text-center px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full text-center px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <p className="text-amber-800 text-sm font-semibold mb-2">Note on Regulated Professions</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                For categories involving healthcare, electrical, or other regulated professions, workers
                are expected to hold applicable qualifications or licences as required by law.
                Verification requirements may vary by category.
              </p>
            </div>

            <div className="card-premium p-5">
              <p className="text-gray-900 font-semibold text-sm mb-2">Need Help?</p>
              <p className="text-gray-500 text-xs mb-3">
                Can&apos;t find what you&apos;re looking for? Contact our support team.
              </p>
              <a
                href="mailto:support@instantatoz.online"
                className="text-blue-600 text-xs font-medium hover:underline"
              >
                support@instantatoz.online
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Services
          </Link>
        </div>
      </div>
    </div>
  );
}
