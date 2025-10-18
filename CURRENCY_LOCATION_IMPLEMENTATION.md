# Currency & Location-Based Features Implementation

## Overview

Implement currency conversion and location-based plan sorting for better user experience.

---

## Backend Endpoints Needed

### 1. GET `/api/currency/detect`

Detect user's currency based on their IP address/location.

**Implementation:**

```typescript
// app/api/currency/detect/route.ts
import { NextRequest, NextResponse } from 'next/server';

// IP to country mapping (use a service like ipapi.co or ipinfo.io)
async function getCountryFromIP(ip: string): Promise<string> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return data.country_code || 'US';
  } catch (error) {
    console.error('IP detection error:', error);
    return 'US'; // Default to US
  }
}

// Country to currency mapping
const COUNTRY_TO_CURRENCY: Record<string, {
  currency: string;
  symbol: string;
  name: string;
}> = {
  US: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  GB: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { currency: 'EUR', symbol: '€', name: 'Euro' },
  CA: { currency: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  AU: { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  JP: { currency: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  SG: { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HK: { currency: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  NZ: { currency: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  CH: { currency: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  SE: { currency: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  NO: { currency: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  DK: { currency: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  MX: { currency: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  BR: { currency: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  IN: { currency: 'INR', symbol: '₹', name: 'Indian Rupee' },
  AE: { currency: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  SA: { currency: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  ZA: { currency: 'ZAR', symbol: 'R', name: 'South African Rand' },
  TR: { currency: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  PL: { currency: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  TH: { currency: 'THB', symbol: '฿', name: 'Thai Baht' },
  MY: { currency: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  ID: { currency: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  PH: { currency: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  KR: { currency: 'KRW', symbol: '₩', name: 'South Korean Won' },
  CN: { currency: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
};

// Euro zone countries
const EURO_ZONE = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'EE', 'LV', 'LT', 'SK', 'SI', 'CY', 'MT', 'LU'];

export async function GET(request: NextRequest) {
  try {
    // Get user's IP from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Detect country from IP
    const country = await getCountryFromIP(ip);

    // Map country to currency
    let currencyInfo = COUNTRY_TO_CURRENCY[country];

    // Handle Euro zone countries
    if (!currencyInfo && EURO_ZONE.includes(country)) {
      currencyInfo = COUNTRY_TO_CURRENCY.EU;
    }

    // Default to USD if country not found
    if (!currencyInfo) {
      currencyInfo = COUNTRY_TO_CURRENCY.US;
    }

    return NextResponse.json({
      country,
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      name: currencyInfo.name,
    });
  } catch (error) {
    console.error('Currency detection error:', error);

    // Return USD as fallback
    return NextResponse.json({
      country: 'US',
      currency: 'USD',
      symbol: '$',
      name: 'US Dollar',
    });
  }
}
```

---

### 2. POST `/api/currency/convert`

Convert USD prices to user's currency using exchange rates.

**Implementation:**

```typescript
// app/api/currency/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Exchange rates API (use exchangerate-api.com or similar)
async function getExchangeRate(toCurrency: string): Promise<number> {
  try {
    // Option 1: Free API (limited requests)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    const data = await response.json();
    return data.rates[toCurrency] || 1;

    // Option 2: Use a paid service for production
    // const response = await fetch(
    //   `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    // );
    // const data = await response.json();
    // return data.conversion_rates[toCurrency] || 1;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return 1; // Fallback to 1:1
  }
}

const ConvertSchema = z.object({
  prices: z.array(z.number()),
  currency: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices, currency } = ConvertSchema.parse(body);

    // If already USD, no conversion needed
    if (currency === 'USD') {
      return NextResponse.json({
        prices: prices.map((usd) => ({
          usd,
          converted: usd,
          formatted: `$${(usd / 100).toFixed(2)}`,
        })),
      });
    }

    // Get exchange rate
    const rate = await getExchangeRate(currency);

    // Get currency symbol
    const currencySymbols: Record<string, string> = {
      USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$',
      JPY: '¥', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$', CHF: 'CHF',
      SEK: 'kr', NOK: 'kr', DKK: 'kr', MXN: 'MX$', BRL: 'R$',
      INR: '₹', AED: 'AED', SAR: 'SAR', ZAR: 'R', TRY: '₺',
      PLN: 'zł', THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱',
      KRW: '₩', CNY: '¥',
    };

    const symbol = currencySymbols[currency] || currency;

    // Zero decimal currencies (no cents)
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'IDR'];
    const isZeroDecimal = zeroDecimalCurrencies.includes(currency);

    // Convert prices
    const convertedPrices = prices.map((usdCents) => {
      const usdDollars = usdCents / 100;
      const converted = usdDollars * rate;

      let formatted: string;
      if (isZeroDecimal) {
        formatted = `${symbol}${Math.round(converted).toLocaleString()}`;
      } else {
        formatted = `${symbol}${converted.toFixed(2)}`;
      }

      return {
        usd: usdCents,
        converted: Math.round(converted * 100), // Convert back to cents
        formatted,
      };
    });

    return NextResponse.json({
      prices: convertedPrices,
      rate,
    });
  } catch (error) {
    console.error('Price conversion error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to convert prices' },
      { status: 500 }
    );
  }
}
```

---

### 3. GET `/api/location/detect`

Detect user's location for plan sorting (can be same as currency detection).

**Implementation:**

```typescript
// app/api/location/detect/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    return {
      country_code: data.country_code || 'US',
      country_name: data.country_name || 'United States',
      continent_code: data.continent_code || 'NA',
      region: data.region || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
  } catch (error) {
    console.error('Location detection error:', error);
    return {
      country_code: 'US',
      country_name: 'United States',
      continent_code: 'NA',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
      || request.headers.get('x-real-ip')
      || 'unknown';

    const location = await getLocationFromIP(ip);

    return NextResponse.json(location);
  } catch (error) {
    console.error('Location detection error:', error);

    return NextResponse.json({
      country_code: 'US',
      country_name: 'United States',
      continent_code: 'NA',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0,
    });
  }
}
```

---

## Mobile App Updates

Now let's update the mobile app to use these features.

### 1. Create Location Detection Hook

```typescript
// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import { config } from '../lib/config';

export interface UserLocation {
  country_code: string;
  country_name: string;
  continent_code: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  async function detectLocation() {
    try {
      const response = await fetch(`${config.apiUrl}/location/detect`);

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();
      setLocation(data);
    } catch (error) {
      console.log('📍 Using default location (US)');
      setLocation({
        country_code: 'US',
        country_name: 'United States',
        continent_code: 'NA',
        region: '',
        city: '',
        latitude: 0,
        longitude: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  return { location, loading };
}
```

### 2. Update Browse Screen to Sort by Location

The Browse screen will:
1. Detect user's location
2. Show plans for user's country/region first
3. Then show other plans

### 3. Plan Sorting Logic

Plans will be sorted by relevance:
1. **Exact country match** (e.g., US user sees US plans first)
2. **Continental plans** (e.g., European plans for EU users)
3. **Global plans**
4. **Other regions**

---

## Installation Steps

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install zod
   ```

2. **Create the three endpoint files:**
   - `app/api/currency/detect/route.ts`
   - `app/api/currency/convert/route.ts`
   - `app/api/location/detect/route.ts`

3. **Optional: Add exchange rate API key** (for production)
   ```env
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

### Mobile App Setup

I'll update the mobile app code now to:
1. Create the location hook
2. Update Browse screen to sort by location
3. Improve currency conversion handling

---

## Testing

### Test Currency Detection

```bash
curl https://getlumbus.com/api/currency/detect
```

Expected response:
```json
{
  "country": "US",
  "currency": "USD",
  "symbol": "$",
  "name": "US Dollar"
}
```

### Test Currency Conversion

```bash
curl -X POST https://getlumbus.com/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "prices": [1500, 2500, 3500],
    "currency": "GBP"
  }'
```

Expected response:
```json
{
  "prices": [
    {
      "usd": 1500,
      "converted": 1200,
      "formatted": "£12.00"
    }
  ],
  "rate": 0.79
}
```

### Test Location Detection

```bash
curl https://getlumbus.com/api/location/detect
```

Expected response:
```json
{
  "country_code": "US",
  "country_name": "United States",
  "continent_code": "NA",
  "region": "California",
  "city": "San Francisco"
}
```

---

## Benefits

Once implemented, users will:

✅ **See prices in their local currency automatically**
✅ **See relevant plans first** (based on their location)
✅ **Better user experience** (no manual currency selection needed)
✅ **Accurate exchange rates** (updated daily)

---

## Free vs Paid APIs

### Free Options (Good for Development/Small Scale)

- **ipapi.co** - 1,000 requests/day free
- **exchangerate-api.com** - 1,500 requests/month free

### Paid Options (Production)

- **ipinfo.io** - $99/month for 50k requests
- **exchangerate-api.com Pro** - $9/month for 100k requests
- **MaxMind GeoIP2** - One-time purchase, self-hosted

---

## Next Steps

1. Create the three backend endpoints
2. Test with cURL
3. I'll update the mobile app to use them
4. Test end-to-end with the mobile app

Ready for me to update the mobile app code now?
