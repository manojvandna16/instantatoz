import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { ServiceCategories } from '@/components/home/ServiceCategories';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ForUsersSection } from '@/components/home/ForUsersSection';
import { ForWorkersSection } from '@/components/home/ForWorkersSection';
import { WhyInstantatozSection } from '@/components/home/WhyInstantatozSection';
import { MobileAppsSection } from '@/components/home/MobileAppsSection';
import { PricingPreviewSection } from '@/components/home/PricingPreviewSection';
import { FAQPreviewSection } from '@/components/home/FAQPreviewSection';
import { CTASection } from '@/components/home/CTASection';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description:
    'Book verified local workers for short-term and hourly tasks through Instantatoz — India\'s on-demand hourly workforce marketplace.',
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      'Book verified local workers for short-term and hourly tasks through Instantatoz.',
    url: siteConfig.url,
  },
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD: Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
            email: siteConfig.supportEmail,
            description: siteConfig.description,
            areaServed: 'India',
            serviceType: 'On-demand hourly workforce marketplace',
          }),
        }}
      />

      <HeroSection />
      <ServiceCategories />
      <HowItWorksSection />
      <ForUsersSection />
      <ForWorkersSection />
      <WhyInstantatozSection />
      <PricingPreviewSection />
      <MobileAppsSection />
      <FAQPreviewSection />
      <CTASection />
    </>
  );
}
