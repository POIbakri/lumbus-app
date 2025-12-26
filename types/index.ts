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
  is_reloadable?: boolean; // Daily unlimited plans (1GB/Day) don't support top-ups
  created_at: string;
  updated_at: string;
  // Client-side computed fields (not in database)
  displayPrice?: string;
  convertedPrice?: number;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total_seconds: number;
  is_expired: boolean;
  formatted: string; // Pre-formatted: "5d", "18h", "45m", or "EXP"
}

export interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'paid' | 'provisioning' | 'completed' | 'active' | 'depleted' | 'expired' | 'cancelled' | 'revoked' | 'failed' | 'refunded';
  qr_url: string | null;
  smdp: string | null;
  activation_code: string | null;
  iccid: string | null;
  apn: string | null;
  activate_before: string | null;
  expires_at: string | null; // ISO 8601 timestamp of exact expiration
  created_at: string;
  plan?: Plan;
  data_usage_bytes?: number;
  data_remaining_bytes?: number | null;
  total_bytes?: number | null; // Total data allocation in bytes (includes top-ups)
  last_usage_update?: string | null;
  time_remaining?: TimeRemaining; // Pre-calculated time remaining from API
  is_topup?: boolean; // Whether this order is a top-up (from backend)
  is_reloadable?: boolean; // Whether plan supports top-ups (daily unlimited plans don't)
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
  referralCode?: string; // Optional referral code for discount (mutually exclusive with discountCode)
  discountCode?: string; // Optional discount code (mutually exclusive with referralCode)
}

export interface ValidateCodeParams {
  code: string;
  planId: string;
  email?: string;
}

export interface ValidateCodeResponse {
  valid: boolean;
  type?: 'discount' | 'referral';
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  bonusDataMB?: number;
  message?: string;
  error?: string;
}

export interface PaymentIntentResponse {
  clientSecret?: string;  // Optional - not present for free orders
  orderId: string;
  publishableKey?: string;
  stripeMode?: 'test' | 'live';
  freeOrder?: boolean;    // True when order is free (100% discount)
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

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  scheduledDeletion?: string;
}

// Wallet / Free Data Rewards Types
export interface WalletData {
  balance_mb: number;
  balance_gb: string;
  active_esims: WalletActiveEsim[];
}

export interface WalletActiveEsim {
  id: string;
  plan_name: string;
  data_remaining_bytes: number;
  free_data_added_mb: number;
  created_at: string;
  expires_at: string | null;
  region_code: string | null;
  is_reloadable: boolean; // Daily unlimited plans (1GB/Day) don't support top-ups
}

export interface ApplyDataParams {
  orderId: string;
  amountMB: number; // Multiple of 1024, min 1024, max 10240
}

export interface ApplyDataResponse {
  success: boolean;
  message: string;
  newWalletBalance: number;
  newWalletBalanceGB: string;
}
