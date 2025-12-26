/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   LUMBUS ULTIMATE MARKETING GENERATOR                                     ║
 * ║   World-Class Design for Instagram & TikTok                               ║
 * ║                                                                           ║
 * ║   Combines the best of V1-V7:                                            ║
 * ║   • V1/V2: Modular architecture, icon system, design tokens              ║
 * ║   • V4: Viral formats, real flags, meme templates                        ║
 * ║   • V6: Premium Apple-level components                                    ║
 * ║   • V7: Supreme typography, glassmorphism, bento layouts                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Refined for maximum impact
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  // Brand
  primary: '#2EFECC',
  primaryDark: '#1DCCA0',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  purple: '#F7E2FB',
  mint: '#E0FEF7',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  dark: '#0A0A0A',
  darker: '#050505',
  gray: '#8E8E93',
  lightGray: '#1C1C1E',
  border: '#2A2A2A',

  // Accent colors
  red: '#FF3B30',
  green: '#34C759',
  blue: '#007AFF',
  orange: '#FF9500',
  pink: '#FF2D55',

  // Brand parodies
  netflix: '#E50914',
  spotify: '#1DB954',
  imessage: '#34C759',
  whatsapp: '#25D366',
  twitter: '#1DA1F2',

  // Glassmorphism
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassLight: 'rgba(255,255,255,0.15)',
};

const typography = {
  // Supreme scale - designed for impact
  supreme: 200,    // Country names, hero text
  hero: 160,       // Major headlines
  massive: 120,    // Large numbers, stats
  display: 96,     // Display text
  title: 72,       // Section titles
  headline: 56,    // Headlines
  subtitle: 40,    // Subtitles
  body: 28,        // Body large
  text: 22,        // Body text
  small: 18,       // Small text
  label: 14,       // Labels
  micro: 12,       // Micro text
};

const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 60,
  xxl: 80,
  supreme: 100,
};

// Output dimensions
const DIM = {
  // Instagram
  SQUARE: { w: 1080, h: 1080 },      // Feed square
  PORTRAIT: { w: 1080, h: 1350 },    // Feed portrait (preferred)
  STORY: { w: 1080, h: 1920 },       // Stories/Reels
  // TikTok
  TIKTOK: { w: 1080, h: 1920 },      // TikTok videos
};

// ═══════════════════════════════════════════════════════════════════════════
// ASSET MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

let logoIcon = null;
let logoFull = null;
const flagCache = {};

async function loadLogos() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {
    console.log('   ○ Icon logo not found (using fallback)');
  }

  try {
    const fullBuffer = await fs.readFile(path.join(ROOT, 'assets', 'logotrans.png'));
    logoFull = `data:image/png;base64,${fullBuffer.toString('base64')}`;
    console.log('   ✓ Full logo loaded');
  } catch (e) {
    console.log('   ○ Full logo not found (using fallback)');
  }
}

async function loadFlag(code) {
  if (flagCache[code]) return flagCache[code];

  try {
    const url = `https://flagcdn.com/w640/${code.toLowerCase()}.png`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Flag not found');
    const buffer = Buffer.from(await response.arrayBuffer());
    flagCache[code] = `data:image/png;base64,${buffer.toString('base64')}`;
    return flagCache[code];
  } catch (e) {
    return null;
  }
}

async function loadAllFlags() {
  const codes = [
    'jp', 'th', 'fr', 'it', 'au', 'de', 'es', 'gb', 'us', 'sg', 'kr', 'id',
    'br', 'mx', 'ca', 'nl', 'pt', 'gr', 'tr', 'ae', 'nz', 'vn', 'ph', 'my',
    'ch', 'at', 'be', 'dk', 'fi', 'no', 'se', 'ie', 'pl', 'cz', 'hu', 'eg'
  ];
  console.log('   Loading flags from CDN...');
  await Promise.all(codes.map(c => loadFlag(c)));
  console.log(`   ✓ ${Object.keys(flagCache).length} flags cached`);
}

async function loadFonts() {
  console.log('   Downloading Inter font family...');
  const fontUrls = {
    regular: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff',
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    semibold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };

  const fontData = {};
  for (const [name, url] of Object.entries(fontUrls)) {
    const response = await fetch(url);
    fontData[name] = Buffer.from(await response.arrayBuffer());
  }

  console.log('   ✓ Fonts loaded');
  return [
    { name: 'Inter', data: fontData.regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fontData.medium, weight: 500, style: 'normal' },
    { name: 'Inter', data: fontData.semibold, weight: 600, style: 'normal' },
    { name: 'Inter', data: fontData.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fontData.black, weight: 900, style: 'normal' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const COUNTRIES = [
  { name: 'Japan', code: 'jp', price: '$1.99', vibe: 'Tokyo nights await', emoji: '🇯🇵', popular: true },
  { name: 'Thailand', code: 'th', price: '$1.99', vibe: 'Beach mode: ON', emoji: '🇹🇭', popular: true },
  { name: 'France', code: 'fr', price: '$2.49', vibe: 'Bonjour high-speed', emoji: '🇫🇷', popular: true },
  { name: 'Italy', code: 'it', price: '$2.49', vibe: 'Ciao roaming fees', emoji: '🇮🇹', popular: true },
  { name: 'Australia', code: 'au', price: '$2.99', vibe: "G'day connectivity", emoji: '🇦🇺' },
  { name: 'Germany', code: 'de', price: '$2.49', vibe: 'Wunderbar coverage', emoji: '🇩🇪' },
  { name: 'Spain', code: 'es', price: '$2.49', vibe: 'Hola fast data', emoji: '🇪🇸' },
  { name: 'UK', code: 'gb', price: '$2.49', vibe: 'Brilliant connection', emoji: '🇬🇧' },
  { name: 'USA', code: 'us', price: '$1.99', vibe: 'Coast to coast', emoji: '🇺🇸', popular: true },
  { name: 'Singapore', code: 'sg', price: '$1.99', vibe: 'Smart city ready', emoji: '🇸🇬' },
  { name: 'South Korea', code: 'kr', price: '$2.49', vibe: 'K-connected', emoji: '🇰🇷' },
  { name: 'Indonesia', code: 'id', price: '$1.99', vibe: 'Island hopping', emoji: '🇮🇩' },
  { name: 'Brazil', code: 'br', price: '$2.99', vibe: 'Samba with signal', emoji: '🇧🇷' },
  { name: 'Mexico', code: 'mx', price: '$2.49', vibe: 'Vamos connected', emoji: '🇲🇽' },
  { name: 'Vietnam', code: 'vn', price: '$1.99', vibe: 'Xin chào data', emoji: '🇻🇳' },
  { name: 'UAE', code: 'ae', price: '$2.99', vibe: 'Desert luxury', emoji: '🇦🇪' },
  { name: 'Canada', code: 'ca', price: '$2.49', vibe: 'True north data', emoji: '🇨🇦' },
  { name: 'Netherlands', code: 'nl', price: '$2.49', vibe: 'Perfectly connected', emoji: '🇳🇱' },
];

const REGIONS = [
  { name: 'Europe', codes: ['fr', 'de', 'it', 'es', 'nl', 'pt', 'gr', 'gb', 'ch', 'at'], count: 39, price: '$4.99' },
  { name: 'Asia Pacific', codes: ['jp', 'th', 'kr', 'sg', 'vn', 'my', 'ph', 'id', 'au', 'nz'], count: 28, price: '$3.99' },
  { name: 'Americas', codes: ['us', 'ca', 'mx', 'br'], count: 22, price: '$3.99' },
  { name: 'Middle East', codes: ['ae', 'tr', 'eg'], count: 12, price: '$3.99' },
  { name: 'Global', codes: ['us', 'gb', 'jp', 'fr', 'au', 'de', 'th', 'it'], count: 187, price: '$9.99' },
];

const PLANS = [
  { data: '1GB', days: 7, price: '$1.99', popular: false },
  { data: '3GB', days: 30, price: '$4.99', popular: true },
  { data: '5GB', days: 30, price: '$7.99', popular: false },
  { data: '10GB', days: 30, price: '$12.99', popular: true },
  { data: '20GB', days: 30, price: '$19.99', popular: false },
  { data: 'Unlimited', days: 7, price: '$14.99', popular: true },
];

const STATS = {
  countries: '187+',
  downloads: '500K+',
  rating: '4.9',
  savings: '90%',
  totalSaved: '$2M+',
};

const TESTIMONIALS = [
  { text: 'Saved $300 on my Japan trip. Setup took 30 seconds!', author: 'Sarah M.', location: 'NYC', rating: 5 },
  { text: 'Best travel app ever. Works perfectly across Europe.', author: 'James L.', location: 'London', rating: 5 },
  { text: 'No more airport SIM hunting. This is a game changer!', author: 'Maria G.', location: 'Sydney', rating: 5 },
  { text: "Can't believe I used to pay roaming fees. Never again.", author: 'Alex K.', location: 'Toronto', rating: 5 },
];

const FEATURES = [
  { icon: 'globe', title: '187+ Countries', desc: 'Global coverage' },
  { icon: 'lightning', title: 'Instant Setup', desc: 'Ready in 30 seconds' },
  { icon: 'wallet', title: 'Save 90%', desc: 'vs carrier roaming' },
  { icon: 'shield', title: 'Secure', desc: 'Private & encrypted' },
  { icon: 'refresh', title: 'Easy Top-Up', desc: 'Anytime, anywhere' },
  { icon: 'signal', title: '5G/LTE', desc: 'High-speed data' },
];

// ═══════════════════════════════════════════════════════════════════════════
// ELEMENT HELPERS - Clean, composable architecture
// ═══════════════════════════════════════════════════════════════════════════

const el = (type, style, children) => ({
  type,
  props: {
    style: { display: 'flex', ...style },
    children: Array.isArray(children)
      ? children.filter(c => c !== null && c !== undefined)
      : children,
  },
});

const txt = (content, style = {}) => {
  if (content === undefined || content === null) return null;
  return {
    type: 'div',
    props: {
      style: { display: 'flex', ...style },
      children: String(content)
    }
  };
};

const img = (src, style = {}) => {
  if (!src) return null;
  return {
    type: 'img',
    props: { src, style }
  };
};

const svg = (props, children) => ({
  type: 'svg',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    ...props,
    children,
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SVG ICONS - Complete icon library
// ═══════════════════════════════════════════════════════════════════════════

const Icons = {
  globe: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'circle', props: { cx: 12, cy: 12, r: 10, stroke: color, strokeWidth: 2 } },
    { type: 'path', props: { d: 'M2 12h20', stroke: color, strokeWidth: 2 } },
    { type: 'path', props: { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', stroke: color, strokeWidth: 2 } },
  ]),

  lightning: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', fill: color } },
  ]),

  plane: ({ size = 24, color = colors.white, rotation = 0 }) => svg({ width: size, height: size, style: { transform: `rotate(${rotation}deg)` } }, [
    { type: 'path', props: { d: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', fill: color } },
  ]),

  shield: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'path', props: { d: 'M9 12l2 2 4-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
  ]),

  star: ({ size = 24, color = colors.white, filled = true }) => svg({ width: size, height: size }, [
    { type: 'path', props: {
      d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      fill: filled ? color : 'none', stroke: color, strokeWidth: 2
    }},
  ]),

  check: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M20 6L9 17l-5-5', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } },
  ]),

  x: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M18 6L6 18M6 6l12 12', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
  ]),

  signal: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M2 20h.01', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
    { type: 'path', props: { d: 'M7 20v-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
    { type: 'path', props: { d: 'M12 20v-8', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
    { type: 'path', props: { d: 'M17 20v-12', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
    { type: 'path', props: { d: 'M22 20v-16', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
  ]),

  wallet: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'path', props: { d: 'M1 10h22', stroke: color, strokeWidth: 2 } },
    { type: 'circle', props: { cx: 18, cy: 14, r: 2, fill: color } },
  ]),

  refresh: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M23 4v6h-6', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
    { type: 'path', props: { d: 'M1 20v-6h6', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
    { type: 'path', props: { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
  ]),

  download: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
    { type: 'path', props: { d: 'M7 10l5 5 5-5', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
    { type: 'path', props: { d: 'M12 15V3', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
  ]),

  sparkles: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', fill: color } },
    { type: 'path', props: { d: 'M5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z', fill: color } },
    { type: 'path', props: { d: 'M19 14l.5 1.5L21 16l-1.5.5L19 18l-.5-1.5L17 16l1.5-.5L19 14z', fill: color } },
  ]),

  heart: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', fill: color } },
  ]),

  camera: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'path', props: { d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'circle', props: { cx: 12, cy: 13, r: 4, stroke: color, strokeWidth: 2, fill: 'none' } },
  ]),

  qrcode: ({ size = 24, color = colors.white }) => svg({ width: size, height: size }, [
    { type: 'rect', props: { x: 3, y: 3, width: 7, height: 7, stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'rect', props: { x: 14, y: 3, width: 7, height: 7, stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'rect', props: { x: 3, y: 14, width: 7, height: 7, stroke: color, strokeWidth: 2, fill: 'none' } },
    { type: 'rect', props: { x: 5, y: 5, width: 3, height: 3, fill: color } },
    { type: 'rect', props: { x: 16, y: 5, width: 3, height: 3, fill: color } },
    { type: 'rect', props: { x: 5, y: 16, width: 3, height: 3, fill: color } },
    { type: 'rect', props: { x: 14, y: 14, width: 3, height: 3, fill: color } },
    { type: 'rect', props: { x: 17, y: 17, width: 4, height: 4, fill: color } },
  ]),
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAND COMPONENTS - Consistent identity
// ═══════════════════════════════════════════════════════════════════════════

function Logo({ size = 48 }) {
  if (logoIcon) return img(logoIcon, { width: size, height: size });
  return el('div', {
    width: size, height: size, borderRadius: size / 4,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  }, txt('L', { fontSize: size * 0.5, fontWeight: 900, color: colors.black }));
}

function LogoFull({ height = 40, dark = true }) {
  if (logoFull) return img(logoFull, { height, objectFit: 'contain' });
  return el('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
    Logo({ size: height }),
    txt('lumbus', { fontSize: height * 0.7, fontWeight: 800, color: dark ? colors.white : colors.black }),
  ]);
}

function BrandHeader({ dark = true, showUrl = true }) {
  return el('div', {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl
  }, [
    LogoFull({ height: 36, dark }),
    showUrl && txt('getlumbus.com', {
      fontSize: typography.small,
      fontWeight: 700,
      color: dark ? colors.gray : 'rgba(0,0,0,0.5)',
      letterSpacing: 1
    })
  ]);
}

function BrandFooter({ dark = true, cta = 'Download App' }) {
  return el('div', {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg
  }, [
    txt(`${STATS.countries} Countries`, {
      fontSize: typography.label,
      fontWeight: 700,
      color: dark ? colors.gray : 'rgba(0,0,0,0.5)'
    }),
    el('div', {
      padding: '16px 32px',
      backgroundColor: colors.primary,
      borderRadius: 100
    }, [
      txt(cta, { fontSize: typography.label, fontWeight: 900, color: colors.black })
    ])
  ]);
}

function Flag({ code, size = 80 }) {
  const flag = flagCache[code?.toLowerCase()];
  if (flag) {
    return el('div', {
      width: size * 1.5, height: size,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }, img(flag, { width: '100%', height: '100%', objectFit: 'cover' }));
  }
  return el('div', {
    width: size * 1.5, height: size,
    backgroundColor: colors.lightGray, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  }, txt(code?.toUpperCase() || '?', { fontSize: size / 3, fontWeight: 900, color: colors.gray }));
}

function FlagCircle({ code, size = 120 }) {
  const flag = flagCache[code?.toLowerCase()];
  if (flag) {
    return el('div', {
      width: size, height: size, borderRadius: size / 2,
      overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      border: '4px solid rgba(255,255,255,0.1)',
    }, img(flag, { width: size, height: size, objectFit: 'cover' }));
  }
  return el('div', {
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  }, txt(code?.toUpperCase() || '?', { fontSize: size / 3, fontWeight: 900, color: colors.black }));
}

function Stars({ count = 5, size = 20, color = colors.secondary }) {
  return el('div', { flexDirection: 'row', gap: 4 },
    Array.from({ length: count }, (_, i) => Icons.star({ size, color }))
  );
}

function GlassCard({ children, padding = 40, radius = 32 }) {
  return el('div', {
    padding,
    backgroundColor: colors.glass,
    borderRadius: radius,
    border: `1px solid ${colors.glassBorder}`,
    backdropFilter: 'blur(20px)',
    flexDirection: 'column',
  }, children);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: SUPREME HERO - Massive typography with flag
// ═══════════════════════════════════════════════════════════════════════════

function SupremeHero({ name, code, price, vibe }) {
  const flag = flagCache[code];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark,
    padding: spacing.xxl,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  }, [
    // Subtle gradient background
    el('div', {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: `radial-gradient(circle at 30% 20%, ${colors.primary}15 0%, transparent 50%)`,
    }),
    BrandHeader({ dark: true }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('FLY TO', {
        fontSize: typography.text,
        fontWeight: 800,
        color: colors.primary,
        letterSpacing: 12,
        marginBottom: spacing.md
      }),
      txt(name.toUpperCase(), {
        fontSize: typography.supreme,
        fontWeight: 900,
        color: colors.white,
        letterSpacing: -10,
        lineHeight: 0.85
      }),
      vibe && txt(vibe, {
        fontSize: typography.body,
        color: colors.gray,
        marginTop: spacing.md,
      }),
      // Price box with glassmorphism
      el('div', {
        marginTop: spacing.xl,
        padding: '32px 40px',
        backgroundColor: colors.glass,
        borderRadius: 32,
        border: `1px solid ${colors.glassBorder}`,
        alignSelf: 'flex-start',
        flexDirection: 'column'
      }, [
        txt('5G Data Plans from', { fontSize: typography.small, color: colors.gray, marginBottom: 8 }),
        el('div', { flexDirection: 'row', alignItems: 'baseline' }, [
          txt(price, { fontSize: typography.display, fontWeight: 900, color: colors.white, letterSpacing: -4 }),
          txt(' USD', { fontSize: typography.body, fontWeight: 700, color: colors.primary, marginLeft: 8 }),
        ])
      ]),
    ]),
    // Flag at bottom
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, [
      el('div', {
        width: 400, height: 280,
        borderRadius: 32, overflow: 'hidden',
        border: '4px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
      }, [
        img(flag, { width: '100%', height: '100%', objectFit: 'cover' })
      ]),
      el('div', { padding: '20px 40px', backgroundColor: colors.primary, borderRadius: 100 }, [
        txt('Get Started', { fontSize: typography.small, fontWeight: 900, color: colors.black })
      ])
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: CINEMATIC POV - Full-bleed flag background
// ═══════════════════════════════════════════════════════════════════════════

function CinematicPOV({ name, code }) {
  const flag = flagCache[code];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }, [
    // Full bleed flag background
    img(flag, {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      objectFit: 'cover', opacity: 0.5
    }),
    // Radial gradient overlay
    el('div', {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.85) 100%)'
    }),
    // Dark bottom gradient
    el('div', {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
    }),
    // Content
    txt('POV', {
      fontSize: typography.text,
      fontWeight: 900,
      color: colors.primary,
      letterSpacing: 16,
      marginBottom: spacing.xl
    }),
    txt('YOU JUST LANDED IN', {
      fontSize: typography.subtitle,
      fontWeight: 300,
      color: colors.white,
      marginBottom: spacing.sm
    }),
    txt(name.toUpperCase(), {
      fontSize: typography.hero,
      fontWeight: 900,
      color: colors.white,
      letterSpacing: -8,
      textAlign: 'center',
      lineHeight: 0.85
    }),
    el('div', {
      marginTop: spacing.xl,
      padding: '20px 48px',
      backgroundColor: colors.primary,
      borderRadius: 24
    }, [
      txt('DATA ALREADY WORKS', {
        fontSize: typography.text,
        fontWeight: 900,
        color: colors.black,
        letterSpacing: 2
      })
    ]),
    el('div', { position: 'absolute', bottom: spacing.xxl, alignItems: 'center' }, [
      LogoFull({ height: 32, dark: true }),
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 3: NETFLIX PROFILES - "Who's traveling?"
// ═══════════════════════════════════════════════════════════════════════════

function NetflixProfiles() {
  const profiles = [
    { name: 'You', color: '#00A8E1' },
    { name: 'Digital Nomad', color: colors.netflix },
    { name: 'Tourist', color: colors.primary },
    { name: 'Business', color: colors.secondary },
  ];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark,
    padding: spacing.xxl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }, [
    txt("Who's traveling?", {
      fontSize: typography.title,
      fontWeight: 500,
      color: colors.white,
      marginBottom: spacing.xxl
    }),
    el('div', { flexDirection: 'row', gap: spacing.lg }, profiles.map(p => (
      el('div', { flexDirection: 'column', alignItems: 'center', gap: spacing.md }, [
        el('div', {
          width: 160, height: 160,
          backgroundColor: p.color,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }),
        txt(p.name, { fontSize: typography.small, color: 'rgba(255,255,255,0.6)', fontWeight: 500 })
      ])
    ))),
    el('div', {
      marginTop: spacing.supreme,
      border: '2px solid rgba(255,255,255,0.4)',
      padding: '16px 48px',
      borderRadius: 4
    }, [
      txt('MANAGE DESTINATIONS', {
        fontSize: typography.label,
        fontWeight: 800,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3
      })
    ]),
    el('div', { position: 'absolute', bottom: spacing.lg }, [
      txt('getlumbus.com', { color: colors.gray, fontSize: typography.label })
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 4: NETFLIX CONTINUE WATCHING - Trip cards
// ═══════════════════════════════════════════════════════════════════════════

function NetflixContinueWatching({ items }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark,
    padding: spacing.xxl,
    flexDirection: 'column'
  }, [
    // Netflix-style nav
    el('div', { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl }, [
      LogoFull({ height: 28, dark: true }),
      txt('Home', { color: colors.white, fontSize: typography.small, fontWeight: 700 }),
      txt('Travel Plans', { color: colors.gray, fontSize: typography.small }),
      txt('My List', { color: colors.gray, fontSize: typography.small }),
    ]),
    txt('Continue Watching Trips', {
      fontSize: typography.body,
      fontWeight: 700,
      color: colors.white,
      marginBottom: spacing.md
    }),
    el('div', { flexDirection: 'row', gap: spacing.md }, items.map(item => (
      el('div', {
        width: 280, height: 160,
        backgroundColor: '#333',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative'
      }, [
        flagCache[item.code] && img(flagCache[item.code], {
          width: '100%', height: '100%', objectFit: 'cover'
        }),
        // Progress bar
        el('div', {
          position: 'absolute', bottom: 0, left: 0,
          width: '100%', height: 4,
          backgroundColor: 'rgba(0,0,0,0.5)'
        }, [
          el('div', {
            width: `${item.progress || 70}%`,
            height: '100%',
            backgroundColor: colors.netflix
          })
        ]),
        el('div', {
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.9))',
          padding: spacing.sm,
          justifyContent: 'flex-end'
        }, [
          txt(item.name, { fontSize: typography.small, fontWeight: 900, color: colors.white })
        ])
      ])
    ))),
    // Top 10 section
    el('div', { marginTop: spacing.xl, flexDirection: 'column' }, [
      txt('Top 10 Savings Today', {
        fontSize: typography.body,
        fontWeight: 700,
        color: colors.white,
        marginBottom: spacing.md
      }),
      el('div', { flexDirection: 'row', gap: spacing.md }, [
        el('div', {
          width: 180, height: 260,
          backgroundColor: '#333',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden'
        }, [
          txt('1', {
            fontSize: 160, fontWeight: 900,
            color: '#444',
            position: 'absolute', left: -20, bottom: -30
          }),
          el('div', {
            position: 'absolute', top: '40%', left: 0, right: 0,
            alignItems: 'center'
          }, [
            txt('JAPAN', { fontSize: typography.label, fontWeight: 900, color: colors.white }),
            txt('$1.99', { fontSize: typography.text, fontWeight: 900, color: colors.primary }),
          ])
        ]),
      ])
    ]),
    el('div', { marginTop: 'auto', alignItems: 'center' }, [
      txt('getlumbus.com', { fontSize: typography.label, color: colors.gray })
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 5: SUPREME BOARDING PASS - Premium airline aesthetic
// ═══════════════════════════════════════════════════════════════════════════

function BoardingPass({ name, code, price, from = 'OFFLINE', to }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark,
    padding: spacing.xxl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }, [
    el('div', {
      backgroundColor: colors.white,
      borderRadius: 32,
      width: '100%',
      padding: spacing.xl,
      flexDirection: 'column',
      boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px dashed #E5E5E5',
        paddingBottom: spacing.lg,
        marginBottom: spacing.lg
      }, [
        el('div', { flexDirection: 'column' }, [
          txt('PASSENGER', { fontSize: typography.micro, color: colors.gray, letterSpacing: 3 }),
          txt('YOU', { fontSize: typography.text, fontWeight: 900, color: colors.black }),
        ]),
        Logo({ size: 36 }),
        el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          txt('CARRIER', { fontSize: typography.micro, color: colors.gray, letterSpacing: 3 }),
          txt('LUMBUS eSIM', { fontSize: typography.text, fontWeight: 900, color: colors.primaryDark }),
        ]),
      ]),
      // Route
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl
      }, [
        el('div', { flexDirection: 'column' }, [
          txt('DEPART', { fontSize: typography.micro, color: colors.gray, letterSpacing: 3 }),
          txt(from, { fontSize: typography.headline, fontWeight: 900, color: colors.black }),
        ]),
        el('div', { flex: 1, alignItems: 'center', margin: '0 32px' }, [
          el('div', { width: '100%', height: 2, backgroundColor: '#E5E5E5', position: 'relative' }, [
            el('div', {
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)'
            }, Icons.plane({ size: 32, color: colors.primary, rotation: 90 }))
          ])
        ]),
        el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          txt('ARRIVE', { fontSize: typography.micro, color: colors.gray, letterSpacing: 3 }),
          txt(to || name.toUpperCase(), { fontSize: typography.headline, fontWeight: 900, color: colors.black }),
        ]),
      ]),
      // Bottom details
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '3px dashed #E5E5E5',
        paddingTop: spacing.lg
      }, [
        el('div', { flexDirection: 'column' }, [
          txt('PLAN COST', { fontSize: typography.micro, color: colors.gray, letterSpacing: 3 }),
          txt(price, { fontSize: typography.subtitle, fontWeight: 900, color: colors.black }),
        ]),
        el('div', {
          width: 100, height: 100,
          backgroundColor: colors.black,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center'
        }, Icons.qrcode({ size: 60, color: colors.white }))
      ])
    ]),
    txt('getlumbus.com', { marginTop: spacing.lg, color: colors.gray, fontWeight: 700, fontSize: typography.small })
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 6: iPHONE NOTIFICATION - Lock screen style
// ═══════════════════════════════════════════════════════════════════════════

function iPhoneNotification({ name, savings = '$140+' }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: '#000',
    padding: spacing.xxl,
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  }, [
    // Ambient glow
    el('div', {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.accent}22 100%)`,
      filter: 'blur(100px)'
    }),
    // Time
    txt('9:41', {
      fontSize: typography.hero,
      fontWeight: 700,
      color: colors.white,
      marginTop: spacing.supreme
    }),
    // Notifications
    el('div', { width: '100%', flexDirection: 'column', gap: spacing.md, marginTop: spacing.supreme }, [
      // Lumbus notification
      el('div', {
        padding: spacing.lg,
        backgroundColor: colors.glassLight,
        borderRadius: 32,
        flexDirection: 'column'
      }, [
        el('div', { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }, [
          Logo({ size: 28 }),
          txt('LUMBUS', {
            fontSize: typography.micro,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 2
          }),
          txt('now', {
            fontSize: typography.micro,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: 'auto'
          }),
        ]),
        txt(`Welcome to ${name}!`, {
          fontSize: typography.text,
          fontWeight: 800,
          color: colors.white,
          marginBottom: 4
        }),
        txt(`High-speed data active. Savings vs Roaming: ${savings}.`, {
          fontSize: typography.small,
          color: 'rgba(255,255,255,0.8)'
        }),
      ]),
      // Carrier notification (dimmed)
      el('div', {
        padding: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        opacity: 0.5
      }, [
        txt('CARRIER', { fontSize: typography.micro, fontWeight: 800, color: colors.white, letterSpacing: 2 }),
        txt('International Roaming is DISABLED', { fontSize: typography.label, color: colors.white }),
      ])
    ]),
    // Home indicator
    el('div', { marginTop: 'auto', alignItems: 'center' }, [
      txt('getlumbus.com', { fontSize: typography.small, color: colors.gray, marginBottom: spacing.sm }),
      el('div', { width: 140, height: 5, backgroundColor: colors.white, borderRadius: 100 })
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 7: SPOTIFY WRAPPED STYLE
// ═══════════════════════════════════════════════════════════════════════════

function SpotifyWrapped({ stat, label, detail, year = '2024' }) {
  return el('div', {
    width: '100%', height: '100%',
    background: `linear-gradient(180deg, ${colors.spotify} 0%, #0D3B20 100%)`,
    padding: spacing.xxl,
    flexDirection: 'column',
  }, [
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }, [
      txt(`Your ${year} Wrapped`, { fontSize: typography.text, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }),
      Logo({ size: 40 }),
    ]),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('You saved', { fontSize: typography.subtitle, color: colors.white, marginBottom: spacing.sm }),
      txt(stat, { fontSize: typography.supreme, fontWeight: 900, color: colors.white, lineHeight: 0.9 }),
      txt(label, { fontSize: typography.headline, fontWeight: 700, color: colors.white, marginTop: spacing.md, marginBottom: spacing.lg }),
      txt(detail, { fontSize: typography.text, color: 'rgba(255,255,255,0.7)' }),
    ]),
    txt("That's top 1% of travelers", { fontSize: typography.text, fontWeight: 600, color: colors.white }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 8: iMESSAGE CONVERSATION
// ═══════════════════════════════════════════════════════════════════════════

function iMessageConvo({ messages, contact = 'Bestie' }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: 'column',
  }, [
    // Phone header
    el('div', {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: `${spacing.sm}px 0`, borderBottom: '1px solid #E5E5E5', marginBottom: spacing.lg,
    }, [
      txt('‹ Messages', { fontSize: typography.small, color: colors.blue }),
      el('div', { flexDirection: 'column', alignItems: 'center' }, [
        txt(contact, { fontSize: typography.small, fontWeight: 600, color: colors.black }),
        txt('iMessage', { fontSize: typography.micro, color: colors.gray }),
      ]),
      el('div', { width: 60 }), // spacer
    ]),
    // Messages
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 12 },
      messages.map((m, i) =>
        el('div', {
          alignSelf: m.sent ? 'flex-end' : 'flex-start',
          maxWidth: '75%',
          padding: '14px 20px',
          backgroundColor: m.sent ? colors.imessage : '#E9E9EB',
          borderRadius: 20,
        }, txt(m.text, { fontSize: typography.text, color: m.sent ? colors.white : colors.black }))
      )
    ),
    // Footer
    el('div', { marginTop: spacing.lg, alignItems: 'center' }, [
      LogoFull({ height: 28, dark: false }),
      txt('getlumbus.com', { fontSize: typography.label, color: colors.gray, marginTop: 8 }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 9: WHATSAPP GROUP CHAT
// ═══════════════════════════════════════════════════════════════════════════

function WhatsAppChat({ groupName = 'Trip to Bali 2024', members = 'Sarah, Mike, You' }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: '#0B141A',
    padding: spacing.md,
    flexDirection: 'column',
  }, [
    // Header
    el('div', {
      padding: `${spacing.sm}px ${spacing.md}px`,
      backgroundColor: '#1F2C34',
      flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: spacing.md,
    }, [
      el('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2A3942', alignItems: 'center', justifyContent: 'center' },
        txt('🌴', { fontSize: 24 })
      ),
      el('div', { flex: 1 }, [
        txt(groupName, { fontSize: typography.small, fontWeight: 600, color: colors.white }),
        txt(members, { fontSize: typography.label, color: '#8696A0' }),
      ]),
    ]),
    // Messages
    el('div', { flex: 1, flexDirection: 'column', gap: 12, padding: `0 ${spacing.sm}px` }, [
      // Sarah
      el('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        txt('Sarah', { fontSize: typography.micro, fontWeight: 600, color: colors.whatsapp, marginBottom: 4, marginLeft: 8 }),
        el('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          txt('guys what about data? do we need local SIM?', { fontSize: typography.small, color: colors.white })
        ),
      ]),
      // Mike
      el('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        txt('Mike', { fontSize: typography.micro, fontWeight: 600, color: '#53BDEB', marginBottom: 4, marginLeft: 8 }),
        el('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          txt('idk last time i paid like $200 😭', { fontSize: typography.small, color: colors.white })
        ),
      ]),
      // You
      el('div', { alignSelf: 'flex-end', maxWidth: '80%' }, [
        el('div', { padding: '10px 16px', backgroundColor: '#005C4B', borderRadius: 16 }, [
          txt('just use lumbus esim', { fontSize: typography.small, color: colors.white }),
          txt("it's like $5 and instant", { fontSize: typography.small, color: colors.white, marginTop: 4 }),
        ]),
      ]),
      // Sarah reaction
      el('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        txt('Sarah', { fontSize: typography.micro, fontWeight: 600, color: colors.whatsapp, marginBottom: 4, marginLeft: 8 }),
        el('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          txt('wait WHAT downloading now 🙌', { fontSize: typography.small, color: colors.white })
        ),
      ]),
    ]),
    // Footer
    el('div', { marginTop: spacing.md, alignItems: 'center' }, [
      LogoFull({ height: 28, dark: true }),
      txt('Be the friend who knows', { fontSize: typography.label, color: '#8696A0', marginTop: 8 }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 10: THIS vs THAT
// ═══════════════════════════════════════════════════════════════════════════

function ThisVsThat({
  thisLabel = 'Paying $300', thisSubtitle = 'roaming fees', thisEmoji = '🤡',
  thatLabel = 'Getting 10GB', thatSubtitle = '$9.99 with eSIM', thatEmoji = '😎'
}) {
  return el('div', {
    width: '100%', height: '100%',
    flexDirection: 'column',
  }, [
    // This (red) side
    el('div', {
      flex: 1, backgroundColor: colors.red, padding: spacing.xl,
      flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    }, [
      txt(thisLabel, { fontSize: typography.body, color: colors.white }),
      txt(thisSubtitle, { fontSize: typography.subtitle, fontWeight: 900, color: colors.white }),
      txt(thisEmoji, { fontSize: 80, marginTop: spacing.md }),
    ]),
    // VS divider
    el('div', {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 100, height: 100, borderRadius: 50,
      backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }, txt('VS', { fontSize: typography.subtitle, fontWeight: 900, color: colors.black })),
    // That (green) side
    el('div', {
      flex: 1, backgroundColor: colors.primary, padding: spacing.xl,
      flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    }, [
      txt(thatLabel, { fontSize: typography.body, color: colors.black }),
      txt(thatSubtitle, { fontSize: typography.subtitle, fontWeight: 900, color: colors.black }),
      txt(thatEmoji, { fontSize: 80, marginTop: spacing.md }),
      Logo({ size: 40 }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 11: HOT TAKE
// ═══════════════════════════════════════════════════════════════════════════

function HotTake({ take }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, padding: spacing.xxl,
    flexDirection: 'column',
  }, [
    el('div', {
      padding: '12px 24px', backgroundColor: colors.red, borderRadius: 8,
      alignSelf: 'flex-start', marginBottom: spacing.xl,
    }, txt('HOT TAKE', { fontSize: typography.small, fontWeight: 900, color: colors.white, letterSpacing: 3 })),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt(take, { fontSize: typography.headline, fontWeight: 700, color: colors.white, lineHeight: 1.3 }),
    ]),
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoFull({ height: 32, dark: true }),
      txt('Agree? 🔥', { fontSize: typography.text, color: colors.white }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 12: BENTO GRID
// ═══════════════════════════════════════════════════════════════════════════

function BentoGrid({ code = 'jp' }) {
  const flag = flagCache[code];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.darker,
    padding: spacing.lg,
    flexDirection: 'column', gap: spacing.md
  }, [
    // Top row
    el('div', { flexDirection: 'row', gap: spacing.md, flex: 1.5 }, [
      // Large card with flag
      el('div', {
        flex: 2, backgroundColor: colors.dark, borderRadius: 40, padding: spacing.xl,
        flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden',
        border: `1px solid ${colors.border}`
      }, [
        img(flag, {
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.3
        }),
        txt('EXPLORE', { fontSize: typography.label, fontWeight: 800, color: colors.primary, letterSpacing: 4, marginBottom: 8 }),
        txt('WORLDWIDE.', { fontSize: typography.subtitle, fontWeight: 900, color: colors.white }),
      ]),
      // Logo card
      el('div', {
        flex: 1, backgroundColor: colors.primary, borderRadius: 40, padding: spacing.lg,
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
      }, [
        Logo({ size: 80 }),
        txt('LUMBUS', { fontSize: typography.label, fontWeight: 900, color: colors.black, marginTop: spacing.md }),
      ]),
    ]),
    // Bottom row
    el('div', { flexDirection: 'row', gap: spacing.md, flex: 1 }, [
      // Price card
      el('div', {
        flex: 1, backgroundColor: colors.secondary, borderRadius: 40, padding: spacing.lg,
        flexDirection: 'column', justifyContent: 'center'
      }, [
        txt('$1.99', { fontSize: typography.subtitle, fontWeight: 900, color: colors.black }),
        txt('Starting Price', { fontSize: typography.label, fontWeight: 700, color: 'rgba(0,0,0,0.5)' }),
      ]),
      // CTA card
      el('div', {
        flex: 2, backgroundColor: colors.white, borderRadius: 40, padding: spacing.lg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
      }, [
        txt('GET THE APP', { fontSize: typography.body, fontWeight: 900, color: colors.black }),
        txt('→', { fontSize: typography.subtitle, fontWeight: 900 })
      ]),
    ]),
    el('div', { alignItems: 'center' }, [ txt('getlumbus.com', { fontSize: typography.label, color: colors.gray }) ])
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 13: REGIONAL BUNDLE - Flag grid
// ═══════════════════════════════════════════════════════════════════════════

function RegionalBundle({ region }) {
  return el('div', {
    width: '100%', height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: spacing.xxl, flexDirection: 'column',
  }, [
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, [
      el('div', { padding: '12px 24px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20 },
        txt('REGIONAL BUNDLE', { fontSize: typography.label, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
      Logo({ size: 48 }),
    ]),
    txt(region.name, { fontSize: typography.title, fontWeight: 900, color: colors.black, marginBottom: 8 }),
    txt(`${region.count} countries, 1 eSIM`, { fontSize: typography.text, color: 'rgba(0,0,0,0.7)', marginBottom: spacing.lg }),
    // Flags grid
    el('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignContent: 'center' },
      region.codes.slice(0, 8).map(code => FlagCircle({ code, size: 90 }))
    ),
    // Price bar
    el('div', {
      padding: spacing.md, backgroundColor: colors.white, borderRadius: 20,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    }, [
      el('div', {}, [
        txt('Starting from', { fontSize: typography.label, color: colors.gray }),
        txt(region.price, { fontSize: typography.subtitle, fontWeight: 900, color: colors.black }),
      ]),
      el('div', { padding: '14px 28px', backgroundColor: colors.black, borderRadius: 12 },
        txt('View plans', { fontSize: typography.small, fontWeight: 700, color: colors.white })
      ),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 14: COMPARISON POST - Apple style
// ═══════════════════════════════════════════════════════════════════════════

function ComparisonPost() {
  const rows = [
    { label: 'Daily Roaming', cost: '$15.00/day', setup: 'Bill Shock 😰', bg: 'transparent', color: colors.black, costColor: colors.red },
    { label: 'Airport SIM', cost: '$45.00', setup: 'Long Queues ⏳', bg: '#F5F5F7', color: colors.black, costColor: colors.black },
    { label: 'Lumbus eSIM', cost: '$1.99', setup: 'Instant Setup ⚡️', bg: colors.dark, color: colors.white, costColor: colors.primary, highlight: true },
  ];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.white,
    padding: spacing.xxl,
    flexDirection: 'column'
  }, [
    BrandHeader({ dark: false }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('THE SMART CHOICE.', {
        fontSize: typography.text, fontWeight: 800, color: colors.primaryDark,
        letterSpacing: 8, marginBottom: spacing.xl, textAlign: 'center'
      }),
      ...rows.map((row, i) => (
        el('div', {
          flexDirection: 'row',
          padding: row.highlight ? spacing.xl : spacing.lg,
          alignItems: 'center',
          backgroundColor: row.bg,
          borderRadius: 24,
          marginTop: i === 2 ? spacing.md : 0,
          marginBottom: 12,
          boxShadow: row.highlight ? '0 24px 60px rgba(0,0,0,0.15)' : 'none'
        }, [
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt(row.label, { fontSize: row.highlight ? typography.body : typography.text, fontWeight: 800, color: row.color }),
            txt(row.setup, { fontSize: typography.small, color: row.highlight ? 'rgba(255,255,255,0.5)' : colors.gray, marginTop: 4 }),
          ]),
          txt(row.cost, { fontSize: row.highlight ? typography.subtitle : typography.body, fontWeight: 900, color: row.costColor }),
        ])
      ))
    ]),
    BrandFooter({ dark: false })
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 15: DESTINATION CARD - Full bleed flag
// ═══════════════════════════════════════════════════════════════════════════

function DestinationCard({ name, code, price, vibe }) {
  const flag = flagCache[code];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, overflow: 'hidden', flexDirection: 'column',
  }, [
    // Flag background (top 60%)
    el('div', { position: 'absolute', top: 0, left: 0, right: 0, height: '60%', overflow: 'hidden' }, [
      flag && img(flag, { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }),
      el('div', { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(transparent, #0A0A0A)' }),
    ]),
    // Content
    el('div', { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xxl }, [
      txt(name, { fontSize: typography.title, fontWeight: 900, color: colors.white, marginBottom: 8 }),
      txt(vibe, { fontSize: typography.text, color: colors.gray, marginBottom: spacing.lg }),
      el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
        el('div', { flexDirection: 'column' }, [
          txt('From', { fontSize: typography.small, color: colors.gray }),
          txt(price, { fontSize: typography.subtitle, fontWeight: 900, color: colors.primary }),
        ]),
        el('div', { padding: '16px 32px', backgroundColor: colors.primary, borderRadius: 16 },
          txt('Get eSIM', { fontSize: typography.text, fontWeight: 700, color: colors.black })
        ),
      ]),
      el('div', { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        Logo({ size: 28 }),
        txt('Instant activation', { fontSize: typography.small, color: colors.gray }),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 16: TESTIMONIAL
// ═══════════════════════════════════════════════════════════════════════════

function Testimonial({ testimonial }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark, padding: spacing.xxl, flexDirection: 'column',
  }, [
    BrandHeader({ dark: true }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      Stars({ count: testimonial.rating, size: 32, color: colors.secondary }),
      txt(`"${testimonial.text}"`, {
        fontSize: typography.subtitle, fontWeight: 600, color: colors.white,
        textAlign: 'center', lineHeight: 1.4, marginTop: spacing.xl, marginBottom: spacing.xl,
        maxWidth: 800
      }),
      el('div', { alignItems: 'center' }, [
        txt(testimonial.author, { fontSize: typography.text, fontWeight: 700, color: colors.white }),
        txt(testimonial.location, { fontSize: typography.small, color: colors.gray, marginTop: 4 }),
      ]),
    ]),
    BrandFooter({ dark: true })
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 17: COUNTDOWN / FOMO
// ═══════════════════════════════════════════════════════════════════════════

function Countdown({ hours, destination, code }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, padding: spacing.xxl,
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  }, [
    FlagCircle({ code, size: 120 }),
    txt(`${hours} hours until`, { fontSize: typography.body, color: colors.gray, marginTop: spacing.xl, marginBottom: 8 }),
    txt(destination, { fontSize: typography.title, fontWeight: 900, color: colors.white, marginBottom: spacing.xl }),
    txt('Is your data ready?', { fontSize: typography.subtitle, fontWeight: 600, color: colors.primary, marginBottom: spacing.xl }),
    el('div', { padding: '24px 60px', backgroundColor: colors.primary, borderRadius: 24 },
      txt('Get eSIM now', { fontSize: typography.text, fontWeight: 700, color: colors.black })
    ),
    el('div', { marginTop: spacing.xl }, LogoFull({ height: 32, dark: true })),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 18: BOLD STATEMENT
// ═══════════════════════════════════════════════════════════════════════════

function BoldStatement({ line1, line2, highlight = false }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, padding: spacing.xxl, flexDirection: 'column',
  }, [
    el('div', { marginBottom: 'auto' }, Logo({ size: 48 })),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt(line1, { fontSize: typography.title, fontWeight: 400, color: colors.white, lineHeight: 1.2 }),
      txt(line2, { fontSize: typography.title, fontWeight: 900, color: highlight ? colors.primary : colors.white, lineHeight: 1.2 }),
    ]),
    txt('getlumbus.com', { fontSize: typography.small, color: colors.gray }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 19: PASSPORT STAMPS
// ═══════════════════════════════════════════════════════════════════════════

function PassportStamps() {
  const stamps = [
    { code: 'jp', name: 'JAPAN' },
    { code: 'fr', name: 'FRANCE' },
    { code: 'th', name: 'THAILAND' },
    { code: 'it', name: 'ITALY' },
  ];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: '#F5F0E6', padding: spacing.xxl, flexDirection: 'column',
  }, [
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, [
      txt('TRAVEL LOG', { fontSize: typography.text, fontWeight: 700, color: colors.dark, letterSpacing: 4 }),
      Logo({ size: 40 }),
    ]),
    el('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignContent: 'center', justifyContent: 'center' },
      stamps.map((s, i) =>
        el('div', {
          width: 180, height: 180,
          border: `4px solid ${colors.red}`, borderRadius: 90,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          transform: `rotate(${(i - 1.5) * 8}deg)`,
        }, [
          FlagCircle({ code: s.code, size: 50 }),
          txt(s.name, { fontSize: typography.label, fontWeight: 900, color: colors.red, marginTop: 8 }),
          txt('DATA ✓', { fontSize: typography.micro, fontWeight: 700, color: colors.primaryDark }),
        ])
      )
    ),
    el('div', { alignItems: 'center' }, [
      txt('Stay connected everywhere', { fontSize: typography.small, fontWeight: 600, color: colors.dark }),
      txt('getlumbus.com', { fontSize: typography.label, color: colors.gray, marginTop: 8 }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 20: STATS CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatsCard() {
  const stats = [
    { value: STATS.countries, label: 'Countries' },
    { value: STATS.downloads, label: 'Downloads' },
    { value: STATS.rating, label: 'App Rating' },
    { value: STATS.savings, label: 'Avg Savings' },
  ];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.dark, padding: spacing.xxl, flexDirection: 'column',
  }, [
    BrandHeader({ dark: true }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('THE NUMBERS', { fontSize: typography.text, fontWeight: 800, color: colors.primary, letterSpacing: 8, marginBottom: spacing.xl }),
      txt("DON'T LIE.", { fontSize: typography.hero, fontWeight: 900, color: colors.white, letterSpacing: -6, marginBottom: spacing.xxl }),
      el('div', { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }, stats.map(s =>
        el('div', { width: '45%', flexDirection: 'column' }, [
          txt(s.value, { fontSize: typography.display, fontWeight: 900, color: colors.primary }),
          txt(s.label, { fontSize: typography.small, color: colors.gray, marginTop: 4 }),
        ])
      )),
    ]),
    BrandFooter({ dark: true })
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// STORY VERSIONS (1080x1920)
// ═══════════════════════════════════════════════════════════════════════════

function StoryPOV({ country, code }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, padding: spacing.xxl, flexDirection: 'column',
  }, [
    el('div', { marginTop: 80 }, txt('POV:', { fontSize: typography.subtitle, fontWeight: 700, color: colors.gray })),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      txt('You landed in', { fontSize: typography.headline, color: colors.white, marginBottom: spacing.lg }),
      FlagCircle({ code, size: 200 }),
      txt(country, { fontSize: typography.display, fontWeight: 900, color: colors.white, marginTop: spacing.lg, marginBottom: spacing.md }),
      txt('and your data', { fontSize: typography.headline, color: colors.white }),
      txt('just works', { fontSize: typography.title, fontWeight: 900, color: colors.primary }),
    ]),
    el('div', { alignItems: 'center', marginBottom: 80 }, [
      el('div', { padding: '24px 80px', backgroundColor: colors.primary, borderRadius: 40 },
        txt('Swipe up', { fontSize: typography.body, fontWeight: 700, color: colors.black })
      ),
      txt('getlumbus.com', { fontSize: typography.small, color: colors.gray, marginTop: spacing.md }),
    ]),
  ]);
}

function StoryDestination({ name, code, price, vibe }) {
  const flag = flagCache[code];
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.black, flexDirection: 'column',
  }, [
    // Flag background
    el('div', { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' }, [
      flag && img(flag, { width: '100%', height: '100%', objectFit: 'cover' }),
      el('div', { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(transparent, #0A0A0A)' }),
    ]),
    // Content
    el('div', { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xxl, flexDirection: 'column', alignItems: 'center' }, [
      txt(name, { fontSize: typography.display, fontWeight: 900, color: colors.white, marginBottom: spacing.sm }),
      txt(vibe, { fontSize: typography.body, color: colors.gray, marginBottom: spacing.xl }),
      el('div', { flexDirection: 'column', alignItems: 'center', marginBottom: spacing.xl }, [
        txt('From', { fontSize: typography.text, color: colors.gray }),
        txt(price, { fontSize: typography.display, fontWeight: 900, color: colors.primary }),
      ]),
      el('div', { padding: '24px 80px', backgroundColor: colors.primary, borderRadius: 40 },
        txt('Get eSIM', { fontSize: typography.body, fontWeight: 700, color: colors.black })
      ),
      el('div', { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        Logo({ size: 32 }),
        txt('Instant activation', { fontSize: typography.small, color: colors.gray }),
      ]),
    ]),
  ]);
}

function StoryComparison() {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: colors.white, padding: spacing.xxl, flexDirection: 'column',
  }, [
    el('div', { marginTop: 80 }, LogoFull({ height: 36, dark: false })),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('WHY PAY MORE?', { fontSize: typography.text, fontWeight: 800, color: colors.primaryDark, letterSpacing: 6, marginBottom: spacing.xl }),
      // Carrier
      el('div', {
        padding: spacing.lg, backgroundColor: '#FEE2E2', borderRadius: 24, marginBottom: spacing.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
      }, [
        el('div', {}, [
          txt('Carrier Roaming', { fontSize: typography.text, fontWeight: 700, color: colors.black }),
          txt('Per day abroad', { fontSize: typography.small, color: colors.gray }),
        ]),
        txt('$15+', { fontSize: typography.subtitle, fontWeight: 900, color: colors.red }),
      ]),
      // Airport
      el('div', {
        padding: spacing.lg, backgroundColor: '#FEF3C7', borderRadius: 24, marginBottom: spacing.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
      }, [
        el('div', {}, [
          txt('Airport SIM', { fontSize: typography.text, fontWeight: 700, color: colors.black }),
          txt('Plus long queues', { fontSize: typography.small, color: colors.gray }),
        ]),
        txt('$45+', { fontSize: typography.subtitle, fontWeight: 900, color: colors.orange }),
      ]),
      // Lumbus
      el('div', {
        padding: spacing.xl, backgroundColor: colors.dark, borderRadius: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }, [
        el('div', {}, [
          txt('Lumbus eSIM', { fontSize: typography.body, fontWeight: 700, color: colors.white }),
          txt('Instant. No queues.', { fontSize: typography.small, color: colors.gray }),
        ]),
        txt('$1.99', { fontSize: typography.subtitle, fontWeight: 900, color: colors.primary }),
      ]),
    ]),
    el('div', { alignItems: 'center', marginBottom: 80 }, [
      el('div', { padding: '24px 80px', backgroundColor: colors.primary, borderRadius: 40 },
        txt('Get Started', { fontSize: typography.body, fontWeight: 700, color: colors.black })
      ),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

async function generateImage(element, width, height, filename, fonts) {
  try {
    const svg = await satori(element, { width, height, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    await fs.writeFile(path.join(OUTPUT, filename), pngBuffer);
    console.log(`   ✓ ${filename}`);
    return true;
  } catch (e) {
    console.error(`   ✗ ${filename}: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log('  ║   LUMBUS ULTIMATE MARKETING GENERATOR                         ║');
  console.log('  ║   World-Class Design for Instagram & TikTok                   ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Setup
  await fs.mkdir(OUTPUT, { recursive: true });

  console.log('  📦 Loading Assets...');
  await loadLogos();
  await loadAllFlags();
  const fonts = await loadFonts();
  console.log('');

  const PT = DIM.PORTRAIT;
  const ST = DIM.STORY;

  let generated = 0;
  let failed = 0;

  // ═══════════════════════════════════════════════════════════════════════
  // INSTAGRAM PORTRAIT (1080x1350) - Primary format
  // ═══════════════════════════════════════════════════════════════════════

  console.log('  📱 INSTAGRAM PORTRAIT (1080×1350)');
  console.log('  ─────────────────────────────────────────────');

  // Supreme Hero - Per country
  console.log('\n  🌟 Supreme Hero Posts');
  for (const country of COUNTRIES.filter(c => c.popular).slice(0, 5)) {
    const result = await generateImage(
      SupremeHero(country), PT.w, PT.h,
      `supreme-hero-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Cinematic POV
  console.log('\n  🎬 Cinematic POV Posts');
  for (const country of COUNTRIES.filter(c => c.popular).slice(0, 4)) {
    const result = await generateImage(
      CinematicPOV(country), PT.w, PT.h,
      `cinematic-pov-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Netflix Style
  console.log('\n  🎬 Netflix Style Posts');
  await generateImage(NetflixProfiles(), PT.w, PT.h, 'netflix-profiles.png', fonts) ? generated++ : failed++;
  await generateImage(
    NetflixContinueWatching({ items: [
      { name: 'Japan', code: 'jp', progress: 70 },
      { name: 'Thailand', code: 'th', progress: 40 },
      { name: 'France', code: 'fr', progress: 85 },
    ]}), PT.w, PT.h, 'netflix-continue.png', fonts
  ) ? generated++ : failed++;

  // Boarding Passes
  console.log('\n  🎫 Boarding Pass Posts');
  for (const country of COUNTRIES.slice(0, 4)) {
    const result = await generateImage(
      BoardingPass({ ...country, from: 'HOME' }), PT.w, PT.h,
      `boarding-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // iPhone Notifications
  console.log('\n  📲 iPhone Notification Posts');
  for (const country of COUNTRIES.slice(0, 3)) {
    const result = await generateImage(
      iPhoneNotification({ name: country.name, savings: '$140+' }), PT.w, PT.h,
      `notification-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Spotify Wrapped
  console.log('\n  🎵 Spotify Wrapped Style');
  await generateImage(
    SpotifyWrapped({ stat: '$247', label: 'on roaming fees', detail: 'By using eSIM instead of carrier roaming' }),
    PT.w, PT.h, 'wrapped-savings.png', fonts
  ) ? generated++ : failed++;
  await generateImage(
    SpotifyWrapped({ stat: '12', label: 'countries visited', detail: 'All with instant data from Lumbus' }),
    PT.w, PT.h, 'wrapped-countries.png', fonts
  ) ? generated++ : failed++;

  // iMessage Conversations
  console.log('\n  💬 iMessage Conversations');
  await generateImage(iMessageConvo({
    contact: 'Bestie',
    messages: [
      { text: 'omg just landed in tokyo!!', sent: true },
      { text: 'how do u have data already??', sent: false },
      { text: 'esim lol. took 30 seconds', sent: true },
      { text: 'wait what??? send link', sent: false },
      { text: 'getlumbus.com 🙌', sent: true },
    ]
  }), PT.w, PT.h, 'imessage-tokyo.png', fonts) ? generated++ : failed++;

  // WhatsApp Chat
  console.log('\n  💚 WhatsApp Group Chat');
  await generateImage(WhatsAppChat({}), PT.w, PT.h, 'whatsapp-bali.png', fonts) ? generated++ : failed++;

  // This vs That
  console.log('\n  ⚔️ This vs That');
  await generateImage(ThisVsThat({}), PT.w, PT.h, 'this-vs-that.png', fonts) ? generated++ : failed++;

  // Hot Takes
  console.log('\n  🔥 Hot Takes');
  await generateImage(
    HotTake({ take: 'Buying SIM cards at the airport is the modern equivalent of getting scammed by a street vendor' }),
    PT.w, PT.h, 'hot-take-1.png', fonts
  ) ? generated++ : failed++;
  await generateImage(
    HotTake({ take: "If you're still paying roaming fees in 2024, you're basically donating money to your carrier" }),
    PT.w, PT.h, 'hot-take-2.png', fonts
  ) ? generated++ : failed++;

  // Bento Grids
  console.log('\n  🍱 Bento Grids');
  await generateImage(BentoGrid({ code: 'jp' }), PT.w, PT.h, 'bento-jp.png', fonts) ? generated++ : failed++;
  await generateImage(BentoGrid({ code: 'us' }), PT.w, PT.h, 'bento-us.png', fonts) ? generated++ : failed++;

  // Regional Bundles
  console.log('\n  🗺️ Regional Bundles');
  for (const region of REGIONS.slice(0, 3)) {
    const result = await generateImage(
      RegionalBundle({ region }), PT.w, PT.h,
      `region-${region.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Comparison Post
  console.log('\n  📊 Comparison Posts');
  await generateImage(ComparisonPost(), PT.w, PT.h, 'comparison.png', fonts) ? generated++ : failed++;

  // Destination Cards
  console.log('\n  ✈️ Destination Cards');
  for (const country of COUNTRIES.slice(0, 6)) {
    const result = await generateImage(
      DestinationCard(country), PT.w, PT.h,
      `destination-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Testimonials
  console.log('\n  ⭐ Testimonials');
  for (let i = 0; i < 2; i++) {
    const result = await generateImage(
      Testimonial({ testimonial: TESTIMONIALS[i] }), PT.w, PT.h,
      `testimonial-${i + 1}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Countdown / FOMO
  console.log('\n  ⏰ Countdown Posts');
  await generateImage(Countdown({ hours: '48', destination: 'Tokyo', code: 'jp' }), PT.w, PT.h, 'countdown-tokyo.png', fonts) ? generated++ : failed++;
  await generateImage(Countdown({ hours: '24', destination: 'Paris', code: 'fr' }), PT.w, PT.h, 'countdown-paris.png', fonts) ? generated++ : failed++;

  // Bold Statements
  console.log('\n  💪 Bold Statements');
  await generateImage(BoldStatement({ line1: 'Stop paying', line2: '$15/MB for roaming' }), PT.w, PT.h, 'bold-stop.png', fonts) ? generated++ : failed++;
  await generateImage(BoldStatement({ line1: 'Your carrier hates', line2: 'this one trick', highlight: true }), PT.w, PT.h, 'bold-trick.png', fonts) ? generated++ : failed++;
  await generateImage(BoldStatement({ line1: 'Data that', line2: 'travels with you', highlight: true }), PT.w, PT.h, 'bold-travels.png', fonts) ? generated++ : failed++;

  // Passport Stamps
  console.log('\n  🛂 Passport Stamps');
  await generateImage(PassportStamps(), PT.w, PT.h, 'passport-stamps.png', fonts) ? generated++ : failed++;

  // Stats Card
  console.log('\n  📈 Stats Card');
  await generateImage(StatsCard(), PT.w, PT.h, 'stats.png', fonts) ? generated++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════
  // TIKTOK / INSTAGRAM STORIES (1080x1920)
  // ═══════════════════════════════════════════════════════════════════════

  console.log('\n\n  📲 TIKTOK / STORIES (1080×1920)');
  console.log('  ─────────────────────────────────────────────');

  // Story POV
  console.log('\n  🎬 Story POV');
  for (const country of COUNTRIES.filter(c => c.popular).slice(0, 4)) {
    const result = await generateImage(
      StoryPOV({ country: country.name, code: country.code }), ST.w, ST.h,
      `story-pov-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Story Destinations
  console.log('\n  ✈️ Story Destinations');
  for (const country of COUNTRIES.slice(0, 6)) {
    const result = await generateImage(
      StoryDestination(country), ST.w, ST.h,
      `story-dest-${country.code}.png`, fonts
    );
    result ? generated++ : failed++;
  }

  // Story Comparison
  console.log('\n  📊 Story Comparison');
  await generateImage(StoryComparison(), ST.w, ST.h, 'story-comparison.png', fonts) ? generated++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log(`  ║   ✅ GENERATION COMPLETE                                       ║`);
  console.log(`  ║   ${String(generated).padStart(3)} images generated successfully                          ║`);
  if (failed > 0) {
    console.log(`  ║   ${String(failed).padStart(3)} images failed                                            ║`);
  }
  console.log('  ║                                                               ║');
  console.log('  ║   📁 Output: marketing/ultimate/output/                        ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
