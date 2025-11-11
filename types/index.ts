export interface Plan {
  id: string;
  name: string;
  region_code: string;
  data_gb: number;
  validity_days: number;
  supplier_sku: string;
  retail_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Client-side computed fields (not in database)
  displayPrice?: string;
  convertedPrice?: number;
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
  referralCode?: string; // Optional referral code for discount
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
