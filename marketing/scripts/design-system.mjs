/**
 * Lumbus Design System for Marketing Assets
 * Matches the app's exact design language
 */

export const colors = {
  // Primary Colors
  primary: '#2EFECC',        // Turquoise/Mint - main brand color
  primaryDark: '#1DCCA0',    // Darker turquoise
  secondary: '#FDFD74',      // Yellow
  secondaryDark: '#E5E54D',  // Darker yellow
  accent: '#87EFFF',         // Cyan

  // Supporting Colors
  purple: '#F7E2FB',         // Pastel purple
  mint: '#E0FEF7',           // Light mint
  mintLight: '#F0FFFB',      // Very light mint
  blueLight: '#F0FBFF',      // Very light blue

  // Base Colors
  background: '#FFFFFF',     // White
  foreground: '#1A1A1A',     // Near black (text)
  muted: '#F5F5F5',          // Muted backgrounds
  mutedText: '#666666',      // Secondary text
  destructive: '#EF4444',    // Red
  border: '#E5E5E5',         // Borders

  // Card rotation colors
  cardColors: ['#2EFECC', '#87EFFF', '#F7E2FB', '#FDFD74', '#E0FEF7'],
};

export const typography = {
  // Font weights
  black: 900,
  bold: 700,
  semibold: 600,
  medium: 500,

  // Common sizes
  hero: 72,
  title: 48,
  subtitle: 32,
  heading: 24,
  body: 18,
  small: 14,
  tiny: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Platform dimensions (2025 updated)
export const dimensions = {
  // App Store (iOS)
  appStore: {
    '6.5': { width: 1284, height: 2778 },  // iPhone 14 Pro Max
    '5.5': { width: 1242, height: 2208 },  // iPhone 8 Plus
  },
  // Play Store (Android)
  playStore: {
    phone: { width: 1080, height: 1920 },
    tablet7: { width: 1200, height: 1920 },
    tablet10: { width: 1920, height: 1200 },
  },
  // Instagram (2025)
  instagram: {
    square: { width: 1080, height: 1080 },      // 1:1 feed post
    portrait: { width: 1080, height: 1350 },    // 4:5 feed post (preferred)
    story: { width: 1080, height: 1920 },       // 9:16 stories/reels
  },
  // TikTok (2025)
  tiktok: {
    video: { width: 1080, height: 1920 },       // 9:16 videos
    square: { width: 1080, height: 1080 },      // 1:1 carousel
  },
};

// iPhone frame dimensions (for mockups)
export const iphoneFrame = {
  // iPhone 14 Pro style
  width: 380,
  height: 780,
  borderRadius: 55,
  screenRadius: 45,
  bezelWidth: 12,
  notchWidth: 120,
  notchHeight: 35,
  notchRadius: 20,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  dimensions,
  iphoneFrame,
};
