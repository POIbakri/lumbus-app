# Apple In-App Purchase (IAP) Products Configuration

## Overview

This document outlines all IAP products that need to be created in App Store Connect for the Lumbus app.

**Product Type:** Consumable (eSIM data plans are one-time purchases that are consumed)

## Product ID Format

All product IDs follow this naming convention:
```
com.lumbus.app.esim.{region}_{dataGB}gb_{validityDays}days
```

Example: `com.lumbus.app.esim.usa_1gb_7days`

## Important Notes

1. **Create products in App Store Connect BEFORE testing**
2. Each product must be approved by Apple before it can be purchased
3. Test in Sandbox environment first
4. Prices should match your database plans
5. Product IDs are **case-sensitive** and **permanent** (cannot be changed)

---

## Required IAP Products

Below is the list of IAP products you need to create. Your backend should return these product IDs when the iOS app requests checkout.

### Format for Each Product:

- **Product ID**: The unique identifier for Apple
- **Reference Name**: Display name in App Store Connect (for your reference only)
- **Product Type**: Consumable
- **Price**: Set per currency/country in App Store Connect

---

## Product Creation Checklist

For EACH plan in your database, create an IAP product with:

### 1. Product Information
- [ ] **Product ID**: Follow format above
- [ ] **Reference Name**: Descriptive (e.g., "USA 1GB 7 Days")
- [ ] **Product Type**: Consumable

### 2. Pricing
- [ ] Set price tier or custom price
- [ ] Configure for all territories you operate in
- [ ] Ensure prices match your Stripe prices

### 3. Localizations
- [ ] Add English (U.S.) localization (required)
- [ ] Display Name: User-facing name (e.g., "USA 1GB")
- [ ] Description: "High-speed eSIM data for [region]. Valid for [X] days from activation."

### 4. Review Information
- [ ] Add screenshot showing where product appears in app
- [ ] Review notes explaining the eSIM data plan purchase

---

## Example Product Configuration

### Example: USA 1GB 7 Days

```
Product ID: com.lumbus.app.esim.usa_1gb_7days
Reference Name: USA 1GB 7 Days eSIM Data Plan
Type: Consumable

Pricing:
- USD: $4.99
- EUR: €4.99
- GBP: £4.99
(Match your plan's retail_price)

Localization (English - U.S.):
- Display Name: USA 1GB
- Description: High-speed eSIM data for USA. 1GB of 4G/LTE data valid for 7 days from activation. Instant delivery and activation.
```

---

## Backend Implementation Required

Your backend API must implement the `/checkout/iap` endpoint that:

1. Receives: `planId`, `email`, `currency`, `isTopUp`, `existingOrderId`, `iccid`
2. Creates an order in your database
3. **Maps the plan to an Apple product ID**
4. Returns: `{ orderId, productId }`

### Example Mapping Logic:

```typescript
function generateAppleProductId(plan: Plan): string {
  // Sanitize plan name for product ID
  const sanitized = plan.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `com.lumbus.app.esim.${sanitized}`;
}

// Example:
// Plan name: "USA 1GB 7 Days"
// Product ID: "com.lumbus.app.esim.usa_1gb_7_days"
```

---

## Testing IAP Products

### 1. Create Sandbox Test User
- App Store Connect → Users and Access → Sandbox Testers
- Create a test Apple ID (don't use your real Apple ID)

### 2. Test on Physical Device
- Sign out of real App Store account
- Install your app via TestFlight or Xcode
- When prompted, sign in with sandbox test account
- Make a test purchase

### 3. Verify Purchase Flow
- [ ] Product loads correctly
- [ ] Price displays in correct currency
- [ ] Apple Pay sheet appears
- [ ] Purchase succeeds
- [ ] Order is created in your database
- [ ] eSIM is provisioned
- [ ] Receipt is validated

---

## Receipt Validation (Critical!)

### Server-Side Validation Required

Your backend MUST validate receipts with Apple's servers to prevent fraud:

```typescript
// Backend endpoint: POST /api/iap/validate-receipt

async function validateReceipt(receiptData: string, isProduction: boolean) {
  const endpoint = isProduction
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': process.env.APPLE_SHARED_SECRET, // Get from App Store Connect
    }),
  });

  const result = await response.json();

  if (result.status === 0) {
    // Receipt is valid
    // Grant user access to eSIM
    return { valid: true, transaction: result.receipt };
  } else if (result.status === 21007) {
    // Receipt is from sandbox, retry with sandbox endpoint
    return validateReceipt(receiptData, false);
  } else {
    // Receipt is invalid
    return { valid: false, error: result.status };
  }
}
```

---

## Auto-Renewable Subscriptions (Future Enhancement)

If you want to offer subscription plans in the future:

- **Product Type**: Auto-Renewable Subscription
- **Subscription Group**: Create "eSIM Data Subscriptions"
- **Subscription Durations**: Weekly, Monthly, Yearly
- **Benefits**: Recurring data allowances, no need to repurchase

---

## Common Issues & Solutions

### Issue: "Product not found" error
**Solution**:
- Ensure product is created in App Store Connect
- Product must be in "Ready to Submit" or "Approved" status
- Wait 2-4 hours after creating product for it to sync
- Use exact product ID (case-sensitive)

### Issue: "Cannot connect to iTunes Store" in sandbox
**Solution**:
- Sign out of production Apple ID on device
- Sign in with sandbox tester account when prompted
- Don't sign in to sandbox account in device Settings

### Issue: Receipt validation fails
**Solution**:
- Check APPLE_SHARED_SECRET environment variable
- Use correct endpoint (sandbox vs production)
- Handle status code 21007 (sandbox receipt sent to production)

### Issue: Purchase completes but user doesn't get eSIM
**Solution**:
- Always validate receipt server-side before granting access
- Implement webhook handler for purchase updates
- Log all transaction IDs for debugging
- Never trust client-side purchase confirmation alone

---

## Next Steps

1. **Create Products in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Select your app → Features → In-App Purchases
   - Create each product following the format above

2. **Implement Backend `/checkout/iap` Endpoint**
   - Map plans to product IDs
   - Create orders
   - Return product IDs to iOS app

3. **Implement Receipt Validation**
   - Create validation endpoint
   - Get Apple Shared Secret from App Store Connect
   - Validate all purchases before provisioning eSIMs

4. **Test in Sandbox**
   - Create sandbox tester
   - Test full purchase flow
   - Verify eSIM provisioning

5. **Submit App for Review**
   - Include IAP products in submission
   - Provide test account credentials
   - Explain eSIM provisioning in review notes

---

## Resources

- **App Store Connect**: https://appstoreconnect.apple.com
- **IAP Documentation**: https://developer.apple.com/in-app-purchase/
- **Receipt Validation**: https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
- **Sandbox Testing**: https://developer.apple.com/apple-pay/sandbox-testing/
- **react-native-iap Docs**: https://react-native-iap.dooboolab.com/

---

**Last Updated**: 2025-10-22
**Status**: ⏳ Awaiting App Store Connect product creation
