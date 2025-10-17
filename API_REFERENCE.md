# Lumbus Mobile App - API Reference

Quick reference for all API endpoints and database queries used by the mobile app.

## Backend API Endpoints

### 1. Checkout (Mobile)
**Endpoint**: `POST https://getlumbus.com/api/checkout`

**Description**: Creates a Stripe Payment Intent for mobile Payment Sheet

**Request**:
```typescript
{
  planId: string;     // UUID of the plan
  email: string;      // User email
}
```

**Response**:
```typescript
{
  clientSecret: string;  // Stripe Payment Intent client secret
  orderId: string;       // Order ID in database
}
```

**Usage in App**:
```typescript
import { createCheckout } from '@/lib/api';

const { clientSecret, orderId } = await createCheckout({
  planId: plan.id,
  email: user.email,
});
```

## Supabase Queries

### 2. Fetch Plans
**Description**: Get all available eSIM plans

**Query**:
```typescript
const { data, error } = await supabase
  .from('plans')
  .select('*')
  .order('price', { ascending: true });
```

**Returns**:
```typescript
Plan[] {
  id: string;
  name: string;
  region_code: string;
  data_gb: number;
  validity_days: number;
  price: number;
  coverage: string[];
  created_at: string;
}
```

### 3. Fetch Plan by ID
**Description**: Get details for a specific plan

**Query**:
```typescript
const { data, error } = await supabase
  .from('plans')
  .select('*')
  .eq('id', planId)
  .single();
```

**Returns**: `Plan`

### 4. Fetch User Orders
**Description**: Get all orders for a user with plan details

**Query**:
```typescript
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
```

**Returns**:
```typescript
Order[] {
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
```

**Note**: The query returns `plans` as an array, use transformation:
```typescript
const orders = data?.map((order: any) => ({
  ...order,
  plan: Array.isArray(order.plans) ? order.plans[0] : order.plans,
}));
```

### 5. Fetch Order by ID
**Description**: Get specific order with plan details

**Query**:
```typescript
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
```

**Returns**: `Order`

**Note**: Apply same transformation as above for the `plans` field.

### 6. Real-time Order Updates
**Description**: Subscribe to order status changes

**Query**:
```typescript
const channel = supabase
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
      // Fetch updated order
      const order = await fetchOrderById(orderId);
      if (order) {
        callback(order);
      }
    }
  )
  .subscribe();

// Cleanup
return () => {
  channel.unsubscribe();
};
```

**Usage in App**:
```typescript
useEffect(() => {
  if (!orderId) return;

  const channel = subscribeToOrderUpdates(orderId, (updatedOrder) => {
    // Update UI with new order data
    refetch();
  });

  return () => {
    channel.unsubscribe();
  };
}, [orderId]);
```

## Authentication

### 7. Sign In
**Description**: Sign in with email and password

**Query**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Returns**: `{ user, session }`

### 8. Sign Up
**Description**: Create new account with email and password

**Query**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});
```

**Returns**: `{ user, session }`

### 9. Sign Out
**Description**: Sign out current user

**Query**:
```typescript
await supabase.auth.signOut();
```

### 10. Get Current User
**Description**: Get authenticated user

**Query**:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

**Returns**: `User | null`

### 11. Get Session
**Description**: Get current session

**Query**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Returns**: `Session | null`

## Helper Functions

### Region Extraction
Extract region name from plan name:

```typescript
function extractRegion(name: string): string {
  const match = name.match(/^([^0-9]+?)\s+\d+/);
  return match ? match[1].trim() : name.split(' ')[0];
}

// Example:
extractRegion("Japan 5GB - 30 Days") // Returns: "Japan"
```

### LPA String Generation
Generate LPA string for QR code:

```typescript
const lpaString = `LPA:1$${order.smdp}$${order.activation_code}`;

// Example:
// LPA:1$rsp.esimaccess.com$ACTIVATION_CODE_HERE
```

## Error Handling

All API functions should be wrapped in try-catch:

```typescript
try {
  const data = await fetchPlans();
  // Success
} catch (error) {
  // Handle error
  console.error('Failed to fetch plans:', error);
  Alert.alert('Error', 'Failed to load plans');
}
```

## Status Codes

### Order Status
- `pending` - Order created, payment not completed
- `paid` - Payment successful, provisioning started
- `provisioning` - eSIM being provisioned by supplier
- `completed` - eSIM ready, activation details available
- `failed` - Order failed

### Payment Status (Stripe)
- Payment Intent created → Order status: `pending`
- Payment succeeded → Order status: `paid`
- eSIM provisioned → Order status: `provisioning`
- ORDER_STATUS webhook → Order status: `completed`

## Webhook Flow

### Mobile Payment Flow
1. App calls `POST /api/checkout`
2. Backend creates Payment Intent
3. App presents Payment Sheet
4. User completes payment
5. Stripe sends `payment_intent.succeeded` webhook
6. Backend provisions eSIM via eSIM Access API
7. Backend updates order status to `provisioning`
8. eSIM Access sends `ORDER_STATUS` webhook
9. Backend updates order with activation details
10. Backend sends confirmation email
11. App receives real-time update via Supabase subscription
12. App shows installation screen

## Rate Limits

- Supabase: 100 requests per second (free tier)
- Stripe: No published limits for Payment Intents
- eSIM Access: Check their documentation

## Testing

### Test Mode
For testing, use Stripe test mode:
- Replace `pk_live_` with `pk_test_` in publishable key
- Replace `sk_live_` with `sk_test_` in secret key
- Use test card: `4242 4242 4242 4242`

### Production Mode
- Use live Stripe keys (configured)
- Real payments will be processed
- Real eSIMs will be provisioned

## Support

For API issues:
- Check backend logs: `https://getlumbus.com/admin`
- Check Stripe dashboard: `https://dashboard.stripe.com`
- Check Supabase dashboard: `https://app.supabase.com`
- Check eSIM Access dashboard: `https://www.esimaccess.com`
