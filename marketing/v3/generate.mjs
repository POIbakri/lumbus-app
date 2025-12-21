/**
 * Lumbus Marketing V3 - Ultra Premium Quality
 * Clean, professional designs with ACTUAL logos
 * NO broken emojis - text and icons only
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// ============================================
// DESIGN SYSTEM
// ============================================

const colors = {
  primary: '#2EFECC',
  primaryDark: '#1DCCA0',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  purple: '#F7E2FB',
  mint: '#E0FEF7',
  white: '#FFFFFF',
  black: '#0A0A0A',
  darkGray: '#1A1A1A',
  gray: '#666666',
  lightGray: '#F5F5F5',
  red: '#FF4757',
};

const sizes = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

// ============================================
// LOGO LOADING
// ============================================

let iconLogoBase64 = null;
let longLogoBase64 = null;

async function loadLogos() {
  try {
    // Icon logo (square)
    const iconPath = path.join(ROOT, 'assets', 'iconlogotrans.png');
    const iconBuffer = await fs.readFile(iconPath);
    iconLogoBase64 = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   Icon logo loaded');
  } catch (e) {
    console.log('   Icon logo not found:', e.message);
  }

  try {
    // Long logo (text version)
    const longPath = path.join(ROOT, 'assets', 'logotrans.png');
    const longBuffer = await fs.readFile(longPath);
    longLogoBase64 = `data:image/png;base64,${longBuffer.toString('base64')}`;
    console.log('   Long logo loaded');
  } catch (e) {
    console.log('   Long logo not found:', e.message);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const h = (type, style, children) => ({
  type,
  props: {
    style: { display: 'flex', ...style },
    children: Array.isArray(children) ? children : children,
  },
});

const text = (content, style = {}) => ({
  type: 'span',
  props: { style, children: content },
});

const img = (src, style = {}) => ({
  type: 'img',
  props: { src, style },
});

// ============================================
// LOGO COMPONENTS
// ============================================

function IconLogo({ size = 60 }) {
  if (iconLogoBase64) {
    return img(iconLogoBase64, { width: size, height: size });
  }
  // Fallback - simple colored square with L
  return h('div', {
    width: size,
    height: size,
    borderRadius: size / 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  }, text('L', { fontSize: size * 0.5, fontWeight: 900, color: colors.black }));
}

function LongLogo({ height = 40 }) {
  if (longLogoBase64) {
    return img(longLogoBase64, { height, objectFit: 'contain' });
  }
  // Fallback - icon + text
  return h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
    IconLogo({ size: height }),
    text('lumbus', { fontSize: height * 0.7, fontWeight: 700, color: colors.black }),
  ]);
}

function LongLogoWhite({ height = 40 }) {
  if (longLogoBase64) {
    return img(longLogoBase64, { height, objectFit: 'contain', filter: 'brightness(0) invert(1)' });
  }
  return h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
    IconLogo({ size: height }),
    text('lumbus', { fontSize: height * 0.7, fontWeight: 700, color: colors.white }),
  ]);
}

// ============================================
// SVG ICONS (Clean vectors, no emoji)
// ============================================

const Icons = {
  Globe: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'circle', props: { cx: 12, cy: 12, r: 10, stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M2 12h20', stroke: color, strokeWidth: 2 } },
        { type: 'ellipse', props: { cx: 12, cy: 12, rx: 4, ry: 10, stroke: color, strokeWidth: 2 } },
      ],
    },
  }),

  Zap: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      children: [
        { type: 'path', props: { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', fill: color } },
      ],
    },
  }),

  Check: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M20 6L9 17l-5-5', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } },
      ],
    },
  }),

  Star: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      children: [
        { type: 'path', props: { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', fill: color } },
      ],
    },
  }),

  Shield: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M9 12l2 2 4-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  Wifi: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M5 12.55a11 11 0 0 1 14.08 0', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M1.42 9a16 16 0 0 1 21.16 0', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M8.53 16.11a6 6 0 0 1 6.95 0', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'circle', props: { cx: 12, cy: 20, r: 1.5, fill: color } },
      ],
    },
  }),

  Plane: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      children: [
        { type: 'path', props: { d: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', fill: color } },
      ],
    },
  }),

  Phone: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'rect', props: { x: 5, y: 2, width: 14, height: 20, rx: 2, stroke: color, strokeWidth: 2 } },
        { type: 'line', props: { x1: 12, y1: 18, x2: 12, y2: 18, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  Download: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M7 10l5 5 5-5', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
        { type: 'line', props: { x1: 12, y1: 15, x2: 12, y2: 3, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  QR: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'rect', props: { x: 3, y: 3, width: 7, height: 7, stroke: color, strokeWidth: 2 } },
        { type: 'rect', props: { x: 14, y: 3, width: 7, height: 7, stroke: color, strokeWidth: 2 } },
        { type: 'rect', props: { x: 3, y: 14, width: 7, height: 7, stroke: color, strokeWidth: 2 } },
        { type: 'rect', props: { x: 5, y: 5, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 16, y: 5, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 5, y: 16, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 14, y: 14, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 18, y: 18, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 14, y: 18, width: 3, height: 3, fill: color } },
      ],
    },
  }),

  ArrowRight: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'line', props: { x1: 5, y1: 12, x2: 19, y2: 12, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M12 5l7 7-7 7', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
      ],
    },
  }),

  X: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'line', props: { x1: 18, y1: 6, x2: 6, y2: 18, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'line', props: { x1: 6, y1: 6, x2: 18, y2: 18, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  MapPin: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', stroke: color, strokeWidth: 2 } },
        { type: 'circle', props: { cx: 12, cy: 10, r: 3, stroke: color, strokeWidth: 2 } },
      ],
    },
  }),

  Clock: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'circle', props: { cx: 12, cy: 12, r: 10, stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M12 6v6l4 2', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  DollarSign: ({ size = 32, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'line', props: { x1: 12, y1: 1, x2: 12, y2: 23, stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
      ],
    },
  }),
};

// ============================================
// COUNTRY DATA (No emojis!)
// ============================================

const countries = [
  { name: 'Japan', code: 'JP', price: '$4.99' },
  { name: 'Thailand', code: 'TH', price: '$2.99' },
  { name: 'France', code: 'FR', price: '$4.99' },
  { name: 'Italy', code: 'IT', price: '$4.99' },
  { name: 'Australia', code: 'AU', price: '$5.99' },
  { name: 'Germany', code: 'DE', price: '$4.49' },
  { name: 'Spain', code: 'ES', price: '$4.49' },
  { name: 'United Kingdom', code: 'UK', price: '$4.49' },
  { name: 'United States', code: 'US', price: '$3.99' },
  { name: 'Singapore', code: 'SG', price: '$3.99' },
  { name: 'South Korea', code: 'KR', price: '$4.99' },
  { name: 'Indonesia', code: 'ID', price: '$2.99' },
];

const regions = [
  { name: 'Europe', count: 39, price: '$9.99' },
  { name: 'Asia Pacific', count: 28, price: '$8.99' },
  { name: 'Americas', count: 22, price: '$7.99' },
  { name: 'Global', count: 150, price: '$19.99' },
];

// ============================================
// PREMIUM DESIGNS
// ============================================

// 1. HERO - Clean statement
function HeroPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 80,
  }, [
    h('div', { marginBottom: 'auto' }, LongLogo({ height: 48 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('Travel data', { fontSize: 72, fontWeight: 300, color: colors.black, lineHeight: 1 }),
      text('made simple.', { fontSize: 72, fontWeight: 900, color: colors.black, lineHeight: 1.1 }),
      h('div', { marginTop: 48, flexDirection: 'row', gap: 48 }, [
        h('div', { flexDirection: 'column' }, [
          text('150+', { fontSize: 56, fontWeight: 900, color: colors.black }),
          text('Countries', { fontSize: 18, color: colors.black, opacity: 0.7 }),
        ]),
        h('div', { flexDirection: 'column' }, [
          text('$4.99', { fontSize: 56, fontWeight: 900, color: colors.black }),
          text('Starting', { fontSize: 18, color: colors.black, opacity: 0.7 }),
        ]),
        h('div', { flexDirection: 'column' }, [
          text('30s', { fontSize: 56, fontWeight: 900, color: colors.black }),
          text('Setup', { fontSize: 18, color: colors.black, opacity: 0.7 }),
        ]),
      ]),
    ]),
    text('getlumbus.com', { fontSize: 18, fontWeight: 600, color: colors.black }),
  ]);
}

// 2. STATS - Bold numbers on dark
function StatsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
  }, [
    h('div', { marginBottom: 60 }, LongLogoWhite({ height: 40 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 40 }, [
      h('div', { flexDirection: 'row', alignItems: 'baseline', gap: 16 }, [
        text('90%', { fontSize: 140, fontWeight: 900, color: colors.primary, lineHeight: 1 }),
        text('cheaper', { fontSize: 32, color: colors.white }),
      ]),
      text('than carrier roaming', { fontSize: 28, color: colors.gray }),
      h('div', { height: 2, width: '100%', backgroundColor: colors.darkGray, marginTop: 32, marginBottom: 32 }),
      h('div', { flexDirection: 'row', justifyContent: 'space-between' }, [
        h('div', { flexDirection: 'column' }, [
          text('4.8', { fontSize: 48, fontWeight: 900, color: colors.white }),
          h('div', { flexDirection: 'row', gap: 4 },
            [1,2,3,4,5].map(() => Icons.Star({ size: 20, color: colors.secondary }))
          ),
        ]),
        h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          text('100K+', { fontSize: 48, fontWeight: 900, color: colors.white }),
          text('Happy travelers', { fontSize: 16, color: colors.gray }),
        ]),
      ]),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.gray }),
  ]);
}

// 3. HOW IT WORKS - 3 Steps
function HowItWorksPost() {
  const steps = [
    { num: '1', icon: Icons.Download, title: 'Download', desc: 'Get the free app', bg: colors.primary },
    { num: '2', icon: Icons.Globe, title: 'Choose', desc: 'Pick your destination', bg: colors.accent },
    { num: '3', icon: Icons.QR, title: 'Connect', desc: 'Scan QR & go', bg: colors.secondary },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
  }, [
    h('div', { marginBottom: 48 }, LongLogo({ height: 40 })),
    text('How it works', { fontSize: 56, fontWeight: 900, color: colors.black, marginBottom: 60 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 32 },
      steps.map(s =>
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
          h('div', {
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: s.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }, s.icon({ size: 40, color: colors.black })),
          h('div', { flex: 1 }, [
            text(s.title, { fontSize: 32, fontWeight: 700, color: colors.black }),
            text(s.desc, { fontSize: 20, color: colors.gray }),
          ]),
        ])
      )
    ),
    text('getlumbus.com', { fontSize: 16, color: colors.gray }),
  ]);
}

// 4. COMPARISON - Side by side
function ComparisonPost() {
  return h('div', {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  }, [
    // LEFT - Carrier
    h('div', {
      flex: 1,
      backgroundColor: colors.darkGray,
      padding: 56,
      flexDirection: 'column',
    }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }, [
        Icons.X({ size: 28, color: colors.red }),
        text('CARRIER', { fontSize: 16, fontWeight: 700, color: colors.gray, letterSpacing: 3 }),
      ]),
      h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
        text('$300+', { fontSize: 80, fontWeight: 900, color: colors.red }),
        text('roaming bill', { fontSize: 24, color: colors.gray, marginBottom: 40 }),
        text('Bill shock', { fontSize: 20, color: colors.gray, marginBottom: 12 }),
        text('No control', { fontSize: 20, color: colors.gray, marginBottom: 12 }),
        text('Wait at airport', { fontSize: 20, color: colors.gray }),
      ]),
    ]),
    // RIGHT - Lumbus
    h('div', {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 56,
      flexDirection: 'column',
    }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }, [
        Icons.Check({ size: 28, color: colors.black }),
        text('LUMBUS', { fontSize: 16, fontWeight: 700, color: colors.black, letterSpacing: 3 }),
      ]),
      h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
        text('$9.99', { fontSize: 80, fontWeight: 900, color: colors.black }),
        text('for 10GB', { fontSize: 24, color: colors.black, marginBottom: 40 }),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }, [
          Icons.Check({ size: 20, color: colors.black }),
          text('No surprises', { fontSize: 20, fontWeight: 600, color: colors.black }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }, [
          Icons.Check({ size: 20, color: colors.black }),
          text('Full control', { fontSize: 20, fontWeight: 600, color: colors.black }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.Check({ size: 20, color: colors.black }),
          text('Ready instantly', { fontSize: 20, fontWeight: 600, color: colors.black }),
        ]),
      ]),
      IconLogo({ size: 48 }),
    ]),
  ]);
}

// 5. FEATURES - Grid
function FeaturesPost() {
  const features = [
    { icon: Icons.Globe, title: '150+ Countries', bg: colors.primary },
    { icon: Icons.Zap, title: 'Instant Setup', bg: colors.accent },
    { icon: Icons.Shield, title: 'Secure Data', bg: colors.purple },
    { icon: Icons.Wifi, title: 'Fast Speeds', bg: colors.secondary },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 64,
  }, [
    h('div', { marginBottom: 40 }, LongLogo({ height: 36 })),
    text('Everything you need', { fontSize: 48, fontWeight: 900, color: colors.black, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
      features.map(f =>
        h('div', {
          width: '47%',
          padding: 40,
          backgroundColor: f.bg,
          borderRadius: 32,
          flexDirection: 'column',
        }, [
          f.icon({ size: 56, color: colors.black }),
          text(f.title, { fontSize: 28, fontWeight: 700, color: colors.black, marginTop: 20 }),
        ])
      )
    ),
    text('getlumbus.com', { fontSize: 16, color: colors.gray, marginTop: 32 }),
  ]);
}

// 6. COUNTRY CARD - Clean minimal
function CountryCard({ name, code, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto' }, [
      LongLogo({ height: 36 }),
      h('div', { padding: '8px 20px', backgroundColor: colors.lightGray, borderRadius: 20 },
        text(code, { fontSize: 16, fontWeight: 700, color: colors.black })
      ),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', {
        width: 200,
        height: 200,
        borderRadius: 100,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
      }, [
        Icons.MapPin({ size: 80, color: colors.black }),
      ]),
      text(name, { fontSize: 64, fontWeight: 900, color: colors.black, marginBottom: 24 }),
      h('div', { padding: '20px 48px', backgroundColor: colors.primary, borderRadius: 40 }, [
        text(`From ${price}`, { fontSize: 28, fontWeight: 700, color: colors.black }),
      ]),
    ]),
    h('div', { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, [
      Icons.Zap({ size: 20, color: colors.gray }),
      text('Instant activation', { fontSize: 16, color: colors.gray }),
    ]),
  ]);
}

// 7. REGIONAL BUNDLE
function RegionalBundle({ name, count, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 80,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto' }, [
      h('div', { padding: '12px 24px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 24 },
        text('REGIONAL', { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
      IconLogo({ size: 48 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      Icons.Globe({ size: 100, color: colors.black }),
      text(name, { fontSize: 72, fontWeight: 900, color: colors.black, marginTop: 32 }),
      text(`${count} countries covered`, { fontSize: 28, color: colors.black, marginTop: 8 }),
    ]),
    h('div', {
      padding: 32,
      backgroundColor: colors.white,
      borderRadius: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, [
      h('div', {}, [
        text('Starting from', { fontSize: 16, color: colors.gray }),
        text(price, { fontSize: 40, fontWeight: 900, color: colors.black }),
      ]),
      h('div', { padding: '16px 32px', backgroundColor: colors.black, borderRadius: 16 },
        text('Get now', { fontSize: 18, fontWeight: 700, color: colors.white })
      ),
    ]),
  ]);
}

// 8. PROMO
function PromoPost({ discount, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text('LIMITED TIME', { fontSize: 18, fontWeight: 700, color: colors.primary, letterSpacing: 6, marginBottom: 32 }),
    text(discount, { fontSize: 180, fontWeight: 900, color: colors.white, lineHeight: 0.9 }),
    text('OFF', { fontSize: 64, fontWeight: 900, color: colors.primary }),
    text('your first eSIM', { fontSize: 32, color: colors.white, marginTop: 24, marginBottom: 48 }),
    h('div', {
      padding: '24px 56px',
      backgroundColor: colors.primary,
      borderRadius: 20,
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      text('USE CODE', { fontSize: 14, color: colors.black, letterSpacing: 2, marginBottom: 4 }),
      text(code, { fontSize: 36, fontWeight: 900, color: colors.black }),
    ]),
    h('div', { marginTop: 48 }, IconLogo({ size: 48 })),
  ]);
}

// 9. TESTIMONIAL
function TestimonialPost({ quote, name, location }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
  }, [
    h('div', { marginBottom: 48 }, LongLogoWhite({ height: 40 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      h('div', { flexDirection: 'row', gap: 4, marginBottom: 32 },
        [1,2,3,4,5].map(() => Icons.Star({ size: 28, color: colors.secondary }))
      ),
      text(`"${quote}"`, { fontSize: 40, fontWeight: 600, color: colors.white, lineHeight: 1.4, marginBottom: 40 }),
      text(name, { fontSize: 24, fontWeight: 700, color: colors.white }),
      text(location, { fontSize: 18, color: colors.gray }),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.gray }),
  ]);
}

// 10. WHAT IS ESIM
function WhatIsEsimPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }, [
      LongLogo({ height: 36 }),
      h('div', { padding: '8px 20px', backgroundColor: colors.accent, borderRadius: 20 },
        text('EXPLAINER', { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
    ]),
    text('What is', { fontSize: 48, fontWeight: 300, color: colors.black }),
    text('an eSIM?', { fontSize: 64, fontWeight: 900, color: colors.black, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 32 }, [
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 24 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          Icons.Phone({ size: 28, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Digital SIM card', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Built into your phone - no plastic', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 24 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          Icons.QR({ size: 28, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Download instantly', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Scan a QR code to activate', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 24 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          Icons.Shield({ size: 28, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Keep your number', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Add travel data as a second line', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.gray }),
  ]);
}

// 11. BOLD NUMBER
function BoldNumberPost({ number, label }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text(number, { fontSize: 300, fontWeight: 900, color: colors.primary, lineHeight: 0.8 }),
    text(label, { fontSize: 48, fontWeight: 600, color: colors.white, marginTop: 24, textAlign: 'center' }),
    h('div', { position: 'absolute', bottom: 80, flexDirection: 'row', alignItems: 'center', gap: 24 }, [
      IconLogo({ size: 36 }),
      text('getlumbus.com', { fontSize: 18, color: colors.gray }),
    ]),
  ]);
}

// 12. SAVINGS
function SavingsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 80,
    alignItems: 'center',
  }, [
    IconLogo({ size: 56 }),
    text('Average savings per trip', { fontSize: 24, color: colors.black, marginTop: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', { flexDirection: 'row', alignItems: 'flex-start' }, [
        text('$', { fontSize: 64, fontWeight: 300, color: colors.black }),
        text('247', { fontSize: 180, fontWeight: 900, color: colors.black, lineHeight: 0.9 }),
      ]),
      text('vs carrier roaming', { fontSize: 28, color: colors.black }),
    ]),
    h('div', { padding: '24px 56px', backgroundColor: colors.black, borderRadius: 32 },
      text('Start saving today', { fontSize: 24, fontWeight: 700, color: colors.white })
    ),
    text('getlumbus.com', { fontSize: 16, color: colors.black, marginTop: 32 }),
  ]);
}

// 13. PHONE COMPATIBILITY
function PhoneCompatibilityPost() {
  const phones = [
    { name: 'iPhone XS and newer', models: 'XS, XR, 11, 12, 13, 14, 15, 16' },
    { name: 'Google Pixel 3+', models: 'Pixel 3, 4, 5, 6, 7, 8, 9' },
    { name: 'Samsung Galaxy S20+', models: 'S20, S21, S22, S23, S24, Fold, Flip' },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
  }, [
    h('div', { marginBottom: 32 }, LongLogoWhite({ height: 40 })),
    text('Does my phone', { fontSize: 40, fontWeight: 300, color: colors.white }),
    text('support eSIM?', { fontSize: 52, fontWeight: 900, color: colors.primary, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 24 },
      phones.map(p =>
        h('div', {
          padding: 28,
          backgroundColor: colors.darkGray,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
        }, [
          Icons.Check({ size: 28, color: colors.primary }),
          h('div', { flex: 1 }, [
            text(p.name, { fontSize: 22, fontWeight: 700, color: colors.white }),
            text(p.models, { fontSize: 14, color: colors.gray }),
          ]),
        ])
      )
    ),
    h('div', { padding: '20px 40px', backgroundColor: colors.primary, borderRadius: 16, alignSelf: 'center' },
      text('Check compatibility in app', { fontSize: 18, fontWeight: 700, color: colors.black })
    ),
  ]);
}

// ============================================
// STORY FORMATS
// ============================================

function StoryHero({ headline, sub }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.purple} 100%)`,
    padding: 80,
    alignItems: 'center',
  }, [
    h('div', { marginTop: 60 }, IconLogo({ size: 80 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text(headline, { fontSize: 72, fontWeight: 900, color: colors.black, textAlign: 'center', lineHeight: 1.1 }),
      text(sub, { fontSize: 32, color: colors.black, marginTop: 32, textAlign: 'center' }),
    ]),
    h('div', { padding: '28px 72px', backgroundColor: colors.black, borderRadius: 48, marginBottom: 40 },
      text('Swipe up', { fontSize: 28, fontWeight: 700, color: colors.white })
    ),
    text('getlumbus.com', { fontSize: 18, color: colors.black }),
  ]);
}

function StoryCountry({ name, code, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
    alignItems: 'center',
  }, [
    h('div', { marginTop: 60 }, LongLogo({ height: 48 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', {
        width: 240,
        height: 240,
        borderRadius: 120,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
      }, [
        Icons.MapPin({ size: 100, color: colors.black }),
      ]),
      text(name, { fontSize: 80, fontWeight: 900, color: colors.black, marginBottom: 24 }),
      h('div', { padding: '28px 64px', backgroundColor: colors.primary, borderRadius: 40 },
        text(`From ${price}`, { fontSize: 36, fontWeight: 700, color: colors.black })
      ),
    ]),
    h('div', { marginBottom: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }, [
      Icons.Zap({ size: 28, color: colors.gray }),
      text('Instant activation', { fontSize: 20, color: colors.gray }),
    ]),
  ]);
}

function StoryBoldStat({ stat, label }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { position: 'absolute', top: 80 }, LongLogoWhite({ height: 48 })),
    text(stat, { fontSize: 360, fontWeight: 900, color: colors.primary, lineHeight: 0.8 }),
    text(label, { fontSize: 56, fontWeight: 600, color: colors.white, marginTop: 32, textAlign: 'center' }),
    h('div', {
      position: 'absolute',
      bottom: 140,
      padding: '28px 72px',
      backgroundColor: colors.primary,
      borderRadius: 48,
    },
      text('Get started', { fontSize: 28, fontWeight: 700, color: colors.black })
    ),
    h('div', { position: 'absolute', bottom: 60 },
      text('getlumbus.com', { fontSize: 18, color: colors.gray })
    ),
  ]);
}

function StoryPromo({ discount, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { position: 'absolute', top: 80 }, IconLogo({ size: 64 })),
    text('LIMITED TIME', { fontSize: 22, fontWeight: 700, color: colors.primary, letterSpacing: 8, marginBottom: 40 }),
    text(discount, { fontSize: 240, fontWeight: 900, color: colors.white, lineHeight: 0.85 }),
    text('OFF', { fontSize: 96, fontWeight: 900, color: colors.primary }),
    text('your first eSIM', { fontSize: 36, color: colors.white, marginTop: 32, marginBottom: 64 }),
    h('div', {
      padding: '32px 72px',
      backgroundColor: colors.primary,
      borderRadius: 28,
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      text('USE CODE', { fontSize: 16, color: colors.black, letterSpacing: 3, marginBottom: 8 }),
      text(code, { fontSize: 48, fontWeight: 900, color: colors.black }),
    ]),
    h('div', { position: 'absolute', bottom: 60 },
      text('getlumbus.com', { fontSize: 18, color: colors.gray })
    ),
  ]);
}

function StorySteps() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
  }, [
    h('div', { marginTop: 40 }, LongLogo({ height: 48 })),
    text('3 easy steps', { fontSize: 56, fontWeight: 900, color: colors.black, marginTop: 48, marginBottom: 72 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 56 }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        h('div', { width: 100, height: 100, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          text('1', { fontSize: 48, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Download the app', { fontSize: 36, fontWeight: 700, color: colors.black }),
          text('Free on iOS & Android', { fontSize: 24, color: colors.gray }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        h('div', { width: 100, height: 100, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          text('2', { fontSize: 48, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Choose destination', { fontSize: 36, fontWeight: 700, color: colors.black }),
          text('150+ countries', { fontSize: 24, color: colors.gray }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        h('div', { width: 100, height: 100, borderRadius: 32, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          text('3', { fontSize: 48, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Scan & connect', { fontSize: 36, fontWeight: 700, color: colors.black }),
          text('Ready in 30 seconds', { fontSize: 24, color: colors.gray }),
        ]),
      ]),
    ]),
    h('div', { padding: '28px 72px', backgroundColor: colors.black, borderRadius: 48, alignSelf: 'center', marginBottom: 40 },
      text('Try it free', { fontSize: 28, fontWeight: 700, color: colors.white })
    ),
    text('getlumbus.com', { fontSize: 18, color: colors.gray, alignSelf: 'center' }),
  ]);
}

// ============================================
// GENERATION
// ============================================

async function generateImage(element, width, height, filename, fonts) {
  try {
    const svg = await satori(element, { width, height, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    await fs.mkdir(OUTPUT, { recursive: true });
    await fs.writeFile(path.join(OUTPUT, filename), pngBuffer);
    console.log(`   ${filename}`);
  } catch (e) {
    console.error(`Error generating ${filename}:`, e.message);
  }
}

async function main() {
  console.log('\n  LUMBUS MARKETING V3 - ULTRA PREMIUM');
  console.log('  ====================================\n');

  console.log('   Loading assets...');
  await loadLogos();

  // Download fonts
  console.log('   Downloading fonts...');
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

  const fonts = [
    { name: 'Inter', data: fontData.regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fontData.medium, weight: 500, style: 'normal' },
    { name: 'Inter', data: fontData.semibold, weight: 600, style: 'normal' },
    { name: 'Inter', data: fontData.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fontData.black, weight: 900, style: 'normal' },
  ];
  console.log('   Fonts loaded\n');

  const sq = sizes.square;
  const st = sizes.story;

  // ============================================
  // SQUARE POSTS
  // ============================================
  console.log('   Square Posts (1080x1080)');

  await generateImage(HeroPost(), sq.width, sq.height, 'hero.png', fonts);
  await generateImage(StatsPost(), sq.width, sq.height, 'stats.png', fonts);
  await generateImage(HowItWorksPost(), sq.width, sq.height, 'how-it-works.png', fonts);
  await generateImage(ComparisonPost(), sq.width, sq.height, 'comparison.png', fonts);
  await generateImage(FeaturesPost(), sq.width, sq.height, 'features.png', fonts);
  await generateImage(WhatIsEsimPost(), sq.width, sq.height, 'what-is-esim.png', fonts);
  await generateImage(PhoneCompatibilityPost(), sq.width, sq.height, 'compatibility.png', fonts);
  await generateImage(SavingsPost(), sq.width, sq.height, 'savings.png', fonts);

  // Promos
  await generateImage(PromoPost({ discount: '20%', code: 'WELCOME20' }), sq.width, sq.height, 'promo-20.png', fonts);
  await generateImage(PromoPost({ discount: '50%', code: 'FLASH50' }), sq.width, sq.height, 'promo-50.png', fonts);

  // Testimonials
  const testimonials = [
    { quote: 'Saved me $300 on my Japan trip. Setup took 30 seconds. Game changer.', name: 'Sarah M.', location: 'New York' },
    { quote: 'Best travel app discovery of 2024. Works perfectly across Europe.', name: 'James L.', location: 'London' },
    { quote: 'No more hunting for SIM cards at airports. Finally!', name: 'Maria G.', location: 'Sydney' },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await generateImage(TestimonialPost(testimonials[i]), sq.width, sq.height, `testimonial-${i + 1}.png`, fonts);
  }

  // Bold numbers
  await generateImage(BoldNumberPost({ number: '90%', label: 'cheaper than roaming' }), sq.width, sq.height, 'bold-90.png', fonts);
  await generateImage(BoldNumberPost({ number: '150+', label: 'countries covered' }), sq.width, sq.height, 'bold-150.png', fonts);
  await generateImage(BoldNumberPost({ number: '30s', label: 'to activate' }), sq.width, sq.height, 'bold-30s.png', fonts);

  // Country cards
  console.log('\n   Country Cards (1080x1080)');
  for (const c of countries) {
    await generateImage(CountryCard(c), sq.width, sq.height, `country-${c.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // Regional bundles
  console.log('\n   Regional Bundles (1080x1080)');
  for (const r of regions) {
    await generateImage(RegionalBundle(r), sq.width, sq.height, `bundle-${r.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // ============================================
  // STORIES
  // ============================================
  console.log('\n   Stories (1080x1920)');

  await generateImage(StoryHero({ headline: 'Travel data without the hassle.', sub: '150+ countries. Instant activation.' }), st.width, st.height, 'story-hero.png', fonts);
  await generateImage(StoryHero({ headline: 'Save 90% on roaming fees.', sub: 'Plans starting at $4.99' }), st.width, st.height, 'story-savings.png', fonts);
  await generateImage(StorySteps(), st.width, st.height, 'story-steps.png', fonts);
  await generateImage(StoryBoldStat({ stat: '90%', label: 'cheaper than roaming' }), st.width, st.height, 'story-90.png', fonts);
  await generateImage(StoryBoldStat({ stat: '30s', label: 'to activate' }), st.width, st.height, 'story-30s.png', fonts);
  await generateImage(StoryPromo({ discount: '20%', code: 'WELCOME20' }), st.width, st.height, 'story-promo-20.png', fonts);
  await generateImage(StoryPromo({ discount: '50%', code: 'FLASH50' }), st.width, st.height, 'story-promo-50.png', fonts);

  // Country stories
  for (const c of countries.slice(0, 6)) {
    await generateImage(StoryCountry(c), st.width, st.height, `story-${c.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  console.log('\n  ====================================');
  console.log('  V3 Premium designs generated!');
  console.log(`  Output: ${OUTPUT}`);
  console.log('  ====================================\n');
}

main().catch(console.error);
