import type { MetadataRoute } from 'next';

const BASE_URL = 'https://instantatoz.online';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: '', priority: 1.0 },
    { path: '/services', priority: 0.9 },
    { path: '/find-a-worker', priority: 0.9 },
    { path: '/how-it-works', priority: 0.8 },
    { path: '/pricing', priority: 0.8 },
    { path: '/become-a-worker', priority: 0.8 },
    { path: '/worker-requirements', priority: 0.7 },
    { path: '/download-app', priority: 0.7 },
    { path: '/about-us', priority: 0.7 },
    { path: '/safety', priority: 0.6 },
    { path: '/faq', priority: 0.7 },
    { path: '/support', priority: 0.6 },
    { path: '/contact-us', priority: 0.7 },
    { path: '/terms-and-conditions', priority: 0.5 },
    { path: '/privacy-policy', priority: 0.5 },
    { path: '/user-terms', priority: 0.5 },
    { path: '/worker-terms', priority: 0.5 },
    { path: '/payment-policy', priority: 0.5 },
    { path: '/refund-policy', priority: 0.5 },
    { path: '/cancellation-policy', priority: 0.5 },
    { path: '/worker-verification-policy', priority: 0.4 },
    { path: '/grievance-redressal', priority: 0.4 },
    { path: '/cookie-policy', priority: 0.3 },
    { path: '/disclaimer', priority: 0.3 },
    { path: '/community-guidelines', priority: 0.4 },
    { path: '/acceptable-use-policy', priority: 0.3 },
    { path: '/accessibility', priority: 0.3 },
    { path: '/sitemap', priority: 0.2 },
  ];

  const categoryPages = [
    'computer-office-work',
    'healthcare-assistance',
    'education-tutoring',
    'labour-construction',
    'cleaning-maintenance',
    'delivery-transport',
    'domestic-work',
    'agriculture-gardening',
    'hotel-event-tourism',
    'retail-store-work',
    'skilled-services',
    'other-local-work',
  ];

  return [
    ...staticPages.map(({ path, priority }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority,
    })),
    ...categoryPages.map((slug) => ({
      url: `${BASE_URL}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
