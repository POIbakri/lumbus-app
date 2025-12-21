/**
 * Lumbus Marketing Asset Generator
 * High-quality assets with real logo and professional design
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { colors, dimensions } from './design-system.mjs';
import mockData from './mock-data.mjs';
import * as Icons from './icons.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

// Logo as base64 data URI (loaded at startup)
let LOGO_DATA_URI = '';

// ============================================
// FONT & ASSET LOADING
// ============================================

async function loadLogo() {
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
  const logoBuffer = await fs.readFile(logoPath);
  LOGO_DATA_URI = `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

async function loadFonts() {
  try {
    const interBold = await fs.readFile(path.join(__dirname, '..', 'assets', 'Inter-Bold.otf'));
    const interMedium = await fs.readFile(path.join(__dirname, '..', 'assets', 'Inter-Medium.otf'));
    const interBlack = await fs.readFile(path.join(__dirname, '..', 'assets', 'Inter-Black.otf'));
    return [
      { name: 'Inter', data: interBlack, weight: 900, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
    ];
  } catch (e) {
    console.log('   Fonts not found. Downloading...');
    await downloadFonts();
    return loadFonts();
  }
}

async function downloadFonts() {
  const fontUrls = {
    'Inter-Black.otf': 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
    'Inter-Bold.otf': 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    'Inter-Medium.otf': 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
  };
  const assetsDir = path.join(__dirname, '..', 'assets');
  await fs.mkdir(assetsDir, { recursive: true });
  for (const [filename, url] of Object.entries(fontUrls)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${filename}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(path.join(assetsDir, filename), Buffer.from(buffer));
  }
  console.log('   Fonts downloaded');
}

async function svgToPng(svg, width, height) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

async function generateImage(element, width, height, filename, fonts) {
  console.log(`   ${filename}`);
  const svg = await satori(element, { width, height, fonts });
  const png = await svgToPng(svg, width, height);
  await fs.writeFile(path.join(OUTPUT_DIR, filename), png);
}

// ============================================
// HELPER COMPONENTS
// ============================================

const h = (type, style, children) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children }
});

const text = (content, style) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: content }
});

// Real Logo Component
function Logo({ size = 48, withText = true, dark = false }) {
  return h('div', {
    alignItems: 'center',
    gap: size * 0.25,
  }, [
    {
      type: 'img',
      props: {
        src: LOGO_DATA_URI,
        width: size,
        height: size,
        style: { display: 'flex' },
      },
    },
    withText && text('LUMBUS', {
      fontSize: size * 0.55,
      fontWeight: 900,
      color: dark ? colors.foreground : colors.background,
      letterSpacing: 1,
    }),
  ].filter(Boolean));
}

// Website Footer
function WebsiteFooter({ dark = false, size = 'md' }) {
  const sizes = { sm: 14, md: 18, lg: 22 };
  return h('div', {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 24,
  }, [
    Icons.GlobeIcon({ size: sizes[size], color: dark ? colors.foreground : 'rgba(255,255,255,0.8)' }),
    text('getlumbus.com', {
      fontSize: sizes[size],
      fontWeight: 600,
      color: dark ? colors.foreground : 'rgba(255,255,255,0.8)',
      letterSpacing: 0.5,
    }),
  ]);
}

// CTA Button
function CTAButton({ label, dark = false, size = 'md' }) {
  const sizes = {
    sm: { padding: '14px 28px', fontSize: 15 },
    md: { padding: '18px 42px', fontSize: 18 },
    lg: { padding: '24px 56px', fontSize: 22 },
  };
  const s = sizes[size];
  return h('div', {
    padding: s.padding,
    backgroundColor: dark ? colors.foreground : colors.primary,
    borderRadius: 999,
    border: `3px solid ${colors.foreground}`,
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  }, text(label, {
    fontSize: s.fontSize,
    fontWeight: 700,
    color: dark ? colors.primary : colors.foreground,
    letterSpacing: 0.5,
  }));
}

// iPhone Frame
function PhoneFrame({ children, scale = 1, shadow = true }) {
  const w = 340 * scale;
  const h_val = 700 * scale;
  const br = 50 * scale;
  const bezel = 10 * scale;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        position: 'relative',
        width: w,
        height: h_val,
        backgroundColor: '#1A1A1A',
        borderRadius: br,
        padding: bezel,
        boxShadow: shadow ? '0 40px 80px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)' : 'none',
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: colors.background,
            borderRadius: br - bezel,
            overflow: 'hidden',
          },
          children,
        },
      },
    },
  };
}

// App Header
function AppHeader({ title, subtitle, bgColor = colors.primary, small = false }) {
  return h('div', {
    flexDirection: 'column',
    padding: small ? '40px 20px 24px' : '50px 24px 28px',
    backgroundColor: bgColor,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  }, [
    h('div', { alignItems: 'center', gap: 10 }, [
      h('div', {
        width: 4,
        height: small ? 28 : 32,
        backgroundColor: colors.foreground,
        borderRadius: 2,
      }),
      text(title, {
        fontSize: small ? 24 : 28,
        fontWeight: 900,
        color: colors.foreground,
        letterSpacing: 1,
      }),
    ]),
    subtitle && text(subtitle, {
      fontSize: small ? 13 : 15,
      fontWeight: 600,
      color: colors.foreground,
      marginTop: 6,
      opacity: 0.8,
    }),
  ].filter(Boolean));
}

// Region Card
function RegionCard({ region, bgColor, size = 'md' }) {
  const sizes = {
    sm: { padding: 12, gap: 8, flagSize: 36, name: 14, badge: 10, btn: 10 },
    md: { padding: 16, gap: 10, flagSize: 44, name: 17, badge: 11, btn: 11 },
  };
  const s = sizes[size];

  return h('div', {
    flexDirection: 'column',
    padding: s.padding,
    backgroundColor: bgColor,
    borderRadius: 18,
    border: `2px solid ${colors.border}`,
    gap: s.gap,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }, [
    h('div', { justifyContent: 'space-between', alignItems: 'center' }, [
      h('div', { alignItems: 'center', gap: 10 }, [
        Icons.getFlag(region.name, s.flagSize),
        text(region.name, { fontSize: s.name, fontWeight: 700, color: colors.foreground }),
      ]),
      text(`${region.plans} plans`, {
        fontSize: s.badge,
        fontWeight: 600,
        color: colors.foreground,
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '4px 10px',
        borderRadius: 10,
      }),
    ]),
    h('div', { justifyContent: 'space-between', alignItems: 'center' }, [
      text(`From ${region.startingPrice}`, { fontSize: s.badge + 1, color: colors.mutedText, fontWeight: 500 }),
      text('VIEW PLANS', {
        fontSize: s.btn,
        fontWeight: 700,
        color: colors.foreground,
        backgroundColor: colors.background,
        padding: '6px 14px',
        borderRadius: 16,
        border: `2px solid ${colors.foreground}`,
      }),
    ]),
  ]);
}

// eSIM Card
function EsimCard({ esim, size = 'md' }) {
  const progressColor = esim.percentUsed > 70 ? (esim.percentUsed > 90 ? colors.destructive : colors.secondary) : colors.primary;
  const sizes = {
    sm: { padding: 14, flagSize: 32, region: 18, data: 22, small: 11 },
    md: { padding: 18, flagSize: 40, region: 20, data: 26, small: 12 },
  };
  const s = sizes[size];

  return h('div', {
    flexDirection: 'column',
    padding: s.padding,
    backgroundColor: colors.background,
    borderRadius: 18,
    border: `2px solid ${colors.primary}`,
    gap: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }, [
    h('div', { justifyContent: 'space-between', alignItems: 'flex-start' }, [
      h('div', { flexDirection: 'column', gap: 3 }, [
        h('div', { alignItems: 'center', gap: 8 }, [
          Icons.getFlag(esim.region, s.flagSize),
          text(esim.region, { fontSize: s.region, fontWeight: 700, color: colors.foreground }),
        ]),
        text(`Valid until ${esim.validUntil}`, { fontSize: s.small, color: colors.mutedText }),
      ]),
      h('div', {
        width: 55,
        height: 55,
        borderRadius: 28,
        border: `5px solid ${colors.border}`,
        borderTopColor: progressColor,
        alignItems: 'center',
        justifyContent: 'center',
      }, Icons.getFlag(esim.region, 24)),
    ]),
    h('div', { alignItems: 'baseline', gap: 5 }, [
      text(esim.dataRemaining, { fontSize: s.data, fontWeight: 900, color: colors.foreground }),
      text(`/ ${esim.dataTotal}`, { fontSize: s.small, color: colors.mutedText }),
    ]),
    h('div', {
      width: '100%',
      height: 6,
      backgroundColor: colors.muted,
      borderRadius: 3,
    }, h('div', {
      width: `${100 - esim.percentUsed}%`,
      height: '100%',
      backgroundColor: progressColor,
      borderRadius: 3,
    })),
  ]);
}

// ============================================
// SCREEN MOCKUPS
// ============================================

function BrowseScreen({ scale = 1 }) {
  const regions = mockData.regions.slice(0, 4);
  return PhoneFrame({
    scale,
    children: [
      AppHeader({ title: 'BROWSE', subtitle: 'Choose your destination', small: scale < 1 }),
      h('div', {
        flexDirection: 'column',
        padding: 14 * scale,
        gap: 10 * scale,
        flex: 1,
      }, regions.map((r, i) => RegionCard({
        region: r,
        bgColor: colors.cardColors[i % colors.cardColors.length],
        size: scale < 1 ? 'sm' : 'md',
      }))),
    ],
  });
}

function DashboardScreen({ scale = 1 }) {
  return PhoneFrame({
    scale,
    children: [
      AppHeader({ title: 'MY eSIMs', small: scale < 1 }),
      h('div', {
        margin: `${-12 * scale}px ${14 * scale}px 0`,
        backgroundColor: 'rgba(26,26,26,0.1)',
        borderRadius: 16,
        padding: 3,
      }, [
        h('div', {
          flex: 1,
          padding: `${10 * scale}px 0`,
          backgroundColor: colors.foreground,
          borderRadius: 13,
          justifyContent: 'center',
        }, text('ACTIVE', { fontSize: 11 * scale, fontWeight: 700, color: colors.primary })),
        h('div', {
          flex: 1,
          padding: `${10 * scale}px 0`,
          justifyContent: 'center',
        }, text('EXPIRED', { fontSize: 11 * scale, fontWeight: 700, color: colors.foreground })),
      ]),
      h('div', {
        flexDirection: 'column',
        padding: 14 * scale,
        gap: 10 * scale,
        flex: 1,
      }, mockData.activeEsims.slice(0, 2).map(e => EsimCard({ esim: e, size: scale < 1 ? 'sm' : 'md' }))),
    ],
  });
}

// ============================================
// MARKETING TEMPLATES
// ============================================

// Feature Grid Post - Dark theme with vibrant cards
function FeatureGridPost() {
  const features = [
    { icon: Icons.GlobeIcon({ size: 48, color: colors.foreground }), title: '150+ Countries', desc: 'Global coverage', color: colors.primary },
    { icon: Icons.LightningIcon({ size: 48, color: colors.foreground }), title: 'Instant Setup', desc: '2-minute activation', color: colors.secondary },
    { icon: Icons.WalletIcon({ size: 48, color: colors.foreground }), title: 'Save 90%', desc: 'vs roaming fees', color: colors.accent },
    { icon: Icons.PhoneIcon({ size: 48, color: colors.foreground }), title: 'Keep Your Number', desc: 'Dual SIM ready', color: colors.purple },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 40,
  }, [
    Logo({ size: 44, withText: true, dark: false }),
    h('div', { flexDirection: 'column', marginTop: 24, marginBottom: 20 }, [
      text('Why Travelers', { fontSize: 40, fontWeight: 900, color: colors.background }),
      text('Love Lumbus', { fontSize: 40, fontWeight: 900, color: colors.primary }),
    ]),
    h('div', {
      flexWrap: 'wrap',
      gap: 14,
      flex: 1,
    }, features.map(f =>
      h('div', {
        width: '48%',
        padding: 20,
        backgroundColor: f.color,
        borderRadius: 20,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }, [
        f.icon,
        text(f.title, { fontSize: 17, fontWeight: 700, color: colors.foreground, textAlign: 'center' }),
        text(f.desc, { fontSize: 12, fontWeight: 500, color: colors.foreground, opacity: 0.8 }),
      ])
    )),
    WebsiteFooter({ dark: false }),
  ]);
}

// Stats Social Proof Post - Gradient with clean cards
function StatsSocialProofPost() {
  const stats = [
    { value: '150+', label: 'Countries Covered', icon: Icons.GlobeIcon({ size: 26, color: colors.primary }) },
    { value: '4.8', label: 'App Store Rating', icon: Icons.StarIcon({ size: 26, color: colors.primary }) },
    { value: '100K+', label: 'Happy Travelers', icon: Icons.UsersIcon({ size: 26, color: colors.primary }) },
    { value: '90%', label: 'Average Savings', icon: Icons.WalletIcon({ size: 26, color: colors.primary }) },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 40,
  }, [
    Logo({ size: 44, withText: true, dark: true }),
    h('div', { flexDirection: 'column', marginTop: 24, marginBottom: 20, alignItems: 'center' }, [
      text('The Numbers', { fontSize: 44, fontWeight: 900, color: colors.foreground }),
      text("Speak For Themselves", { fontSize: 28, fontWeight: 700, color: colors.foreground, opacity: 0.9 }),
    ]),
    h('div', {
      flexDirection: 'column',
      gap: 12,
      flex: 1,
    }, stats.map(s =>
      h('div', {
        padding: '14px 20px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }, [
        s.icon,
        h('div', { flexDirection: 'column', flex: 1 }, [
          text(s.value, { fontSize: 28, fontWeight: 900, color: colors.foreground }),
          text(s.label, { fontSize: 12, color: colors.mutedText, fontWeight: 500 }),
        ]),
      ])
    )),
    WebsiteFooter({ dark: true }),
  ]);
}

// Roaming Comparison Post - Clean split design
function RoamingComparisonPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 36,
  }, [
    Logo({ size: 40, withText: true, dark: true }),
    h('div', { flexDirection: 'column', marginTop: 20, marginBottom: 16 }, [
      text('STOP PAYING', { fontSize: 38, fontWeight: 900, color: colors.destructive }),
      text('ROAMING FEES', { fontSize: 38, fontWeight: 900, color: colors.foreground }),
    ]),
    h('div', { gap: 12, flex: 1 }, [
      h('div', {
        flex: 1,
        flexDirection: 'column',
        padding: 18,
        backgroundColor: '#FEE2E2',
        borderRadius: 20,
        border: `3px solid ${colors.destructive}`,
      }, [
        h('div', { alignItems: 'center', gap: 6, marginBottom: 10 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('OLD WAY', { fontSize: 14, fontWeight: 700, color: colors.destructive }),
        ]),
        text('$15/MB', { fontSize: 34, fontWeight: 900, color: colors.foreground, marginBottom: 8 }),
        ...[
          'Carrier roaming',
          'Bill shock',
          'No control',
        ].map(t => text(t, { fontSize: 13, color: colors.mutedText, marginBottom: 3 })),
      ]),
      h('div', {
        flex: 1,
        flexDirection: 'column',
        padding: 18,
        backgroundColor: colors.mint,
        borderRadius: 20,
        border: `3px solid ${colors.primary}`,
      }, [
        h('div', { alignItems: 'center', gap: 6, marginBottom: 10 }, [
          Icons.CheckIcon({ size: 20, color: '#059669' }),
          text('LUMBUS', { fontSize: 14, fontWeight: 700, color: '#059669' }),
        ]),
        text('$0.50/GB', { fontSize: 34, fontWeight: 900, color: colors.foreground, marginBottom: 8 }),
        ...[
          'Flat rates',
          'No surprises',
          'Full control',
        ].map(t => text(t, { fontSize: 13, color: colors.mutedText, marginBottom: 3 })),
      ]),
    ]),
    h('div', {
      marginTop: 16,
      padding: '14px 24px',
      backgroundColor: colors.secondary,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }, [
      Icons.WalletIcon({ size: 24, color: colors.foreground }),
      text('Save up to 90% on data abroad', { fontSize: 16, fontWeight: 700, color: colors.foreground }),
    ]),
    WebsiteFooter({ dark: true }),
  ]);
}

// How It Works Post - Clean step-by-step
function HowItWorksPost() {
  const steps = [
    { num: '1', title: 'Download Lumbus', desc: 'Free on iOS & Android', icon: Icons.DownloadIcon({ size: 26, color: colors.foreground }) },
    { num: '2', title: 'Choose Your Plan', desc: 'Pick destination & data', icon: Icons.MapIcon({ size: 26, color: colors.foreground }) },
    { num: '3', title: 'Scan & Activate', desc: 'QR code installation', icon: Icons.QRCodeIcon({ size: 26, color: colors.foreground }) },
    { num: '4', title: 'Stay Connected', desc: 'Enjoy instant data!', icon: Icons.CelebrationIcon({ size: 26, color: colors.foreground }) },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 50,
  }, [
    Logo({ size: 48, withText: true, dark: true }),
    text('How It Works', {
      fontSize: 44,
      fontWeight: 900,
      color: colors.foreground,
      marginTop: 28,
      marginBottom: 28,
    }),
    h('div', {
      flexDirection: 'column',
      gap: 12,
      flex: 1,
    }, steps.map((s, i) =>
      h('div', {
        padding: 18,
        backgroundColor: colors.cardColors[i % colors.cardColors.length],
        borderRadius: 20,
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }, [
        h('div', {
          width: 42,
          height: 42,
          backgroundColor: colors.foreground,
          borderRadius: 21,
          alignItems: 'center',
          justifyContent: 'center',
        }, text(s.num, { fontSize: 18, fontWeight: 900, color: colors.background })),
        s.icon,
        h('div', { flexDirection: 'column', flex: 1 }, [
          text(s.title, { fontSize: 17, fontWeight: 700, color: colors.foreground }),
          text(s.desc, { fontSize: 12, color: colors.mutedText }),
        ]),
      ])
    )),
    WebsiteFooter({ dark: true }),
  ]);
}

// Destination Spotlight Post - Large flag focus
function DestinationSpotlightPost({ region, bgColor }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
    padding: 50,
    alignItems: 'center',
  }, [
    Logo({ size: 48, withText: true, dark: true }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', { marginBottom: 28 }, Icons.getFlag(region.name, 130)),
      text(region.name.toUpperCase(), {
        fontSize: 52,
        fontWeight: 900,
        color: colors.foreground,
        marginBottom: 14,
        letterSpacing: 2,
      }),
      h('div', {
        padding: '12px 24px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 999,
        marginBottom: 18,
      }, text(`${region.plans} Data Plans Available`, {
        fontSize: 16,
        fontWeight: 700,
        color: colors.foreground,
      })),
      h('div', { flexDirection: 'column', alignItems: 'center', marginBottom: 28 }, [
        text('Starting from', { fontSize: 18, fontWeight: 500, color: colors.foreground, opacity: 0.7 }),
        text(region.startingPrice, { fontSize: 60, fontWeight: 900, color: colors.foreground }),
      ]),
      CTAButton({ label: 'GET THIS PLAN', dark: true, size: 'md' }),
    ]),
    WebsiteFooter({ dark: true }),
  ]);
}

// Story Template - Dark with phone mockup
function StoryTemplate({ headline, subheadline, phone }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.foreground} 0%, #2A2A2A 100%)`,
    padding: 44,
    alignItems: 'center',
  }, [
    Logo({ size: 44, withText: true, dark: false }),
    text(headline, {
      fontSize: 42,
      fontWeight: 900,
      color: colors.background,
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 1.15,
    }),
    subheadline && text(subheadline, {
      fontSize: 18,
      fontWeight: 500,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 10,
    }),
    h('div', {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20,
    }, phone),
    h('div', { gap: 14, marginBottom: 24 }, [
      { label: 'Countries', value: '150+' },
      { label: 'Rating', value: '4.8' },
      { label: 'Savings', value: '90%' },
    ].map(s =>
      h('div', {
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
      }, [
        text(s.value, { fontSize: 22, fontWeight: 900, color: colors.primary }),
        text(s.label, { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }),
      ])
    )),
    CTAButton({ label: 'GET YOUR eSIM', dark: false, size: 'sm' }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Promo Post - Bold promotional design
function PromoPost({ discount, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
    padding: 50,
    alignItems: 'center',
  }, [
    Logo({ size: 52, withText: true, dark: true }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', { marginBottom: 20 }, Icons.TagIcon({ size: 64, color: colors.foreground })),
      text('LIMITED TIME', {
        fontSize: 18,
        fontWeight: 700,
        color: colors.foreground,
        letterSpacing: 5,
        marginBottom: 8,
      }),
      text(`${discount} OFF`, {
        fontSize: 76,
        fontWeight: 900,
        color: colors.foreground,
        marginBottom: 20,
      }),
      text('Your First eSIM', {
        fontSize: 26,
        fontWeight: 600,
        color: colors.foreground,
        marginBottom: 28,
      }),
      h('div', {
        padding: '14px 32px',
        backgroundColor: colors.background,
        borderRadius: 16,
        border: `3px dashed ${colors.foreground}`,
        marginBottom: 14,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }, [
        text('Use code: ', { fontSize: 16, color: colors.mutedText }),
        text(code, { fontSize: 22, fontWeight: 900, color: colors.foreground }),
      ]),
      text('Valid for new users only', {
        fontSize: 13,
        color: colors.foreground,
        opacity: 0.7,
      }),
    ]),
    CTAButton({ label: 'CLAIM NOW', dark: true, size: 'lg' }),
    WebsiteFooter({ dark: true }),
  ]);
}

// Wanderlust Quote Post - Minimal dark design
function WanderlustQuotePost({ quoteIndex }) {
  const quotes = [
    { text: "The world is a book, and those who do not travel read only one page.", icon: Icons.BookOpenIcon({ size: 64, color: colors.primary }) },
    { text: "Adventure awaits. Stay connected.", icon: Icons.CompassIcon({ size: 64, color: colors.primary }) },
    { text: "Collect moments, not roaming bills.", icon: Icons.CameraIcon({ size: 64, color: colors.primary }) },
    { text: "Wander often. Wonder always. Stay online.", icon: Icons.SparklesIcon({ size: 64, color: colors.primary }) },
  ];
  const q = quotes[quoteIndex % quotes.length];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 55,
    alignItems: 'center',
  }, [
    Logo({ size: 48, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', { marginBottom: 28 }, q.icon),
      text(`"${q.text}"`, {
        fontSize: 36,
        fontWeight: 700,
        color: colors.background,
        textAlign: 'center',
        lineHeight: 1.35,
      }),
    ]),
    WebsiteFooter({ dark: false }),
  ]);
}

// Testimonial Post - Clean review style
function TestimonialPost({ testimonial }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.mint,
    padding: 55,
  }, [
    Logo({ size: 48, withText: true, dark: true }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      h('div', { gap: 6, marginBottom: 22 }, [
        Icons.StarIcon({ size: 30, color: '#F59E0B', filled: true }),
        Icons.StarIcon({ size: 30, color: '#F59E0B', filled: true }),
        Icons.StarIcon({ size: 30, color: '#F59E0B', filled: true }),
        Icons.StarIcon({ size: 30, color: '#F59E0B', filled: true }),
        Icons.StarIcon({ size: 30, color: '#F59E0B', filled: true }),
      ]),
      text(`"${testimonial.text}"`, {
        fontSize: 34,
        fontWeight: 700,
        color: colors.foreground,
        lineHeight: 1.35,
        marginBottom: 28,
      }),
      h('div', { flexDirection: 'column' }, [
        text(`${testimonial.name}`, { fontSize: 20, fontWeight: 700, color: colors.foreground }),
        text(testimonial.location, { fontSize: 16, color: colors.mutedText }),
      ]),
    ]),
    WebsiteFooter({ dark: true }),
  ]);
}

// Airplane Window Post - Travel lifestyle
function AirplaneWindowPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    padding: 44,
    alignItems: 'center',
  }, [
    Logo({ size: 44, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 22,
    }, [
      h('div', {
        width: 280,
        height: 280,
        borderRadius: 140,
        border: '18px solid #333',
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)',
      }, [
        Icons.AirplaneIcon({ size: 42, color: colors.foreground }),
        Icons.getFlag(destination.name, 72),
        text(destination.name, { fontSize: 24, fontWeight: 900, color: colors.foreground }),
      ]),
      text('Stay connected at 35,000 feet', {
        fontSize: 22,
        fontWeight: 700,
        color: colors.background,
        textAlign: 'center',
      }),
      text(`Data plans from ${destination.startingPrice}`, {
        fontSize: 18,
        fontWeight: 500,
        color: colors.primary,
      }),
    ]),
    CTAButton({ label: 'GET YOUR eSIM', dark: false, size: 'md' }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Passport Style Post - Creative travel collection
function PassportStampPost({ destinations }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F0E6',
    padding: 50,
  }, [
    h('div', { justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, [
      Logo({ size: 42, withText: true, dark: true }),
      text('DIGITAL PASSPORT', { fontSize: 14, fontWeight: 700, color: colors.mutedText, letterSpacing: 3 }),
    ]),
    text('Collect Destinations', { fontSize: 40, fontWeight: 900, color: colors.foreground, marginBottom: 6 }),
    text('Not Roaming Bills', { fontSize: 40, fontWeight: 900, color: colors.primary, marginBottom: 32 }),
    h('div', {
      flexWrap: 'wrap',
      gap: 16,
      flex: 1,
      alignContent: 'flex-start',
    }, destinations.slice(0, 6).map((d, i) =>
      h('div', {
        width: 135,
        height: 90,
        borderRadius: 16,
        border: `3px solid ${colors.cardColors[i % colors.cardColors.length]}`,
        backgroundColor: colors.cardColors[i % colors.cardColors.length],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i * 1.5)}deg)`,
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      }, [
        Icons.getFlag(d.name, 38),
        text(d.name.split(' ')[0], { fontSize: 11, fontWeight: 700, color: colors.foreground }),
      ])
    )),
    CTAButton({ label: 'START COLLECTING', dark: true, size: 'md' }),
    WebsiteFooter({ dark: true }),
  ]);
}

// Regional Bundle Post - Multi-country value
function RegionalBundlePost({ region }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.purple,
    padding: 50,
  }, [
    Logo({ size: 48, withText: true, dark: true }),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', { marginBottom: 18 }, Icons.getFlag(region.name, 80)),
      text(region.name.toUpperCase(), {
        fontSize: 38,
        fontWeight: 900,
        color: colors.foreground,
        marginBottom: 6,
        letterSpacing: 2,
      }),
      text(`${region.countries} Countries, 1 eSIM`, {
        fontSize: 20,
        fontWeight: 600,
        color: colors.foreground,
        opacity: 0.85,
        marginBottom: 22,
      }),
      h('div', {
        padding: '18px 36px',
        backgroundColor: colors.foreground,
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: 18,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }, [
        text('Starting from', { fontSize: 13, color: colors.mutedText }),
        text(region.startingPrice, { fontSize: 44, fontWeight: 900, color: colors.primary }),
      ]),
      h('div', { flexDirection: 'column', gap: 10, marginBottom: 22 }, [
        { txt: 'One plan for entire region', icon: Icons.CheckIcon({ size: 18, color: colors.foreground }) },
        { txt: 'Seamless country switching', icon: Icons.CheckIcon({ size: 18, color: colors.foreground }) },
        { txt: 'No extra charges', icon: Icons.CheckIcon({ size: 18, color: colors.foreground }) },
      ].map(b =>
        h('div', { alignItems: 'center', gap: 10 }, [
          b.icon,
          text(b.txt, { fontSize: 15, fontWeight: 600, color: colors.foreground }),
        ])
      )),
    ]),
    CTAButton({ label: 'GET REGIONAL PLAN', dark: true, size: 'md' }),
    WebsiteFooter({ dark: true }),
  ]);
}

// Carousel Benefit Slide
function CarouselBenefitSlide({ benefit, slideNum, totalSlides }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: benefit.color,
    padding: 55,
  }, [
    h('div', { justifyContent: 'space-between', alignItems: 'center' }, [
      Logo({ size: 40, withText: true, dark: true }),
      text(`${slideNum}/${totalSlides}`, { fontSize: 15, fontWeight: 700, color: colors.foreground, opacity: 0.6 }),
    ]),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', { marginBottom: 28 }, benefit.icon),
      text(benefit.title, {
        fontSize: 42,
        fontWeight: 900,
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: 14,
      }),
      text(benefit.description, {
        fontSize: 20,
        fontWeight: 500,
        color: colors.foreground,
        textAlign: 'center',
        opacity: 0.85,
      }),
    ]),
    h('div', { alignItems: 'center', justifyContent: 'center', gap: 8 }, [
      text('Swipe for more', { fontSize: 14, fontWeight: 600, color: colors.foreground, opacity: 0.6 }),
      Icons.AirplaneIcon({ size: 16, color: colors.foreground }),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Simple Feature Highlight - Minimal one-feature focus
function FeatureHighlightPost({ feature }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: feature.bgColor,
    padding: 55,
    alignItems: 'center',
  }, [
    Logo({ size: 48, withText: true, dark: true }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', {
        width: 140,
        height: 140,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }, feature.icon),
      text(feature.title, {
        fontSize: 46,
        fontWeight: 900,
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: 12,
      }),
      text(feature.description, {
        fontSize: 22,
        fontWeight: 500,
        color: colors.foreground,
        textAlign: 'center',
        opacity: 0.85,
        maxWidth: '85%',
      }),
    ]),
    CTAButton({ label: 'LEARN MORE', dark: true, size: 'md' }),
    WebsiteFooter({ dark: true }),
  ]);
}

// ============================================
// CREATIVE FUN MARKETING POSTS
// ============================================

// Boarding Pass Style Post - Travel aesthetic
function BoardingPassPost({ destination }) {
  const flightNum = `LB${Math.floor(Math.random() * 900 + 100)}`;
  const gate = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30 + 1)}`;
  const seat = `${Math.floor(Math.random() * 30 + 1)}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 36,
    alignItems: 'center',
  }, [
    Logo({ size: 40, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }, [
      h('div', {
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }, [
        // Header
        h('div', {
          backgroundColor: colors.primary,
          padding: '16px 24px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }, [
          text('BOARDING PASS', { fontSize: 14, fontWeight: 700, color: colors.foreground, letterSpacing: 3 }),
          Icons.AirplaneIcon({ size: 24, color: colors.foreground }),
        ]),
        // Main content
        h('div', {
          padding: 24,
          flexDirection: 'column',
          gap: 20,
        }, [
          // Route
          h('div', { alignItems: 'center', justifyContent: 'space-between' }, [
            h('div', { flexDirection: 'column', alignItems: 'center' }, [
              text('HOME', { fontSize: 12, color: colors.mutedText, fontWeight: 600 }),
              text('YOUR', { fontSize: 32, fontWeight: 900, color: colors.foreground }),
              text('CITY', { fontSize: 12, color: colors.mutedText }),
            ]),
            h('div', { flexDirection: 'column', alignItems: 'center', gap: 4 }, [
              Icons.AirplaneIcon({ size: 28, color: colors.primary }),
              h('div', { width: 100, height: 2, backgroundColor: colors.primary }),
              text('DIRECT', { fontSize: 10, color: colors.primary, fontWeight: 600 }),
            ]),
            h('div', { flexDirection: 'column', alignItems: 'center' }, [
              text('DESTINATION', { fontSize: 12, color: colors.mutedText, fontWeight: 600 }),
              Icons.getFlag(destination.name, 44),
              text(destination.name.slice(0, 10).toUpperCase(), { fontSize: 12, color: colors.mutedText }),
            ]),
          ]),
          // Divider
          h('div', { width: '100%', height: 2, backgroundColor: colors.border, borderStyle: 'dashed' }),
          // Details grid
          h('div', { justifyContent: 'space-between' }, [
            h('div', { flexDirection: 'column', gap: 2 }, [
              text('FLIGHT', { fontSize: 10, color: colors.mutedText }),
              text(flightNum, { fontSize: 18, fontWeight: 700, color: colors.foreground }),
            ]),
            h('div', { flexDirection: 'column', gap: 2 }, [
              text('GATE', { fontSize: 10, color: colors.mutedText }),
              text(gate, { fontSize: 18, fontWeight: 700, color: colors.foreground }),
            ]),
            h('div', { flexDirection: 'column', gap: 2 }, [
              text('SEAT', { fontSize: 10, color: colors.mutedText }),
              text(seat, { fontSize: 18, fontWeight: 700, color: colors.foreground }),
            ]),
            h('div', { flexDirection: 'column', gap: 2 }, [
              text('DATA', { fontSize: 10, color: colors.mutedText }),
              text('READY', { fontSize: 18, fontWeight: 700, color: colors.primary }),
            ]),
          ]),
        ]),
        // Footer
        h('div', {
          backgroundColor: colors.secondary,
          padding: '14px 24px',
          alignItems: 'center',
          justifyContent: 'center',
        }, [
          text(`Plans from ${destination.startingPrice}`, { fontSize: 16, fontWeight: 700, color: colors.foreground }),
        ]),
      ]),
    ]),
    text('Your data is ready before you land', { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 20 }),
    WebsiteFooter({ dark: false }),
  ]);
}

// Travel Bucket List Post - Checklist style
function BucketListPost() {
  const items = [
    { text: 'Book flights', done: true },
    { text: 'Reserve hotels', done: true },
    { text: 'Pack bags', done: true },
    { text: 'Get travel eSIM', done: true, highlight: true },
    { text: 'Buy airport SIM', done: false, strike: true },
    { text: 'Pay roaming fees', done: false, strike: true },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 36,
  }, [
    Logo({ size: 40, withText: true, dark: true }),
    h('div', { flexDirection: 'column', marginTop: 20, marginBottom: 20 }, [
      text('Travel Checklist', { fontSize: 42, fontWeight: 900, color: colors.foreground }),
      text('2024 Edition', { fontSize: 18, fontWeight: 600, color: colors.primary }),
    ]),
    h('div', {
      flexDirection: 'column',
      gap: 12,
      flex: 1,
    }, items.map(item =>
      h('div', {
        padding: 16,
        backgroundColor: item.highlight ? colors.primary : (item.strike ? '#FEE2E2' : colors.muted),
        borderRadius: 16,
        alignItems: 'center',
        gap: 14,
        border: item.highlight ? `3px solid ${colors.foreground}` : 'none',
      }, [
        h('div', {
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: item.done ? colors.foreground : 'transparent',
          border: item.done ? 'none' : `2px solid ${colors.mutedText}`,
          alignItems: 'center',
          justifyContent: 'center',
        }, item.done && Icons.CheckIcon({ size: 16, color: item.highlight ? colors.primary : colors.background })),
        text(item.text, {
          fontSize: 18,
          fontWeight: 600,
          color: item.strike ? colors.mutedText : colors.foreground,
          textDecoration: item.strike ? 'line-through' : 'none',
          flex: 1,
        }),
        item.highlight && Icons.SparklesIcon({ size: 24, color: colors.foreground }),
      ])
    )),
    WebsiteFooter({ dark: true }),
  ]);
}

// Suitcase Packing Post - Visual packing list
function SuitcasePackingPost() {
  const essentials = [
    { icon: Icons.PhoneIcon({ size: 32, color: colors.foreground }), label: 'Phone', color: colors.primary },
    { icon: Icons.MapIcon({ size: 32, color: colors.foreground }), label: 'Passport', color: colors.secondary },
    { icon: Icons.CameraIcon({ size: 32, color: colors.foreground }), label: 'Camera', color: colors.accent },
    { icon: Icons.WalletIcon({ size: 32, color: colors.foreground }), label: 'Wallet', color: colors.purple },
    { icon: Icons.GlobeIcon({ size: 32, color: colors.foreground }), label: 'eSIM', color: colors.mint, special: true },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 36,
    alignItems: 'center',
  }, [
    Logo({ size: 40, withText: true, dark: false }),
    text('Pack Smart', { fontSize: 44, fontWeight: 900, color: colors.background, marginTop: 20 }),
    text('Travel Smarter', { fontSize: 44, fontWeight: 900, color: colors.primary, marginBottom: 24 }),
    h('div', {
      flex: 1,
      width: '100%',
      backgroundColor: '#333',
      borderRadius: 24,
      padding: 24,
      flexDirection: 'column',
      alignItems: 'center',
      border: '4px solid #444',
    }, [
      text('TRAVEL ESSENTIALS', { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 20 }),
      h('div', {
        flexWrap: 'wrap',
        gap: 14,
        justifyContent: 'center',
      }, essentials.map(item =>
        h('div', {
          width: 140,
          height: 100,
          backgroundColor: item.color,
          borderRadius: 16,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: item.special ? '0 0 20px rgba(46,254,204,0.5)' : 'none',
          border: item.special ? '3px solid #fff' : 'none',
        }, [
          item.icon,
          text(item.label, { fontSize: 14, fontWeight: 600, color: colors.foreground }),
          item.special && h('div', {
            padding: '4px 10px',
            backgroundColor: colors.foreground,
            borderRadius: 8,
          }, text('NEW', { fontSize: 10, fontWeight: 700, color: colors.primary })),
        ])
      )),
    ]),
    text('The one thing you can\'t forget', { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 20 }),
    WebsiteFooter({ dark: false }),
  ]);
}

// World Map Pins Post - Global coverage visualization
function WorldMapPinsPost() {
  const pins = [
    { x: 25, y: 30, flag: 'United States' },
    { x: 48, y: 25, flag: 'United Kingdom' },
    { x: 52, y: 28, flag: 'France' },
    { x: 55, y: 26, flag: 'Germany' },
    { x: 75, y: 35, flag: 'Japan' },
    { x: 70, y: 45, flag: 'Thailand' },
    { x: 82, y: 60, flag: 'Australia' },
    { x: 73, y: 50, flag: 'Singapore' },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
    padding: 36,
    alignItems: 'center',
  }, [
    Logo({ size: 40, withText: true, dark: true }),
    text('150+ Countries', { fontSize: 48, fontWeight: 900, color: colors.foreground, marginTop: 20 }),
    text('One eSIM', { fontSize: 48, fontWeight: 900, color: colors.foreground }),
    h('div', {
      flex: 1,
      width: '100%',
      position: 'relative',
      marginTop: 24,
      marginBottom: 24,
    }, [
      // Simplified world map representation
      h('div', {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        position: 'relative',
      }, pins.map(pin =>
        h('div', {
          position: 'absolute',
          left: `${pin.x}%`,
          top: `${pin.y}%`,
          transform: 'translate(-50%, -50%)',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }, [
          Icons.getFlag(pin.flag, 36),
          h('div', {
            width: 12,
            height: 12,
            backgroundColor: colors.secondary,
            borderRadius: 6,
            border: '3px solid ' + colors.foreground,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }),
        ])
      )),
    ]),
    h('div', {
      padding: '12px 24px',
      backgroundColor: colors.secondary,
      borderRadius: 16,
    }, text('Connected Everywhere', { fontSize: 18, fontWeight: 700, color: colors.foreground })),
    WebsiteFooter({ dark: true }),
  ]);
}

// Trip Countdown Post - Excitement builder
function TripCountdownPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 36,
    alignItems: 'center',
  }, [
    Logo({ size: 40, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text('TRIP TO', { fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 4 }),
      h('div', { alignItems: 'center', gap: 16, marginTop: 12, marginBottom: 20 }, [
        Icons.getFlag(destination.name, 64),
        text(destination.name.toUpperCase(), { fontSize: 44, fontWeight: 900, color: colors.background }),
      ]),
      h('div', { gap: 16 }, [
        { value: '07', label: 'DAYS' },
        { value: '12', label: 'HRS' },
        { value: '34', label: 'MIN' },
      ].map(t =>
        h('div', {
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 28px',
          backgroundColor: colors.primary,
          borderRadius: 16,
        }, [
          text(t.value, { fontSize: 48, fontWeight: 900, color: colors.foreground }),
          text(t.label, { fontSize: 12, fontWeight: 600, color: colors.foreground, opacity: 0.8 }),
        ])
      )),
      h('div', {
        marginTop: 28,
        padding: '14px 28px',
        backgroundColor: colors.secondary,
        borderRadius: 16,
        alignItems: 'center',
        gap: 10,
      }, [
        Icons.CheckIcon({ size: 20, color: colors.foreground }),
        text('eSIM Ready', { fontSize: 18, fontWeight: 700, color: colors.foreground }),
      ]),
    ]),
    text('Be prepared before takeoff', { fontSize: 16, color: 'rgba(255,255,255,0.7)' }),
    WebsiteFooter({ dark: false }),
  ]);
}

// Before/After Post - Transformation style
function BeforeAfterPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 36,
  }, [
    Logo({ size: 40, withText: true, dark: true }),
    h('div', { flex: 1, gap: 14, marginTop: 20 }, [
      // Before
      h('div', {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FEE2E2',
        borderRadius: 20,
        padding: 20,
        border: `3px solid ${colors.destructive}`,
      }, [
        text('BEFORE', { fontSize: 14, fontWeight: 700, color: colors.destructive, letterSpacing: 2, marginBottom: 12 }),
        h('div', { flexDirection: 'column', gap: 10, flex: 1 }, [
          { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Hunting for SIMs at airport' },
          { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Waiting in long queues' },
          { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Language barriers' },
          { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Expensive roaming bills' },
          { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'No data on arrival' },
        ].map(item =>
          h('div', { alignItems: 'center', gap: 8 }, [
            item.icon,
            text(item.text, { fontSize: 13, color: colors.foreground, fontWeight: 500 }),
          ])
        )),
      ]),
      // After
      h('div', {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.mint,
        borderRadius: 20,
        padding: 20,
        border: `3px solid ${colors.primary}`,
      }, [
        text('AFTER', { fontSize: 14, fontWeight: 700, color: '#059669', letterSpacing: 2, marginBottom: 12 }),
        h('div', { flexDirection: 'column', gap: 10, flex: 1 }, [
          { icon: Icons.CheckIcon({ size: 18, color: '#059669' }), text: 'Download from home' },
          { icon: Icons.CheckIcon({ size: 18, color: '#059669' }), text: 'Instant activation' },
          { icon: Icons.CheckIcon({ size: 18, color: '#059669' }), text: 'Easy English app' },
          { icon: Icons.CheckIcon({ size: 18, color: '#059669' }), text: 'Flat affordable rates' },
          { icon: Icons.CheckIcon({ size: 18, color: '#059669' }), text: 'Connected on landing' },
        ].map(item =>
          h('div', { alignItems: 'center', gap: 8 }, [
            item.icon,
            text(item.text, { fontSize: 13, color: colors.foreground, fontWeight: 500 }),
          ])
        )),
      ]),
    ]),
    h('div', {
      marginTop: 16,
      padding: '14px 24px',
      backgroundColor: colors.primary,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    }, text('Upgrade Your Travel', { fontSize: 18, fontWeight: 700, color: colors.foreground })),
    WebsiteFooter({ dark: true }),
  ]);
}

// Emoji-free Travel Mood Post - Clean minimal vibe
function TravelMoodPost({ mood }) {
  const moods = {
    adventure: { bg: colors.secondary, title: 'ADVENTURE', subtitle: 'MODE', icon: Icons.CompassIcon({ size: 80, color: colors.foreground }) },
    relax: { bg: colors.accent, title: 'VACATION', subtitle: 'MODE', icon: Icons.SunIcon({ size: 80, color: colors.foreground }) },
    explore: { bg: colors.primary, title: 'EXPLORE', subtitle: 'MODE', icon: Icons.MapIcon({ size: 80, color: colors.foreground }) },
    connect: { bg: colors.purple, title: 'CONNECTED', subtitle: 'MODE', icon: Icons.GlobeIcon({ size: 80, color: colors.foreground }) },
  };
  const m = moods[mood] || moods.adventure;

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: m.bg,
    padding: 36,
    alignItems: 'center',
  }, [
    Logo({ size: 40, withText: true, dark: true }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', {
        width: 160,
        height: 160,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
      }, m.icon),
      text(m.title, { fontSize: 56, fontWeight: 900, color: colors.foreground }),
      text(m.subtitle, { fontSize: 56, fontWeight: 900, color: colors.foreground, opacity: 0.6 }),
      text('Activated', { fontSize: 20, fontWeight: 600, color: colors.foreground, marginTop: 16 }),
    ]),
    WebsiteFooter({ dark: true }),
  ]);
}

// Data Usage Visualization Post - Stats style
function DataVisualizationPost() {
  const activities = [
    { label: 'Maps & Navigation', hours: '50+', color: colors.primary },
    { label: 'Social Media', hours: '100+', color: colors.secondary },
    { label: 'Video Calls', hours: '20+', color: colors.accent },
    { label: 'Photo Uploads', hours: '500+', color: colors.purple },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 36,
  }, [
    Logo({ size: 40, withText: true, dark: false }),
    h('div', { flexDirection: 'column', marginTop: 20, marginBottom: 20 }, [
      text('What Can You Do', { fontSize: 36, fontWeight: 900, color: colors.background }),
      text('With 5GB?', { fontSize: 36, fontWeight: 900, color: colors.primary }),
    ]),
    h('div', {
      flexDirection: 'column',
      gap: 12,
      flex: 1,
    }, activities.map(activity =>
      h('div', {
        padding: 18,
        backgroundColor: activity.color,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }, [
        text(activity.label, { fontSize: 18, fontWeight: 600, color: colors.foreground }),
        h('div', {
          padding: '8px 16px',
          backgroundColor: 'rgba(0,0,0,0.15)',
          borderRadius: 10,
        }, text(`${activity.hours} hrs`, { fontSize: 16, fontWeight: 700, color: colors.foreground })),
      ])
    )),
    h('div', {
      marginTop: 16,
      padding: '14px 24px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    }, text('Plans from just $4.99', { fontSize: 18, fontWeight: 700, color: colors.background })),
    WebsiteFooter({ dark: false }),
  ]);
}

// Photo Dump Style Post - Trendy grid
function PhotoDumpPost() {
  const destinations = ['Japan', 'France', 'Thailand', 'Australia'];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: true }),
    text('Photo Dump', { fontSize: 38, fontWeight: 900, color: colors.foreground, marginTop: 12 }),
    text('But Make It Connected', { fontSize: 18, fontWeight: 600, color: colors.primary, marginBottom: 16 }),
    h('div', {
      flexWrap: 'wrap',
      gap: 8,
      flex: 1,
    }, destinations.map((dest, i) =>
      h('div', {
        width: '48%',
        height: 175,
        backgroundColor: colors.cardColors[i % colors.cardColors.length],
        borderRadius: 14,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }, [
        Icons.getFlag(dest, 52),
        text(dest, { fontSize: 15, fontWeight: 700, color: colors.foreground }),
        h('div', {
          padding: '3px 10px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 6,
        }, [
          Icons.SignalIcon({ size: 12, color: colors.foreground }),
          text(' Connected', { fontSize: 10, fontWeight: 600, color: colors.foreground }),
        ]),
      ])
    )),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// ============================================
// SUPER FUN & TRENDY POSTS
// ============================================

// Flying Plane with Motion Trail
function FlyingPlanePost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)`,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Motion trail lines
    ...[0, 1, 2, 3, 4].map(i => h('div', {
      position: 'absolute',
      left: `${5 + i * 8}%`,
      top: `${30 + i * 5}%`,
      width: `${60 - i * 10}%`,
      height: 3,
      backgroundColor: colors.primary,
      opacity: 0.15 + i * 0.1,
      borderRadius: 2,
      transform: 'rotate(-15deg)',
    })),
    Logo({ size: 36, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }, [
      // Plane with glow
      h('div', {
        position: 'relative',
        marginBottom: 24,
      }, [
        h('div', {
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primary,
          opacity: 0.2,
          filter: 'blur(20px)',
          left: -20,
          top: -20,
        }),
        Icons.AirplaneIcon({ size: 80, color: colors.primary }),
      ]),
      text('TAKING OFF TO', { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 4, marginBottom: 8 }),
      h('div', { alignItems: 'center', gap: 12 }, [
        Icons.getFlag(destination.name, 48),
        text(destination.name.toUpperCase(), { fontSize: 36, fontWeight: 900, color: colors.background }),
      ]),
      text(`Data ready from ${destination.startingPrice}`, { fontSize: 18, fontWeight: 600, color: colors.primary, marginTop: 16 }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// POV Style Post (TikTok trendy)
function POVPost({ scenario }) {
  const scenarios = {
    landing: { title: 'POV: You just landed', subtitle: 'and your data is already working', icon: Icons.AirplaneIcon({ size: 56, color: colors.foreground }) },
    roaming: { title: 'POV: Your friend gets', subtitle: 'a $500 roaming bill', icon: Icons.WalletIcon({ size: 56, color: colors.destructive }) },
    connected: { title: 'POV: You\'re posting', subtitle: 'from the Eiffel Tower', icon: Icons.CameraIcon({ size: 56, color: colors.foreground }) },
    smart: { title: 'POV: You travel smart', subtitle: 'not expensive', icon: Icons.LightningIcon({ size: 56, color: colors.foreground }) },
  };
  const s = scenarios[scenario] || scenarios.landing;

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', {
        width: 120,
        height: 120,
        backgroundColor: colors.primary,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }, s.icon),
      text(s.title, { fontSize: 32, fontWeight: 900, color: colors.background, textAlign: 'center' }),
      text(s.subtitle, { fontSize: 32, fontWeight: 900, color: colors.primary, textAlign: 'center' }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Airport Departure Board Style
function DepartureBoardPost() {
  const flights = [
    { dest: 'TOKYO', code: 'NRT', status: 'DATA READY', color: colors.primary },
    { dest: 'PARIS', code: 'CDG', status: 'DATA READY', color: colors.primary },
    { dest: 'BANGKOK', code: 'BKK', status: 'DATA READY', color: colors.primary },
    { dest: 'SYDNEY', code: 'SYD', status: 'DATA READY', color: colors.primary },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0A0A',
    padding: 28,
  }, [
    h('div', { alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, [
      text('DEPARTURES', { fontSize: 16, fontWeight: 700, color: colors.secondary, letterSpacing: 4 }),
      Logo({ size: 32, withText: false, dark: false }),
    ]),
    h('div', { flexDirection: 'column', gap: 8, flex: 1 }, [
      // Header row
      h('div', { padding: '8px 12px', backgroundColor: '#1A1A1A', borderRadius: 8, gap: 12 }, [
        text('DESTINATION', { fontSize: 11, fontWeight: 700, color: '#666', width: 140 }),
        text('CODE', { fontSize: 11, fontWeight: 700, color: '#666', width: 60 }),
        text('STATUS', { fontSize: 11, fontWeight: 700, color: '#666', flex: 1 }),
      ]),
      ...flights.map(f =>
        h('div', {
          padding: '14px 12px',
          backgroundColor: '#111',
          borderRadius: 10,
          alignItems: 'center',
          gap: 12,
          borderLeft: `4px solid ${f.color}`,
        }, [
          text(f.dest, { fontSize: 18, fontWeight: 900, color: colors.background, width: 140, fontFamily: 'monospace' }),
          text(f.code, { fontSize: 14, fontWeight: 600, color: '#888', width: 60 }),
          h('div', {
            padding: '6px 14px',
            backgroundColor: f.color,
            borderRadius: 6,
          }, text(f.status, { fontSize: 12, fontWeight: 700, color: colors.foreground })),
        ])
      ),
    ]),
    h('div', {
      marginTop: 16,
      padding: 14,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    }, text('150+ destinations available', { fontSize: 16, fontWeight: 700, color: colors.foreground })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Luggage Tag Style
function LuggageTagPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: true }),
    h('div', {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', {
        width: 320,
        backgroundColor: colors.background,
        borderRadius: 20,
        padding: 24,
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
      }, [
        // Hole for string
        h('div', {
          position: 'absolute',
          top: 16,
          right: 16,
          width: 24,
          height: 24,
          borderRadius: 12,
          border: `4px solid ${colors.border}`,
        }),
        text('PRIORITY', { fontSize: 10, fontWeight: 700, color: colors.primary, letterSpacing: 3, marginBottom: 12 }),
        h('div', { alignItems: 'center', gap: 12, marginBottom: 16 }, [
          Icons.getFlag(destination.name, 56),
          h('div', { flexDirection: 'column' }, [
            text(destination.name.toUpperCase(), { fontSize: 28, fontWeight: 900, color: colors.foreground }),
            text(`${destination.plans} plans available`, { fontSize: 12, color: colors.mutedText }),
          ]),
        ]),
        h('div', { width: '100%', height: 2, backgroundColor: colors.border, marginBottom: 16 }),
        h('div', { justifyContent: 'space-between' }, [
          h('div', { flexDirection: 'column' }, [
            text('FROM', { fontSize: 10, color: colors.mutedText }),
            text(destination.startingPrice, { fontSize: 32, fontWeight: 900, color: colors.primary }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            text('STATUS', { fontSize: 10, color: colors.mutedText }),
            text('READY', { fontSize: 18, fontWeight: 700, color: colors.primary }),
          ]),
        ]),
      ]),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Text Message Style Post
function TextMessagePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: true }),
    text('TRAVEL GROUP CHAT', { fontSize: 12, fontWeight: 600, color: colors.mutedText, letterSpacing: 2, marginTop: 12, marginBottom: 16 }),
    h('div', { flexDirection: 'column', gap: 10, flex: 1 }, [
      // Received messages
      h('div', { alignItems: 'flex-start', gap: 8 }, [
        h('div', { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
          text('S', { fontSize: 14, fontWeight: 700, color: colors.foreground })),
        h('div', {
          maxWidth: '75%',
          padding: '12px 16px',
          backgroundColor: colors.muted,
          borderRadius: '18px 18px 18px 4px',
        }, text('omg the roaming bill is gonna kill me', { fontSize: 15, color: colors.foreground })),
      ]),
      h('div', { alignItems: 'flex-start', gap: 8 }, [
        h('div', { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          text('J', { fontSize: 14, fontWeight: 700, color: colors.foreground })),
        h('div', {
          maxWidth: '75%',
          padding: '12px 16px',
          backgroundColor: colors.muted,
          borderRadius: '18px 18px 18px 4px',
        }, text('why didnt you get an esim??', { fontSize: 15, color: colors.foreground })),
      ]),
      // Sent message
      h('div', { alignItems: 'flex-end', justifyContent: 'flex-end', gap: 8 }, [
        h('div', {
          maxWidth: '75%',
          padding: '12px 16px',
          backgroundColor: colors.primary,
          borderRadius: '18px 18px 4px 18px',
        }, text('i got lumbus, $5 for the whole trip', { fontSize: 15, color: colors.foreground })),
      ]),
      h('div', { alignItems: 'flex-start', gap: 8 }, [
        h('div', { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
          text('S', { fontSize: 14, fontWeight: 700, color: colors.foreground })),
        h('div', {
          maxWidth: '75%',
          padding: '12px 16px',
          backgroundColor: colors.muted,
          borderRadius: '18px 18px 18px 4px',
        }, text('WAIT WHAT', { fontSize: 15, fontWeight: 700, color: colors.foreground })),
      ]),
      h('div', { alignItems: 'flex-start', gap: 8 }, [
        h('div', { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
          text('J', { fontSize: 14, fontWeight: 700, color: colors.foreground })),
        h('div', {
          maxWidth: '75%',
          padding: '12px 16px',
          backgroundColor: colors.muted,
          borderRadius: '18px 18px 18px 4px',
        }, text('send the link rn', { fontSize: 15, color: colors.foreground })),
      ]),
    ]),
    h('div', {
      marginTop: 12,
      padding: 14,
      backgroundColor: colors.foreground,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    }, text('Be the smart friend', { fontSize: 16, fontWeight: 700, color: colors.primary })),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Notification Style Post
function NotificationPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }, [
      // Fake notification 1
      h('div', {
        width: '100%',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(10px)',
      }, [
        h('div', { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          Icons.GlobeIcon({ size: 24, color: colors.foreground })),
        h('div', { flexDirection: 'column', flex: 1 }, [
          text('Lumbus', { fontSize: 14, fontWeight: 700, color: colors.background }),
          text('Your Japan eSIM is activated!', { fontSize: 13, color: 'rgba(255,255,255,0.7)' }),
        ]),
        text('now', { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
      ]),
      // Fake notification 2
      h('div', {
        width: '100%',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
      }, [
        h('div', { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
          Icons.CheckIcon({ size: 24, color: colors.foreground })),
        h('div', { flexDirection: 'column', flex: 1 }, [
          text('Lumbus', { fontSize: 14, fontWeight: 700, color: colors.background }),
          text('5GB data ready to use', { fontSize: 13, color: 'rgba(255,255,255,0.7)' }),
        ]),
        text('now', { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
      ]),
      // Fake notification 3 - bad one crossed out
      h('div', {
        width: '100%',
        padding: 16,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        opacity: 0.5,
      }, [
        h('div', { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.destructive, alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 24, color: colors.background })),
        h('div', { flexDirection: 'column', flex: 1 }, [
          text('Carrier', { fontSize: 14, fontWeight: 700, color: colors.background, textDecoration: 'line-through' }),
          text('Roaming: $47.50 charged', { fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through' }),
        ]),
        text('never', { fontSize: 12, color: colors.destructive }),
      ]),
    ]),
    text('Choose your notifications wisely', { fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: 16 }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Polaroid Stack Style
function PolaroidStackPost() {
  const photos = [
    { dest: 'Japan', rotate: -8, color: colors.primary },
    { dest: 'France', rotate: 4, color: colors.secondary },
    { dest: 'Thailand', rotate: -3, color: colors.accent },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    text('MEMORIES LOADING...', { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginTop: 12 }),
    h('div', {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }, photos.map((p, i) =>
      h('div', {
        position: i === 0 ? 'relative' : 'absolute',
        width: 240,
        backgroundColor: colors.background,
        padding: 12,
        paddingBottom: 48,
        borderRadius: 4,
        transform: `rotate(${p.rotate}deg)`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }, [
        h('div', {
          width: '100%',
          height: 200,
          backgroundColor: p.color,
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
        }, [
          Icons.getFlag(p.dest, 56),
          text(p.dest, { fontSize: 18, fontWeight: 700, color: colors.foreground }),
        ]),
        text('Connected with Lumbus', { fontSize: 11, color: colors.mutedText, marginTop: 12, textAlign: 'center' }),
      ])
    )),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Travel Bingo Card
function TravelBingoPost() {
  const items = [
    { text: 'Post from airport', done: true },
    { text: 'Video call home', done: true },
    { text: 'Maps navigation', done: true },
    { text: 'FREE SPACE', done: true, free: true },
    { text: 'Upload stories', done: true },
    { text: 'Stream music', done: false },
    { text: 'Book last min', done: false },
    { text: 'Share location', done: false },
    { text: 'Work remotely', done: false },
  ];

  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.mint,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: true }),
    text('TRAVEL BINGO', { fontSize: 28, fontWeight: 900, color: colors.foreground, marginTop: 12 }),
    text('What you can do with eSIM data', { fontSize: 14, color: colors.mutedText, marginBottom: 16 }),
    h('div', {
      flexWrap: 'wrap',
      gap: 6,
      flex: 1,
    }, items.map(item =>
      h('div', {
        width: 105,
        height: 105,
        backgroundColor: item.done ? colors.primary : colors.background,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        border: item.free ? `3px solid ${colors.foreground}` : 'none',
      }, [
        item.done && !item.free && Icons.CheckIcon({ size: 20, color: colors.foreground }),
        text(item.text, {
          fontSize: 11,
          fontWeight: 600,
          color: item.done ? colors.foreground : colors.mutedText,
          textAlign: 'center',
          marginTop: item.done && !item.free ? 4 : 0,
        }),
      ])
    )),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// "This or That" Comparison
function ThisOrThatPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    text('THIS OR THAT?', { fontSize: 24, fontWeight: 900, color: colors.background, marginTop: 12, marginBottom: 16 }),
    h('div', { gap: 12, flex: 1 }, [
      // This
      h('div', {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        Icons.LightningIcon({ size: 48, color: colors.foreground }),
        text('eSIM', { fontSize: 28, fontWeight: 900, color: colors.foreground, marginTop: 12 }),
        text('Instant activation', { fontSize: 13, color: colors.foreground, opacity: 0.8 }),
        text('Works on landing', { fontSize: 13, color: colors.foreground, opacity: 0.8 }),
        text('From $4.99', { fontSize: 13, color: colors.foreground, opacity: 0.8 }),
        text('No physical card', { fontSize: 13, color: colors.foreground, opacity: 0.8 }),
      ]),
      // That
      h('div', {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#333',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        Icons.XIcon({ size: 48, color: '#666' }),
        text('Airport SIM', { fontSize: 28, fontWeight: 900, color: '#666', marginTop: 12 }),
        text('Wait in line', { fontSize: 13, color: '#555' }),
        text('Language barrier', { fontSize: 13, color: '#555' }),
        text('Overpriced', { fontSize: 13, color: '#555' }),
        text('Easy to lose', { fontSize: 13, color: '#555' }),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Meme Style "Nobody" Post
function MemeNobodyPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: true }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    }, [
      text('Nobody:', { fontSize: 24, fontWeight: 700, color: colors.foreground, marginBottom: 8 }),
      text('Absolutely nobody:', { fontSize: 24, fontWeight: 700, color: colors.foreground, marginBottom: 24 }),
      h('div', {
        padding: 20,
        backgroundColor: colors.primary,
        borderRadius: 16,
      }, [
        text('Me landing in a new country:', { fontSize: 18, fontWeight: 700, color: colors.foreground, marginBottom: 12 }),
        h('div', { alignItems: 'center', gap: 12 }, [
          Icons.CheckIcon({ size: 28, color: colors.foreground }),
          text('"Already connected"', { fontSize: 26, fontWeight: 900, color: colors.foreground }),
        ]),
      ]),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Receipt Style Post
function ReceiptPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5DC',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', {
      flex: 1,
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 4,
      padding: 24,
      flexDirection: 'column',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    }, [
      text('LUMBUS', { fontSize: 28, fontWeight: 900, color: colors.foreground, textAlign: 'center' }),
      text('TRAVEL eSIM', { fontSize: 12, color: colors.mutedText, textAlign: 'center', marginBottom: 16 }),
      h('div', { width: '100%', height: 1, backgroundColor: colors.border, marginBottom: 12 }),
      ...[
        { item: 'Japan 5GB eSIM', price: '$14.99' },
        { item: 'Roaming fees', price: '$0.00' },
        { item: 'Airport SIM hunt', price: '$0.00' },
        { item: 'Bill shock', price: '$0.00' },
        { item: 'Stress', price: '$0.00' },
      ].map(row =>
        h('div', { justifyContent: 'space-between', marginBottom: 8 }, [
          text(row.item, { fontSize: 14, color: colors.foreground }),
          text(row.price, { fontSize: 14, fontWeight: 600, color: row.price === '$0.00' ? colors.primary : colors.foreground }),
        ])
      ),
      h('div', { width: '100%', height: 1, backgroundColor: colors.border, marginTop: 8, marginBottom: 12 }),
      h('div', { justifyContent: 'space-between' }, [
        text('TOTAL', { fontSize: 18, fontWeight: 900, color: colors.foreground }),
        text('$14.99', { fontSize: 24, fontWeight: 900, color: colors.primary }),
      ]),
      h('div', { justifyContent: 'space-between', marginTop: 8 }, [
        text('SAVINGS', { fontSize: 14, color: colors.mutedText }),
        text('~$150', { fontSize: 18, fontWeight: 700, color: '#059669' }),
      ]),
      h('div', { width: '100%', height: 1, backgroundColor: colors.border, marginTop: 16, marginBottom: 16 }),
      text('THANK YOU FOR', { fontSize: 12, color: colors.mutedText, textAlign: 'center' }),
      text('TRAVELING SMART', { fontSize: 16, fontWeight: 700, color: colors.foreground, textAlign: 'center' }),
      h('div', { marginTop: 16, alignItems: 'center', justifyContent: 'center' }, [
        Logo({ size: 28, withText: false, dark: true }),
      ]),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Glassmorphism Style Post
function GlassPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.purple} 100%)`,
    padding: 28,
    alignItems: 'center',
    position: 'relative',
  }, [
    // Decorative circles
    h('div', { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.secondary, opacity: 0.3, top: -50, right: -50 }),
    h('div', { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.primary, opacity: 0.4, bottom: 100, left: -30 }),
    Logo({ size: 36, withText: true, dark: true }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      h('div', {
        width: '100%',
        padding: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.3)',
        flexDirection: 'column',
        alignItems: 'center',
      }, [
        Icons.GlobeIcon({ size: 64, color: colors.foreground }),
        text('Stay Connected', { fontSize: 36, fontWeight: 900, color: colors.foreground, marginTop: 16 }),
        text('Everywhere You Go', { fontSize: 36, fontWeight: 900, color: colors.foreground }),
        h('div', {
          marginTop: 20,
          padding: '12px 28px',
          backgroundColor: colors.foreground,
          borderRadius: 999,
        }, text('150+ Countries', { fontSize: 16, fontWeight: 700, color: colors.primary })),
      ]),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Retro/Vintage Travel Poster
function RetroTravelPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#F4E4C9',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', {
      flex: 1,
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 24,
      flexDirection: 'column',
      alignItems: 'center',
      border: `6px solid ${colors.foreground}`,
    }, [
      text('VISIT', { fontSize: 18, fontWeight: 700, color: colors.foreground, letterSpacing: 8 }),
      Icons.getFlag(destination.name, 80),
      text(destination.name.toUpperCase(), { fontSize: 42, fontWeight: 900, color: colors.foreground, marginTop: 12, textAlign: 'center' }),
      h('div', { flex: 1 }),
      h('div', {
        padding: '10px 24px',
        backgroundColor: colors.secondary,
        borderRadius: 4,
        border: `3px solid ${colors.foreground}`,
      }, text('STAY CONNECTED', { fontSize: 14, fontWeight: 900, color: colors.foreground, letterSpacing: 2 })),
      text(`eSIM from ${destination.startingPrice}`, { fontSize: 16, fontWeight: 600, color: colors.foreground, marginTop: 12 }),
      h('div', { marginTop: 16 }, Logo({ size: 32, withText: true, dark: true })),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Speedometer/Savings Meter
function SavingsMeterPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    text('SAVINGS METER', { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginTop: 12 }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      // Meter circle
      h('div', {
        width: 260,
        height: 260,
        borderRadius: 130,
        border: `16px solid #333`,
        borderTopColor: colors.primary,
        borderRightColor: colors.primary,
        borderBottomColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        transform: 'rotate(-45deg)',
      }, [
        h('div', { transform: 'rotate(45deg)', flexDirection: 'column', alignItems: 'center' }, [
          text('90%', { fontSize: 72, fontWeight: 900, color: colors.primary }),
          text('SAVED', { fontSize: 18, fontWeight: 700, color: colors.background, letterSpacing: 3 }),
        ]),
      ]),
      text('vs carrier roaming fees', { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 24 }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Split Screen Comparison
function SplitScreenPost() {
  return h('div', {
    width: '100%',
    height: '100%',
    position: 'relative',
  }, [
    // Left side - Bad
    h('div', {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
      backgroundColor: '#1A1A1A',
      padding: 28,
      flexDirection: 'column',
    }, [
      text('WITHOUT', { fontSize: 14, fontWeight: 700, color: colors.destructive, letterSpacing: 2 }),
      text('LUMBUS', { fontSize: 24, fontWeight: 900, color: colors.destructive, marginBottom: 20 }),
      ...[
        { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'No data' },
        { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Lost' },
        { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: '$$$' },
        { icon: Icons.XIcon({ size: 18, color: colors.destructive }), text: 'Stress' },
      ].map(item =>
        h('div', { alignItems: 'center', gap: 8, marginBottom: 12 }, [
          item.icon,
          text(item.text, { fontSize: 16, color: '#888' }),
        ])
      ),
    ]),
    // Right side - Good
    h('div', {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '50%',
      height: '100%',
      backgroundColor: colors.primary,
      padding: 28,
      flexDirection: 'column',
    }, [
      text('WITH', { fontSize: 14, fontWeight: 700, color: colors.foreground, letterSpacing: 2 }),
      text('LUMBUS', { fontSize: 24, fontWeight: 900, color: colors.foreground, marginBottom: 20 }),
      ...[
        { icon: Icons.CheckIcon({ size: 18, color: colors.foreground }), text: 'Connected' },
        { icon: Icons.CheckIcon({ size: 18, color: colors.foreground }), text: 'Navigate' },
        { icon: Icons.CheckIcon({ size: 18, color: colors.foreground }), text: 'Savings' },
        { icon: Icons.CheckIcon({ size: 18, color: colors.foreground }), text: 'Freedom' },
      ].map(item =>
        h('div', { alignItems: 'center', gap: 8, marginBottom: 12 }, [
          item.icon,
          text(item.text, { fontSize: 16, color: colors.foreground }),
        ])
      ),
    ]),
    // Center logo
    h('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }, Logo({ size: 36, withText: false, dark: true })),
    // Footer
    h('div', {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    }, text('getlumbus.com', { fontSize: 14, fontWeight: 600, color: colors.background })),
  ]);
}

// Hot Deal / Flash Sale Style
function FlashSalePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${colors.destructive} 0%, #DC2626 100%)`,
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', {
      padding: '8px 20px',
      backgroundColor: colors.secondary,
      borderRadius: 999,
    }, text('LIMITED TIME', { fontSize: 12, fontWeight: 900, color: colors.foreground, letterSpacing: 2 })),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      Icons.TagIcon({ size: 64, color: colors.background }),
      text('20% OFF', { fontSize: 72, fontWeight: 900, color: colors.background, marginTop: 16 }),
      text('YOUR FIRST eSIM', { fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }),
      h('div', {
        marginTop: 24,
        padding: '16px 32px',
        backgroundColor: colors.background,
        borderRadius: 16,
        border: '4px dashed rgba(0,0,0,0.2)',
      }, [
        text('Code: ', { fontSize: 16, color: colors.mutedText }),
        text('welcome20', { fontSize: 24, fontWeight: 900, color: colors.foreground }),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 36, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Minimalist Typography Post
function TypographyPost({ line1, line2, line3 }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    }, [
      text(line1, { fontSize: 48, fontWeight: 900, color: colors.background }),
      text(line2, { fontSize: 48, fontWeight: 900, color: colors.primary }),
      text(line3, { fontSize: 48, fontWeight: 900, color: colors.background }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Progress Bar Loading Style
function LoadingProgressPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.foreground,
    padding: 28,
    alignItems: 'center',
  }, [
    Logo({ size: 36, withText: true, dark: false }),
    h('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }, [
      text('ACTIVATING eSIM...', { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 24 }),
      h('div', {
        width: '90%',
        height: 24,
        backgroundColor: '#333',
        borderRadius: 12,
        overflow: 'hidden',
      }, [
        h('div', {
          width: '85%',
          height: '100%',
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          borderRadius: 12,
        }),
      ]),
      text('85%', { fontSize: 48, fontWeight: 900, color: colors.primary, marginTop: 16 }),
      text('Almost there...', { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 8 }),
      h('div', { flexDirection: 'column', gap: 12, marginTop: 32, width: '90%' }, [
        h('div', { alignItems: 'center', gap: 12 }, [
          Icons.CheckIcon({ size: 20, color: colors.primary }),
          text('Plan selected', { fontSize: 16, color: colors.background }),
        ]),
        h('div', { alignItems: 'center', gap: 12 }, [
          Icons.CheckIcon({ size: 20, color: colors.primary }),
          text('Payment confirmed', { fontSize: 16, color: colors.background }),
        ]),
        h('div', { alignItems: 'center', gap: 12 }, [
          Icons.CheckIcon({ size: 20, color: colors.primary }),
          text('eSIM installing...', { fontSize: 16, color: colors.primary }),
        ]),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// ============================================
// VIRAL & ULTRA CREATIVE POSTS
// ============================================

// Spotify Wrapped Style
function SpotifyWrappedPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1DB954 0%, #121212 60%)',
    padding: 28,
    alignItems: 'center',
  }, [
    text('YOUR 2024', { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 4, marginTop: 8 }),
    text('TRAVEL WRAPPED', { fontSize: 28, fontWeight: 900, color: colors.background, marginBottom: 20 }),
    h('div', { flex: 1, flexDirection: 'column', width: '100%', gap: 12 }, [
      h('div', { padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, flexDirection: 'column' }, [
        text('You visited', { fontSize: 12, color: 'rgba(255,255,255,0.7)' }),
        text('12 COUNTRIES', { fontSize: 32, fontWeight: 900, color: colors.background }),
        text('Top 1% of travelers', { fontSize: 12, color: '#1DB954', fontWeight: 600 }),
      ]),
      h('div', { padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, flexDirection: 'column' }, [
        text('You saved', { fontSize: 12, color: 'rgba(255,255,255,0.7)' }),
        text('$847', { fontSize: 32, fontWeight: 900, color: colors.primary }),
        text('on roaming fees', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
      ]),
      h('div', { padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, flexDirection: 'column' }, [
        text('Your top destination', { fontSize: 12, color: 'rgba(255,255,255,0.7)' }),
        h('div', { alignItems: 'center', gap: 10, marginTop: 6 }, [
          Icons.getFlag('Japan', 36),
          text('JAPAN', { fontSize: 24, fontWeight: 900, color: colors.background }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// iPhone Lock Screen Style
function LockScreenPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    padding: 0,
    alignItems: 'center',
    position: 'relative',
  }, [
    h('div', { width: '100%', padding: '12px 28px', justifyContent: 'space-between', alignItems: 'center' }, [
      text('9:41', { fontSize: 14, fontWeight: 600, color: colors.background }),
      h('div', { alignItems: 'center', gap: 4 }, [
        Icons.SignalIcon({ size: 14, color: colors.background }),
        text('5G', { fontSize: 11, fontWeight: 600, color: colors.background }),
      ]),
    ]),
    h('div', { flexDirection: 'column', alignItems: 'center', marginTop: 50 }, [
      text('9:41', { fontSize: 86, fontWeight: 300, color: colors.background, letterSpacing: -4 }),
      text('Friday, December 20', { fontSize: 18, color: 'rgba(255,255,255,0.9)' }),
      h('div', { alignItems: 'center', gap: 6, marginTop: 6 }, [
        Icons.getFlag(destination.name, 20),
        text(destination.name, { fontSize: 14, color: 'rgba(255,255,255,0.8)' }),
      ]),
    ]),
    h('div', {
      position: 'absolute',
      bottom: 100,
      left: 24,
      right: 24,
      padding: 12,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 18,
      alignItems: 'center',
      gap: 10,
    }, [
      h('div', { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
        Icons.GlobeIcon({ size: 24, color: colors.foreground })),
      h('div', { flexDirection: 'column', flex: 1 }, [
        text('Lumbus', { fontSize: 14, fontWeight: 700, color: colors.background }),
        text(`Connected in ${destination.name}!`, { fontSize: 12, color: 'rgba(255,255,255,0.9)' }),
      ]),
    ]),
    h('div', { position: 'absolute', bottom: 24, width: 120, height: 5, backgroundColor: colors.background, borderRadius: 3 }),
  ]);
}

// Tinder Swipe Style
function TinderSwipePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #FE3C72 0%, #FF655B 100%)',
    padding: 24,
    alignItems: 'center',
  }, [
    text('SWIPE RIGHT ON', { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 3 }),
    h('div', { flex: 1, width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }, [
      h('div', {
        width: '95%',
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 20,
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
      }, [
        h('div', { width: 80, height: 80, backgroundColor: colors.primary, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
          Icons.GlobeIcon({ size: 48, color: colors.foreground })),
        text('eSIM Data', { fontSize: 26, fontWeight: 900, color: colors.foreground }),
        text('2 miles away', { fontSize: 12, color: colors.mutedText, marginBottom: 10 }),
        h('div', { flexDirection: 'column', gap: 4, alignItems: 'center' }, [
          text('Instant activation', { fontSize: 13, color: colors.foreground }),
          text('150+ countries', { fontSize: 13, color: colors.foreground }),
          text('From $4.99', { fontSize: 13, color: colors.foreground }),
        ]),
      ]),
      h('div', { gap: 28 }, [
        h('div', { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
          Icons.XIcon({ size: 28, color: colors.destructive })),
        h('div', { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
          Icons.CheckIcon({ size: 36, color: colors.foreground })),
      ]),
    ]),
    text('Its a match!', { fontSize: 14, fontWeight: 600, color: colors.background }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Netflix Style
function NetflixStylePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#141414',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      text('Are you still', { fontSize: 28, fontWeight: 400, color: colors.background }),
      text('paying roaming fees?', { fontSize: 28, fontWeight: 700, color: colors.background, marginBottom: 28 }),
      h('div', { gap: 14, flexDirection: 'column', alignItems: 'center' }, [
        h('div', { padding: '14px 44px', backgroundColor: '#E50914', borderRadius: 4 },
          text('Switch to eSIM', { fontSize: 16, fontWeight: 600, color: colors.background })),
        h('div', { padding: '14px 44px', backgroundColor: 'transparent', border: '1px solid #666', borderRadius: 4 },
          text('Keep Suffering', { fontSize: 16, fontWeight: 600, color: '#666' })),
      ]),
    ]),
    h('div', { marginTop: 20 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Achievement Unlocked
function AchievementPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 140,
        height: 140,
        borderRadius: 70,
        border: `5px solid ${colors.secondary}`,
        backgroundColor: 'rgba(253,253,116,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        boxShadow: '0 0 36px rgba(253,253,116,0.3)',
      }, Icons.StarIcon({ size: 64, color: colors.secondary, filled: true })),
      text('ACHIEVEMENT UNLOCKED', { fontSize: 12, fontWeight: 700, color: colors.secondary, letterSpacing: 3, marginBottom: 12 }),
      text('Smart Traveler', { fontSize: 38, fontWeight: 900, color: colors.background, marginBottom: 6 }),
      text('Saved $500+ on roaming', { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }),
      h('div', { padding: '6px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 }, [
        text('RARE ', { fontSize: 11, fontWeight: 700, color: colors.secondary }),
        text('• 3% of travelers', { fontSize: 11, color: 'rgba(255,255,255,0.5)' }),
      ]),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Calculator Savings
function CalculatorPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 24,
  }, [
    h('div', { width: '100%', padding: 20, alignItems: 'flex-end', flexDirection: 'column', marginBottom: 16 }, [
      text('Carrier Roaming', { fontSize: 12, color: '#666' }),
      text('$247.50', { fontSize: 22, color: '#666', textDecoration: 'line-through' }),
      text('Lumbus eSIM', { fontSize: 12, color: colors.primary, marginTop: 10 }),
      text('$14.99', { fontSize: 52, fontWeight: 300, color: colors.background }),
    ]),
    h('div', { padding: 18, backgroundColor: colors.primary, borderRadius: 14, flexDirection: 'column', alignItems: 'center', marginBottom: 16 }, [
      text('YOU SAVE', { fontSize: 11, fontWeight: 700, color: colors.foreground, letterSpacing: 2 }),
      text('$232.51', { fontSize: 44, fontWeight: 900, color: colors.foreground }),
      text('94% less', { fontSize: 13, color: colors.foreground, opacity: 0.8 }),
    ]),
    h('div', { flexWrap: 'wrap', gap: 10, justifyContent: 'center', flex: 1 },
      ['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+'].map(b =>
        h('div', {
          width: 64,
          height: 46,
          backgroundColor: isNaN(b) && b !== 'C' && b !== '±' && b !== '%' ? '#FF9500' : (isNaN(b) ? '#A5A5A5' : '#333'),
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }, text(b, { fontSize: 20, fontWeight: 500, color: isNaN(b) && b !== 'C' && b !== '±' && b !== '%' ? colors.background : (isNaN(b) ? '#000' : colors.background) }))
      )),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Tweet/X Style
function TweetStylePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 24,
  }, [
    text('𝕏', { fontSize: 24, fontWeight: 700, color: colors.background, marginBottom: 16 }),
    h('div', { flex: 1, flexDirection: 'column', padding: 16, backgroundColor: '#16181C', borderRadius: 14, border: '1px solid #2F3336' }, [
      h('div', { alignItems: 'center', gap: 10, marginBottom: 14 }, [
        h('div', { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          Logo({ size: 24, withText: false, dark: true })),
        h('div', { flexDirection: 'column' }, [
          h('div', { alignItems: 'center', gap: 4 }, [
            text('Lumbus', { fontSize: 15, fontWeight: 700, color: colors.background }),
            Icons.CheckIcon({ size: 14, color: '#1D9BF0' }),
          ]),
          text('@getlumbus', { fontSize: 13, color: '#71767B' }),
        ]),
      ]),
      text('just landed in tokyo and my data is already working', { fontSize: 20, color: colors.background, marginBottom: 6 }),
      text('meanwhile my friend is still looking for a SIM card at the airport', { fontSize: 20, color: colors.background, marginBottom: 6 }),
      text('this is the way', { fontSize: 20, color: colors.background, marginBottom: 16 }),
      text('10:32 AM · Dec 20, 2024', { fontSize: 13, color: '#71767B', marginBottom: 12 }),
      h('div', { width: '100%', height: 1, backgroundColor: '#2F3336', marginBottom: 12 }),
      h('div', { gap: 24 }, [
        h('div', { alignItems: 'center', gap: 4 }, [
          text('47K', { fontSize: 13, fontWeight: 700, color: colors.background }),
          text('Reposts', { fontSize: 13, color: '#71767B' }),
        ]),
        h('div', { alignItems: 'center', gap: 4 }, [
          text('182K', { fontSize: 13, fontWeight: 700, color: colors.background }),
          text('Likes', { fontSize: 13, color: '#71767B' }),
        ]),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Movie Poster
function MoviePosterPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0A0A',
    padding: 0,
    alignItems: 'center',
  }, [
    h('div', {
      flex: 1,
      width: '100%',
      background: `linear-gradient(180deg, transparent 0%, #0A0A0A 100%), linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 24,
    }, [
      text('FROM THE MAKERS OF STRESS-FREE TRAVEL', { fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 16 }),
      text('THE', { fontSize: 20, fontWeight: 300, color: colors.background, letterSpacing: 6 }),
      text('CONNECTED', { fontSize: 46, fontWeight: 900, color: colors.background, letterSpacing: 3 }),
      text('TRAVELER', { fontSize: 46, fontWeight: 900, color: colors.primary, letterSpacing: 3, marginBottom: 16 }),
      h('div', { alignItems: 'center', gap: 6, marginBottom: 20 },
        [1, 2, 3, 4, 5].map(() => Icons.StarIcon({ size: 14, color: colors.secondary, filled: true }))),
      text('No roaming. No stress. Just adventure.', { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }),
      h('div', { padding: '10px 28px', backgroundColor: colors.primary, borderRadius: 4 },
        text('NOW IN 150+ COUNTRIES', { fontSize: 11, fontWeight: 700, color: colors.foreground, letterSpacing: 1 })),
    ]),
    h('div', { padding: 16 }, Logo({ size: 28, withText: true, dark: false })),
  ]);
}

// Duolingo Style
function DuolingoStylePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#58CC02',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', { width: 120, height: 120, backgroundColor: colors.background, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' },
        Icons.GlobeIcon({ size: 64, color: '#58CC02' })),
      text("You're going on a trip!", { fontSize: 26, fontWeight: 900, color: colors.foreground, textAlign: 'center', marginBottom: 10 }),
      text("Don't forget your eSIM", { fontSize: 18, fontWeight: 600, color: colors.foreground, opacity: 0.9, marginBottom: 20 }),
      h('div', { padding: '12px 32px', backgroundColor: colors.foreground, borderRadius: 10, boxShadow: '0 4px 0 #388E3C' },
        text('GET eSIM NOW', { fontSize: 15, fontWeight: 700, color: '#58CC02' })),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: true })),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Newspaper Headline
function NewspaperPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5DC',
    padding: 18,
  }, [
    h('div', { flexDirection: 'column', paddingBottom: 10, marginBottom: 12, alignItems: 'center' }, [
      text('THE TRAVEL TIMES', { fontSize: 28, fontWeight: 900, color: colors.foreground, letterSpacing: 2 }),
      h('div', { width: '100%', height: 2, backgroundColor: '#000', marginTop: 6 }),
      h('div', { width: '100%', height: 2, backgroundColor: '#000', marginTop: 3 }),
    ]),
    text('December 20, 2024', { fontSize: 9, color: colors.mutedText, textAlign: 'center', marginBottom: 12 }),
    h('div', { flex: 1, flexDirection: 'column' }, [
      text('BREAKING:', { fontSize: 12, fontWeight: 700, color: colors.destructive, marginBottom: 6 }),
      text('LOCAL TRAVELER', { fontSize: 32, fontWeight: 900, color: colors.foreground, lineHeight: 1.1 }),
      text('SAVES $500 ON', { fontSize: 32, fontWeight: 900, color: colors.foreground, lineHeight: 1.1 }),
      text('ROAMING FEES', { fontSize: 32, fontWeight: 900, color: colors.foreground, marginBottom: 12, lineHeight: 1.1 }),
      h('div', { width: '100%', height: 1, backgroundColor: colors.foreground, marginBottom: 10 }),
      text('"I just downloaded an app," says shocked tourist who avoided $500 carrier bill during Japan trip', { fontSize: 13, color: colors.foreground, lineHeight: 1.4 }),
      h('div', { flex: 1 }),
      h('div', { padding: 14, backgroundColor: colors.primary, borderRadius: 4 },
        text('Get yours: getlumbus.com', { fontSize: 13, fontWeight: 700, color: colors.foreground, textAlign: 'center' })),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Battery Charging
function BatteryChargingPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 160,
        height: 280,
        borderRadius: 22,
        border: '5px solid #333',
        padding: 6,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
      }, [
        h('div', { position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 50, height: 14, backgroundColor: '#333', borderRadius: '7px 7px 0 0' }),
        h('div', {
          width: '100%',
          height: '90%',
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }, Icons.LightningIcon({ size: 44, color: colors.foreground })),
      ]),
      text('TRAVEL READY', { fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, marginTop: 28 }),
      text('100%', { fontSize: 64, fontWeight: 300, color: colors.background }),
      text('eSIM Activated', { fontSize: 16, color: colors.primary }),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Album Cover
function AlbumCoverPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 300,
        height: 300,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.purple} 100%)`,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        boxShadow: '0 14px 44px rgba(0,0,0,0.4)',
      }, Icons.GlobeIcon({ size: 110, color: colors.foreground })),
      text('LUMBUS PRESENTS', { fontSize: 11, fontWeight: 600, color: '#666', letterSpacing: 3, marginBottom: 6 }),
      text('NO ROAMING', { fontSize: 34, fontWeight: 900, color: colors.background }),
      text('FEES', { fontSize: 34, fontWeight: 900, color: colors.primary }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Fortune Cookie
function FortuneCookiePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #DC143C 0%, #8B0000 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: '88%',
        backgroundColor: '#FFF8DC',
        padding: 24,
        borderRadius: 4,
        transform: 'rotate(-2deg)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        flexDirection: 'column',
        alignItems: 'center',
      }, [
        text('Your fortune:', { fontSize: 13, color: '#8B4513', marginBottom: 10 }),
        text('"Great savings await the traveler who plans ahead"', { fontSize: 18, fontWeight: 600, color: colors.foreground, textAlign: 'center', lineHeight: 1.4, marginBottom: 14 }),
        h('div', { width: '50%', height: 1, backgroundColor: '#DEB887', marginBottom: 14 }),
        text('Lucky numbers:', { fontSize: 11, color: '#8B4513' }),
        text('150+ 90% $4.99', { fontSize: 15, fontWeight: 700, color: colors.primary }),
      ]),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// ============================================
// MEGA VIRAL TRENDY POSTS
// ============================================

// Group Chat Style
function GroupChatPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1E1E1E 0%, #0A0A0A 100%)',
    padding: 20,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, [
      h('div', { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 }),
      text('Travel Crew', { fontSize: 16, fontWeight: 700, color: colors.background }),
      text('   3 members', { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', gap: 10 }, [
      // Message 1 (received)
      h('div', { flexDirection: 'row', alignItems: 'flex-end' }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B6B', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
          text('S', { fontSize: 12, fontWeight: 700, color: colors.background })),
        h('div', { backgroundColor: '#2D2D2D', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '75%' },
          text('guys the roaming bill from my last trip was $300 im dead', { fontSize: 14, color: colors.background })),
      ]),
      // Message 2 (received)
      h('div', { flexDirection: 'row', alignItems: 'flex-end' }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4ECDC4', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
          text('M', { fontSize: 12, fontWeight: 700, color: colors.background })),
        h('div', { backgroundColor: '#2D2D2D', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '75%' },
          text('wait you didnt use lumbus??', { fontSize: 14, color: colors.background })),
      ]),
      // Message 3 (sent - green bubble)
      h('div', { flexDirection: 'row', justifyContent: 'flex-end' }, [
        h('div', { backgroundColor: colors.primary, padding: 12, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '75%' },
          text('lol i paid like $9 for 10GB in japan', { fontSize: 14, color: colors.foreground })),
      ]),
      // Message 4 (received)
      h('div', { flexDirection: 'row', alignItems: 'flex-end' }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B6B', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
          text('S', { fontSize: 12, fontWeight: 700, color: colors.background })),
        h('div', { backgroundColor: '#2D2D2D', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '75%' },
          text('WHAT', { fontSize: 14, color: colors.background })),
      ]),
      // Message 5 (sent)
      h('div', { flexDirection: 'row', justifyContent: 'flex-end' }, [
        h('div', { backgroundColor: colors.primary, padding: 12, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '75%' },
          text('getlumbus.com you are welcome', { fontSize: 14, fontWeight: 600, color: colors.foreground })),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Uber Eats / Delivery Style
function DeliveryStylePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 28,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, [
      text('Order Status', { fontSize: 14, fontWeight: 600, color: colors.mutedText }),
      h('div', { padding: '4px 10px', backgroundColor: colors.primary, borderRadius: 12 },
        text('CONFIRMED', { fontSize: 10, fontWeight: 700, color: colors.foreground })),
    ]),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', { marginBottom: 24 }, Icons.PlaneIcon({ size: 80, color: colors.primary })),
      text('Your eSIM is ready!', { fontSize: 28, fontWeight: 900, color: colors.foreground, marginBottom: 8 }),
      text('Japan 10GB Plan', { fontSize: 18, color: colors.mutedText, marginBottom: 24 }),
      h('div', { width: '100%', height: 6, backgroundColor: colors.muted, borderRadius: 3, marginBottom: 16 }, [
        h('div', { width: '100%', height: 6, backgroundColor: colors.primary, borderRadius: 3 }),
      ]),
      h('div', { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, [
        h('div', { alignItems: 'center' }, [
          Icons.CheckIcon({ size: 24, color: colors.primary }),
          text('Ordered', { fontSize: 11, color: colors.mutedText, marginTop: 4 }),
        ]),
        h('div', { alignItems: 'center' }, [
          Icons.CheckIcon({ size: 24, color: colors.primary }),
          text('Confirmed', { fontSize: 11, color: colors.mutedText, marginTop: 4 }),
        ]),
        h('div', { alignItems: 'center' }, [
          Icons.CheckIcon({ size: 24, color: colors.primary }),
          text('Ready', { fontSize: 11, color: colors.mutedText, marginTop: 4 }),
        ]),
        h('div', { alignItems: 'center' }, [
          Icons.LightningIcon({ size: 24, color: colors.primary }),
          text('Activate', { fontSize: 11, color: colors.primary, fontWeight: 600, marginTop: 4 }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: true })),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Apple Music Playlist Style
function PlaylistStylePost() {
  const destinations = [
    { name: 'Japan', duration: '10GB', plays: '1.2M travelers' },
    { name: 'Thailand', duration: '5GB', plays: '890K travelers' },
    { name: 'France', duration: '8GB', plays: '1.5M travelers' },
    { name: 'Italy', duration: '3GB', plays: '720K travelers' },
  ];
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #FA2D48 0%, #1A1A1A 60%)',
    padding: 28,
  }, [
    text('PLAYLIST', { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 8 }),
    text('2024 Travel', { fontSize: 32, fontWeight: 900, color: colors.background, marginBottom: 4 }),
    text('Destinations', { fontSize: 32, fontWeight: 900, color: colors.background, marginBottom: 16 }),
    text('Your wanderlust playlist', { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 12 },
      destinations.map((dest, i) =>
        h('div', { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }, [
          text(`${i + 1}`, { fontSize: 14, color: 'rgba(255,255,255,0.5)', width: 24 }),
          h('div', { flex: 1, flexDirection: 'column', marginLeft: 12 }, [
            text(dest.name, { fontSize: 16, fontWeight: 600, color: colors.background }),
            text(dest.plays, { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
          ]),
          text(dest.duration, { fontSize: 14, fontWeight: 600, color: colors.primary }),
        ])
      )
    ),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Neon Sign Style
function NeonSignPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0A0F',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        padding: '24px 36px',
        border: `4px solid ${colors.primary}`,
        borderRadius: 8,
        boxShadow: `0 0 30px ${colors.primary}, 0 0 60px ${colors.primary}40`,
        marginBottom: 20,
      }, text('OPEN', { fontSize: 48, fontWeight: 900, color: colors.primary })),
      h('div', {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 20,
      }, [
        text('FOR', { fontSize: 20, fontWeight: 300, color: colors.accent, letterSpacing: 8 }),
        text('TRAVELERS', { fontSize: 36, fontWeight: 900, color: colors.accent, letterSpacing: 4 }),
      ]),
      h('div', { flexDirection: 'row', gap: 16 }, [
        h('div', { padding: 12, border: `2px solid ${colors.secondary}`, borderRadius: 4 },
          text('24/7', { fontSize: 16, fontWeight: 700, color: colors.secondary })),
        h('div', { padding: 12, border: `2px solid ${colors.primary}`, borderRadius: 4 },
          text('150+', { fontSize: 16, fontWeight: 700, color: colors.primary })),
        h('div', { padding: 12, border: `2px solid ${colors.accent}`, borderRadius: 4 },
          text('INSTANT', { fontSize: 16, fontWeight: 700, color: colors.accent })),
      ]),
    ]),
    Logo({ size: 32, withText: true, dark: false }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// VHS Retro Style
function VHSPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    padding: 20,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, [
      text('REC', { fontSize: 14, fontWeight: 700, color: '#FF0000' }),
      text('00:12:34', { fontSize: 14, fontWeight: 500, color: colors.background }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      h('div', {
        width: '92%',
        padding: 28,
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        flexDirection: 'column',
        alignItems: 'center',
      }, [
        text('HOME VIDEO', { fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 4, marginBottom: 16 }),
        text('THAT TIME I', { fontSize: 20, fontWeight: 300, color: colors.background }),
        text('SAVED $500', { fontSize: 44, fontWeight: 900, color: colors.primary }),
        text('ON ROAMING', { fontSize: 20, fontWeight: 300, color: colors.background, marginBottom: 16 }),
        h('div', { width: '60%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 }),
        text('featuring: Lumbus eSIM', { fontSize: 14, color: 'rgba(255,255,255,0.6)' }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }, [
      text('PLAY', { fontSize: 12, color: colors.primary }),
      text('getlumbus.com', { fontSize: 12, fontWeight: 600, color: colors.background }),
    ]),
  ]);
}

// Screen Time Style
function ScreenTimePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1C1C1E 0%, #000 100%)',
    padding: 28,
  }, [
    text('Screen Time', { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }),
    text('Weekly Report', { fontSize: 28, fontWeight: 700, color: colors.background, marginBottom: 24 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
      h('div', { flexDirection: 'column' }, [
        text('MONEY SAVED', { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 8 }),
        h('div', { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }, [
          text('$247', { fontSize: 48, fontWeight: 300, color: colors.primary }),
          text('.00', { fontSize: 24, fontWeight: 300, color: colors.primary }),
          h('div', { marginLeft: 12, padding: '4px 8px', backgroundColor: '#34C759', borderRadius: 4 },
            text('+89%', { fontSize: 12, fontWeight: 600, color: colors.background })),
        ]),
        text('from last trip', { fontSize: 13, color: 'rgba(255,255,255,0.5)' }),
      ]),
      h('div', { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }),
      h('div', { flexDirection: 'column' }, [
        text('TOP DESTINATIONS', { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 12 }),
        h('div', { flexDirection: 'row', gap: 8 }, [
          h('div', { flex: 4, height: 36, backgroundColor: colors.primary, borderRadius: 6, padding: 8 },
            text('Japan', { fontSize: 12, fontWeight: 600, color: colors.foreground })),
          h('div', { flex: 2, height: 36, backgroundColor: colors.accent, borderRadius: 6, padding: 8 },
            text('Thailand', { fontSize: 12, fontWeight: 600, color: colors.foreground })),
          h('div', { flex: 1, height: 36, backgroundColor: colors.secondary, borderRadius: 6, padding: 8 },
            text('EU', { fontSize: 12, fontWeight: 600, color: colors.foreground })),
        ]),
      ]),
      h('div', { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }),
      h('div', { flexDirection: 'row', justifyContent: 'space-between' }, [
        h('div', { flexDirection: 'column' }, [
          text('Data Used', { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
          text('15.2GB', { fontSize: 24, fontWeight: 600, color: colors.background }),
        ]),
        h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          text('Countries', { fontSize: 12, color: 'rgba(255,255,255,0.5)' }),
          text('5', { fontSize: 24, fontWeight: 600, color: colors.background }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Strava / Workout Complete Style
function TripCompletePost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, #FC4C02 0%, #1A1A1A 50%)`,
    padding: 28,
  }, [
    text('TRIP COMPLETE', { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, marginBottom: 24 }),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      text(destination.flag, { fontSize: 64, marginBottom: 12 }),
      text(destination.name, { fontSize: 36, fontWeight: 900, color: colors.background, marginBottom: 24 }),
      h('div', { flexDirection: 'row', gap: 28, marginBottom: 28 }, [
        h('div', { alignItems: 'center' }, [
          text('8.4GB', { fontSize: 32, fontWeight: 700, color: colors.background }),
          text('Data Used', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
        ]),
        h('div', { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.2)' }),
        h('div', { alignItems: 'center' }, [
          text('$247', { fontSize: 32, fontWeight: 700, color: colors.primary }),
          text('Saved', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
        ]),
      ]),
      h('div', { padding: '12px 28px', backgroundColor: colors.primary, borderRadius: 24 },
        text('SHARE ACHIEVEMENT', { fontSize: 13, fontWeight: 700, color: colors.foreground })),
    ]),
    Logo({ size: 28, withText: true, dark: false }),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Spotify Song Card Style
function SongCardPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #282828 0%, #121212 100%)',
    padding: 28,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, [
      h('div', { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1DB954', marginRight: 8 }),
      text('Now Playing', { fontSize: 13, color: '#1DB954', fontWeight: 600 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 240,
        height: 240,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }, Icons.GlobeIcon({ size: 100, color: colors.foreground })),
      text('No Roaming Fees', { fontSize: 24, fontWeight: 700, color: colors.background, marginBottom: 6 }),
      text('Lumbus eSIM', { fontSize: 15, color: 'rgba(255,255,255,0.6)' }),
    ]),
    h('div', { flexDirection: 'column', gap: 12, marginTop: 20 }, [
      h('div', { width: '100%', height: 4, backgroundColor: '#4D4D4D', borderRadius: 2 }, [
        h('div', { width: '65%', height: 4, backgroundColor: colors.background, borderRadius: 2 }),
      ]),
      h('div', { flexDirection: 'row', justifyContent: 'center', gap: 32, alignItems: 'center' }, [
        Icons.RefreshIcon({ size: 28, color: 'rgba(255,255,255,0.7)' }),
        h('div', { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          Icons.LightningIcon({ size: 28, color: colors.foreground })),
        Icons.GlobeIcon({ size: 28, color: 'rgba(255,255,255,0.7)' }),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// iPhone Widget Style
function WidgetStylePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    text('Your Home Screen, Upgraded', { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }, [
      // Large widget
      h('div', {
        width: 320,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        flexDirection: 'column',
      }, [
        h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, [
          Logo({ size: 24, withText: false, dark: true }),
          text('Lumbus', { fontSize: 14, fontWeight: 600, color: colors.foreground, marginLeft: 8 }),
        ]),
        h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, [
          h('div', { flexDirection: 'column' }, [
            text('Japan', { fontSize: 20, fontWeight: 700, color: colors.foreground }),
            text('4.2GB left', { fontSize: 13, color: colors.mutedText }),
          ]),
          h('div', { alignItems: 'flex-end' }, [
            text('8', { fontSize: 36, fontWeight: 300, color: colors.primary }),
            text('days', { fontSize: 12, color: colors.mutedText }),
          ]),
        ]),
      ]),
      // Small widgets row
      h('div', { flexDirection: 'row', gap: 14 }, [
        h('div', {
          width: 153,
          height: 153,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 24,
          padding: 14,
          flexDirection: 'column',
        }, [
          Icons.GlobeIcon({ size: 28, color: colors.primary }),
          h('div', { flex: 1 }),
          text('150+', { fontSize: 28, fontWeight: 700, color: colors.foreground }),
          text('Countries', { fontSize: 12, color: colors.mutedText }),
        ]),
        h('div', {
          width: 153,
          height: 153,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 24,
          padding: 14,
          flexDirection: 'column',
        }, [
          Icons.LightningIcon({ size: 28, color: colors.secondary }),
          h('div', { flex: 1 }),
          text('90%', { fontSize: 28, fontWeight: 700, color: colors.foreground }),
          text('Savings', { fontSize: 12, color: colors.mutedText }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Wanted Poster Style
function WantedPosterPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#D4A574',
    padding: 24,
    alignItems: 'center',
  }, [
    h('div', {
      flex: 1,
      width: '100%',
      backgroundColor: '#F5DEB3',
      padding: 24,
      borderRadius: 4,
      flexDirection: 'column',
      alignItems: 'center',
      border: '4px solid #8B4513',
    }, [
      text('WANTED', { fontSize: 48, fontWeight: 900, color: '#8B4513', letterSpacing: 8 }),
      h('div', { width: '80%', height: 2, backgroundColor: '#8B4513', marginBottom: 16 }),
      text('DEAD OR ALIVE', { fontSize: 14, fontWeight: 700, color: '#8B4513', letterSpacing: 3, marginBottom: 20 }),
      h('div', {
        width: 160,
        height: 160,
        backgroundColor: '#DEB887',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        border: '3px solid #8B4513',
      }, text('ROAMING FEES', { fontSize: 16, fontWeight: 900, color: '#8B4513', textAlign: 'center', padding: 8 })),
      text('REWARD', { fontSize: 12, fontWeight: 600, color: '#8B4513', marginBottom: 4 }),
      text('$500 SAVINGS', { fontSize: 28, fontWeight: 900, color: '#8B4513', marginBottom: 12 }),
      h('div', { width: '80%', height: 1, backgroundColor: '#8B4513', marginBottom: 12 }),
      text('Last seen: Your carrier bill', { fontSize: 12, color: '#8B4513' }),
      text('Eliminate with: getlumbus.com', { fontSize: 13, fontWeight: 700, color: '#8B4513' }),
    ]),
  ]);
}

// Error 404 Style
function Error404Post() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0D1117',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      text('ERROR 404', { fontSize: 14, fontWeight: 600, color: '#F85149', letterSpacing: 3, marginBottom: 12 }),
      text('ROAMING FEES', { fontSize: 40, fontWeight: 900, color: colors.background, marginBottom: 8 }),
      text('NOT FOUND', { fontSize: 40, fontWeight: 900, color: colors.primary, marginBottom: 24 }),
      h('div', { width: '80%', padding: 16, backgroundColor: '#161B22', borderRadius: 8, border: '1px solid #30363D' }, [
        h('div', { flexDirection: 'column', gap: 4 }, [
          text('> searching for roaming_fees...', { fontSize: 12, color: '#8B949E' }),
          text('> file not found', { fontSize: 12, color: '#F85149' }),
          text('> reason: user installed Lumbus', { fontSize: 12, color: colors.primary }),
          text('> savings: $500+', { fontSize: 12, color: '#58A6FF' }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 20 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Dating Profile Style (Different from Tinder)
function DatingProfilePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #7C3AED 0%, #4C1D95 100%)',
    padding: 28,
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center' }, [
      h('div', {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        border: '4px solid rgba(255,255,255,0.3)',
      }, Icons.GlobeIcon({ size: 70, color: colors.foreground })),
      text('Lumbus eSIM', { fontSize: 24, fontWeight: 700, color: colors.background, marginBottom: 4 }),
      text('150+ countries away', { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }),
      h('div', { width: '100%', padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 }, [
        h('div', { flexDirection: 'column', gap: 8 }, [
          text('About me:', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
          text('Im looking for someone who loves to travel but hates roaming fees. Must appreciate instant activation and data from $4.99. Looking for a long-term connection.', { fontSize: 14, color: colors.background, lineHeight: 1.4 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', gap: 12, marginTop: 20 }, [
        h('div', { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 },
          text('Instant', { fontSize: 12, color: colors.background })),
        h('div', { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 },
          text('Affordable', { fontSize: 12, color: colors.background })),
        h('div', { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 },
          text('Reliable', { fontSize: 12, color: colors.background })),
      ]),
    ]),
    h('div', { flexDirection: 'row', gap: 20, marginTop: 20, justifyContent: 'center' }, [
      h('div', { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
        text('X', { fontSize: 24, color: 'rgba(255,255,255,0.5)' })),
      h('div', { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
        Icons.HeartIcon({ size: 28, color: colors.foreground })),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Meme Template Style - Drake
function DrakeMemePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 0,
  }, [
    // Top row - No
    h('div', { flexDirection: 'row', height: '45%' }, [
      h('div', { width: '35%', backgroundColor: '#FFE4B5', alignItems: 'center', justifyContent: 'center', padding: 12 },
        text('NAH', { fontSize: 32, fontWeight: 900, color: '#8B4513' })),
      h('div', { flex: 1, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center', padding: 16 }, [
        h('div', { flexDirection: 'column', alignItems: 'center', gap: 8 }, [
          text('$300', { fontSize: 36, fontWeight: 900, color: colors.destructive }),
          text('Roaming Bill', { fontSize: 16, color: colors.mutedText }),
        ]),
      ]),
    ]),
    h('div', { height: 4, backgroundColor: colors.foreground }),
    // Bottom row - Yes
    h('div', { flexDirection: 'row', height: '45%' }, [
      h('div', { width: '35%', backgroundColor: '#98FB98', alignItems: 'center', justifyContent: 'center', padding: 12 },
        text('YEP', { fontSize: 32, fontWeight: 900, color: '#228B22' })),
      h('div', { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: 16 }, [
        h('div', { flexDirection: 'column', alignItems: 'center', gap: 8 }, [
          text('$9.99', { fontSize: 36, fontWeight: 900, color: colors.foreground }),
          text('Lumbus eSIM', { fontSize: 16, color: colors.foreground }),
        ]),
      ]),
    ]),
    h('div', { height: '10%', backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
      Logo({ size: 24, withText: true, dark: true })),
  ]);
}

// Spotify Stats Card
function SpotifyStatsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1DB954 0%, #191414 70%)',
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { marginBottom: 20 }, [
      text('You are in the top', { fontSize: 14, color: 'rgba(255,255,255,0.8)' }),
    ]),
    text('1%', { fontSize: 96, fontWeight: 900, color: colors.background }),
    h('div', { flexDirection: 'column', alignItems: 'center', marginBottom: 24 }, [
      text('of smart travelers', { fontSize: 20, fontWeight: 600, color: colors.background }),
      text('who dont pay roaming fees', { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }),
    ]),
    h('div', { flex: 1, width: '100%', flexDirection: 'column', gap: 12 }, [
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' }, [
        text('Countries visited', { fontSize: 14, color: colors.background }),
        text('12', { fontSize: 14, fontWeight: 700, color: colors.primary }),
      ]),
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' }, [
        text('Data used', { fontSize: 14, color: colors.background }),
        text('45.2 GB', { fontSize: 14, fontWeight: 700, color: colors.primary }),
      ]),
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' }, [
        text('Money saved', { fontSize: 14, color: colors.background }),
        text('$847', { fontSize: 14, fontWeight: 700, color: colors.primary }),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Instagram Insights Style
function InsightsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, [
      Icons.ChartIcon({ size: 24, color: colors.background }),
      text('  Your Travel Stats', { fontSize: 18, fontWeight: 600, color: colors.background }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
      // Main stat
      h('div', { padding: 20, backgroundColor: '#1E1E1E', borderRadius: 16 }, [
        h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, [
          h('div', { flexDirection: 'column' }, [
            text('Total Savings', { fontSize: 13, color: 'rgba(255,255,255,0.6)' }),
            text('$1,247', { fontSize: 40, fontWeight: 700, color: colors.primary }),
          ]),
          h('div', { padding: '6px 10px', backgroundColor: 'rgba(52,199,89,0.2)', borderRadius: 8 },
            text('+127%', { fontSize: 13, fontWeight: 600, color: '#34C759' })),
        ]),
      ]),
      // Two column stats
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { flex: 1, padding: 16, backgroundColor: '#1E1E1E', borderRadius: 16 }, [
          text('Trips', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
          text('8', { fontSize: 32, fontWeight: 700, color: colors.background }),
          text('+3 this year', { fontSize: 11, color: colors.accent }),
        ]),
        h('div', { flex: 1, padding: 16, backgroundColor: '#1E1E1E', borderRadius: 16 }, [
          text('Data Used', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
          text('67GB', { fontSize: 32, fontWeight: 700, color: colors.background }),
          text('across 12 eSIMs', { fontSize: 11, color: colors.secondary }),
        ]),
      ]),
      // Bar chart
      h('div', { padding: 16, backgroundColor: '#1E1E1E', borderRadius: 16 }, [
        text('Monthly Savings', { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }),
        h('div', { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 80 }, [
          h('div', { flex: 1, height: '40%', backgroundColor: colors.primary, borderRadius: 4 }),
          h('div', { flex: 1, height: '60%', backgroundColor: colors.primary, borderRadius: 4 }),
          h('div', { flex: 1, height: '45%', backgroundColor: colors.primary, borderRadius: 4 }),
          h('div', { flex: 1, height: '80%', backgroundColor: colors.primary, borderRadius: 4 }),
          h('div', { flex: 1, height: '100%', backgroundColor: colors.accent, borderRadius: 4 }),
          h('div', { flex: 1, height: '70%', backgroundColor: colors.primary, borderRadius: 4 }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 24, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// ============================================
// ULTRA TRENDING COUNTRY POSTS
// ============================================

// BeReal Style
function BeRealPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 16,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, [
      text('BeReal.', { fontSize: 24, fontWeight: 700, color: colors.background }),
      h('div', { padding: '4px 12px', backgroundColor: '#FF3B5C', borderRadius: 12 },
        text('2hr late', { fontSize: 11, fontWeight: 600, color: colors.background })),
    ]),
    h('div', { flex: 1, flexDirection: 'column', position: 'relative' }, [
      // Main "photo" area
      h('div', {
        flex: 1,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        text(destination.flag, { fontSize: 80 }),
        text(`Just landed in ${destination.name}`, { fontSize: 20, fontWeight: 700, color: colors.foreground, marginTop: 16, textAlign: 'center' }),
        text('and my eSIM already works', { fontSize: 16, color: colors.foreground, marginTop: 4 }),
      ]),
      // Small selfie overlay
      h('div', {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 120,
        height: 160,
        backgroundColor: colors.secondary,
        borderRadius: 12,
        border: '3px solid #000',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        Icons.PhoneIcon({ size: 40, color: colors.foreground }),
        text('$4.99', { fontSize: 14, fontWeight: 700, color: colors.foreground, marginTop: 8 }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }, [
      text('Add a comment...', { fontSize: 13, color: 'rgba(255,255,255,0.5)' }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Wordle Style
function WordlePost() {
  const rows = [
    { letters: 'ROAM', colors: ['#3A3A3C', '#3A3A3C', '#3A3A3C', '#3A3A3C'] },
    { letters: 'BILLS', colors: ['#3A3A3C', '#3A3A3C', '#3A3A3C', '#3A3A3C', '#3A3A3C'] },
    { letters: 'SAVED', colors: ['#538D4E', '#538D4E', '#538D4E', '#538D4E', '#538D4E'] },
  ];
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#121213',
    padding: 28,
    alignItems: 'center',
  }, [
    text('Travle', { fontSize: 32, fontWeight: 700, color: colors.background, letterSpacing: 2, marginBottom: 24 }),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
      rows.map(row =>
        h('div', { flexDirection: 'row', gap: 6 },
          row.letters.split('').map((letter, i) =>
            h('div', {
              width: 56,
              height: 56,
              backgroundColor: row.colors[i],
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }, text(letter, { fontSize: 28, fontWeight: 700, color: colors.background }))
          )
        )
      )
    ),
    h('div', { padding: 16, backgroundColor: colors.primary, borderRadius: 8, marginTop: 20 },
      text('Play: getlumbus.com', { fontSize: 14, fontWeight: 700, color: colors.foreground })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Google Maps Review Style
function MapsReviewPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, [
      h('div', { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
        text('LU', { fontSize: 16, fontWeight: 700, color: colors.foreground })),
      h('div', { flex: 1 }, [
        text('Lumbus eSIM', { fontSize: 16, fontWeight: 600, color: colors.foreground }),
        text('Local Guide · 847 reviews', { fontSize: 12, color: colors.mutedText }),
      ]),
    ]),
    h('div', { flexDirection: 'row', marginBottom: 12 },
      [1, 2, 3, 4, 5].map(() => Icons.StarIcon({ size: 24, color: '#FBBC04', filled: true }))
    ),
    text(`${destination.name} with Lumbus`, { fontSize: 18, fontWeight: 600, color: colors.foreground, marginBottom: 8 }),
    h('div', { flex: 1 }, [
      text(`Spent 2 weeks in ${destination.name} and my eSIM worked flawlessly. Paid $9.99 instead of $300 in roaming fees. The activation took literally 30 seconds. Why didnt I know about this sooner?! 10/10 would recommend to every traveler.`, { fontSize: 14, color: colors.foreground, lineHeight: 1.5 }),
    ]),
    h('div', {
      width: '100%',
      height: 140,
      background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.accent} 100%)`,
      borderRadius: 12,
      marginTop: 16,
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text(destination.flag, { fontSize: 56 }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }, [
      text('Helpful?', { fontSize: 13, color: colors.mutedText }),
      h('div', { flexDirection: 'row', gap: 16 }, [
        text('Yes (2.4K)', { fontSize: 13, color: colors.primary, fontWeight: 600 }),
        text('No', { fontSize: 13, color: colors.mutedText }),
      ]),
    ]),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// FaceTime Incoming Call
function FaceTimePost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, #1C1C1E 0%, #2C2C2E 100%)`,
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 140,
        height: 140,
        borderRadius: 70,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }, text(destination.flag, { fontSize: 64 })),
      text(destination.name, { fontSize: 32, fontWeight: 300, color: colors.background }),
      text('FaceTime Video', { fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: 8 }),
      h('div', { marginTop: 24, padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 }, [
        text('Using Lumbus eSIM', { fontSize: 13, color: colors.primary }),
      ]),
    ]),
    h('div', { flexDirection: 'row', gap: 48, marginBottom: 32 }, [
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        h('div', { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 28, color: colors.background })),
        text('Decline', { fontSize: 13, color: colors.background, marginTop: 8 }),
      ]),
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        h('div', { width: 64, height: 64, borderRadius: 32, backgroundColor: '#30D158', alignItems: 'center', justifyContent: 'center' },
          Icons.PhoneIcon({ size: 28, color: colors.background })),
        text('Accept', { fontSize: 13, color: colors.background, marginTop: 8 }),
      ]),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Uber Rating Style
function UberRatingPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 28,
  }, [
    text('Rate your trip', { fontSize: 14, color: colors.mutedText, textAlign: 'center' }),
    text(`${destination.name} Adventure`, { fontSize: 24, fontWeight: 700, color: colors.foreground, textAlign: 'center', marginTop: 8 }),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 120,
        height: 120,
        borderRadius: 60,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }, text(destination.flag, { fontSize: 56 })),
      h('div', { flexDirection: 'row', gap: 8, marginBottom: 20 },
        [1, 2, 3, 4, 5].map(() => Icons.StarIcon({ size: 36, color: colors.primary, filled: true }))
      ),
      h('div', { width: '100%', padding: 16, backgroundColor: colors.muted, borderRadius: 12, marginBottom: 16 }, [
        text('"10/10 trip. Saved $247 on data with Lumbus. Would travel again!"', { fontSize: 14, color: colors.foreground, textAlign: 'center', lineHeight: 1.4 }),
      ]),
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { padding: '8px 16px', backgroundColor: colors.muted, borderRadius: 16 },
          text('Great value', { fontSize: 12, color: colors.foreground })),
        h('div', { padding: '8px 16px', backgroundColor: colors.primary, borderRadius: 16 },
          text('Instant', { fontSize: 12, color: colors.foreground })),
        h('div', { padding: '8px 16px', backgroundColor: colors.muted, borderRadius: 16 },
          text('Reliable', { fontSize: 12, color: colors.foreground })),
      ]),
    ]),
    h('div', { padding: 16, backgroundColor: colors.foreground, borderRadius: 12, alignItems: 'center' },
      text('Book next trip', { fontSize: 16, fontWeight: 600, color: colors.background })),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Pinterest Pin Style
function PinterestPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 16,
  }, [
    h('div', {
      flex: 1,
      background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.mint} 100%)`,
      borderRadius: 24,
      padding: 24,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text(destination.flag, { fontSize: 72, marginBottom: 16 }),
      text(`${destination.name}`, { fontSize: 28, fontWeight: 900, color: colors.foreground, marginBottom: 8 }),
      text('TRAVEL HACK', { fontSize: 14, fontWeight: 700, color: colors.foreground, letterSpacing: 3, marginBottom: 16 }),
      h('div', { width: '80%', height: 2, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 16 }),
      text('How I saved $300', { fontSize: 18, fontWeight: 600, color: colors.foreground }),
      text('on roaming fees', { fontSize: 18, fontWeight: 600, color: colors.foreground }),
      h('div', { marginTop: 20, padding: '12px 24px', backgroundColor: colors.foreground, borderRadius: 24 },
        text('Save this pin', { fontSize: 14, fontWeight: 700, color: colors.background })),
    ]),
    h('div', { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }, [
      h('div', { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
        text('L', { fontSize: 16, fontWeight: 700, color: colors.foreground })),
      h('div', { flex: 1 }, [
        text('Lumbus Travel Tips', { fontSize: 13, fontWeight: 600, color: colors.foreground }),
        text('getlumbus.com', { fontSize: 11, color: colors.mutedText }),
      ]),
      h('div', { padding: '8px 16px', backgroundColor: '#E60023', borderRadius: 20 },
        text('Save', { fontSize: 13, fontWeight: 700, color: colors.background })),
    ]),
  ]);
}

// YouTube Thumbnail Style
function YouTubePost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0F0F0F',
    padding: 0,
  }, [
    // Thumbnail
    h('div', {
      height: '65%',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      position: 'relative',
      padding: 20,
    }, [
      // Text overlay
      h('div', { position: 'absolute', bottom: 16, left: 16, right: 16 }, [
        h('div', { flexDirection: 'row', gap: 8, marginBottom: 8 }, [
          h('div', { padding: '4px 8px', backgroundColor: '#FF0000', borderRadius: 4 },
            text('NEW', { fontSize: 11, fontWeight: 700, color: colors.background })),
          h('div', { padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 4 },
            text('12:34', { fontSize: 11, fontWeight: 600, color: colors.background })),
        ]),
        text(`I WENT TO ${destination.name.toUpperCase()}`, { fontSize: 28, fontWeight: 900, color: colors.foreground, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }),
        text('AND ONLY PAID $9.99 FOR DATA', { fontSize: 16, fontWeight: 700, color: colors.secondary }),
      ]),
      // Big flag
      h('div', { position: 'absolute', top: 20, right: 20 }, [
        text(destination.flag, { fontSize: 64 }),
      ]),
    ]),
    // Video info
    h('div', { flex: 1, padding: 16 }, [
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          text('L', { fontSize: 18, fontWeight: 700, color: colors.foreground })),
        h('div', { flex: 1 }, [
          text(`How I Saved $300 in ${destination.name} (Travel Hack)`, { fontSize: 14, fontWeight: 600, color: colors.background }),
          text('Lumbus · 1.2M views · 2 days ago', { fontSize: 12, color: '#AAAAAA', marginTop: 4 }),
        ]),
      ]),
    ]),
  ]);
}

// Discord Message Style
function DiscordPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#313338',
    padding: 20,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#2B2D31', borderRadius: 8 }, [
      text('#', { fontSize: 20, color: '#80848E', marginRight: 8 }),
      text('travel-tips', { fontSize: 16, fontWeight: 600, color: colors.background }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
      // Message 1
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 40, height: 40, borderRadius: 20, backgroundColor: '#5865F2', alignItems: 'center', justifyContent: 'center' },
          text('T', { fontSize: 16, fontWeight: 700, color: colors.background })),
        h('div', { flex: 1 }, [
          h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
            text('TravelPro', { fontSize: 14, fontWeight: 600, color: '#F2A83B' }),
            text('Today at 3:42 PM', { fontSize: 11, color: '#80848E' }),
          ]),
          text('just got hit with a $400 roaming bill from my Japan trip', { fontSize: 14, color: '#DBDEE1', marginTop: 4 }),
        ]),
      ]),
      // Message 2
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
          text('L', { fontSize: 16, fontWeight: 700, color: colors.foreground })),
        h('div', { flex: 1 }, [
          h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
            text('LumbusBot', { fontSize: 14, fontWeight: 600, color: colors.primary }),
            h('div', { padding: '2px 6px', backgroundColor: '#5865F2', borderRadius: 4 },
              text('BOT', { fontSize: 9, fontWeight: 600, color: colors.background })),
            text('Today at 3:43 PM', { fontSize: 11, color: '#80848E' }),
          ]),
          text('bruh shouldve used getlumbus.com', { fontSize: 14, color: '#DBDEE1', marginTop: 4 }),
          text('Japan 10GB = $9.99', { fontSize: 14, color: '#DBDEE1' }),
          text('instant activation, no SIM needed', { fontSize: 14, color: '#DBDEE1' }),
        ]),
      ]),
      // Reactions
      h('div', { flexDirection: 'row', gap: 8, marginLeft: 52 }, [
        h('div', { flexDirection: 'row', padding: '4px 8px', backgroundColor: '#2B2D31', borderRadius: 8, gap: 4 }, [
          text('GOAT', { fontSize: 12 }),
          text('47', { fontSize: 12, color: '#80848E' }),
        ]),
        h('div', { flexDirection: 'row', padding: '4px 8px', backgroundColor: '#2B2D31', borderRadius: 8, gap: 4 }, [
          text('W', { fontSize: 12 }),
          text('23', { fontSize: 12, color: '#80848E' }),
        ]),
      ]),
    ]),
    h('div', { padding: 12, backgroundColor: '#2B2D31', borderRadius: 8, marginTop: 12 }, [
      text('Message #travel-tips', { fontSize: 14, color: '#80848E' }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Slack Notification Style
function SlackPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, [
      h('div', { width: 20, height: 20, backgroundColor: '#4A154B', borderRadius: 4, marginRight: 8 }),
      text('Slack', { fontSize: 18, fontWeight: 700, color: colors.foreground }),
    ]),
    h('div', { flex: 1, flexDirection: 'column' }, [
      h('div', { padding: 16, backgroundColor: colors.muted, borderRadius: 12, marginBottom: 16 }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, [
          text('#', { fontSize: 16, color: colors.mutedText }),
          text('team-travel', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
        ]),
        h('div', { flexDirection: 'row', gap: 12, marginBottom: 12 }, [
          h('div', { width: 36, height: 36, borderRadius: 6, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
            text('JD', { fontSize: 12, fontWeight: 700, color: colors.foreground })),
          h('div', { flex: 1 }, [
            h('div', { flexDirection: 'row', gap: 8 }, [
              text('John Doe', { fontSize: 13, fontWeight: 600, color: colors.foreground }),
              text('11:42 AM', { fontSize: 11, color: colors.mutedText }),
            ]),
            text(`Hey team, heading to ${destination.name} next week. Any tips for mobile data?`, { fontSize: 14, color: colors.foreground, marginTop: 4 }),
          ]),
        ]),
        h('div', { flexDirection: 'row', gap: 12 }, [
          h('div', { width: 36, height: 36, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
            text('L', { fontSize: 12, fontWeight: 700, color: colors.foreground })),
          h('div', { flex: 1 }, [
            h('div', { flexDirection: 'row', gap: 8 }, [
              text('Lumbus', { fontSize: 13, fontWeight: 600, color: colors.foreground }),
              h('div', { padding: '2px 6px', backgroundColor: colors.primary, borderRadius: 4 },
                text('APP', { fontSize: 9, fontWeight: 700, color: colors.foreground })),
              text('11:43 AM', { fontSize: 11, color: colors.mutedText }),
            ]),
            text(`Get an eSIM! ${destination.name} 10GB is only ${destination.startingPrice}. Install before you fly.`, { fontSize: 14, color: colors.foreground, marginTop: 4 }),
          ]),
        ]),
      ]),
      h('div', { flexDirection: 'row', gap: 8, justifyContent: 'center' }, [
        h('div', { padding: '8px 16px', backgroundColor: colors.primary, borderRadius: 8 },
          text('Get Lumbus', { fontSize: 13, fontWeight: 600, color: colors.foreground })),
      ]),
    ]),
    Logo({ size: 28, withText: true, dark: true }),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Notes App Style
function NotesAppPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
    padding: 0,
  }, [
    h('div', { padding: '16px 20px', backgroundColor: '#2C2C2E', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      text('< Notes', { fontSize: 16, color: '#FFC107' }),
      text('Done', { fontSize: 16, color: '#FFC107' }),
    ]),
    h('div', { flex: 1, padding: 20 }, [
      text(`${destination.name} Trip Checklist`, { fontSize: 24, fontWeight: 700, color: colors.background, marginBottom: 20 }),
      h('div', { flexDirection: 'column', gap: 12 }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          h('div', { width: 24, height: 24, borderRadius: 12, border: '2px solid #48484A' }),
          text('Book flights', { fontSize: 16, color: '#8E8E93', textDecoration: 'line-through' }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          h('div', { width: 24, height: 24, borderRadius: 12, border: '2px solid #48484A' }),
          text('Book hotel', { fontSize: 16, color: '#8E8E93', textDecoration: 'line-through' }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          h('div', { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
            Icons.CheckIcon({ size: 14, color: colors.foreground })),
          text('Get Lumbus eSIM', { fontSize: 16, color: colors.primary, fontWeight: 600 }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          h('div', { width: 24, height: 24, borderRadius: 12, border: '2px solid #48484A' }),
          text('Pack bags', { fontSize: 16, color: colors.background }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          h('div', { width: 24, height: 24, borderRadius: 12, border: '2px solid #48484A' }),
          text('Exchange currency', { fontSize: 16, color: colors.background }),
        ]),
      ]),
      h('div', { marginTop: 24, padding: 16, backgroundColor: '#2C2C2E', borderRadius: 12 }, [
        text('Pro tip:', { fontSize: 13, color: colors.primary, marginBottom: 4 }),
        text(`${destination.name} eSIM from ${destination.startingPrice}. Activate before you land!`, { fontSize: 14, color: colors.background }),
      ]),
    ]),
    h('div', { padding: 16, alignItems: 'center' }, [
      Logo({ size: 28, withText: true, dark: false }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Weather App Style
function WeatherPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #4A90D9 0%, #5BA8E8 50%, #7EC8F3 100%)',
    padding: 28,
    alignItems: 'center',
  }, [
    text(destination.name, { fontSize: 32, fontWeight: 300, color: colors.background }),
    text('Connected', { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 }),
    h('div', { flex: 1, alignItems: 'center', justifyContent: 'center' }, [
      text(destination.flag, { fontSize: 80, marginBottom: 8 }),
      h('div', { flexDirection: 'row', alignItems: 'flex-start' }, [
        text('$4', { fontSize: 96, fontWeight: 200, color: colors.background }),
        text('.99', { fontSize: 36, fontWeight: 200, color: colors.background, marginTop: 20 }),
      ]),
      text('Data Plan', { fontSize: 20, color: 'rgba(255,255,255,0.9)' }),
    ]),
    h('div', { width: '100%', flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16 }, [
      h('div', { alignItems: 'center' }, [
        text('1GB', { fontSize: 14, color: 'rgba(255,255,255,0.7)' }),
        text('$4.99', { fontSize: 16, fontWeight: 600, color: colors.background }),
      ]),
      h('div', { alignItems: 'center' }, [
        text('5GB', { fontSize: 14, color: 'rgba(255,255,255,0.7)' }),
        text('$14.99', { fontSize: 16, fontWeight: 600, color: colors.background }),
      ]),
      h('div', { alignItems: 'center' }, [
        text('10GB', { fontSize: 14, color: 'rgba(255,255,255,0.7)' }),
        text('$24.99', { fontSize: 16, fontWeight: 600, color: colors.background }),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// App Store Review Style
function AppStoreReviewPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, [
      h('div', { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
        Icons.GlobeIcon({ size: 32, color: colors.foreground })),
      h('div', { flex: 1 }, [
        text('Lumbus - eSIM Travel Data', { fontSize: 16, fontWeight: 600, color: colors.background }),
        text('Travel', { fontSize: 13, color: '#8E8E93' }),
      ]),
      h('div', { padding: '6px 14px', backgroundColor: '#0A84FF', borderRadius: 16 },
        text('GET', { fontSize: 13, fontWeight: 700, color: colors.background })),
    ]),
    h('div', { flex: 1, flexDirection: 'column' }, [
      h('div', { padding: 16, backgroundColor: '#1C1C1E', borderRadius: 12, marginBottom: 12 }, [
        h('div', { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, [
          h('div', { flexDirection: 'column' }, [
            text('Ratings & Reviews', { fontSize: 18, fontWeight: 600, color: colors.background }),
            h('div', { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }, [
              text('4.8', { fontSize: 24, fontWeight: 700, color: colors.background }),
              h('div', { flexDirection: 'row' },
                [1, 2, 3, 4, 5].map((_, i) => Icons.StarIcon({ size: 16, color: i < 5 ? '#FF9500' : '#48484A', filled: true }))
              ),
            ]),
          ]),
          text('12.4K ratings', { fontSize: 13, color: '#8E8E93' }),
        ]),
      ]),
      h('div', { padding: 16, backgroundColor: '#1C1C1E', borderRadius: 12 }, [
        h('div', { flexDirection: 'row', marginBottom: 8 },
          [1, 2, 3, 4, 5].map(() => Icons.StarIcon({ size: 14, color: '#FF9500', filled: true }))
        ),
        text(`Life saver in ${destination.name}!`, { fontSize: 15, fontWeight: 600, color: colors.background, marginBottom: 8 }),
        text(`Used this for my ${destination.name} trip. Saved me $300+ in roaming fees. Setup took 30 seconds. Why isnt everyone using this?? 10/10`, { fontSize: 14, color: '#EBEBF5', lineHeight: 1.4 }),
        text('- TravelerPro247', { fontSize: 12, color: '#8E8E93', marginTop: 8 }),
      ]),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Calendar Invite Style
function CalendarPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, [
      Icons.CheckIcon({ size: 24, color: colors.primary }),
      text('  Event Added', { fontSize: 16, fontWeight: 600, color: colors.primary }),
    ]),
    h('div', { flex: 1, padding: 20, backgroundColor: colors.muted, borderRadius: 16, border: `3px solid ${colors.primary}` }, [
      h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, [
        text(destination.flag, { fontSize: 40, marginRight: 12 }),
        h('div', { flex: 1 }, [
          text(`${destination.name} Trip`, { fontSize: 22, fontWeight: 700, color: colors.foreground }),
          text('December 28 - January 5', { fontSize: 14, color: colors.mutedText }),
        ]),
      ]),
      h('div', { height: 1, backgroundColor: colors.border, marginBottom: 16 }),
      h('div', { flexDirection: 'column', gap: 12 }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.LightningIcon({ size: 20, color: colors.primary }),
          h('div', { flex: 1 }, [
            text('Reminder: Get eSIM', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
            text('1 day before departure', { fontSize: 12, color: colors.mutedText }),
          ]),
          h('div', { padding: '4px 8px', backgroundColor: colors.primary, borderRadius: 8 },
            text('DONE', { fontSize: 10, fontWeight: 700, color: colors.foreground })),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.GlobeIcon({ size: 20, color: colors.accent }),
          h('div', { flex: 1 }, [
            text('Data Plan', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
            text(`${destination.name} 10GB - $9.99`, { fontSize: 12, color: colors.mutedText }),
          ]),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
          Icons.ShieldIcon({ size: 20, color: colors.secondary }),
          h('div', { flex: 1 }, [
            text('Savings', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
            text('$290+ vs carrier roaming', { fontSize: 12, color: colors.primary }),
          ]),
        ]),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: true })),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// Podcast Episode Style
function PodcastPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',
    padding: 24,
  }, [
    h('div', { flexDirection: 'row', gap: 16, marginBottom: 20 }, [
      h('div', {
        width: 120,
        height: 120,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }, Icons.GlobeIcon({ size: 56, color: colors.foreground })),
      h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
        text('TRAVEL HACKS', { fontSize: 11, fontWeight: 600, color: colors.primary, letterSpacing: 1 }),
        text('The eSIM Episode', { fontSize: 18, fontWeight: 700, color: colors.background }),
        text('Lumbus Travel Pod', { fontSize: 13, color: '#B3B3B3' }),
      ]),
    ]),
    h('div', { flex: 1, flexDirection: 'column' }, [
      h('div', { width: '100%', height: 4, backgroundColor: '#535353', borderRadius: 2, marginBottom: 8 }, [
        h('div', { width: '45%', height: 4, backgroundColor: colors.primary, borderRadius: 2 }),
      ]),
      h('div', { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }, [
        text('12:34', { fontSize: 11, color: '#B3B3B3' }),
        text('27:45', { fontSize: 11, color: '#B3B3B3' }),
      ]),
      h('div', { padding: 16, backgroundColor: '#282828', borderRadius: 12 }, [
        text('Episode Highlights:', { fontSize: 14, fontWeight: 600, color: colors.background, marginBottom: 12 }),
        text(`• Why ${destination.name} travelers lose $300+ on roaming`, { fontSize: 13, color: '#B3B3B3', marginBottom: 6 }),
        text('• The 30-second eSIM activation trick', { fontSize: 13, color: '#B3B3B3', marginBottom: 6 }),
        text('• Data plans from $4.99', { fontSize: 13, color: colors.primary }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 16 }, [
      Icons.RefreshIcon({ size: 28, color: '#B3B3B3' }),
      h('div', { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
        Icons.PlaneIcon({ size: 28, color: colors.foreground })),
      Icons.GlobeIcon({ size: 28, color: '#B3B3B3' }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Snapchat Memory Style
function SnapchatPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 0,
  }, [
    // Header
    h('div', { flexDirection: 'row', justifyContent: 'space-between', padding: 16, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }, [
      h('div', { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
        text('X', { fontSize: 18, color: colors.background })),
      h('div', { padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
        text('1 YEAR AGO', { fontSize: 11, fontWeight: 700, color: colors.background })),
    ]),
    // Main content
    h('div', {
      flex: 1,
      background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
    }, [
      text(destination.flag, { fontSize: 100 }),
      text(destination.name, { fontSize: 36, fontWeight: 700, color: colors.foreground, marginTop: 16 }),
      h('div', { marginTop: 20, padding: '12px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }, [
        text('Data cost: $9.99', { fontSize: 16, color: colors.background }),
        text('Roaming saved: $290', { fontSize: 14, color: colors.secondary }),
      ]),
    ]),
    // Bottom bar
    h('div', { padding: 16, backgroundColor: '#000', alignItems: 'center' }, [
      h('div', { flexDirection: 'row', gap: 16 }, [
        h('div', { padding: '10px 20px', backgroundColor: '#FFFC00', borderRadius: 24 },
          text('Share to Story', { fontSize: 13, fontWeight: 700, color: '#000' })),
        h('div', { padding: '10px 20px', backgroundColor: '#333', borderRadius: 24 },
          text('Save', { fontSize: 13, fontWeight: 700, color: colors.background })),
      ]),
    ]),
  ]);
}

// Reddit Post Style
function RedditPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1B',
    padding: 20,
  }, [
    h('div', { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, [
      h('div', { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF4500', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
        text('r/', { fontSize: 12, fontWeight: 700, color: colors.background })),
      text('r/travel', { fontSize: 14, fontWeight: 600, color: colors.background }),
      text(' • 4h', { fontSize: 12, color: '#818384' }),
    ]),
    h('div', { flex: 1, flexDirection: 'column' }, [
      text(`PSA: Stop paying $300+ for roaming in ${destination.name}`, { fontSize: 18, fontWeight: 600, color: colors.background, marginBottom: 12 }),
      h('div', { padding: 16, backgroundColor: '#272729', borderRadius: 8, marginBottom: 12 }, [
        text(`Just got back from ${destination.name}. Before I used to pay my carrier $300+ for international data.`, { fontSize: 14, color: '#D7DADC', lineHeight: 1.5, marginBottom: 8 }),
        text('This trip I used Lumbus eSIM. $9.99 for 10GB. Took 30 seconds to setup. Worked perfectly the entire trip.', { fontSize: 14, color: '#D7DADC', lineHeight: 1.5, marginBottom: 8 }),
        text('Genuinely dont know why this isnt common knowledge. Sharing in case it helps someone.', { fontSize: 14, color: '#D7DADC', lineHeight: 1.5 }),
      ]),
      h('div', { flexDirection: 'row', gap: 16 }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.LightningIcon({ size: 20, color: '#FF4500' }),
          text('4.2k', { fontSize: 12, fontWeight: 700, color: colors.background }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          text('847 comments', { fontSize: 12, color: '#818384' }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          text('Share', { fontSize: 12, color: '#818384' }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          text('Save', { fontSize: 12, color: '#818384' }),
        ]),
      ]),
    ]),
    h('div', { padding: 12, backgroundColor: '#272729', borderRadius: 8, marginTop: 12, flexDirection: 'row', alignItems: 'center' }, [
      h('div', { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 8 }),
      text('Top comment: "getlumbus.com changed my life"', { fontSize: 12, color: '#D7DADC' }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// WhatsApp Status Style
function WhatsAppPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0B141A',
    padding: 0,
  }, [
    // Progress bars
    h('div', { flexDirection: 'row', gap: 4, padding: '12px 16px' }, [
      h('div', { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }, [
        h('div', { width: '100%', height: 2, backgroundColor: colors.background, borderRadius: 1 }),
      ]),
      h('div', { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }, [
        h('div', { width: '60%', height: 2, backgroundColor: colors.background, borderRadius: 1 }),
      ]),
      h('div', { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }),
    ]),
    // Header
    h('div', { flexDirection: 'row', alignItems: 'center', padding: '8px 16px' }, [
      h('div', { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
        text('L', { fontSize: 18, fontWeight: 700, color: colors.foreground })),
      h('div', { flex: 1 }, [
        text('Lumbus', { fontSize: 15, fontWeight: 600, color: colors.background }),
        text('12 minutes ago', { fontSize: 12, color: 'rgba(255,255,255,0.6)' }),
      ]),
    ]),
    // Content
    h('div', {
      flex: 1,
      background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      margin: 16,
      borderRadius: 12,
      padding: 28,
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      text(destination.flag, { fontSize: 80 }),
      text(`${destination.name}`, { fontSize: 32, fontWeight: 700, color: colors.foreground, marginTop: 16 }),
      text(`from ${destination.startingPrice}`, { fontSize: 20, color: colors.foreground }),
      h('div', { marginTop: 20, padding: '12px 24px', backgroundColor: colors.foreground, borderRadius: 24 },
        text('Swipe up to get yours', { fontSize: 14, fontWeight: 600, color: colors.primary })),
    ]),
    // Reply bar
    h('div', { padding: 16 }, [
      h('div', { padding: 12, backgroundColor: '#1F2C34', borderRadius: 24, flexDirection: 'row', alignItems: 'center' }, [
        text('Reply to Lumbus...', { fontSize: 14, color: 'rgba(255,255,255,0.5)' }),
      ]),
    ]),
  ]);
}

// Airline Ticket QR Style
function AirlineTicketPost({ destination }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 20,
  }, [
    h('div', {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 16,
      overflow: 'hidden',
      flexDirection: 'column',
    }, [
      // Header
      h('div', { padding: 16, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.PlaneIcon({ size: 24, color: colors.foreground }),
          text('LUMBUS AIR', { fontSize: 16, fontWeight: 700, color: colors.foreground }),
        ]),
        text('BOARDING PASS', { fontSize: 12, fontWeight: 600, color: colors.foreground }),
      ]),
      // Main content
      h('div', { flex: 1, padding: 20 }, [
        h('div', { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }, [
          h('div', { flexDirection: 'column' }, [
            text('FROM', { fontSize: 10, color: colors.mutedText }),
            text('ROAMING', { fontSize: 24, fontWeight: 700, color: colors.foreground }),
            text('Expensive', { fontSize: 12, color: colors.mutedText }),
          ]),
          Icons.PlaneIcon({ size: 32, color: colors.primary }),
          h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            text('TO', { fontSize: 10, color: colors.mutedText }),
            text(destination.name.substring(0, 6).toUpperCase(), { fontSize: 24, fontWeight: 700, color: colors.foreground }),
            text(destination.flag, { fontSize: 16 }),
          ]),
        ]),
        h('div', { height: 1, backgroundColor: colors.border, marginBottom: 16 }),
        h('div', { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }, [
          h('div', { flexDirection: 'column' }, [
            text('PASSENGER', { fontSize: 10, color: colors.mutedText }),
            text('SMART TRAVELER', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            text('SAVINGS', { fontSize: 10, color: colors.mutedText }),
            text('$290+', { fontSize: 14, fontWeight: 600, color: colors.primary }),
          ]),
        ]),
        h('div', { flexDirection: 'row', justifyContent: 'space-between' }, [
          h('div', { flexDirection: 'column' }, [
            text('DATA', { fontSize: 10, color: colors.mutedText }),
            text('10GB', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'center' }, [
            text('PRICE', { fontSize: 10, color: colors.mutedText }),
            text(destination.startingPrice, { fontSize: 14, fontWeight: 600, color: colors.primary }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            text('STATUS', { fontSize: 10, color: colors.mutedText }),
            text('INSTANT', { fontSize: 14, fontWeight: 600, color: colors.primary }),
          ]),
        ]),
      ]),
      // Barcode area
      h('div', { padding: 16, backgroundColor: colors.background, alignItems: 'center' }, [
        h('div', { flexDirection: 'row', gap: 2 },
          Array(30).fill(0).map((_, i) =>
            h('div', { width: i % 3 === 0 ? 3 : 2, height: 40, backgroundColor: colors.foreground })
          )
        ),
        text('getlumbus.com', { fontSize: 12, fontWeight: 600, color: colors.foreground, marginTop: 8 }),
      ]),
    ]),
  ]);
}

// ============================================
// EDUCATIONAL FUN POSTS - What is eSIM & How To
// ============================================

// What is eSIM - Explain Like Im 5
function WhatIsEsimPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 28,
  }, [
    h('div', { padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, alignSelf: 'flex-start', marginBottom: 16 },
      text('EXPLAIN LIKE IM 5', { fontSize: 11, fontWeight: 700, color: colors.foreground, letterSpacing: 1 })),
    text('What is an', { fontSize: 28, fontWeight: 300, color: colors.foreground }),
    text('eSIM?', { fontSize: 56, fontWeight: 900, color: colors.foreground, marginBottom: 20 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 16 }, [
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        h('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
          text('1', { fontSize: 20, fontWeight: 700, color: colors.foreground })),
        h('div', { flex: 1 }, [
          text('A SIM card...', { fontSize: 16, fontWeight: 600, color: colors.foreground }),
          text('but built into your phone', { fontSize: 14, color: 'rgba(0,0,0,0.7)' }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        h('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
          text('2', { fontSize: 20, fontWeight: 700, color: colors.foreground })),
        h('div', { flex: 1 }, [
          text('No tiny card to lose', { fontSize: 16, fontWeight: 600, color: colors.foreground }),
          text('Download it like an app', { fontSize: 14, color: 'rgba(0,0,0,0.7)' }),
        ]),
      ]),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        h('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
          text('3', { fontSize: 20, fontWeight: 700, color: colors.foreground })),
        h('div', { flex: 1 }, [
          text('Works instantly', { fontSize: 16, fontWeight: 600, color: colors.foreground }),
          text('Activate in 30 seconds', { fontSize: 14, color: 'rgba(0,0,0,0.7)' }),
        ]),
      ]),
    ]),
    Logo({ size: 28, withText: true, dark: true }),
    WebsiteFooter({ dark: true, size: 'sm' }),
  ]);
}

// How To Use - Step by Step Cards
function HowToStep1Post() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 28,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, [
      h('div', { padding: '6px 12px', backgroundColor: colors.primary, borderRadius: 12 },
        text('STEP 1 OF 3', { fontSize: 11, fontWeight: 700, color: colors.foreground })),
      text('HOW TO', { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 160,
        height: 160,
        borderRadius: 32,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
      }, Icons.DownloadIcon({ size: 72, color: colors.foreground })),
      text('Download', { fontSize: 36, fontWeight: 900, color: colors.background }),
      text('Lumbus App', { fontSize: 36, fontWeight: 900, color: colors.primary, marginBottom: 16 }),
      text('Free on App Store & Google Play', { fontSize: 14, color: 'rgba(255,255,255,0.6)' }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 }, [
      h('div', { width: 32, height: 6, backgroundColor: colors.primary, borderRadius: 3 }),
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

function HowToStep2Post() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 28,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, [
      h('div', { padding: '6px 12px', backgroundColor: colors.accent, borderRadius: 12 },
        text('STEP 2 OF 3', { fontSize: 11, fontWeight: 700, color: colors.foreground })),
      text('HOW TO', { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 160,
        height: 160,
        borderRadius: 32,
        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
      }, Icons.GlobeIcon({ size: 72, color: colors.foreground })),
      text('Pick Your', { fontSize: 36, fontWeight: 900, color: colors.background }),
      text('Destination', { fontSize: 36, fontWeight: 900, color: colors.accent, marginBottom: 16 }),
      text('150+ countries from $4.99', { fontSize: 14, color: 'rgba(255,255,255,0.6)' }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 }, [
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
      h('div', { width: 32, height: 6, backgroundColor: colors.accent, borderRadius: 3 }),
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

function HowToStep3Post() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 28,
  }, [
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, [
      h('div', { padding: '6px 12px', backgroundColor: colors.secondary, borderRadius: 12 },
        text('STEP 3 OF 3', { fontSize: 11, fontWeight: 700, color: colors.foreground })),
      text('HOW TO', { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      h('div', {
        width: 160,
        height: 160,
        borderRadius: 32,
        background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
      }, Icons.LightningIcon({ size: 72, color: colors.foreground })),
      text('Scan QR &', { fontSize: 36, fontWeight: 900, color: colors.background }),
      text('Go!', { fontSize: 36, fontWeight: 900, color: colors.secondary, marginBottom: 16 }),
      text('Instant activation, works immediately', { fontSize: 14, color: 'rgba(255,255,255,0.6)' }),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 }, [
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
      h('div', { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }),
      h('div', { width: 32, height: 6, backgroundColor: colors.secondary, borderRadius: 3 }),
    ]),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// eSIM vs Physical SIM - Fun Comparison
function EsimVsSimPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    padding: 0,
  }, [
    h('div', { padding: 20, backgroundColor: colors.foreground, alignItems: 'center' },
      text('eSIM vs Physical SIM', { fontSize: 18, fontWeight: 700, color: colors.background })),
    h('div', { flex: 1, flexDirection: 'row' }, [
      // eSIM Column (winner)
      h('div', { flex: 1, padding: 16, backgroundColor: colors.primary, flexDirection: 'column', gap: 12 }, [
        text('eSIM', { fontSize: 24, fontWeight: 900, color: colors.foreground, textAlign: 'center', marginBottom: 8 }),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.CheckIcon({ size: 20, color: colors.foreground }),
          text('Instant download', { fontSize: 13, color: colors.foreground }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.CheckIcon({ size: 20, color: colors.foreground }),
          text('No store visit', { fontSize: 13, color: colors.foreground }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.CheckIcon({ size: 20, color: colors.foreground }),
          text('Cant lose it', { fontSize: 13, color: colors.foreground }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.CheckIcon({ size: 20, color: colors.foreground }),
          text('Keep your number', { fontSize: 13, color: colors.foreground }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.CheckIcon({ size: 20, color: colors.foreground }),
          text('Multiple plans', { fontSize: 13, color: colors.foreground }),
        ]),
      ]),
      // Physical SIM Column (loser)
      h('div', { flex: 1, padding: 16, backgroundColor: colors.muted, flexDirection: 'column', gap: 12 }, [
        text('Old SIM', { fontSize: 24, fontWeight: 900, color: colors.mutedText, textAlign: 'center', marginBottom: 8 }),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('Find a store', { fontSize: 13, color: colors.mutedText }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('Wait in line', { fontSize: 13, color: colors.mutedText }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('Easy to lose', { fontSize: 13, color: colors.mutedText }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('Swap cards', { fontSize: 13, color: colors.mutedText }),
        ]),
        h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
          Icons.XIcon({ size: 20, color: colors.destructive }),
          text('One at a time', { fontSize: 13, color: colors.mutedText }),
        ]),
      ]),
    ]),
    h('div', { padding: 16, alignItems: 'center' }, [
      Logo({ size: 28, withText: true, dark: true }),
    ]),
  ]);
}

// FAQ Style - Does my phone support eSIM?
function DoesMyPhoneSupportPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1A1A1A 0%, #2D2D2D 100%)',
    padding: 28,
  }, [
    text('FAQ', { fontSize: 12, fontWeight: 600, color: colors.primary, letterSpacing: 2, marginBottom: 8 }),
    text('Does my phone', { fontSize: 28, fontWeight: 300, color: colors.background }),
    text('support eSIM?', { fontSize: 28, fontWeight: 700, color: colors.primary, marginBottom: 24 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 12 }, [
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, [
        text('iPhone XS and newer', { fontSize: 15, fontWeight: 600, color: colors.background }),
        text('(iPhone XS, XR, 11, 12, 13, 14, 15, 16)', { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }),
      ]),
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, [
        text('Google Pixel 3 and newer', { fontSize: 15, fontWeight: 600, color: colors.background }),
        text('(Pixel 3, 4, 5, 6, 7, 8, 9)', { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }),
      ]),
      h('div', { padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, [
        text('Samsung Galaxy S20+', { fontSize: 15, fontWeight: 600, color: colors.background }),
        text('(S20, S21, S22, S23, S24, Z Fold/Flip)', { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }),
      ]),
      h('div', { padding: 14, backgroundColor: colors.primary, borderRadius: 12 }, [
        text('Not sure? Check in our app!', { fontSize: 14, fontWeight: 600, color: colors.foreground }),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Myth Busters Style
function MythBustersPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    padding: 28,
  }, [
    h('div', { padding: '8px 16px', backgroundColor: colors.destructive, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
      text('MYTH BUSTERS', { fontSize: 12, fontWeight: 700, color: colors.background })),
    text('eSIM Edition', { fontSize: 28, fontWeight: 900, color: colors.background, marginBottom: 24 }),
    h('div', { flex: 1, flexDirection: 'column', gap: 14 }, [
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.destructive, alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 14, color: colors.background })),
        h('div', { flex: 1 }, [
          text('"eSIMs are complicated"', { fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
          text('Scan a QR code. Thats it.', { fontSize: 14, fontWeight: 600, color: colors.primary, marginTop: 2 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.destructive, alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 14, color: colors.background })),
        h('div', { flex: 1 }, [
          text('"I need to unlock my phone"', { fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
          text('Nope! Works on carrier-locked phones', { fontSize: 14, fontWeight: 600, color: colors.primary, marginTop: 2 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.destructive, alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 14, color: colors.background })),
        h('div', { flex: 1 }, [
          text('"Ill lose my main number"', { fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
          text('Keep your number, add eSIM as second line', { fontSize: 14, fontWeight: 600, color: colors.primary, marginTop: 2 }),
        ]),
      ]),
      h('div', { flexDirection: 'row', gap: 12 }, [
        h('div', { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.destructive, alignItems: 'center', justifyContent: 'center' },
          Icons.XIcon({ size: 14, color: colors.background })),
        h('div', { flex: 1 }, [
          text('"Its too expensive"', { fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
          text('From $4.99. Save 90% vs roaming.', { fontSize: 14, fontWeight: 600, color: colors.primary, marginTop: 2 }),
        ]),
      ]),
    ]),
    h('div', { marginTop: 16 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// POV: You just discovered eSIM
function POVDiscoveryPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)`,
    padding: 28,
    alignItems: 'center',
  }, [
    h('div', { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 20 },
      text('POV', { fontSize: 14, fontWeight: 700, color: colors.background })),
    h('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      text('Me finding out I can get', { fontSize: 18, color: 'rgba(255,255,255,0.7)' }),
      text('mobile data in 150+ countries', { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }),
      text('WITHOUT', { fontSize: 32, fontWeight: 900, color: colors.destructive }),
      h('div', { flexDirection: 'column', alignItems: 'center', marginTop: 12, marginBottom: 20 }, [
        text('hunting for SIM cards', { fontSize: 18, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
        text('paying $300 roaming bills', { fontSize: 18, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
        text('being offline for hours', { fontSize: 18, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }),
      ]),
      text('Mind = Blown', { fontSize: 48, fontWeight: 900, color: colors.primary }),
    ]),
    h('div', { marginTop: 12 }, Logo({ size: 28, withText: true, dark: false })),
    WebsiteFooter({ dark: false, size: 'sm' }),
  ]);
}

// Instagram Reel/TikTok Hook Style
function HookPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    text('STOP', { fontSize: 64, fontWeight: 900, color: colors.destructive }),
    text('scrolling if you', { fontSize: 20, color: colors.background, marginTop: 8 }),
    text('travel internationally', { fontSize: 20, color: colors.background, marginBottom: 24 }),
    h('div', { width: '80%', height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 24 }),
    text('I saved $500 last year', { fontSize: 24, fontWeight: 600, color: colors.primary }),
    text('with this one app', { fontSize: 24, fontWeight: 600, color: colors.primary, marginBottom: 24 }),
    h('div', { padding: '16px 32px', backgroundColor: colors.primary, borderRadius: 28 },
      text('getlumbus.com', { fontSize: 18, fontWeight: 700, color: colors.foreground })),
    h('div', { marginTop: 24 }, Logo({ size: 32, withText: true, dark: false })),
  ]);
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

async function generateInstagramPosts(fonts) {
  console.log('\n   Instagram Square Posts (1080x1080)');
  const dim = dimensions.instagram.square;

  await generateImage(FeatureGridPost(), dim.width, dim.height, 'ig-post-features.png', fonts);
  await generateImage(StatsSocialProofPost(), dim.width, dim.height, 'ig-post-stats.png', fonts);
  await generateImage(HowItWorksPost(), dim.width, dim.height, 'ig-post-how-it-works.png', fonts);
  await generateImage(RoamingComparisonPost(), dim.width, dim.height, 'ig-post-comparison.png', fonts);
  await generateImage(PassportStampPost({ destinations: mockData.regions }), dim.width, dim.height, 'ig-post-passport.png', fonts);

  // Testimonials
  for (let i = 0; i < mockData.testimonials.length; i++) {
    await generateImage(
      TestimonialPost({ testimonial: mockData.testimonials[i] }),
      dim.width, dim.height, `ig-post-testimonial-${i + 1}.png`, fonts
    );
  }

  // Quotes
  for (let i = 0; i < 4; i++) {
    await generateImage(WanderlustQuotePost({ quoteIndex: i }), dim.width, dim.height, `ig-post-quote-${i + 1}.png`, fonts);
  }

  // Promo
  await generateImage(PromoPost({ discount: '20%', code: 'welcome20' }), dim.width, dim.height, 'ig-post-promo.png', fonts);

  // Destination spotlights
  const spotlightDestinations = ['Japan', 'Thailand', 'France', 'Australia', 'Italy', 'United States', 'Germany', 'Singapore'];
  for (const name of spotlightDestinations) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      const colorIndex = mockData.regions.indexOf(region) % colors.cardColors.length;
      await generateImage(
        DestinationSpotlightPost({ region, bgColor: colors.cardColors[colorIndex] }),
        dim.width, dim.height, `ig-post-${name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts
      );
    }
  }

  // Regional bundles
  for (const region of mockData.regionalPlans) {
    await generateImage(
      RegionalBundlePost({ region }),
      dim.width, dim.height, `ig-post-${region.name.toLowerCase().replace(/\s+/g, '-')}-bundle.png`, fonts
    );
  }

  // Feature highlights
  const featureHighlights = [
    { title: 'No Physical SIM', description: 'Activate your eSIM instantly without visiting a store', icon: Icons.PhoneIcon({ size: 60, color: colors.primary }), bgColor: colors.accent },
    { title: '24/7 Support', description: 'We\'re always here to help you stay connected', icon: Icons.ShieldIcon({ size: 60, color: colors.primary }), bgColor: colors.secondary },
    { title: 'Top Up Anytime', description: 'Need more data? Add it in seconds from the app', icon: Icons.RefreshIcon({ size: 60, color: colors.primary }), bgColor: colors.primary },
  ];
  for (let i = 0; i < featureHighlights.length; i++) {
    await generateImage(
      FeatureHighlightPost({ feature: featureHighlights[i] }),
      dim.width, dim.height, `ig-post-feature-${i + 1}.png`, fonts
    );
  }

  // Creative Fun Posts
  console.log('\n   Creative Posts (1080x1080)');

  // Boarding passes for popular destinations
  const boardingDestinations = ['Japan', 'Thailand', 'France', 'Australia'];
  for (const name of boardingDestinations) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      await generateImage(
        BoardingPassPost({ destination: region }),
        dim.width, dim.height, `ig-post-boarding-${name.toLowerCase()}.png`, fonts
      );
    }
  }

  // Travel bucket list
  await generateImage(BucketListPost(), dim.width, dim.height, 'ig-post-bucket-list.png', fonts);

  // Suitcase packing
  await generateImage(SuitcasePackingPost(), dim.width, dim.height, 'ig-post-packing.png', fonts);

  // World map pins
  await generateImage(WorldMapPinsPost(), dim.width, dim.height, 'ig-post-world-map.png', fonts);

  // Trip countdown for popular destinations
  for (const name of ['Japan', 'France']) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      await generateImage(
        TripCountdownPost({ destination: region }),
        dim.width, dim.height, `ig-post-countdown-${name.toLowerCase()}.png`, fonts
      );
    }
  }

  // Before/After transformation
  await generateImage(BeforeAfterPost(), dim.width, dim.height, 'ig-post-before-after.png', fonts);

  // Travel mood posts
  for (const mood of ['adventure', 'relax', 'explore', 'connect']) {
    await generateImage(
      TravelMoodPost({ mood }),
      dim.width, dim.height, `ig-post-mood-${mood}.png`, fonts
    );
  }

  // Data visualization
  await generateImage(DataVisualizationPost(), dim.width, dim.height, 'ig-post-data-usage.png', fonts);

  // Photo dump style
  await generateImage(PhotoDumpPost(), dim.width, dim.height, 'ig-post-photo-dump.png', fonts);

  // ===== SUPER FUN TRENDY POSTS =====
  console.log('\n   Super Fun Trendy Posts (1080x1080)');

  // Flying plane posts
  for (const name of ['Japan', 'Thailand', 'France']) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      await generateImage(
        FlyingPlanePost({ destination: region }),
        dim.width, dim.height, `ig-post-flying-${name.toLowerCase()}.png`, fonts
      );
    }
  }

  // POV posts (TikTok trendy style)
  for (const scenario of ['landing', 'roaming', 'connected', 'smart']) {
    await generateImage(
      POVPost({ scenario }),
      dim.width, dim.height, `ig-post-pov-${scenario}.png`, fonts
    );
  }

  // Airport departure board
  await generateImage(DepartureBoardPost(), dim.width, dim.height, 'ig-post-departures.png', fonts);

  // Luggage tags
  for (const name of ['Japan', 'France']) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      await generateImage(
        LuggageTagPost({ destination: region }),
        dim.width, dim.height, `ig-post-tag-${name.toLowerCase()}.png`, fonts
      );
    }
  }

  // Text message style
  await generateImage(TextMessagePost(), dim.width, dim.height, 'ig-post-messages.png', fonts);

  // Notification style
  await generateImage(NotificationPost(), dim.width, dim.height, 'ig-post-notifications.png', fonts);

  // Polaroid stack
  await generateImage(PolaroidStackPost(), dim.width, dim.height, 'ig-post-polaroids.png', fonts);

  // Travel bingo
  await generateImage(TravelBingoPost(), dim.width, dim.height, 'ig-post-bingo.png', fonts);

  // This or that
  await generateImage(ThisOrThatPost(), dim.width, dim.height, 'ig-post-this-or-that.png', fonts);

  // Meme style
  await generateImage(MemeNobodyPost(), dim.width, dim.height, 'ig-post-meme.png', fonts);

  // Receipt style
  await generateImage(ReceiptPost(), dim.width, dim.height, 'ig-post-receipt.png', fonts);

  // Glassmorphism
  await generateImage(GlassPost(), dim.width, dim.height, 'ig-post-glass.png', fonts);

  // Retro travel posters
  for (const name of ['Japan', 'France', 'Thailand']) {
    const region = mockData.regions.find(r => r.name === name);
    if (region) {
      await generateImage(
        RetroTravelPost({ destination: region }),
        dim.width, dim.height, `ig-post-retro-${name.toLowerCase()}.png`, fonts
      );
    }
  }

  // Savings meter
  await generateImage(SavingsMeterPost(), dim.width, dim.height, 'ig-post-savings-meter.png', fonts);

  // Split screen
  await generateImage(SplitScreenPost(), dim.width, dim.height, 'ig-post-split.png', fonts);

  // Flash sale
  await generateImage(FlashSalePost(), dim.width, dim.height, 'ig-post-flash-sale.png', fonts);

  // Typography posts
  const typoMessages = [
    { line1: 'TRAVEL', line2: 'WITHOUT', line3: 'LIMITS' },
    { line1: 'STAY', line2: 'CONNECTED', line3: 'ABROAD' },
    { line1: 'DATA', line2: 'NOT', line3: 'DRAMA' },
    { line1: 'ROAM', line2: 'FREE', line3: 'SAVE BIG' },
  ];
  for (let i = 0; i < typoMessages.length; i++) {
    await generateImage(
      TypographyPost(typoMessages[i]),
      dim.width, dim.height, `ig-post-typo-${i + 1}.png`, fonts
    );
  }

  // Loading progress
  await generateImage(LoadingProgressPost(), dim.width, dim.height, 'ig-post-loading.png', fonts);

  // ===== VIRAL ULTRA CREATIVE POSTS =====
  console.log('\n   Viral Creative Posts (1080x1080)');

  // Spotify Wrapped style
  await generateImage(SpotifyWrappedPost(), dim.width, dim.height, 'ig-post-wrapped.png', fonts);

  // iPhone Lock Screen
  const japanRegion = mockData.regions.find(r => r.name === 'Japan');
  if (japanRegion) {
    await generateImage(LockScreenPost({ destination: japanRegion }), dim.width, dim.height, 'ig-post-lockscreen.png', fonts);
  }

  // Tinder Swipe
  await generateImage(TinderSwipePost(), dim.width, dim.height, 'ig-post-tinder.png', fonts);

  // Netflix Style
  await generateImage(NetflixStylePost(), dim.width, dim.height, 'ig-post-netflix.png', fonts);

  // Achievement Unlocked
  await generateImage(AchievementPost(), dim.width, dim.height, 'ig-post-achievement.png', fonts);

  // Calculator
  await generateImage(CalculatorPost(), dim.width, dim.height, 'ig-post-calculator.png', fonts);

  // Tweet/X Style
  await generateImage(TweetStylePost(), dim.width, dim.height, 'ig-post-tweet.png', fonts);

  // Movie Poster
  await generateImage(MoviePosterPost(), dim.width, dim.height, 'ig-post-movie.png', fonts);

  // Duolingo Style
  await generateImage(DuolingoStylePost(), dim.width, dim.height, 'ig-post-duolingo.png', fonts);

  // Newspaper
  await generateImage(NewspaperPost(), dim.width, dim.height, 'ig-post-newspaper.png', fonts);

  // Battery Charging
  await generateImage(BatteryChargingPost(), dim.width, dim.height, 'ig-post-battery.png', fonts);

  // Album Cover
  await generateImage(AlbumCoverPost(), dim.width, dim.height, 'ig-post-album.png', fonts);

  // Fortune Cookie
  await generateImage(FortuneCookiePost(), dim.width, dim.height, 'ig-post-fortune.png', fonts);

  // ===== MEGA VIRAL TRENDY POSTS =====
  console.log('\n   Mega Viral Trendy Posts (1080x1080)');

  // Group Chat
  await generateImage(GroupChatPost(), dim.width, dim.height, 'ig-post-groupchat.png', fonts);

  // Delivery Style
  await generateImage(DeliveryStylePost(), dim.width, dim.height, 'ig-post-delivery.png', fonts);

  // Playlist Style
  await generateImage(PlaylistStylePost(), dim.width, dim.height, 'ig-post-playlist.png', fonts);

  // Neon Sign
  await generateImage(NeonSignPost(), dim.width, dim.height, 'ig-post-neon.png', fonts);

  // VHS Style
  await generateImage(VHSPost(), dim.width, dim.height, 'ig-post-vhs.png', fonts);

  // Screen Time
  await generateImage(ScreenTimePost(), dim.width, dim.height, 'ig-post-screentime.png', fonts);

  // Trip Complete (Strava style)
  await generateImage(TripCompletePost({ destination: japanRegion }), dim.width, dim.height, 'ig-post-trip-complete.png', fonts);

  // Song Card
  await generateImage(SongCardPost(), dim.width, dim.height, 'ig-post-songcard.png', fonts);

  // Widget Style
  await generateImage(WidgetStylePost(), dim.width, dim.height, 'ig-post-widget.png', fonts);

  // Wanted Poster
  await generateImage(WantedPosterPost(), dim.width, dim.height, 'ig-post-wanted.png', fonts);

  // Error 404
  await generateImage(Error404Post(), dim.width, dim.height, 'ig-post-404.png', fonts);

  // Dating Profile
  await generateImage(DatingProfilePost(), dim.width, dim.height, 'ig-post-dating.png', fonts);

  // Drake Meme
  await generateImage(DrakeMemePost(), dim.width, dim.height, 'ig-post-drake.png', fonts);

  // Spotify Stats
  await generateImage(SpotifyStatsPost(), dim.width, dim.height, 'ig-post-spotify-stats.png', fonts);

  // Insights
  await generateImage(InsightsPost(), dim.width, dim.height, 'ig-post-insights.png', fonts);

  // ===== ULTRA TRENDING COUNTRY POSTS =====
  console.log('\n   Ultra Trending Country Posts (1080x1080)');

  // BeReal for multiple countries
  const beRealCountries = ['Japan', 'Thailand', 'France', 'Italy', 'Australia', 'South Korea'];
  for (const countryName of beRealCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(BeRealPost({ destination: country }), dim.width, dim.height, `ig-post-bereal-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Wordle
  await generateImage(WordlePost(), dim.width, dim.height, 'ig-post-wordle.png', fonts);

  // Maps Review for multiple countries
  const mapsCountries = ['Japan', 'Thailand', 'Germany', 'Spain'];
  for (const countryName of mapsCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(MapsReviewPost({ destination: country }), dim.width, dim.height, `ig-post-maps-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // FaceTime for multiple countries
  const facetimeCountries = ['Japan', 'France', 'Australia'];
  for (const countryName of facetimeCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(FaceTimePost({ destination: country }), dim.width, dim.height, `ig-post-facetime-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Uber Rating
  const uberCountries = ['Japan', 'Thailand', 'Italy'];
  for (const countryName of uberCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(UberRatingPost({ destination: country }), dim.width, dim.height, `ig-post-uber-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Pinterest
  const pinterestCountries = ['Japan', 'France', 'Italy', 'Spain', 'Thailand'];
  for (const countryName of pinterestCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(PinterestPost({ destination: country }), dim.width, dim.height, `ig-post-pinterest-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // YouTube
  const youtubeCountries = ['Japan', 'Thailand', 'Australia', 'Germany'];
  for (const countryName of youtubeCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(YouTubePost({ destination: country }), dim.width, dim.height, `ig-post-youtube-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Discord
  await generateImage(DiscordPost(), dim.width, dim.height, 'ig-post-discord.png', fonts);

  // Slack
  const slackCountries = ['Japan', 'United Kingdom'];
  for (const countryName of slackCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(SlackPost({ destination: country }), dim.width, dim.height, `ig-post-slack-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Notes App
  const notesCountries = ['Japan', 'Italy', 'Thailand', 'France'];
  for (const countryName of notesCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(NotesAppPost({ destination: country }), dim.width, dim.height, `ig-post-notes-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Weather App
  const weatherCountries = ['Japan', 'Thailand', 'Australia'];
  for (const countryName of weatherCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(WeatherPost({ destination: country }), dim.width, dim.height, `ig-post-weather-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // App Store Review
  const reviewCountries = ['Japan', 'Thailand', 'France', 'Germany', 'Australia'];
  for (const countryName of reviewCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(AppStoreReviewPost({ destination: country }), dim.width, dim.height, `ig-post-appstore-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Calendar
  const calendarCountries = ['Japan', 'France', 'Italy'];
  for (const countryName of calendarCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(CalendarPost({ destination: country }), dim.width, dim.height, `ig-post-calendar-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Podcast
  await generateImage(PodcastPost({ destination: japanRegion }), dim.width, dim.height, 'ig-post-podcast.png', fonts);

  // Snapchat
  const snapCountries = ['Japan', 'Thailand', 'France', 'Australia'];
  for (const countryName of snapCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(SnapchatPost({ destination: country }), dim.width, dim.height, `ig-post-snapchat-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Reddit
  const redditCountries = ['Japan', 'Thailand', 'Germany'];
  for (const countryName of redditCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(RedditPost({ destination: country }), dim.width, dim.height, `ig-post-reddit-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // WhatsApp
  const whatsappCountries = ['Japan', 'Thailand', 'France', 'Italy', 'Spain'];
  for (const countryName of whatsappCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(WhatsAppPost({ destination: country }), dim.width, dim.height, `ig-post-whatsapp-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // Airline Ticket
  const ticketCountries = ['Japan', 'Thailand', 'France', 'Australia', 'Italy', 'Germany'];
  for (const countryName of ticketCountries) {
    const country = mockData.regions.find(r => r.name === countryName);
    if (country) {
      await generateImage(AirlineTicketPost({ destination: country }), dim.width, dim.height, `ig-post-ticket-${countryName.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
    }
  }

  // ===== EDUCATIONAL FUN POSTS =====
  console.log('\n   Educational Fun Posts (1080x1080)');

  // What is eSIM explainer
  await generateImage(WhatIsEsimPost(), dim.width, dim.height, 'ig-post-what-is-esim.png', fonts);

  // How To Steps (carousel slides)
  await generateImage(HowToStep1Post(), dim.width, dim.height, 'ig-post-howto-1.png', fonts);
  await generateImage(HowToStep2Post(), dim.width, dim.height, 'ig-post-howto-2.png', fonts);
  await generateImage(HowToStep3Post(), dim.width, dim.height, 'ig-post-howto-3.png', fonts);

  // eSIM vs Physical SIM comparison
  await generateImage(EsimVsSimPost(), dim.width, dim.height, 'ig-post-esim-vs-sim.png', fonts);

  // FAQ: Does my phone support eSIM?
  await generateImage(DoesMyPhoneSupportPost(), dim.width, dim.height, 'ig-post-phone-support.png', fonts);

  // Myth Busters
  await generateImage(MythBustersPost(), dim.width, dim.height, 'ig-post-myths.png', fonts);

  // POV Discovery
  await generateImage(POVDiscoveryPost(), dim.width, dim.height, 'ig-post-pov-discovery.png', fonts);

  // Hook Post
  await generateImage(HookPost(), dim.width, dim.height, 'ig-post-hook.png', fonts);
}

async function generateInstagramPortrait(fonts) {
  console.log('\n   Instagram Portrait (1080x1350)');
  const dim = dimensions.instagram.portrait;

  const destinations = mockData.regions.slice(0, 3);
  for (const dest of destinations) {
    await generateImage(
      AirplaneWindowPost({ destination: dest }),
      dim.width, dim.height, `ig-portrait-airplane-${dest.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts
    );
  }
}

async function generateInstagramStories(fonts) {
  console.log('\n   Instagram Stories (1080x1920)');
  const dim = dimensions.instagram.story;

  const stories = [
    { headline: 'Data Without Borders', subheadline: 'eSIM for 150+ countries', phone: BrowseScreen({ scale: 0.75 }) },
    { headline: 'Track Your Data', subheadline: 'Real-time usage monitoring', phone: DashboardScreen({ scale: 0.75 }) },
    { headline: 'Never Miss a Moment', subheadline: 'Stay connected abroad', phone: BrowseScreen({ scale: 0.75 }) },
    { headline: 'Instant Activation', subheadline: 'Setup in under 2 minutes', phone: DashboardScreen({ scale: 0.75 }) },
    { headline: 'Save 90% on Roaming', subheadline: 'vs carrier fees', phone: BrowseScreen({ scale: 0.75 }) },
  ];

  for (let i = 0; i < stories.length; i++) {
    await generateImage(
      StoryTemplate(stories[i]),
      dim.width, dim.height, `story-${i + 1}.png`, fonts
    );
  }
}

async function generateTikTokAssets(fonts) {
  console.log('\n   TikTok Assets (1080x1920)');
  const dim = dimensions.tiktok.video;

  const covers = [
    { headline: 'POV: No More Roaming Fees', subheadline: 'This app changed travel', phone: BrowseScreen({ scale: 0.75 }) },
    { headline: 'Travel Hack You Need', subheadline: 'Save 90% on data abroad', phone: DashboardScreen({ scale: 0.75 }) },
    { headline: 'Stop Buying Airport SIMs', subheadline: 'There\'s a better way', phone: BrowseScreen({ scale: 0.75 }) },
    { headline: 'How I Stay Connected', subheadline: 'In 150+ countries', phone: DashboardScreen({ scale: 0.75 }) },
    { headline: 'Digital Nomad Essential', subheadline: 'Work from anywhere', phone: BrowseScreen({ scale: 0.75 }) },
  ];

  for (let i = 0; i < covers.length; i++) {
    await generateImage(
      StoryTemplate(covers[i]),
      dim.width, dim.height, `tiktok-cover-${i + 1}.png`, fonts
    );
  }
}

async function generateCarouselSlides(fonts) {
  console.log('\n   Carousel Slides (1080x1080)');
  const dim = dimensions.instagram.square;

  const benefits = [
    { icon: Icons.GlobeIcon({ size: 72, color: colors.foreground }), title: '150+ Countries', description: 'One app for worldwide connectivity', color: colors.primary },
    { icon: Icons.LightningIcon({ size: 72, color: colors.foreground }), title: 'Instant Setup', description: 'Activate in under 2 minutes', color: colors.secondary },
    { icon: Icons.WalletIcon({ size: 72, color: colors.foreground }), title: 'Save 90%', description: 'vs carrier roaming fees', color: colors.accent },
    { icon: Icons.PhoneIcon({ size: 72, color: colors.foreground }), title: 'Keep Your Number', description: 'Dual SIM technology', color: colors.purple },
    { icon: Icons.RefreshIcon({ size: 72, color: colors.foreground }), title: 'Top Up Anytime', description: 'Add data when you need it', color: colors.mint },
    { icon: Icons.ShieldIcon({ size: 72, color: colors.foreground }), title: 'Secure & Private', description: 'Your data stays safe', color: colors.primary },
  ];

  for (let i = 0; i < benefits.length; i++) {
    await generateImage(
      CarouselBenefitSlide({ benefit: benefits[i], slideNum: i + 1, totalSlides: benefits.length }),
      dim.width, dim.height, `carousel-${i + 1}.png`, fonts
    );
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n  LUMBUS MARKETING ASSET GENERATOR');
  console.log('  ' + '='.repeat(40));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('\n   Loading assets...');
  await loadLogo();
  const fonts = await loadFonts();
  console.log('   Assets ready');

  await generateInstagramPosts(fonts);
  await generateInstagramPortrait(fonts);
  await generateInstagramStories(fonts);
  await generateTikTokAssets(fonts);
  await generateCarouselSlides(fonts);

  const files = await fs.readdir(OUTPUT_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  console.log('\n  ' + '='.repeat(40));
  console.log(`  Generated ${pngFiles.length} marketing assets!`);
  console.log('  Output: marketing/output/');
  console.log('  ' + '='.repeat(40) + '\n');
}

main().catch(console.error);
