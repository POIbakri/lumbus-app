/**
 * LUMBUS V7 - THE ULTIMATE VIRAL SUITE (20+ VARIATIONS)
 * 
 * Vision:
 * - 20+ Diverse, Incredible Assets.
 * - Accurate Data ($1.99 starting, 187 countries).
 * - Apple-level design (Perfect layout, spacing, and typography).
 * - Trends: Netflix, Airline, iPhone, Bento, Cinematic POV.
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
  primary: '#2EFECC',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  white: '#FFFFFF',
  black: '#000000',
  dark: '#0A0A0A',
  gray: '#8E8E93',
  lightGray: '#1C1C1E',
  red: '#E50914',
};

const DIM = {
  PT: { w: 1080, h: 1350 }, // Portrait (4:5)
  ST: { w: 1080, h: 1920 }, // Story/TikTok (9:16)
};

let logoIcon = null;
let logoFull = null;
const flags = {};

async function loadAssets() {
  console.log('💎 Loading V7 Supreme Assets...');
  try {
    const iconBuf = await fs.readFile(path.join(ROOT, 'assets', 'iconlogotrans.png'));
    logoIcon = `data:image/png;base64,${iconBuf.toString('base64')}`;
    const fullBuf = await fs.readFile(path.join(ROOT, 'assets', 'logotrans.png'));
    logoFull = `data:image/png;base64,${fullBuf.toString('base64')}`;
  } catch(e) {}

  const codes = ['jp', 'th', 'fr', 'it', 'au', 'de', 'es', 'gb', 'us', 'sg', 'kr', 'id', 'br', 'mx', 'vn', 'ca', 'ae', 'tr'];
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
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════

function BrandHeader({ dark = true }) {
  return el('div', { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }, [
    logoFull ? img(logoFull, { height: 40, width: 'auto' }) : txt('LUMBUS', { fontSize: 24, fontWeight: 900, color: dark ? c.white : c.black }),
    txt('getlumbus.com', { fontSize: 18, fontWeight: 800, color: dark ? c.gray : 'rgba(0,0,0,0.4)', letterSpacing: 1 })
  ]);
}

function BrandFooter({ dark = true }) {
  return el('div', { width: '100%', marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 }, [
    txt('187 Countries covered', { fontSize: 16, fontWeight: 700, color: dark ? c.gray : 'rgba(0,0,0,0.5)' }),
    el('div', { padding: '16px 32px', backgroundColor: c.primary, borderRadius: 100 }, [
      txt('Download App →', { fontSize: 14, fontWeight: 900, color: c.black })
    ])
  ]);
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE DESIGNS
// ═══════════════════════════════════════════════════════════

function SupremeHero({ name, code, price }) {
  const flag = flags[code];
  return el('div', { width: '100%', height: '100%', backgroundColor: c.dark, padding: 80, flexDirection: 'column' }, [
    BrandHeader({ dark: true }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('FLY TO', { fontSize: 24, fontWeight: 800, color: c.primary, letterSpacing: 12, marginBottom: 20 }),
      txt(name.toUpperCase(), { fontSize: 180, fontWeight: 900, color: c.white, letterSpacing: -10, lineHeight: 0.8 }),
      el('div', { marginTop: 60, padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 48, border: '1px solid rgba(255,255,255,0.08)', alignSelf: 'flex-start', flexDirection: 'column' }, [
        txt(`5G Data Plans from`, { fontSize: 20, color: c.gray, marginBottom: 12 }),
        el('div', { flexDirection: 'row', alignItems: 'baseline' }, [
          txt(price, { fontSize: 96, fontWeight: 900, color: c.white, letterSpacing: -4 }),
          txt(' USD', { fontSize: 28, fontWeight: 700, color: c.primary, marginLeft: 12 }),
        ])
      ]),
    ]),
    el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }, [
      el('div', { width: 450, height: 320, borderRadius: 40, overflow: 'hidden', border: '4px solid #1A1A1A' }, [
        img(flag, { width: '100%', height: '100%', objectFit: 'cover' })
      ]),
      BrandFooter({ dark: true })
    ]),
  ]);
}

function NetflixContinueWatching({ items }) {
  return el('div', { width: '100%', height: '100%', backgroundColor: c.dark, padding: 80, flexDirection: 'column' }, [
    el('div', { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 60 }, [
      logoFull && img(logoFull, { height: 32 }),
      txt('Home', { color: c.white, fontSize: 18, fontWeight: 700 }),
      txt('Travel Plans', { color: c.gray, fontSize: 18 }),
      txt('My List', { color: c.gray, fontSize: 18 }),
    ]),
    txt('Continue Watching Trips', { fontSize: 28, fontWeight: 700, color: c.white, marginBottom: 30 }),
    el('div', { flexDirection: 'row', gap: 20 }, items.map(item => (
      el('div', { width: 300, height: 170, backgroundColor: '#333', borderRadius: 8, overflow: 'hidden', position: 'relative' }, [
        flags[item.code] && img(flags[item.code], { width: '100%', height: '100%', objectFit: 'cover' }),
        el('div', { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: c.red, width: '70%' }),
        el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: 15, justifyContent: 'flex-end' }, [
          txt(item.name, { fontSize: 16, fontWeight: 900, color: c.white })
        ])
      ])
    ))),
    el('div', { marginTop: 60, flexDirection: 'column' }, [
      txt('Top 10 Savings Today', { fontSize: 28, fontWeight: 700, color: c.white, marginBottom: 30 }),
      el('div', { flexDirection: 'row', gap: 20 }, [
        el('div', { width: 200, height: 300, backgroundColor: '#333', borderRadius: 8, position: 'relative', overflow: 'hidden' }, [
          txt('1', { fontSize: 180, fontWeight: 900, color: '#555', position: 'absolute', left: -20, bottom: -20 }),
          txt('JAPAN $1.99', { fontSize: 14, fontWeight: 900, color: c.white, textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
        ])
      ])
    ]),
    el('div', { marginTop: 'auto', alignItems: 'center' }, [
      txt('getlumbus.com', { fontSize: 14, color: c.gray })
    ])
  ]);
}

function NetflixProfileTemplate() {
  const profiles = [
    { name: 'You', color: '#00A8E1' },
    { name: 'Digital Nomad', color: '#E50914' },
    { name: 'Tourist', color: '#2EFECC' },
    { name: 'Business', color: '#FDFD74' },
  ];
  return el('div', { width: '100%', height: '100%', backgroundColor: c.dark, padding: 80, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
    txt("Who's traveling?", { fontSize: 64, fontWeight: 500, color: c.white, marginBottom: 80 }),
    el('div', { flexDirection: 'row', gap: 40 }, profiles.map(p => (
      el('div', { flexDirection: 'column', alignItems: 'center', gap: 20 }, [
        el('div', { width: 160, height: 160, backgroundColor: p.color, borderRadius: 8 }),
        txt(p.name, { fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 500 })
      ])
    ))),
    el('div', { marginTop: 100, border: '2px solid rgba(255,255,255,0.4)', padding: '16px 48px' }, [
      txt('MANAGE DESTINATIONS', { fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 })
    ]),
    el('div', { position: 'absolute', bottom: 40 }, [ txt('getlumbus.com', { color: c.gray, fontSize: 14 }) ])
  ]);
}

function SupremeBoardingPass({ name, code, price }) {
  return el('div', { width: '100%', height: '100%', backgroundColor: c.dark, padding: 80, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
    el('div', { backgroundColor: c.white, borderRadius: 40, width: '100%', padding: 60, flexDirection: 'column' }, [
      el('div', { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px dashed #EEE', paddingBottom: 40, marginBottom: 40 }, [
        el('div', { flexDirection: 'column' }, [
          txt('PASSENGER', { fontSize: 12, color: c.gray, letterSpacing: 2 }),
          txt('YOU', { fontSize: 24, fontWeight: 900, color: c.black }),
        ]),
        logoIcon && img(logoIcon, { width: 40, height: 40, filter: 'invert(1)' }),
        el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          txt('CARRIER', { fontSize: 12, color: c.gray, letterSpacing: 2 }),
          txt('LUMBUS eSIM', { fontSize: 24, fontWeight: 900, color: c.primaryDark }),
        ]),
      ]),
      el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }, [
        el('div', { flexDirection: 'column' }, [
          txt('DEPART', { fontSize: 12, color: c.gray, letterSpacing: 2 }),
          txt('OFFLINE', { fontSize: 48, fontWeight: 900, color: c.black }),
        ]),
        el('div', { flex: 1, height: 2, backgroundColor: '#EEE', margin: '0 40px', position: 'relative' }, [
          el('div', { position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: 30 }, txt('✈️'))
        ]),
        el('div', { flexDirection: 'column', alignItems: 'flex-end' }, [
          txt('ARRIVE', { fontSize: 12, color: c.gray, letterSpacing: 2 }),
          txt(name.toUpperCase(), { fontSize: 48, fontWeight: 900, color: c.black }),
        ]),
      ]),
      el('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
        el('div', { flexDirection: 'column' }, [
          txt('PLAN COST', { fontSize: 12, color: c.gray, letterSpacing: 2 }),
          txt(price, { fontSize: 32, fontWeight: 900, color: c.black }),
        ]),
        el('div', { width: 120, height: 120, backgroundColor: c.black, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, [
          txt('QR', { fontSize: 24, fontWeight: 900, color: c.white })
        ])
      ])
    ]),
    txt('getlumbus.com', { marginTop: 40, color: c.gray, fontWeight: 700, fontSize: 18 })
  ]);
}

function SupremeNotification({ name, price }) {
  return el('div', { width: '100%', height: '100%', backgroundColor: '#000', padding: 80, flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }, [
    el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${c.primary}22 0%, ${c.accent}22 100%)`, filter: 'blur(100px)' }),
    txt('9:41', { fontSize: 160, fontWeight: 700, color: c.white, marginTop: 100 }),
    el('div', { width: '100%', flexDirection: 'column', gap: 16, marginTop: 100 }, [
      el('div', { padding: 40, backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(40px)', borderRadius: 40, flexDirection: 'column' }, [
        el('div', { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 }, [
          logoIcon && img(logoIcon, { width: 32, height: 32 }),
          txt('LUMBUS', { fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }),
          txt('now', { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }),
        ]),
        txt(`Welcome to ${name}!`, { fontSize: 20, fontWeight: 800, color: c.white, marginBottom: 4 }),
        txt(`High-speed data active. Savings vs Roaming: $140+.`, { fontSize: 16, color: 'rgba(255,255,255,0.8)' }),
      ]),
      el('div', { padding: 30, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 32, flexDirection: 'row', alignItems: 'center', gap: 20, opacity: 0.5 }, [
        txt('💬', { fontSize: 30 }),
        txt('Carrier: International Roaming is DISABLED.', { fontSize: 14, color: c.white }),
      ])
    ]),
    el('div', { marginTop: 'auto', alignItems: 'center' }, [
      txt('getlumbus.com', { fontSize: 18, color: c.gray, marginBottom: 10 }),
      el('div', { width: 140, height: 5, backgroundColor: c.white, borderRadius: 100 })
    ])
  ]);
}

function CinematicPOV({ name, code }) {
  const flag = flags[code];
  return el('div', { width: '100%', height: '100%', backgroundColor: c.dark, padding: 80, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }, [
    img(flag, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }),
    el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%)' }),
    txt('POV', { fontSize: 24, fontWeight: 900, color: c.primary, letterSpacing: 16, marginBottom: 60 }),
    txt('YOU JUST LANDED IN', { fontSize: 44, fontWeight: 300, color: c.white, marginBottom: 10 }),
    txt(name.toUpperCase(), { fontSize: 160, fontWeight: 900, color: c.white, letterSpacing: -10, textAlign: 'center', lineHeight: 0.8 }),
    el('div', { marginTop: 60, padding: '16px 48px', backgroundColor: c.primary, borderRadius: 20 }, [
      txt('DATA ALREADY WORKS.', { fontSize: 24, fontWeight: 900, color: c.black, letterSpacing: 2 })
    ]),
    el('div', { position: 'absolute', bottom: 80, alignItems: 'center' }, [
      txt('getlumbus.com', { fontSize: 18, color: c.gray })
    ])
  ]);
}

function SupremeBento({ code }) {
  const flag = flags[code];
  return el('div', { width: '100%', height: '100%', backgroundColor: '#0A0A0A', padding: 40, flexDirection: 'column', gap: 20 }, [
    el('div', { flexDirection: 'row', gap: 20, flex: 1.5 }, [
      el('div', { flex: 2, backgroundColor: c.dark, borderRadius: 48, padding: 50, flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }, [
        img(flag, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }),
        txt('EXPLORE', { fontSize: 14, fontWeight: 800, color: c.primary, letterSpacing: 4, marginBottom: 8 }),
        txt('WORLDWIDE.', { fontSize: 48, fontWeight: 900, color: c.white }),
      ]),
      el('div', { flex: 1, backgroundColor: c.primary, borderRadius: 48, padding: 40, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
        logoIcon && img(logoIcon, { width: 100, height: 100, filter: 'invert(1)' }),
        txt('LUMBUS', { fontSize: 14, fontWeight: 900, color: c.black, marginTop: 20 }),
      ]),
    ]),
    el('div', { flexDirection: 'row', gap: 20, flex: 1 }, [
       el('div', { flex: 1, backgroundColor: c.secondary, borderRadius: 48, padding: 40, flexDirection: 'column', justifyContent: 'center' }, [
         txt('$1.99', { fontSize: 48, fontWeight: 900, color: c.black }),
         txt('Start Price', { fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.4)' }),
       ]),
       el('div', { flex: 2, backgroundColor: c.white, borderRadius: 48, padding: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, [
         txt('GET THE APP', { fontSize: 32, fontWeight: 900, color: c.black }),
         txt('→', { fontSize: 40, fontWeight: 900 })
       ]),
    ]),
    el('div', { alignItems: 'center' }, [ txt('getlumbus.com', { fontSize: 14, color: c.gray }) ])
  ]);
}

function AppleComparison() {
  return el('div', { width: '100%', height: '100%', backgroundColor: c.white, padding: 80, flexDirection: 'column' }, [
    BrandHeader({ dark: false }),
    el('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      txt('THE SMART CHOICE.', { fontSize: 20, fontWeight: 800, color: c.primaryDark, letterSpacing: 8, marginBottom: 60, textAlign: 'center' }),
      [
        { label: 'Daily Roaming', cost: '$15.00/day', setup: 'Bill Shock 😰', bg: 'transparent', color: c.black, costColor: c.red },
        { label: 'Airport SIM', cost: '$45.00', setup: 'Long Queues ⏳', bg: '#F5F5F7', color: c.black, costColor: c.black },
        { label: 'Lumbus eSIM', cost: '$1.99', setup: 'Instant Setup ⚡️', bg: c.dark, color: c.white, costColor: c.primary, highlight: true },
      ].map((row, i) => (
        el('div', { key: i, flexDirection: 'row', padding: row.highlight ? 60 : 40, alignItems: 'center', backgroundColor: row.bg, borderRadius: 32, marginTop: i === 2 ? 24 : 0, marginBottom: 12, boxShadow: row.highlight ? '0 40px 80px rgba(0,0,0,0.15)' : 'none' }, [
          el('div', { flex: 1, flexDirection: 'column' }, [
            txt(row.label, { fontSize: row.highlight ? 32 : 24, fontWeight: 800, color: row.color }),
            txt(row.setup, { fontSize: 16, color: row.highlight ? 'rgba(255,255,255,0.5)' : c.gray, marginTop: 4 }),
          ]),
          txt(row.cost, { fontSize: row.highlight ? 40 : 28, fontWeight: 900, color: row.costColor, textAlign: 'right' }),
        ])
      ))
    ]),
    BrandFooter({ dark: false })
  ]);
}

// ═══════════════════════════════════════════════════════════
// GENERATION ENGINE
// ═══════════════════════════════════════════════════════════

async function gen(element, w, h, name, fonts) {
  try {
    const svg = await satori(element, { width: w, height: h, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: w } });
    const png = resvg.render().asPng();
    await fs.writeFile(path.join(OUTPUT, name), png);
    console.log(`  ✓ ${name}`);
  } catch(e) { console.log(`  ✗ ${name}: ${e.message}`); }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║        LUMBUS V7 - SUPREME VIRAL         ║');
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

  console.log('📦 GENERATING 20+ ASSETS...\n');

  // 1-3: Netflix Style
  await gen(NetflixContinueWatching({ items: [{name:'Japan',code:'jp'},{name:'Thailand',code:'th'},{name:'France',code:'fr'}] }), DIM.PT.w, DIM.PT.h, 'v7-netflix-1.png', fonts);
  await gen(NetflixProfileTemplate(), DIM.PT.w, DIM.PT.h, 'v7-netflix-profiles.png', fonts);
  
  // 4-8: Boarding Passes
  const passItems = [
    {name:'Japan',code:'jp',price:'$1.99'},
    {name:'USA',code:'us',price:'$1.99'},
    {name:'Thailand',code:'th',price:'$1.99'},
    {name:'Australia',code:'au',price:'$1.99'},
    {name:'UK',code:'gb',price:'$1.99'},
  ];
  for (const item of passItems) {
    await gen(SupremeBoardingPass(item), DIM.PT.w, DIM.PT.h, `v7-ticket-${item.code}.png`, fonts);
  }

  // 9-13: iPhone Notifications
  const notifItems = ['Japan', 'Thailand', 'France', 'USA', 'Australia'];
  for (const name of notifItems) {
    await gen(SupremeNotification({ name, price: '$1.99' }), DIM.PT.w, DIM.PT.h, `v7-notif-${name.toLowerCase()}.png`, fonts);
  }

  // 14-17: Cinematic POV
  const povItems = [
    {name:'Japan',code:'jp'},
    {name:'Thailand',code:'th'},
    {name:'France',code:'fr'},
    {name:'Italy',code:'it'},
  ];
  for (const item of povItems) {
    await gen(CinematicPOV(item), DIM.PT.w, DIM.PT.h, `v7-pov-${item.code}.png`, fonts);
  }

  // 18-19: Bento Grids
  await gen(SupremeBento({ code: 'us' }), DIM.PT.w, DIM.PT.h, 'v7-bento-us.png', fonts);
  await gen(SupremeBento({ code: 'jp' }), DIM.PT.w, DIM.PT.h, 'v7-bento-jp.png', fonts);

  // 20: Comparison
  await gen(AppleComparison(), DIM.PT.w, DIM.PT.h, 'v7-comparison.png', fonts);

  // 21+: Extra Viral Hero variations
  await gen(SupremeHero({ name: 'Japan', code: 'jp', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'v7-hero-jp.png', fonts);
  await gen(SupremeHero({ name: 'Thailand', code: 'th', price: '$1.99' }), DIM.PT.w, DIM.PT.h, 'v7-hero-th.png', fonts);

  console.log('\n🚀 V7 SUPREME VIRAL SUITE COMPLETE!\n');
}

main().catch(console.error);
