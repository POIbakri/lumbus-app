export interface Plan {
  id: string;
  name: string;
  region_code: string;
  data_gb: number;
  validity_days: number;
  price: number;
  retail_price: number;
  currency?: string; // Currency code (USD, EUR, etc.)
  coverage: string[];
  created_at: string;
  supplier_sku?: string; // eSIM Access package code
  displayPrice?: string; // Formatted price in user's currency
  convertedPrice?: number; // Price in user's currency
}

export interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'active' | 'depleted' | 'expired' | 'provisioning' | 'paid';
  qr_url: string | null;
  smdp: string | null;
  activation_code: string | null;
  iccid: string | null;
  apn: string | null;
  activate_before: string | null;
  created_at: string;
  plan?: Plan;
  data_usage_bytes?: number;
  data_remaining_bytes?: number | null;
  last_usage_update?: string | null;
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
  amount?: number; // Amount in the specified currency
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  orderId: string;
}

export interface TopUpPackage {
  packageCode: string;
  slug: string;
  name: string;
  description: string;
  dataGb?: number; // May be undefined, needs parsing from name
  validityDays?: number; // May be undefined, needs parsing from name
  price: number; // In cents, divide by 100
  currency: string;
  regionCode: string;
  isTopUpCompatible: boolean;
  // Parsed fields
  parsedDataGb?: number;
  parsedValidityDays?: number;
  displayPrice?: string;
  convertedPrice?: number;
}

export interface TopUpCheckoutParams {
  planId: string;
  isTopUp: boolean;
  existingOrderId: string;
  iccid: string;
  currency?: string;
  email?: string;
  amount?: number; // Amount in the specified currency
}

export interface TopUpCheckoutResponse {
  clientSecret: string;
  orderId: string;
}
