/**
 * LUMBUS WELCOME20 PROMO - 3 Post Series
 *
 * 20% OFF with code WELCOME20
 * Background: Mosaic of country flags
 * Colors: Yellow → Cyan → Turquoise
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
  PORTRAIT: { w: 1080, h: 1350 },
  STORY: { w: 1080, h: 1920 },
};

let logoIcon = null;
const flags = {};

// Load lots of flags for the mosaic
const FLAG_CODES = [
  'us', 'gb', 'fr', 'de', 'it', 'es', 'jp', 'kr', 'th', 'ae',
  'au', 'ca', 'br', 'mx', 'sg', 'id', 'vn', 'tr', 'nl', 'ch',
  'se', 'no', 'dk', 'fi', 'pt', 'gr', 'pl', 'cz', 'at', 'be',
];

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {
    console.log('   ○ Icon logo not found');
  }

  // Load flags for mosaic
  console.log('   Loading flags for mosaic...');
  for (const code of FLAG_CODES) {
    try {
      const res = await fetch(`https://flagcdn.com/w160/${code}.png`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        flags[code] = `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch (e) {}
  }
  console.log(`   ✓ ${Object.keys(flags).length} flags loaded`);
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

// Create flag mosaic background
function FlagMosaic({ width, height, opacity = 0.3, flagSize = 80 }) {
  const flagCodes = Object.keys(flags);
  const cols = Math.ceil(width / flagSize) + 1;
  const rows = Math.ceil(height / (flagSize * 0.65)) + 1;

  const flagElements = [];
  for (let row = 0; row < rows; row++) {
    const rowFlags = [];
    for (let col = 0; col < cols; col++) {
      const idx = (row * cols + col) % flagCodes.length;
      const flag = flags[flagCodes[idx]];
      if (flag) {
        rowFlags.push(
          el('div', {
            width: flagSize,
            height: flagSize * 0.65,
            borderRadius: 6,
            overflow: 'hidden',
            flexShrink: 0,
          }, [
            img(flag, { width: '100%', height: '100%', objectFit: 'cover' }),
          ])
        );
      }
    }
    flagElements.push(
      el('div', {
        flexDirection: 'row',
        gap: 8,
        marginLeft: row % 2 === 0 ? 0 : -flagSize / 2,
      }, rowFlags)
    );
  }

  return el('div', {
    position: 'absolute',
    top: -20,
    left: -20,
    width: width + 40,
    height: height + 40,
    flexDirection: 'column',
    gap: 8,
    opacity,
  }, flagElements);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 1: THE HOOK - Yellow background
// ═══════════════════════════════════════════════════════════════════════════

function Post1({ format = 'portrait' }) {
  const isStory = format === 'story';
  const { w, h } = isStory ? DIM.STORY : DIM.PORTRAIT;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.yellow,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Flag mosaic background
    FlagMosaic({ width: w, height: h, opacity: 0.25, flagSize: isStory ? 90 : 80 }),

    // Content overlay
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isStory ? 60 : 50,
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 80 : 70,
        height: isStory ? 80 : 70,
        marginBottom: 32,
      }) : null,

      // Main text
      txt('20%', {
        fontSize: isStory ? 200 : 180,
        fontWeight: 900,
        color: c.black,
        lineHeight: 0.9,
      }),
      txt('OFF', {
        fontSize: isStory ? 120 : 100,
        fontWeight: 900,
        color: c.black,
        lineHeight: 0.9,
        marginBottom: 32,
      }),

      // Subtitle
      txt('YOUR FIRST eSIM', {
        fontSize: isStory ? 24 : 20,
        fontWeight: 700,
        color: c.black,
        opacity: 0.6,
        letterSpacing: 4,
      }),

      // Page indicator
      txt('1/3', {
        position: 'absolute',
        bottom: isStory ? 60 : 45,
        right: 50,
        fontSize: 14,
        fontWeight: 900,
        color: c.black,
        opacity: 0.3,
      }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: THE CODE - Cyan background
// ═══════════════════════════════════════════════════════════════════════════

function Post2({ format = 'portrait' }) {
  const isStory = format === 'story';
  const { w, h } = isStory ? DIM.STORY : DIM.PORTRAIT;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.cyan,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Flag mosaic background
    FlagMosaic({ width: w, height: h, opacity: 0.2, flagSize: isStory ? 90 : 80 }),

    // Content overlay
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isStory ? 60 : 50,
    }, [
      // Use code text
      txt('USE CODE', {
        fontSize: isStory ? 28 : 24,
        fontWeight: 700,
        color: c.black,
        opacity: 0.6,
        letterSpacing: 6,
        marginBottom: 24,
      }),

      // Code box
      el('div', {
        padding: isStory ? '36px 64px' : '32px 56px',
        backgroundColor: c.black,
        borderRadius: 20,
        marginBottom: 32,
      }, [
        txt('WELCOME20', {
          fontSize: isStory ? 64 : 56,
          fontWeight: 900,
          color: c.white,
          letterSpacing: 4,
        }),
      ]),

      // At checkout
      txt('AT CHECKOUT', {
        fontSize: isStory ? 22 : 18,
        fontWeight: 700,
        color: c.black,
        opacity: 0.5,
        letterSpacing: 4,
      }),

      // Page indicator
      txt('2/3', {
        position: 'absolute',
        bottom: isStory ? 60 : 45,
        right: 50,
        fontSize: 14,
        fontWeight: 900,
        color: c.black,
        opacity: 0.3,
      }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: THE CTA - Turquoise background
// ═══════════════════════════════════════════════════════════════════════════

function Post3({ format = 'portrait' }) {
  const isStory = format === 'story';
  const { w, h } = isStory ? DIM.STORY : DIM.PORTRAIT;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.turquoise,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Flag mosaic background
    FlagMosaic({ width: w, height: h, opacity: 0.2, flagSize: isStory ? 90 : 80 }),

    // Content overlay
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isStory ? 60 : 50,
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 72 : 64,
        height: isStory ? 72 : 64,
        marginBottom: 24,
      }) : null,

      // Brand
      txt('LUMBUS', {
        fontSize: isStory ? 56 : 48,
        fontWeight: 900,
        color: c.black,
        letterSpacing: 4,
        marginBottom: 8,
      }),
      txt('eSIM FOR TRAVELERS', {
        fontSize: isStory ? 14 : 12,
        fontWeight: 700,
        color: c.black,
        opacity: 0.5,
        letterSpacing: 4,
        marginBottom: isStory ? 48 : 40,
      }),

      // Stats
      el('div', {
        flexDirection: 'row',
        gap: isStory ? 40 : 32,
        marginBottom: isStory ? 48 : 40,
      }, [
        el('div', { alignItems: 'center' }, [
          txt('150+', { fontSize: isStory ? 44 : 38, fontWeight: 900, color: c.black }),
          txt('Countries', { fontSize: 13, fontWeight: 700, color: c.black, opacity: 0.5 }),
        ]),
        el('div', { alignItems: 'center' }, [
          txt('$1.99', { fontSize: isStory ? 44 : 38, fontWeight: 900, color: c.black }),
          txt('From', { fontSize: 13, fontWeight: 700, color: c.black, opacity: 0.5 }),
        ]),
        el('div', { alignItems: 'center' }, [
          txt('20%', { fontSize: isStory ? 44 : 38, fontWeight: 900, color: c.black }),
          txt('OFF', { fontSize: 13, fontWeight: 700, color: c.black, opacity: 0.5 }),
        ]),
      ]),

      // Code reminder
      el('div', {
        padding: '14px 32px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 100,
        marginBottom: 24,
      }, [
        txt('Code: WELCOME20', {
          fontSize: isStory ? 18 : 16,
          fontWeight: 900,
          color: c.black,
        }),
      ]),

      // CTA
      el('div', {
        padding: '20px 56px',
        backgroundColor: c.black,
        borderRadius: 100,
      }, [
        txt('DOWNLOAD NOW', {
          fontSize: isStory ? 20 : 18,
          fontWeight: 900,
          color: c.white,
        }),
      ]),

      // URL
      txt('getlumbus.com', {
        fontSize: 16,
        fontWeight: 700,
        color: c.black,
        opacity: 0.4,
        marginTop: 20,
      }),

      // Page indicator
      txt('3/3', {
        position: 'absolute',
        bottom: isStory ? 60 : 45,
        right: 50,
        fontSize: 14,
        fontWeight: 900,
        color: c.black,
        opacity: 0.3,
      }),
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
  console.log('  ║   LUMBUS WELCOME20 PROMO                                      ║');
  console.log('  ║   20% OFF - 3 Post Series                                     ║');
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

  console.log('  Generating WELCOME20 Posts...');
  console.log('  ─────────────────────────────────────────────');

  // Instagram (Portrait)
  await generateImage(Post1({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-1-ig.png', fonts);
  await generateImage(Post2({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-2-ig.png', fonts);
  await generateImage(Post3({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-3-ig.png', fonts);

  // TikTok/Stories
  await generateImage(Post1({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-1-tiktok.png', fonts);
  await generateImage(Post2({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-2-tiktok.png', fonts);
  await generateImage(Post3({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-3-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   WELCOME20 PROMO COMPLETE!                                   ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Post 1: Yellow  - 20% OFF hook                              ║');
  console.log('  ║   Post 2: Cyan    - WELCOME20 code                            ║');
  console.log('  ║   Post 3: Turquoise - CTA + stats                             ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/promo-welcome20-*.png     ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
