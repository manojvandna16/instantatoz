// =============================================================
// Instantatoz — Site Configuration
// Central place to update brand info, navigation, categories
// =============================================================

export const siteConfig = {
  name: 'Instantatoz',
  tagline: 'Find Help. Get Work. Instantly.',
  description:
    'Instantatoz is an on-demand hourly workforce marketplace connecting customers who need short-term workers with verified service providers nearby.',
  url: 'https://instantatoz.online',
  supportEmail: 'support@instantatoz.online',
  domain: 'instantatoz.online',

  // Social media — update when accounts are created
  social: {
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  },

  // App store links — update when apps are published
  apps: {
    userApp: {
      playStore: '',
      appStore: '',
      status: 'coming-soon' as const,
    },
    workerApp: {
      playStore: '',
      appStore: '',
      status: 'coming-soon' as const,
    },
  },

  // Contact info — update with real details
  contact: {
    email: 'support@instantatoz.online',
    phone: '', // Add when available
    address: '', // Add when available
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    workingHours: 'Monday – Saturday, 9:00 AM – 6:00 PM IST',
  },

  // Business info — update after registration
  business: {
    gstin: '', // Add after GST registration
    cin: '', // Add after company registration
    registrationNumber: '',
  },

  // Grievance officer — update before launch
  grievanceOfficer: {
    name: '', // Add before launch
    email: 'support@instantatoz.online',
    phone: '',
    address: '',
    responseTimeDays: 30,
  },
} as const;

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About Us', href: '/about-us' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact-us' },
] as const;

export const footerLinks = {
  platform: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Find a Worker', href: '/find-a-worker' },
    { label: 'Services', href: '/services' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Download App', href: '/download-app' },
    { label: 'Safety', href: '/safety' },
  ],
  forWorkers: [
    { label: 'Become a Worker', href: '/become-a-worker' },
    { label: 'Worker Requirements', href: '/worker-requirements' },
    { label: 'Worker Terms', href: '/worker-terms' },
    { label: 'Worker Verification Policy', href: '/worker-verification-policy' },
    { label: 'Community Guidelines', href: '/community-guidelines' },
  ],
  company: [
    { label: 'About Us', href: '/about-us' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Support', href: '/support' },
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Grievance Redressal', href: '/grievance-redressal' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'User Terms', href: '/user-terms' },
    { label: 'Worker Terms', href: '/worker-terms' },
    { label: 'Payment Policy', href: '/payment-policy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Cancellation Policy', href: '/cancellation-policy' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
  ],
} as const;

export const serviceCategories = [
  {
    id: 'computer-office',
    name: 'Computer & Office Work',
    slug: 'computer-office-work',
    description: 'Computer operators, data entry, typing, document editing, and online work.',
    icon: '💻',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    subcategories: [
      'Computer Operator',
      'Data Entry',
      'Typing Work',
      'Online Form Filling',
      'Document Editing',
      'Spreadsheet Work',
      'Digital Filing',
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare Assistance',
    slug: 'healthcare-assistance',
    description: 'Medical store helpers, nursing assistants, patient attendants, and lab assistance.',
    icon: '🏥',
    color: 'from-red-500 to-pink-600',
    bgLight: 'bg-red-50',
    subcategories: [
      'Patient Attendant',
      'Nursing Assistant',
      'Medical Store Helper',
      'Pharmacist Assistant',
      'Lab Sample Assistance',
      'Hospital Helper',
    ],
  },
  {
    id: 'education',
    name: 'Education & Tutoring',
    slug: 'education-tutoring',
    description: 'Home tutors, online class assistants, content writers, and coaching helpers.',
    icon: '📚',
    color: 'from-yellow-500 to-orange-500',
    bgLight: 'bg-yellow-50',
    subcategories: [
      'Home Tutor',
      'Online Class Assistant',
      'Content Writer',
      'Coaching Helper',
      'Library Assistant',
      'Exam Preparation Guide',
    ],
  },
  {
    id: 'labour-construction',
    name: 'Labour & Construction',
    slug: 'labour-construction',
    description: 'General helpers, construction workers, loading/unloading, packing, and brick/cement work.',
    icon: '🔨',
    color: 'from-orange-600 to-amber-600',
    bgLight: 'bg-orange-50',
    subcategories: [
      'General Labour',
      'Construction Worker',
      'Loading Worker',
      'Unloading Worker',
      'Packing Worker',
      'Brick Work',
      'Cement Work',
      'Site Helper',
    ],
  },
  {
    id: 'cleaning-maintenance',
    name: 'Cleaning & Maintenance',
    slug: 'cleaning-maintenance',
    description: 'Office, hotel, home, and society cleaning services.',
    icon: '🧹',
    color: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    subcategories: [
      'Home Cleaning',
      'Office Cleaning',
      'Hotel Room Cleaning',
      'Washroom Cleaning',
      'Society/Building Cleaning',
      'Deep Cleaning',
      'Glass Cleaning',
    ],
  },
  {
    id: 'delivery-transport',
    name: 'Delivery & Transport',
    slug: 'delivery-transport',
    description: 'Delivery workers, bike delivery, goods transport, drivers, and pickup/drop services.',
    icon: '🛵',
    color: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    subcategories: [
      'Delivery Worker',
      'Bike Delivery',
      'Goods Delivery',
      'Driver',
      'Pickup & Drop',
      'Last-Mile Delivery',
    ],
  },
  {
    id: 'domestic-work',
    name: 'Domestic Work',
    slug: 'domestic-work',
    description: 'Cooks, home helpers, baby care, elder care, and housekeeping.',
    icon: '🏠',
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    subcategories: [
      'Cook',
      'Home Helper',
      'Baby Care',
      'Elder Care',
      'Housekeeping',
      'Meal Preparation',
      'Dish Washing',
    ],
  },
  {
    id: 'agriculture-gardening',
    name: 'Agriculture & Gardening',
    slug: 'agriculture-gardening',
    description: 'Gardening, plant care, nursery work, farm helpers, and fruit collection.',
    icon: '🌱',
    color: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    subcategories: [
      'Gardening',
      'Plant Care',
      'Nursery Worker',
      'Farm Helper',
      'Fruit Collection',
      'Vegetable Harvesting',
      'Landscaping',
    ],
  },
  {
    id: 'hotel-event',
    name: 'Hotel, Event & Tourism',
    slug: 'hotel-event-tourism',
    description: 'Event helpers, hotel staff, kitchen helpers, waiters, and tour assistants.',
    icon: '🏨',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    subcategories: [
      'Event Helper',
      'Hotel Staff',
      'Kitchen Helper',
      'Waiter / Steward',
      'Housekeeping Staff',
      'Banquet Helper',
      'Tour Guide Assistant',
    ],
  },
  {
    id: 'retail-store',
    name: 'Retail & Store Work',
    slug: 'retail-store-work',
    description: 'Shop assistants, sales staff, cash counter, stock management, and packaging.',
    icon: '🛒',
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    subcategories: [
      'Shop Assistant',
      'Sales Boy / Girl',
      'Cash Counter',
      'Stock Management',
      'Packaging',
      'Inventory Helper',
      'Display Arrangement',
    ],
  },
  {
    id: 'skilled-services',
    name: 'Skilled Services',
    slug: 'skilled-services',
    description: 'Electricians, plumbers, carpenters, painters, and mechanics.',
    icon: '⚡',
    color: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
    subcategories: [
      'Electrician',
      'Plumber',
      'Carpenter',
      'Painter',
      'Mechanic',
      'AC Technician',
      'Appliance Repair',
    ],
  },
  {
    id: 'other-work',
    name: 'Other Local Work',
    slug: 'other-local-work',
    description: 'Survey work, advertisement, social media assistance, part-time marketing, and other local services.',
    icon: '🤝',
    color: 'from-slate-500 to-gray-600',
    bgLight: 'bg-slate-50',
    subcategories: [
      'Survey Work',
      'Advertisement Work',
      'Social Media Assistant',
      'Part-Time Marketing',
      'Promotional Work',
      'Flyer Distribution',
      'Other Local Work',
    ],
  },
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];
