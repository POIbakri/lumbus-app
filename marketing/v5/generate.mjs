/**
 * LUMBUS V5 - ULTRA PREMIUM VIRAL CONTENT
 *
 * Design principles:
 * - FULL BLEED FLAGS as backgrounds
 * - MINIMAL text, MAXIMUM impact
 * - Clean, Instagram-worthy aesthetic
 * - Bold typography that POPS
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// Colors
const c = {
  primary: '#2EFECC',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  white: '#FFFFFF',
  black: '#000000',
  dark: '#111111',
  gray: '#888888',
  red: '#FF3B30',
};

// Dimensions
const SQ = { w: 1080, h: 1080 };
const ST = { w: 1080, h: 1920 };

// Assets
let logo = null;
let logoLong = null;
const flags = {};

async function loadAssets() {
  // Logo
  try {
    const buf = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logo = `data:image/png;base64,${buf.toString('base64')}`;
  } catch(e) {}

  try {
    const buf = await fs.readFile(path.join(ROOT, 'assets', 'logotrans.png'));
    logoLong = `data:image/png;base64,${buf.toString('base64')}`;
  } catch(e) {}

  // Flags - high quality from flagcdn
  const codes = ['jp','th','fr','it','au','de','es','gb','us','sg','kr','id','br','mx','vn','nl','pt','gr','tr','ae','nz','my','ph','ca'];
  console.log('  Loading flags...');

  for (const code of codes) {
    try {
      const res = await fetch(`https://flagcdn.com/w640/${code}.png`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        flags[code] = `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch(e) {}
  }
  console.log(`  ✓ ${Object.keys(flags).length} flags`);
}

// Helpers
const el = (type, style, children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children }
});

const txt = (content, style) => ({
  type: 'span',
  props: { style, children: content }
});

const image = (src, style) => ({
  type: 'img',
  props: { src, style }
});

// Components
function Logo({ size = 48 }) {
  if (logo) return image(logo, { width: size, height: size });
  return el('div', {
    width: size, height: size, borderRadius: 12,
    backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center'
  }, txt('L', { fontSize: size * 0.5, fontWeight: 900, color: c.black }));
}

function LogoLong({ h = 36 }) {
  if (logoLong) return image(logoLong, { height: h });
  return el('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
    Logo({ size: h }),
    txt('lumbus', { fontSize: h * 0.8, fontWeight: 700, color: c.white })
  ]);
}

// ═══════════════════════════════════════════════════════════
// COUNTRY POSTS - Full bleed flag background
// ═══════════════════════════════════════════════════════════

function CountryPost({ name, code, price }) {
  const flag = flags[code];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
    position: 'relative',
  }, [
    // Full bleed flag
    flag && image(flag, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }),
    // Dark gradient overlay
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
    }),
    // Content
    el('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 80,
    }, [
      txt(name.toUpperCase(), {
        fontSize: 96,
        fontWeight: 900,
        color: c.white,
        letterSpacing: -2,
        marginBottom: 16,
      }),
      el('div', { flexDirection: 'row', alignItems: 'center', gap: 24 }, [
        el('div', {
          padding: '16px 32px',
          backgroundColor: c.primary,
          borderRadius: 100,
        }, txt(`From ${price}`, { fontSize: 28, fontWeight: 700, color: c.black })),
        txt('Instant eSIM', { fontSize: 24, color: c.white, opacity: 0.8 }),
      ]),
    ]),
    // Logo top
    el('div', { position: 'absolute', top: 60, left: 60 }, Logo({ size: 56 })),
  ]);
}

// Story version
function CountryStory({ name, code, price }) {
  const flag = flags[code];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
  }, [
    // Full bleed flag
    flag && image(flag, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }),
    // Gradient
    el('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%)',
    }),
    // Content
    el('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 80,
      alignItems: 'center',
    }, [
      txt(name.toUpperCase(), {
        fontSize: 120,
        fontWeight: 900,
        color: c.white,
        textAlign: 'center',
        letterSpacing: -3,
        marginBottom: 32,
      }),
      el('div', {
        padding: '24px 56px',
        backgroundColor: c.primary,
        borderRadius: 100,
        marginBottom: 32,
      }, txt(`From ${price}`, { fontSize: 36, fontWeight: 700, color: c.black })),
      txt('Swipe up to get your eSIM', { fontSize: 24, color: c.white, opacity: 0.7 }),
    ]),
    // Logo
    el('div', { position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center' },
      Logo({ size: 64 })
    ),
  ]);
}

// ═══════════════════════════════════════════════════════════
// POV POST - Clean, trendy
// ═══════════════════════════════════════════════════════════

function POVPost({ country, code }) {
  const flag = flags[code];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    padding: 80,
  }, [
    // POV label
    txt('POV', {
      fontSize: 24,
      fontWeight: 700,
      color: c.gray,
      letterSpacing: 8,
      marginBottom: 48,
    }),
    // Main content
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('You just landed in', { fontSize: 48, color: c.white, marginBottom: 32 }),
      // Flag circle
      el('div', { flexDirection: 'row', alignItems: 'center', gap: 32, marginBottom: 32 }, [
        flag && el('div', {
          width: 120,
          height: 120,
          borderRadius: 60,
          overflow: 'hidden',
        }, image(flag, { width: 180, height: 120, objectFit: 'cover' })),
        txt(country, { fontSize: 80, fontWeight: 900, color: c.primary }),
      ]),
      txt('and your data', { fontSize: 48, color: c.white }),
      txt('already works.', { fontSize: 64, fontWeight: 900, color: c.primary }),
    ]),
    // Footer
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      Logo({ size: 48 }),
      txt('getlumbus.com', { fontSize: 20, color: c.gray }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════
// COMPARISON - Clean split
// ═══════════════════════════════════════════════════════════

function ComparisonPost() {
  return el('div', {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  }, [
    // Left - Bad
    el('div', {
      flex: 1,
      backgroundColor: '#1a1a1a',
      padding: 60,
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      txt('Roaming', { fontSize: 24, color: c.gray, marginBottom: 16 }),
      txt('$300+', { fontSize: 96, fontWeight: 900, color: c.red }),
      txt('😬', { fontSize: 80, marginTop: 24 }),
    ]),
    // Right - Good
    el('div', {
      flex: 1,
      backgroundColor: c.primary,
      padding: 60,
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      txt('Lumbus', { fontSize: 24, color: c.black, marginBottom: 16 }),
      txt('$4.99', { fontSize: 96, fontWeight: 900, color: c.black }),
      txt('😎', { fontSize: 80, marginTop: 24 }),
      el('div', { marginTop: 32 }, Logo({ size: 48 })),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════
// BOLD STAT - Maximum impact
// ═══════════════════════════════════════════════════════════

function BoldStatPost({ stat, label }) {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  }, [
    txt(stat, {
      fontSize: 320,
      fontWeight: 900,
      color: c.primary,
      lineHeight: 0.85,
    }),
    txt(label, {
      fontSize: 48,
      fontWeight: 600,
      color: c.white,
      marginTop: 32,
      textAlign: 'center',
    }),
    el('div', { position: 'absolute', bottom: 80, alignItems: 'center' }, [
      Logo({ size: 48 }),
      txt('getlumbus.com', { fontSize: 18, color: c.gray, marginTop: 16 }),
    ]),
  ]);
}

// Story version
function BoldStatStory({ stat, label }) {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  }, [
    el('div', { position: 'absolute', top: 100 }, Logo({ size: 64 })),
    txt(stat, {
      fontSize: 400,
      fontWeight: 900,
      color: c.primary,
      lineHeight: 0.8,
    }),
    txt(label, {
      fontSize: 56,
      fontWeight: 600,
      color: c.white,
      marginTop: 48,
      textAlign: 'center',
    }),
    el('div', { position: 'absolute', bottom: 160 }, [
      el('div', {
        padding: '28px 72px',
        backgroundColor: c.primary,
        borderRadius: 100,
      }, txt('Swipe up', { fontSize: 32, fontWeight: 700, color: c.black })),
    ]),
    el('div', { position: 'absolute', bottom: 80 },
      txt('getlumbus.com', { fontSize: 20, color: c.gray })
    ),
  ]);
}

// ═══════════════════════════════════════════════════════════
// PROMO - Clean, bold
// ═══════════════════════════════════════════════════════════

function PromoPost({ discount, code }) {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  }, [
    txt('LIMITED TIME', {
      fontSize: 20,
      fontWeight: 700,
      color: c.gray,
      letterSpacing: 8,
      marginBottom: 40,
    }),
    txt(discount, {
      fontSize: 240,
      fontWeight: 900,
      color: c.white,
      lineHeight: 0.9,
    }),
    txt('OFF', {
      fontSize: 80,
      fontWeight: 900,
      color: c.primary,
    }),
    el('div', {
      marginTop: 56,
      padding: '24px 56px',
      backgroundColor: c.primary,
      borderRadius: 16,
    }, [
      txt(code, { fontSize: 36, fontWeight: 900, color: c.black }),
    ]),
    el('div', { position: 'absolute', bottom: 80 }, Logo({ size: 48 })),
  ]);
}

// ═══════════════════════════════════════════════════════════
// REGIONAL BUNDLE - Flags grid
// ═══════════════════════════════════════════════════════════

function RegionPost({ name, codes, count, price }) {
  return el('div', {
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 100%)`,
    padding: 80,
  }, [
    // Header
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }, [
      txt('REGIONAL', { fontSize: 18, fontWeight: 700, color: c.black, letterSpacing: 4 }),
      Logo({ size: 48 }),
    ]),
    // Title
    txt(name, { fontSize: 72, fontWeight: 900, color: c.black, marginBottom: 8 }),
    txt(`${count} countries`, { fontSize: 28, color: 'rgba(0,0,0,0.7)', marginBottom: 40 }),
    // Flags
    el('div', {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      alignContent: 'center',
    }, codes.map(code =>
      flags[code] && el('div', {
        width: 100,
        height: 70,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }, image(flags[code], { width: 100, height: 70, objectFit: 'cover' }))
    )),
    // Price
    el('div', {
      padding: 32,
      backgroundColor: c.white,
      borderRadius: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, [
      el('div', {}, [
        txt('From', { fontSize: 16, color: c.gray }),
        txt(price, { fontSize: 48, fontWeight: 900, color: c.black }),
      ]),
      el('div', {
        padding: '16px 32px',
        backgroundColor: c.black,
        borderRadius: 16,
      }, txt('Get now', { fontSize: 20, fontWeight: 700, color: c.white })),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════
// MEME FORMATS
// ═══════════════════════════════════════════════════════════

// Netflix parody
function NetflixPost() {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  }, [
    txt('Are you still', { fontSize: 48, color: c.white, marginBottom: 8 }),
    txt('paying', { fontSize: 48, color: c.white, marginBottom: 24 }),
    txt('$15/MB', { fontSize: 140, fontWeight: 900, color: '#E50914' }),
    txt('for roaming?', { fontSize: 48, color: c.white, marginTop: 24, marginBottom: 64 }),
    el('div', { flexDirection: 'column', gap: 16, width: 600 }, [
      el('div', {
        padding: '20px 40px',
        backgroundColor: c.white,
        borderRadius: 8,
        alignItems: 'center',
      }, txt('Keep overpaying', { fontSize: 22, fontWeight: 600, color: c.black })),
      el('div', {
        padding: '20px 40px',
        backgroundColor: c.primary,
        borderRadius: 8,
        alignItems: 'center',
      }, txt('Switch to Lumbus → $4.99', { fontSize: 22, fontWeight: 700, color: c.black })),
    ]),
  ]);
}

// Group chat
function GroupChatPost() {
  const msgs = [
    { name: 'Sarah', color: '#25D366', text: 'how are u posting from bali already??', self: false },
    { name: '', color: '', text: 'esim bro. took 30 seconds', self: true },
    { name: 'Mike', color: '#53BDEB', text: 'what how much', self: false },
    { name: '', color: '', text: '$5. getlumbus.com', self: true },
    { name: 'Sarah', color: '#25D366', text: 'downloading rn 🙌', self: false },
  ];

  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B141A',
    padding: 40,
  }, [
    // Header
    el('div', {
      padding: 20,
      backgroundColor: '#1F2C34',
      borderRadius: 0,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    }, [
      el('div', {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#2A3942', alignItems: 'center', justifyContent: 'center'
      }, txt('🌴', { fontSize: 28 })),
      el('div', {}, [
        txt('Bali Trip 2024', { fontSize: 20, fontWeight: 600, color: c.white }),
        txt('Sarah, Mike, You', { fontSize: 14, color: '#8696A0' }),
      ]),
    ]),
    // Messages
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 12 },
      msgs.map(m =>
        el('div', { alignSelf: m.self ? 'flex-end' : 'flex-start', maxWidth: '75%' }, [
          !m.self && txt(m.name, { fontSize: 14, fontWeight: 600, color: m.color, marginLeft: 12, marginBottom: 4 }),
          el('div', {
            padding: '12px 18px',
            backgroundColor: m.self ? '#005C4B' : '#1F2C34',
            borderRadius: 16,
          }, txt(m.text, { fontSize: 20, color: c.white })),
        ])
      )
    ),
    // Footer
    el('div', { alignItems: 'center', marginTop: 24 }, [
      Logo({ size: 36 }),
      txt('Be the friend who knows', { fontSize: 16, color: '#8696A0', marginTop: 12 }),
    ]),
  ]);
}

// iMessage
function iMessagePost() {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.white,
    padding: 48,
  }, [
    // Header
    el('div', {
      padding: '16px 0',
      borderBottom: '1px solid #E5E5E5',
      marginBottom: 40,
      alignItems: 'center',
    }, [
      txt('bestie', { fontSize: 22, fontWeight: 600, color: c.black }),
      txt('iMessage', { fontSize: 14, color: c.gray }),
    ]),
    // Messages
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 16 }, [
      el('div', { alignSelf: 'flex-start', maxWidth: '70%' }, [
        el('div', { padding: '14px 20px', backgroundColor: '#E9E9EB', borderRadius: 20 },
          txt('wait how do u have data in tokyo', { fontSize: 22, color: c.black })
        ),
      ]),
      el('div', { alignSelf: 'flex-end', maxWidth: '70%' }, [
        el('div', { padding: '14px 20px', backgroundColor: '#34C759', borderRadius: 20 },
          txt('esim. literally took 30 seconds', { fontSize: 22, color: c.white })
        ),
      ]),
      el('div', { alignSelf: 'flex-start', maxWidth: '70%' }, [
        el('div', { padding: '14px 20px', backgroundColor: '#E9E9EB', borderRadius: 20 },
          txt('no sim card??? how much', { fontSize: 22, color: c.black })
        ),
      ]),
      el('div', { alignSelf: 'flex-end', maxWidth: '70%' }, [
        el('div', { padding: '14px 20px', backgroundColor: '#34C759', borderRadius: 20 },
          txt('$4.99 lol. getlumbus.com', { fontSize: 22, color: c.white })
        ),
      ]),
      el('div', { alignSelf: 'flex-start', maxWidth: '70%' }, [
        el('div', { padding: '14px 20px', backgroundColor: '#E9E9EB', borderRadius: 20 },
          txt('bruh downloading now 🙏', { fontSize: 22, color: c.black })
        ),
      ]),
    ]),
    // Footer
    el('div', { alignItems: 'center', marginTop: 32 }, [
      Logo({ size: 40 }),
    ]),
  ]);
}

// ═══════════════════════════════════════════════════════════
// HOW IT WORKS - Super clean
// ═══════════════════════════════════════════════════════════

function HowItWorksPost() {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.white,
    padding: 80,
  }, [
    el('div', { marginBottom: 48 }, Logo({ size: 48 })),
    txt('3 steps.', { fontSize: 72, fontWeight: 900, color: c.black, marginBottom: 48 }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 40 }, [
      el('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        el('div', {
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center'
        }, txt('1', { fontSize: 40, fontWeight: 900, color: c.black })),
        el('div', {}, [
          txt('Download', { fontSize: 32, fontWeight: 700, color: c.black }),
          txt('Free app', { fontSize: 20, color: c.gray }),
        ]),
      ]),
      el('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        el('div', {
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center'
        }, txt('2', { fontSize: 40, fontWeight: 900, color: c.black })),
        el('div', {}, [
          txt('Choose', { fontSize: 32, fontWeight: 700, color: c.black }),
          txt('150+ countries', { fontSize: 20, color: c.gray }),
        ]),
      ]),
      el('div', { flexDirection: 'row', alignItems: 'center', gap: 32 }, [
        el('div', {
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center'
        }, txt('3', { fontSize: 40, fontWeight: 900, color: c.black })),
        el('div', {}, [
          txt('Connect', { fontSize: 32, fontWeight: 700, color: c.black }),
          txt('Ready in 30s', { fontSize: 20, color: c.gray }),
        ]),
      ]),
    ]),
    txt('getlumbus.com', { fontSize: 18, color: c.gray }),
  ]);
}

// ═══════════════════════════════════════════════════════════
// TESTIMONIAL - Clean quote
// ═══════════════════════════════════════════════════════════

function TestimonialPost({ quote, name }) {
  return el('div', {
    width: '100%',
    height: '100%',
    backgroundColor: c.dark,
    padding: 80,
  }, [
    el('div', { marginBottom: 48 }, Logo({ size: 48 })),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      el('div', { flexDirection: 'row', gap: 8, marginBottom: 32 },
        [1,2,3,4,5].map(() => txt('★', { fontSize: 32, color: c.secondary }))
      ),
      txt(`"${quote}"`, {
        fontSize: 44,
        fontWeight: 600,
        color: c.white,
        lineHeight: 1.4,
        marginBottom: 32,
      }),
      txt(`— ${name}`, { fontSize: 24, color: c.gray }),
    ]),
    txt('getlumbus.com', { fontSize: 18, color: c.gray }),
  ]);
}

// ═══════════════════════════════════════════════════════════
// GENERATION
// ═══════════════════════════════════════════════════════════

async function gen(element, w, h, name, fonts) {
  try {
    const svg = await satori(element, { width: w, height: h, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: w } });
    const png = resvg.render().asPng();
    await fs.writeFile(path.join(OUTPUT, name), png);
    console.log(`  ✓ ${name}`);
  } catch(e) {
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  LUMBUS V5 - ULTRA PREMIUM GENERATOR     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await fs.mkdir(OUTPUT, { recursive: true });
  await loadAssets();

  // Fonts
  console.log('  Loading fonts...');
  const fontUrls = {
    regular: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff',
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    semi: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };
  const fd = {};
  for (const [n, url] of Object.entries(fontUrls)) {
    fd[n] = Buffer.from(await (await fetch(url)).arrayBuffer());
  }
  const fonts = [
    { name: 'Inter', data: fd.regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fd.medium, weight: 500, style: 'normal' },
    { name: 'Inter', data: fd.semi, weight: 600, style: 'normal' },
    { name: 'Inter', data: fd.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fd.black, weight: 900, style: 'normal' },
  ];
  console.log('  ✓ Fonts ready\n');

  // Countries
  const countries = [
    { name: 'Japan', code: 'jp', price: '$4.99' },
    { name: 'Thailand', code: 'th', price: '$2.99' },
    { name: 'France', code: 'fr', price: '$4.99' },
    { name: 'Italy', code: 'it', price: '$4.99' },
    { name: 'Australia', code: 'au', price: '$5.99' },
    { name: 'Germany', code: 'de', price: '$4.49' },
    { name: 'Spain', code: 'es', price: '$4.49' },
    { name: 'UK', code: 'gb', price: '$4.49' },
    { name: 'USA', code: 'us', price: '$3.99' },
    { name: 'South Korea', code: 'kr', price: '$4.99' },
    { name: 'Indonesia', code: 'id', price: '$2.99' },
    { name: 'Vietnam', code: 'vn', price: '$2.99' },
  ];

  // SQUARE POSTS
  console.log('📱 SQUARE POSTS (1080×1080)\n');

  // Country posts with flag backgrounds
  console.log('  Countries:');
  for (const c of countries) {
    await gen(CountryPost(c), SQ.w, SQ.h, `country-${c.code}.png`, fonts);
  }

  // POV posts
  console.log('\n  POV Posts:');
  await gen(POVPost({ country: 'Japan', code: 'jp' }), SQ.w, SQ.h, 'pov-japan.png', fonts);
  await gen(POVPost({ country: 'Thailand', code: 'th' }), SQ.w, SQ.h, 'pov-thailand.png', fonts);
  await gen(POVPost({ country: 'France', code: 'fr' }), SQ.w, SQ.h, 'pov-france.png', fonts);
  await gen(POVPost({ country: 'Italy', code: 'it' }), SQ.w, SQ.h, 'pov-italy.png', fonts);

  // Bold stats
  console.log('\n  Bold Stats:');
  await gen(BoldStatPost({ stat: '90%', label: 'cheaper than roaming' }), SQ.w, SQ.h, 'stat-90.png', fonts);
  await gen(BoldStatPost({ stat: '150+', label: 'countries' }), SQ.w, SQ.h, 'stat-150.png', fonts);
  await gen(BoldStatPost({ stat: '30s', label: 'to activate' }), SQ.w, SQ.h, 'stat-30s.png', fonts);
  await gen(BoldStatPost({ stat: '$4.99', label: 'starting price' }), SQ.w, SQ.h, 'stat-price.png', fonts);

  // Meme formats
  console.log('\n  Meme Formats:');
  await gen(NetflixPost(), SQ.w, SQ.h, 'netflix.png', fonts);
  await gen(GroupChatPost(), SQ.w, SQ.h, 'groupchat.png', fonts);
  await gen(iMessagePost(), SQ.w, SQ.h, 'imessage.png', fonts);
  await gen(ComparisonPost(), SQ.w, SQ.h, 'comparison.png', fonts);

  // Utility posts
  console.log('\n  Utility:');
  await gen(HowItWorksPost(), SQ.w, SQ.h, 'how-it-works.png', fonts);
  await gen(PromoPost({ discount: '20%', code: 'WELCOME20' }), SQ.w, SQ.h, 'promo-20.png', fonts);
  await gen(PromoPost({ discount: '50%', code: 'FLASH50' }), SQ.w, SQ.h, 'promo-50.png', fonts);

  // Testimonials
  console.log('\n  Testimonials:');
  await gen(TestimonialPost({ quote: 'Saved $300 on my Japan trip. Game changer.', name: 'Sarah M.' }), SQ.w, SQ.h, 'testimonial-1.png', fonts);
  await gen(TestimonialPost({ quote: 'No more airport SIM hunting. Finally.', name: 'James L.' }), SQ.w, SQ.h, 'testimonial-2.png', fonts);

  // Regional bundles
  console.log('\n  Regional Bundles:');
  await gen(RegionPost({ name: 'Europe', codes: ['fr','de','it','es','nl','pt','gr','gb'], count: 39, price: '$9.99' }), SQ.w, SQ.h, 'region-europe.png', fonts);
  await gen(RegionPost({ name: 'Asia', codes: ['jp','th','kr','sg','vn','my','ph','id'], count: 28, price: '$8.99' }), SQ.w, SQ.h, 'region-asia.png', fonts);

  // STORIES
  console.log('\n📲 STORIES (1080×1920)\n');

  // Country stories
  console.log('  Country Stories:');
  for (const c of countries.slice(0, 6)) {
    await gen(CountryStory(c), ST.w, ST.h, `story-${c.code}.png`, fonts);
  }

  // Bold stat stories
  console.log('\n  Stat Stories:');
  await gen(BoldStatStory({ stat: '90%', label: 'cheaper than roaming' }), ST.w, ST.h, 'story-stat-90.png', fonts);
  await gen(BoldStatStory({ stat: '30s', label: 'to activate' }), ST.w, ST.h, 'story-stat-30s.png', fonts);

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  ✓ V5 GENERATION COMPLETE                ║');
  console.log(`║  Output: marketing/v5/output/            ║`);
  console.log('╚══════════════════════════════════════════╝\n');
}

main().catch(console.error);
