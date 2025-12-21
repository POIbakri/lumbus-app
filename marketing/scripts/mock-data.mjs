/**
 * Mock Data for Marketing Assets
 * Realistic data that showcases the app's features
 */

export const regions = [
  { name: 'Japan', flag: '🇯🇵', plans: 8, startingPrice: '$4.99' },
  { name: 'United States', flag: '🇺🇸', plans: 12, startingPrice: '$3.99' },
  { name: 'United Kingdom', flag: '🇬🇧', plans: 10, startingPrice: '$4.49' },
  { name: 'Thailand', flag: '🇹🇭', plans: 9, startingPrice: '$2.99' },
  { name: 'France', flag: '🇫🇷', plans: 8, startingPrice: '$4.99' },
  { name: 'Australia', flag: '🇦🇺', plans: 7, startingPrice: '$5.99' },
  { name: 'Germany', flag: '🇩🇪', plans: 8, startingPrice: '$4.49' },
  { name: 'Italy', flag: '🇮🇹', plans: 6, startingPrice: '$4.99' },
  { name: 'Spain', flag: '🇪🇸', plans: 7, startingPrice: '$4.49' },
  { name: 'Singapore', flag: '🇸🇬', plans: 5, startingPrice: '$3.99' },
  { name: 'South Korea', flag: '🇰🇷', plans: 8, startingPrice: '$4.99' },
  { name: 'Indonesia', flag: '🇮🇩', plans: 6, startingPrice: '$2.99' },
];

export const regionalPlans = [
  { name: 'Europe', flag: '🇪🇺', countries: 39, plans: 15, startingPrice: '$9.99' },
  { name: 'Asia Pacific', flag: '🌏', countries: 28, plans: 12, startingPrice: '$8.99' },
  { name: 'Americas', flag: '🌎', countries: 22, plans: 10, startingPrice: '$7.99' },
  { name: 'Middle East', flag: '🌍', countries: 12, plans: 8, startingPrice: '$6.99' },
  { name: 'Global', flag: '🌐', countries: 150, plans: 8, startingPrice: '$19.99' },
];

export const plans = [
  { data: '1GB', validity: '7 Days', price: '$4.99', popular: false },
  { data: '3GB', validity: '30 Days', price: '$9.99', popular: true },
  { data: '5GB', validity: '30 Days', price: '$14.99', popular: false },
  { data: '10GB', validity: '30 Days', price: '$24.99', popular: true },
  { data: '20GB', validity: '30 Days', price: '$39.99', popular: false },
  { data: 'Unlimited', validity: '7 Days', price: '$29.99', popular: true },
];

export const activeEsims = [
  {
    region: 'Japan',
    flag: '🇯🇵',
    dataRemaining: '4.2GB',
    dataTotal: '5GB',
    percentUsed: 16,
    validUntil: 'Dec 28, 2024',
    daysLeft: 9,
    status: 'active',
  },
  {
    region: 'Thailand',
    flag: '🇹🇭',
    dataRemaining: '1.8GB',
    dataTotal: '3GB',
    percentUsed: 40,
    validUntil: 'Dec 22, 2024',
    daysLeft: 3,
    status: 'active',
  },
  {
    region: 'Europe',
    flag: '🇪🇺',
    dataRemaining: '8.5GB',
    dataTotal: '10GB',
    percentUsed: 15,
    validUntil: 'Jan 15, 2025',
    daysLeft: 27,
    status: 'active',
  },
];

export const pendingEsims = [
  {
    region: 'United States',
    flag: '🇺🇸',
    data: '10GB',
    validity: '30 Days',
    status: 'ready_to_activate',
  },
];

export const features = [
  {
    icon: '🌍',
    title: '150+ Countries',
    description: 'Stay connected worldwide',
  },
  {
    icon: '⚡',
    title: 'Instant Activation',
    description: 'No physical SIM needed',
  },
  {
    icon: '💰',
    title: 'Affordable Rates',
    description: 'Save up to 90% on roaming',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data stays safe',
  },
  {
    icon: '📱',
    title: 'Easy Setup',
    description: 'Activate in 2 minutes',
  },
  {
    icon: '🔄',
    title: 'Top Up Anytime',
    description: 'Add data when you need it',
  },
];

export const testimonials = [
  {
    name: 'Sarah M.',
    location: 'New York',
    text: 'Saved so much on my Japan trip! Setup was incredibly easy.',
    rating: 5,
  },
  {
    name: 'James L.',
    location: 'London',
    text: 'Best eSIM app I\'ve used. Works perfectly across Europe.',
    rating: 5,
  },
  {
    name: 'Maria G.',
    location: 'Sydney',
    text: 'No more hunting for local SIMs at airports. Game changer!',
    rating: 5,
  },
];

export const stats = {
  countries: '150+',
  downloads: '100K+',
  rating: '4.8',
  savings: '90%',
};

export const marketingCopy = {
  taglines: [
    'Travel Connected',
    'Data Without Borders',
    'Your Passport to Connectivity',
    'Stay Connected Anywhere',
    'Roam Free, Pay Less',
  ],
  headlines: [
    'Instant eSIM for Travelers',
    'Global Data in Seconds',
    'No More Roaming Fees',
    'Travel Smarter with eSIM',
    'Connect Worldwide Instantly',
  ],
  ctas: [
    'Get Started',
    'Download Now',
    'Try Free',
    'Start Saving',
    'Get Your eSIM',
  ],
  descriptions: [
    'Get instant mobile data in 150+ countries. No physical SIM needed.',
    'Activate your eSIM in minutes and stay connected anywhere in the world.',
    'Save up to 90% on roaming fees with affordable eSIM data plans.',
    'The easiest way to get mobile data abroad. Download, activate, connect.',
  ],
};

export default {
  regions,
  regionalPlans,
  plans,
  activeEsims,
  pendingEsims,
  features,
  testimonials,
  stats,
  marketingCopy,
};
