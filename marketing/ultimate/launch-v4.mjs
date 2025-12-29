/**
 * LUMBUS LAUNCH V4 - FIXED & IMPROVED
 *
 * Fixes:
 * - B1 background changed so logo is visible
 * - 150+ countries (not 187)
 * - Better overall design
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
let logoFull = null;
let appleIcon = null;
let playIcon = null;

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {
    console.log('   ○ Icon logo not found');
  }
  try {
    const logoBuffer = await fs.readFile(path.join(ROOT, 'assets', 'logotrans.png'));
    logoFull = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('   ✓ Full logo loaded');
  } catch (e) {
    console.log('   ○ Full logo not found');
  }

  // Fetch Apple and Google Play icons from Simple Icons CDN
  try {
    const appleResponse = await fetch('https://cdn.simpleicons.org/apple/white');
    const appleSvg = await appleResponse.text();
    appleIcon = `data:image/svg+xml;base64,${Buffer.from(appleSvg).toString('base64')}`;
    console.log('   ✓ Apple icon loaded');
  } catch (e) {
    console.log('   ○ Apple icon not found');
  }

  try {
    const playResponse = await fetch('https://cdn.simpleicons.org/googleplay/white');
    const playSvg = await playResponse.text();
    playIcon = `data:image/svg+xml;base64,${Buffer.from(playSvg).toString('base64')}`;
    console.log('   ✓ Google Play icon loaded');
  } catch (e) {
    console.log('   ○ Google Play icon not found');
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
// POST 1: LOGO - Yellow background with ICON logo
// ═══════════════════════════════════════════════════════════════════════════

function Post1({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.yellow,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }, [
    // Icon logo - large and centered (no text, just logo)
    logoIcon ? img(logoIcon, {
      width: isStory ? 450 : 400,
      height: isStory ? 450 : 400,
    }) : null,
    // 1/3
    txt('1/3', {
      position: 'absolute',
      bottom: isStory ? 60 : 45,
      right: 50,
      fontSize: 14,
      fontWeight: 900,
      color: c.black,
      opacity: 0.3,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: TAGLINE - Cyan background, bold typography
// ═══════════════════════════════════════════════════════════════════════════

function Post2({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.cyan,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 60 : 50,
    position: 'relative',
  }, [
    // Small logo at top
    el('div', {
      position: 'absolute',
      top: isStory ? 60 : 50,
      left: isStory ? 60 : 50,
    }, [
      logoFull ? img(logoFull, { height: 36, objectFit: 'contain' }) : null,
    ]),
    // Main text - stacked
    el('div', {
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      txt('DATA', {
        fontSize: isStory ? 180 : 150,
        fontWeight: 900,
        color: c.black,
        letterSpacing: -8,
        lineHeight: 0.85,
      }),
      txt('WITHOUT', {
        fontSize: isStory ? 180 : 150,
        fontWeight: 900,
        color: c.black,
        letterSpacing: -8,
        lineHeight: 0.85,
      }),
      txt('BORDERS', {
        fontSize: isStory ? 180 : 150,
        fontWeight: 900,
        color: c.black,
        letterSpacing: -8,
        lineHeight: 0.85,
      }),
    ]),
    // 2/3
    txt('2/3', {
      position: 'absolute',
      bottom: isStory ? 60 : 45,
      right: 50,
      fontSize: 14,
      fontWeight: 900,
      color: c.black,
      opacity: 0.4,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: CTA - Turquoise background with all the info
// ═══════════════════════════════════════════════════════════════════════════

function Post3({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.turquoise,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 60 : 50,
    position: 'relative',
  }, [
    // Icon logo (visible on turquoise)
    logoIcon ? img(logoIcon, {
      width: isStory ? 120 : 100,
      height: isStory ? 120 : 100,
      marginBottom: 24,
    }) : null,
    // Brand name
    txt('LUMBUS', {
      fontSize: isStory ? 64 : 56,
      fontWeight: 900,
      color: c.black,
      letterSpacing: 4,
      marginBottom: 8,
    }),
    txt('eSIM FOR TRAVELERS', {
      fontSize: isStory ? 16 : 14,
      fontWeight: 700,
      color: c.black,
      opacity: 0.5,
      letterSpacing: 4,
      marginBottom: isStory ? 48 : 40,
    }),
    // Stats row - 150+ countries
    el('div', {
      flexDirection: 'row',
      gap: isStory ? 48 : 36,
      marginBottom: isStory ? 48 : 40,
    }, [
      el('div', { alignItems: 'center' }, [
        txt('150+', { fontSize: isStory ? 52 : 44, fontWeight: 900, color: c.black }),
        txt('Countries', { fontSize: 14, fontWeight: 700, color: c.black, opacity: 0.5 }),
      ]),
      el('div', { alignItems: 'center' }, [
        txt('$1.99', { fontSize: isStory ? 52 : 44, fontWeight: 900, color: c.black }),
        txt('From', { fontSize: 14, fontWeight: 700, color: c.black, opacity: 0.5 }),
      ]),
      el('div', { alignItems: 'center' }, [
        txt('30s', { fontSize: isStory ? 52 : 44, fontWeight: 900, color: c.black }),
        txt('Setup', { fontSize: 14, fontWeight: 700, color: c.black, opacity: 0.5 }),
      ]),
    ]),
    // Download Now text
    txt('Download Now', {
      fontSize: isStory ? 28 : 24,
      fontWeight: 900,
      color: c.black,
      marginBottom: 20,
    }),
    // App Store Badges
    el('div', {
      flexDirection: 'row',
      gap: 20,
    }, [
      // Apple App Store Badge
      el('div', {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px 28px',
        backgroundColor: c.black,
        borderRadius: 12,
        gap: 14,
      }, [
        appleIcon ? img(appleIcon, { width: 32, height: 32 }) : null,
        el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
          txt('Download on the', { fontSize: 11, fontWeight: 400, color: c.white, opacity: 0.8 }),
          txt('App Store', { fontSize: 20, fontWeight: 700, color: c.white }),
        ]),
      ]),
      // Google Play Badge
      el('div', {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px 28px',
        backgroundColor: c.black,
        borderRadius: 12,
        gap: 14,
      }, [
        playIcon ? img(playIcon, { width: 28, height: 28 }) : null,
        el('div', { flexDirection: 'column', alignItems: 'flex-start' }, [
          txt('GET IT ON', { fontSize: 11, fontWeight: 400, color: c.white, opacity: 0.8 }),
          txt('Google Play', { fontSize: 20, fontWeight: 700, color: c.white }),
        ]),
      ]),
    ]),
    // URL
    txt('getlumbus.com', {
      fontSize: 16,
      fontWeight: 700,
      color: c.black,
      opacity: 0.4,
      marginTop: 24,
    }),
    // 3/3
    txt('3/3', {
      position: 'absolute',
      bottom: isStory ? 60 : 45,
      right: 50,
      fontSize: 14,
      fontWeight: 900,
      color: c.black,
      opacity: 0.3,
    }),
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
  console.log('  ║   LUMBUS LAUNCH V4 - FIXED & IMPROVED                         ║');
  console.log('  ║   Yellow → Cyan → Turquoise                                   ║');
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

  console.log('  Generating Launch Posts...');
  console.log('  ─────────────────────────────────────────────');

  // Instagram (Portrait)
  await generateImage(Post1({ format: 'portrait' }), PT.w, PT.h, 'launch-1-ig.png', fonts);
  await generateImage(Post2({ format: 'portrait' }), PT.w, PT.h, 'launch-2-ig.png', fonts);
  await generateImage(Post3({ format: 'portrait' }), PT.w, PT.h, 'launch-3-ig.png', fonts);

  // TikTok/Stories
  await generateImage(Post1({ format: 'story' }), ST.w, ST.h, 'launch-1-tiktok.png', fonts);
  await generateImage(Post2({ format: 'story' }), ST.w, ST.h, 'launch-2-tiktok.png', fonts);
  await generateImage(Post3({ format: 'story' }), ST.w, ST.h, 'launch-3-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   LAUNCH V4 COMPLETE!                                         ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Post 1: Yellow bg + Full Logo                                ║');
  console.log('  ║   Post 2: Cyan bg + DATA WITHOUT BORDERS                      ║');
  console.log('  ║   Post 3: Turquoise bg + Stats + CTA                          ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/launch-*.png              ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
