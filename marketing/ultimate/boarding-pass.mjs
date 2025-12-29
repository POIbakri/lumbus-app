/**
 * LUMBUS BOARDING PASS - Realistic eSIM Tickets
 *
 * Premium boarding pass style for Thailand & China
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
  gray: '#666666',
  lightGray: '#F5F5F5',
};

const DIM = {
  PORTRAIT: { w: 1080, h: 1350 },
  STORY: { w: 1080, h: 1920 },
};

let logoIcon = null;
const flags = {};

async function loadAssets() {
  try {
    const iconBuffer = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo loaded');
  } catch (e) {}

  const codes = ['th', 'cn'];
  for (const code of codes) {
    try {
      const res = await fetch(`https://flagcdn.com/w320/${code}.png`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (res.ok) {
        flags[code] = `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
        console.log(`   ✓ Flag ${code.toUpperCase()} loaded`);
      }
    } catch (e) {}
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
// BOARDING PASS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function BoardingPass({ country, code, cityCode, price, data, validity, format = 'portrait' }) {
  const isStory = format === 'story';
  const flag = flags[code];

  // Barcode lines
  const barcodeLines = [];
  for (let i = 0; i < 40; i++) {
    const width = Math.random() > 0.5 ? 4 : 2;
    barcodeLines.push(
      el('div', {
        width,
        height: 50,
        backgroundColor: c.black,
        marginRight: 2,
      }, [])
    );
  }

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 50 : 40,
  }, [
    // Main ticket
    el('div', {
      width: '100%',
      backgroundColor: c.cyan,
      borderRadius: 32,
      flexDirection: 'column',
      overflow: 'hidden',
    }, [
      // Top section - turquoise header
      el('div', {
        backgroundColor: c.turquoise,
        padding: '28px 36px',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        el('div', { flexDirection: 'row', alignItems: 'center', gap: 16 }, [
          logoIcon ? img(logoIcon, { width: 44, height: 44 }) : null,
          el('div', { flexDirection: 'column' }, [
            txt('LUMBUS', { fontSize: 22, fontWeight: 900, color: c.black, letterSpacing: 2 }),
            txt('eSIM BOARDING PASS', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.6, letterSpacing: 1 }),
          ]),
        ]),
        txt('DIGITAL', {
          fontSize: 12,
          fontWeight: 900,
          color: c.black,
          opacity: 0.5,
          letterSpacing: 3,
        }),
      ]),

      // Main content
      el('div', {
        padding: '36px',
        flexDirection: 'column',
      }, [
        // Route section
        el('div', {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }, [
          // From
          el('div', { flexDirection: 'column' }, [
            txt('FROM', { fontSize: 11, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 4 }),
            txt('ONLINE', { fontSize: 42, fontWeight: 900, color: c.black, letterSpacing: -1 }),
            txt('Lumbus', { fontSize: 13, fontWeight: 500, color: c.black, opacity: 0.5 }),
          ]),
          // Arrow
          el('div', {
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 20px',
          }, [
            el('div', {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }, [
              el('div', { width: 40, height: 3, backgroundColor: c.cyan }, []),
              el('div', {
                width: 44,
                height: 44,
                backgroundColor: c.yellow,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }, [
                txt('>', { fontSize: 24, fontWeight: 900, color: c.black }),
              ]),
              el('div', { width: 40, height: 3, backgroundColor: c.turquoise }, []),
            ]),
          ]),
          // To
          el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            txt('TO', { fontSize: 11, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 4 }),
            txt(country.toUpperCase(), { fontSize: 36, fontWeight: 900, color: c.black, letterSpacing: -1 }),
            txt(cityCode, { fontSize: 13, fontWeight: 500, color: c.black, opacity: 0.5 }),
          ]),
        ]),

        // Divider with circles
        el('div', {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 32,
        }, [
          el('div', { width: 24, height: 24, backgroundColor: c.dark, borderRadius: 12, marginLeft: -54 }, []),
          el('div', { flex: 1, height: 3, backgroundColor: c.black, opacity: 0.15, marginLeft: 12, marginRight: 12 }, []),
          el('div', { width: 24, height: 24, backgroundColor: c.dark, borderRadius: 12, marginRight: -54 }, []),
        ]),

        // Details grid
        el('div', {
          flexDirection: 'row',
          gap: 24,
          marginBottom: 32,
        }, [
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('PASSENGER', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt('YOU', { fontSize: 20, fontWeight: 900, color: c.black }),
          ]),
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('DATA', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt(data, { fontSize: 20, fontWeight: 900, color: c.black }),
          ]),
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('VALIDITY', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt(validity, { fontSize: 20, fontWeight: 900, color: c.black }),
          ]),
        ]),

        // Second row details
        el('div', {
          flexDirection: 'row',
          gap: 24,
          marginBottom: 32,
        }, [
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('NETWORK', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt('5G / LTE', { fontSize: 20, fontWeight: 900, color: c.black }),
          ]),
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('ACTIVATION', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt('INSTANT', { fontSize: 20, fontWeight: 900, color: c.black }),
          ]),
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt('PRICE', { fontSize: 10, fontWeight: 700, color: c.black, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }),
            txt(price, { fontSize: 20, fontWeight: 900, color: c.dark }),
          ]),
        ]),

        // Flag and QR section
        el('div', {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }, [
          // Flag
          flag ? el('div', {
            width: 100,
            height: 66,
            borderRadius: 8,
            overflow: 'hidden',
            border: '2px solid #EEE',
          }, [
            img(flag, { width: '100%', height: '100%', objectFit: 'cover' }),
          ]) : null,
          // Icon logo
          logoIcon ? img(logoIcon, {
            width: 90,
            height: 90,
          }) : null,
        ]),
      ]),

      // Bottom barcode section
      el('div', {
        backgroundColor: c.turquoise,
        padding: '24px 36px',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }, [
        // Barcode
        el('div', {
          flexDirection: 'row',
          alignItems: 'center',
        }, barcodeLines),
        // Code
        txt(`LMB-${cityCode}-2025`, {
          fontSize: 12,
          fontWeight: 900,
          color: c.black,
          letterSpacing: 4,
        }),
      ]),
    ]),

    // Bottom text
    el('div', {
      marginTop: 32,
      alignItems: 'center',
    }, [
      txt('getlumbus.com', {
        fontSize: 18,
        fontWeight: 700,
        color: c.white,
        opacity: 0.5,
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
  console.log('  ║   LUMBUS BOARDING PASS                                        ║');
  console.log('  ║   Thailand & China                                            ║');
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

  const passes = [
    { country: 'Thailand', code: 'th', cityCode: 'BKK', price: '$3.99', data: '1GB', validity: '7 Days' },
    { country: 'China', code: 'cn', cityCode: 'PEK', price: '$3.99', data: '1GB', validity: '7 Days' },
  ];

  console.log('  Generating Boarding Passes...');
  console.log('  ─────────────────────────────────────────────');

  for (const pass of passes) {
    await generateImage(
      BoardingPass({ ...pass, format: 'portrait' }),
      PT.w, PT.h,
      `boarding-pass-${pass.code}-ig.png`,
      fonts
    );
    await generateImage(
      BoardingPass({ ...pass, format: 'story' }),
      ST.w, ST.h,
      `boarding-pass-${pass.code}-tiktok.png`,
      fonts
    );
  }

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   BOARDING PASSES COMPLETE!                                   ║');
  console.log('  ║                                                               ║');
  console.log('  ║   • Thailand (BKK) - $1.99 / 1GB / 7 Days                     ║');
  console.log('  ║   • China (PEK)    - $2.99 / 2GB / 14 Days                    ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/boarding-pass-*.png       ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
