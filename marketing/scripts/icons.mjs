/**
 * SVG Icon Components for Marketing Assets
 * High-quality vector icons that match the Lumbus design system
 */

import { colors } from './design-system.mjs';

// Helper to create SVG element
const svg = (props, children) => ({
  type: 'svg',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    ...props,
    children,
  },
});

const path = (d, props = {}) => ({
  type: 'path',
  props: { d, ...props },
});

const circle = (cx, cy, r, props = {}) => ({
  type: 'circle',
  props: { cx, cy, r, ...props },
});

const rect = (x, y, width, height, props = {}) => ({
  type: 'rect',
  props: { x, y, width, height, ...props },
});

// ============================================
// FEATURE ICONS
// ============================================

export function GlobeIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    circle(12, 12, 10, { stroke: color, strokeWidth: 2 }),
    path('M2 12h20', { stroke: color, strokeWidth: 2 }),
    path('M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', { stroke: color, strokeWidth: 2 }),
  ]);
}

export function LightningIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M13 2L3 14h9l-1 8 10-12h-9l1-8z', { fill: color }),
  ]);
}

export function WalletIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M1 10h22', { stroke: color, strokeWidth: 2 }),
    circle(18, 14, 2, { fill: color }),
  ]);
}

export function PhoneIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    rect(5, 2, 14, 20, { rx: 2, stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M12 18h.01', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
  ]);
}

export function AirplaneIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', { fill: color }),
  ]);
}

export function QRCodeIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    rect(3, 3, 7, 7, { stroke: color, strokeWidth: 2, fill: 'none' }),
    rect(14, 3, 7, 7, { stroke: color, strokeWidth: 2, fill: 'none' }),
    rect(3, 14, 7, 7, { stroke: color, strokeWidth: 2, fill: 'none' }),
    rect(5, 5, 3, 3, { fill: color }),
    rect(16, 5, 3, 3, { fill: color }),
    rect(5, 16, 3, 3, { fill: color }),
    rect(14, 14, 3, 3, { fill: color }),
    rect(17, 17, 4, 4, { fill: color }),
    rect(14, 17, 2, 2, { fill: color }),
    rect(17, 14, 2, 2, { fill: color }),
  ]);
}

export function RefreshIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M23 4v6h-6', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    path('M1 20v-6h6', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    path('M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  ]);
}

export function ShieldIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M9 12l2 2 4-4', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  ]);
}

export function StarIcon({ size = 24, color = colors.foreground, filled = true }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', {
      fill: filled ? color : 'none',
      stroke: color,
      strokeWidth: 2,
      strokeLinejoin: 'round',
    }),
  ]);
}

export function CheckIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M20 6L9 17l-5-5', { stroke: color, strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  ]);
}

export function XIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M18 6L6 18M6 6l12 12', { stroke: color, strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  ]);
}

export function DownloadIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    path('M7 10l5 5 5-5', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    path('M12 15V3', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' }),
  ]);
}

export function MapIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinejoin: 'round' }),
    path('M8 2v16', { stroke: color, strokeWidth: 2 }),
    path('M16 6v16', { stroke: color, strokeWidth: 2 }),
  ]);
}

export function CameraIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', { stroke: color, strokeWidth: 2, fill: 'none' }),
    circle(12, 13, 4, { stroke: color, strokeWidth: 2, fill: 'none' }),
  ]);
}

export function CelebrationIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M5.8 11.3L2 22l10.7-3.8', { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    path('M4 3h.01', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M22 8h.01', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M15 2h.01', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M22 20h.01', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M22 2L12 12', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M9 7l5 5', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M9 15l5-5', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
  ]);
}

export function BookOpenIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', { stroke: color, strokeWidth: 2, fill: 'none' }),
  ]);
}

export function CompassIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    circle(12, 12, 10, { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z', { stroke: color, strokeWidth: 2, fill: 'none' }),
  ]);
}

export function SparklesIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', { fill: color }),
    path('M5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z', { fill: color }),
    path('M19 14l.5 1.5L21 16l-1.5.5L19 18l-.5-1.5L17 16l1.5-.5L19 14z', { fill: color }),
  ]);
}

export function UsersIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', { stroke: color, strokeWidth: 2, fill: 'none' }),
    circle(9, 7, 4, { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M23 21v-2a4 4 0 0 0-3-3.87', { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M16 3.13a4 4 0 0 1 0 7.75', { stroke: color, strokeWidth: 2, fill: 'none' }),
  ]);
}

export function TagIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z', { stroke: color, strokeWidth: 2, fill: 'none' }),
    circle(7, 7, 1.5, { fill: color }),
  ]);
}

export function SunIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    circle(12, 12, 5, { stroke: color, strokeWidth: 2, fill: 'none' }),
    path('M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
  ]);
}

export function SignalIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M2 20h.01', { stroke: color, strokeWidth: 3, strokeLinecap: 'round' }),
    path('M7 20v-4', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M12 20v-8', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M17 20v-12', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M22 20v-16', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
  ]);
}

export function HeartIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', { fill: color }),
  ]);
}

export function ChartIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M18 20V10', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M12 20V4', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
    path('M6 20v-6', { stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
  ]);
}

export function PlaneIcon({ size = 24, color = colors.foreground }) {
  return svg({ width: size, height: size, viewBox: '0 0 24 24' }, [
    path('M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', { fill: color }),
  ]);
}

// ============================================
// FLAG REPRESENTATIONS (Stylized rectangles with colors)
// ============================================

export function FlagJapan({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#FFFFFF', rx: 4 }),
    circle(24, 16, 9, { fill: '#BC002D' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagUSA({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#B22234', rx: 4 }),
    // Stripes
    ...[1, 3, 5, 7, 9, 11].map(i => rect(0, (i * 32) / 13, 48, 32 / 13, { fill: '#FFFFFF' })),
    // Blue canton
    rect(0, 0, 19.2, 17.23, { fill: '#3C3B6E', rx: 4 }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagUK({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#012169', rx: 4 }),
    // White diagonals
    path('M0 0l48 32M48 0L0 32', { stroke: '#FFFFFF', strokeWidth: 6 }),
    // Red diagonals
    path('M0 0l48 32M48 0L0 32', { stroke: '#C8102E', strokeWidth: 2 }),
    // White cross
    path('M24 0v32M0 16h48', { stroke: '#FFFFFF', strokeWidth: 10 }),
    // Red cross
    path('M24 0v32M0 16h48', { stroke: '#C8102E', strokeWidth: 6 }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagThailand({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#A51931', rx: 4 }),
    rect(0, 5.33, 48, 21.34, { fill: '#FFFFFF' }),
    rect(0, 10.67, 48, 10.66, { fill: '#2D2A4A' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagFrance({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 16, 32, { fill: '#002395' }),
    rect(16, 0, 16, 32, { fill: '#FFFFFF' }),
    rect(32, 0, 16, 32, { fill: '#ED2939' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagAustralia({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#00008B', rx: 4 }),
    // Union Jack in corner (simplified)
    rect(0, 0, 20, 13, { fill: '#012169' }),
    path('M0 0l20 13M20 0L0 13', { stroke: '#FFFFFF', strokeWidth: 2.5 }),
    path('M10 0v13M0 6.5h20', { stroke: '#FFFFFF', strokeWidth: 4 }),
    path('M10 0v13M0 6.5h20', { stroke: '#C8102E', strokeWidth: 2 }),
    // Stars (simplified as circles)
    circle(36, 10, 2, { fill: '#FFFFFF' }),
    circle(40, 18, 1.5, { fill: '#FFFFFF' }),
    circle(36, 24, 1.5, { fill: '#FFFFFF' }),
    circle(30, 20, 1.5, { fill: '#FFFFFF' }),
    circle(32, 14, 1.5, { fill: '#FFFFFF' }),
    circle(10, 22, 3, { fill: '#FFFFFF' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagItaly({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 16, 32, { fill: '#009246' }),
    rect(16, 0, 16, 32, { fill: '#FFFFFF' }),
    rect(32, 0, 16, 32, { fill: '#CE2B37' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagGermany({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 10.67, { fill: '#000000' }),
    rect(0, 10.67, 48, 10.66, { fill: '#DD0000' }),
    rect(0, 21.33, 48, 10.67, { fill: '#FFCE00' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagSpain({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 8, { fill: '#AA151B' }),
    rect(0, 8, 48, 16, { fill: '#F1BF00' }),
    rect(0, 24, 48, 8, { fill: '#AA151B' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagSingapore({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 16, { fill: '#EF3340' }),
    rect(0, 16, 48, 16, { fill: '#FFFFFF' }),
    // Crescent and stars (simplified)
    circle(12, 8, 5, { fill: '#FFFFFF' }),
    circle(14, 8, 4, { fill: '#EF3340' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagSouthKorea({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#FFFFFF', rx: 4 }),
    circle(24, 16, 8, { fill: '#C60C30' }),
    path('M24 8a8 8 0 0 1 0 16', { fill: '#003478' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagIndonesia({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 16, { fill: '#FF0000' }),
    rect(0, 16, 48, 16, { fill: '#FFFFFF' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagEurope({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: '#003399', rx: 4 }),
    // Circle of stars (simplified)
    ...[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
      const rad = (angle * Math.PI) / 180;
      const cx = 24 + 10 * Math.cos(rad);
      const cy = 16 + 10 * Math.sin(rad);
      return circle(cx, cy, 1.5, { fill: '#FFCC00' });
    }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagGlobal({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: colors.primary, rx: 4 }),
    circle(24, 16, 10, { stroke: colors.foreground, strokeWidth: 2, fill: 'none' }),
    path('M14 16h20', { stroke: colors.foreground, strokeWidth: 1.5 }),
    path('M24 6c3 2.67 5 6.33 5 10s-2 7.33-5 10c-3-2.67-5-6.33-5-10s2-7.33 5-10', { stroke: colors.foreground, strokeWidth: 1.5, fill: 'none' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagAsia({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: colors.accent, rx: 4 }),
    circle(24, 16, 10, { stroke: colors.foreground, strokeWidth: 2, fill: 'none' }),
    path('M14 16h20', { stroke: colors.foreground, strokeWidth: 1.5 }),
    path('M24 6a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10', { stroke: colors.foreground, strokeWidth: 1.5, fill: 'none' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

export function FlagAmericas({ size = 48 }) {
  return svg({ width: size, height: size * 0.667, viewBox: '0 0 48 32' }, [
    rect(0, 0, 48, 32, { fill: colors.purple, rx: 4 }),
    circle(24, 16, 10, { stroke: colors.foreground, strokeWidth: 2, fill: 'none' }),
    path('M14 16h20', { stroke: colors.foreground, strokeWidth: 1.5 }),
    path('M24 6a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10', { stroke: colors.foreground, strokeWidth: 1.5, fill: 'none' }),
    rect(0, 0, 48, 32, { fill: 'none', stroke: '#E5E5E5', strokeWidth: 1, rx: 4 }),
  ]);
}

// Flag lookup
export const FLAGS = {
  'Japan': FlagJapan,
  'United States': FlagUSA,
  'United Kingdom': FlagUK,
  'Thailand': FlagThailand,
  'France': FlagFrance,
  'Australia': FlagAustralia,
  'Italy': FlagItaly,
  'Germany': FlagGermany,
  'Spain': FlagSpain,
  'Singapore': FlagSingapore,
  'South Korea': FlagSouthKorea,
  'Indonesia': FlagIndonesia,
  'Europe': FlagEurope,
  'Asia Pacific': FlagAsia,
  'Americas': FlagAmericas,
  'Global': FlagGlobal,
  'Middle East': FlagGlobal,
};

export function getFlag(name, size = 48) {
  const Flag = FLAGS[name] || FlagGlobal;
  return Flag({ size });
}
