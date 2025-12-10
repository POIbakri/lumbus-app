/**
 * Currency detection and conversion hook
 * @deprecated Use useLocationCurrency instead for better performance (single API call)
 *
 * This hook is kept for backwards compatibility but now delegates to the combined hook.
 */

import { useLocationCurrency } from './useLocationCurrency';

/**
 * @deprecated Use useLocationCurrency instead - it combines location and currency
 * detection into a single API call for better performance.
 */
export function useCurrency() {
  const {
    currency,
    symbol,
    country,
    name,
    loading,
    error,
    convertMultiplePrices,
    formatPrice,
    currencyInfo,
  } = useLocationCurrency();

  return {
    currency,
    symbol,
    country,
    name,
    loading,
    error,
    convertMultiplePrices,
    formatPrice,
    currencyInfo,
  };
}
