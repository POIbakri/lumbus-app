import { supabase } from './supabase';
import { Plan, Order, CheckoutParams, PaymentIntentResponse } from '../types';
import { config } from './config';

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

// Plans API
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const headers = await getAuthHeaders();
    console.log('🌐 Fetching plans from:', `${API_URL}/plans`);

    const response = await fetch(`${API_URL}/plans`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', response.status, errorText);
      throw new Error(`Failed to fetch plans: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Plans from API:', data);
    console.log('✅ Is array?', Array.isArray(data));

    // Handle both formats: array or object with plans property
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.plans)) {
      console.log('📦 Extracting plans from response.plans');
      return data.plans;
    } else {
      console.error('❌ Unexpected response format:', data);
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('❌ Error fetching plans from API:', error);
    console.log('🔄 Falling back to Supabase...');

    // Fallback to direct Supabase query if API fails
    const { data, error: supabaseError } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError);
      throw supabaseError;
    }

    console.log('✅ Plans from Supabase fallback:', data);
    return data || [];
  }
}

export async function fetchPlanById(id: string): Promise<Plan | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/plans/${id}`, {
      method: 'GET',
      headers,
    });

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
    console.error('Error fetching plan:', error);
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
    const response = await fetch(`${API_URL}/user/orders`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }

    const data = await response.json();

    // Handle both formats: array or object with orders property
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.orders)) {
      return data.orders;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
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
          price
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
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch order');
    }

    const data = await response.json();

    // Handle both formats: order object or object with order property
    if (data && data.order) {
      return data.order;
    }
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
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
          price
        )
      `)
      .eq('id', orderId)
      .single();

    if (supabaseError) throw supabaseError;

    if (!data) return null;

    // Transform the data to handle array/object plan format
    return {
      ...data,
      plan: Array.isArray(data.plans) ? data.plans[0] : data.plans,
    };
  }
}

// Checkout API
export async function createCheckout(params: CheckoutParams): Promise<PaymentIntentResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  return response.json();
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
    const response = await fetch(`${API_URL}/orders/${orderId}/usage`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If usage endpoint doesn't exist yet, return null
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch usage data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching usage data:', error);
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
      console.log('💾 Using cached region info for:', regionCode);
      return cached.data;
    }

    // Check if there's already an in-flight request for this region
    if (regionRequestMap.has(regionCode)) {
      console.log('🔄 Reusing in-flight request for:', regionCode);
      return regionRequestMap.get(regionCode)!;
    }

    // Create new request
    console.log('🌍 Fetching region info for:', regionCode);
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
            console.log('⚠️ Region not found:', regionCode);
            return null;
          }
          throw new Error(`Failed to fetch region info: ${response.status}`);
        }

        const data: RegionInfo = await response.json();
        console.log('✅ Region info:', data);

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
    console.error('❌ Error fetching region info:', error);
    // Remove from in-flight requests on error
    regionRequestMap.delete(regionCode);
    return null;
  }
}
