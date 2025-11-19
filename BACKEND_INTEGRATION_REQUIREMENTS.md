# Backend Integration Requirements

This document outlines the backend requirements to support the recent updates to the Lumbus mobile app, specifically for Social Authentication (Apple/Google) and Stripe Test Mode for reviewers.

## 1. Stripe Test Mode for Reviewers

To support Apple and Google reviewers using `apple@getlumbus.com` (or other test accounts) without compromising production data, the backend must dynamically switch Stripe modes.

### `POST /api/checkout`

**Request:**
Standard checkout payload (no changes required from app side).

**Response (Updated):**
The response **MUST** now optionally include `publishableKey` and `stripeMode`.

```json
{
  "clientSecret": "pi_3P...",       // Required: The PaymentIntent client secret
  "orderId": "12345...",            // Required: The internal order ID
  "publishableKey": "pk_test_...",  // Optional: Return ONLY if different from the default live key
  "stripeMode": "test"              // Optional: "test" or "live"
}
```

**Logic:**
1. Check the `email` in the request body.
2. If email matches a known reviewer account (e.g., `apple@getlumbus.com`):
   - Create the PaymentIntent using your **Stripe Test Secret Key**.
   - Return the **Stripe Test Publishable Key** in the `publishableKey` field.
3. Otherwise (default):
   - Create the PaymentIntent using your **Stripe Live Secret Key**.
   - Omit `publishableKey` OR return the **Stripe Live Publishable Key**.

---

## 2. Apple Sign In

The mobile app now sends a `nonce` (SHA-256 hash of a raw nonce) to Apple during the sign-in request.

### Supabase Configuration
Ensure your Supabase project is configured to verify the Apple ID token.
- **Provider:** Apple
- **Service ID:** `com.lumbus.app` (or your specific Service ID)
- **Secret Key:** Generated p8 file from Apple Developer Portal.

No custom backend endpoints are required for this; it is handled directly via Supabase Auth.

---

## 3. Google Sign In (PKCE Flow)

The app now uses the **PKCE Flow** (Proof Key for Code Exchange) for enhanced security.

### Supabase Configuration
- **Redirect URL:** Ensure `lumbus://auth/callback` is added to your **Redirect URLs** in the Supabase Dashboard (Authentication -> URL Configuration).
- **Provider:** Google
- **Client IDs:** Ensure you have configured both:
  - **iOS Client ID:** `...apps.googleusercontent.com`
  - **Web Client ID:** `...apps.googleusercontent.com` (used for Android/Expo)

**Note:** The app now handles the `code` exchange automatically. The backend does not need to manually exchange tokens, but it must respect the Supabase session created via the standard Auth API.

---

## Summary Checklist for Backend Team

- [ ] Update `POST /api/checkout` to return `publishableKey` for test accounts.
- [ ] Verify Supabase Redirect URLs include `lumbus://auth/callback`.
- [ ] Verify Supabase Apple Provider is active and configured.

