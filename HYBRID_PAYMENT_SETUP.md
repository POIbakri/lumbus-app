# Unified Payment System - Stripe on iOS & Android

## Overview

Lumbus uses a **unified Stripe-based payment system** that maximizes revenue and provides the best user experience on each platform:

- **iOS**: Stripe Payment Sheet with **Apple Pay + cards**
- **Android**: Stripe Payment Sheet with **Google Pay + cards**

---

## Why This Approach?

### Stripe on both platforms (2.9% + $0.30 fee, typical)
✅ **Benefits**:
- Single, unified backend integration (no IAP-specific receipt handling)
- Keep 97%+ of revenue on **both** platforms
- Support international cards
- Google Pay (Android) and Apple Pay (iOS) automatically included via Stripe
- Multi-currency support
- Instant refunds and chargeback handling via Stripe Dashboard

**Decision**: Use Stripe on both iOS and Android, with Apple Pay on iOS and Google Pay on Android.

---

## Architecture

### Unified Payment Service

All payments go through `PaymentService.ts`:

```typescript
import { PaymentService } from '@/lib/payments/PaymentService';

// Initialize once (done automatically in screens)
await PaymentService.initialize();

// Make a purchase - works on both platforms
const result = await PaymentService.purchase({
  planId: '123',
  planName: 'USA 1GB',
  price: 4.99,
  currency: 'USD',
  email: 'user@example.com',
  userId: 'user-id',
});

if (result.success) {
  // Navigate to success screen
}
```

### Platform-Specific Services

- **IAPService.ts**: Handles iOS Apple IAP
  - Connects to App Store
  - Fetches products
  - Requests purchases
  - Validates receipts

- **StripeService.ts**: Handles Android Stripe
  - Initializes Stripe SDK
  - Creates payment intents
  - Shows payment sheet with Google Pay
  - Processes cards

---

## User Experience

### iOS Purchase Flow

1. User taps "Buy now" button with Apple logo
2. **Apple's native payment sheet appears**
   - Apple Pay (if set up)
   - Saved cards
   - Add new card option
3. User authenticates with Face ID / Touch ID
4. Purchase completes
5. Backend validates receipt with Apple
6. eSIM is provisioned

**No disclosure modal** - seamless native experience

### Android Purchase Flow

1. User taps "Buy now" button
2. **Stripe's payment sheet appears**
   - Google Pay (if available)
   - Credit/debit card entry
   - Link (Stripe's one-click checkout)
3. User completes payment
4. Backend receives webhook from Stripe
5. eSIM is provisioned

**No Google commission** - keep 97%+ revenue

---

## Implementation Details

### 1. Payment Service Integration

Both purchase screens automatically use the hybrid system:

**app/plan/[id].tsx**:
```typescript
import { PaymentService } from '../../lib/payments/PaymentService';

// Initialize on mount
useEffect(() => {
  PaymentService.initialize();
  return () => PaymentService.cleanup();
}, []);

// Purchase
const result = await PaymentService.purchase({
  planId: plan.id,
  planName: plan.name,
  price: plan.price,
  currency,
  email: user.email,
  userId: user.id,
});
```

**app/topup/[orderId].tsx**:
Same pattern with additional fields:
```typescript
const result = await PaymentService.purchase({
  // ... same as above
  isTopUp: true,
  existingOrderId: orderId,
  iccid: order.iccid,
});
```

### 2. Backend Requirements

Your backend needs two endpoints:

#### For iOS: `POST /checkout/iap`
```typescript
{
  planId: string;
  email: string;
  currency: string;
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
}

// Returns:
{
  orderId: string;
  productId: string; // Apple IAP product ID
}
```

#### For Android: `POST /checkout`
```typescript
{
  planId: string;
  email: string;
  currency: string;
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
}

// Returns:
{
  orderId: string;
  clientSecret: string; // Stripe Payment Intent
}
```

### 3. Receipt/Webhook Handling

#### iOS: Receipt Validation
After purchase, your backend receives the receipt and must validate it:

```typescript
// Backend: POST /api/iap/validate-receipt
{
  receipt: string; // base64 encoded
  orderId: string;
}

// Validate with Apple's servers
POST https://buy.itunes.apple.com/verifyReceipt
{
  "receipt-data": receipt,
  "password": APPLE_SHARED_SECRET
}

// If valid (status: 0), mark order as paid and provision eSIM
```

#### Android: Stripe Webhooks
Stripe sends webhooks for payment events:

```typescript
// Backend: POST /api/webhooks/stripe
// Event: payment_intent.succeeded

{
  id: "pi_xxx",
  metadata: {
    orderId: "order-id"
  },
  status: "succeeded"
}

// Mark order as paid and provision eSIM
```

---

## Testing

### iOS Testing

1. **Create Sandbox Tester**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Create test Apple ID (e.g., test@example.com)

2. **Create IAP Products**:
   - App Store Connect → Your App → Features → In-App Purchases
   - Create products following IAP_PRODUCTS.md

3. **Test on Device**:
   - Sign out of production Apple ID
   - Install app via TestFlight or Xcode
   - Make purchase - sign in with sandbox tester when prompted
   - Verify purchase succeeds and eSIM is provisioned

### Android Testing

1. **Use Stripe Test Mode**:
   - Test cards: 4242 4242 4242 4242
   - Any future expiry, any CVC

2. **Test on Device/Emulator**:
   - Install app
   - Make purchase
   - Verify Stripe payment sheet appears
   - Complete payment with test card
   - Verify eSIM is provisioned

---

## App Store Connect Setup

### iOS In-App Purchase Configuration

1. **Create IAP Products**:
   - Go to App Store Connect
   - Your App → Features → In-App Purchases
   - Click "+" to create products
   - Follow IAP_PRODUCTS.md for product IDs

2. **Get Shared Secret**:
   - App Store Connect → Your App → General → App Information
   - App-Specific Shared Secret → Generate
   - Save to your backend env: `APPLE_SHARED_SECRET`

3. **Add Capability in Xcode**:
   - After `npx expo prebuild` (or EAS build)
   - Open .xcworkspace in Xcode
   - Target → Signing & Capabilities
   - Add "In-App Purchase" capability

### Android Stripe Configuration

1. **Enable Google Pay**:
   - Already configured in StripeService.ts
   - Automatically available if user has Google Pay set up

2. **Test in Stripe Dashboard**:
   - https://dashboard.stripe.com
   - View test payments
   - Test webhooks with Stripe CLI

---

## Revenue Comparison

### iOS (Apple IAP)
- **Gross Revenue**: $10.00
- **Apple Commission** (15-30%): -$1.50 to -$3.00
- **Net Revenue**: $7.00 - $8.50

### Android (Stripe)
- **Gross Revenue**: $10.00
- **Stripe Fee** (2.9% + $0.30): -$0.59
- **Net Revenue**: $9.41

### Summary
- **Android keeps ~12% more revenue** than iOS
- **iOS provides better UX** and higher conversion
- Both approaches are optimal for their platform

---

## Troubleshooting

### iOS Issues

**"Product not found"**
- Wait 2-4 hours after creating product in App Store Connect
- Ensure product status is "Ready to Submit" or "Approved"
- Check product ID matches exactly (case-sensitive)

**"Cannot connect to iTunes Store"**
- Sign out of production Apple ID on test device
- Use sandbox tester account
- Don't sign into sandbox account in device Settings

**Receipt validation fails**
- Check APPLE_SHARED_SECRET in backend
- Handle status code 21007 (sandbox to production fallback)
- Use correct endpoint (sandbox vs production)

### Android Issues

**Google Pay not appearing**
- Google Pay only appears if user has it set up
- Test with device that has Google Pay configured
- Check `googlePay` config in StripeService.ts

**Payment sheet doesn't show**
- Check `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in .env
- Verify Stripe is initialized in StripeService
- Check for console errors

**Webhook not received**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/webhooks/stripe`
- Check webhook signing secret matches
- Verify webhook endpoint is publicly accessible

---

## Security Best Practices

### iOS
1. **Always validate receipts** server-side
2. **Never trust client** purchase confirmation alone
3. **Store transaction IDs** for dispute resolution
4. **Use App-Specific Shared Secret** (not Master Shared Secret)

### Android
1. **Always verify Stripe webhooks** with signing secret
2. **Check payment status** on backend before provisioning
3. **Use idempotency keys** for payment intents
4. **Enable 3D Secure** for fraud prevention

### General
1. **Log all transactions** with user IDs
2. **Implement refund policies** clearly
3. **Monitor for fraudulent patterns**
4. **Keep audit trail** of all purchases

---

## Future Enhancements

### Subscriptions (iOS)
- Auto-renewable subscriptions for recurring data plans
- Subscription groups for different tiers
- Introductory pricing and trials

### Alternative Payment Methods
- PayPal (via Stripe on Android)
- Apple Pay on web (separate flow)
- Regional payment methods (Alipay, etc.)

### Analytics
- Track conversion rates by platform
- Monitor payment method preferences
- A/B test pricing strategies

---

## Resources

### iOS / Apple IAP
- **IAP Overview**: https://developer.apple.com/in-app-purchase/
- **Receipt Validation**: https://developer.apple.com/documentation/appstorereceipts
- **react-native-iap**: https://react-native-iap.dooboolab.com/
- **App Store Connect**: https://appstoreconnect.apple.com

### Android / Stripe
- **Stripe React Native**: https://stripe.com/docs/payments/accept-a-payment?platform=react-native
- **Google Pay**: https://stripe.com/docs/google-pay
- **Webhooks**: https://stripe.com/docs/webhooks
- **Stripe Dashboard**: https://dashboard.stripe.com

---

**Last Updated**: 2025-10-22
**Status**: ✅ Implementation Complete | ⏳ Awaiting IAP Products + Backend

## Next Steps

1. ✅ Mobile app implementation complete
2. ⏳ Create IAP products in App Store Connect (see IAP_PRODUCTS.md)
3. ⏳ Implement `/checkout/iap` endpoint in backend
4. ⏳ Implement receipt validation in backend
5. ⏳ Test full flow in sandbox (iOS) and test mode (Android)
6. ⏳ Submit app for review with IAP products
