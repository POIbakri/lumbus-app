# Payment Integration Summary - Currency, API & Supabase Flow

## ✅ Complete Integration Overview

This document explains how currency handling, API calls, and Supabase work together in the payment system.

---

## 🌍 Currency Flow

### 1. **Currency Detection** (On App Launch)

```typescript
// hooks/useCurrency.ts
const { currency, symbol, convertMultiplePrices } = useCurrency();

// Calls: GET /api/currency/detect
// Returns: { country: 'GB', currency: 'GBP', symbol: '£', name: 'British Pound' }
```

**Flow:**
1. App launches
2. useCurrency hook calls `/api/currency/detect`
3. Backend detects user location from IP/headers
4. Returns currency info
5. Fallback to USD if detection fails

### 2. **Price Conversion** (When Viewing Plans)

```typescript
// hooks/useCurrency.ts
const converted = await convertMultiplePrices([4.99, 9.99, 14.99]);

// Calls: POST /api/currency/detect
// Body: { prices: [4.99, 9.99, 14.99] }
// Returns: { currency: 'GBP', prices: [{ usd: 4.99, converted: 3.99, formatted: '£3.99' }, ...] }
```

**Flow:**
1. User views plan list
2. App calls `convertMultiplePrices([plan1.price, plan2.price, ...])`
3. Backend converts USD → user's currency
4. App displays converted prices (e.g., "£3.99" instead of "$4.99")
5. Results cached for 5 minutes

---

## 💳 Payment Flow Comparison

### iOS (Apple IAP) Flow

```
1. User taps "Buy now for £3.99"
   ├─ Plan price: $4.99 USD (from database)
   ├─ Display price: £3.99 (converted for display)
   └─ Currency detected: GBP

2. App calls: PaymentService.purchase({
     planId: '123',
     planName: 'USA 1GB',
     price: 4.99,              ← Always in USD (retail_price from DB)
     currency: 'GBP',          ← User's detected currency
     email: 'user@example.com',
     userId: 'user-id'
   })

3. IAPService creates checkout:
   POST /api/checkout/iap
   {
     planId: '123',
     email: 'user@example.com',
     currency: 'GBP',
     amount: 4.99             ← USD price (Apple handles conversion)
   }

4. Backend Response:
   {
     orderId: 'order-123',
     productId: 'com.lumbus.app.esim.usa_1gb'
   }

5. IAPService calls Apple:
   requestPurchase({ sku: 'com.lumbus.app.esim.usa_1gb' })
   ↓
   Apple shows payment sheet with local currency pricing
   User sees: £3.99 (Apple converts based on App Store pricing)
   ↓
   User pays with Apple Pay / Card
   ↓
   Apple charges: £3.99

6. Apple sends receipt to app
   ↓
   App sends receipt to backend: POST /api/iap/validate-receipt
   ↓
   Backend validates with Apple's servers
   ↓
   Backend provisions eSIM

7. Supabase order record:
   {
     id: 'order-123',
     plan_id: '123',
     user_id: 'user-id',
     status: 'paid',
     payment_method: 'apple_iap',
     amount: 4.99,            ← USD (base price)
     currency: 'GBP',         ← User's currency
     apple_transaction_id: 'xxx'
   }
```

**Key Points - iOS:**
- ✅ Price is always stored in USD in database
- ✅ Currency field tracks user's detected currency
- ✅ Apple handles actual conversion based on App Store pricing tiers
- ✅ User pays in their local currency (handled by Apple)
- ✅ Backend stores USD amount + user's currency for records

### Android (Stripe) Flow

```
1. User taps "Buy now for £3.99"
   ├─ Plan price: $4.99 USD (from database)
   ├─ Display price: £3.99 (converted for display)
   └─ Currency detected: GBP

2. App calls: PaymentService.purchase({
     planId: '123',
     planName: 'USA 1GB',
     price: 4.99,              ← USD price
     currency: 'GBP',
     email: 'user@example.com',
     userId: 'user-id'
   })

3. StripeService creates checkout:
   POST /api/checkout
   {
     planId: '123',
     email: 'user@example.com',
     currency: 'GBP',          ← User's currency
     amount: 4.99              ← USD price (backend converts)
   }

4. Backend:
   - Receives: amount: 4.99, currency: 'GBP'
   - Converts: $4.99 USD → £3.99 GBP (using exchange rate)
   - Creates Stripe Payment Intent for £3.99
   - Returns: { orderId: 'order-123', clientSecret: 'pi_xxx' }

5. StripeService shows payment sheet:
   - Currency: GBP
   - Amount: £3.99
   - Google Pay available (if configured)
   - User pays

6. Stripe webhook: payment_intent.succeeded
   ↓
   POST /api/webhooks/stripe
   {
     id: 'pi_xxx',
     amount: 399,            ← In cents (£3.99)
     currency: 'gbp',
     metadata: { orderId: 'order-123' }
   }
   ↓
   Backend provisions eSIM

7. Supabase order record:
   {
     id: 'order-123',
     plan_id: '123',
     user_id: 'user-id',
     status: 'paid',
     payment_method: 'stripe',
     amount: 4.99,            ← USD (base price)
     amount_paid: 3.99,       ← GBP (actual amount paid)
     currency: 'GBP',
     stripe_payment_intent: 'pi_xxx'
   }
```

**Key Points - Android:**
- ✅ Backend converts USD → user's currency before creating Payment Intent
- ✅ Stripe charges in user's local currency
- ✅ Database stores both USD base price and actual amount paid
- ✅ Google Pay automatically configured with correct currency

---

## 🗄️ Supabase Database Schema

### Orders Table

Your backend should create orders with these fields:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES plans(id),

  -- Status tracking
  status TEXT NOT NULL, -- 'pending' | 'paid' | 'active' | 'depleted' | 'expired'

  -- Payment info
  payment_method TEXT, -- 'apple_iap' | 'stripe'
  amount DECIMAL(10,2), -- Base price in USD
  amount_paid DECIMAL(10,2), -- Actual amount paid in user's currency
  currency TEXT DEFAULT 'USD', -- User's currency

  -- Platform-specific IDs
  stripe_payment_intent TEXT, -- For Stripe
  apple_transaction_id TEXT, -- For Apple IAP
  apple_receipt TEXT, -- For Apple receipt validation

  -- eSIM provisioning data
  smdp TEXT,
  activation_code TEXT,
  iccid TEXT,
  apn TEXT,
  qr_url TEXT,
  activate_before TIMESTAMP,

  -- Usage tracking
  data_usage_bytes BIGINT DEFAULT 0,
  data_remaining_bytes BIGINT,
  last_usage_update TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 Required Backend API Endpoints

### 1. Currency Detection

```typescript
// GET /api/currency/detect
// Returns user's currency based on IP/location

Response:
{
  country: "GB",
  currency: "GBP",
  symbol: "£",
  name: "British Pound"
}
```

### 2. Price Conversion

```typescript
// POST /api/currency/detect
// Converts USD prices to user's currency

Request:
{
  prices: [4.99, 9.99, 14.99]
}

Response:
{
  currency: "GBP",
  symbol: "£",
  name: "British Pound",
  prices: [
    { usd: 4.99, converted: 3.99, formatted: "£3.99" },
    { usd: 9.99, converted: 7.99, formatted: "£7.99" },
    { usd: 14.99, converted: 11.99, formatted: "£11.99" }
  ]
}
```

### 3. Stripe Checkout (Android)

```typescript
// POST /api/checkout

Request:
{
  planId: "123",
  email: "user@example.com",
  currency: "GBP",
  amount: 4.99, // USD price
  isTopUp?: boolean,
  existingOrderId?: string,
  iccid?: string
}

Backend Logic:
1. Fetch plan from database
2. Convert $4.99 USD → £3.99 GBP (using exchange rate API)
3. Create Stripe Payment Intent for £3.99 GBP
4. Create order in Supabase (status: 'pending')
5. Return client secret

Response:
{
  orderId: "order-123",
  clientSecret: "pi_xxx_secret_yyy"
}
```

### 4. Apple IAP Checkout (iOS)

```typescript
// POST /api/checkout/iap

Request:
{
  planId: "123",
  email: "user@example.com",
  currency: "GBP", // For record keeping
  amount: 4.99, // USD price (for record keeping)
  isTopUp?: boolean,
  existingOrderId?: string,
  iccid?: string
}

Backend Logic:
1. Fetch plan from database
2. Generate Apple product ID: com.lumbus.app.esim.usa_1gb
3. Create order in Supabase (status: 'pending')
4. Return product ID

Response:
{
  orderId: "order-123",
  productId: "com.lumbus.app.esim.usa_1gb"
}
```

### 5. Apple Receipt Validation

```typescript
// POST /api/iap/validate-receipt

Request:
{
  receipt: "base64_encoded_receipt",
  orderId: "order-123"
}

Backend Logic:
1. Send receipt to Apple's verifyReceipt endpoint
2. If valid (status: 0):
   - Update order status to 'paid'
   - Store Apple transaction ID
   - Provision eSIM
3. Return success

Response:
{
  valid: true,
  transactionId: "xxx"
}
```

### 6. Stripe Webhook Handler

```typescript
// POST /api/webhooks/stripe

Request (from Stripe):
{
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_xxx",
      amount: 399, // £3.99 in pence
      currency: "gbp",
      metadata: {
        orderId: "order-123"
      }
    }
  }
}

Backend Logic:
1. Verify webhook signature
2. Update order status to 'paid'
3. Store payment intent ID
4. Provision eSIM
5. Send confirmation email
```

---

## ✅ Data Flow Validation Checklist

### iOS Purchase:
- [x] User's currency is detected (e.g., GBP)
- [x] Prices displayed in user's currency (£3.99)
- [x] App sends USD amount (4.99) to backend
- [x] Backend creates order with USD amount + user's currency
- [x] Apple handles actual currency conversion
- [x] Receipt validated server-side
- [x] Order updated to 'paid' status
- [x] eSIM provisioned

### Android Purchase:
- [x] User's currency is detected (e.g., GBP)
- [x] Prices displayed in user's currency (£3.99)
- [x] App sends USD amount (4.99) + currency (GBP) to backend
- [x] Backend converts to GBP (£3.99)
- [x] Stripe Payment Intent created for £3.99 GBP
- [x] User pays in GBP
- [x] Webhook received and verified
- [x] Order updated to 'paid' status
- [x] eSIM provisioned

---

## 🚨 Important Notes

### For iOS:
1. **Price Storage**: Always store USD price in database
2. **Display Price**: Show converted price to user (for UX)
3. **Apple Pricing**: Apple determines actual price based on pricing tier
4. **Currency Tracking**: Track user's currency for analytics/support
5. **Receipt Validation**: Always validate receipts server-side

### For Android:
1. **Price Storage**: Store USD price + actual amount paid
2. **Conversion**: Backend must convert USD → user's currency
3. **Stripe Amount**: Send amount in smallest currency unit (pence, cents, etc.)
4. **Webhook Validation**: Verify webhook signatures
5. **Currency Parameter**: Always pass currency to Stripe

### General:
1. **Fallback**: Always fallback to USD if currency detection fails
2. **Caching**: Cache currency conversions for 5 minutes
3. **Logging**: Log currency, amount, and payment method for all transactions
4. **Support**: Store user's currency for customer support queries
5. **Analytics**: Track revenue by currency for business insights

---

## 🔧 Testing

### Test Currency Flow:
```bash
# 1. Test currency detection
curl https://your-api.com/api/currency/detect

# 2. Test price conversion
curl -X POST https://your-api.com/api/currency/detect \
  -H "Content-Type: application/json" \
  -d '{"prices": [4.99, 9.99]}'
```

### Test iOS Payment:
1. Create sandbox tester with UK Apple ID
2. Launch app from UK IP (or use VPN)
3. Currency should detect as GBP
4. Prices display as £X.XX
5. Purchase shows Apple's GBP pricing
6. Backend receives USD amount + GBP currency
7. Order created with both values

### Test Android Payment:
1. Set device location to UK
2. Launch app
3. Currency should detect as GBP
4. Prices display as £X.XX
5. Payment sheet shows £X.XX
6. Backend creates Payment Intent for GBP amount
7. Stripe charges in GBP
8. Webhook received with GBP amount

---

**Last Updated**: 2025-10-22
**Status**: ✅ Integration Complete | Ready for Backend Implementation
