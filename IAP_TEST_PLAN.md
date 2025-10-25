# Apple IAP Testing Plan

## ✅ Code Review Summary

### Mobile Implementation Status: COMPLETE ✅

All IAP components are properly implemented:

1. **IAPService.ts** (lib/payments/IAPService.ts:1-293)
   - ✅ Connects to App Store
   - ✅ Fetches products by SKU
   - ✅ Handles purchase flow
   - ✅ Validates receipts with backend
   - ✅ Manages purchase listeners
   - ✅ Error handling for all scenarios

2. **API Integration** (lib/api.ts:457-568)
   - ✅ `createIAPCheckout()` - Creates order and returns product ID
   - ✅ `validateAppleReceipt()` - Validates receipt with backend
   - ✅ Proper timeout handling (30s)
   - ✅ Error handling and logging

3. **PaymentService.ts** (lib/payments/PaymentService.ts:1-146)
   - ✅ Platform detection (iOS → IAP, Android → Stripe)
   - ✅ Unified purchase API
   - ✅ Initialization and cleanup

4. **Plan Detail Screen** (app/plan/[id].tsx:78-135)
   - ✅ Initializes PaymentService on mount
   - ✅ Calls `PaymentService.purchase()`
   - ✅ Handles success/error states
   - ✅ Shows Apple Pay icon for iOS
   - ✅ Navigates to install screen on success

---

## 🧪 Testing Checklist

### Prerequisites ✅
- [ ] 124 IAP products created in App Store Connect (use apple_iap_products.csv)
- [ ] All products in "Ready to Submit" status
- [ ] Backend `/api/checkout/iap` endpoint implemented
- [ ] Backend `/api/iap/validate-receipt` endpoint implemented
- [ ] Apple Shared Secret added to backend `.env`
- [ ] Sandbox tester account created

---

## Test Suite 1: Basic IAP Flow

### Test 1.1: Product Fetching
**Goal**: Verify products load from App Store

**Steps**:
1. Open app on iOS device/simulator
2. Navigate to a plan (e.g., $4.99 plan)
3. Check logs for: "✅ Connected to App Store"

**Expected Result**:
- App Store connection succeeds
- No "ITEM_UNAVAILABLE" errors

**Pass/Fail**: [ ]

---

### Test 1.2: Checkout Initiation
**Goal**: Verify order creation and product ID mapping

**Steps**:
1. Select a $4.99 plan
2. Tap "Buy now"
3. Check logs for:
   - "🔄 Creating IAP checkout..."
   - Product ID returned: `com.lumbus.app.esim.tier_499`

**Expected Result**:
```
🔄 Creating IAP checkout...
Product ID: com.lumbus.app.esim.tier_499
Order ID: abc-123-def
```

**Pass/Fail**: [ ]

---

### Test 1.3: Apple Payment Sheet
**Goal**: Verify Apple's native payment UI appears

**Steps**:
1. Continue from Test 1.2
2. Apple payment sheet should appear
3. Should show price as $4.99
4. Should show "eSIM Data $4.99" as product name

**Expected Result**:
- Apple Pay / Card options visible
- Correct price displayed
- Face ID / Touch ID authentication prompt

**Pass/Fail**: [ ]

---

### Test 1.4: Purchase Completion
**Goal**: Verify successful purchase flow

**Steps**:
1. Complete payment with sandbox account
2. Wait for receipt validation
3. Check logs for:
   - "✅ Purchase update received"
   - "🔄 Verifying receipt with backend..."
   - "✅ Receipt validated successfully"
   - "✅ Transaction finished"

**Expected Result**:
- Receipt validated
- Order status changed to "paid" or "active"
- eSIM provisioned
- Navigate to `/install/[orderId]`

**Pass/Fail**: [ ]

---

## Test Suite 2: Price Tier System

### Test 2.1: Multiple Plans Same Price
**Goal**: Verify different plans with same price use same product ID

**Test Plans**:
- Plan A: "USA 1GB 7 Days" ($4.99)
- Plan B: "Europe 2GB 14 Days" ($4.99)
- Plan C: "Asia 500MB 3 Days" ($4.99)

**Steps**:
1. Purchase Plan A → Check product ID = `tier_499`
2. Purchase Plan B → Check product ID = `tier_499`
3. Purchase Plan C → Check product ID = `tier_499`

**Expected Result**:
- All three use same Apple product
- Each creates different order with correct plan details
- Correct eSIM provisioned for each region

**Pass/Fail**: [ ]

---

### Test 2.2: Different Price Tiers
**Goal**: Verify correct product ID mapping for different prices

**Test Plans**:
- Plan 1: $1.99 → `tier_199`
- Plan 2: $9.99 → `tier_999`
- Plan 3: $19.99 → `tier_1999`

**Steps**:
1. Purchase each plan
2. Verify correct product ID used
3. Verify correct amount charged

**Expected Result**:
- Correct product ID for each price
- User charged correct amount
- Order reflects correct plan details

**Pass/Fail**: [ ]

---

## Test Suite 3: Currency Handling

### Test 3.1: Auto Currency Conversion
**Goal**: Verify Apple handles currency conversion

**Steps**:
1. Change device region to UK
2. Select a $4.99 plan
3. Check Apple payment sheet

**Expected Result**:
- Price shows as £4.99 (or Apple's UK equivalent)
- Backend still receives USD price
- Order created with correct plan

**Pass/Fail**: [ ]

---

### Test 3.2: Multiple Currencies
**Goal**: Test various regions

**Regions to Test**:
- [ ] US → USD $4.99
- [ ] UK → GBP £4.99
- [ ] EU → EUR €4.99
- [ ] Japan → JPY ¥700 (approximate)

**Expected Result**:
- Each region shows localized price
- All purchases process correctly
- Backend receives consistent data

**Pass/Fail**: [ ]

---

## Test Suite 4: Error Handling

### Test 4.1: User Cancellation
**Goal**: Verify graceful handling of cancelled purchases

**Steps**:
1. Start checkout
2. Cancel Apple payment sheet
3. Check user feedback

**Expected Result**:
- No error alert shown (cancellation is normal)
- Log: "ℹ️ User cancelled purchase"
- Can retry purchase
- No incomplete order created

**Pass/Fail**: [ ]

---

### Test 4.2: Network Error
**Goal**: Verify network error handling

**Steps**:
1. Disable internet
2. Attempt purchase
3. Check error message

**Expected Result**:
- Clear error message: "Network error. Please check your connection and try again."
- Order not created or marked as failed
- Can retry when network restored

**Pass/Fail**: [ ]

---

### Test 4.3: Product Not Found
**Goal**: Handle missing IAP products

**Steps**:
1. Create a plan with price $49.99 (no matching IAP product)
2. Attempt to purchase
3. Check error handling

**Expected Result**:
- Error: "This item is currently unavailable. Please try again later."
- Log: "❌ Failed to fetch products" or "ITEM_UNAVAILABLE"
- User informed clearly

**Pass/Fail**: [ ]

---

### Test 4.4: Receipt Validation Failure
**Goal**: Handle backend validation errors

**Steps**:
1. Mock backend validation failure (if possible)
2. Complete Apple purchase
3. Check error handling

**Expected Result**:
- Transaction NOT finished (can retry)
- User informed of issue
- Order remains in "pending" state
- Can contact support with order ID

**Pass/Fail**: [ ]

---

## Test Suite 5: Top-Up Purchases

### Test 5.1: Top-Up Existing eSIM
**Goal**: Verify data added to existing eSIM

**Steps**:
1. Create order with existing eSIM (ICCID: 123456)
2. Purchase $9.99 top-up plan
3. Verify:
   - `isTopUp: true` sent to backend
   - `iccid: "123456"` sent to backend
   - Data added to existing eSIM (no new eSIM created)

**Expected Result**:
- Order marked as top-up
- Data added to ICCID 123456
- `data_remaining_bytes` increased
- No new eSIM provisioned

**Pass/Fail**: [ ]

---

## Test Suite 6: Edge Cases

### Test 6.1: Rapid Double Purchase
**Goal**: Prevent duplicate purchases

**Steps**:
1. Tap "Buy now" button rapidly twice
2. Check if two orders created

**Expected Result**:
- Loading state prevents second tap
- Only one order created
- Only one Apple purchase initiated

**Pass/Fail**: [ ]

---

### Test 6.2: Background/Foreground
**Goal**: Handle app state changes during purchase

**Steps**:
1. Start purchase
2. Background app (home button)
3. Return to app
4. Complete purchase

**Expected Result**:
- Purchase completes successfully
- Receipt validated
- User navigated to correct screen

**Pass/Fail**: [ ]

---

### Test 6.3: Session Expiry
**Goal**: Handle expired auth sessions

**Steps**:
1. Start app
2. Wait for session to expire (or force logout)
3. Attempt purchase

**Expected Result**:
- Alert: "Session Expired. Please log in again to continue."
- Redirect to login screen
- No incomplete order

**Pass/Fail**: [ ]

---

## Test Suite 7: Sandbox Testing

### Test 7.1: Sandbox Account Setup
**Steps**:
1. Create sandbox tester in App Store Connect
2. Sign out of production Apple ID on device
3. Start purchase
4. Sign in with sandbox account when prompted

**Expected Result**:
- Sandbox account works
- Test card charges $0.00
- Receipt validates against sandbox endpoint
- eSIM provisioned in test mode

**Pass/Fail**: [ ]

---

### Test 7.2: Sandbox Receipt Validation
**Goal**: Verify backend uses correct endpoint

**Steps**:
1. Make sandbox purchase
2. Check backend logs for endpoint used
3. Should auto-switch to sandbox on 21007 error

**Expected Result**:
- Backend tries production first
- Gets status 21007
- Retries with sandbox endpoint
- Validation succeeds

**Pass/Fail**: [ ]

---

## Test Suite 8: Integration Tests

### Test 8.1: Full Purchase to Install Flow
**Goal**: End-to-end happy path

**Steps**:
1. Browse plans
2. Select plan
3. Complete purchase
4. Verify redirect to install screen
5. Check order details displayed correctly
6. Verify QR code / activation code present

**Expected Result**:
- Seamless flow from browse → purchase → install
- All order details correct
- eSIM ready to install

**Pass/Fail**: [ ]

---

### Test 8.2: Backend Integration
**Goal**: Verify backend endpoints work correctly

**Manual API Tests**:

**Test POST /api/checkout/iap**:
```bash
curl -X POST https://your-api.com/api/checkout/iap \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan-abc-123",
    "email": "test@example.com",
    "currency": "USD",
    "amount": 4.99,
    "isTopUp": false
  }'
```

**Expected Response**:
```json
{
  "orderId": "order-def-456",
  "productId": "com.lumbus.app.esim.tier_499"
}
```

**Pass/Fail**: [ ]

---

**Test POST /api/iap/validate-receipt**:
```bash
curl -X POST https://your-api.com/api/iap/validate-receipt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receipt": "BASE64_RECEIPT_DATA",
    "orderId": "order-def-456"
  }'
```

**Expected Response**:
```json
{
  "valid": true,
  "orderId": "order-def-456",
  "transactionId": "1000000123456789",
  "status": "paid"
}
```

**Pass/Fail**: [ ]

---

## Performance Tests

### Test 9.1: Purchase Speed
**Goal**: Measure time from tap to success

**Steps**:
1. Time full purchase flow
2. Target: < 10 seconds

**Expected Result**:
- Checkout creation: < 2s
- Apple payment: 2-5s (user input)
- Receipt validation: < 3s
- Total: < 10s

**Pass/Fail**: [ ]

---

### Test 9.2: Product Load Time
**Goal**: Verify fast product fetching

**Steps**:
1. Open plan detail screen
2. Measure time to show price

**Expected Result**:
- Products load in < 2s
- No lag in UI

**Pass/Fail**: [ ]

---

## Security Tests

### Test 10.1: Receipt Validation Required
**Goal**: Ensure all purchases validated server-side

**Steps**:
1. Check code: Receipt must be validated before finishing transaction
2. Verify no client-side trust

**Verification**:
```typescript
// IAPService.ts:85-95
await validateAppleReceipt({ receipt, orderId });
if (validationResult.valid) {
  await finishTransaction({ purchase, isConsumable: true });
}
```

**Pass/Fail**: [ ]

---

### Test 10.2: Duplicate Receipt Prevention
**Goal**: Prevent same receipt used twice

**Steps**:
1. Complete purchase
2. Try to validate same receipt again

**Expected Result**:
- Backend returns error: "Receipt already used"
- No duplicate eSIM provisioned

**Pass/Fail**: [ ]

---

## Final Production Readiness Checklist

- [ ] All 124 IAP products created in App Store Connect
- [ ] All products approved by Apple
- [ ] Backend endpoints tested and working
- [ ] Apple Shared Secret configured
- [ ] Sandbox testing passed (all tests above)
- [ ] Production environment configured
- [ ] Error logging set up (e.g., Sentry)
- [ ] Support process for failed payments defined
- [ ] App Store review notes prepared
- [ ] Monitoring/alerts set up for payment failures

---

## Common Issues & Solutions

### Issue: "Product not found" (E_ITEM_UNAVAILABLE)
**Cause**: IAP product not created for price tier
**Solution**: Check price in cents (e.g., $4.99 = 499), create `com.lumbus.app.esim.tier_499`

### Issue: Receipt validation fails
**Cause**: Missing or wrong Apple Shared Secret
**Solution**: Get secret from App Store Connect → App Information, add to backend `.env`

### Issue: User pays but no eSIM
**Cause**: Receipt validation completed but provisioning failed
**Solution**:
- Check backend logs for provisioning errors
- Verify eSIM provider API is accessible
- Retry provisioning manually if needed
- Have support process for this scenario

### Issue: Sandbox receipts fail validation
**Cause**: Backend using production endpoint
**Solution**: Backend should handle status 21007 and retry with sandbox endpoint

---

## Quick Test Commands

### Test iOS Build
```bash
npx expo run:ios
```

### Test with Specific Device
```bash
npx expo run:ios --device "iPhone 15 Pro"
```

### Check Logs
```bash
npx expo start
# Then: Tap 'i' for iOS, watch console
```

### Build for TestFlight
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

**Last Updated**: 2025-10-24
**Status**: Ready for Testing
**Next Step**: Create sandbox tester and run Test Suite 1
