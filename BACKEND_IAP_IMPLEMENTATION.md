# Backend IAP Implementation Guide

## Overview

With 1700+ plans, we use a **price-tier system** where one Apple IAP product represents all plans at the same price point.

---

## Backend Endpoint: POST /api/checkout/iap

### Request Body

```typescript
{
  planId: string;           // e.g., "abc123"
  email: string;            // User's email
  currency: string;         // e.g., "USD", "GBP"
  amount?: number;          // Plan price (e.g., 4.99)
  isTopUp?: boolean;        // true for top-ups
  existingOrderId?: string; // For top-ups
  iccid?: string;           // For top-ups
}
```

### Implementation Logic

```typescript
// POST /api/checkout/iap handler

async function handleIAPCheckout(req, res) {
  const { planId, email, currency, amount, isTopUp, existingOrderId, iccid } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    // 1. Fetch the plan from database
    const plan = await db.plans.findById(planId);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // 2. Generate Apple product ID based on price
    const productId = generateAppleProductId(plan);

    // 3. Create order in database
    const order = await db.orders.create({
      user_id: userId,
      plan_id: plan.id,
      status: 'pending',
      payment_method: 'apple_iap',
      amount_cents: Math.round(plan.retail_price * 100),
      currency: currency || 'USD',
      email: email,

      // Top-up specific fields
      is_top_up: isTopUp || false,
      parent_order_id: existingOrderId || null,
      target_iccid: iccid || null,
    });

    // 4. Return product ID and order ID
    res.json({
      orderId: order.id,
      productId: productId,
      planName: plan.name,
      dataGB: plan.data_gb,
      validityDays: plan.validity_days,
      retailPriceUSD: plan.retail_price,
    });

  } catch (error) {
    console.error('IAP checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
}

/**
 * Generate Apple IAP product ID from plan price
 *
 * This maps all plans with the same price to the same IAP product.
 *
 * Examples:
 * - $4.99 → com.lumbus.app.esim.tier_499
 * - $19.99 → com.lumbus.app.esim.tier_1999
 * - $0.99 → com.lumbus.app.esim.tier_99
 */
function generateAppleProductId(plan: Plan): string {
  // Convert price to cents (avoid floating point issues)
  const priceInCents = Math.round(plan.retail_price * 100);

  return `com.lumbus.app.esim.tier_${priceInCents}`;
}
```

---

## Backend Endpoint: POST /api/iap/validate-receipt

### Request Body

```typescript
{
  receipt: string;  // base64 encoded receipt from Apple
  orderId: string;  // Order ID from checkout
}
```

### Implementation Logic

```typescript
async function validateAppleReceipt(req, res) {
  const { receipt, orderId } = req.body;

  try {
    // 1. Fetch order from database
    const order = await db.orders.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Validate receipt with Apple
    const validationResult = await verifyReceiptWithApple(receipt);

    if (!validationResult.valid) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid receipt',
      });
    }

    // 3. Extract transaction info
    const transaction = validationResult.receipt.in_app[0];
    const transactionId = transaction.transaction_id;
    const originalTransactionId = transaction.original_transaction_id;
    const productId = transaction.product_id;

    // 4. Check if transaction already processed (prevent duplicate provisioning)
    const existingOrder = await db.orders.findByTransactionId(transactionId);
    if (existingOrder && existingOrder.id !== orderId) {
      return res.status(400).json({
        valid: false,
        error: 'Receipt already used',
      });
    }

    // 5. Update order in database
    await db.orders.update(orderId, {
      status: 'paid',
      paid_at: new Date(),
      apple_transaction_id: transactionId,
      apple_original_transaction_id: originalTransactionId,
      apple_product_id: productId,
      apple_receipt_data: receipt,
    });

    // 6. Provision eSIM or add top-up data
    if (order.is_top_up && order.target_iccid) {
      // Top-up: Add data to existing eSIM
      await addDataToExistingEsim(order.target_iccid, order.plan_id);
    } else {
      // New purchase: Provision new eSIM
      await provisionNewEsim(orderId);
    }

    // 7. Send success response
    res.json({
      valid: true,
      orderId: order.id,
      transactionId: transactionId,
      status: 'paid',
    });

  } catch (error) {
    console.error('Receipt validation error:', error);
    res.status(500).json({ error: 'Failed to validate receipt' });
  }
}

/**
 * Verify receipt with Apple's servers
 */
async function verifyReceiptWithApple(receiptData: string) {
  const APPLE_SHARED_SECRET = process.env.APPLE_IAP_SHARED_SECRET;

  // Try production endpoint first
  let endpoint = 'https://buy.itunes.apple.com/verifyReceipt';

  let response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': APPLE_SHARED_SECRET,
      'exclude-old-transactions': true,
    }),
  });

  let result = await response.json();

  // If status 21007, receipt is from sandbox, retry with sandbox endpoint
  if (result.status === 21007) {
    endpoint = 'https://sandbox.itunes.apple.com/verifyReceipt';
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': APPLE_SHARED_SECRET,
        'exclude-old-transactions': true,
      }),
    });
    result = await response.json();
  }

  // Status 0 = valid receipt
  if (result.status === 0) {
    return { valid: true, receipt: result.receipt };
  } else {
    return { valid: false, status: result.status };
  }
}

/**
 * Add data to existing eSIM (for top-ups)
 */
async function addDataToExistingEsim(iccid: string, newPlanId: string) {
  // 1. Find existing order by ICCID
  const existingOrder = await db.orders.findByIccid(iccid);

  if (!existingOrder) {
    throw new Error('Existing eSIM not found');
  }

  // 2. Get new plan details
  const newPlan = await db.plans.findById(newPlanId);

  // 3. Add data to existing eSIM via eSIM provider API
  // Example: eSIM Access API call
  await esimProviderApi.addDataToBundle({
    iccid: iccid,
    additionalDataMB: newPlan.data_gb * 1024,
    additionalValidityDays: newPlan.validity_days, // Optional: extend validity
  });

  // 4. Update database
  await db.orders.update(existingOrder.id, {
    data_remaining_bytes: existingOrder.data_remaining_bytes + (newPlan.data_gb * 1024 * 1024 * 1024),
    // Optionally extend activate_before date
    // activate_before: new Date(existingOrder.activate_before.getTime() + (newPlan.validity_days * 24 * 60 * 60 * 1000)),
  });
}

/**
 * Provision new eSIM
 */
async function provisionNewEsim(orderId: string) {
  // Your existing eSIM provisioning logic
  // This calls your eSIM provider API (e.g., eSIM Access)
  // and updates the order with ICCID, QR code, activation code, etc.

  // Example:
  const order = await db.orders.findById(orderId);
  const plan = await db.plans.findById(order.plan_id);

  const esimData = await esimProviderApi.createBundle({
    packageCode: plan.supplier_sku,
    dataGB: plan.data_gb,
    validityDays: plan.validity_days,
  });

  await db.orders.update(orderId, {
    status: 'active',
    iccid: esimData.iccid,
    smdp: esimData.smdpAddress,
    activation_code: esimData.matchingId,
    qr_url: esimData.qrCodeUrl,
    apn: esimData.apn,
    activate_before: esimData.expiryDate,
    data_remaining_bytes: plan.data_gb * 1024 * 1024 * 1024,
  });
}
```

---

## Environment Variables Required

```bash
# .env file (backend)

# Apple IAP Shared Secret (from App Store Connect)
APPLE_IAP_SHARED_SECRET=your_app_specific_shared_secret_here

# Get from: App Store Connect → Your App → General → App Information
# Look for "App-Specific Shared Secret" section
# Click "Generate" if not exists
```

---

## Database Schema Updates (Optional)

If not already present, add these fields to your `orders` table:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_top_up BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES orders(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS target_iccid TEXT;
```

---

## Testing Checklist

### 1. Test Regular Purchase
- [ ] User selects $4.99 plan
- [ ] Backend returns `productId: "com.lumbus.app.esim.tier_499"`
- [ ] App shows Apple payment sheet
- [ ] User completes purchase
- [ ] Receipt validated
- [ ] New eSIM provisioned
- [ ] Order status = 'active'

### 2. Test Top-Up
- [ ] User has existing eSIM with ICCID
- [ ] User selects $9.99 top-up plan
- [ ] Backend returns `productId: "com.lumbus.app.esim.tier_999"`
- [ ] App shows Apple payment sheet
- [ ] User completes purchase
- [ ] Receipt validated
- [ ] Data added to existing ICCID (no new eSIM)
- [ ] `data_remaining_bytes` increased

### 3. Test Multiple Plans Same Price
- [ ] Create 2 plans: "USA 1GB" and "Europe 1GB", both $4.99
- [ ] Both should use `com.lumbus.app.esim.tier_499`
- [ ] Purchase both separately
- [ ] Both should provision correctly

### 4. Test Sandbox
- [ ] Use sandbox Apple ID
- [ ] Purchase using test card
- [ ] Receipt validation uses sandbox endpoint
- [ ] eSIM provisions in sandbox/test mode

---

## Price Tier Product List

Run this SQL query on your database to generate the full list:

```sql
SELECT
  retail_price,
  COUNT(*) as plans_using_this_price,
  ROUND(retail_price * 100) as price_cents,
  'com.lumbus.app.esim.tier_' || ROUND(retail_price * 100) as product_id,
  '$' || retail_price as display_price
FROM plans
GROUP BY retail_price
ORDER BY retail_price;
```

Then create one IAP product in App Store Connect for each row in the output.

---

## Common Issues

### Issue: "Product not found" (E_ITEM_UNAVAILABLE)
**Cause**: IAP product not created in App Store Connect for this price
**Solution**:
1. Check which price failed: look at plan's `retail_price`
2. Calculate: `priceInCents = retail_price * 100`
3. Product ID should be: `com.lumbus.app.esim.tier_{priceInCents}`
4. Create missing product in App Store Connect

### Issue: User pays $4.99 but gets $9.99 plan
**Cause**: Backend mapped wrong product ID
**Solution**: Ensure `generateAppleProductId` uses `plan.retail_price`, not a hardcoded value

### Issue: Top-up creates new eSIM instead of adding data
**Cause**: `isTopUp` parameter not being checked
**Solution**: Check `order.is_top_up` flag in receipt validation, route to `addDataToExistingEsim` instead of `provisionNewEsim`

---

## Support & Resources

- **Apple IAP Docs**: https://developer.apple.com/in-app-purchase/
- **Receipt Validation**: https://developer.apple.com/documentation/appstorereceipts
- **App Store Connect**: https://appstoreconnect.apple.com
- **Sandbox Testing**: https://developer.apple.com/apple-pay/sandbox-testing/

---

**Last Updated**: 2025-10-22
**Status**: ✅ Ready for Implementation
**Mobile Status**: ✅ Complete (supports price-tier system)
**Backend Status**: ⏳ Needs implementation of 2 endpoints
