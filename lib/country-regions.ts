/**
 * Country and region mappings for eSIM plans
 * Based on actual data from database (188 regions, 1700+ plans)
 *
 * This file uses SVG flags via the getFlag() function from components/icons/flags
 * instead of emoji strings for full iOS/Android compatibility.
 */

import { getFlag, GlobeIcon, AmericasGlobeIcon, AsiaGlobeIcon, AfricaEuropeGlobeIcon, CaribbeanIcon } from '../components/icons/flags';

export interface CountryInfo {
  code: string;
  name: string;
  continent: string;
}

export interface RegionInfo {
  code: string;
  name: string;
  description: string;
  countries: string[];
}

// All single countries with their information
// Note: Flags are retrieved via getFlag(code) - no emoji strings needed
export const COUNTRIES: Record<string, CountryInfo> = {
  // Asia - Top regions
  JP: { code: 'JP', name: 'Japan', continent: 'Asia' },
  CN: { code: 'CN', name: 'China', continent: 'Asia' },
  KR: { code: 'KR', name: 'South Korea', continent: 'Asia' },
  ID: { code: 'ID', name: 'Indonesia', continent: 'Asia' },
  TH: { code: 'TH', name: 'Thailand', continent: 'Asia' },
  MY: { code: 'MY', name: 'Malaysia', continent: 'Asia' },
  SG: { code: 'SG', name: 'Singapore', continent: 'Asia' },
  VN: { code: 'VN', name: 'Vietnam', continent: 'Asia' },
  PH: { code: 'PH', name: 'Philippines', continent: 'Asia' },
  HK: { code: 'HK', name: 'Hong Kong', continent: 'Asia' },
  MO: { code: 'MO', name: 'Macau', continent: 'Asia' },
  LK: { code: 'LK', name: 'Sri Lanka', continent: 'Asia' },
  IN: { code: 'IN', name: 'India', continent: 'Asia' },
  PK: { code: 'PK', name: 'Pakistan', continent: 'Asia' },
  BD: { code: 'BD', name: 'Bangladesh', continent: 'Asia' },
  KH: { code: 'KH', name: 'Cambodia', continent: 'Asia' },
  LA: { code: 'LA', name: 'Laos', continent: 'Asia' },
  MN: { code: 'MN', name: 'Mongolia', continent: 'Asia' },
  MM: { code: 'MM', name: 'Myanmar', continent: 'Asia' },
  NP: { code: 'NP', name: 'Nepal', continent: 'Asia' },
  BN: { code: 'BN', name: 'Brunei', continent: 'Asia' },
  MV: { code: 'MV', name: 'Maldives', continent: 'Asia' },
  TJ: { code: 'TJ', name: 'Tajikistan', continent: 'Asia' },
  KG: { code: 'KG', name: 'Kyrgyzstan', continent: 'Asia' },
  KZ: { code: 'KZ', name: 'Kazakhstan', continent: 'Asia' },
  UZ: { code: 'UZ', name: 'Uzbekistan', continent: 'Asia' },
  AM: { code: 'AM', name: 'Armenia', continent: 'Asia' },
  AZ: { code: 'AZ', name: 'Azerbaijan', continent: 'Asia' },
  GE: { code: 'GE', name: 'Georgia', continent: 'Asia' },
  AF: { code: 'AF', name: 'Afghanistan', continent: 'Asia' },
  TW: { code: 'TW', name: 'Taiwan', continent: 'Asia' },
  TL: { code: 'TL', name: 'Timor-Leste', continent: 'Asia' },

  // Europe
  FR: { code: 'FR', name: 'France', continent: 'Europe' },
  DE: { code: 'DE', name: 'Germany', continent: 'Europe' },
  GB: { code: 'GB', name: 'United Kingdom', continent: 'Europe' },
  UK: { code: 'UK', name: 'United Kingdom', continent: 'Europe' },
  IT: { code: 'IT', name: 'Italy', continent: 'Europe' },
  ES: { code: 'ES', name: 'Spain', continent: 'Europe' },
  CH: { code: 'CH', name: 'Switzerland', continent: 'Europe' },
  NL: { code: 'NL', name: 'Netherlands', continent: 'Europe' },
  GR: { code: 'GR', name: 'Greece', continent: 'Europe' },
  AT: { code: 'AT', name: 'Austria', continent: 'Europe' },
  BE: { code: 'BE', name: 'Belgium', continent: 'Europe' },
  PT: { code: 'PT', name: 'Portugal', continent: 'Europe' },
  SE: { code: 'SE', name: 'Sweden', continent: 'Europe' },
  NO: { code: 'NO', name: 'Norway', continent: 'Europe' },
  DK: { code: 'DK', name: 'Denmark', continent: 'Europe' },
  FI: { code: 'FI', name: 'Finland', continent: 'Europe' },
  PL: { code: 'PL', name: 'Poland', continent: 'Europe' },
  CZ: { code: 'CZ', name: 'Czech Republic', continent: 'Europe' },
  HU: { code: 'HU', name: 'Hungary', continent: 'Europe' },
  RO: { code: 'RO', name: 'Romania', continent: 'Europe' },
  BG: { code: 'BG', name: 'Bulgaria', continent: 'Europe' },
  HR: { code: 'HR', name: 'Croatia', continent: 'Europe' },
  RS: { code: 'RS', name: 'Serbia', continent: 'Europe' },
  SI: { code: 'SI', name: 'Slovenia', continent: 'Europe' },
  SK: { code: 'SK', name: 'Slovakia', continent: 'Europe' },
  LT: { code: 'LT', name: 'Lithuania', continent: 'Europe' },
  LV: { code: 'LV', name: 'Latvia', continent: 'Europe' },
  EE: { code: 'EE', name: 'Estonia', continent: 'Europe' },
  IE: { code: 'IE', name: 'Ireland', continent: 'Europe' },
  CY: { code: 'CY', name: 'Cyprus', continent: 'Europe' },
  LU: { code: 'LU', name: 'Luxembourg', continent: 'Europe' },
  MT: { code: 'MT', name: 'Malta', continent: 'Europe' },
  IS: { code: 'IS', name: 'Iceland', continent: 'Europe' },
  AL: { code: 'AL', name: 'Albania', continent: 'Europe' },
  BA: { code: 'BA', name: 'Bosnia and Herzegovina', continent: 'Europe' },
  MK: { code: 'MK', name: 'North Macedonia', continent: 'Europe' },
  ME: { code: 'ME', name: 'Montenegro', continent: 'Europe' },
  XK: { code: 'XK', name: 'Kosovo', continent: 'Europe' },
  MD: { code: 'MD', name: 'Moldova', continent: 'Europe' },
  BY: { code: 'BY', name: 'Belarus', continent: 'Europe' },
  UA: { code: 'UA', name: 'Ukraine', continent: 'Europe' },
  AD: { code: 'AD', name: 'Andorra', continent: 'Europe' },
  MC: { code: 'MC', name: 'Monaco', continent: 'Europe' },
  LI: { code: 'LI', name: 'Liechtenstein', continent: 'Europe' },
  GI: { code: 'GI', name: 'Gibraltar', continent: 'Europe' },
  IM: { code: 'IM', name: 'Isle of Man', continent: 'Europe' },
  JE: { code: 'JE', name: 'Jersey', continent: 'Europe' },
  GG: { code: 'GG', name: 'Guernsey', continent: 'Europe' },
  AX: { code: 'AX', name: 'Aland Islands', continent: 'Europe' },
  FO: { code: 'FO', name: 'Faroe Islands', continent: 'Europe' },
  TR: { code: 'TR', name: 'Turkey', continent: 'Europe' },
  EU: { code: 'EU', name: 'European Union', continent: 'Europe' },

  // Americas
  US: { code: 'US', name: 'United States', continent: 'Americas' },
  CA: { code: 'CA', name: 'Canada', continent: 'Americas' },
  MX: { code: 'MX', name: 'Mexico', continent: 'Americas' },
  BR: { code: 'BR', name: 'Brazil', continent: 'Americas' },
  AR: { code: 'AR', name: 'Argentina', continent: 'Americas' },
  CL: { code: 'CL', name: 'Chile', continent: 'Americas' },
  CO: { code: 'CO', name: 'Colombia', continent: 'Americas' },
  PE: { code: 'PE', name: 'Peru', continent: 'Americas' },
  EC: { code: 'EC', name: 'Ecuador', continent: 'Americas' },
  UY: { code: 'UY', name: 'Uruguay', continent: 'Americas' },
  PY: { code: 'PY', name: 'Paraguay', continent: 'Americas' },
  BO: { code: 'BO', name: 'Bolivia', continent: 'Americas' },
  CR: { code: 'CR', name: 'Costa Rica', continent: 'Americas' },
  PA: { code: 'PA', name: 'Panama', continent: 'Americas' },
  GT: { code: 'GT', name: 'Guatemala', continent: 'Americas' },
  HN: { code: 'HN', name: 'Honduras', continent: 'Americas' },
  NI: { code: 'NI', name: 'Nicaragua', continent: 'Americas' },
  SV: { code: 'SV', name: 'El Salvador', continent: 'Americas' },
  BZ: { code: 'BZ', name: 'Belize', continent: 'Americas' },
  DO: { code: 'DO', name: 'Dominican Republic', continent: 'Americas' },
  JM: { code: 'JM', name: 'Jamaica', continent: 'Americas' },
  TT: { code: 'TT', name: 'Trinidad and Tobago', continent: 'Americas' },
  BS: { code: 'BS', name: 'Bahamas', continent: 'Americas' },
  BB: { code: 'BB', name: 'Barbados', continent: 'Americas' },
  GD: { code: 'GD', name: 'Grenada', continent: 'Americas' },
  LC: { code: 'LC', name: 'Saint Lucia', continent: 'Americas' },
  VC: { code: 'VC', name: 'Saint Vincent and the Grenadines', continent: 'Americas' },
  KN: { code: 'KN', name: 'Saint Kitts and Nevis', continent: 'Americas' },
  AG: { code: 'AG', name: 'Antigua and Barbuda', continent: 'Americas' },
  DM: { code: 'DM', name: 'Dominica', continent: 'Americas' },
  AI: { code: 'AI', name: 'Anguilla', continent: 'Americas' },
  BM: { code: 'BM', name: 'Bermuda', continent: 'Americas' },
  KY: { code: 'KY', name: 'Cayman Islands', continent: 'Americas' },
  TC: { code: 'TC', name: 'Turks and Caicos', continent: 'Americas' },
  VG: { code: 'VG', name: 'British Virgin Islands', continent: 'Americas' },
  PR: { code: 'PR', name: 'Puerto Rico', continent: 'Americas' },
  GP: { code: 'GP', name: 'Guadeloupe', continent: 'Americas' },
  MQ: { code: 'MQ', name: 'Martinique', continent: 'Americas' },
  CW: { code: 'CW', name: 'Curacao', continent: 'Americas' },
  AW: { code: 'AW', name: 'Aruba', continent: 'Americas' },
  SX: { code: 'SX', name: 'Sint Maarten', continent: 'Americas' },
  VI: { code: 'VI', name: 'US Virgin Islands', continent: 'Americas' },
  GF: { code: 'GF', name: 'French Guiana', continent: 'Americas' },
  SR: { code: 'SR', name: 'Suriname', continent: 'Americas' },
  GY: { code: 'GY', name: 'Guyana', continent: 'Americas' },
  VE: { code: 'VE', name: 'Venezuela', continent: 'Americas' },
  HT: { code: 'HT', name: 'Haiti', continent: 'Americas' },
  CU: { code: 'CU', name: 'Cuba', continent: 'Americas' },

  // Oceania
  AU: { code: 'AU', name: 'Australia', continent: 'Oceania' },
  NZ: { code: 'NZ', name: 'New Zealand', continent: 'Oceania' },
  GU: { code: 'GU', name: 'Guam', continent: 'Oceania' },
  FJ: { code: 'FJ', name: 'Fiji', continent: 'Oceania' },
  PG: { code: 'PG', name: 'Papua New Guinea', continent: 'Oceania' },
  WS: { code: 'WS', name: 'Samoa', continent: 'Oceania' },
  TO: { code: 'TO', name: 'Tonga', continent: 'Oceania' },
  VU: { code: 'VU', name: 'Vanuatu', continent: 'Oceania' },

  // Middle East
  AE: { code: 'AE', name: 'United Arab Emirates', continent: 'Middle East' },
  SA: { code: 'SA', name: 'Saudi Arabia', continent: 'Middle East' },
  QA: { code: 'QA', name: 'Qatar', continent: 'Middle East' },
  KW: { code: 'KW', name: 'Kuwait', continent: 'Middle East' },
  BH: { code: 'BH', name: 'Bahrain', continent: 'Middle East' },
  OM: { code: 'OM', name: 'Oman', continent: 'Middle East' },
  IL: { code: 'IL', name: 'Israel', continent: 'Middle East' },
  JO: { code: 'JO', name: 'Jordan', continent: 'Middle East' },
  IQ: { code: 'IQ', name: 'Iraq', continent: 'Middle East' },
  YE: { code: 'YE', name: 'Yemen', continent: 'Middle East' },
  LB: { code: 'LB', name: 'Lebanon', continent: 'Middle East' },
  PS: { code: 'PS', name: 'Palestine', continent: 'Middle East' },
  SY: { code: 'SY', name: 'Syria', continent: 'Middle East' },
  IR: { code: 'IR', name: 'Iran', continent: 'Middle East' },

  // Africa
  ZA: { code: 'ZA', name: 'South Africa', continent: 'Africa' },
  EG: { code: 'EG', name: 'Egypt', continent: 'Africa' },
  MA: { code: 'MA', name: 'Morocco', continent: 'Africa' },
  DZ: { code: 'DZ', name: 'Algeria', continent: 'Africa' },
  TN: { code: 'TN', name: 'Tunisia', continent: 'Africa' },
  KE: { code: 'KE', name: 'Kenya', continent: 'Africa' },
  NG: { code: 'NG', name: 'Nigeria', continent: 'Africa' },
  TZ: { code: 'TZ', name: 'Tanzania', continent: 'Africa' },
  UG: { code: 'UG', name: 'Uganda', continent: 'Africa' },
  RW: { code: 'RW', name: 'Rwanda', continent: 'Africa' },
  MU: { code: 'MU', name: 'Mauritius', continent: 'Africa' },
  SC: { code: 'SC', name: 'Seychelles', continent: 'Africa' },
  ZM: { code: 'ZM', name: 'Zambia', continent: 'Africa' },
  BW: { code: 'BW', name: 'Botswana', continent: 'Africa' },
  MZ: { code: 'MZ', name: 'Mozambique', continent: 'Africa' },
  MW: { code: 'MW', name: 'Malawi', continent: 'Africa' },
  SZ: { code: 'SZ', name: 'Eswatini', continent: 'Africa' },
  SN: { code: 'SN', name: 'Senegal', continent: 'Africa' },
  CM: { code: 'CM', name: 'Cameroon', continent: 'Africa' },
  CI: { code: 'CI', name: "Cote d'Ivoire", continent: 'Africa' },
  GA: { code: 'GA', name: 'Gabon', continent: 'Africa' },
  CG: { code: 'CG', name: 'Republic of the Congo', continent: 'Africa' },
  TD: { code: 'TD', name: 'Chad', continent: 'Africa' },
  CF: { code: 'CF', name: 'Central African Republic', continent: 'Africa' },
  BF: { code: 'BF', name: 'Burkina Faso', continent: 'Africa' },
  ML: { code: 'ML', name: 'Mali', continent: 'Africa' },
  NE: { code: 'NE', name: 'Niger', continent: 'Africa' },
  LR: { code: 'LR', name: 'Liberia', continent: 'Africa' },
  SD: { code: 'SD', name: 'Sudan', continent: 'Africa' },
  MG: { code: 'MG', name: 'Madagascar', continent: 'Africa' },
  RE: { code: 'RE', name: 'Reunion', continent: 'Africa' },
  GH: { code: 'GH', name: 'Ghana', continent: 'Africa' },
  ET: { code: 'ET', name: 'Ethiopia', continent: 'Africa' },
  CD: { code: 'CD', name: 'Democratic Republic of the Congo', continent: 'Africa' },
  AO: { code: 'AO', name: 'Angola', continent: 'Africa' },
  ZW: { code: 'ZW', name: 'Zimbabwe', continent: 'Africa' },
  NA: { code: 'NA', name: 'Namibia', continent: 'Africa' },
};

// Multi-country and regional packages
// Note: Flags are retrieved via getFlag(code) or getRegionalIcon(code)
export const REGIONS: Record<string, RegionInfo> = {
  'NA-3': {
    code: 'NA-3',
    name: 'North America 3',
    description: 'USA, Canada, Mexico',
    countries: ['US', 'CA', 'MX'],
  },
  'EU-30': {
    code: 'EU-30',
    name: 'Europe 30',
    description: '30 European countries',
    countries: ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'AT', 'CH'],
  },
  'EU-42': {
    code: 'EU-42',
    name: 'Europe 42',
    description: '42 European countries',
    countries: ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'AT', 'CH'],
  },
  'USCA-2': {
    code: 'USCA-2',
    name: 'USA & Canada',
    description: 'United States and Canada',
    countries: ['US', 'CA'],
  },
  'AUNZ-2': {
    code: 'AUNZ-2',
    name: 'Australia & New Zealand',
    description: 'Australia and New Zealand',
    countries: ['AU', 'NZ'],
  },
  'CN-3': {
    code: 'CN-3',
    name: 'Greater China',
    description: 'China, Hong Kong, Macau',
    countries: ['CN', 'HK', 'MO'],
  },
  'AS-7': {
    code: 'AS-7',
    name: 'Asia 7',
    description: '7 Asian countries',
    countries: ['JP', 'KR', 'SG', 'TH', 'MY', 'ID', 'PH'],
  },
  'AS-12': {
    code: 'AS-12',
    name: 'Asia 12',
    description: '12 Asian countries',
    countries: ['JP', 'KR', 'SG', 'TH', 'MY', 'ID', 'PH', 'VN', 'HK', 'TW', 'IN', 'CN'],
  },
  'AS-20': {
    code: 'AS-20',
    name: 'Asia 20',
    description: '20 Asian countries',
    countries: ['JP', 'KR', 'SG', 'TH', 'MY', 'ID', 'PH', 'VN', 'HK', 'TW', 'IN', 'CN'],
  },
  'AS-21': {
    code: 'AS-21',
    name: 'Asia 21',
    description: '21 Asian countries',
    countries: ['JP', 'KR', 'SG', 'TH', 'MY', 'ID', 'PH', 'VN', 'HK', 'TW', 'IN', 'CN'],
  },
  'ME-6': {
    code: 'ME-6',
    name: 'Middle East 6',
    description: '6 Middle Eastern countries',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  },
  'ME-12': {
    code: 'ME-12',
    name: 'Middle East 12',
    description: '12 Middle Eastern countries',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'IL', 'JO', 'EG', 'TR'],
  },
  'SA-18': {
    code: 'SA-18',
    name: 'South America 18',
    description: '18 South American countries',
    countries: ['BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'UY', 'PY', 'BO'],
  },
  'CB-25': {
    code: 'CB-25',
    name: 'Caribbean 25',
    description: '25 Caribbean countries',
    countries: ['JM', 'TT', 'BS', 'BB', 'DO'],
  },
  'GL-139': {
    code: 'GL-139',
    name: 'Global 139',
    description: '139 countries worldwide',
    countries: [],
  },
  'GCC': {
    code: 'GCC',
    name: 'Gulf Cooperation Council',
    description: 'GCC countries',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  },
  'ASEAN': {
    code: 'ASEAN',
    name: 'ASEAN',
    description: 'Southeast Asian nations',
    countries: ['SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'MM', 'KH', 'LA', 'BN'],
  },
};

/**
 * Get country info with fallback
 * Use getFlag(code) to render the SVG flag in components
 */
export function getCountryInfo(code: string): CountryInfo {
  const country = COUNTRIES[code.toUpperCase()];
  if (country) return country;

  // Check if it's a region
  const region = REGIONS[code.toUpperCase()];
  if (region) {
    return {
      code: region.code,
      name: region.name,
      continent: 'Multi-Country'
    };
  }

  // Fallback for unknown codes
  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    continent: 'Unknown'
  };
}

/**
 * Get all countries grouped by continent
 */
export function getCountriesByContinent(): Record<string, CountryInfo[]> {
  const grouped: Record<string, CountryInfo[]> = {};

  Object.values(COUNTRIES).forEach(country => {
    if (!grouped[country.continent]) {
      grouped[country.continent] = [];
    }
    grouped[country.continent].push(country);
  });

  // Sort countries within each continent
  Object.keys(grouped).forEach(continent => {
    grouped[continent].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

/**
 * Get continent icon as React node
 * Use this to render continent icons in components
 */
export function getContinentIcon(continent: string, size: number = 24): React.ReactNode {
  switch (continent) {
    case 'Asia':
      return AsiaGlobeIcon({ size });
    case 'Europe':
      return getFlag('EU', size);
    case 'Americas':
      return AmericasGlobeIcon({ size });
    case 'Oceania':
      return getFlag('AU', size);
    case 'Middle East':
      return getFlag('GCC', size);
    case 'Africa':
      return AfricaEuropeGlobeIcon({ size });
    case 'Multi-Country':
    default:
      return GlobeIcon({ size });
  }
}

/**
 * Search countries by name or code
 */
export function searchCountries(query: string): CountryInfo[] {
  const q = query.toLowerCase();
  return Object.values(COUNTRIES).filter(country =>
    country.name.toLowerCase().includes(q) ||
    country.code.toLowerCase().includes(q)
  );
}

/**
 * Get flag for a country or region code
 * This is the primary way to render flags - returns a React node
 *
 * @example
 * // In a component:
 * <View>{getCountryFlag('JP', 32)}</View>
 * <View>{getCountryFlag('EU-30', 32)}</View>
 */
export function getCountryFlag(code: string, size: number = 24): React.ReactNode {
  return getFlag(code, size);
}
