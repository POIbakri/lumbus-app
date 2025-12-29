/**
 * LUMBUS COUNTRY PLAN POSTS
 *
 * Premium country-specific eSIM plan advertisements
 * - Large flag backgrounds with overlay
 * - Clean pricing display
 * - Icon logo + getlumbus.com branding
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
  purple: '#F7E2FB',
  mint: '#E0FEF7',
  white: '#FFFFFF',
  black: '#1A1A1A',
  dark: '#0A0A0A',
  mutedText: '#666666',
};

const DIM = {
  PORTRAIT: { w: 1080, h: 1350 },
  STORY: { w: 1080, h: 1920 },
};

let logoIcon = null;
const flags = {};

async function loadAssets() {
  // Load icon logo
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {
    console.log('   ○ Icon logo not found');
  }

  // Load country flags
  const codes = ['ru', 'us', 'ae', 'gb'];
  for (const code of codes) {
    try {
      const res = await fetch(`https://flagcdn.com/w1280/${code}.png`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        flags[code] = `data:image/png;base64,${buf.toString('base64')}`;
        console.log(`   ✓ Flag ${code.toUpperCase()} loaded`);
      } else {
        console.log(`   ○ Flag ${code} failed: ${res.status}`);
      }
    } catch (e) {
      console.log(`   ○ Flag ${code} error: ${e.message}`);
    }
  }
}

async function loadFonts() {
  const fontUrls = {
    regular: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff',
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
    { name: 'Inter', data: fontData.regular, weight: 400, style: 'normal' },
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

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRY PLAN POST - Premium Design
// ═══════════════════════════════════════════════════════════════════════════

function CountryPlanPost({ country, code, price, format = 'portrait' }) {
  const isStory = format === 'story';
  const flag = flags[code];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Flag background - contains full flag centered
    flag ? el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      img(flag, {
        width: '120%',
        height: '120%',
        objectFit: 'contain',
        opacity: 0.55,
      }),
    ]) : null,

    // Dark overlay for readability
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    }, []),

    // Content
    el('div', {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      padding: isStory ? 70 : 60,
      position: 'relative',
    }, [
      // Header - Logo + URL
      el('div', {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, {
          width: isStory ? 56 : 48,
          height: isStory ? 56 : 48,
        }) : null,
        txt('getlumbus.com', {
          fontSize: isStory ? 18 : 16,
          fontWeight: 700,
          color: c.white,
          opacity: 0.7,
        }),
      ]),

      // Main Content - Centered
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // eSIM Label
        el('div', {
          padding: '12px 28px',
          backgroundColor: c.turquoise,
          borderRadius: 100,
          marginBottom: isStory ? 40 : 32,
        }, [
          txt('eSIM DATA PLAN', {
            fontSize: isStory ? 16 : 14,
            fontWeight: 900,
            color: c.black,
            letterSpacing: 3,
          }),
        ]),

        // Country Name
        txt(country.toUpperCase(), {
          fontSize: isStory ? 120 : 100,
          fontWeight: 900,
          color: c.white,
          letterSpacing: -4,
          textAlign: 'center',
          lineHeight: 0.9,
          marginBottom: isStory ? 48 : 40,
        }),

        // Price Box
        el('div', {
          flexDirection: 'column',
          alignItems: 'center',
          padding: isStory ? '40px 60px' : '32px 48px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 32,
          marginBottom: isStory ? 40 : 32,
        }, [
          txt('STARTING FROM', {
            fontSize: isStory ? 14 : 12,
            fontWeight: 700,
            color: c.white,
            opacity: 0.6,
            letterSpacing: 3,
            marginBottom: 8,
          }),
          el('div', {
            flexDirection: 'row',
            alignItems: 'baseline',
          }, [
            txt(price, {
              fontSize: isStory ? 80 : 68,
              fontWeight: 900,
              color: c.white,
            }),
            txt(' USD', {
              fontSize: isStory ? 24 : 20,
              fontWeight: 700,
              color: c.turquoise,
              marginLeft: 8,
            }),
          ]),
        ]),

        // Features
        el('div', {
          flexDirection: 'row',
          gap: isStory ? 40 : 32,
        }, [
          el('div', { alignItems: 'center' }, [
            txt('5G/LTE', {
              fontSize: isStory ? 20 : 18,
              fontWeight: 900,
              color: c.white,
            }),
            txt('Speed', {
              fontSize: 12,
              fontWeight: 600,
              color: c.white,
              opacity: 0.5,
            }),
          ]),
          el('div', { alignItems: 'center' }, [
            txt('INSTANT', {
              fontSize: isStory ? 20 : 18,
              fontWeight: 900,
              color: c.white,
            }),
            txt('Activation', {
              fontSize: 12,
              fontWeight: 600,
              color: c.white,
              opacity: 0.5,
            }),
          ]),
          el('div', { alignItems: 'center' }, [
            txt('24/7', {
              fontSize: isStory ? 20 : 18,
              fontWeight: 900,
              color: c.white,
            }),
            txt('Support', {
              fontSize: 12,
              fontWeight: 600,
              color: c.white,
              opacity: 0.5,
            }),
          ]),
        ]),
      ]),

      // Footer - CTA
      el('div', {
        width: '100%',
        alignItems: 'center',
      }, [
        el('div', {
          padding: '20px 56px',
          backgroundColor: c.white,
          borderRadius: 100,
        }, [
          txt('GET YOUR eSIM', {
            fontSize: isStory ? 20 : 18,
            fontWeight: 900,
            color: c.black,
          }),
        ]),
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
  console.log('  ║   LUMBUS COUNTRY PLAN POSTS                                   ║');
  console.log('  ║   Russia • USA • UAE                                          ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await fs.mkdir(OUTPUT, { recursive: true });

  console.log('  Loading assets...');
  await loadAssets();
  const fonts = await loadFonts();
  console.log('');

  const PT = DIM.PORTRAIT;
  const ST = DIM.STORY;

  // Country data
  const countries = [
    { country: 'Russia', code: 'ru', price: '$2.99' },
    { country: 'USA', code: 'us', price: '$2.99' },
    { country: 'UAE', code: 'ae', price: '$1.99' },
    { country: 'UK', code: 'gb', price: '$1.99' },
  ];

  console.log('  Generating Country Plan Posts...');
  console.log('  ─────────────────────────────────────────────');

  for (const data of countries) {
    // Instagram (Portrait)
    await generateImage(
      CountryPlanPost({ ...data, format: 'portrait' }),
      PT.w, PT.h,
      `country-${data.code}-ig.png`,
      fonts
    );
    // TikTok/Stories
    await generateImage(
      CountryPlanPost({ ...data, format: 'story' }),
      ST.w, ST.h,
      `country-${data.code}-tiktok.png`,
      fonts
    );
  }

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   COUNTRY POSTS COMPLETE!                                     ║');
  console.log('  ║                                                               ║');
  console.log('  ║   • Russia  - $2.99                                           ║');
  console.log('  ║   • USA     - $2.99                                           ║');
  console.log('  ║   • UAE     - $1.99                                           ║');
  console.log('  ║   • UK      - $1.99                                           ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/country-*.png             ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
