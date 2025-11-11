/**
 * Currency utilities for mobile app
 * Matches web app implementation
 */

import { config } from './config';
import { logger } from './logger';

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
      logger.log('⚠️ Currency detection not available, defaulting to USD');
      throw new Error('Failed to detect currency');
    }

    const data = await response.json();

    // Handle wrapped response
    if (data.currency) {
      return data;
    } else if (data.data && data.data.currency) {
      return data.data;
    }

    return data;
  } catch (error) {
    logger.log('💵 Using USD (currency detection unavailable)');

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
 * Uses POST /api/currency/detect with prices array
 */
export async function convertPrices(
  usdPrices: number[],
  currencyInfo: CurrencyInfo
): Promise<Array<{ usd: number; converted: number; formatted: string }>> {
  // If already USD, no conversion needed
  if (currencyInfo.currency === 'USD') {
    return usdPrices.map((usd) => ({
      usd,
      converted: usd,
      formatted: `$${usd.toFixed(2)}`,
    }));
  }

  try {
    // Backend endpoint: POST /api/currency/detect with prices array
    const response = await fetch(`${config.apiUrl}/currency/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prices: usdPrices, // Already in correct format (retail_price is in dollars)
      }),
    });

    if (!response.ok) {
      logger.log('⚠️ Currency conversion failed, using USD fallback');
      throw new Error(`Failed to convert prices: ${response.status}`);
    }

    const data = await response.json();
    logger.log('💱 Currency conversion successful:', data.currency);

    // Backend returns: { currency, symbol, name, prices: [...] }
    if (data.prices && Array.isArray(data.prices)) {
      return data.prices;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    logger.log('💵 Using USD prices (currency conversion unavailable)');

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
 * Uses consistent formatting across iOS and Android
 */
export function formatPrice(amount: number, currency: Currency): string {
  // Handle undefined/null/NaN amounts
  if (amount == null || isNaN(amount)) {
    return `${SUPPORTED_CURRENCIES[currency].symbol}0.00`;
  }

  const currencyInfo = SUPPORTED_CURRENCIES[currency];

  if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
    // Zero decimal currencies - format with thousands separator
    // Use en-US locale for consistent comma separators across platforms
    const rounded = Math.round(amount);
    const formatted = rounded.toLocaleString('en-US');
    return `${currencyInfo.symbol}${formatted}`;
  }

  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}
