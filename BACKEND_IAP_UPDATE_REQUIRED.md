# Backend IAP Product ID Update Required

## Issue

Apple won't allow recreating the deleted product ID `com.lumbus.app.esim.tier_199`, so we need to use `com.lumbus.app.esim.tier_199_v2` instead.

**Only `tier_199` needs the `_v2` suffix. All other tiers use the original format.**

## Changes Required

### Backend API Update

You need to update your backend's `/checkout/iap` endpoint to add `_v2` suffix ONLY for `tier_199`.

### Example Code Change

**Before:**
```javascript
function generateProductId(price) {
  const cents = Math.round(price * 100);
  return `com.lumbus.app.esim.tier_${cents}`;
}
```

**After:**
```javascript
function generateProductId(price) {
  const cents = Math.round(price * 100);

  // Special case: tier_199 was deleted and needs _v2 suffix
  if (cents === 199) {
    return `com.lumbus.app.esim.tier_199_v2`;
  }

  // All other tiers use original format
  return `com.lumbus.app.esim.tier_${cents}`;
}
```

## Examples

| Price | Product ID | Notes |
|-------|-----------|-------|
| $1.99 | `com.lumbus.app.esim.tier_199_v2` | ⚠️ Uses `_v2` (deleted and recreated) |
| $2.99 | `com.lumbus.app.esim.tier_299` | ✅ Original format |
| $4.99 | `com.lumbus.app.esim.tier_499` | ✅ Original format |
| $99.99 | `com.lumbus.app.esim.tier_9999` | ✅ Original format |

## Files to Update

### 1. Backend Code
- **File**: Your backend's IAP checkout handler (e.g., `routes/checkout.js` or similar)
- **Function**: Product ID generation logic
- **Change**: Add `if (cents === 199)` check to return `tier_199_v2`

### 2. CSV Reference File (Already Updated)
- ✅ **File**: `/Users/bakripersonal/lumbus-mobile/apple_iap_products.csv`
- ✅ **Status**: Only `tier_199` has `_v2` suffix, all others use original format

## Mobile App Changes

**No changes needed!**

The mobile app receives the `productId` from your backend's `/checkout/iap` endpoint response:

```typescript
// lib/api.ts (line 473-503)
export async function createIAPCheckout(params: IAPCheckoutParams): Promise<IAPCheckoutResponse> {
  const response = await fetch(`${API_URL}/checkout/iap`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  const data = await response.json();
  // Mobile app uses whatever productId the backend returns
  return data; // { orderId: "...", productId: "com.lumbus.app.esim.tier_XXX_v2" }
}
```

The app doesn't generate product IDs - it just uses what the backend provides.

## Testing

After updating the backend:

1. **Test the `/checkout/iap` endpoint**:
   ```bash
   curl -X POST https://your-api.com/checkout/iap \
     -H "Content-Type: application/json" \
     -d '{
       "planId": "some-plan-id",
       "email": "test@example.com",
       "currency": "USD",
       "amount": 1.99
     }'
   ```

2. **Verify response includes `_v2`**:
   ```json
   {
     "orderId": "order_12345",
     "productId": "com.lumbus.app.esim.tier_199_v2"
   }
   ```

3. **Test in mobile app**:
   - Navigate to a plan detail page
   - Tap "Buy now"
   - Verify Apple Pay sheet shows correct product

## Apple Store Connect

When creating IAP products in App Store Connect:

- ⚠️ **For $1.99**: Use `com.lumbus.app.esim.tier_199_v2` (with `_v2` suffix)
- ✅ **For all others**: Use original format `com.lumbus.app.esim.tier_XXX` (no suffix)

Reference the updated CSV file: `apple_iap_products.csv`

## Rollout Plan

1. ✅ Update CSV reference file (DONE - only tier_199 has `_v2`)
2. ⏳ Update backend product ID generation (add special case for tier_199)
3. ⏳ Create all 124 IAP products in App Store Connect (only tier_199 needs `_v2`)
4. ⏳ Test purchases in sandbox
5. ⏳ Deploy to production

## Questions?

- **Q: Do I need to add `_v2` to all 124 products?**
  - A: No! Only `tier_199` needs `_v2`. All other products use the original format.

- **Q: Why only tier_199?**
  - A: Because it was accidentally deleted and Apple won't let us recreate it with the same ID.

- **Q: Will this affect existing customers?**
  - A: No, this is for new purchases only. eSIM data plans are consumable, not subscriptions.

- **Q: What if I accidentally delete another product?**
  - A: Just add a similar conditional in the backend for that price tier (e.g., `tier_299_v2`).

---

**Last Updated**: 2025-10-24
**Status**: Waiting for backend update
