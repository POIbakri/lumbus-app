/**
 * Location detection hook
 * @deprecated Use useLocationCurrency instead for better performance (single API call)
 *
 * This hook is kept for backwards compatibility but now delegates to the combined hook.
 */

import { useLocationCurrency, UserLocation } from './useLocationCurrency';

// Re-export UserLocation type for backwards compatibility
export type { UserLocation };

/**
 * @deprecated Use useLocationCurrency instead - it combines location and currency
 * detection into a single API call for better performance.
 */
export function useLocation() {
  const { location, locationLoading: loading, refetch } = useLocationCurrency();

  return { location, loading, refetch };
}
