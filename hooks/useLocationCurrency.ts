/**
 * Combined Location and Currency Detection Hook
 *
 * This hook combines location and currency detection into a single API call,
 * eliminating the duplicate /currency/detect requests that were made by
 * useLocation and useCurrency separately.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { convertPrices, formatPrice as formatPriceUtil, type CurrencyInfo, type Currency } from '../lib/currency';

export interface UserLocation {
  country_code: string;
  country_name: string;
  continent_code: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

interface ConvertedPrice {
  usd: number;
  converted: number;
  formatted: string;
}

// In-memory cache for converted prices
const priceCache = new Map<string, ConvertedPrice[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

// Singleton to prevent duplicate API calls across hook instances
let detectionPromise: Promise<{ location: UserLocation; currency: CurrencyInfo }> | null = null;
let cachedResult: { location: UserLocation; currency: CurrencyInfo } | null = null;
let cacheTime: number = 0;
const DETECTION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Continent code mappings
const continentMap: Record<string, string> = {
  US: 'NA', CA: 'NA', MX: 'NA',
  GB: 'EU', FR: 'EU', DE: 'EU', IT: 'EU', ES: 'EU', NL: 'EU', BE: 'EU', AT: 'EU', PT: 'EU', IE: 'EU', FI: 'EU', GR: 'EU',
  JP: 'AS', CN: 'AS', IN: 'AS', SG: 'AS', HK: 'AS', TH: 'AS', MY: 'AS', ID: 'AS', PH: 'AS', KR: 'AS',
  AU: 'OC', NZ: 'OC',
  BR: 'SA', AR: 'SA', CL: 'SA', CO: 'SA',
  ZA: 'AF', EG: 'AF', NG: 'AF',
  AE: 'AS', SA: 'AS', TR: 'EU',
};

// Country name mappings
const countryNames: Record<string, string> = {
  US: 'United States', CA: 'Canada', MX: 'Mexico',
  GB: 'United Kingdom', FR: 'France', DE: 'Germany', IT: 'Italy', ES: 'Spain',
  NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', PT: 'Portugal', IE: 'Ireland',
  FI: 'Finland', GR: 'Greece', CH: 'Switzerland', SE: 'Sweden', NO: 'Norway',
  DK: 'Denmark', PL: 'Poland', TR: 'Turkey',
  JP: 'Japan', CN: 'China', IN: 'India', SG: 'Singapore', HK: 'Hong Kong',
  TH: 'Thailand', MY: 'Malaysia', ID: 'Indonesia', PH: 'Philippines', KR: 'South Korea',
  AU: 'Australia', NZ: 'New Zealand',
  BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia',
  ZA: 'South Africa', EG: 'Egypt', NG: 'Nigeria',
  AE: 'United Arab Emirates', SA: 'Saudi Arabia',
};

function getCountryName(code: string): string {
  return countryNames[code] || code;
}

async function detectLocationAndCurrency(): Promise<{ location: UserLocation; currency: CurrencyInfo }> {
  // Check cache first
  if (cachedResult && cacheTime && (Date.now() - cacheTime < DETECTION_CACHE_DURATION)) {
    return cachedResult;
  }

  // If there's already an in-flight request, return that promise
  if (detectionPromise) {
    return detectionPromise;
  }

  // Create new detection request
  detectionPromise = (async () => {
    try {
      logger.log('📍💱 Detecting location and currency...');

      const response = await fetch(`${config.apiUrl}/currency/detect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to detect location/currency');
      }

      const data = await response.json();
      logger.log('📍💱 Detection successful:', data);

      const countryCode = data.country || 'US';

      const result = {
        location: {
          country_code: countryCode,
          country_name: getCountryName(countryCode),
          continent_code: continentMap[countryCode] || 'NA',
          region: '',
          city: '',
        },
        currency: {
          country: data.country || 'US',
          currency: data.currency || 'USD',
          symbol: data.symbol || '$',
          name: data.name || 'US Dollar',
        } as CurrencyInfo,
      };

      // Cache the result
      cachedResult = result;
      cacheTime = Date.now();

      return result;
    } catch (error) {
      logger.log('📍💱 Using defaults (detection unavailable)');

      // Fallback to US/USD
      const fallback = {
        location: {
          country_code: 'US',
          country_name: 'United States',
          continent_code: 'NA',
          region: '',
          city: '',
        },
        currency: {
          country: 'US',
          currency: 'USD' as Currency,
          symbol: '$',
          name: 'US Dollar',
        },
      };

      cachedResult = fallback;
      cacheTime = Date.now();

      return fallback;
    } finally {
      detectionPromise = null;
    }
  })();

  return detectionPromise;
}

// Helper to check if cache is valid
function getCachedData(): { location: UserLocation; currency: CurrencyInfo } | null {
  if (cachedResult && cacheTime && (Date.now() - cacheTime < DETECTION_CACHE_DURATION)) {
    return cachedResult;
  }
  return null;
}

/**
 * Combined hook for location and currency detection
 * Makes a single API call instead of two separate calls
 * Uses cached data immediately if available (no loading state)
 */
export function useLocationCurrency() {
  // Check cache synchronously on init - if cached, no loading needed
  const initialCache = getCachedData();

  const [location, setLocation] = useState<UserLocation | null>(initialCache?.location ?? null);
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(initialCache?.currency ?? null);
  const [loading, setLoading] = useState(!initialCache); // Only loading if no cache
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have cached data, no need to fetch
    if (initialCache) {
      return;
    }

    let mounted = true;

    async function detect() {
      try {
        const result = await detectLocationAndCurrency();

        if (mounted) {
          setLocation(result.location);
          setCurrencyInfo(result.currency);
        }
      } catch (err) {
        if (mounted) {
          logger.error('Location/Currency detection error:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    detect();

    return () => {
      mounted = false;
    };
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
    const cachedTime = cacheTimestamps.get(cacheKey);

    if (cached && cachedTime && (Date.now() - cachedTime < CACHE_DURATION)) {
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
  const formatPrice = useCallback((amount: number): string => {
    // Handle undefined/null/NaN amounts
    if (amount == null || isNaN(amount)) {
      return `${currencyInfo?.symbol || '$'}0.00`;
    }
    if (!currencyInfo) return `$${amount.toFixed(2)}`;
    return formatPriceUtil(amount, currencyInfo.currency);
  }, [currencyInfo]);

  /**
   * Refetch location and currency data
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    // Clear cache to force fresh fetch
    cachedResult = null;
    cacheTime = 0;

    try {
      const result = await detectLocationAndCurrency();
      setLocation(result.location);
      setCurrencyInfo(result.currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Location data
    location,
    locationLoading: loading,

    // Currency data
    currency: currencyInfo?.currency || 'USD',
    symbol: currencyInfo?.symbol || '$',
    country: currencyInfo?.country || 'US',
    name: currencyInfo?.name || 'US Dollar',
    currencyInfo,
    currencyLoading: loading,

    // Combined
    loading,
    error,

    // Functions
    convertMultiplePrices,
    formatPrice,
    refetch,
  };
}

// Re-export types for convenience
export type { CurrencyInfo, Currency };

/**
 * Pre-convert prices and cache them
 * Call this during splash screen to ensure prices are ready before navigation
 */
export async function preConvertPrices(usdPrices: number[]): Promise<void> {
  // First ensure currency is detected
  const result = await detectLocationAndCurrency();

  if (!result.currency || result.currency.currency === 'USD') {
    // No conversion needed for USD
    return;
  }

  // Create cache key
  const cacheKey = `${result.currency.currency}_${usdPrices.join('_')}`;

  // Check if already cached
  if (priceCache.has(cacheKey)) {
    return;
  }

  // Convert and cache
  const converted = await convertPrices(usdPrices, result.currency);
  priceCache.set(cacheKey, converted);
  cacheTimestamps.set(cacheKey, Date.now());
}
