/**
 * LUMBUS LAUNCH POSTS - First 3 Instagram/TikTok Posts
 *
 * A stunning triptych featuring the brand colors:
 * - Turquoise/Cyan: #2EFECC
 * - Yellow: #FDFD74
 *
 * Post 1: "LUM" - Brand reveal part 1
 * Post 2: "BUS" - Brand reveal part 2
 * Post 3: "Travel Connected" - The tagline/value prop
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// Brand Colors
const c = {
  primary: '#2EFECC',      // Turquoise/Cyan
  secondary: '#FDFD74',    // Yellow
  accent: '#87EFFF',       // Light cyan
  white: '#FFFFFF',
  black: '#000000',
  dark: '#0A0A0A',
};

// Dimensions
const DIM = {
  PORTRAIT: { w: 1080, h: 1350 },
  STORY: { w: 1080, h: 1920 },
};

// Load assets
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

// Helpers
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
// POST 1: "LUM" - Bold intro with turquoise
// ═══════════════════════════════════════════════════════════════════════════

function Post1_LUM({ format = 'portrait' }) {
  const isStory = format === 'story';
  const fontSize = isStory ? 320 : 280;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.primary,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Subtle geometric shapes in background
    el('div', {
      position: 'absolute',
      top: isStory ? -100 : -50,
      right: -100,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: c.secondary,
      opacity: 0.3,
    }),
    el('div', {
      position: 'absolute',
      bottom: isStory ? 200 : 100,
      left: -150,
      width: 500,
      height: 500,
      borderRadius: 250,
      backgroundColor: c.white,
      opacity: 0.15,
    }),
    // Main text
    txt('LUM', {
      fontSize,
      fontWeight: 900,
      color: c.dark,
      letterSpacing: -15,
      lineHeight: 0.85,
    }),
    // Subtext
    txt('1/3', {
      position: 'absolute',
      bottom: isStory ? 100 : 60,
      fontSize: 18,
      fontWeight: 700,
      color: c.dark,
      opacity: 0.4,
      letterSpacing: 4,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 2: "BUS" - Bold continuation with yellow
// ═══════════════════════════════════════════════════════════════════════════

function Post2_BUS({ format = 'portrait' }) {
  const isStory = format === 'story';
  const fontSize = isStory ? 320 : 280;

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.secondary,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Subtle geometric shapes
    el('div', {
      position: 'absolute',
      top: isStory ? 200 : 100,
      left: -100,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: c.primary,
      opacity: 0.3,
    }),
    el('div', {
      position: 'absolute',
      bottom: -100,
      right: -150,
      width: 500,
      height: 500,
      borderRadius: 250,
      backgroundColor: c.white,
      opacity: 0.2,
    }),
    // Main text
    txt('BUS', {
      fontSize,
      fontWeight: 900,
      color: c.dark,
      letterSpacing: -15,
      lineHeight: 0.85,
    }),
    // Subtext
    txt('2/3', {
      position: 'absolute',
      bottom: isStory ? 100 : 60,
      fontSize: 18,
      fontWeight: 700,
      color: c.dark,
      opacity: 0.4,
      letterSpacing: 4,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST 3: Full brand with tagline - Split color design
// ═══════════════════════════════════════════════════════════════════════════

function Post3_Brand({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Top section - Turquoise
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '35%',
      backgroundColor: c.primary,
    }),
    // Yellow accent bar
    el('div', {
      position: 'absolute',
      top: '35%',
      left: 0,
      right: 0,
      height: isStory ? 12 : 8,
      backgroundColor: c.secondary,
    }),
    // Content
    el('div', {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      zIndex: 1,
    }, [
      // Logo
      logoIcon ? img(logoIcon, {
        width: isStory ? 120 : 100,
        height: isStory ? 120 : 100,
        marginBottom: 40,
      }) : el('div', {
        width: isStory ? 120 : 100,
        height: isStory ? 120 : 100,
        backgroundColor: c.primary,
        borderRadius: 24,
        marginBottom: 40,
      }),
      // LUMBUS
      txt('LUMBUS', {
        fontSize: isStory ? 120 : 96,
        fontWeight: 900,
        color: c.white,
        letterSpacing: -4,
        marginBottom: 24,
      }),
      // Tagline
      txt('Travel Connected', {
        fontSize: isStory ? 36 : 32,
        fontWeight: 500,
        color: c.primary,
        letterSpacing: 8,
        textTransform: 'uppercase',
        marginBottom: isStory ? 80 : 60,
      }),
      // Stats row
      el('div', {
        flexDirection: 'row',
        gap: isStory ? 60 : 48,
        marginBottom: isStory ? 60 : 40,
      }, [
        el('div', { flexDirection: 'column', alignItems: 'center' }, [
          txt('187+', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.secondary }),
          txt('Countries', { fontSize: 14, fontWeight: 600, color: c.white, opacity: 0.6, marginTop: 4 }),
        ]),
        el('div', { flexDirection: 'column', alignItems: 'center' }, [
          txt('$1.99', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.secondary }),
          txt('Starting', { fontSize: 14, fontWeight: 600, color: c.white, opacity: 0.6, marginTop: 4 }),
        ]),
        el('div', { flexDirection: 'column', alignItems: 'center' }, [
          txt('30s', { fontSize: isStory ? 48 : 40, fontWeight: 900, color: c.secondary }),
          txt('Setup', { fontSize: 14, fontWeight: 600, color: c.white, opacity: 0.6, marginTop: 4 }),
        ]),
      ]),
      // CTA
      el('div', {
        padding: '20px 60px',
        backgroundColor: c.primary,
        borderRadius: 100,
        marginTop: isStory ? 40 : 20,
      }, [
        txt('Download Free', { fontSize: 20, fontWeight: 800, color: c.dark }),
      ]),
    ]),
    // Bottom URL
    txt('getlumbus.com', {
      position: 'absolute',
      bottom: isStory ? 80 : 50,
      fontSize: 16,
      fontWeight: 600,
      color: c.white,
      opacity: 0.4,
      letterSpacing: 2,
    }),
    // 3/3 indicator
    txt('3/3', {
      position: 'absolute',
      bottom: isStory ? 100 : 60,
      right: 60,
      fontSize: 18,
      fontWeight: 700,
      color: c.white,
      opacity: 0.4,
      letterSpacing: 4,
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// ALTERNATIVE: Gradient style posts
// ═══════════════════════════════════════════════════════════════════════════

function AltPost1_Gradient({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 50%, ${c.secondary} 100%)`,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }, [
    // Large L
    txt('L', {
      fontSize: isStory ? 600 : 500,
      fontWeight: 900,
      color: c.dark,
      opacity: 0.15,
      position: 'absolute',
    }),
    // Logo
    logoIcon ? img(logoIcon, {
      width: isStory ? 200 : 160,
      height: isStory ? 200 : 160,
    }) : null,
    // Brand name
    txt('LUMBUS', {
      fontSize: isStory ? 72 : 60,
      fontWeight: 900,
      color: c.dark,
      letterSpacing: 8,
      marginTop: 40,
    }),
    txt('eSIM for Travelers', {
      fontSize: isStory ? 28 : 24,
      fontWeight: 600,
      color: c.dark,
      opacity: 0.7,
      marginTop: 16,
    }),
  ]);
}

function AltPost2_Features({ format = 'portrait' }) {
  const isStory = format === 'story';

  const features = [
    { number: '187+', label: 'Countries' },
    { number: '$1.99', label: 'Starting Price' },
    { number: '30s', label: 'Instant Setup' },
    { number: '90%', label: 'Save vs Roaming' },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    flexDirection: 'column',
    padding: isStory ? 80 : 60,
    position: 'relative',
  }, [
    // Accent shapes
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '40%',
      height: 8,
      backgroundColor: c.primary,
    }),
    el('div', {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '40%',
      height: 8,
      backgroundColor: c.secondary,
    }),
    // Header
    el('div', { marginBottom: isStory ? 80 : 60 }, [
      txt('WHY', { fontSize: isStory ? 24 : 20, fontWeight: 800, color: c.primary, letterSpacing: 8 }),
      txt('LUMBUS?', { fontSize: isStory ? 80 : 64, fontWeight: 900, color: c.white, letterSpacing: -2 }),
    ]),
    // Features grid
    el('div', {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: isStory ? 48 : 36,
    }, features.map((f, i) =>
      el('div', {
        flexDirection: 'row',
        alignItems: 'center',
        padding: isStory ? 32 : 24,
        backgroundColor: i % 2 === 0 ? 'rgba(46, 254, 204, 0.1)' : 'rgba(253, 253, 116, 0.1)',
        borderRadius: 20,
        borderLeft: `4px solid ${i % 2 === 0 ? c.primary : c.secondary}`,
      }, [
        txt(f.number, {
          fontSize: isStory ? 56 : 44,
          fontWeight: 900,
          color: i % 2 === 0 ? c.primary : c.secondary,
          width: isStory ? 200 : 160,
        }),
        txt(f.label, {
          fontSize: isStory ? 28 : 22,
          fontWeight: 600,
          color: c.white,
        }),
      ])
    )),
    // Footer
    txt('getlumbus.com', {
      fontSize: 16,
      fontWeight: 600,
      color: c.white,
      opacity: 0.4,
      marginTop: isStory ? 60 : 40,
      alignSelf: 'center',
    }),
  ]);
}

function AltPost3_CTA({ format = 'portrait' }) {
  const isStory = format === 'story';

  return el('div', {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.dark,
  }, [
    // Top accent bar
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 12,
      backgroundColor: c.primary,
    }),
    // Bottom accent bar
    el('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 12,
      backgroundColor: c.secondary,
    }),
    // Logo
    logoIcon ? img(logoIcon, {
      width: isStory ? 120 : 100,
      height: isStory ? 120 : 100,
      marginBottom: 40,
    }) : null,
    txt('Ready to', {
      fontSize: isStory ? 32 : 28,
      fontWeight: 500,
      color: '#888',
    }),
    txt('Travel Smart?', {
      fontSize: isStory ? 80 : 64,
      fontWeight: 900,
      color: c.white,
      marginBottom: 48,
    }),
    // Tags
    el('div', {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 48,
    }, [
      el('div', {
        padding: '16px 32px',
        backgroundColor: c.primary,
        borderRadius: 100,
      }, txt('187+ Countries', { fontSize: 18, fontWeight: 700, color: c.dark })),
      el('div', {
        padding: '16px 32px',
        backgroundColor: c.secondary,
        borderRadius: 100,
      }, txt('From $1.99', { fontSize: 18, fontWeight: 700, color: c.dark })),
    ]),
    // CTA
    el('div', {
      padding: '24px 80px',
      backgroundColor: c.white,
      borderRadius: 100,
    }, txt('Download Free', { fontSize: isStory ? 24 : 20, fontWeight: 900, color: c.dark })),
    txt('Available on iOS & Android', {
      fontSize: 16,
      fontWeight: 500,
      color: '#666',
      marginTop: 24,
    }),
    // URL
    txt('getlumbus.com', {
      position: 'absolute',
      bottom: isStory ? 80 : 50,
      fontSize: 16,
      fontWeight: 600,
      color: '#444',
      letterSpacing: 2,
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
  console.log('  ║   LUMBUS LAUNCH POSTS                                         ║');
  console.log('  ║   First 3 Instagram & TikTok Posts                            ║');
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

  // ═══════════════════════════════════════════════════════════════════════
  // OPTION A: LUM | BUS | Brand Reveal (Triptych)
  // ═══════════════════════════════════════════════════════════════════════

  console.log('  OPTION A: Brand Reveal Triptych');
  console.log('  ─────────────────────────────────────────────');

  // Instagram (Portrait)
  await generateImage(Post1_LUM({ format: 'portrait' }), PT.w, PT.h, 'launch-A1-lum-ig.png', fonts);
  await generateImage(Post2_BUS({ format: 'portrait' }), PT.w, PT.h, 'launch-A2-bus-ig.png', fonts);
  await generateImage(Post3_Brand({ format: 'portrait' }), PT.w, PT.h, 'launch-A3-brand-ig.png', fonts);

  // TikTok/Stories
  await generateImage(Post1_LUM({ format: 'story' }), ST.w, ST.h, 'launch-A1-lum-tiktok.png', fonts);
  await generateImage(Post2_BUS({ format: 'story' }), ST.w, ST.h, 'launch-A2-bus-tiktok.png', fonts);
  await generateImage(Post3_Brand({ format: 'story' }), ST.w, ST.h, 'launch-A3-brand-tiktok.png', fonts);

  // ═══════════════════════════════════════════════════════════════════════
  // OPTION B: Gradient | Features | CTA
  // ═══════════════════════════════════════════════════════════════════════

  console.log('\n  OPTION B: Brand Story Flow');
  console.log('  ─────────────────────────────────────────────');

  // Instagram (Portrait)
  await generateImage(AltPost1_Gradient({ format: 'portrait' }), PT.w, PT.h, 'launch-B1-intro-ig.png', fonts);
  await generateImage(AltPost2_Features({ format: 'portrait' }), PT.w, PT.h, 'launch-B2-features-ig.png', fonts);
  await generateImage(AltPost3_CTA({ format: 'portrait' }), PT.w, PT.h, 'launch-B3-cta-ig.png', fonts);

  // TikTok/Stories
  await generateImage(AltPost1_Gradient({ format: 'story' }), ST.w, ST.h, 'launch-B1-intro-tiktok.png', fonts);
  await generateImage(AltPost2_Features({ format: 'story' }), ST.w, ST.h, 'launch-B2-features-tiktok.png', fonts);
  await generateImage(AltPost3_CTA({ format: 'story' }), ST.w, ST.h, 'launch-B3-cta-tiktok.png', fonts);

  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║   LAUNCH POSTS COMPLETE!                                      ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Option A: LUM → BUS → LUMBUS (Brand Reveal)                 ║');
  console.log('  ║   Option B: Intro → Features → CTA (Story Flow)              ║');
  console.log('  ║                                                               ║');
  console.log('  ║   Output: marketing/ultimate/output/launch-*.png              ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(console.error);
