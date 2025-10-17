import { useState, useEffect } from 'react';
import { detectCurrency, convertPrices, formatPrice as formatPriceUtil, type CurrencyInfo, type Currency } from '../lib/currency';

interface ConvertedPrice {
  usd: number;
  converted: number;
  formatted: string;
}

/**
 * Hook to detect user's currency and convert prices
 * Automatically detects on mount based on user's location (via backend API)
 */
export function useCurrency() {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrency() {
      try {
        const data = await detectCurrency();
        setCurrencyInfo(data);
      } catch (err) {
        console.error('Currency detection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to USD
        setCurrencyInfo({
          country: 'US',
          currency: 'USD',
          symbol: '$',
          name: 'US Dollar',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCurrency();
  }, []);

  /**
   * Convert multiple USD prices to user's currency
   */
  const convertMultiplePrices = async (
    usdPrices: number[]
  ): Promise<ConvertedPrice[]> => {
    if (!currencyInfo) {
      return usdPrices.map((usd) => ({
        usd,
        converted: usd,
        formatted: `$${usd.toFixed(2)}`,
      }));
    }

    return await convertPrices(usdPrices, currencyInfo);
  };

  /**
   * Format a price in user's currency
   */
  const formatPrice = (amount: number): string => {
    if (!currencyInfo) return `$${amount.toFixed(2)}`;
    return formatPriceUtil(amount, currencyInfo.currency);
  };

  return {
    currency: currencyInfo?.currency || 'USD',
    symbol: currencyInfo?.symbol || '$',
    country: currencyInfo?.country || 'US',
    name: currencyInfo?.name || 'US Dollar',
    loading,
    error,
    convertMultiplePrices,
    formatPrice,
    currencyInfo,
  };
}
