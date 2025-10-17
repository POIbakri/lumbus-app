export interface Plan {
  id: string;
  name: string;
  region_code: string;
  data_gb: number;
  validity_days: number;
  price: number;
  retail_price: number;
  coverage: string[];
  created_at: string;
  displayPrice?: string; // Formatted price in user's currency
  convertedPrice?: number; // Price in user's currency
}

export interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  qr_url: string | null;
  smdp: string | null;
  activation_code: string | null;
  iccid: string | null;
  apn: string | null;
  activate_before: string | null;
  created_at: string;
  plan?: Plan;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CheckoutParams {
  planId: string;
  email: string;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  orderId: string;
}
