import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, ClipPath, Ellipse } from 'react-native-svg';

// Re-export all flags from regional files
export * from './Asia';
export * from './Europe';
export * from './Americas';
export * from './OtherRegions';

// Import all flag components for the lookup map
import {
  FlagJP, FlagCN, FlagKR, FlagID, FlagTH, FlagMY, FlagSG, FlagVN, FlagPH, FlagHK,
  FlagMO, FlagLK, FlagIN, FlagPK, FlagBD, FlagKH, FlagLA, FlagMN, FlagMM, FlagNP,
  FlagBN, FlagMV, FlagTJ, FlagKG, FlagKZ, FlagUZ, FlagAM, FlagAZ, FlagGE, FlagAF
} from './Asia';

import {
  FlagFR, FlagDE, FlagGB, FlagUK, FlagIT, FlagES, FlagCH, FlagNL, FlagGR, FlagAT,
  FlagBE, FlagPT, FlagSE, FlagNO, FlagDK, FlagFI, FlagPL, FlagCZ, FlagHU, FlagRO,
  FlagBG, FlagHR, FlagRS, FlagSI, FlagSK, FlagLT, FlagLV, FlagEE, FlagIE, FlagCY,
  FlagLU, FlagMT, FlagIS, FlagAL, FlagBA, FlagMK, FlagME, FlagXK, FlagMD, FlagBY,
  FlagUA, FlagAD, FlagMC, FlagLI, FlagGI, FlagIM, FlagJE, FlagGG, FlagAX, FlagFO,
  FlagTR, FlagEU
} from './Europe';

import {
  FlagUS, FlagCA, FlagMX, FlagBR, FlagAR, FlagCL, FlagCO, FlagPE, FlagEC, FlagUY,
  FlagPY, FlagBO, FlagCR, FlagPA, FlagGT, FlagHN, FlagNI, FlagSV, FlagBZ, FlagDO,
  FlagJM, FlagTT, FlagBS, FlagBB, FlagGD, FlagLC, FlagVC, FlagKN, FlagAG, FlagDM,
  FlagAI, FlagBM, FlagKY, FlagTC, FlagVG, FlagPR, FlagGP
} from './Americas';

import {
  FlagAU, FlagNZ, FlagGU, FlagAE, FlagSA, FlagQA, FlagKW, FlagBH, FlagOM, FlagIL,
  FlagJO, FlagIQ, FlagZA, FlagEG, FlagMA, FlagDZ, FlagTN, FlagKE, FlagNG, FlagTZ,
  FlagUG, FlagRW, FlagMU, FlagSC, FlagZM, FlagBW, FlagMZ, FlagMW, FlagSZ, FlagSN,
  FlagCM, FlagCI, FlagGA, FlagCG, FlagTD, FlagCF, FlagBF, FlagML, FlagNE, FlagLR,
  FlagSD, FlagMG, FlagRE,
  // Additional Middle East
  FlagYE, FlagLB, FlagPS, FlagSY, FlagIR,
  // Additional Oceania
  FlagFJ, FlagPG, FlagWS, FlagTO, FlagVU,
  // Additional Africa
  FlagGH, FlagET, FlagCD, FlagAO, FlagZW, FlagNA,
  // Asia additions
  FlagTW, FlagTL,
  // Regional flags
  FlagGCC, FlagGlobal, FlagASEAN, FlagAU_Union, FlagCARICOM,
  // Caribbean additions
  FlagMQ, FlagCW, FlagAW, FlagSX, FlagVI, FlagGF, FlagSR, FlagGY, FlagVE, FlagHT, FlagCU
} from './OtherRegions';

interface FlagProps {
  size?: number;
}

// ==================== GLOBAL/REGIONAL ICONS ====================

// Globe Icon (World)
export function GlobeIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M2 12h20" stroke={color} strokeWidth="1.5" />
      <Ellipse cx="12" cy="12" rx="4" ry="10" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// Location Pin Icon
export function LocationPinIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// Map Icon
export function MapIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7l6-3 6 3 6-3v14l-6 3-6-3-6 3V7z" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M9 4v14M15 7v14" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// Asia Globe
export function AsiaGlobeIcon({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Circle fill="#4A90D9" cx="256" cy="256" r="240" />
      <Path fill="#7EC850" d="M150 150h200v180H150z" />
      <Circle cx="256" cy="256" r="180" stroke="#FFF" strokeWidth="8" fill="none" />
    </Svg>
  );
}

// Americas Globe
export function AmericasGlobeIcon({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Circle fill="#4A90D9" cx="256" cy="256" r="240" />
      <Path fill="#7EC850" d="M200 100h80v300h-80z" />
      <Circle cx="256" cy="256" r="180" stroke="#FFF" strokeWidth="8" fill="none" />
    </Svg>
  );
}

// Africa/Europe Globe
export function AfricaEuropeGlobeIcon({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Circle fill="#4A90D9" cx="256" cy="256" r="240" />
      <Path fill="#7EC850" d="M220 100h80v150h-80zM200 250h120v150H200z" />
      <Circle cx="256" cy="256" r="180" stroke="#FFF" strokeWidth="8" fill="none" />
    </Svg>
  );
}

// ==================== UI EMOJI ICONS ====================

// Party Popper / Celebration Icon (🎉)
export function PartyIcon({ size = 24, color = '#F59E0B' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5.8 21L1 16.2l11.2-11.2c.5-.5 1.3-.5 1.8 0l3 3c.5.5.5 1.3 0 1.8L5.8 21z" fill={color} />
      <Path d="M3.5 18.5l2 2" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
      <Circle fill="#F472B6" cx="9" cy="3" r="1.5" />
      <Circle fill="#60A5FA" cx="18" cy="6" r="1.5" />
      <Circle fill="#34D399" cx="21" cy="12" r="1.5" />
      <Path d="M15 2l1 2M20 8l2 1M17 17l1.5 1.5" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 4l.5 1.5M19 4l.5 1" stroke="#F472B6" strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

// Lightning / Bolt Icon (⚡)
export function LightningIcon({ size = 24, color = '#FBBF24' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.09 12.41A1 1 0 004.86 14H11l-1 8 8.91-10.41A1 1 0 0018.14 10H12l1-8z" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Credit Card Icon (💳)
export function CreditCardIcon({ size = 24, color = '#6366F1' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" fill={color} />
      <Rect x="2" y="8" width="20" height="4" fill="#1E1B4B" />
      <Rect x="5" y="15" width="6" height="2" rx="1" fill="#A5B4FC" />
      <Rect x="13" y="15" width="3" height="2" rx="1" fill="#A5B4FC" />
    </Svg>
  );
}

// Mobile Phone Icon (📲)
export function MobilePhoneIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="7" y="4" width="10" height="14" rx="1" fill="#E5E7EB" />
      <Circle cx="12" cy="20" r="1" fill={color} />
      <Path d="M9 5l6 4-6 4V5z" fill="#3B82F6" />
    </Svg>
  );
}

// Checkmark / Success Icon (✓)
export function CheckmarkIcon({ size = 24, color = '#22C55E' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path d="M7 12l3 3 7-7" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// World Map Icon (🗺️)
export function WorldMapIcon({ size = 24, color = '#3B82F6' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" fill="#E0F2FE" stroke={color} strokeWidth="1.5" />
      <Path fill="#86EFAC" d="M4 8c2-1 4 0 5 1s2 3 1 4-3 1-4 0-2-2-2-3 0-1.5 0-2z" />
      <Path fill="#86EFAC" d="M12 7c1.5-.5 3 0 4 1s1 3 0 4-2.5 1-3.5 0-1.5-3-0.5-5z" />
      <Path fill="#86EFAC" d="M15 14c1 0 2 .5 2.5 1.5s0 2-1 2-2-.5-2-1.5.5-2 .5-2z" />
    </Svg>
  );
}

// WiFi / Signal Icon (📶)
export function WifiIcon({ size = 24, color = '#22C55E' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20h.01" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <Path d="M8.5 16.5a5 5 0 017 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M5 13a10 10 0 0114 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M1.5 9.5a15 15 0 0121 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// SIM Card Icon
export function SimCardIcon({ size = 24, color = '#3B82F6' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" fill={color} />
      <Path d="M13 4v5h5" stroke="#93C5FD" strokeWidth="1.5" />
      <Rect x="7" y="11" width="10" height="7" rx="1" fill="#1E40AF" />
      <Path d="M9 11v7M12 11v7M15 11v7" stroke="#3B82F6" strokeWidth="1" />
      <Path d="M7 14h10" stroke="#3B82F6" strokeWidth="1" />
    </Svg>
  );
}

// Airplane Icon
export function AirplaneIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill={color} />
    </Svg>
  );
}

// Download Icon
export function DownloadIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// QR Code Icon
export function QRCodeIcon({ size = 24, color = '#1A1A1A' }: FlagProps & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="5" y="5" width="3" height="3" fill={color} />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="16" y="5" width="3" height="3" fill={color} />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="5" y="16" width="3" height="3" fill={color} />
      <Rect x="14" y="14" width="3" height="3" fill={color} />
      <Rect x="18" y="14" width="3" height="3" fill={color} />
      <Rect x="14" y="18" width="3" height="3" fill={color} />
      <Rect x="18" y="18" width="3" height="3" fill={color} />
    </Svg>
  );
}

// Caribbean Island Icon
export function CaribbeanIcon({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Circle fill="#4A90D9" cx="256" cy="256" r="240" />
      <Ellipse fill="#F4D03F" cx="200" cy="280" rx="60" ry="30" />
      <Ellipse fill="#F4D03F" cx="300" cy="250" rx="50" ry="25" />
      <Ellipse fill="#F4D03F" cx="260" cy="320" rx="40" ry="20" />
      <Path fill="#27AE60" d="M190 260l20-40 20 40z" />
      <Path fill="#27AE60" d="M290 230l15-30 15 30z" />
    </Svg>
  );
}

// Type for flag component
type FlagComponent = React.FC<FlagProps>;

// Map of country/region codes to flag components
export const FLAG_MAP: Record<string, FlagComponent> = {
  // Asia
  JP: FlagJP, CN: FlagCN, KR: FlagKR, ID: FlagID, TH: FlagTH, MY: FlagMY, SG: FlagSG,
  VN: FlagVN, PH: FlagPH, HK: FlagHK, MO: FlagMO, LK: FlagLK, IN: FlagIN, PK: FlagPK,
  BD: FlagBD, KH: FlagKH, LA: FlagLA, MN: FlagMN, MM: FlagMM, NP: FlagNP, BN: FlagBN,
  MV: FlagMV, TJ: FlagTJ, KG: FlagKG, KZ: FlagKZ, UZ: FlagUZ, AM: FlagAM, AZ: FlagAZ,
  GE: FlagGE, AF: FlagAF,

  // Europe
  FR: FlagFR, DE: FlagDE, GB: FlagGB, UK: FlagUK, IT: FlagIT, ES: FlagES, CH: FlagCH,
  NL: FlagNL, GR: FlagGR, AT: FlagAT, BE: FlagBE, PT: FlagPT, SE: FlagSE, NO: FlagNO,
  DK: FlagDK, FI: FlagFI, PL: FlagPL, CZ: FlagCZ, HU: FlagHU, RO: FlagRO, BG: FlagBG,
  HR: FlagHR, RS: FlagRS, SI: FlagSI, SK: FlagSK, LT: FlagLT, LV: FlagLV, EE: FlagEE,
  IE: FlagIE, CY: FlagCY, LU: FlagLU, MT: FlagMT, IS: FlagIS, AL: FlagAL, BA: FlagBA,
  MK: FlagMK, ME: FlagME, XK: FlagXK, MD: FlagMD, BY: FlagBY, UA: FlagUA, AD: FlagAD,
  MC: FlagMC, LI: FlagLI, GI: FlagGI, IM: FlagIM, JE: FlagJE, GG: FlagGG, AX: FlagAX,
  FO: FlagFO, TR: FlagTR, EU: FlagEU,

  // Americas
  US: FlagUS, CA: FlagCA, MX: FlagMX, BR: FlagBR, AR: FlagAR, CL: FlagCL, CO: FlagCO,
  PE: FlagPE, EC: FlagEC, UY: FlagUY, PY: FlagPY, BO: FlagBO, CR: FlagCR, PA: FlagPA,
  GT: FlagGT, HN: FlagHN, NI: FlagNI, SV: FlagSV, BZ: FlagBZ, DO: FlagDO, JM: FlagJM,
  TT: FlagTT, BS: FlagBS, BB: FlagBB, GD: FlagGD, LC: FlagLC, VC: FlagVC, KN: FlagKN,
  AG: FlagAG, DM: FlagDM, AI: FlagAI, BM: FlagBM, KY: FlagKY, TC: FlagTC, VG: FlagVG,
  PR: FlagPR, GP: FlagGP,

  // Oceania
  AU: FlagAU, NZ: FlagNZ, GU: FlagGU,

  // Middle East
  AE: FlagAE, SA: FlagSA, QA: FlagQA, KW: FlagKW, BH: FlagBH, OM: FlagOM, IL: FlagIL,
  JO: FlagJO, IQ: FlagIQ,

  // Africa
  ZA: FlagZA, EG: FlagEG, MA: FlagMA, DZ: FlagDZ, TN: FlagTN, KE: FlagKE, NG: FlagNG,
  TZ: FlagTZ, UG: FlagUG, RW: FlagRW, MU: FlagMU, SC: FlagSC, ZM: FlagZM, BW: FlagBW,
  MZ: FlagMZ, MW: FlagMW, SZ: FlagSZ, SN: FlagSN, CM: FlagCM, CI: FlagCI, GA: FlagGA,
  CG: FlagCG, TD: FlagTD, CF: FlagCF, BF: FlagBF, ML: FlagML, NE: FlagNE, LR: FlagLR,
  SD: FlagSD, MG: FlagMG, RE: FlagRE,
  // Additional Africa
  GH: FlagGH, ET: FlagET, CD: FlagCD, AO: FlagAO, ZW: FlagZW, NA: FlagNA,

  // Additional Middle East
  YE: FlagYE, LB: FlagLB, PS: FlagPS, SY: FlagSY, IR: FlagIR,

  // Additional Oceania
  FJ: FlagFJ, PG: FlagPG, WS: FlagWS, TO: FlagTO, VU: FlagVU,

  // Asia additions
  TW: FlagTW, TL: FlagTL,

  // Caribbean additions
  MQ: FlagMQ, CW: FlagCW, AW: FlagAW, SX: FlagSX, VI: FlagVI, GF: FlagGF,
  SR: FlagSR, GY: FlagGY, VE: FlagVE, HT: FlagHT, CU: FlagCU,

  // Regional flags
  GCC: FlagGCC, GLOBAL: FlagGlobal, WORLD: FlagGlobal, ASEAN: FlagASEAN,
  AU_UNION: FlagAU_Union, CARICOM: FlagCARICOM,
};

// Map of country names to codes
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  // Asia
  'Japan': 'JP', 'China': 'CN', 'South Korea': 'KR', 'Indonesia': 'ID', 'Thailand': 'TH',
  'Malaysia': 'MY', 'Singapore': 'SG', 'Vietnam': 'VN', 'Philippines': 'PH', 'Hong Kong': 'HK',
  'Macau': 'MO', 'Sri Lanka': 'LK', 'India': 'IN', 'Pakistan': 'PK', 'Bangladesh': 'BD',
  'Cambodia': 'KH', 'Laos': 'LA', 'Mongolia': 'MN', 'Myanmar': 'MM', 'Nepal': 'NP',
  'Brunei': 'BN', 'Maldives': 'MV', 'Tajikistan': 'TJ', 'Kyrgyzstan': 'KG', 'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ', 'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Georgia': 'GE', 'Afghanistan': 'AF',

  // Europe
  'France': 'FR', 'Germany': 'DE', 'United Kingdom': 'GB', 'Italy': 'IT', 'Spain': 'ES',
  'Switzerland': 'CH', 'Netherlands': 'NL', 'Greece': 'GR', 'Austria': 'AT', 'Belgium': 'BE',
  'Portugal': 'PT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
  'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU', 'Romania': 'RO', 'Bulgaria': 'BG',
  'Croatia': 'HR', 'Serbia': 'RS', 'Slovenia': 'SI', 'Slovakia': 'SK', 'Lithuania': 'LT',
  'Latvia': 'LV', 'Estonia': 'EE', 'Ireland': 'IE', 'Cyprus': 'CY', 'Luxembourg': 'LU',
  'Malta': 'MT', 'Iceland': 'IS', 'Albania': 'AL', 'Bosnia and Herzegovina': 'BA',
  'North Macedonia': 'MK', 'Montenegro': 'ME', 'Kosovo': 'XK', 'Moldova': 'MD', 'Belarus': 'BY',
  'Ukraine': 'UA', 'Andorra': 'AD', 'Monaco': 'MC', 'Liechtenstein': 'LI', 'Gibraltar': 'GI',
  'Isle of Man': 'IM', 'Jersey': 'JE', 'Guernsey': 'GG', 'Åland Islands': 'AX',
  'Faroe Islands': 'FO', 'Turkey': 'TR', 'European Union': 'EU',

  // Americas
  'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX', 'Brazil': 'BR', 'Argentina': 'AR',
  'Chile': 'CL', 'Colombia': 'CO', 'Peru': 'PE', 'Ecuador': 'EC', 'Uruguay': 'UY',
  'Paraguay': 'PY', 'Bolivia': 'BO', 'Costa Rica': 'CR', 'Panama': 'PA', 'Guatemala': 'GT',
  'Honduras': 'HN', 'Nicaragua': 'NI', 'El Salvador': 'SV', 'Belize': 'BZ',
  'Dominican Republic': 'DO', 'Jamaica': 'JM', 'Trinidad and Tobago': 'TT', 'Bahamas': 'BS',
  'Barbados': 'BB', 'Grenada': 'GD', 'Saint Lucia': 'LC', 'Saint Vincent and the Grenadines': 'VC',
  'Saint Kitts and Nevis': 'KN', 'Antigua and Barbuda': 'AG', 'Dominica': 'DM', 'Anguilla': 'AI',
  'Bermuda': 'BM', 'Cayman Islands': 'KY', 'Turks and Caicos': 'TC', 'British Virgin Islands': 'VG',
  'Puerto Rico': 'PR', 'Guadeloupe': 'GP',

  // Oceania
  'Australia': 'AU', 'New Zealand': 'NZ', 'Guam': 'GU',

  // Middle East
  'United Arab Emirates': 'AE', 'UAE': 'AE', 'Saudi Arabia': 'SA', 'Qatar': 'QA', 'Kuwait': 'KW',
  'Bahrain': 'BH', 'Oman': 'OM', 'Israel': 'IL', 'Jordan': 'JO', 'Iraq': 'IQ',

  // Africa
  'South Africa': 'ZA', 'Egypt': 'EG', 'Morocco': 'MA', 'Algeria': 'DZ', 'Tunisia': 'TN',
  'Kenya': 'KE', 'Nigeria': 'NG', 'Tanzania': 'TZ', 'Uganda': 'UG', 'Rwanda': 'RW',
  'Mauritius': 'MU', 'Seychelles': 'SC', 'Zambia': 'ZM', 'Botswana': 'BW', 'Mozambique': 'MZ',
  'Malawi': 'MW', 'Eswatini': 'SZ', 'Senegal': 'SN', 'Cameroon': 'CM', "Côte d'Ivoire": 'CI',
  'Gabon': 'GA', 'Republic of the Congo': 'CG', 'Chad': 'TD', 'Central African Republic': 'CF',
  'Burkina Faso': 'BF', 'Mali': 'ML', 'Niger': 'NE', 'Liberia': 'LR', 'Sudan': 'SD',
  'Madagascar': 'MG', 'Réunion': 'RE',
  // Additional Africa
  'Ghana': 'GH', 'Ethiopia': 'ET', 'Democratic Republic of the Congo': 'CD', 'Congo DRC': 'CD',
  'Angola': 'AO', 'Zimbabwe': 'ZW', 'Namibia': 'NA',

  // Additional Middle East
  'Yemen': 'YE', 'Lebanon': 'LB', 'Palestine': 'PS', 'Syria': 'SY', 'Iran': 'IR',

  // Additional Oceania
  'Fiji': 'FJ', 'Papua New Guinea': 'PG', 'Samoa': 'WS', 'Tonga': 'TO', 'Vanuatu': 'VU',

  // Asia additions
  'Taiwan': 'TW', 'Timor-Leste': 'TL', 'East Timor': 'TL',

  // Caribbean additions
  'Martinique': 'MQ', 'Curacao': 'CW', 'Curaçao': 'CW', 'Aruba': 'AW', 'Sint Maarten': 'SX',
  'US Virgin Islands': 'VI', 'French Guiana': 'GF', 'Suriname': 'SR', 'Guyana': 'GY',
  'Venezuela': 'VE', 'Haiti': 'HT', 'Cuba': 'CU',

  // Regional
  'Global': 'GLOBAL', 'World': 'WORLD', 'GCC': 'GCC', 'Gulf': 'GCC',
  'ASEAN': 'ASEAN', 'Caribbean': 'CARICOM',
};

// Get flag component by country code
export function getFlagByCode(code: string, size: number = 24): React.ReactNode {
  const FlagComponent = FLAG_MAP[code.toUpperCase()];
  if (FlagComponent) {
    return <FlagComponent size={size} />;
  }
  return <GlobeIcon size={size} />;
}

// Get flag component by country name
export function getFlagByName(name: string, size: number = 24): React.ReactNode {
  const code = COUNTRY_NAME_TO_CODE[name];
  if (code) {
    return getFlagByCode(code, size);
  }
  return <GlobeIcon size={size} />;
}

// Get the flag component class by code (for custom rendering)
export function getFlagComponentByCode(code: string): FlagComponent {
  return FLAG_MAP[code.toUpperCase()] || GlobeIcon;
}

// Get the flag component class by name (for custom rendering)
export function getFlagComponentByName(name: string): FlagComponent {
  const code = COUNTRY_NAME_TO_CODE[name];
  if (code) {
    return getFlagComponentByCode(code);
  }
  return GlobeIcon;
}

// Check if a flag exists for a given code
export function hasFlagForCode(code: string): boolean {
  return code.toUpperCase() in FLAG_MAP;
}

// Check if a flag exists for a given name
export function hasFlagForName(name: string): boolean {
  return name in COUNTRY_NAME_TO_CODE;
}

// Regional flag helpers
export function getRegionalIcon(regionCode: string, size: number = 24): React.ReactNode {
  const code = regionCode.toUpperCase();

  // Check for specific regional codes
  if (code.startsWith('EU') || code.startsWith('EUR')) {
    return <FlagEU size={size} />;
  }
  if (code.startsWith('AS-') || code.startsWith('ASIA') || code === 'ASEAN') {
    return <FlagASEAN size={size} />;
  }
  if (code === 'NA-3' || code.startsWith('USCA')) {
    return <AmericasGlobeIcon size={size} />;
  }
  if (code.startsWith('CB') || code.startsWith('CARIB') || code === 'CARICOM') {
    return <FlagCARICOM size={size} />;
  }
  if (code === 'GCC' || code.startsWith('GCC-') || code === 'GULF') {
    return <FlagGCC size={size} />;
  }
  if (code.startsWith('ME-') || code.startsWith('MIDDLE')) {
    return <FlagGCC size={size} />;
  }
  if (code.startsWith('GL') || code.startsWith('GLOBAL') || code.startsWith('WORLD')) {
    return <FlagGlobal size={size} />;
  }
  if (code.startsWith('AUNZ')) {
    // For Australia & New Zealand region, specifically return the Oceania/AU Union icon
    // instead of falling back to AU flag or globe
    return <FlagAU_Union size={size} />;
  }
  if (code.startsWith('CN-')) {
    return <FlagCN size={size} />;
  }
  if (code.startsWith('AF') || code === 'AFRICA') {
    return <FlagAU_Union size={size} />;
  }
  if (code === 'NA' && !FLAG_MAP[code]) {
    // NA as region (North America) vs NA as country (Namibia)
    return <AmericasGlobeIcon size={size} />;
  }
  if (code === 'SA' && !FLAG_MAP[code]) {
    // SA as region (South America) vs SA as country (Saudi Arabia)
    return <AmericasGlobeIcon size={size} />;
  }

  // Try to get a specific country flag
  if (FLAG_MAP[code]) {
    const FlagComponent = FLAG_MAP[code];
    return <FlagComponent size={size} />;
  }

  // Default to globe
  return <FlagGlobal size={size} />;
}

// Unified function to get any flag/icon by code or name
export function getFlag(codeOrName: string, size: number = 24): React.ReactNode {
  // First try as a code
  if (FLAG_MAP[codeOrName.toUpperCase()]) {
    return getFlagByCode(codeOrName, size);
  }

  // Then try as a name
  if (COUNTRY_NAME_TO_CODE[codeOrName]) {
    return getFlagByName(codeOrName, size);
  }

  // Then try as a regional code
  return getRegionalIcon(codeOrName, size);
}
