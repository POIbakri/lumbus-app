/**
 * LUMBUS WELCOME20 PROMO V2 - Split Text
 *
 * WELCOME | 20 | (full code + CTA)
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
let appleIcon = null;
let playIcon = null;
const flags = {};

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

  // Load store icons
  try {
    const appleResponse = await fetch('https://cdn.simpleicons.org/apple/white');
    const appleSvg = await appleResponse.text();
    appleIcon = `data:image/svg+xml;base64,${Buffer.from(appleSvg).toString('base64')}`;
    console.log('   ✓ Apple icon loaded');
  } catch (e) {}

  try {
    const playResponse = await fetch('https://cdn.simpleicons.org/googleplay/white');
    const playSvg = await playResponse.text();
    playIcon = `data:image/svg+xml;base64,${Buffer.from(playSvg).toString('base64')}`;
    console.log('   ✓ Google Play icon loaded');
  } catch (e) {}

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
function FlagMosaic({ width, height, opacity = 0.3, flagSize = 70 }) {
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
            borderRadius: 5,
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
        gap: 6,
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
    gap: 6,
    opacity,
  }, flagElements);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 1: "WELCOME" - Yellow background
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
    FlagMosaic({ width: w, height: h, opacity: 0.22, flagSize: isStory ? 75 : 65 }),

    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 60 : 50,
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, { width: 52, height: 52 }) : null,
        el('div', {
          padding: '10px 20px',
          backgroundColor: c.black,
          borderRadius: 100,
        }, [
          txt('20% OFF', { fontSize: 14, fontWeight: 900, color: c.white }),
        ]),
      ]),

      // Main content - centered
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        txt('WELCOME', {
          fontSize: isStory ? 140 : 120,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -4,
        }),
        txt('to global data', {
          fontSize: isStory ? 32 : 28,
          fontWeight: 500,
          color: c.black,
          opacity: 0.6,
          marginTop: 16,
        }),
      ]),

      // Footer
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        txt('getlumbus.com', {
          fontSize: 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
        }),
        txt('1/3', {
          fontSize: 14,
          fontWeight: 900,
          color: c.black,
          opacity: 0.3,
        }),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: "20" - Cyan background
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
    FlagMosaic({ width: w, height: h, opacity: 0.18, flagSize: isStory ? 75 : 65 }),

    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 60 : 50,
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, { width: 52, height: 52 }) : null,
        txt('150+ Countries', {
          fontSize: 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.6,
        }),
      ]),

      // Main content - centered
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        txt('20', {
          fontSize: isStory ? 320 : 280,
          fontWeight: 900,
          color: c.black,
          lineHeight: 0.85,
        }),
        txt('PERCENT OFF', {
          fontSize: isStory ? 36 : 32,
          fontWeight: 900,
          color: c.black,
          letterSpacing: 8,
          marginTop: 8,
        }),
      ]),

      // Footer
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        txt('First purchase', {
          fontSize: 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
        }),
        txt('2/3', {
          fontSize: 14,
          fontWeight: 900,
          color: c.black,
          opacity: 0.3,
        }),
      ]),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: Full code + CTA - Turquoise background
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
    FlagMosaic({ width: w, height: h, opacity: 0.18, flagSize: isStory ? 75 : 65 }),

    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 60 : 50,
    }, [
      // Header
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        logoIcon ? img(logoIcon, { width: 52, height: 52 }) : null,
        txt('getlumbus.com', {
          fontSize: 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.6,
        }),
      ]),

      // Main content
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // Use code label
        txt('USE CODE', {
          fontSize: isStory ? 20 : 18,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
          letterSpacing: 4,
          marginBottom: 16,
        }),

        // Code box
        el('div', {
          padding: isStory ? '32px 56px' : '28px 48px',
          backgroundColor: c.black,
          borderRadius: 16,
          marginBottom: 24,
        }, [
          txt('WELCOME20', {
            fontSize: isStory ? 56 : 48,
            fontWeight: 900,
            color: c.white,
            letterSpacing: 3,
          }),
        ]),

        // 20% off text
        txt('20% OFF YOUR FIRST eSIM', {
          fontSize: isStory ? 18 : 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.6,
          marginBottom: isStory ? 48 : 40,
        }),

        // App Store Badges
        el('div', {
          flexDirection: 'row',
          gap: 16,
        }, [
          // Apple App Store Badge
          el('div', {
            flexDirection: 'row',
            alignItems: 'center',
            padding: '14px 24px',
            backgroundColor: c.black,
            borderRadius: 12,
            gap: 12,
          }, [
            appleIcon ? img(appleIcon, { width: 26, height: 26 }) : null,
            el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
              txt('Download on the', { fontSize: 10, fontWeight: 400, color: c.white, opacity: 0.8 }),
              txt('App Store', { fontSize: 17, fontWeight: 700, color: c.white }),
            ]),
          ]),
          // Google Play Badge
          el('div', {
            flexDirection: 'row',
            alignItems: 'center',
            padding: '14px 24px',
            backgroundColor: c.black,
            borderRadius: 12,
            gap: 12,
          }, [
            playIcon ? img(playIcon, { width: 24, height: 24 }) : null,
            el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
              txt('GET IT ON', { fontSize: 10, fontWeight: 400, color: c.white, opacity: 0.8 }),
              txt('Google Play', { fontSize: 17, fontWeight: 700, color: c.white }),
            ]),
          ]),
        ]),
      ]),

      // Footer
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        txt('eSIM for Travelers', {
          fontSize: 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
        }),
        txt('3/3', {
          fontSize: 14,
          fontWeight: 900,
          color: c.black,
          opacity: 0.3,
        }),
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
  console.log('  ║   LUMBUS WELCOME20 PROMO V2 - Split Text                      ║');
  console.log('  ║   WELCOME → 20 → WELCOME20                                    ║');
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

  console.log('  Generating WELCOME20 V2 Posts...');
  console.log('  ─────────────────────────────────────────────');

  // Instagram (Portrait)
  await generateImage(Post1({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-v2-1-ig.png', fonts);
  await generateImage(Post2({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-v2-2-ig.png', fonts);
  await generateImage(Post3({ format: 'portrait' }), PT.w, PT.h, 'promo-welcome20-v2-3-ig.png', fonts);

  // TikTok/Stories
  await generateImage(Post1({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-v2-1-tiktok.png', fonts);
  await generateImage(Post2({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-v2-2-tiktok.png', fonts);
  await generateImage(Post3({ format: 'story' }), ST.w, ST.h, 'promo-welcome20-v2-3-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   WELCOME20 V2 COMPLETE!                                      ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Post 1: Yellow    - "WELCOME"                               ║');
  console.log('  ║   Post 2: Cyan      - "20"                                    ║');
  console.log('  ║   Post 3: Turquoise - Full code + App Store badges            ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/promo-welcome20-v2-*.png  ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
