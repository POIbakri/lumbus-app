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
    const response = await fetch(`${API_URL}/plans`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    // Fallback to direct Supabase query if API fails
    const { data, error: supabaseError } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (supabaseError) throw supabaseError;
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

    return response.json();
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

    return response.json();
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

    return response.json();
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
