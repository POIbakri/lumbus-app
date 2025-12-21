/**
 * Lumbus Marketing V2 - Premium Quality Designs
 * Clean, modern, WOW-factor marketing assets
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Design System
const colors = {
  primary: '#2EFECC',
  primaryDark: '#1DCCA0',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  purple: '#F7E2FB',
  mint: '#E0FEF7',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#666666',
  lightGray: '#F5F5F5',
  red: '#EF4444',
};

// Platform dimensions (2025)
const sizes = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

// Helper functions
const h = (type, style, children) => ({
  type,
  props: {
    style: { display: 'flex', ...style },
    children: Array.isArray(children) ? children : children,
  },
});

const text = (content, style = {}) => ({
  type: 'span',
  props: {
    style: { ...style },
    children: content,
  },
});

// SVG Icons - Clean, professional vectors
const Icons = {
  Globe: ({ size = 24, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'circle', props: { cx: 12, cy: 12, r: 10, stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M2 12h20', stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', stroke: color, strokeWidth: 2 } },
      ],
    },
  }),

  Lightning: ({ size = 24, color = colors.black }) => ({
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

  Check: ({ size = 24, color = colors.black }) => ({
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

  Plane: ({ size = 24, color = colors.black }) => ({
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

  Star: ({ size = 24, color = colors.black }) => ({
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

  Shield: ({ size = 24, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', stroke: color, strokeWidth: 2 } },
        { type: 'path', props: { d: 'M9 12l2 2 4-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
      ],
    },
  }),

  Signal: ({ size = 24, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M5 20v-4', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M10 20v-8', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M15 20v-12', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M20 20v-16', stroke: color, strokeWidth: 3, strokeLinecap: 'round' } },
      ],
    },
  }),

  Download: ({ size = 24, color = colors.black }) => ({
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children: [
        { type: 'path', props: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
        { type: 'path', props: { d: 'M7 10l5 5 5-5', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } },
        { type: 'path', props: { d: 'M12 15V3', stroke: color, strokeWidth: 2, strokeLinecap: 'round' } },
      ],
    },
  }),

  QR: ({ size = 24, color = colors.black }) => ({
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
        { type: 'rect', props: { x: 18, y: 14, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 14, y: 18, width: 3, height: 3, fill: color } },
        { type: 'rect', props: { x: 18, y: 18, width: 3, height: 3, fill: color } },
      ],
    },
  }),
};

// Logo component
let logoBase64 = null;

async function loadLogo() {
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'lumbus-logo.png');
    const logoBuffer = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (e) {
    console.log('   Logo not found, using fallback');
  }
}

function Logo({ size = 40 }) {
  if (logoBase64) {
    return h('img', { src: logoBase64, width: size, height: size });
  }
  return h('div', {
    width: size,
    height: size,
    borderRadius: size / 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  }, text('L', { fontSize: size * 0.5, fontWeight: 900, color: colors.black }));
}

function LogoWithText({ size = 32, dark = false }) {
  return h('div', { flexDirection: 'row', alignItems: 'center', gap: 10 }, [
    Logo({ size }),
    text('lumbus', { fontSize: size * 0.75, fontWeight: 700, color: dark ? colors.black : colors.white }),
  ]);
}

// Footer
function Footer({ dark = false }) {
  return h('div', { marginTop: 'auto', paddingTop: 16, alignItems: 'center' }, [
    text('getlumbus.com', { fontSize: 14, fontWeight: 600, color: dark ? colors.gray : 'rgba(255,255,255,0.7)' }),
  ]);
}

// ============================================
// PREMIUM DESIGNS
// ============================================

// 1. Hero - Bold statement with gradient
function HeroPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.purple} 100%)`,
    padding: 60,
  }, [
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('Travel data', { fontSize: 64, fontWeight: 300, color: colors.black, lineHeight: 1.1 }),
      text('made simple.', { fontSize: 64, fontWeight: 900, color: colors.black, lineHeight: 1.1 }),
      h('div', { marginTop: 40, flexDirection: 'row', gap: 24 }, [
        h('div', { flexDirection: 'column', alignItems: 'center' }, [
          text('150+', { fontSize: 48, fontWeight: 900, color: colors.black }),
          text('Countries', { fontSize: 16, color: colors.black }),
        ]),
        h('div', { width: 2, height: 60, backgroundColor: 'rgba(0,0,0,0.2)' }),
        h('div', { flexDirection: 'column', alignItems: 'center' }, [
          text('$4.99', { fontSize: 48, fontWeight: 900, color: colors.black }),
          text('Starting', { fontSize: 16, color: colors.black }),
        ]),
        h('div', { width: 2, height: 60, backgroundColor: 'rgba(0,0,0,0.2)' }),
        h('div', { flexDirection: 'column', alignItems: 'center' }, [
          text('30s', { fontSize: 48, fontWeight: 900, color: colors.black }),
          text('Setup', { fontSize: 16, color: colors.black }),
        ]),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoWithText({ size: 36, dark: true }),
      text('getlumbus.com', { fontSize: 16, fontWeight: 600, color: colors.black }),
    ]),
  ]);
}

// 2. Minimal Country Card
function CountryCard({ country, flag, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text(flag, { fontSize: 180 }),
      text(country, { fontSize: 56, fontWeight: 900, color: colors.black, marginTop: 24 }),
      h('div', { marginTop: 32, padding: '16px 40px', backgroundColor: colors.primary, borderRadius: 50 }, [
        text(`From ${price}`, { fontSize: 24, fontWeight: 700, color: colors.black }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoWithText({ size: 32, dark: true }),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
        Icons.Lightning({ size: 20, color: colors.primary }),
        text('Instant activation', { fontSize: 14, color: colors.gray }),
      ]),
    ]),
  ]);
}

// 3. Bold Stats
function StatsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
  }, [
    h('div', { marginBottom: 40 }, LogoWithText({ size: 32, dark: false })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 32 }, [
      h('div', { flexDirection: 'column' }, [
        h('div', { flexDirection: 'row', alignItems: 'baseline', gap: 8 }, [
          text('90', { fontSize: 120, fontWeight: 900, color: colors.primary, lineHeight: 1 }),
          text('%', { fontSize: 60, fontWeight: 900, color: colors.primary }),
        ]),
        text('cheaper than roaming', { fontSize: 28, color: colors.white }),
      ]),
      h('div', { width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)' }),
      h('div', { flexDirection: 'row', justifyContent: 'space-between' }, [
        h('div', { flexDirection: 'column' }, [
          text('4.8', { fontSize: 48, fontWeight: 900, color: colors.white }),
          h('div', { flexDirection: 'row', gap: 4 },
            [1,2,3,4,5].map(() => Icons.Star({ size: 16, color: colors.secondary }))
          ),
          text('App Store', { fontSize: 14, color: colors.gray, marginTop: 4 }),
        ]),
        h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          text('100K+', { fontSize: 48, fontWeight: 900, color: colors.white }),
          text('Happy travelers', { fontSize: 14, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
    ]),
    Footer({ dark: false }),
  ]);
}

// 4. How It Works - Clean Steps
function HowItWorksPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    text('How it works', { fontSize: 48, fontWeight: 900, color: colors.black, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 40 }, [
      // Step 1
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          Icons.Download({ size: 40, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Download the app', { fontSize: 28, fontWeight: 700, color: colors.black }),
          text('Free on iOS & Android', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
      // Step 2
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          Icons.Globe({ size: 40, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Pick your destination', { fontSize: 28, fontWeight: 700, color: colors.black }),
          text('150+ countries available', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
      // Step 3
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          Icons.QR({ size: 40, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Scan & activate', { fontSize: 28, fontWeight: 700, color: colors.black }),
          text('Ready in 30 seconds', { fontSize: 18, color: colors.gray }),
        ]),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoWithText({ size: 32, dark: true }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray }),
    ]),
  ]);
}

// 5. Comparison - Clean split
function ComparisonPost() {
  return h('div', {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  }, [
    // Left - Old way
    h('div', { flex: 1, backgroundColor: colors.lightGray, padding: 48, flexDirection: 'column' }, [
      text('Carrier', { fontSize: 14, fontWeight: 600, color: colors.gray, letterSpacing: 2, marginBottom: 16 }),
      text('$300', { fontSize: 72, fontWeight: 900, color: colors.red, lineHeight: 1 }),
      text('roaming bill', { fontSize: 20, color: colors.gray, marginBottom: 32 }),
      h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
        text('Wait at airport', { fontSize: 18, color: colors.gray, textDecoration: 'line-through' }),
        text('Hunt for SIM cards', { fontSize: 18, color: colors.gray, textDecoration: 'line-through' }),
        text('Bill shock', { fontSize: 18, color: colors.gray, textDecoration: 'line-through' }),
      ]),
    ]),
    // Right - Lumbus
    h('div', { flex: 1, backgroundColor: colors.primary, padding: 48, flexDirection: 'column' }, [
      text('Lumbus', { fontSize: 14, fontWeight: 600, color: colors.black, letterSpacing: 2, marginBottom: 16 }),
      text('$9.99', { fontSize: 72, fontWeight: 900, color: colors.black, lineHeight: 1 }),
      text('10GB data', { fontSize: 20, color: colors.black, marginBottom: 32 }),
      h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.Check({ size: 24, color: colors.black }),
          text('Instant setup', { fontSize: 18, fontWeight: 600, color: colors.black }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.Check({ size: 24, color: colors.black }),
          text('Works immediately', { fontSize: 18, fontWeight: 600, color: colors.black }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.Check({ size: 24, color: colors.black }),
          text('No surprises', { fontSize: 18, fontWeight: 600, color: colors.black }),
        ]),
      ]),
      h('div', { marginTop: 'auto' }, LogoWithText({ size: 28, dark: true })),
    ]),
  ]);
}

// 6. Feature Grid - Modern icons
function FeatureGridPost() {
  const features = [
    { icon: Icons.Globe, title: '150+ Countries', bg: colors.primary },
    { icon: Icons.Lightning, title: 'Instant Setup', bg: colors.accent },
    { icon: Icons.Shield, title: 'Secure Data', bg: colors.purple },
    { icon: Icons.Signal, title: 'Fast Speeds', bg: colors.secondary },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 48,
  }, [
    h('div', { marginBottom: 32 }, LogoWithText({ size: 32, dark: true })),
    text('Everything you need', { fontSize: 40, fontWeight: 900, color: colors.black, marginBottom: 40 }),
    h('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
      features.map(f =>
        h('div', {
          width: '47%',
          padding: 32,
          backgroundColor: f.bg,
          borderRadius: 24,
          flexDirection: 'column',
          alignItems: 'flex-start',
        }, [
          f.icon({ size: 48, color: colors.black }),
          text(f.title, { fontSize: 24, fontWeight: 700, color: colors.black, marginTop: 16 }),
        ])
      )
    ),
    Footer({ dark: true }),
  ]);
}

// 7. Testimonial - Clean quote
function TestimonialPost({ quote, name, location }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.black} 0%, #2D2D2D 100%)`,
    padding: 60,
  }, [
    h('div', { marginBottom: 40 }, LogoWithText({ size: 32, dark: false })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('"', { fontSize: 120, fontWeight: 900, color: colors.primary, lineHeight: 0.5, marginBottom: 16 }),
      text(quote, { fontSize: 36, fontWeight: 500, color: colors.white, lineHeight: 1.4 }),
      h('div', { marginTop: 40 }, [
        text(name, { fontSize: 24, fontWeight: 700, color: colors.white }),
        text(location, { fontSize: 18, color: colors.gray, marginTop: 4 }),
      ]),
    ]),
    h('div', { flexDirection: 'row', gap: 8 },
      [1,2,3,4,5].map(() => Icons.Star({ size: 24, color: colors.secondary }))
    ),
  ]);
}

// 8. Promo - Bold offer
function PromoPost({ discount, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${colors.black} 0%, #1a1a2e 100%)`,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text('LIMITED TIME', { fontSize: 16, fontWeight: 700, color: colors.primary, letterSpacing: 4, marginBottom: 24 }),
    h('div', { flexDirection: 'row', alignItems: 'baseline' }, [
      text(discount, { fontSize: 160, fontWeight: 900, color: colors.white, lineHeight: 1 }),
      text('OFF', { fontSize: 48, fontWeight: 900, color: colors.primary, marginLeft: 16 }),
    ]),
    text('your first eSIM', { fontSize: 32, color: colors.white, marginTop: 16, marginBottom: 48 }),
    h('div', {
      padding: '20px 48px',
      backgroundColor: colors.primary,
      borderRadius: 16,
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      text('USE CODE', { fontSize: 12, color: colors.black, letterSpacing: 2, marginBottom: 4 }),
      text(code, { fontSize: 32, fontWeight: 900, color: colors.black }),
    ]),
    h('div', { marginTop: 48 }, LogoWithText({ size: 36, dark: false })),
  ]);
}

// 9. Regional Bundle
function RegionalBundlePost({ region, flag, countries, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 60,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, [
      h('div', { padding: '8px 20px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20 },
        text('REGIONAL', { fontSize: 12, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
      Logo({ size: 40 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text(flag, { fontSize: 100 }),
      text(region, { fontSize: 56, fontWeight: 900, color: colors.black, marginTop: 16 }),
      text(`${countries} countries covered`, { fontSize: 24, color: colors.black, marginTop: 8 }),
    ]),
    h('div', {
      padding: 24,
      backgroundColor: colors.white,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, [
      h('div', {}, [
        text('Starting from', { fontSize: 14, color: colors.gray }),
        text(price, { fontSize: 36, fontWeight: 900, color: colors.black }),
      ]),
      h('div', { padding: '12px 28px', backgroundColor: colors.black, borderRadius: 12 },
        text('Get now', { fontSize: 16, fontWeight: 700, color: colors.white })
      ),
    ]),
  ]);
}

// 10. What is eSIM - Educational
function WhatIsEsimPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { padding: '8px 20px', backgroundColor: colors.accent, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 24 },
      text('EXPLAINER', { fontSize: 12, fontWeight: 700, color: colors.black, letterSpacing: 2 })
    ),
    text('What is', { fontSize: 48, fontWeight: 300, color: colors.black }),
    text('an eSIM?', { fontSize: 64, fontWeight: 900, color: colors.black, marginBottom: 40 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 32 }, [
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 20 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          text('1', { fontSize: 28, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Digital SIM card', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Built into your phone - no plastic needed', { fontSize: 16, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 20 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          text('2', { fontSize: 28, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Download instantly', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Activate by scanning a QR code', { fontSize: 16, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'flex-start', gap: 20 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          text('3', { fontSize: 28, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Keep your number', { fontSize: 24, fontWeight: 700, color: colors.black }),
          text('Add travel data as a second line', { fontSize: 16, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoWithText({ size: 32, dark: true }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray }),
    ]),
  ]);
}

// 11. Phone Compatibility
function PhoneCompatibilityPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
  }, [
    h('div', { marginBottom: 24 }, LogoWithText({ size: 32, dark: false })),
    text('Does my phone', { fontSize: 40, fontWeight: 300, color: colors.white }),
    text('support eSIM?', { fontSize: 48, fontWeight: 900, color: colors.primary, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 20 }, [
      h('div', { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }, [
        Icons.Check({ size: 28, color: colors.primary }),
        h('div', { flex: 1 }, [
          text('iPhone XS and newer', { fontSize: 20, fontWeight: 600, color: colors.white }),
          text('XS, XR, 11, 12, 13, 14, 15, 16', { fontSize: 14, color: colors.gray }),
        ]),
      ]),
      h('div', { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }, [
        Icons.Check({ size: 28, color: colors.primary }),
        h('div', { flex: 1 }, [
          text('Google Pixel 3+', { fontSize: 20, fontWeight: 600, color: colors.white }),
          text('Pixel 3, 4, 5, 6, 7, 8, 9', { fontSize: 14, color: colors.gray }),
        ]),
      ]),
      h('div', { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }, [
        Icons.Check({ size: 28, color: colors.primary }),
        h('div', { flex: 1 }, [
          text('Samsung Galaxy S20+', { fontSize: 20, fontWeight: 600, color: colors.white }),
          text('S20, S21, S22, S23, S24, Fold, Flip', { fontSize: 14, color: colors.gray }),
        ]),
      ]),
    ]),
    h('div', { padding: 20, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', marginTop: 32 },
      text('Check compatibility in our app', { fontSize: 16, fontWeight: 700, color: colors.black })
    ),
  ]);
}

// 12. Savings Calculator Look
function SavingsPost({ amount }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 60,
    alignItems: 'center',
  }, [
    h('div', { marginBottom: 40 }, Logo({ size: 48 })),
    text('Average savings per trip', { fontSize: 20, color: colors.black, marginBottom: 16 }),
    h('div', { flexDirection: 'row', alignItems: 'flex-start' }, [
      text('$', { fontSize: 48, fontWeight: 300, color: colors.black, marginTop: 20 }),
      text(amount, { fontSize: 160, fontWeight: 900, color: colors.black, lineHeight: 1 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text('vs carrier roaming fees', { fontSize: 24, color: colors.black }),
    ]),
    h('div', {
      padding: '20px 48px',
      backgroundColor: colors.black,
      borderRadius: 28,
    }, [
      text('Start saving today', { fontSize: 20, fontWeight: 700, color: colors.white }),
    ]),
    Footer({ dark: true }),
  ]);
}

// ============================================
// WOW FACTOR DESIGNS
// ============================================

// 13. Bold Typography - Giant text impact
function BoldTypoPost({ stat, label }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text(stat, { fontSize: 280, fontWeight: 900, color: colors.primary, lineHeight: 0.85 }),
    text(label, { fontSize: 42, fontWeight: 700, color: colors.white, marginTop: 32, textAlign: 'center' }),
    h('div', { position: 'absolute', bottom: 60, width: '100%', paddingLeft: 60, paddingRight: 60 }, [
      h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }, [
        LogoWithText({ size: 28, dark: false }),
        text('getlumbus.com', { fontSize: 14, color: colors.gray }),
      ]),
    ]),
  ]);
}

// 14. Color Block Split
function ColorBlockPost({ leftText, rightText, leftBg, rightBg }) {
  return h('div', {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  }, [
    h('div', {
      flex: 1,
      backgroundColor: leftBg,
      padding: 40,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      text(leftText, { fontSize: 56, fontWeight: 900, color: colors.black, textAlign: 'center', lineHeight: 1.1 }),
    ]),
    h('div', {
      flex: 1,
      backgroundColor: rightBg,
      padding: 40,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      text(rightText, { fontSize: 56, fontWeight: 900, color: colors.black, textAlign: 'center', lineHeight: 1.1 }),
    ]),
  ]);
}

// 15. Minimal Quote Card
function MinimalQuotePost({ quote, author }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 80,
  }, [
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('"', { fontSize: 200, fontWeight: 900, color: colors.primary, lineHeight: 0.4, marginBottom: 24 }),
      text(quote, { fontSize: 44, fontWeight: 600, color: colors.black, lineHeight: 1.3 }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      h('div', {}, [
        text(author, { fontSize: 20, fontWeight: 700, color: colors.black }),
        h('div', { flexDirection: 'row', gap: 4, marginTop: 8 },
          [1,2,3,4,5].map(() => Icons.Star({ size: 18, color: colors.secondary }))
        ),
      ]),
      LogoWithText({ size: 28, dark: true }),
    ]),
  ]);
}

// 16. Urgent Promo - FOMO style
function UrgentPromoPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.red,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text('FLASH SALE', { fontSize: 24, fontWeight: 900, color: colors.white, letterSpacing: 8, marginBottom: 24 }),
    text('50%', { fontSize: 200, fontWeight: 900, color: colors.white, lineHeight: 0.9 }),
    text('OFF', { fontSize: 80, fontWeight: 900, color: colors.white }),
    h('div', { marginTop: 40, padding: '20px 48px', backgroundColor: colors.white, borderRadius: 16 }, [
      text('CODE: FLASH50', { fontSize: 28, fontWeight: 900, color: colors.red }),
    ]),
    text('24 HOURS ONLY', { fontSize: 18, fontWeight: 700, color: colors.white, marginTop: 32, letterSpacing: 4 }),
    h('div', { position: 'absolute', bottom: 40 }, Logo({ size: 40 })),
  ]);
}

// 17. Data Visualization - Clean numbers
function DataVizPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
  }, [
    h('div', { marginBottom: 40 }, LogoWithText({ size: 32, dark: false })),
    text('By the numbers', { fontSize: 20, color: colors.gray, marginBottom: 8 }),
    text('2024 in review', { fontSize: 48, fontWeight: 900, color: colors.white, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 32 }, [
      h('div', { flexDirection: 'row', alignItems: 'baseline', gap: 16 }, [
        text('1M+', { fontSize: 72, fontWeight: 900, color: colors.primary }),
        text('eSIMs activated', { fontSize: 24, color: colors.white }),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'baseline', gap: 16 }, [
        text('150+', { fontSize: 72, fontWeight: 900, color: colors.accent }),
        text('countries covered', { fontSize: 24, color: colors.white }),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'baseline', gap: 16 }, [
        text('$2M+', { fontSize: 72, fontWeight: 900, color: colors.secondary }),
        text('saved by travelers', { fontSize: 24, color: colors.white }),
      ]),
    ]),
    Footer({ dark: false }),
  ]);
}

// 18. Before/After Visual
function BeforeAfterPost() {
  return h('div', {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  }, [
    // Before
    h('div', {
      flex: 1,
      backgroundColor: '#2D2D2D',
      padding: 48,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text('BEFORE', { fontSize: 14, fontWeight: 700, color: colors.gray, letterSpacing: 4, marginBottom: 32 }),
      text('😰', { fontSize: 100, marginBottom: 24 }),
      text('$347', { fontSize: 56, fontWeight: 900, color: colors.red, textDecoration: 'line-through' }),
      text('roaming bill', { fontSize: 18, color: colors.gray }),
    ]),
    // After
    h('div', {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 48,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text('AFTER', { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 4, marginBottom: 32 }),
      text('😎', { fontSize: 100, marginBottom: 24 }),
      text('$12', { fontSize: 56, fontWeight: 900, color: colors.black }),
      text('for 10GB', { fontSize: 18, color: colors.black }),
      h('div', { marginTop: 32 }, Logo({ size: 36 })),
    ]),
  ]);
}

// 19. Quick Tips Carousel Style
function TipsPost({ tipNumber, tip, description }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
    padding: 60,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }, [
      LogoWithText({ size: 32, dark: true }),
      h('div', { padding: '8px 20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20 },
        text(`TIP ${tipNumber}`, { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text(tip, { fontSize: 52, fontWeight: 900, color: colors.black, lineHeight: 1.15, marginBottom: 24 }),
      text(description, { fontSize: 24, color: colors.black, opacity: 0.8, lineHeight: 1.4 }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 8 }, [
      h('div', { width: 12, height: 12, borderRadius: 6, backgroundColor: tipNumber === 1 ? colors.black : 'rgba(0,0,0,0.3)' }),
      h('div', { width: 12, height: 12, borderRadius: 6, backgroundColor: tipNumber === 2 ? colors.black : 'rgba(0,0,0,0.3)' }),
      h('div', { width: 12, height: 12, borderRadius: 6, backgroundColor: tipNumber === 3 ? colors.black : 'rgba(0,0,0,0.3)' }),
    ]),
  ]);
}

// 20. FAQ Style
function FAQPost({ question, answer }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { padding: '8px 20px', backgroundColor: colors.accent, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 40 },
      text('FAQ', { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 2 })
    ),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text(question, { fontSize: 44, fontWeight: 900, color: colors.black, lineHeight: 1.2, marginBottom: 40 }),
      h('div', { padding: 32, backgroundColor: colors.lightGray, borderRadius: 20 }, [
        text(answer, { fontSize: 24, color: colors.black, lineHeight: 1.5 }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoWithText({ size: 32, dark: true }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray }),
    ]),
  ]);
}

// 21. Social Proof Counter
function SocialProofPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { flexDirection: 'row', gap: 4, marginBottom: 24 },
      [1,2,3,4,5].map(() => Icons.Star({ size: 32, color: colors.secondary }))
    ),
    text('Join', { fontSize: 32, color: colors.white }),
    text('100,000+', { fontSize: 96, fontWeight: 900, color: colors.primary, lineHeight: 1 }),
    text('happy travelers', { fontSize: 32, color: colors.white, marginBottom: 48 }),
    h('div', { flexDirection: 'row', gap: 20 }, [
      h('div', { padding: '16px 28px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }, [
        text('4.8', { fontSize: 24, fontWeight: 900, color: colors.white }),
        text('App Store', { fontSize: 12, color: colors.gray, marginTop: 4 }),
      ]),
      h('div', { padding: '16px 28px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }, [
        text('4.7', { fontSize: 24, fontWeight: 900, color: colors.white }),
        text('Play Store', { fontSize: 12, color: colors.gray, marginTop: 4 }),
      ]),
    ]),
    h('div', { position: 'absolute', bottom: 60 }, LogoWithText({ size: 32, dark: false })),
  ]);
}

// 22. Countdown Timer Style
function CountdownPost({ hours, minutes, offer }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text('OFFER ENDS IN', { fontSize: 18, fontWeight: 700, color: colors.gray, letterSpacing: 6, marginBottom: 32 }),
    h('div', { flexDirection: 'row', gap: 20, marginBottom: 48 }, [
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        h('div', { width: 120, height: 120, backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
          text(hours, { fontSize: 64, fontWeight: 900, color: colors.black })
        ),
        text('HOURS', { fontSize: 12, color: colors.gray, marginTop: 8, letterSpacing: 2 }),
      ]),
      text(':', { fontSize: 64, fontWeight: 900, color: colors.primary, marginTop: 20 }),
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        h('div', { width: 120, height: 120, backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
          text(minutes, { fontSize: 64, fontWeight: 900, color: colors.black })
        ),
        text('MINS', { fontSize: 12, color: colors.gray, marginTop: 8, letterSpacing: 2 }),
      ]),
    ]),
    text(offer, { fontSize: 28, fontWeight: 700, color: colors.white, textAlign: 'center', marginBottom: 32 }),
    h('div', { padding: '20px 48px', backgroundColor: colors.primary, borderRadius: 16 }, [
      text('CLAIM NOW', { fontSize: 20, fontWeight: 900, color: colors.black }),
    ]),
    h('div', { position: 'absolute', bottom: 40 }, Logo({ size: 36 })),
  ]);
}

// 23. Checklist Style
function ChecklistPost({ title, items }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { marginBottom: 32 }, LogoWithText({ size: 32, dark: true })),
    text(title, { fontSize: 44, fontWeight: 900, color: colors.black, marginBottom: 48 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 24 },
      items.map((item, i) =>
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 20 }, [
          h('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
            Icons.Check({ size: 28, color: colors.black })
          ),
          text(item, { fontSize: 24, fontWeight: 600, color: colors.black }),
        ])
      )
    ),
    Footer({ dark: true }),
  ]);
}

// 24. Gradient Text Hero
function GradientHeroPost({ line1, line2 }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text(line1, { fontSize: 64, fontWeight: 300, color: colors.white, textAlign: 'center', lineHeight: 1.1 }),
    text(line2, { fontSize: 64, fontWeight: 900, color: colors.primary, textAlign: 'center', lineHeight: 1.1, marginBottom: 48 }),
    h('div', { flexDirection: 'row', gap: 24 }, [
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        Icons.Globe({ size: 36, color: colors.accent }),
        text('150+ countries', { fontSize: 14, color: colors.gray, marginTop: 8 }),
      ]),
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        Icons.Lightning({ size: 36, color: colors.secondary }),
        text('Instant setup', { fontSize: 14, color: colors.gray, marginTop: 8 }),
      ]),
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        Icons.Shield({ size: 36, color: colors.purple }),
        text('Secure data', { fontSize: 14, color: colors.gray, marginTop: 8 }),
      ]),
    ]),
    h('div', { position: 'absolute', bottom: 60, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingLeft: 60, paddingRight: 60, alignItems: 'center' }, [
      LogoWithText({ size: 28, dark: false }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray }),
    ]),
  ]);
}

// ============================================
// STORY FORMATS (1080x1920)
// ============================================

function StoryHero({ headline, subheadline }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.purple} 100%)`,
    padding: 60,
    alignItems: 'center',
  }, [
    h('div', { marginTop: 60 }, Logo({ size: 64 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text(headline, { fontSize: 64, fontWeight: 900, color: colors.black, textAlign: 'center', lineHeight: 1.1 }),
      text(subheadline, { fontSize: 28, color: colors.black, marginTop: 24, textAlign: 'center' }),
    ]),
    h('div', {
      padding: '24px 64px',
      backgroundColor: colors.black,
      borderRadius: 40,
      marginBottom: 60,
    }, [
      text('Swipe up', { fontSize: 24, fontWeight: 700, color: colors.white }),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.black }),
  ]);
}

function StoryCountry({ country, flag, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
    alignItems: 'center',
  }, [
    h('div', { marginTop: 60 }, LogoWithText({ size: 40, dark: true })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text(flag, { fontSize: 200 }),
      text(country, { fontSize: 72, fontWeight: 900, color: colors.black, marginTop: 32 }),
      h('div', { marginTop: 48, padding: '24px 56px', backgroundColor: colors.primary, borderRadius: 32 }, [
        text(`From ${price}`, { fontSize: 32, fontWeight: 700, color: colors.black }),
      ]),
    ]),
    h('div', { marginBottom: 60, flexDirection: 'column', alignItems: 'center' }, [
      Icons.Lightning({ size: 32, color: colors.primary }),
      text('Instant activation', { fontSize: 20, color: colors.gray, marginTop: 12 }),
    ]),
  ]);
}

// Story: Bold Stat
function StoryBoldStat({ stat, label }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { position: 'absolute', top: 60 }, LogoWithText({ size: 36, dark: false })),
    text(stat, { fontSize: 320, fontWeight: 900, color: colors.primary, lineHeight: 0.85 }),
    text(label, { fontSize: 48, fontWeight: 700, color: colors.white, marginTop: 40, textAlign: 'center' }),
    h('div', {
      position: 'absolute',
      bottom: 120,
      padding: '24px 64px',
      backgroundColor: colors.primary,
      borderRadius: 40,
    }, [
      text('Get started', { fontSize: 28, fontWeight: 700, color: colors.black }),
    ]),
    h('div', { position: 'absolute', bottom: 40 },
      text('getlumbus.com', { fontSize: 16, color: colors.gray })
    ),
  ]);
}

// Story: Steps
function StorySteps() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { marginTop: 40 }, LogoWithText({ size: 40, dark: true })),
    text('3 simple steps', { fontSize: 48, fontWeight: 900, color: colors.black, marginTop: 40, marginBottom: 60 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 48 }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          text('1', { fontSize: 40, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Download the app', { fontSize: 32, fontWeight: 700, color: colors.black }),
          text('Free on iOS & Android', { fontSize: 20, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          text('2', { fontSize: 40, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Pick a destination', { fontSize: 32, fontWeight: 700, color: colors.black }),
          text('150+ countries', { fontSize: 20, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          text('3', { fontSize: 40, fontWeight: 900, color: colors.black })
        ),
        h('div', { flex: 1 }, [
          text('Scan & connect', { fontSize: 32, fontWeight: 700, color: colors.black }),
          text('Ready in 30 seconds', { fontSize: 20, color: colors.gray, marginTop: 4 }),
        ]),
      ]),
    ]),
    h('div', {
      padding: '24px 64px',
      backgroundColor: colors.black,
      borderRadius: 40,
      alignSelf: 'center',
      marginBottom: 40,
    }, [
      text('Try it free', { fontSize: 24, fontWeight: 700, color: colors.white }),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.gray, alignSelf: 'center' }),
  ]);
}

// Story: Promo
function StoryPromo({ discount, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.black} 0%, #1a1a2e 100%)`,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { position: 'absolute', top: 60 }, Logo({ size: 48 })),
    text('LIMITED TIME', { fontSize: 20, fontWeight: 700, color: colors.primary, letterSpacing: 8, marginBottom: 32 }),
    text(discount, { fontSize: 200, fontWeight: 900, color: colors.white, lineHeight: 0.9 }),
    text('OFF', { fontSize: 80, fontWeight: 900, color: colors.primary }),
    text('your first eSIM', { fontSize: 32, color: colors.white, marginTop: 24, marginBottom: 60 }),
    h('div', {
      padding: '28px 64px',
      backgroundColor: colors.primary,
      borderRadius: 24,
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      text('USE CODE', { fontSize: 14, color: colors.black, letterSpacing: 3, marginBottom: 8 }),
      text(code, { fontSize: 40, fontWeight: 900, color: colors.black }),
    ]),
    h('div', { position: 'absolute', bottom: 40 },
      text('getlumbus.com', { fontSize: 16, color: colors.gray })
    ),
  ]);
}

// Story: Feature List
function StoryFeatures() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 60,
  }, [
    h('div', { marginTop: 40 }, LogoWithText({ size: 40, dark: true })),
    text('Why travelers love us', { fontSize: 44, fontWeight: 900, color: colors.black, marginTop: 48, marginBottom: 60 }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 40 }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
          Icons.Globe({ size: 40, color: colors.black })
        ),
        text('150+ countries covered', { fontSize: 28, fontWeight: 600, color: colors.black }),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
          Icons.Lightning({ size: 40, color: colors.black })
        ),
        text('Instant activation', { fontSize: 28, fontWeight: 600, color: colors.black }),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
          Icons.Shield({ size: 40, color: colors.black })
        ),
        text('Secure & reliable', { fontSize: 28, fontWeight: 600, color: colors.black }),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        h('div', { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
          Icons.Star({ size: 40, color: colors.black })
        ),
        text('4.8 star rating', { fontSize: 28, fontWeight: 600, color: colors.black }),
      ]),
    ]),
    h('div', {
      padding: '24px 64px',
      backgroundColor: colors.black,
      borderRadius: 40,
      alignSelf: 'center',
      marginBottom: 40,
    }, [
      text('Swipe up', { fontSize: 24, fontWeight: 700, color: colors.white }),
    ]),
    text('getlumbus.com', { fontSize: 16, color: colors.black, alignSelf: 'center' }),
  ]);
}

// Story: Before/After
function StoryBeforeAfter() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  }, [
    // Before (top half)
    h('div', {
      flex: 1,
      backgroundColor: '#2D2D2D',
      padding: 48,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text('BEFORE', { fontSize: 16, fontWeight: 700, color: colors.gray, letterSpacing: 6, marginBottom: 24 }),
      text('😰', { fontSize: 120, marginBottom: 16 }),
      text('$347', { fontSize: 72, fontWeight: 900, color: colors.red, textDecoration: 'line-through' }),
      text('roaming bill', { fontSize: 24, color: colors.gray }),
    ]),
    // After (bottom half)
    h('div', {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 48,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text('WITH LUMBUS', { fontSize: 16, fontWeight: 700, color: colors.black, letterSpacing: 6, marginBottom: 24 }),
      text('😎', { fontSize: 120, marginBottom: 16 }),
      text('$12', { fontSize: 72, fontWeight: 900, color: colors.black }),
      text('for 10GB', { fontSize: 24, color: colors.black }),
      h('div', { marginTop: 32 }, Logo({ size: 48 })),
    ]),
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

    const outputDir = path.join(process.cwd(), 'marketing', 'v2', 'output');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, filename), pngBuffer);
    console.log(`   ${filename}`);
  } catch (e) {
    console.error(`Error generating ${filename}:`, e.message);
  }
}

async function main() {
  console.log('\n  LUMBUS MARKETING V2 - PREMIUM DESIGNS');
  console.log('  ========================================\n');

  console.log('   Loading assets...');
  await loadLogo();

  // Download fonts from CDN
  const fontUrls = {
    regular: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff',
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    semibold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };

  let fonts = [];
  try {
    const fontData = {};
    for (const [name, url] of Object.entries(fontUrls)) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to download ${name}`);
      fontData[name] = Buffer.from(await response.arrayBuffer());
    }

    fonts = [
      { name: 'Inter', data: fontData.regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontData.medium, weight: 500, style: 'normal' },
      { name: 'Inter', data: fontData.semibold, weight: 600, style: 'normal' },
      { name: 'Inter', data: fontData.bold, weight: 700, style: 'normal' },
      { name: 'Inter', data: fontData.black, weight: 900, style: 'normal' },
    ];
    console.log('   Fonts loaded from CDN');
  } catch (e) {
    console.log('   Font download failed:', e.message);
    throw e;
  }

  console.log('   Assets ready\n');

  // Generate Square Posts
  console.log('   Square Posts (1080x1080)');
  const sq = sizes.square;

  await generateImage(HeroPost(), sq.width, sq.height, 'hero.png', fonts);
  await generateImage(StatsPost(), sq.width, sq.height, 'stats.png', fonts);
  await generateImage(HowItWorksPost(), sq.width, sq.height, 'how-it-works.png', fonts);
  await generateImage(ComparisonPost(), sq.width, sq.height, 'comparison.png', fonts);
  await generateImage(FeatureGridPost(), sq.width, sq.height, 'features.png', fonts);
  await generateImage(WhatIsEsimPost(), sq.width, sq.height, 'what-is-esim.png', fonts);
  await generateImage(PhoneCompatibilityPost(), sq.width, sq.height, 'phone-compatibility.png', fonts);
  await generateImage(SavingsPost({ amount: '247' }), sq.width, sq.height, 'savings.png', fonts);

  // Promo
  await generateImage(PromoPost({ discount: '20%', code: 'welcome20' }), sq.width, sq.height, 'promo.png', fonts);

  // Testimonials
  const testimonials = [
    { quote: 'Saved me $300 on my Japan trip. Setup took 30 seconds. Game changer.', name: 'Sarah M.', location: 'New York' },
    { quote: 'Best travel app discovery of 2024. Works perfectly across Europe.', name: 'James L.', location: 'London' },
    { quote: 'No more hunting for SIM cards at airports. Finally!', name: 'Maria G.', location: 'Sydney' },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await generateImage(TestimonialPost(testimonials[i]), sq.width, sq.height, `testimonial-${i + 1}.png`, fonts);
  }

  // WOW FACTOR DESIGNS
  console.log('\n   WOW Factor Designs (1080x1080)');

  // Bold Typography
  await generateImage(BoldTypoPost({ stat: '90%', label: 'cheaper than roaming' }), sq.width, sq.height, 'bold-90-percent.png', fonts);
  await generateImage(BoldTypoPost({ stat: '150+', label: 'countries covered' }), sq.width, sq.height, 'bold-150-countries.png', fonts);
  await generateImage(BoldTypoPost({ stat: '30s', label: 'to activate' }), sq.width, sq.height, 'bold-30-seconds.png', fonts);

  // Color Blocks
  await generateImage(ColorBlockPost({
    leftText: 'Roaming\nFees',
    rightText: 'Travel\nData',
    leftBg: colors.lightGray,
    rightBg: colors.primary
  }), sq.width, sq.height, 'color-block-fees.png', fonts);

  // Minimal Quote
  await generateImage(MinimalQuotePost({
    quote: 'This app saved my entire trip. No more panicking at airports.',
    author: 'Alex T. - Digital Nomad'
  }), sq.width, sq.height, 'quote-minimal.png', fonts);

  // Urgent Promo
  await generateImage(UrgentPromoPost(), sq.width, sq.height, 'flash-sale.png', fonts);

  // Data Viz
  await generateImage(DataVizPost(), sq.width, sq.height, 'data-viz-2024.png', fonts);

  // Before/After
  await generateImage(BeforeAfterPost(), sq.width, sq.height, 'before-after.png', fonts);

  // Tips Carousel
  await generateImage(TipsPost({
    tipNumber: 1,
    tip: 'Download before you fly',
    description: 'Set up your eSIM at home, not at the airport. Save time and stress.'
  }), sq.width, sq.height, 'tip-1.png', fonts);
  await generateImage(TipsPost({
    tipNumber: 2,
    tip: 'Keep your phone number',
    description: 'eSIM runs as a second line. Your main number stays active.'
  }), sq.width, sq.height, 'tip-2.png', fonts);
  await generateImage(TipsPost({
    tipNumber: 3,
    tip: 'Top up on the go',
    description: 'Running low? Buy more data instantly from the app.'
  }), sq.width, sq.height, 'tip-3.png', fonts);

  // FAQs
  await generateImage(FAQPost({
    question: 'Will my phone number still work?',
    answer: 'Yes! Your eSIM runs as a second line for data only. Your main number stays fully active for calls and texts.'
  }), sq.width, sq.height, 'faq-phone-number.png', fonts);
  await generateImage(FAQPost({
    question: 'How fast is activation?',
    answer: 'Just scan the QR code and you are connected. Most users are online within 30 seconds of scanning.'
  }), sq.width, sq.height, 'faq-activation.png', fonts);

  // Social Proof
  await generateImage(SocialProofPost(), sq.width, sq.height, 'social-proof.png', fonts);

  // Countdown
  await generateImage(CountdownPost({
    hours: '23',
    minutes: '59',
    offer: 'Get 30% off your first eSIM'
  }), sq.width, sq.height, 'countdown-offer.png', fonts);

  // Checklist
  await generateImage(ChecklistPost({
    title: 'Travel data checklist',
    items: ['Download Lumbus app', 'Pick your destination', 'Purchase eSIM', 'Scan QR code', 'You are connected!']
  }), sq.width, sq.height, 'checklist.png', fonts);

  // Gradient Hero
  await generateImage(GradientHeroPost({
    line1: 'Data that',
    line2: 'travels with you.'
  }), sq.width, sq.height, 'gradient-hero.png', fonts);
  await generateImage(GradientHeroPost({
    line1: 'No SIM swap.',
    line2: 'No roaming fees.'
  }), sq.width, sq.height, 'gradient-hero-2.png', fonts);

  // Country Cards
  console.log('\n   Country Cards (1080x1080)');
  const countries = [
    { country: 'Japan', flag: '🇯🇵', price: '$4.99' },
    { country: 'Thailand', flag: '🇹🇭', price: '$2.99' },
    { country: 'France', flag: '🇫🇷', price: '$4.99' },
    { country: 'Italy', flag: '🇮🇹', price: '$4.99' },
    { country: 'Australia', flag: '🇦🇺', price: '$5.99' },
    { country: 'Germany', flag: '🇩🇪', price: '$4.49' },
    { country: 'Spain', flag: '🇪🇸', price: '$4.49' },
    { country: 'UK', flag: '🇬🇧', price: '$4.49' },
    { country: 'USA', flag: '🇺🇸', price: '$3.99' },
    { country: 'Singapore', flag: '🇸🇬', price: '$3.99' },
    { country: 'South Korea', flag: '🇰🇷', price: '$4.99' },
    { country: 'Indonesia', flag: '🇮🇩', price: '$2.99' },
  ];
  for (const c of countries) {
    await generateImage(CountryCard(c), sq.width, sq.height, `country-${c.country.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // Regional Bundles
  console.log('\n   Regional Bundles (1080x1080)');
  const bundles = [
    { region: 'Europe', flag: '🇪🇺', countries: 39, price: '$9.99' },
    { region: 'Asia Pacific', flag: '🌏', countries: 28, price: '$8.99' },
    { region: 'Americas', flag: '🌎', countries: 22, price: '$7.99' },
    { region: 'Global', flag: '🌍', countries: 150, price: '$19.99' },
  ];
  for (const b of bundles) {
    await generateImage(RegionalBundlePost(b), sq.width, sq.height, `bundle-${b.region.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // Stories
  console.log('\n   Stories (1080x1920)');
  const st = sizes.story;

  await generateImage(StoryHero({
    headline: 'Travel data without the headache.',
    subheadline: '150+ countries. Instant activation.'
  }), st.width, st.height, 'story-hero.png', fonts);

  await generateImage(StoryHero({
    headline: 'Save 90% on roaming fees.',
    subheadline: 'Plans starting at $4.99'
  }), st.width, st.height, 'story-savings.png', fonts);

  // Country stories
  for (const c of countries.slice(0, 6)) {
    await generateImage(StoryCountry(c), st.width, st.height, `story-${c.country.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // Bold stat stories
  await generateImage(StoryBoldStat({ stat: '90%', label: 'cheaper than roaming' }), st.width, st.height, 'story-90-percent.png', fonts);
  await generateImage(StoryBoldStat({ stat: '30s', label: 'to activate' }), st.width, st.height, 'story-30-seconds.png', fonts);

  // How-to story
  await generateImage(StorySteps(), st.width, st.height, 'story-steps.png', fonts);

  // Promo stories
  await generateImage(StoryPromo({ discount: '20%', code: 'WELCOME20' }), st.width, st.height, 'story-promo-20.png', fonts);
  await generateImage(StoryPromo({ discount: '50%', code: 'FLASH50' }), st.width, st.height, 'story-promo-50.png', fonts);

  // Features story
  await generateImage(StoryFeatures(), st.width, st.height, 'story-features.png', fonts);

  // Before/After story
  await generateImage(StoryBeforeAfter(), st.width, st.height, 'story-before-after.png', fonts);

  console.log('\n  ========================================');
  console.log('  Premium designs generated!');
  console.log('  Output: marketing/v2/output/');
  console.log('  ========================================\n');
}

main().catch(console.error);
