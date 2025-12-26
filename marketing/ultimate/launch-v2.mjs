/**
 * LUMBUS LAUNCH V2 - WORLD CLASS DESIGN
 *
 * Three colors: Cyan (#2EFECC), Yellow (#FDFD74), Light Blue (#87EFFF)
 * Premium, scroll-stopping designs
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// The THREE main colors
const c = {
  cyan: '#2EFECC',      // Primary turquoise
  yellow: '#FDFD74',    // Secondary yellow
  blue: '#87EFFF',      // Accent light blue
  white: '#FFFFFF',
  black: '#000000',
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
// POST 1: THE LOGO - Bold, centered, all three colors in background
// ═══════════════════════════════════════════════════════════════════════════

function Post1_Logo({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Three color bars - diagonal stripes in background
    el('div', {
      position: 'absolute',
      top: 0,
      left: '-20%',
      width: '50%',
      height: '100%',
      backgroundColor: c.cyan,
      transform: 'skewX(-15deg)',
      opacity: 0.9,
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      left: '25%',
      width: '35%',
      height: '100%',
      backgroundColor: c.blue,
      transform: 'skewX(-15deg)',
      opacity: 0.9,
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      left: '55%',
      width: '65%',
      height: '100%',
      backgroundColor: c.yellow,
      transform: 'skewX(-15deg)',
      opacity: 0.9,
    }),
    // Dark overlay for depth
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    }),
    // Logo
    logoIcon ? img(logoIcon, {
      width: isStory ? 280 : 240,
      height: isStory ? 280 : 240,
      marginBottom: 40,
    }) : el('div', {
      width: isStory ? 280 : 240,
      height: isStory ? 280 : 240,
      backgroundColor: c.cyan,
      borderRadius: 60,
      marginBottom: 40,
    }),
    // Brand name
    txt('LUMBUS', {
      fontSize: isStory ? 96 : 80,
      fontWeight: 900,
      color: c.white,
      letterSpacing: 8,
    }),
    // Tagline
    txt('eSIM for Travelers', {
      fontSize: isStory ? 28 : 24,
      fontWeight: 500,
      color: c.white,
      opacity: 0.8,
      marginTop: 16,
    }),
    // 1/3 indicator
    txt('1/3', {
      position: 'absolute',
      bottom: isStory ? 80 : 50,
      right: 60,
      fontSize: 16,
      fontWeight: 700,
      color: c.white,
      opacity: 0.5,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: THE VALUE PROP - Three colored cards showing key benefits
// ═══════════════════════════════════════════════════════════════════════════

function Post2_Values({ format = 'portrait' }) {
  const isStory = format === 'story';

  const cards = [
    { color: c.cyan, number: '187+', label: 'Countries', sublabel: 'Worldwide Coverage' },
    { color: c.blue, number: '$1.99', label: 'Starting', sublabel: 'No Hidden Fees' },
    { color: c.yellow, number: '30s', label: 'Setup', sublabel: 'Instant Activation' },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    padding: isStory ? 60 : 50,
    position: 'relative',
  }, [
    // Header
    el('div', {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: isStory ? 60 : 40,
    }, [
      logoIcon ? img(logoIcon, { width: 48, height: 48 }) : null,
      txt('LUMBUS', {
        fontSize: 28,
        fontWeight: 900,
        color: c.white,
        letterSpacing: 4,
      }),
    ]),
    // Title
    txt('Why travelers', {
      fontSize: isStory ? 48 : 40,
      fontWeight: 400,
      color: c.white,
      opacity: 0.7,
    }),
    txt('choose us', {
      fontSize: isStory ? 72 : 60,
      fontWeight: 900,
      color: c.white,
      marginBottom: isStory ? 60 : 40,
    }),
    // Cards - vertical stack
    el('div', {
      flex: 1,
      flexDirection: 'column',
      gap: isStory ? 24 : 20,
      justifyContent: 'center',
    }, cards.map((card, i) =>
      el('div', {
        flexDirection: 'row',
        alignItems: 'center',
        padding: isStory ? 32 : 28,
        backgroundColor: card.color,
        borderRadius: 24,
      }, [
        txt(card.number, {
          fontSize: isStory ? 64 : 52,
          fontWeight: 900,
          color: c.dark,
          width: isStory ? 200 : 160,
        }),
        el('div', { flexDirection: 'column' }, [
          txt(card.label, {
            fontSize: isStory ? 28 : 24,
            fontWeight: 800,
            color: c.dark,
          }),
          txt(card.sublabel, {
            fontSize: isStory ? 18 : 16,
            fontWeight: 500,
            color: c.dark,
            opacity: 0.7,
          }),
        ]),
      ])
    )),
    // Footer
    el('div', {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: isStory ? 40 : 30,
    }, [
      txt('getlumbus.com', {
        fontSize: 16,
        fontWeight: 600,
        color: c.white,
        opacity: 0.5,
      }),
      txt('2/3', {
        fontSize: 16,
        fontWeight: 700,
        color: c.white,
        opacity: 0.5,
      }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: THE CTA - Bold call to action with three-color gradient effect
// ═══════════════════════════════════════════════════════════════════════════

function Post3_CTA({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Three circles in background - the brand colors
    el('div', {
      position: 'absolute',
      top: isStory ? -200 : -150,
      left: -100,
      width: isStory ? 500 : 400,
      height: isStory ? 500 : 400,
      borderRadius: 999,
      backgroundColor: c.cyan,
      opacity: 0.6,
    }),
    el('div', {
      position: 'absolute',
      top: isStory ? 300 : 200,
      right: -150,
      width: isStory ? 450 : 350,
      height: isStory ? 450 : 350,
      borderRadius: 999,
      backgroundColor: c.blue,
      opacity: 0.5,
    }),
    el('div', {
      position: 'absolute',
      bottom: isStory ? -100 : -80,
      left: '30%',
      width: isStory ? 400 : 300,
      height: isStory ? 400 : 300,
      borderRadius: 999,
      backgroundColor: c.yellow,
      opacity: 0.6,
    }),
    // Content
    el('div', {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 60,
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 100 : 80,
        height: isStory ? 100 : 80,
        marginBottom: 40,
      }) : null,
      // Main text
      txt('Ready to', {
        fontSize: isStory ? 36 : 32,
        fontWeight: 400,
        color: c.white,
        opacity: 0.8,
      }),
      txt('Travel', {
        fontSize: isStory ? 120 : 96,
        fontWeight: 900,
        color: c.white,
        letterSpacing: -4,
      }),
      txt('Connected?', {
        fontSize: isStory ? 120 : 96,
        fontWeight: 900,
        color: c.cyan,
        letterSpacing: -4,
        marginBottom: isStory ? 60 : 48,
      }),
      // Three color pills with features
      el('div', {
        flexDirection: 'row',
        gap: 12,
        marginBottom: isStory ? 48 : 40,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }, [
        el('div', {
          padding: '14px 28px',
          backgroundColor: c.cyan,
          borderRadius: 100,
        }, txt('187+ Countries', { fontSize: 16, fontWeight: 700, color: c.dark })),
        el('div', {
          padding: '14px 28px',
          backgroundColor: c.blue,
          borderRadius: 100,
        }, txt('Instant Setup', { fontSize: 16, fontWeight: 700, color: c.dark })),
        el('div', {
          padding: '14px 28px',
          backgroundColor: c.yellow,
          borderRadius: 100,
        }, txt('From $1.99', { fontSize: 16, fontWeight: 700, color: c.dark })),
      ]),
      // CTA Button
      el('div', {
        padding: '24px 80px',
        backgroundColor: c.white,
        borderRadius: 100,
      }, txt('Download Free', { fontSize: isStory ? 24 : 20, fontWeight: 900, color: c.dark })),
      // Subtitle
      txt('iOS & Android', {
        fontSize: 16,
        fontWeight: 500,
        color: c.white,
        opacity: 0.6,
        marginTop: 20,
      }),
    ]),
    // Footer
    el('div', {
      position: 'absolute',
      bottom: isStory ? 80 : 50,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      padding: '0 60px',
    }, [
      txt('getlumbus.com', {
        fontSize: 16,
        fontWeight: 600,
        color: c.white,
        opacity: 0.5,
      }),
      txt('3/3', {
        fontSize: 16,
        fontWeight: 700,
        color: c.white,
        opacity: 0.5,
      }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// ALTERNATE SET: More minimal/premium
// ═══════════════════════════════════════════════════════════════════════════

function AltPost1_Minimal({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }, [
    // Three horizontal bars at top
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
    }, [
      el('div', { flex: 1, height: 8, backgroundColor: c.cyan }),
      el('div', { flex: 1, height: 8, backgroundColor: c.blue }),
      el('div', { flex: 1, height: 8, backgroundColor: c.yellow }),
    ]),
    // Logo large
    logoIcon ? img(logoIcon, {
      width: isStory ? 320 : 280,
      height: isStory ? 320 : 280,
    }) : null,
    // Three horizontal bars at bottom
    el('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
    }, [
      el('div', { flex: 1, height: 8, backgroundColor: c.cyan }),
      el('div', { flex: 1, height: 8, backgroundColor: c.blue }),
      el('div', { flex: 1, height: 8, backgroundColor: c.yellow }),
    ]),
    // 1/3
    txt('1/3', {
      position: 'absolute',
      bottom: isStory ? 60 : 40,
      right: 60,
      fontSize: 14,
      fontWeight: 700,
      color: c.white,
      opacity: 0.4,
    }),
  ]);
}

function AltPost2_Typography({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isStory ? 80 : 60,
    position: 'relative',
  }, [
    // Three bars at top
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
    }, [
      el('div', { flex: 1, height: 8, backgroundColor: c.cyan }),
      el('div', { flex: 1, height: 8, backgroundColor: c.blue }),
      el('div', { flex: 1, height: 8, backgroundColor: c.yellow }),
    ]),
    // Stacked text with different colors
    el('div', {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
    }, [
      txt('DATA', {
        fontSize: isStory ? 140 : 120,
        fontWeight: 900,
        color: c.cyan,
        letterSpacing: -6,
        lineHeight: 0.9,
      }),
      txt('WITHOUT', {
        fontSize: isStory ? 140 : 120,
        fontWeight: 900,
        color: c.blue,
        letterSpacing: -6,
        lineHeight: 0.9,
      }),
      txt('BORDERS', {
        fontSize: isStory ? 140 : 120,
        fontWeight: 900,
        color: c.yellow,
        letterSpacing: -6,
        lineHeight: 0.9,
      }),
    ]),
    // Three bars at bottom
    el('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
    }, [
      el('div', { flex: 1, height: 8, backgroundColor: c.cyan }),
      el('div', { flex: 1, height: 8, backgroundColor: c.blue }),
      el('div', { flex: 1, height: 8, backgroundColor: c.yellow }),
    ]),
    // 2/3
    txt('2/3', {
      position: 'absolute',
      bottom: isStory ? 60 : 40,
      right: 60,
      fontSize: 14,
      fontWeight: 700,
      color: c.white,
      opacity: 0.4,
    }),
  ]);
}

function AltPost3_Final({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    position: 'relative',
  }, [
    // Top third - Cyan
    el('div', {
      height: '33.33%',
      backgroundColor: c.cyan,
      alignItems: 'center',
      justifyContent: 'center',
    }, [
      txt('187+ Countries', {
        fontSize: isStory ? 48 : 40,
        fontWeight: 900,
        color: c.dark,
      }),
    ]),
    // Middle third - Blue
    el('div', {
      height: '33.33%',
      backgroundColor: c.blue,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }, [
      logoIcon ? img(logoIcon, {
        width: isStory ? 80 : 64,
        height: isStory ? 80 : 64,
        marginBottom: 16,
      }) : null,
      txt('LUMBUS', {
        fontSize: isStory ? 64 : 52,
        fontWeight: 900,
        color: c.dark,
        letterSpacing: 4,
      }),
    ]),
    // Bottom third - Yellow
    el('div', {
      height: '33.33%',
      backgroundColor: c.yellow,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }, [
      txt('From $1.99', {
        fontSize: isStory ? 48 : 40,
        fontWeight: 900,
        color: c.dark,
        marginBottom: 20,
      }),
      el('div', {
        padding: '16px 48px',
        backgroundColor: c.dark,
        borderRadius: 100,
      }, txt('Download Free', { fontSize: 18, fontWeight: 800, color: c.white })),
    ]),
    // 3/3 indicator
    txt('3/3', {
      position: 'absolute',
      bottom: 20,
      right: 30,
      fontSize: 14,
      fontWeight: 700,
      color: c.dark,
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
  console.log('  ║   LUMBUS LAUNCH V2 - WORLD CLASS                              ║');
  console.log('  ║   Three Colors: Cyan + Blue + Yellow                          ║');
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

  // SET A: Dynamic stripes and circles
  console.log('  SET A: Dynamic & Bold');
  console.log('  ─────────────────────────────────────────────');
  await generateImage(Post1_Logo({ format: 'portrait' }), PT.w, PT.h, 'v2-A1-logo-ig.png', fonts);
  await generateImage(Post2_Values({ format: 'portrait' }), PT.w, PT.h, 'v2-A2-values-ig.png', fonts);
  await generateImage(Post3_CTA({ format: 'portrait' }), PT.w, PT.h, 'v2-A3-cta-ig.png', fonts);
  await generateImage(Post1_Logo({ format: 'story' }), ST.w, ST.h, 'v2-A1-logo-tiktok.png', fonts);
  await generateImage(Post2_Values({ format: 'story' }), ST.w, ST.h, 'v2-A2-values-tiktok.png', fonts);
  await generateImage(Post3_CTA({ format: 'story' }), ST.w, ST.h, 'v2-A3-cta-tiktok.png', fonts);

  // SET B: Minimal & Premium
  console.log('\n  SET B: Minimal & Premium');
  console.log('  ─────────────────────────────────────────────');
  await generateImage(AltPost1_Minimal({ format: 'portrait' }), PT.w, PT.h, 'v2-B1-minimal-ig.png', fonts);
  await generateImage(AltPost2_Typography({ format: 'portrait' }), PT.w, PT.h, 'v2-B2-type-ig.png', fonts);
  await generateImage(AltPost3_Final({ format: 'portrait' }), PT.w, PT.h, 'v2-B3-final-ig.png', fonts);
  await generateImage(AltPost1_Minimal({ format: 'story' }), ST.w, ST.h, 'v2-B1-minimal-tiktok.png', fonts);
  await generateImage(AltPost2_Typography({ format: 'story' }), ST.w, ST.h, 'v2-B2-type-tiktok.png', fonts);
  await generateImage(AltPost3_Final({ format: 'story' }), ST.w, ST.h, 'v2-B3-final-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   LAUNCH V2 COMPLETE!                                         ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Set A: Dynamic stripes/circles with all 3 colors            ║');
  console.log('  ║   Set B: Minimal premium with color bars                      ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/v2-*.png                  ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
