/**
 * LUMBUS REGIONAL PLANS
 *
 * Global Plan - 120+ countries - $9.99
 * Europe Plan - 30+ countries - $3.99
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

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

// Global flags - mix from all continents
const GLOBAL_FLAGS = [
  'us', 'gb', 'fr', 'de', 'jp', 'au', 'br', 'ca', 'kr', 'mx',
  'it', 'es', 'nl', 'se', 'ch', 'sg', 'th', 'ae', 'za', 'in',
  'nz', 'pt', 'no', 'dk', 'fi', 'be', 'at', 'ie', 'pl', 'gr',
];

// Europe flags
const EUROPE_FLAGS = [
  'gb', 'fr', 'de', 'it', 'es', 'nl', 'se', 'ch', 'pt', 'no',
  'dk', 'fi', 'be', 'at', 'ie', 'pl', 'gr', 'cz', 'hu', 'ro',
];

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {}

  const allFlags = [...new Set([...GLOBAL_FLAGS, ...EUROPE_FLAGS])];
  console.log('   Loading flags...');
  for (const code of allFlags) {
    try {
      const res = await fetch(`https://flagcdn.com/w160/${code}.png`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (res.ok) {
        flags[code] = `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
      }
    } catch (e) {}
  }
  console.log(`   ✓ ${Object.keys(flags).length} flags loaded`);
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
    fontData[name] = Buffer.from(await (await fetch(url)).arrayBuffer());
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
// GLOBAL PLAN POST
// ═══════════════════════════════════════════════════════════════════════════

function GlobalPlanPost({ format = 'portrait' }) {
  const isStory = format === 'story';
  const flagCodes = GLOBAL_FLAGS;
  const flagSize = isStory ? 58 : 52;

  // Create scattered flag grid
  const flagGrid = [];
  const cols = 6;
  const rows = 5;
  for (let row = 0; row < rows; row++) {
    const rowFlags = [];
    for (let col = 0; col < cols; col++) {
      const idx = (row * cols + col) % flagCodes.length;
      const flag = flags[flagCodes[idx]];
      if (flag) {
        rowFlags.push(
          el('div', {
            width: flagSize,
            height: flagSize * 0.67,
            borderRadius: 6,
            overflow: 'hidden',
          }, [img(flag, { width: '100%', height: '100%', objectFit: 'cover' })])
        );
      }
    }
    flagGrid.push(
      el('div', {
        flexDirection: 'row',
        gap: 8,
        marginLeft: row % 2 === 0 ? 0 : flagSize / 2,
      }, rowFlags)
    );
  }

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.turquoise,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Content
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 50 : 40,
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, { width: 48, height: 48 }) : null,
        txt('getlumbus.com', { fontSize: 14, fontWeight: 700, color: c.black, opacity: 0.5 }),
      ]),

      // Main content
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // GLOBAL badge
        el('div', {
          backgroundColor: c.black,
          padding: '14px 40px',
          borderRadius: 100,
          marginBottom: isStory ? 28 : 24,
        }, [
          txt('GLOBAL PLAN', { fontSize: isStory ? 20 : 18, fontWeight: 900, color: c.turquoise, letterSpacing: 4 }),
        ]),

        // Big number
        txt('120+', {
          fontSize: isStory ? 280 : 240,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -15,
          lineHeight: 0.8,
        }),
        txt('COUNTRIES', {
          fontSize: isStory ? 60 : 52,
          fontWeight: 900,
          color: c.black,
          letterSpacing: 6,
          marginBottom: isStory ? 32 : 28,
        }),

        // Flag grid
        el('div', {
          flexDirection: 'column',
          gap: 8,
          marginBottom: isStory ? 36 : 30,
          opacity: 0.9,
        }, flagGrid),

        // ONE eSIM emphasis
        el('div', {
          backgroundColor: c.yellow,
          padding: '12px 32px',
          borderRadius: 100,
          marginBottom: isStory ? 20 : 16,
        }, [
          txt('ALL IN ONE eSIM', { fontSize: isStory ? 22 : 20, fontWeight: 900, color: c.black, letterSpacing: 2 }),
        ]),

        // Price card
        el('div', {
          backgroundColor: c.black,
          borderRadius: 28,
          padding: isStory ? '24px 56px' : '20px 48px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }, [
          txt('FROM', { fontSize: isStory ? 24 : 22, fontWeight: 700, color: c.white, opacity: 0.6 }),
          txt('$9.99', { fontSize: isStory ? 64 : 56, fontWeight: 900, color: c.white }),
        ]),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// EUROPE PLAN POST
// ═══════════════════════════════════════════════════════════════════════════

function EuropePlanPost({ format = 'portrait' }) {
  const isStory = format === 'story';
  const flagCodes = EUROPE_FLAGS;
  const flagSize = isStory ? 62 : 56;

  // Create flag arc/wave
  const flagRows = [];
  const flagsPerRow = [4, 5, 6, 5, 4];
  let flagIndex = 0;

  for (let row = 0; row < flagsPerRow.length; row++) {
    const rowFlags = [];
    for (let col = 0; col < flagsPerRow[row]; col++) {
      const flag = flags[flagCodes[flagIndex % flagCodes.length]];
      flagIndex++;
      if (flag) {
        rowFlags.push(
          el('div', {
            width: flagSize,
            height: flagSize * 0.67,
            borderRadius: 6,
            overflow: 'hidden',
          }, [img(flag, { width: '100%', height: '100%', objectFit: 'cover' })])
        );
      }
    }
    flagRows.push(
      el('div', {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
      }, rowFlags)
    );
  }

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.cyan,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Content
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 50 : 40,
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, { width: 48, height: 48 }) : null,
        txt('getlumbus.com', { fontSize: 14, fontWeight: 700, color: c.black, opacity: 0.5 }),
      ]),

      // Main content
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // EUROPE badge
        el('div', {
          backgroundColor: c.black,
          padding: '14px 40px',
          borderRadius: 100,
          marginBottom: isStory ? 28 : 24,
        }, [
          txt('EUROPE PLAN', { fontSize: isStory ? 20 : 18, fontWeight: 900, color: c.cyan, letterSpacing: 4 }),
        ]),

        // Big number
        txt('30+', {
          fontSize: isStory ? 320 : 280,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -18,
          lineHeight: 0.8,
        }),
        txt('COUNTRIES', {
          fontSize: isStory ? 60 : 52,
          fontWeight: 900,
          color: c.black,
          letterSpacing: 6,
          marginBottom: isStory ? 32 : 28,
        }),

        // Flag diamond
        el('div', {
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          marginBottom: isStory ? 36 : 30,
          opacity: 0.9,
        }, flagRows),

        // ONE eSIM emphasis
        el('div', {
          backgroundColor: c.yellow,
          padding: '12px 32px',
          borderRadius: 100,
          marginBottom: isStory ? 20 : 16,
        }, [
          txt('ALL IN ONE eSIM', { fontSize: isStory ? 22 : 20, fontWeight: 900, color: c.black, letterSpacing: 2 }),
        ]),

        // Price card
        el('div', {
          backgroundColor: c.black,
          borderRadius: 28,
          padding: isStory ? '24px 56px' : '20px 48px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }, [
          txt('FROM', { fontSize: isStory ? 24 : 22, fontWeight: 700, color: c.white, opacity: 0.6 }),
          txt('$3.99', { fontSize: isStory ? 64 : 56, fontWeight: 900, color: c.white }),
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
    await fs.writeFile(path.join(OUTPUT, filename), resvg.render().asPng());
    console.log(`   ✓ ${filename}`);
  } catch (e) {
    console.error(`   ✗ ${filename}: ${e.message}`);
  }
}

async function main() {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log('  ║   LUMBUS REGIONAL PLANS                                       ║');
  console.log('  ║   Global & Europe                                             ║');
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

  console.log('  Generating Regional Plan Posts...');
  console.log('  ─────────────────────────────────────────────');

  // Global Plan
  await generateImage(GlobalPlanPost({ format: 'portrait' }), PT.w, PT.h, 'global-plan-ig.png', fonts);
  await generateImage(GlobalPlanPost({ format: 'story' }), ST.w, ST.h, 'global-plan-tiktok.png', fonts);

  // Europe Plan
  await generateImage(EuropePlanPost({ format: 'portrait' }), PT.w, PT.h, 'europe-plan-ig.png', fonts);
  await generateImage(EuropePlanPost({ format: 'story' }), ST.w, ST.h, 'europe-plan-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   REGIONAL PLANS COMPLETE!                                    ║');
  console.log('  ║                                                               ║');
  console.log('  ║   • Global Plan: 120+ countries from $9.99                    ║');
  console.log('  ║   • Europe Plan: 30+ countries from $3.99                     ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/*-plan-*.png              ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
