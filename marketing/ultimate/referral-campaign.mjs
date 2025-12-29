/**
 * LUMBUS REFERRAL CAMPAIGN
 *
 * Refer a friend - Both get 1GB FREE + Friend gets 10% OFF
 * Creative, fun, click-worthy design!
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
// REFERRAL POST - Main Design
// ═══════════════════════════════════════════════════════════════════════════

function ReferralPost({ format = 'portrait' }) {
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

      // Main content area
      el('div', {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }, [
        // FREE DATA banner
        el('div', {
          backgroundColor: c.black,
          padding: '14px 36px',
          borderRadius: 100,
          marginBottom: isStory ? 24 : 20,
        }, [
          txt('FREE DATA FOREVER', { fontSize: isStory ? 18 : 16, fontWeight: 900, color: c.yellow, letterSpacing: 3 }),
        ]),

        // Big REFER A FRIEND
        txt('REFER', {
          fontSize: isStory ? 170 : 150,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -8,
          lineHeight: 0.85,
        }),
        txt('A FRIEND', {
          fontSize: isStory ? 85 : 75,
          fontWeight: 900,
          color: c.black,
          letterSpacing: -2,
          lineHeight: 0.9,
          marginBottom: isStory ? 36 : 28,
        }),

        // Two big reward cards - stacked vertically for better spacing
        el('div', {
          flexDirection: 'column',
          gap: isStory ? 16 : 14,
          width: '100%',
          maxWidth: 500,
        }, [
          // YOU GET card
          el('div', {
            backgroundColor: c.turquoise,
            borderRadius: 24,
            padding: isStory ? '24px 32px' : '20px 28px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }, [
            txt('YOU GET', { fontSize: isStory ? 24 : 22, fontWeight: 900, color: c.black }),
            el('div', {
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 8,
            }, [
              txt('1GB', { fontSize: isStory ? 52 : 46, fontWeight: 900, color: c.black, lineHeight: 1 }),
              txt('FREE', { fontSize: isStory ? 22 : 20, fontWeight: 900, color: c.black }),
            ]),
          ]),

          // FRIEND GETS card
          el('div', {
            backgroundColor: c.black,
            borderRadius: 24,
            padding: isStory ? '24px 32px' : '20px 28px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }, [
            txt('FRIEND GETS', { fontSize: isStory ? 24 : 22, fontWeight: 900, color: c.white }),
            el('div', {
              flexDirection: 'column',
              alignItems: 'flex-end',
            }, [
              el('div', {
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 8,
              }, [
                txt('1GB', { fontSize: isStory ? 52 : 46, fontWeight: 900, color: c.white, lineHeight: 1 }),
                txt('FREE', { fontSize: isStory ? 22 : 20, fontWeight: 900, color: c.turquoise }),
              ]),
              txt('+10% OFF', { fontSize: isStory ? 18 : 16, fontWeight: 900, color: c.yellow }),
            ]),
          ]),
        ]),
      ]),

      // Bottom CTA
      el('div', {
        alignItems: 'center',
        marginTop: isStory ? 32 : 24,
      }, [
        el('div', {
          backgroundColor: c.black,
          padding: '18px 56px',
          borderRadius: 100,
        }, [
          txt('SHARE NOW', { fontSize: 18, fontWeight: 900, color: c.white }),
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
  console.log('  ║   LUMBUS REFERRAL CAMPAIGN                                    ║');
  console.log('  ║   Share the Love - Free Data Forever!                         ║');
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

  console.log('  Generating Referral Posts...');
  console.log('  ─────────────────────────────────────────────');

  await generateImage(ReferralPost({ format: 'portrait' }), PT.w, PT.h, 'referral-campaign-ig.png', fonts);
  await generateImage(ReferralPost({ format: 'story' }), ST.w, ST.h, 'referral-campaign-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   REFERRAL CAMPAIGN COMPLETE!                                 ║');
  console.log('  ║                                                               ║');
  console.log('  ║   • You get: 1GB FREE                                         ║');
  console.log('  ║   • Friend gets: 1GB FREE + 10% OFF                           ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/referral-campaign-*.png   ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
