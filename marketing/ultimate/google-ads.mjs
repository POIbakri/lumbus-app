/**
 * LUMBUS GOOGLE ADS - Multi-Country Format
 *
 * Features multiple countries with flags and pricing
 * Sizes: 1200x628 (Landscape), 1080x1080 (Square), 300x250 (Medium Rectangle)
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// OFFICIAL COLORWAY
const c = {
  turquoise: '#2EFECC',
  yellow: '#FDFD74',
  cyan: '#87EFFF',
  white: '#FFFFFF',
  black: '#1A1A1A',
  dark: '#0A0A0A',
};

const DIM = {
  LANDSCAPE: { w: 1200, h: 628 },
  SQUARE: { w: 1200, h: 1200 },
  PORTRAIT: { w: 960, h: 1200 },
};

let logoIcon = null;
const flags = {};

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {
    console.log('   ○ Icon logo not found');
  }

  const codes = ['gb', 'us', 'ae', 'fr', 'th'];
  for (const code of codes) {
    try {
      const res = await fetch(`https://flagcdn.com/w320/${code}.png`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        flags[code] = `data:image/png;base64,${buf.toString('base64')}`;
        console.log(`   ✓ Flag ${code.toUpperCase()} loaded`);
      }
    } catch (e) {
      console.log(`   ○ Flag ${code} error`);
    }
  }
}

async function loadFonts() {
  const fontUrls = {
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };

  const fontData = {};
  for (const [name, url] of Object.entries(fontUrls)) {
    const response = await fetch(url);
    fontData[name] = Buffer.from(await response.arrayBuffer());
  }

  return [
    { name: 'Inter', data: fontData.medium, weight: 500, style: 'normal' },
    { name: 'Inter', data: fontData.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fontData.black, weight: 900, style: 'normal' },
  ];
}

const el = (type, style, children) => ({
  type,
  props: {
    style: { display: 'flex', ...style },
    children: Array.isArray(children) ? children.filter(c => c != null) : children,
  },
});

const txt = (content, style = {}) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: String(content) }
});

const img = (src, style = {}) => src ? ({
  type: 'img',
  props: { src, style }
}) : null;

// Country card component
function CountryCard({ name, code, price, size = 'normal' }) {
  const flag = flags[code];
  const isSmall = size === 'small';
  const isTiny = size === 'tiny';

  return el('div', {
    flexDirection: 'column',
    alignItems: 'center',
    padding: isTiny ? 8 : isSmall ? 12 : 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: isTiny ? 12 : isSmall ? 16 : 20,
    gap: isTiny ? 4 : isSmall ? 6 : 10,
  }, [
    // Flag
    flag ? el('div', {
      width: isTiny ? 40 : isSmall ? 56 : 80,
      height: isTiny ? 28 : isSmall ? 38 : 54,
      borderRadius: isTiny ? 4 : isSmall ? 6 : 8,
      overflow: 'hidden',
    }, [
      img(flag, { width: '100%', height: '100%', objectFit: 'cover' }),
    ]) : null,
    // Country name
    txt(name, {
      fontSize: isTiny ? 10 : isSmall ? 12 : 16,
      fontWeight: 700,
      color: c.white,
    }),
    // Price
    txt(price, {
      fontSize: isTiny ? 12 : isSmall ? 16 : 22,
      fontWeight: 900,
      color: c.turquoise,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// LANDSCAPE AD (1200x628) - Best for Google Display
// ═══════════════════════════════════════════════════════════════════════════

function LandscapeAd() {
  const countries = [
    { name: 'UK', code: 'gb', price: '$1.99' },
    { name: 'USA', code: 'us', price: '$2.99' },
    { name: 'UAE', code: 'ae', price: '$1.99' },
    { name: 'France', code: 'fr', price: '$1.99' },
    { name: 'Thailand', code: 'th', price: '$1.99' },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'row',
    padding: 40,
    gap: 40,
  }, [
    // Left side - Branding
    el('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    }, [
      logoIcon ? img(logoIcon, { width: 64, height: 64, marginBottom: 20 }) : null,
      txt('eSIM Data Plans', {
        fontSize: 14,
        fontWeight: 700,
        color: c.turquoise,
        letterSpacing: 2,
        marginBottom: 8,
      }),
      txt('TRAVEL', {
        fontSize: 56,
        fontWeight: 900,
        color: c.white,
        lineHeight: 0.95,
      }),
      txt('CONNECTED', {
        fontSize: 56,
        fontWeight: 900,
        color: c.white,
        lineHeight: 0.95,
        marginBottom: 24,
      }),
      txt('150+ Countries • Instant Setup', {
        fontSize: 16,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 24,
      }),
      el('div', {
        padding: '14px 32px',
        backgroundColor: c.turquoise,
        borderRadius: 100,
        alignSelf: 'flex-start',
      }, [
        txt('Get Started', { fontSize: 16, fontWeight: 900, color: c.black }),
      ]),
    ]),
    // Right side - Country cards
    el('div', {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 12,
    }, [
      // Top row - 3 countries
      el('div', { flexDirection: 'row', gap: 12 }, [
        CountryCard(countries[0]),
        CountryCard(countries[1]),
        CountryCard(countries[2]),
      ]),
      // Bottom row - 2 countries
      el('div', { flexDirection: 'row', gap: 12, justifyContent: 'center' }, [
        CountryCard(countries[3]),
        CountryCard(countries[4]),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// SQUARE AD (1080x1080) - Instagram/Facebook
// ═══════════════════════════════════════════════════════════════════════════

function SquareAd() {
  const countries = [
    { name: 'UK', code: 'gb', price: '$1.99' },
    { name: 'USA', code: 'us', price: '$2.99' },
    { name: 'UAE', code: 'ae', price: '$1.99' },
    { name: 'France', code: 'fr', price: '$1.99' },
    { name: 'Thailand', code: 'th', price: '$1.99' },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    padding: 60,
  }, [
    // Header
    el('div', {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
    }, [
      logoIcon ? img(logoIcon, { width: 56, height: 56 }) : null,
      txt('getlumbus.com', { fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }),
    ]),
    // Title
    el('div', {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 48,
    }, [
      el('div', {
        padding: '10px 24px',
        backgroundColor: c.turquoise,
        borderRadius: 100,
        marginBottom: 20,
      }, [
        txt('eSIM DATA PLANS', { fontSize: 14, fontWeight: 900, color: c.black, letterSpacing: 2 }),
      ]),
      txt('Travel to 150+ Countries', {
        fontSize: 40,
        fontWeight: 900,
        color: c.white,
        textAlign: 'center',
      }),
    ]),
    // Country grid - 5 countries
    el('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 16,
    }, [
      // Top row - 3 countries
      el('div', { flexDirection: 'row', gap: 16, justifyContent: 'center' }, [
        CountryCard({ ...countries[0], size: 'normal' }),
        CountryCard({ ...countries[1], size: 'normal' }),
        CountryCard({ ...countries[2], size: 'normal' }),
      ]),
      // Bottom row - 2 countries
      el('div', { flexDirection: 'row', gap: 16, justifyContent: 'center' }, [
        CountryCard({ ...countries[3], size: 'normal' }),
        CountryCard({ ...countries[4], size: 'normal' }),
      ]),
    ]),
    // CTA
    el('div', {
      alignItems: 'center',
      marginTop: 40,
    }, [
      el('div', {
        padding: '18px 48px',
        backgroundColor: c.white,
        borderRadius: 100,
      }, [
        txt('Download Free App', { fontSize: 20, fontWeight: 900, color: c.black }),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTRAIT AD (960x1200)
// ═══════════════════════════════════════════════════════════════════════════

function PortraitAd() {
  const countries = [
    { name: 'UK', code: 'gb', price: '$1.99' },
    { name: 'USA', code: 'us', price: '$2.99' },
    { name: 'UAE', code: 'ae', price: '$1.99' },
    { name: 'France', code: 'fr', price: '$1.99' },
    { name: 'Thailand', code: 'th', price: '$1.99' },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    padding: 50,
  }, [
    // Header
    el('div', {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 50,
    }, [
      logoIcon ? img(logoIcon, { width: 52, height: 52 }) : null,
      txt('getlumbus.com', { fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }),
    ]),
    // Title
    el('div', {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 50,
    }, [
      el('div', {
        padding: '10px 24px',
        backgroundColor: c.turquoise,
        borderRadius: 100,
        marginBottom: 20,
      }, [
        txt('eSIM DATA PLANS', { fontSize: 13, fontWeight: 900, color: c.black, letterSpacing: 2 }),
      ]),
      txt('Travel to', {
        fontSize: 36,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.7)',
      }),
      txt('150+ Countries', {
        fontSize: 44,
        fontWeight: 900,
        color: c.white,
      }),
    ]),
    // Country grid - 5 countries
    el('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 14,
    }, [
      // Top row - 3 countries
      el('div', { flexDirection: 'row', gap: 14, justifyContent: 'center' }, [
        CountryCard({ ...countries[0], size: 'normal' }),
        CountryCard({ ...countries[1], size: 'normal' }),
        CountryCard({ ...countries[2], size: 'normal' }),
      ]),
      // Bottom row - 2 countries
      el('div', { flexDirection: 'row', gap: 14, justifyContent: 'center' }, [
        CountryCard({ ...countries[3], size: 'normal' }),
        CountryCard({ ...countries[4], size: 'normal' }),
      ]),
    ]),
    // CTA
    el('div', {
      alignItems: 'center',
      marginTop: 40,
    }, [
      el('div', {
        padding: '18px 48px',
        backgroundColor: c.white,
        borderRadius: 100,
      }, [
        txt('Download Free App', { fontSize: 18, fontWeight: 900, color: c.black }),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateImage(element, width, height, filename, fonts) {
  try {
    const svg = await satori(element, { width, height, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
    const pngBuffer = resvg.render().asPng();
    await fs.writeFile(path.join(OUTPUT, filename), pngBuffer);
    console.log(`   ✓ ${filename}`);
    return true;
  } catch (e) {
    console.error(`   ✗ ${filename}: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log('  ║   LUMBUS GOOGLE ADS - Multi-Country                           ║');
  console.log('  ║   UK • USA • UAE • France • Thailand                          ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await fs.mkdir(OUTPUT, { recursive: true });

  console.log('  Loading assets...');
  await loadAssets();
  const fonts = await loadFonts();
  console.log('');

  console.log('  Generating Google Ads...');
  console.log('  ─────────────────────────────────────────────');

  await generateImage(LandscapeAd(), DIM.LANDSCAPE.w, DIM.LANDSCAPE.h, 'gads-landscape-1200x628.png', fonts);
  await generateImage(SquareAd(), DIM.SQUARE.w, DIM.SQUARE.h, 'gads-square-1200x1200.png', fonts);
  await generateImage(PortraitAd(), DIM.PORTRAIT.w, DIM.PORTRAIT.h, 'gads-portrait-960x1200.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   GOOGLE ADS COMPLETE!                                        ║');
  console.log('  ║                                                               ║');
  console.log('  ║   • Landscape  1200x628  (1.91:1)                             ║');
  console.log('  ║   • Square     1200x1200 (1:1)                                ║');
  console.log('  ║   • Portrait   960x1200  (4:5)                                ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/gads-*.png                ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
