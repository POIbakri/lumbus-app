/**
 * LUMBUS GIVEAWAY
 *
 * WIN FREE DATA FOR A YEAR - 20GB/month
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

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {}
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
// GIVEAWAY POST
// ═══════════════════════════════════════════════════════════════════════════

function GiveawayPost({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.yellow,
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
        // GIVEAWAY badge
        el('div', {
          backgroundColor: c.black,
          padding: '18px 52px',
          borderRadius: 100,
          marginBottom: isStory ? 28 : 24,
        }, [
          txt('GIVEAWAY', { fontSize: isStory ? 28 : 26, fontWeight: 900, color: c.yellow, letterSpacing: 8 }),
        ]),

        // WIN
        txt('WIN', {
          fontSize: isStory ? 240 : 200,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -12,
          lineHeight: 0.8,
        }),

        // FREE DATA
        txt('FREE DATA', {
          fontSize: isStory ? 140 : 120,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -5,
          lineHeight: 0.85,
          marginBottom: isStory ? 16 : 12,
        }),

        // FOR A YEAR
        el('div', {
          backgroundColor: c.turquoise,
          padding: '18px 52px',
          borderRadius: 100,
          marginBottom: isStory ? 32 : 26,
        }, [
          txt('FOR A YEAR', { fontSize: isStory ? 36 : 32, fontWeight: 900, color: c.black, letterSpacing: 5 }),
        ]),

        // Prize details card
        el('div', {
          backgroundColor: c.black,
          borderRadius: 28,
          padding: isStory ? '28px 52px' : '24px 44px',
          alignItems: 'center',
          marginBottom: isStory ? 28 : 24,
        }, [
          el('div', {
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }, [
            txt('20GB', { fontSize: isStory ? 80 : 72, fontWeight: 900, color: c.white, lineHeight: 1 }),
            txt('EVERY MONTH', { fontSize: isStory ? 22 : 20, fontWeight: 900, color: c.white, opacity: 0.6, letterSpacing: 3 }),
          ]),
        ]),

        // Check caption
        el('div', {
          backgroundColor: c.cyan,
          padding: '16px 40px',
          borderRadius: 100,
        }, [
          txt('CHECK CAPTION TO WIN', { fontSize: isStory ? 20 : 18, fontWeight: 900, color: c.black, letterSpacing: 3 }),
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
  console.log('  ║   LUMBUS GIVEAWAY                                             ║');
  console.log('  ║   Win Free Data for a Year!                                   ║');
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

  console.log('  Generating Giveaway Posts...');
  console.log('  ─────────────────────────────────────────────');

  await generateImage(GiveawayPost({ format: 'portrait' }), PT.w, PT.h, 'giveaway-ig.png', fonts);
  await generateImage(GiveawayPost({ format: 'story' }), ST.w, ST.h, 'giveaway-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   GIVEAWAY COMPLETE!                                          ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Prize: 20GB/month for 12 months FREE                        ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/giveaway-*.png            ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
