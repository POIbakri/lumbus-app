/**
 * Currency utilities for mobile app
 * Matches web app implementation
 */

import { config } from './config';

// Stripe-supported currencies and their symbols
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  TRY: { symbol: '₺', name: 'Turkish Lira' },
  PLN: { symbol: 'zł', name: 'Polish Zloty' },
  THB: { symbol: '฿', name: 'Thai Baht' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
} as const;

export type Currency = keyof typeof SUPPORTED_CURRENCIES;

export interface CurrencyInfo {
  country: string;
  currency: Currency;
  symbol: string;
  name: string;
}

/**
 * Detect user's currency from backend API
 * Backend uses request headers to determine location
 */
export async function detectCurrency(): Promise<CurrencyInfo> {
  try {
    const response = await fetch(`${config.apiUrl}/currency/detect`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to detect currency');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Currency detection error:', error);

    // Fallback to USD
    return {
      country: 'US',
      currency: 'USD',
      symbol: '$',
      name: 'US Dollar',
    };
  }
}

/**
 * Convert USD prices to user's currency
 */
export async function convertPrices(
  usdPrices: number[],
  currencyInfo: CurrencyInfo
): Promise<Array<{ usd: number; converted: number; formatted: string }>> {
  try {
    const response = await fetch(`${config.apiUrl}/currency/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prices: usdPrices }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert prices');
    }

    const data = await response.json();
    return data.prices;
  } catch (error) {
    console.error('Price conversion error:', error);

    // Fallback to USD
    return usdPrices.map((usd) => ({
      usd,
      converted: usd,
      formatted: `$${usd.toFixed(2)}`,
    }));
  }
}

/**
 * Format a price with currency symbol
 */
export function formatPrice(amount: number, currency: Currency): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];

  if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
    // Zero decimal currencies
    return `${currencyInfo.symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}
