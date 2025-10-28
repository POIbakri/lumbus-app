import { supabase } from './supabase';
import { Plan, Order, CheckoutParams, PaymentIntentResponse, TopUpCheckoutParams, TopUpCheckoutResponse } from '../types';
import { config } from './config';
import { logger } from './logger';

const API_URL = config.apiUrl;

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

// Helper function to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
}

// Plans API
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetchWithTimeout(`${API_URL}/plans`, {
      method: 'GET',
      headers,
    }, 15000);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('API error:', response.status, errorText);
      throw new Error(`Failed to fetch plans: ${response.status}`);
    }

    const data = await response.json();

    // Handle both formats: array or object with plans property
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.plans)) {
      return data.plans;
    } else {
      logger.error('Unexpected response format:', data);
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    logger.error('Error fetching plans from API:', error);

    // Fallback to direct Supabase query if API fails
    const { data, error: supabaseError } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (supabaseError) {
      logger.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    return data || [];
  }
}

export async function fetchPlanById(id: string): Promise<Plan | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}/plans/${id}`, {
      method: 'GET',
      headers,
    }, 15000);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch plan');
    }

    const data = await response.json();

    // Handle both formats: plan object or object with plan property
    if (data && data.plan) {
      return data.plan;
    }
    return data;
  } catch (error) {
    logger.error('Error fetching plan:', error);
    // Fallback to direct Supabase query if API fails
    const { data, error: supabaseError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (supabaseError) throw supabaseError;
    return data;
  }
}

// Orders API
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}/user/orders`, {
      method: 'GET',
      headers,
    }, 15000);

    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }

    const data = await response.json();

    // Handle both formats: array or object with orders property
    let orders: Order[] = [];
    if (Array.isArray(data)) {
      orders = data;
    } else if (data && Array.isArray(data.orders)) {
      orders = data.orders;
    }

    return orders;
  } catch (error) {
    logger.error('Error fetching user orders:', error);
    // Fallback to direct Supabase query if API fails
    const { data, error: supabaseError } = await supabase
      .from('orders')
      .select(`
        *,
        plans (
          id,
          name,
          region_code,
          data_gb,
          validity_days,
          retail_price,
          currency
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (supabaseError) throw supabaseError;

    // Transform the data to handle array/object plan format
    const orders = data?.map((order: any) => ({
      ...order,
      plan: Array.isArray(order.plans) ? order.plans[0] : order.plans,
    }));

    return orders || [];
  }
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  // The API endpoint for individual orders returns incomplete data
  // (missing data_usage_bytes, data_remaining_bytes, activate_before, iccid, apn)
  // So we use Supabase directly to get the full order data

  const { data, error: supabaseError } = await supabase
    .from('orders')
    .select(`
      *,
      plans (
        id,
        name,
        region_code,
        data_gb,
        validity_days,
        retail_price,
        currency
      )
    `)
    .eq('id', orderId)
    .single();

  if (supabaseError) {
    logger.error('Supabase error fetching order:', supabaseError);
    throw supabaseError;
  }

  if (!data) {
    return null;
  }

  // Transform the data to handle array/object plan format
  const order = {
    ...(data as any),
    plan: Array.isArray((data as any).plans) ? (data as any).plans[0] : (data as any).plans,
  } as Order;

  return order;
}

// Checkout API
export async function createCheckout(params: CheckoutParams): Promise<PaymentIntentResponse> {
  try {
    const headers = await getAuthHeaders();

    // Add timeout for checkout request (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || errorData?.error || `Checkout failed with status ${response.status}`;
      logger.error('Checkout error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Checkout request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to create checkout');
  }
}

// Usage Tracking API
export interface UsageData {
  orderId: string;
  dataUsed: number; // in MB
  dataTotal: number; // in MB
  dataRemaining: number; // in MB
  percentageUsed: number;
  lastUpdated: string;
}

export async function fetchUsageData(orderId: string): Promise<UsageData | null> {
  try {
    // Fetch usage data from backend API (corrected endpoint to match API docs)
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}/orders/${orderId}/usage`, {
      method: 'GET',
      headers,
    }, 15000);

    if (!response.ok) {
      // If usage endpoint doesn't exist yet, return null
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch usage data');
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching usage data:', error);
    return null;
  }
}

// Subscribe to usage updates for real-time data tracking
export function subscribeToUsageUpdates(
  orderId: string,
  callback: (usage: UsageData) => void
) {
  return supabase
    .channel(`usage:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'esim_usage',
        filter: `order_id=eq.${orderId}`,
      },
      async (payload) => {
        const usage = await fetchUsageData(orderId);
        if (usage) {
          callback(usage);
        }
      }
    )
    .subscribe();
}

// Real-time subscriptions
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: Order) => void
) {
  return supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      async (payload) => {
        // Fetch full order with plan details
        const order = await fetchOrderById(orderId);
        if (order) {
          callback(order);
        }
      }
    )
    .subscribe();
}

// Referral API
export interface ReferralData {
  user_id: string;
  ref_code: string;
  referred_by_code: string | null;
  referral_link: string;
  stats: {
    total_clicks: number;
    total_signups: number;
    pending_rewards: number;
    earned_rewards: number;
  };
}

export async function fetchReferralInfo(): Promise<ReferralData> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_URL}/referrals/me`, {
    method: 'GET',
    headers,
  }, 15000);

  if (!response.ok) {
    throw new Error('Failed to fetch referral info');
  }

  return response.json();
}

// Region API
export interface RegionCountry {
  code: string;
  name: string;
}

export interface RegionInfo {
  code: string;
  name: string;
  type: number;
  isMultiCountry: boolean;
  subLocationList: RegionCountry[];
}

// In-memory cache for region data with TTL
const regionCache = new Map<string, { data: RegionInfo; timestamp: number }>();
const REGION_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Track in-flight requests to prevent duplicate calls
const regionRequestMap = new Map<string, Promise<RegionInfo | null>>();

export async function fetchRegionInfo(regionCode: string): Promise<RegionInfo | null> {
  try {
    // Check cache first
    const cached = regionCache.get(regionCode);
    if (cached && (Date.now() - cached.timestamp < REGION_CACHE_TTL)) {
      return cached.data;
    }

    // Check if there's already an in-flight request for this region
    if (regionRequestMap.has(regionCode)) {
      return regionRequestMap.get(regionCode)!;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`https://getlumbus.com/api/regions/${regionCode}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch region info: ${response.status}`);
        }

        const data: RegionInfo = await response.json();

        // Cache the result with timestamp
        regionCache.set(regionCode, {
          data,
          timestamp: Date.now(),
        });

        return data;
      } finally {
        // Remove from in-flight requests
        regionRequestMap.delete(regionCode);
      }
    })();

    // Store in-flight request
    regionRequestMap.set(regionCode, requestPromise);

    return await requestPromise;
  } catch (error) {
    logger.error('Error fetching region info:', error);
    // Remove from in-flight requests on error
    regionRequestMap.delete(regionCode);
    return null;
  }
}

// IAP Checkout API (for iOS In-App Purchases)
export interface IAPCheckoutParams {
  planId: string;
  email: string;
  currency: string;
  amount?: number; // Amount in the specified currency (for record keeping)
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
}

export interface IAPCheckoutResponse {
  orderId: string;
  productId: string; // Apple IAP product ID
}

export async function createIAPCheckout(params: IAPCheckoutParams): Promise<IAPCheckoutResponse> {
  try {
    const headers = await getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Call dedicated IAP checkout endpoint
    const response = await fetch(`${API_URL}/checkout/iap`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || errorData?.error || `Failed with status ${response.status}`;
      logger.error('IAP checkout error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.orderId || !data.productId) {
      throw new Error('Invalid IAP checkout response - missing orderId or productId');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to create IAP checkout');
  }
}

// Apple IAP Receipt Validation
export interface ValidateReceiptParams {
  receipt: string; // base64 encoded receipt
  orderId: string;
}

export interface ValidateReceiptResponse {
  valid: boolean;
  orderId: string;
  transactionId?: string;
  status?: string;
  error?: string;
}

export async function validateAppleReceipt(params: ValidateReceiptParams): Promise<ValidateReceiptResponse> {
  try {
    const headers = await getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/iap/validate-receipt`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || errorData?.error || `Failed with status ${response.status}`;
      logger.error('Receipt validation error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.valid) {
      throw new Error(data.error || 'Receipt validation failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Receipt validation timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to validate receipt');
  }
}

// Top-Up API
export async function createTopUpCheckout(params: TopUpCheckoutParams): Promise<TopUpCheckoutResponse> {
  try {
    const headers = await getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Use the same /checkout endpoint as plan purchases for Payment Sheet
    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || errorData?.error || `Failed with status ${response.status}`;
      logger.error('Top-up checkout error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.clientSecret || !data.orderId) {
      throw new Error('Invalid checkout response - missing clientSecret or orderId');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to create top-up checkout');
  }
}
