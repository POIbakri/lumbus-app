import { supabase } from './supabase';
import { Plan, Order, CheckoutParams, PaymentIntentResponse } from '../types';
import { config } from './config';

const API_URL = config.apiUrl;

// Plans API
export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchPlanById(id: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Orders API
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
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

  if (error) throw error;

  // Transform the data to handle array/object plan format
  const orders = data?.map((order: any) => ({
    ...order,
    plan: Array.isArray(order.plans) ? order.plans[0] : order.plans,
  }));

  return orders || [];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
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

  if (error) throw error;

  if (!data) return null;

  // Transform the data to handle array/object plan format
  return {
    ...data,
    plan: Array.isArray(data.plans) ? data.plans[0] : data.plans,
  };
}

// Checkout API
export async function createCheckout(params: CheckoutParams): Promise<PaymentIntentResponse> {
  const response = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  return response.json();
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
