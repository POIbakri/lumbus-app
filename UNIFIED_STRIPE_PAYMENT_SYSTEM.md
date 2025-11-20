## Unified Stripe Payment System - iOS & Android

### Overview

Lumbus now uses a **single, unified Stripe-based payment system** across both platforms:

- **iOS**: Stripe Payment Sheet with **Apple Pay + cards**
- **Android**: Stripe Payment Sheet with **Google Pay + cards**

**Goals:**

- **One code path** for payments on mobile (simpler to reason about and maintain).
- **Consistent UX**: native-feeling Apple Pay on iOS, Google Pay on Android, plus cards on both.
- **Single backend flow** using Stripe webhooks to confirm payments and provision eSIMs.

Legacy **Apple IAP (react-native-iap)** is still present in the codebase for backup/historical reasons but is **not used** in the current flow.

---

## Mobile Architecture

### Core Files

- **`lib/payments/PaymentService.ts`**: Unified payment façade used by screens.
- **`lib/payments/StripeService.ts`**: Platform-aware Stripe implementation (Apple Pay + Google Pay + cards).
- **`lib/api.ts`**:
  - `createCheckout()` – single backend checkout endpoint for both platforms.
  - Order + usage fetching, referrals, etc.

### How Screens Use It

- **Plan purchase page**: `app/plan/[id].tsx`
- **Top-up page**: `app/topup/[orderId].tsx`

Both follow the same pattern:

- **On mount**:
  - `PaymentService.initialize()` (with safe error handling).
  - On unmount → `PaymentService.cleanup()` (just resets internal flags).
- **On “Buy now”**:
  - `PaymentService.purchase({...})`
  - Then poll the order and navigate to `install/[orderId]` when ready.

The screens never talk directly to Stripe or the backend; they always go through `PaymentService`.

---

## PaymentService - Single API Surface

**File**: `lib/payments/PaymentService.ts`

- **Parameters**:

```ts
type PurchaseParams = {
  planId: string;
  planName: string;
  price: number;        // Base USD price from DB
  currency: string;     // User’s detected currency (e.g. "GBP", "AED")
  email: string;
  userId: string;
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
  referralCode?: string; // Optional referral discount
};
```

- **Usage from screens**:

```ts
await PaymentService.initialize();

const result = await PaymentService.purchase({
  planId,
  planName,
  price: plan.retail_price,
  currency,         // from useCurrency()
  email: user.email,
  userId: user.id,
  isTopUp,          // true for top-ups
  existingOrderId,  // original order for top-ups
  iccid,            // target ICCID for top-ups
  referralCode,     // if present
});
```

- **Routing logic**:
  - Always uses **`StripeService`** on both platforms.
  - Ensures `StripeService.initialize()` has completed before any purchase:
    - Uses `initialized` + an internal `initializing` promise to avoid race conditions when the user taps “Buy now” very quickly.

---

## StripeService - iOS & Android Behavior

**File**: `lib/payments/StripeService.ts`

### Initialization

- **Called by**: `PaymentService.initialize()`
- **Steps**:

```ts
const publishableKey = config.stripePublishableKey;

const { initStripe } = await getStripeModule();
await initStripe({
  publishableKey,
  merchantIdentifier: 'merchant.com.lumbus.app', // required for Apple Pay on iOS
});
```

- **Notes**:
  - Uses dynamic import of `@stripe/stripe-react-native` to avoid unnecessary native init.
  - Logs whether it’s initializing on iOS or Android.

### Purchase Flow (Both Platforms)

1. **Create checkout with backend**:

```ts
const { clientSecret, orderId } = await createCheckout({
  planId: params.planId,
  email: params.email,
  currency: params.currency,
  amount: params.price,         // USD base price; backend converts
  isTopUp: params.isTopUp || false,
  existingOrderId: params.existingOrderId,
  iccid: params.iccid,
  referralCode: params.referralCode,
});
```

- **Endpoint**: `POST /checkout`
- **Expected response**: `{ clientSecret: string; orderId: string }`

2. **Initialize Stripe Payment Sheet**:

```ts
const paymentSheetParams: any = {
  merchantDisplayName: 'Lumbus (secure payments via Stripe)',
  paymentIntentClientSecret: clientSecret,
  defaultBillingDetails: { email: params.email },
  returnURL: 'lumbus://payment-complete',
  merchantCountryCode: 'US',
  appearance: {
    colors: {
      primary: '#2EFECC',
      background: '#FFFFFF',
      componentBackground: '#FFFFFF',
      componentText: '#1A1A1A',
      componentBorder: '#E0E0E0',
      text: '#1A1A1A',
      placeholderText: '#999999',
      secondaryText: '#666666',
      icon: '#666666',
      error: '#FF3B30',
    },
    shapes: {
      borderRadius: 12,
      borderWidth: 1,
    },
    primaryButton: {
      colors: {
        background: '#2EFECC',
        text: '#1A1A1A',
        border: '#2EFECC',
      },
    },
  },
  allowsDelayedPaymentMethods: true,
};
```

- **Android-only**:

```ts
paymentSheetParams.googlePay = {
  merchantCountryCode: 'US',
  testEnv: __DEV__,
  currencyCode: params.currency?.toUpperCase() || 'USD',
};
```

- **iOS-only**:

```ts
paymentSheetParams.applePay = {
  merchantCountryCode: 'US',
};
```

- This allows PaymentSheet to:
  - Show **Apple Pay** on iOS when Wallet + Merchant ID are configured.
  - Show **Google Pay** on Android when available.

3. **Present Payment Sheet**:

```ts
const { error: paymentError } = await presentPaymentSheet();

if (paymentError) {
  if (paymentError.code === 'Canceled') {
    return { success: false, error: 'Payment cancelled' };
  }
  throw new Error(paymentError.message);
}
```

4. **Return to screens**:

```ts
return {
  success: true,
  orderId,
  transactionId: clientSecret,
};
```

- The actual charge confirmation + eSIM provisioning happen on the backend via **Stripe webhooks**.

---

## Backend API Contracts

### `/checkout` – Unified for iOS & Android

- **Method**: `POST /checkout`
- **Request body** (from app):

```json
{
  "planId": "string",
  "email": "user@example.com",
  "currency": "GBP",
  "amount": 4.99,
  "isTopUp": true,
  "existingOrderId": "order-uuid",
  "iccid": "iccid-string",
  "referralCode": "ABC123"
}
```

- **Backend responsibilities**:

- **Pricing & Currency**
  - **Fetch plan** from DB by `planId`.
  - Use `amount` as the **base USD price** and convert to user’s currency (`currency`) using your FX logic.

- **Stripe Payment Intent**
  - Create a Payment Intent in Stripe for the converted amount in the local currency.
  - Attach `metadata.orderId` to allow webhook correlation.

- **Order creation (Supabase)**
  - Create an `orders` row with:
    - `status: 'pending'`
    - `payment_method: 'stripe'`
    - `amount` (USD base)
    - `amount_paid` (local currency)
    - `currency`
    - Top-up flags: `is_top_up`, `parent_order_id`, `target_iccid`

- **Response**:

```json
{
  "orderId": "order-uuid",
  "clientSecret": "pi_xxx_secret_yyy"
}
```

### Stripe Webhook – `payment_intent.succeeded`

- **Endpoint**: `POST /api/webhooks/stripe`
- **Event type**: `payment_intent.succeeded`
- **Payload shape (simplified)**:

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 399,
      "currency": "gbp",
      "metadata": {
        "orderId": "order-uuid"
      }
    }
  }
}
```

- **Backend responsibilities**:
  - Verify webhook signature using Stripe’s signing secret.
  - Fetch the corresponding `orders` row by `metadata.orderId`.
  - Mark order as `paid` and store Stripe payment intent ID.
  - Provision eSIM (new purchase) **or** add data to existing ICCID (top-up).
  - Optionally send confirmation email.

---

## Data Model (Orders)

Key fields in the `orders` table (simplified):

- **Core**:
  - `id`, `user_id`, `plan_id`
  - `status`: `'pending' | 'paid' | 'active' | 'depleted' | 'expired' | ...`
- **Payment**:
  - `payment_method`: `'stripe'`
  - `amount`: base price in USD
  - `amount_paid`: actual amount in user’s currency
  - `currency`: user’s currency code
  - `stripe_payment_intent`: Payment Intent ID
- **Top-ups**:
  - `is_top_up`: boolean
  - `parent_order_id`: original order for the eSIM
  - `target_iccid`: target ICCID for top-ups
- **eSIM provisioning**:
  - `smdp`, `activation_code`, `iccid`, `apn`, `qr_url`, `activate_before`
- **Usage**:
  - `data_usage_bytes`
  - `data_remaining_bytes`
  - `last_usage_update`

---

## Apple Pay & Google Pay Configuration

### Apple Pay (iOS)

- **Apple Developer**:
  - Merchant ID: **`merchant.com.lumbus.app`** must exist.

- **Xcode (iOS project)**:
  - Enable **Apple Pay** capability for the Lumbus app target.
  - Associate the above Merchant ID.

- **Stripe Dashboard**:
  - Enable Apple Pay and follow Stripe’s Apple Pay domain/app configuration steps.

- **App behavior**:
  - On a real device with Apple Pay set up, Stripe Payment Sheet will surface an **Apple Pay** button automatically.

### Google Pay (Android)

- Stripe is already configured to:
  - Enable Google Pay in PaymentSheet when:
    - The device supports Google Pay.
    - The user has it configured.
  - No extra logic in the app is required beyond the `googlePay` config we pass.

---

## UI & UX Notes

- **Plan purchase screen** (`app/plan/[id].tsx`):
  - Button shows Apple logo on iOS, standard CTA on Android.
  - Under the CTA:
    - **iOS**: “Pay securely with Apple Pay or card”
    - **Android**: “Pay securely with Google Pay or card”
    - Additional line: “Payments are securely processed by Stripe. We never store your card details.”

- **Top-up screen** (`app/topup/[orderId].tsx`):
  - Similar messaging:
    - “Pay securely with Apple Pay or card” / “Pay securely with Google Pay or card”
    - “Top-up payments are securely processed by Stripe.”

This clearly communicates that Stripe is handling the payment and that Lumbus does not store card details, reinforcing trust.

---

## Testing Checklist (Stripe-based System)

### iOS

- **Device requirements**:
  - Real device (not simulator).
  - Apple Pay set up in Wallet with at least one card.

- **Scenarios**:
  - New eSIM purchase:
    - Open plan detail.
    - Tap “Buy now”.
    - Confirm Stripe Payment Sheet appears.
    - Confirm Apple Pay option is visible and functional.
    - Confirm order is marked `paid` and eSIM is provisioned.
  - Top-up:
    - Open an existing eSIM and go to top-up page.
    - Select top-up plan and complete payment.
    - Confirm data is added to the existing ICCID, not a new eSIM.

### Android

- **Scenarios**:
  - New eSIM purchase:
    - Confirm Payment Sheet appears with card entry.
    - On a device with Google Pay configured, confirm Google Pay option appears.
    - Confirm eSIM provisioning via webhook.
  - Top-up:
    - Same as iOS – confirm additional data on existing ICCID.

### Backend

- Verify:
  - `/checkout` receives correct payloads from both platforms.
  - Webhook handler correctly updates orders and provisions eSIMs.
  - Supabase `orders` entries show:
    - Correct amounts.
    - Correct currency.
    - `payment_method = 'stripe'`.

---

## Legacy IAP (For Reference Only)

- **Files**:
  - `lib/payments/IAPServiceV13.ios.ts`
  - IAP helpers in `lib/api.ts` (`createIAPCheckout`, `validateAppleReceipt`)
- **Status**:
  - Kept in the codebase for **historical/rollback purposes**.
  - Not used in the current Stripe-based flow.

If you ever need to revert to IAP for iOS, you can:

- Re-disable Stripe on iOS in `react-native.config.js`.
- Re-wire `PaymentService` to use `IAPServiceV13` on iOS and `StripeService` on Android.

For now, **Stripe is the primary payment system for both iOS and Android**.




