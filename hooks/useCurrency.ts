import { useState, useEffect, useMemo, useCallback } from 'react';
import { detectCurrency, convertPrices, formatPrice as formatPriceUtil, type CurrencyInfo, type Currency } from '../lib/currency';
import { logger } from '../lib/logger';

interface ConvertedPrice {
  usd: number;
  converted: number;
  formatted: string;
}

// In-memory cache for converted prices
const priceCache = new Map<string, ConvertedPrice[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Hook to detect user's currency and convert prices
 * Automatically detects on mount based on user's location (via backend API)
 * Uses caching to minimize API calls
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
        logger.error('Currency detection error:', err);
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
   * Convert multiple USD prices to user's currency with caching
   */
  const convertMultiplePrices = useCallback(async (
    usdPrices: number[]
  ): Promise<ConvertedPrice[]> => {
    if (!currencyInfo) {
      return usdPrices.map((usd) => ({
        usd,
        converted: usd,
        formatted: `$${usd.toFixed(2)}`,
      }));
    }

    // Create cache key from prices and currency
    const cacheKey = `${currencyInfo.currency}_${usdPrices.join('_')}`;

    // Check cache
    const cached = priceCache.get(cacheKey);
    const cacheTime = cacheTimestamps.get(cacheKey);

    if (cached && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      logger.log('💰 Using cached price conversion');
      return cached;
    }

    // Convert and cache
    const converted = await convertPrices(usdPrices, currencyInfo);
    priceCache.set(cacheKey, converted);
    cacheTimestamps.set(cacheKey, Date.now());

    return converted;
  }, [currencyInfo]);

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
