/**
 * LUMBUS V6 - THE VIRAL "SH*T" EDIT
 * 
 * Design Concepts:
 * - NETFLIX PARODY: "Who's Traveling?" profile picker & "Continue Watching" trip cards.
 * - AIRLINE BOARDING PASS: Ultra-clean, monochromatic flight aesthetics.
 * - IPHONE NOTIFICATIONS: Glassmorphic lock-screen alerts for data.
 * - PREMIUM CRAFTSMANSHIP: Perfect Apple-style spacing and layout.
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
  primary: '#2EFECC',      // Lumbus Mint
  secondary: '#FDFD74',    // Lumbus Yellow
  accent: '#87EFFF',       // Cyan
  white: '#FFFFFF',
  black: '#000000',
  dark: '#0A0A0A',         // Deep obsidian
  gray: '#8E8E93',
  lightGray: '#1C1C1E',    // iOS Dark Gray
  red: '#E50914',          // Netflix Red
};

const DIM = {
  PT: { w: 1080, h: 1350 }, // Portrait Feed
  ST: { w: 1080, h: 1920 }, // Story/TikTok
};

let logoIcon = null;
let logoFull = null;
const flags = {};

async function loadAssets() {
  console.log('💎 Loading Viral Assets...');
  try {
    const iconBuf = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuf.toString('base64')}`;
    const fullBuf = await fs.readFile(path.join(ROOT, 'assets', 'logotrans.png'));
    logoFull = `data:image/png;base64,${fullBuf.toString('base64')}`;
  } catch(e) {}

  const codes = ['jp','th','fr','it','au','de','es','gb','us','sg','kr','id','br','mx','vn','ca','ae','tr'];
  for (const code of codes) {
    try {
      const res = await fetch(`https://flagcdn.com/w640/${code}.png`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        flags[code] = `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch(e) {}
  }
}

const el = (type, style, children) => ({
  type,
  props: { 
    style: { display: 'flex', ...style }, 
    children: Array.isArray(children) ? children.filter(c => c !== null && c !== undefined) : children 
  }
});

const txt = (content, style) => {
  if (content === undefined || content === null) return null;
  return {
    type: 'div',
    props: { style: { display: 'flex', ...style }, children: String(content) }
  };
};

const img = (src, style) => {
  if (!src) return null;
  return {
    type: 'img',
    props: { src, style }
  };
};

// ═══════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════

function PageWrapper({ children, dark = true }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: dark ? c.dark : c.white,
    padding: 80,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }, [
    // Global Header
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }, [
      logoFull ? img(logoFull, { height: 32, width: 'auto' }) : txt('LUMBUS', { fontWeight: 900, color: dark ? c.white : c.black }),
      txt('getlumbus.com', { fontSize: 18, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', letterSpacing: 1 })
    ]),

    // Content
    el('div', { flex: 1, flexDirection: 'column' }, children),

    // Global Footer
    el('div', { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 }, [
      txt('187 Countries covered', { fontSize: 14, fontWeight: 600, color: dark ? c.gray : 'rgba(0,0,0,0.4)' }),
      el('div', { padding: '12px 24px', backgroundColor: c.primary, borderRadius: 100 }, [
        txt('Get the App', { fontSize: 12, fontWeight: 900, color: c.black })
      ])
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════
// VIRAL TEMPLATES
// ═══════════════════════════════════════════════════════════

/**
 * 1. NETFLIX PARODY: "WHO'S TRAVELING?"
 */
function NetflixProfileTemplate() {
  const profiles = [
    { name: 'You', color: '#00A8E1' },
    { name: 'Digital Nomad', color: '#E50914' },
    { name: 'Tourist', color: '#2EFECC' },
    { name: 'Business', color: '#FDFD74' },
  ];

  return PageWrapper({ children: [
    el('div', { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
      txt("Who's traveling?", { fontSize: 64, fontWeight: 500, color: c.white, marginBottom: 80 }),
      
      el('div', { flexDirection: 'row', gap: 40 }, profiles.map(p => (
        el('div', { flexDirection: 'column', alignItems: 'center', gap: 20 }, [
          el('div', { width: 160, height: 160, backgroundColor: p.color, borderRadius: 8, border: '4px solid transparent' }),
          txt(p.name, { fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 500 })
        ])
      ))),

      el('div', { marginTop: 100, border: '2px solid rgba(255,255,255,0.4)', padding: '16px 48px' }, [
        txt('MANAGE DESTINATIONS', { fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 })
      ])
    ])
  ]});
}

/**
 * 2. AIRPLANE BOARDING PASS
 */
function BoardingPassTemplate({ name, code, price }) {
  const flag = flags[code];
  return PageWrapper({ children: [
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      el('div', { backgroundColor: c.white, borderRadius: 40, padding: 60, flexDirection: 'column' }, [
        // Top Part
        el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #EEE', paddingBottom: 40, marginBottom: 40 }, [
          el('div', { flexDirection: 'column' }, [
            txt('FLIGHT', { fontSize: 12, color: c.gray, letterSpacing: 2, marginBottom: 4 }),
            txt('LM 2025', { fontSize: 24, fontWeight: 900, color: c.black }),
          ]),
          logoIcon && img(logoIcon, { width: 40, height: 40, filter: 'invert(1)' }),
          el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            txt('GATE', { fontSize: 12, color: c.gray, letterSpacing: 2, marginBottom: 4 }),
            txt('APP STORE', { fontSize: 24, fontWeight: 900, color: c.black }),
          ]),
        ]),

        // Route Part
        el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }, [
          el('div', { flexDirection: 'column' }, [
            txt('HOME', { fontSize: 48, fontWeight: 900, color: c.black }),
            txt('No Data', { fontSize: 14, color: c.gray }),
          ]),
          el('div', { flex: 1, height: 2, backgroundColor: '#EEE', margin: '0 40px', position: 'relative' }, [
            el('div', { position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: 30 }, txt('✈️'))
          ]),
          el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
            txt(name.toUpperCase(), { fontSize: 48, fontWeight: 900, color: c.primaryDark }),
            txt('Lumbus eSIM', { fontSize: 14, color: c.gray }),
          ]),
        ]),

        // Passenger Part
        el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, [
          el('div', { flexDirection: 'column' }, [
            txt('PASSENGER', { fontSize: 12, color: c.gray, letterSpacing: 2, marginBottom: 4 }),
            txt('YOU', { fontSize: 24, fontWeight: 800, color: c.black }),
          ]),
          el('div', { flexDirection: 'column', alignItems: 'center' }, [
            txt('DATA COST', { fontSize: 12, color: c.gray, letterSpacing: 2, marginBottom: 4 }),
            txt(price, { fontSize: 32, fontWeight: 900, color: c.black }),
          ]),
          el('div', { width: 100, height: 100, backgroundColor: c.black, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, [
            txt('QR', { fontSize: 20, fontWeight: 900, color: c.white })
          ]),
        ])
      ]),
      
      txt('LAND CONNECTED. NO PLASTIC. NO BS.', { 
        marginTop: 40, textAlign: 'center', fontSize: 20, fontWeight: 800, color: c.primary, letterSpacing: 4 
      })
    ])
  ]});
}

/**
 * 3. IPHONE NOTIFICATION
 */
function NotificationTemplate({ name, price }) {
  return el('div', {
    width: '100%', height: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
    padding: 80,
    flexDirection: 'column',
    alignItems: 'center',
  }, [
    // Blurred background wallpaper effect
    el('div', {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${c.primary}33 0%, ${c.accent}33 100%)`,
      filter: 'blur(100px)',
    }),

    // Clock
    txt('9:41', { fontSize: 160, fontWeight: 700, color: c.white, marginTop: 100, letterSpacing: -4 }),
    txt('Saturday, December 20', { fontSize: 24, fontWeight: 500, color: c.white, marginBottom: 100 }),

    // Notification Stack
    el('div', { width: '100%', flexDirection: 'column', gap: 16 }, [
      // Lumbus Alert
      el('div', { 
        padding: 40, 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        backdropFilter: 'blur(40px)',
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.1)',
        flexDirection: 'column',
      }, [
        el('div', { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 }, [
          logoIcon && img(logoIcon, { width: 32, height: 32 }),
          txt('LUMBUS', { fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }),
          txt('now', { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }),
        ]),
        txt(`Welcome to ${name}!`, { fontSize: 20, fontWeight: 800, color: c.white, marginBottom: 4 }),
        txt(`Your travel data plan is active. No roaming fees detected. Total cost: ${price}.`, { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }),
      ]),

      // Roaming Alert (Low opacity)
      el('div', { 
        padding: 30, 
        backgroundColor: 'rgba(255,59,48,0.1)', 
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        opacity: 0.5,
      }, [
        txt('⚠️', { fontSize: 30 }),
        txt('Carrier: International Roaming Disabled.', { fontSize: 14, color: c.white, fontWeight: 600 }),
      ])
    ]),

    el('div', { marginTop: 'auto', alignItems: 'center', flexDirection: 'column', gap: 10 }, [
      txt('getlumbus.com', { fontSize: 18, fontWeight: 800, color: c.white, opacity: 0.6 }),
      el('div', { width: 140, height: 5, backgroundColor: c.white, borderRadius: 100 })
    ])
  ]);
}

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
  console.log('║        LUMBUS V6 - VIRAL "SH*T"          ║');
  console.log('╚══════════════════════════════════════════╝\n');
  await fs.mkdir(OUTPUT, { recursive: true });
  await loadAssets();
  
  const fd = {};
  const urls = {
    med: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff'
  };
  for(const [k,u] of Object.entries(urls)) {
    fd[k] = Buffer.from(await (await fetch(u)).arrayBuffer());
  }
  const fonts = [
    { name: 'Inter', data: fd.med, weight: 500, style: 'normal' },
    { name: 'Inter', data: fd.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fd.black, weight: 900, style: 'normal' },
  ];

  // Netflix Profile Picker
  await gen(NetflixProfileTemplate(), DIM.PT.w, DIM.PT.h, 'viral-netflix-profiles.png', fonts);

  // Boarding Passes
  await gen(BoardingPassTemplate({ name: 'Japan', code: 'jp', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'viral-ticket-jp.png', fonts);
  await gen(BoardingPassTemplate({ name: 'Thailand', code: 'th', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'viral-ticket-th.png', fonts);

  // iPhone Notifications
  await gen(NotificationTemplate({ name: 'Paris', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'viral-notif-paris.png', fonts);
  await gen(NotificationTemplate({ name: 'New York', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'viral-notif-usa.png', fonts);

  console.log('\n🚀 V6 VIRAL "SH*T" GENERATED!\n');
}

main().catch(console.error);
