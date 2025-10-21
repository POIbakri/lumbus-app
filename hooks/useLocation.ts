/**
 * Location detection hook
 * Detects user's location for showing relevant plans first
 */

import { useState, useEffect } from 'react';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

export interface UserLocation {
  country_code: string;
  country_name: string;
  continent_code: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  async function detectLocation() {
    try {
      logger.log('📍 Detecting location...');
      // Use currency/detect endpoint which also returns country info
      const response = await fetch(`${config.apiUrl}/currency/detect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();
      logger.log('📍 Location detected:', data);

      // Map country code to continent (basic mapping)
      const continentMap: Record<string, string> = {
        US: 'NA', CA: 'NA', MX: 'NA',
        GB: 'EU', FR: 'EU', DE: 'EU', IT: 'EU', ES: 'EU', NL: 'EU', BE: 'EU', AT: 'EU', PT: 'EU', IE: 'EU', FI: 'EU', GR: 'EU',
        JP: 'AS', CN: 'AS', IN: 'AS', SG: 'AS', HK: 'AS', TH: 'AS', MY: 'AS', ID: 'AS', PH: 'AS', KR: 'AS',
        AU: 'OC', NZ: 'OC',
        BR: 'SA', AR: 'SA', CL: 'SA', CO: 'SA',
        ZA: 'AF', EG: 'AF', NG: 'AF',
        AE: 'AS', SA: 'AS', TR: 'EU',
      };

      // Convert currency API response to location format
      setLocation({
        country_code: data.country || 'US',
        country_name: getCountryName(data.country || 'US'),
        continent_code: continentMap[data.country] || 'NA',
        region: '',
        city: '',
      });
    } catch (error) {
      logger.log('📍 Using default location (US)');
      // Fallback to US
      setLocation({
        country_code: 'US',
        country_name: 'United States',
        continent_code: 'NA',
        region: '',
        city: '',
      });
    } finally {
      setLoading(false);
    }
  }

  function getCountryName(code: string): string {
    const names: Record<string, string> = {
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
    return names[code] || code;
  }

  return { location, loading, refetch: detectLocation };
}
