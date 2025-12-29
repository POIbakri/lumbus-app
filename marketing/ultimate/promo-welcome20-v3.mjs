/**
 * LUMBUS WELCOME20 PROMO V3 - WEL | COM | E20
 *
 * Split code across 3 posts, each with full info
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
  } catch (e) {}

  try {
    const appleResponse = await fetch('https://cdn.simpleicons.org/apple/white');
    appleIcon = `data:image/svg+xml;base64,${Buffer.from(await appleResponse.text()).toString('base64')}`;
    console.log('   ✓ Apple icon loaded');
  } catch (e) {}

  try {
    const playResponse = await fetch('https://cdn.simpleicons.org/googleplay/white');
    playIcon = `data:image/svg+xml;base64,${Buffer.from(await playResponse.text()).toString('base64')}`;
    console.log('   ✓ Google Play icon loaded');
  } catch (e) {}

  console.log('   Loading flags...');
  for (const code of FLAG_CODES) {
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
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };
  const fontData = {};
  for (const [name, url] of Object.entries(fontUrls)) {
    fontData[name] = Buffer.from(await (await fetch(url)).arrayBuffer());
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

// Flag mosaic background
function FlagMosaic({ width, height, opacity = 0.25, flagSize = 65 }) {
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
            borderRadius: 4,
            overflow: 'hidden',
            flexShrink: 0,
          }, [img(flag, { width: '100%', height: '100%', objectFit: 'cover' })])
        );
      }
    }
    flagElements.push(
      el('div', {
        flexDirection: 'row',
        gap: 5,
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
    gap: 5,
    opacity,
  }, flagElements);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN POST TEMPLATE - Reused for all 3
// ═══════════════════════════════════════════════════════════════════════════

function PromoPost({ codePart, bgColor, pageNum, format = 'portrait' }) {
  const isStory = format === 'story';
  const { w, h } = isStory ? DIM.STORY : DIM.PORTRAIT;
  const isE20 = codePart === 'E20';

  // Same font size for all posts - consistent lettering
  const fontSize = isStory ? 520 : 500;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    FlagMosaic({ width: w, height: h, opacity: 0.22, flagSize: isStory ? 70 : 60 }),

    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      padding: isStory ? 55 : 45,
    }, [
      // Header - Logo + getlumbus.com
      el('div', {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isStory ? 20 : 16,
      }, [
        logoIcon ? img(logoIcon, { width: 48, height: 48 }) : null,
        txt('getlumbus.com', {
          fontSize: 15,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
        }),
      ]),

      // Main content
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // Big code part - E20 touches left edge, others centered
        txt(codePart, {
          fontSize,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -22,
          lineHeight: 0.75,
          marginBottom: 10,
          alignSelf: isE20 ? 'flex-start' : 'center',
          marginLeft: isE20 ? (isStory ? -105 : -95) : 0,
        }),

        // 20% OFF badge - always centered
        el('div', {
          padding: '14px 36px',
          backgroundColor: c.black,
          borderRadius: 100,
          marginBottom: isStory ? 28 : 24,
        }, [
          txt('20% OFF', {
            fontSize: isStory ? 28 : 24,
            fontWeight: 900,
            color: c.white,
          }),
        ]),

        // Code instruction
        txt('USE CODE: WELCOME20', {
          fontSize: isStory ? 18 : 16,
          fontWeight: 700,
          color: c.black,
          opacity: 0.6,
          letterSpacing: 2,
          marginBottom: isStory ? 32 : 28,
        }),

        // App Store Badges
        el('div', {
          flexDirection: 'row',
          gap: 12,
        }, [
          // Apple
          el('div', {
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: c.black,
            borderRadius: 10,
            gap: 10,
          }, [
            appleIcon ? img(appleIcon, { width: 22, height: 22 }) : null,
            el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
              txt('Download on the', { fontSize: 8, fontWeight: 500, color: c.white, opacity: 0.7 }),
              txt('App Store', { fontSize: 14, fontWeight: 700, color: c.white }),
            ]),
          ]),
          // Google Play
          el('div', {
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: c.black,
            borderRadius: 10,
            gap: 10,
          }, [
            playIcon ? img(playIcon, { width: 20, height: 20 }) : null,
            el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
              txt('GET IT ON', { fontSize: 8, fontWeight: 500, color: c.white, opacity: 0.7 }),
              txt('Google Play', { fontSize: 14, fontWeight: 700, color: c.white }),
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
        txt('eSIM • 150+ Countries', {
          fontSize: 14,
          fontWeight: 700,
          color: c.black,
          opacity: 0.5,
        }),
        txt(`${pageNum}/3`, {
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
  console.log('  ║   LUMBUS WELCOME20 V3 - WEL | COM | E20                       ║');
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

  const posts = [
    { codePart: 'WEL', bgColor: c.yellow, pageNum: 1 },
    { codePart: 'COM', bgColor: c.cyan, pageNum: 2 },
    { codePart: 'E20', bgColor: c.turquoise, pageNum: 3 },
  ];

  console.log('  Generating WEL | COM | E20 Posts...');
  console.log('  ─────────────────────────────────────────────');

  for (const post of posts) {
    await generateImage(
      PromoPost({ ...post, format: 'portrait' }),
      PT.w, PT.h,
      `promo-welcome20-v3-${post.pageNum}-ig.png`,
      fonts
    );
    await generateImage(
      PromoPost({ ...post, format: 'story' }),
      ST.w, ST.h,
      `promo-welcome20-v3-${post.pageNum}-tiktok.png`,
      fonts
    );
  }

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   WELCOME20 V3 COMPLETE!                                      ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Post 1: Yellow    - "WEL"                                   ║');
  console.log('  ║   Post 2: Cyan      - "COM"                                   ║');
  console.log('  ║   Post 3: Turquoise - "E20"                                   ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Each has: 20% OFF + WELCOME20 code + App badges             ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/promo-welcome20-v3-*.png  ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
