/**
 * Lumbus Marketing V4 - VIRAL & TRENDY
 * Fun, shareable, meme-style posts that people actually want to see
 * Real flags, pop culture, trending formats
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(__dirname, 'output');

// ============================================
// DESIGN SYSTEM
// ============================================

const colors = {
  primary: '#2EFECC',
  secondary: '#FDFD74',
  accent: '#87EFFF',
  purple: '#F7E2FB',
  mint: '#E0FEF7',
  white: '#FFFFFF',
  black: '#0A0A0A',
  dark: '#1A1A1A',
  gray: '#666666',
  lightGray: '#F5F5F5',
  red: '#FF4757',
  green: '#2ED573',
  blue: '#3742FA',
  netflix: '#E50914',
  spotify: '#1DB954',
  imessage: '#34C759',
  twitter: '#1DA1F2',
};

const sizes = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

// ============================================
// ASSET LOADING
// ============================================

let iconLogo = null;
let longLogo = null;
const flagCache = {};

async function loadLogos() {
  try {
    const iconPath = path.join(ROOT, 'assets', 'iconlogotrans.png');
    const iconBuffer = await fs.readFile(iconPath);
    iconLogo = `data:image/png;base64,${iconBuffer.toString('base64')}`;
    console.log('   ✓ Icon logo');
  } catch (e) {
    console.log('   ✗ Icon logo not found');
  }

  try {
    const longPath = path.join(ROOT, 'assets', 'logotrans.png');
    const longBuffer = await fs.readFile(longPath);
    longLogo = `data:image/png;base64,${longBuffer.toString('base64')}`;
    console.log('   ✓ Long logo');
  } catch (e) {
    console.log('   ✗ Long logo not found');
  }
}

async function loadFlag(code) {
  if (flagCache[code]) return flagCache[code];

  try {
    // Use flagcdn.com for high quality flags
    const url = `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Flag not found');
    const buffer = Buffer.from(await response.arrayBuffer());
    flagCache[code] = `data:image/png;base64,${buffer.toString('base64')}`;
    return flagCache[code];
  } catch (e) {
    console.log(`   ✗ Flag ${code} not found`);
    return null;
  }
}

// Preload all flags we need
async function loadAllFlags() {
  const codes = ['jp', 'th', 'fr', 'it', 'au', 'de', 'es', 'gb', 'us', 'sg', 'kr', 'id', 'br', 'mx', 'ca', 'nl', 'pt', 'gr', 'tr', 'ae', 'nz', 'vn', 'ph', 'my'];
  console.log('   Loading flags...');
  await Promise.all(codes.map(c => loadFlag(c)));
  console.log(`   ✓ ${Object.keys(flagCache).length} flags loaded`);
}

// ============================================
// HELPERS
// ============================================

const h = (type, style, children) => ({
  type,
  props: {
    style: { display: 'flex', ...style },
    children: Array.isArray(children) ? children : children,
  },
});

const text = (content, style = {}) => ({
  type: 'span',
  props: { style, children: content },
});

const img = (src, style = {}) => ({
  type: 'img',
  props: { src, style },
});

// ============================================
// COMPONENTS
// ============================================

function Logo({ size = 48 }) {
  if (iconLogo) return img(iconLogo, { width: size, height: size });
  return h('div', {
    width: size, height: size, borderRadius: size / 4,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  }, text('L', { fontSize: size * 0.5, fontWeight: 900, color: colors.black }));
}

function LogoFull({ height = 40, dark = false }) {
  if (longLogo) {
    return img(longLogo, { height, objectFit: 'contain' });
  }
  return h('div', { flexDirection: 'row', alignItems: 'center', gap: 10 }, [
    Logo({ size: height }),
    text('lumbus', { fontSize: height * 0.7, fontWeight: 700, color: dark ? colors.black : colors.white }),
  ]);
}

function Flag({ code, size = 80 }) {
  const flag = flagCache[code.toLowerCase()];
  if (flag) {
    return img(flag, {
      width: size * 1.5,
      height: size,
      objectFit: 'cover',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    });
  }
  return h('div', {
    width: size * 1.5, height: size,
    backgroundColor: colors.lightGray, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  }, text(code, { fontSize: 20, fontWeight: 700, color: colors.gray }));
}

function FlagCircle({ code, size = 120 }) {
  const flag = flagCache[code.toLowerCase()];
  if (flag) {
    return h('div', {
      width: size, height: size, borderRadius: size / 2,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }, [
      img(flag, { width: size, height: size, objectFit: 'cover' }),
    ]);
  }
  return h('div', {
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  }, text(code, { fontSize: size / 3, fontWeight: 900, color: colors.black }));
}

// Plane SVG
function Plane({ size = 48, color = colors.black, rotation = 0 }) {
  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      style: { transform: `rotate(${rotation}deg)` },
      children: [
        { type: 'path', props: { d: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', fill: color } },
      ],
    },
  };
}

// ============================================
// COUNTRY DATA
// ============================================

const countries = [
  { name: 'Japan', code: 'jp', price: '$4.99', vibe: 'Tokyo nights await' },
  { name: 'Thailand', code: 'th', price: '$2.99', vibe: 'Beach mode: ON' },
  { name: 'France', code: 'fr', price: '$4.99', vibe: 'Bonjour data' },
  { name: 'Italy', code: 'it', price: '$4.99', vibe: 'Ciao roaming fees' },
  { name: 'Australia', code: 'au', price: '$5.99', vibe: 'G\'day connectivity' },
  { name: 'Germany', code: 'de', price: '$4.49', vibe: 'Wunderbar coverage' },
  { name: 'Spain', code: 'es', price: '$4.49', vibe: 'Hola fast data' },
  { name: 'UK', code: 'gb', price: '$4.49', vibe: 'Brilliant connection' },
  { name: 'USA', code: 'us', price: '$3.99', vibe: 'Coast to coast' },
  { name: 'Singapore', code: 'sg', price: '$3.99', vibe: 'Smart city ready' },
  { name: 'South Korea', code: 'kr', price: '$4.99', vibe: 'K-connected' },
  { name: 'Indonesia', code: 'id', price: '$2.99', vibe: 'Island hopping' },
  { name: 'Brazil', code: 'br', price: '$4.99', vibe: 'Samba with signal' },
  { name: 'Mexico', code: 'mx', price: '$3.99', vibe: 'Vamos connected' },
  { name: 'Vietnam', code: 'vn', price: '$2.99', vibe: 'Xin chào data' },
];

// ============================================
// VIRAL POST FORMATS
// ============================================

// 1. POV POST - Super trendy format
function POVPost({ country, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
  }, [
    // POV header
    h('div', { marginBottom: 32 }, [
      text('POV:', { fontSize: 32, fontWeight: 700, color: colors.gray }),
    ]),
    // Main text
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('You just landed in', { fontSize: 48, fontWeight: 500, color: colors.white, marginBottom: 16 }),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 24 }, [
        FlagCircle({ code, size: 100 }),
        text(country, { fontSize: 72, fontWeight: 900, color: colors.primary }),
      ]),
      text('and your data', { fontSize: 48, fontWeight: 500, color: colors.white }),
      text('already works', { fontSize: 64, fontWeight: 900, color: colors.primary }),
    ]),
    // Bottom
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoFull({ height: 36, dark: false }),
      h('div', { flexDirection: 'row', alignItems: 'center', gap: 8 }, [
        Plane({ size: 28, color: colors.primary, rotation: 45 }),
        text('No SIM swap needed', { fontSize: 16, color: colors.gray }),
      ]),
    ]),
  ]);
}

// 2. NETFLIX PARODY - "Are you still watching?"
function NetflixPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    // Netflix-style header
    h('div', { marginBottom: 48 }, [
      text('Are you still paying', { fontSize: 44, fontWeight: 400, color: colors.white, textAlign: 'center' }),
    ]),
    // Big red text
    text('$15/MB', { fontSize: 120, fontWeight: 900, color: colors.netflix, marginBottom: 24 }),
    text('for roaming?', { fontSize: 44, fontWeight: 400, color: colors.white, marginBottom: 64 }),
    // Buttons
    h('div', { flexDirection: 'column', gap: 16, width: '100%', maxWidth: 500 }, [
      h('div', {
        padding: '20px 32px',
        backgroundColor: colors.white,
        borderRadius: 8,
        alignItems: 'center',
      }, text('Continue paying too much', { fontSize: 20, fontWeight: 600, color: colors.black })),
      h('div', {
        padding: '20px 32px',
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
      }, [
        text('Switch to Lumbus - from $4.99', { fontSize: 20, fontWeight: 700, color: colors.black }),
      ]),
    ]),
    // Logo
    h('div', { marginTop: 48 }, Logo({ size: 48 })),
  ]);
}

// 3. SPOTIFY WRAPPED STYLE
function SpotifyWrappedPost({ stat, label, detail }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.spotify} 0%, #0D3B20 100%)`,
    padding: 60,
  }, [
    // Top bar
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }, [
      text('Your 2024 Wrapped', { fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }),
      Logo({ size: 40 }),
    ]),
    // Main content
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('You saved', { fontSize: 32, color: colors.white, marginBottom: 16 }),
      text(stat, { fontSize: 200, fontWeight: 900, color: colors.white, lineHeight: 0.9 }),
      text(label, { fontSize: 48, fontWeight: 700, color: colors.white, marginTop: 16, marginBottom: 32 }),
      text(detail, { fontSize: 24, color: 'rgba(255,255,255,0.7)' }),
    ]),
    // Bottom
    text("That's top 1% of travelers", { fontSize: 20, fontWeight: 600, color: colors.white }),
  ]);
}

// 4. iMESSAGE CONVERSATION
function iMessagePost({ messages }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 40,
  }, [
    // Phone header
    h('div', {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #E5E5E5',
      marginBottom: 32,
    }, [
      text('‹ Messages', { fontSize: 18, color: colors.blue }),
      h('div', { flexDirection: 'column', alignItems: 'center' }, [
        text('Bestie', { fontSize: 18, fontWeight: 600, color: colors.black }),
        text('iMessage', { fontSize: 12, color: colors.gray }),
      ]),
      text('', { fontSize: 18 }),
    ]),
    // Messages
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 16 },
      messages.map((m, i) =>
        h('div', {
          alignSelf: m.sent ? 'flex-end' : 'flex-start',
          maxWidth: '75%',
          padding: '14px 20px',
          backgroundColor: m.sent ? colors.imessage : '#E9E9EB',
          borderRadius: 20,
        }, text(m.text, { fontSize: 20, color: m.sent ? colors.white : colors.black }))
      )
    ),
    // Logo footer
    h('div', { marginTop: 32, alignItems: 'center' }, [
      LogoFull({ height: 32, dark: true }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray, marginTop: 8 }),
    ]),
  ]);
}

// 5. BOARDING PASS
function BoardingPassPost({ from, to, toCode, gate, seat }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    // Boarding pass card
    h('div', {
      width: '100%',
      backgroundColor: colors.white,
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }, [
      // Header
      h('div', {
        padding: '24px 32px',
        backgroundColor: colors.black,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }, [
        text('BOARDING PASS', { fontSize: 16, fontWeight: 700, color: colors.white, letterSpacing: 3 }),
        Logo({ size: 36 }),
      ]),
      // Main content
      h('div', { padding: 32 }, [
        // Route
        h('div', { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }, [
          h('div', { flexDirection: 'column', alignItems: 'center' }, [
            text(from, { fontSize: 48, fontWeight: 900, color: colors.black }),
            text('HOME', { fontSize: 14, color: colors.gray, letterSpacing: 2 }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'center', gap: 8 }, [
            Plane({ size: 40, color: colors.primary, rotation: 90 }),
            h('div', { width: 120, height: 3, backgroundColor: colors.primary, borderRadius: 2 }),
            text('DIRECT', { fontSize: 12, fontWeight: 600, color: colors.primary }),
          ]),
          h('div', { flexDirection: 'column', alignItems: 'center' }, [
            FlagCircle({ code: toCode, size: 64 }),
            text(to, { fontSize: 20, fontWeight: 700, color: colors.black, marginTop: 8 }),
          ]),
        ]),
        // Details
        h('div', { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 24, borderTop: '2px dashed #E5E5E5' }, [
          h('div', { flexDirection: 'column' }, [
            text('GATE', { fontSize: 12, color: colors.gray }),
            text(gate, { fontSize: 28, fontWeight: 700, color: colors.black }),
          ]),
          h('div', { flexDirection: 'column' }, [
            text('SEAT', { fontSize: 12, color: colors.gray }),
            text(seat, { fontSize: 28, fontWeight: 700, color: colors.black }),
          ]),
          h('div', { flexDirection: 'column' }, [
            text('DATA', { fontSize: 12, color: colors.gray }),
            text('READY', { fontSize: 28, fontWeight: 700, color: colors.primary }),
          ]),
        ]),
      ]),
    ]),
    // Bottom text
    h('div', { marginTop: 32, alignItems: 'center' }, [
      text('Your eSIM activates the moment you land', { fontSize: 18, fontWeight: 600, color: colors.black }),
      text('getlumbus.com', { fontSize: 14, color: 'rgba(0,0,0,0.6)', marginTop: 8 }),
    ]),
  ]);
}

// 6. "NOBODY:" MEME FORMAT
function NobodyMemePost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 60,
  }, [
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text('Nobody:', { fontSize: 32, color: colors.gray, marginBottom: 8 }),
      text('Absolutely nobody:', { fontSize: 32, color: colors.gray, marginBottom: 32 }),
      text('Me at the airport:', { fontSize: 32, color: colors.black, fontWeight: 600, marginBottom: 32 }),
      h('div', {
        padding: 32,
        backgroundColor: colors.primary,
        borderRadius: 20,
      }, [
        text('"Why is everyone buying', { fontSize: 36, fontWeight: 700, color: colors.black }),
        text('overpriced airport SIMs', { fontSize: 36, fontWeight: 700, color: colors.black }),
        text('when eSIM exists?"', { fontSize: 36, fontWeight: 700, color: colors.black }),
      ]),
    ]),
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoFull({ height: 36, dark: true }),
      text('Download free', { fontSize: 18, fontWeight: 600, color: colors.black }),
    ]),
  ]);
}

// 7. HOT TAKE / UNPOPULAR OPINION
function HotTakePost({ take }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
  }, [
    // Header
    h('div', {
      padding: '12px 24px',
      backgroundColor: colors.red,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: 48,
    }, text('HOT TAKE', { fontSize: 18, fontWeight: 900, color: colors.white, letterSpacing: 2 })),
    // Main text
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text(take, { fontSize: 52, fontWeight: 700, color: colors.white, lineHeight: 1.3 }),
    ]),
    // Footer
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
      LogoFull({ height: 36, dark: false }),
      text('Agree? 🔥', { fontSize: 24, color: colors.white }),
    ]),
  ]);
}

// 8. THIS vs THAT
function ThisVsThatPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  }, [
    // THIS side
    h('div', {
      flex: 1,
      backgroundColor: colors.red,
      padding: 48,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      text('Paying $300 for', { fontSize: 28, color: colors.white }),
      text('roaming fees', { fontSize: 40, fontWeight: 900, color: colors.white }),
      text('🤡', { fontSize: 80, marginTop: 24 }),
    ]),
    // VS divider
    h('div', {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }, text('VS', { fontSize: 32, fontWeight: 900, color: colors.black })),
    // THAT side
    h('div', {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 48,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }, [
      text('Getting 10GB for', { fontSize: 28, color: colors.black }),
      text('$9.99 with eSIM', { fontSize: 40, fontWeight: 900, color: colors.black }),
      text('😎', { fontSize: 80, marginTop: 24 }),
      Logo({ size: 40 }),
    ]),
  ]);
}

// 9. TRAVEL DESTINATION CARD (with real flag)
function DestinationCard({ name, code, price, vibe }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    overflow: 'hidden',
  }, [
    // Flag background (large, cropped)
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60%',
      overflow: 'hidden',
    }, [
      flagCache[code] ? img(flagCache[code], {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.9,
      }) : null,
      // Gradient overlay
      h('div', {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(transparent, #0A0A0A)',
      }),
    ]),
    // Content
    h('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 60,
    }, [
      text(name, { fontSize: 72, fontWeight: 900, color: colors.white, marginBottom: 8 }),
      text(vibe, { fontSize: 24, color: colors.gray, marginBottom: 32 }),
      h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
        h('div', { flexDirection: 'column' }, [
          text('From', { fontSize: 16, color: colors.gray }),
          text(price, { fontSize: 48, fontWeight: 900, color: colors.primary }),
        ]),
        h('div', { padding: '16px 32px', backgroundColor: colors.primary, borderRadius: 16 },
          text('Get eSIM', { fontSize: 20, fontWeight: 700, color: colors.black })
        ),
      ]),
      h('div', { marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 12 }, [
        Logo({ size: 32 }),
        text('Instant activation', { fontSize: 16, color: colors.gray }),
      ]),
    ]),
  ]);
}

// 10. REGIONAL FLAGS GRID
function RegionGridPost({ region, codes, count, price }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    padding: 60,
  }, [
    // Header
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }, [
      h('div', { padding: '12px 24px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20 },
        text('REGIONAL BUNDLE', { fontSize: 14, fontWeight: 700, color: colors.black, letterSpacing: 2 })
      ),
      Logo({ size: 48 }),
    ]),
    // Title
    text(region, { fontSize: 64, fontWeight: 900, color: colors.black, marginBottom: 8 }),
    text(`${count} countries, 1 eSIM`, { fontSize: 24, color: 'rgba(0,0,0,0.7)', marginBottom: 32 }),
    // Flags grid
    h('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignContent: 'center' },
      codes.slice(0, 8).map(code =>
        FlagCircle({ code, size: 90 })
      )
    ),
    // Price bar
    h('div', {
      padding: 28,
      backgroundColor: colors.white,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, [
      h('div', {}, [
        text('Starting from', { fontSize: 14, color: colors.gray }),
        text(price, { fontSize: 40, fontWeight: 900, color: colors.black }),
      ]),
      h('div', { padding: '14px 28px', backgroundColor: colors.black, borderRadius: 12 },
        text('View plans', { fontSize: 18, fontWeight: 700, color: colors.white })
      ),
    ]),
  ]);
}

// 11. AIRPORT SCENE / PLANE AESTHETIC
function PlaneWindowPost({ destination, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.dark,
    padding: 60,
    alignItems: 'center',
  }, [
    // Window shape
    h('div', {
      width: 600,
      height: 700,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      background: `linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)`,
      padding: 40,
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)',
    }, [
      // Clouds / sky content
      text('✈️ In-flight', { fontSize: 20, color: colors.gray, marginBottom: 24 }),
      FlagCircle({ code, size: 140 }),
      text(destination, { fontSize: 48, fontWeight: 900, color: colors.black, marginTop: 24, marginBottom: 16 }),
      text('data ready', { fontSize: 28, color: colors.black }),
      h('div', {
        marginTop: 32,
        padding: '16px 32px',
        backgroundColor: colors.primary,
        borderRadius: 24,
      }, text('eSIM activated', { fontSize: 20, fontWeight: 700, color: colors.black })),
    ]),
    // Bottom
    h('div', { marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 16 }, [
      Logo({ size: 40 }),
      text('Land connected', { fontSize: 20, fontWeight: 600, color: colors.white }),
    ]),
  ]);
}

// 12. COUNTDOWN / FOMO POST
function CountdownPost({ hours, destination, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }, [
    h('div', { marginBottom: 32 }, FlagCircle({ code, size: 120 })),
    text(`${hours} hours until`, { fontSize: 28, color: colors.gray, marginBottom: 8 }),
    text(destination, { fontSize: 72, fontWeight: 900, color: colors.white, marginBottom: 48 }),
    text('Is your data ready?', { fontSize: 36, fontWeight: 600, color: colors.primary, marginBottom: 48 }),
    h('div', { padding: '20px 48px', backgroundColor: colors.primary, borderRadius: 20 },
      text('Get eSIM now', { fontSize: 24, fontWeight: 700, color: colors.black })
    ),
    h('div', { marginTop: 48 }, LogoFull({ height: 36, dark: false })),
  ]);
}

// 13. GROUP CHAT
function GroupChatPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0B141A',
    padding: 24,
  }, [
    // WhatsApp-style header
    h('div', {
      padding: '16px 20px',
      backgroundColor: '#1F2C34',
      borderRadius: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 24,
    }, [
      h('div', { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2A3942', alignItems: 'center', justifyContent: 'center' },
        text('🌴', { fontSize: 24 })
      ),
      h('div', { flex: 1 }, [
        text('Trip to Bali 2024', { fontSize: 18, fontWeight: 600, color: colors.white }),
        text('Sarah, Mike, You', { fontSize: 14, color: '#8696A0' }),
      ]),
    ]),
    // Messages
    h('div', { flex: 1, flexDirection: 'column', gap: 12, padding: '0 12px' }, [
      // Message 1
      h('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        text('Sarah', { fontSize: 13, fontWeight: 600, color: '#25D366', marginBottom: 4, marginLeft: 8 }),
        h('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          text('guys what about data? do we need local SIM?', { fontSize: 18, color: colors.white })
        ),
      ]),
      // Message 2
      h('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        text('Mike', { fontSize: 13, fontWeight: 600, color: '#53BDEB', marginBottom: 4, marginLeft: 8 }),
        h('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          text('idk last time i paid like $200 😭', { fontSize: 18, color: colors.white })
        ),
      ]),
      // Message 3 - You
      h('div', { alignSelf: 'flex-end', maxWidth: '80%' }, [
        h('div', { padding: '10px 16px', backgroundColor: '#005C4B', borderRadius: 16 }, [
          text('just use lumbus esim', { fontSize: 18, color: colors.white }),
          text('its like $5 and instant', { fontSize: 18, color: colors.white, marginTop: 4 }),
        ]),
      ]),
      // Message 4
      h('div', { alignSelf: 'flex-start', maxWidth: '80%' }, [
        text('Sarah', { fontSize: 13, fontWeight: 600, color: '#25D366', marginBottom: 4, marginLeft: 8 }),
        h('div', { padding: '10px 16px', backgroundColor: '#1F2C34', borderRadius: 16 },
          text('wait WHAT downloading now 🙌', { fontSize: 18, color: colors.white })
        ),
      ]),
    ]),
    // Footer
    h('div', { marginTop: 24, alignItems: 'center' }, [
      LogoFull({ height: 32, dark: false }),
      text('Be the friend who knows', { fontSize: 14, color: '#8696A0', marginTop: 8 }),
    ]),
  ]);
}

// 14. PASSPORT STAMPS STYLE
function PassportStampsPost() {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F0E6',
    padding: 60,
  }, [
    // Header
    h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }, [
      text('TRAVEL LOG', { fontSize: 20, fontWeight: 700, color: colors.dark, letterSpacing: 4 }),
      Logo({ size: 40 }),
    ]),
    // Stamps grid
    h('div', { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignContent: 'center', justifyContent: 'center' },
      [
        { code: 'jp', name: 'JAPAN' },
        { code: 'fr', name: 'FRANCE' },
        { code: 'th', name: 'THAILAND' },
        { code: 'it', name: 'ITALY' },
      ].map(c =>
        h('div', {
          width: 200,
          height: 200,
          border: `4px solid ${colors.red}`,
          borderRadius: 100,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          transform: `rotate(${Math.random() * 20 - 10}deg)`,
        }, [
          FlagCircle({ code: c.code, size: 60 }),
          text(c.name, { fontSize: 16, fontWeight: 900, color: colors.red, marginTop: 8 }),
          text('DATA ✓', { fontSize: 12, fontWeight: 700, color: colors.primary }),
        ])
      )
    ),
    // Footer
    h('div', { alignItems: 'center' }, [
      text('Stay connected everywhere', { fontSize: 18, fontWeight: 600, color: colors.dark }),
      text('getlumbus.com', { fontSize: 14, color: colors.gray, marginTop: 8 }),
    ]),
  ]);
}

// 15. SIMPLE BOLD STATEMENT
function BoldStatementPost({ line1, line2, highlight }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
  }, [
    h('div', { marginBottom: 'auto' }, Logo({ size: 48 })),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
      text(line1, { fontSize: 64, fontWeight: 400, color: colors.white, lineHeight: 1.2 }),
      text(line2, { fontSize: 64, fontWeight: 900, color: highlight ? colors.primary : colors.white, lineHeight: 1.2 }),
    ]),
    text('getlumbus.com', { fontSize: 18, color: colors.gray }),
  ]);
}

// ============================================
// STORY FORMATS
// ============================================

function StoryPOV({ country, code }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 80,
  }, [
    h('div', { marginTop: 60 }, [
      text('POV:', { fontSize: 36, fontWeight: 700, color: colors.gray }),
    ]),
    h('div', { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }, [
      text('You landed in', { fontSize: 48, color: colors.white, marginBottom: 32 }),
      FlagCircle({ code, size: 200 }),
      text(country, { fontSize: 80, fontWeight: 900, color: colors.white, marginTop: 32, marginBottom: 24 }),
      text('and your data', { fontSize: 48, color: colors.white }),
      text('just works', { fontSize: 64, fontWeight: 900, color: colors.primary }),
    ]),
    h('div', { alignItems: 'center', marginBottom: 60 }, [
      h('div', { padding: '24px 64px', backgroundColor: colors.primary, borderRadius: 40 },
        text('Swipe up', { fontSize: 28, fontWeight: 700, color: colors.black })
      ),
      text('getlumbus.com', { fontSize: 18, color: colors.gray, marginTop: 24 }),
    ]),
  ]);
}

function StoryDestination({ name, code, price, vibe }) {
  return h('div', {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
  }, [
    // Flag background
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '55%',
    }, [
      flagCache[code] ? img(flagCache[code], {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }) : null,
      h('div', {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        background: 'linear-gradient(transparent, #0A0A0A)',
      }),
    ]),
    // Content
    h('div', {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 80,
      flexDirection: 'column',
      alignItems: 'center',
    }, [
      text(name, { fontSize: 96, fontWeight: 900, color: colors.white, marginBottom: 16 }),
      text(vibe, { fontSize: 28, color: colors.gray, marginBottom: 48 }),
      h('div', { flexDirection: 'column', alignItems: 'center', marginBottom: 48 }, [
        text('From', { fontSize: 20, color: colors.gray }),
        text(price, { fontSize: 80, fontWeight: 900, color: colors.primary }),
      ]),
      h('div', { padding: '24px 64px', backgroundColor: colors.primary, borderRadius: 40 },
        text('Get eSIM', { fontSize: 28, fontWeight: 700, color: colors.black })
      ),
      h('div', { marginTop: 40, flexDirection: 'row', alignItems: 'center', gap: 16 }, [
        Logo({ size: 36 }),
        text('Instant activation', { fontSize: 18, color: colors.gray }),
      ]),
    ]),
  ]);
}

// ============================================
// GENERATION
// ============================================

async function generateImage(element, width, height, filename, fonts) {
  try {
    const svg = await satori(element, { width, height, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    await fs.mkdir(OUTPUT, { recursive: true });
    await fs.writeFile(path.join(OUTPUT, filename), pngBuffer);
    console.log(`   ✓ ${filename}`);
  } catch (e) {
    console.error(`   ✗ ${filename}: ${e.message}`);
  }
}

async function main() {
  console.log('\n  ╔════════════════════════════════════════╗');
  console.log('  ║  LUMBUS V4 - VIRAL & TRENDY GENERATOR  ║');
  console.log('  ╚════════════════════════════════════════╝\n');

  console.log('  Loading assets...');
  await loadLogos();
  await loadAllFlags();

  console.log('  Downloading fonts...');
  const fontUrls = {
    regular: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff',
    medium: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff',
    semibold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff',
    black: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff',
  };

  const fontData = {};
  for (const [name, url] of Object.entries(fontUrls)) {
    const response = await fetch(url);
    fontData[name] = Buffer.from(await response.arrayBuffer());
  }
  const fonts = [
    { name: 'Inter', data: fontData.regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fontData.medium, weight: 500, style: 'normal' },
    { name: 'Inter', data: fontData.semibold, weight: 600, style: 'normal' },
    { name: 'Inter', data: fontData.bold, weight: 700, style: 'normal' },
    { name: 'Inter', data: fontData.black, weight: 900, style: 'normal' },
  ];
  console.log('  ✓ Fonts loaded\n');

  const sq = sizes.square;
  const st = sizes.story;

  // ============================================
  // VIRAL POSTS
  // ============================================
  console.log('  📱 Viral Square Posts (1080x1080)');

  // POV posts
  await generateImage(POVPost({ country: 'Japan', code: 'jp' }), sq.width, sq.height, 'pov-japan.png', fonts);
  await generateImage(POVPost({ country: 'Thailand', code: 'th' }), sq.width, sq.height, 'pov-thailand.png', fonts);
  await generateImage(POVPost({ country: 'France', code: 'fr' }), sq.width, sq.height, 'pov-france.png', fonts);
  await generateImage(POVPost({ country: 'Italy', code: 'it' }), sq.width, sq.height, 'pov-italy.png', fonts);

  // Meme formats
  await generateImage(NetflixPost(), sq.width, sq.height, 'netflix-parody.png', fonts);
  await generateImage(NobodyMemePost(), sq.width, sq.height, 'nobody-meme.png', fonts);
  await generateImage(ThisVsThatPost(), sq.width, sq.height, 'this-vs-that.png', fonts);
  await generateImage(GroupChatPost(), sq.width, sq.height, 'group-chat.png', fonts);

  // Spotify Wrapped
  await generateImage(SpotifyWrappedPost({ stat: '$247', label: 'on roaming fees', detail: 'By using eSIM instead of carrier roaming' }), sq.width, sq.height, 'wrapped-savings.png', fonts);
  await generateImage(SpotifyWrappedPost({ stat: '12', label: 'countries visited', detail: 'All with instant data from Lumbus' }), sq.width, sq.height, 'wrapped-countries.png', fonts);

  // iMessage conversations
  await generateImage(iMessagePost({
    messages: [
      { text: 'omg just landed in tokyo!!', sent: true },
      { text: 'how do u have data already??', sent: false },
      { text: 'esim lol. took 30 seconds', sent: true },
      { text: 'wait what??? send link', sent: false },
      { text: 'getlumbus.com 🙌', sent: true },
    ]
  }), sq.width, sq.height, 'imessage-tokyo.png', fonts);

  // Boarding pass
  await generateImage(BoardingPassPost({ from: 'NYC', to: 'Tokyo', toCode: 'jp', gate: 'B12', seat: '23A' }), sq.width, sq.height, 'boarding-tokyo.png', fonts);
  await generateImage(BoardingPassPost({ from: 'LAX', to: 'Paris', toCode: 'fr', gate: 'A8', seat: '14F' }), sq.width, sq.height, 'boarding-paris.png', fonts);

  // Hot takes
  await generateImage(HotTakePost({ take: 'Buying SIM cards at the airport is the modern equivalent of getting scammed by a street vendor' }), sq.width, sq.height, 'hot-take-1.png', fonts);
  await generateImage(HotTakePost({ take: "If you're still paying roaming fees in 2024, you're basically donating money to your carrier" }), sq.width, sq.height, 'hot-take-2.png', fonts);

  // Destination cards with flags
  console.log('\n  🌍 Destination Cards (1080x1080)');
  for (const c of countries.slice(0, 8)) {
    await generateImage(DestinationCard(c), sq.width, sq.height, `dest-${c.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  // Regional bundles with flag grids
  console.log('\n  🗺️ Regional Bundles (1080x1080)');
  await generateImage(RegionGridPost({ region: 'Europe', codes: ['fr', 'de', 'it', 'es', 'nl', 'pt', 'gr', 'gb'], count: 39, price: '$9.99' }), sq.width, sq.height, 'region-europe.png', fonts);
  await generateImage(RegionGridPost({ region: 'Asia', codes: ['jp', 'th', 'kr', 'sg', 'vn', 'my', 'ph', 'id'], count: 28, price: '$8.99' }), sq.width, sq.height, 'region-asia.png', fonts);
  await generateImage(RegionGridPost({ region: 'Americas', codes: ['us', 'ca', 'mx', 'br'], count: 22, price: '$7.99' }), sq.width, sq.height, 'region-americas.png', fonts);

  // Travel aesthetic
  console.log('\n  ✈️ Travel Aesthetic (1080x1080)');
  await generateImage(PlaneWindowPost({ destination: 'Japan', code: 'jp' }), sq.width, sq.height, 'plane-japan.png', fonts);
  await generateImage(PlaneWindowPost({ destination: 'Bali', code: 'id' }), sq.width, sq.height, 'plane-bali.png', fonts);
  await generateImage(PassportStampsPost(), sq.width, sq.height, 'passport-stamps.png', fonts);

  // Countdown FOMO
  await generateImage(CountdownPost({ hours: '48', destination: 'Tokyo', code: 'jp' }), sq.width, sq.height, 'countdown-tokyo.png', fonts);
  await generateImage(CountdownPost({ hours: '24', destination: 'Paris', code: 'fr' }), sq.width, sq.height, 'countdown-paris.png', fonts);

  // Bold statements
  await generateImage(BoldStatementPost({ line1: 'Stop paying', line2: '$15/MB for roaming', highlight: false }), sq.width, sq.height, 'bold-stop.png', fonts);
  await generateImage(BoldStatementPost({ line1: 'Your carrier hates', line2: 'this one trick', highlight: true }), sq.width, sq.height, 'bold-trick.png', fonts);
  await generateImage(BoldStatementPost({ line1: 'Data that', line2: 'travels with you', highlight: true }), sq.width, sq.height, 'bold-travels.png', fonts);

  // ============================================
  // STORIES
  // ============================================
  console.log('\n  📲 Stories (1080x1920)');

  // POV stories
  await generateImage(StoryPOV({ country: 'Japan', code: 'jp' }), st.width, st.height, 'story-pov-japan.png', fonts);
  await generateImage(StoryPOV({ country: 'Thailand', code: 'th' }), st.width, st.height, 'story-pov-thailand.png', fonts);
  await generateImage(StoryPOV({ country: 'Italy', code: 'it' }), st.width, st.height, 'story-pov-italy.png', fonts);

  // Destination stories
  for (const c of countries.slice(0, 6)) {
    await generateImage(StoryDestination(c), st.width, st.height, `story-${c.name.toLowerCase().replace(/\s+/g, '-')}.png`, fonts);
  }

  console.log('\n  ╔════════════════════════════════════════╗');
  console.log('  ║  V4 VIRAL CONTENT GENERATED!           ║');
  console.log(`  ║  Output: marketing/v4/output/          ║`);
  console.log('  ╚════════════════════════════════════════╝\n');
}

main().catch(console.error);
