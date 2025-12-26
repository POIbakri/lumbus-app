/**
 * LUMBUS LAUNCH V3 - OFFICIAL COLORWAY
 *
 * Primary Colors:
 * - Turquoise/Mint: #2EFECC
 * - Yellow: #FDFD74
 * - Cyan: #87EFFF
 *
 * Style: Bold, vibrant, FLAT (no gradients), rounded, fun & energetic
 * Typography: Black weight, uppercase headings
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
  // Primary
  turquoise: '#2EFECC',
  yellow: '#FDFD74',
  cyan: '#87EFFF',

  // Supporting
  purple: '#F7E2FB',
  mint: '#E0FEF7',
  lightMint: '#F0FFFB',
  lightBlue: '#F0FBFF',

  // Base
  white: '#FFFFFF',
  black: '#1A1A1A',
  muted: '#F5F5F5',
  mutedText: '#666666',
  red: '#EF4444',
  border: '#E5E5E5',
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
    console.log('   ✓ Logo loaded');
  } catch (e) {
    console.log('   ○ Logo not found');
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
// POST 1: LOGO INTRO - Flat, bold, all 3 colors
// ═══════════════════════════════════════════════════════════════════════════

function Post1({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
    flexDirection: 'column',
    position: 'relative',
  }, [
    // Three color blocks - flat, no gradient
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '33.33%',
      height: '100%',
      backgroundColor: c.turquoise,
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      left: '33.33%',
      width: '33.33%',
      height: '100%',
      backgroundColor: c.cyan,
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      left: '66.66%',
      width: '33.34%',
      height: '100%',
      backgroundColor: c.yellow,
    }),
    // Dark center panel
    el('div', {
      position: 'absolute',
      top: '15%',
      left: '10%',
      width: '80%',
      height: '70%',
      backgroundColor: c.black,
      borderRadius: 48,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 180 : 150,
        height: isStory ? 180 : 150,
        marginBottom: 32,
      }) : null,
      // Brand name
      txt('LUMBUS', {
        fontSize: isStory ? 80 : 68,
        fontWeight: 900,
        color: c.white,
        letterSpacing: 6,
      }),
      // Tagline
      txt('eSIM FOR TRAVELERS', {
        fontSize: isStory ? 22 : 18,
        fontWeight: 700,
        color: c.turquoise,
        letterSpacing: 6,
        marginTop: 16,
      }),
    ]),
    // 1/3
    txt('1/3', {
      position: 'absolute',
      bottom: 40,
      right: 50,
      fontSize: 16,
      fontWeight: 900,
      color: c.black,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: VALUE PROPS - Flat cards in each color
// ═══════════════════════════════════════════════════════════════════════════

function Post2({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
    flexDirection: 'column',
    padding: isStory ? 60 : 50,
  }, [
    // Header
    el('div', {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: isStory ? 40 : 30,
    }, [
      logoIcon ? img(logoIcon, { width: 44, height: 44 }) : null,
      txt('LUMBUS', {
        fontSize: 24,
        fontWeight: 900,
        color: c.white,
        letterSpacing: 4,
      }),
    ]),
    // Title
    txt('WHY US?', {
      fontSize: isStory ? 72 : 60,
      fontWeight: 900,
      color: c.white,
      marginBottom: isStory ? 48 : 36,
    }),
    // Three flat cards
    el('div', {
      flex: 1,
      flexDirection: 'column',
      gap: isStory ? 20 : 16,
      justifyContent: 'center',
    }, [
      // Card 1 - Turquoise
      el('div', {
        backgroundColor: c.turquoise,
        borderRadius: 24,
        padding: isStory ? 36 : 28,
        flexDirection: 'row',
        alignItems: 'center',
      }, [
        txt('187+', {
          fontSize: isStory ? 56 : 48,
          fontWeight: 900,
          color: c.black,
          width: isStory ? 180 : 150,
        }),
        el('div', { flexDirection: 'column' }, [
          txt('COUNTRIES', { fontSize: isStory ? 24 : 20, fontWeight: 900, color: c.black }),
          txt('Worldwide coverage', { fontSize: isStory ? 16 : 14, fontWeight: 500, color: c.black, opacity: 0.7 }),
        ]),
      ]),
      // Card 2 - Cyan
      el('div', {
        backgroundColor: c.cyan,
        borderRadius: 24,
        padding: isStory ? 36 : 28,
        flexDirection: 'row',
        alignItems: 'center',
      }, [
        txt('$1.99', {
          fontSize: isStory ? 56 : 48,
          fontWeight: 900,
          color: c.black,
          width: isStory ? 180 : 150,
        }),
        el('div', { flexDirection: 'column' }, [
          txt('STARTING', { fontSize: isStory ? 24 : 20, fontWeight: 900, color: c.black }),
          txt('No hidden fees', { fontSize: isStory ? 16 : 14, fontWeight: 500, color: c.black, opacity: 0.7 }),
        ]),
      ]),
      // Card 3 - Yellow
      el('div', {
        backgroundColor: c.yellow,
        borderRadius: 24,
        padding: isStory ? 36 : 28,
        flexDirection: 'row',
        alignItems: 'center',
      }, [
        txt('30s', {
          fontSize: isStory ? 56 : 48,
          fontWeight: 900,
          color: c.black,
          width: isStory ? 180 : 150,
        }),
        el('div', { flexDirection: 'column' }, [
          txt('SETUP', { fontSize: isStory ? 24 : 20, fontWeight: 900, color: c.black }),
          txt('Instant activation', { fontSize: isStory ? 16 : 14, fontWeight: 500, color: c.black, opacity: 0.7 }),
        ]),
      ]),
    ]),
    // Footer
    el('div', {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: isStory ? 40 : 30,
    }, [
      txt('getlumbus.com', { fontSize: 16, fontWeight: 700, color: c.mutedText }),
      txt('2/3', { fontSize: 16, fontWeight: 900, color: c.white }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: CTA - Bold, flat, all colors
// ═══════════════════════════════════════════════════════════════════════════

function Post3({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 60 : 50,
    position: 'relative',
  }, [
    // Corner accents - flat color blocks
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 200,
      height: 200,
      backgroundColor: c.turquoise,
      borderRadius: '0 0 100px 0',
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 150,
      height: 150,
      backgroundColor: c.cyan,
      borderRadius: '0 0 0 75px',
    }),
    el('div', {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 180,
      height: 180,
      backgroundColor: c.yellow,
      borderRadius: '90px 0 0 0',
    }),
    // Content
    el('div', {
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 100 : 80,
        height: isStory ? 100 : 80,
        marginBottom: 32,
      }) : null,
      txt('READY TO', {
        fontSize: isStory ? 28 : 24,
        fontWeight: 500,
        color: c.mutedText,
      }),
      txt('TRAVEL', {
        fontSize: isStory ? 100 : 84,
        fontWeight: 900,
        color: c.white,
        letterSpacing: -2,
      }),
      txt('CONNECTED?', {
        fontSize: isStory ? 100 : 84,
        fontWeight: 900,
        color: c.turquoise,
        letterSpacing: -2,
        marginBottom: isStory ? 48 : 36,
      }),
      // Pills with all 3 colors
      el('div', {
        flexDirection: 'row',
        gap: 12,
        marginBottom: isStory ? 40 : 32,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }, [
        el('div', {
          padding: '14px 24px',
          backgroundColor: c.turquoise,
          borderRadius: 100,
        }, txt('187+ COUNTRIES', { fontSize: 14, fontWeight: 900, color: c.black })),
        el('div', {
          padding: '14px 24px',
          backgroundColor: c.cyan,
          borderRadius: 100,
        }, txt('INSTANT SETUP', { fontSize: 14, fontWeight: 900, color: c.black })),
        el('div', {
          padding: '14px 24px',
          backgroundColor: c.yellow,
          borderRadius: 100,
        }, txt('FROM $1.99', { fontSize: 14, fontWeight: 900, color: c.black })),
      ]),
      // CTA Button
      el('div', {
        padding: '24px 72px',
        backgroundColor: c.white,
        borderRadius: 100,
      }, txt('DOWNLOAD FREE', { fontSize: isStory ? 22 : 18, fontWeight: 900, color: c.black })),
      txt('iOS & Android', {
        fontSize: 14,
        fontWeight: 500,
        color: c.mutedText,
        marginTop: 16,
      }),
    ]),
    // Footer
    el('div', {
      position: 'absolute',
      bottom: isStory ? 60 : 40,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      padding: '0 50px',
    }, [
      txt('getlumbus.com', { fontSize: 16, fontWeight: 700, color: c.mutedText }),
      txt('3/3', { fontSize: 16, fontWeight: 900, color: c.white }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// ALTERNATIVE: Typography focus
// ═══════════════════════════════════════════════════════════════════════════

function AltPost1({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.turquoise,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }, [
    // Logo large
    logoIcon ? img(logoIcon, {
      width: isStory ? 400 : 340,
      height: isStory ? 400 : 340,
    }) : null,
    // 1/3
    txt('1/3', {
      position: 'absolute',
      bottom: 40,
      right: 50,
      fontSize: 16,
      fontWeight: 900,
      color: c.black,
      opacity: 0.5,
    }),
  ]);
}

function AltPost2({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.cyan,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 80 : 60,
  }, [
    txt('DATA', {
      fontSize: isStory ? 160 : 140,
      fontWeight: 900,
      color: c.black,
      letterSpacing: -8,
      lineHeight: 0.9,
    }),
    txt('WITHOUT', {
      fontSize: isStory ? 160 : 140,
      fontWeight: 900,
      color: c.black,
      letterSpacing: -8,
      lineHeight: 0.9,
    }),
    txt('BORDERS', {
      fontSize: isStory ? 160 : 140,
      fontWeight: 900,
      color: c.black,
      letterSpacing: -8,
      lineHeight: 0.9,
    }),
    // 2/3
    txt('2/3', {
      position: 'absolute',
      bottom: 40,
      right: 50,
      fontSize: 16,
      fontWeight: 900,
      color: c.black,
      opacity: 0.5,
    }),
  ]);
}

function AltPost3({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.yellow,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 60 : 50,
  }, [
    // Logo
    logoIcon ? img(logoIcon, {
      width: isStory ? 100 : 80,
      height: isStory ? 100 : 80,
      marginBottom: 24,
    }) : null,
    txt('LUMBUS', {
      fontSize: isStory ? 72 : 60,
      fontWeight: 900,
      color: c.black,
      letterSpacing: 4,
      marginBottom: 8,
    }),
    txt('ESIM FOR TRAVELERS', {
      fontSize: isStory ? 20 : 16,
      fontWeight: 700,
      color: c.black,
      opacity: 0.6,
      letterSpacing: 4,
      marginBottom: isStory ? 60 : 48,
    }),
    // Stats row
    el('div', {
      flexDirection: 'row',
      gap: isStory ? 40 : 32,
      marginBottom: isStory ? 60 : 48,
    }, [
      el('div', { alignItems: 'center' }, [
        txt('187+', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.black }),
        txt('Countries', { fontSize: 14, fontWeight: 600, color: c.black, opacity: 0.6 }),
      ]),
      el('div', { alignItems: 'center' }, [
        txt('$1.99', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.black }),
        txt('Starting', { fontSize: 14, fontWeight: 600, color: c.black, opacity: 0.6 }),
      ]),
      el('div', { alignItems: 'center' }, [
        txt('30s', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.black }),
        txt('Setup', { fontSize: 14, fontWeight: 600, color: c.black, opacity: 0.6 }),
      ]),
    ]),
    // CTA
    el('div', {
      padding: '20px 60px',
      backgroundColor: c.black,
      borderRadius: 100,
    }, txt('DOWNLOAD FREE', { fontSize: 18, fontWeight: 900, color: c.white })),
    txt('getlumbus.com', {
      fontSize: 14,
      fontWeight: 600,
      color: c.black,
      opacity: 0.5,
      marginTop: 20,
    }),
    // 3/3
    txt('3/3', {
      position: 'absolute',
      bottom: 40,
      right: 50,
      fontSize: 16,
      fontWeight: 900,
      color: c.black,
      opacity: 0.5,
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
  console.log('  ║   LUMBUS LAUNCH V3 - OFFICIAL COLORWAY                        ║');
  console.log('  ║   Flat • Bold • Rounded • Fun                                 ║');
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

  // SET A: Dark background with color accents
  console.log('  SET A: Dark + Color Accents');
  console.log('  ─────────────────────────────────────────────');
  await generateImage(Post1({ format: 'portrait' }), PT.w, PT.h, 'v3-A1-ig.png', fonts);
  await generateImage(Post2({ format: 'portrait' }), PT.w, PT.h, 'v3-A2-ig.png', fonts);
  await generateImage(Post3({ format: 'portrait' }), PT.w, PT.h, 'v3-A3-ig.png', fonts);
  await generateImage(Post1({ format: 'story' }), ST.w, ST.h, 'v3-A1-tiktok.png', fonts);
  await generateImage(Post2({ format: 'story' }), ST.w, ST.h, 'v3-A2-tiktok.png', fonts);
  await generateImage(Post3({ format: 'story' }), ST.w, ST.h, 'v3-A3-tiktok.png', fonts);

  // SET B: Full color backgrounds
  console.log('\n  SET B: Full Color Backgrounds');
  console.log('  ─────────────────────────────────────────────');
  await generateImage(AltPost1({ format: 'portrait' }), PT.w, PT.h, 'v3-B1-ig.png', fonts);
  await generateImage(AltPost2({ format: 'portrait' }), PT.w, PT.h, 'v3-B2-ig.png', fonts);
  await generateImage(AltPost3({ format: 'portrait' }), PT.w, PT.h, 'v3-B3-ig.png', fonts);
  await generateImage(AltPost1({ format: 'story' }), ST.w, ST.h, 'v3-B1-tiktok.png', fonts);
  await generateImage(AltPost2({ format: 'story' }), ST.w, ST.h, 'v3-B2-tiktok.png', fonts);
  await generateImage(AltPost3({ format: 'story' }), ST.w, ST.h, 'v3-B3-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   LAUNCH V3 COMPLETE!                                         ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Set A: Dark bg + color blocks/cards                         ║');
  console.log('  ║   Set B: Turquoise → Cyan → Yellow full color                ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/v3-*.png                  ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
