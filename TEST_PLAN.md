# Test Plan - Lumbus Mobile App

## Build Status: ✅ PASSED

All TypeScript compilation checks passed. Only NativeWind className warnings present (expected, non-blocking).

---

## Test 1: Code Quality & Build Verification ✅

### TypeScript Compilation
- **Status**: ✅ PASSED
- **Details**: No functional errors, only expected NativeWind className warnings
- **Files Checked**:
  - `lib/currency.ts` - ✅ No errors
  - `hooks/useCurrency.ts` - ✅ No errors
  - `app/(tabs)/browse.tsx` - ✅ Currency integration correct
  - `app/plan/[id].tsx` - ✅ Currency integration correct
  - `/Users/bakripersonal/lumbus/app/api/checkout/route.ts` - ✅ Backend integration correct

### Import Verification
- ✅ All currency imports correct
- ✅ useCurrency hook properly imported
- ✅ convertMultiplePrices function used correctly
- ✅ displayPrice state implemented
- ✅ Backend accepts currency parameter

### API Endpoint Test
```bash
curl https://getlumbus.com/api/currency/detect
```
**Result**: ✅ PASSED
```json
{
  "country": "AE",
  "currency": "AED",
  "symbol": "AED",
  "name": "UAE Dirham"
}
```

---

## Test 2: Static Code Analysis ✅

### Browse Screen Checks
- ✅ `useCurrency` hook imported
- ✅ `convertMultiplePrices` function used
- ✅ `displayPrice` displayed in UI
- ✅ `useEffect` triggers price conversion
- ✅ Loading state includes currency loading
- ✅ Fallback to USD if conversion fails

### Plan Detail Screen Checks
- ✅ `useCurrency` hook imported
- ✅ Price conversion on mount
- ✅ Display price updates in UI
- ✅ Currency passed to checkout
- ✅ Buy button shows converted price
- ✅ Loading state includes currency loading

### Backend API Checks
- ✅ Currency schema validation (`z.string().optional()`)
- ✅ Currency destructured from request body
- ✅ `convertToStripeAmount` imported and used
- ✅ Currency passed to Stripe (`.toLowerCase()`)
- ✅ Handles 26+ currencies

---

## Test 3: Manual Testing Checklist 📱

### Prerequisites
- [ ] Expo app installed on physical iOS/Android device
- [ ] Backend API running (https://getlumbus.com)
- [ ] Test credit card ready (Stripe test mode: 4242 4242 4242 4242)
- [ ] VPN available for testing different countries (optional)

---

### 3.1 Currency Detection Tests

#### Test 3.1.1: Default Currency Detection
**Steps**:
1. Open app on device
2. Observe loading screen
3. Navigate to Browse Plans

**Expected**:
- [ ] Loading spinner shows briefly
- [ ] Plans display with currency for your location
- [ ] Example: UK shows £, Europe shows €, US shows $, Japan shows ¥

**Actual Result**: _________________

---

#### Test 3.1.2: Currency Symbol Verification
**Steps**:
1. On Browse Plans screen
2. Check each plan card

**Expected**:
- [ ] All prices show correct currency symbol
- [ ] Prices are converted (not just USD)
- [ ] Format is correct (e.g., £25.50, not $25.50)

**Actual Result**: _________________

---

#### Test 3.1.3: Plan Detail Currency
**Steps**:
1. Tap any plan card
2. View plan detail screen

**Expected**:
- [ ] Large price at top shows converted currency
- [ ] "Buy now for [currency]" button shows converted price
- [ ] Currency symbol matches browse screen

**Actual Result**: _________________

---

### 3.2 Authentication Flow Tests

#### Test 3.2.1: New User Signup
**Steps**:
1. Open app (fresh install)
2. Tap "Sign Up"
3. Enter email: `test+[timestamp]@example.com`
4. Enter password: `TestPassword123!`
5. Tap "Create Account"

**Expected**:
- [ ] Account created successfully
- [ ] Redirected to Browse Plans
- [ ] No additional login needed

**Actual Result**: _________________

---

#### Test 3.2.2: Existing User Login
**Steps**:
1. Open app
2. Enter existing email/password
3. Tap "Sign In"

**Expected**:
- [ ] Login successful
- [ ] Redirected to Browse Plans in < 1 second
- [ ] Session persists if app restarted

**Actual Result**: _________________

---

#### Test 3.2.3: Session Persistence
**Steps**:
1. Log in successfully
2. Close app completely
3. Reopen app

**Expected**:
- [ ] Still logged in
- [ ] No login screen shown
- [ ] Lands directly on Browse Plans

**Actual Result**: _________________

---

### 3.3 Browse & Search Tests

#### Test 3.3.1: Plan Loading
**Steps**:
1. Open Browse Plans tab
2. Wait for plans to load

**Expected**:
- [ ] Plans load within 500ms (cached)
- [ ] All plan cards show data, validity, region
- [ ] Prices show in local currency
- [ ] No flickering or reloading

**Actual Result**: _________________

---

#### Test 3.3.2: Search Functionality
**Steps**:
1. Tap search bar
2. Type "Japan"
3. Observe results

**Expected**:
- [ ] Results filter in real-time
- [ ] Only Japan plans shown
- [ ] Prices still in local currency
- [ ] Clear search shows all plans again

**Actual Result**: _________________

---

#### Test 3.3.3: Plan Card Navigation
**Steps**:
1. Scroll through plans
2. Tap any plan card
3. Go back

**Expected**:
- [ ] Navigation is instant (< 200ms)
- [ ] Plan detail loads quickly
- [ ] Back button returns to same scroll position
- [ ] No re-fetching of data

**Actual Result**: _________________

---

### 3.4 Purchase Flow Tests

#### Test 3.4.1: Checkout Initiation
**Steps**:
1. View any plan detail
2. Tap "Buy now for [price]"
3. Wait for Payment Sheet

**Expected**:
- [ ] Payment Sheet opens in < 2 seconds
- [ ] Shows correct price in local currency
- [ ] Apple Pay / Google Pay available
- [ ] Card entry form ready

**Actual Result**: _________________

---

#### Test 3.4.2: Payment Completion
**Steps**:
1. In Payment Sheet
2. Enter test card: 4242 4242 4242 4242
3. Enter any future date, any CVC
4. Tap "Pay"

**Expected**:
- [ ] Payment processes
- [ ] No success alert shown
- [ ] Directly navigates to Installation screen
- [ ] Shows "Provisioning your eSIM" state

**Actual Result**: _________________

---

#### Test 3.4.3: Multi-Currency Payment
**Steps**:
1. Note the currency shown in app (e.g., £25.50)
2. Complete purchase
3. Check Stripe dashboard

**Expected**:
- [ ] Stripe shows charge in correct currency (GBP, not USD)
- [ ] Amount matches what user saw
- [ ] No conversion surprises

**Actual Result**: _________________

---

### 3.5 Real-time Updates Tests

#### Test 3.5.1: Order Provisioning
**Steps**:
1. Complete payment
2. On Installation screen
3. Wait 1-2 minutes

**Expected**:
- [ ] Shows "Provisioning your eSIM" with spinner
- [ ] Status updates automatically (no refresh)
- [ ] Changes to "Completed" state
- [ ] QR code appears without manual refresh

**Actual Result**: _________________

---

#### Test 3.5.2: Dashboard Real-time
**Steps**:
1. Purchase an eSIM
2. Navigate to Dashboard (My eSIMs tab)
3. Watch order status

**Expected**:
- [ ] New order appears immediately
- [ ] Status badge shows "Processing" (blue)
- [ ] Updates to "Completed" (green) automatically
- [ ] Tap order to view installation details

**Actual Result**: _________________

---

### 3.6 Direct eSIM Installation Tests

#### Test 3.6.1: One-Tap Install (iOS)
**Steps**:
1. Complete purchase, reach Installation screen
2. Wait for eSIM to be ready (completed status)
3. Tap "Install eSIM Now" button
4. Read alert dialog

**Expected**:
- [ ] Alert shows "✓ Code Copied!"
- [ ] Instructions are clear and step-by-step
- [ ] Tap "Open Settings" opens Cellular settings
- [ ] LPA string is in clipboard

**Verification**:
5. In Settings → Cellular
6. Tap "Add eSIM"
7. Tap "Enter Details Manually"
8. Long press in field and tap "Paste"

**Expected**:
- [ ] LPA string pastes successfully
- [ ] Format: `LPA:1$[smdp]$[code]`
- [ ] eSIM begins installing

**Actual Result**: _________________

---

#### Test 3.6.2: One-Tap Install (Android)
**Steps**:
1. Complete purchase, reach Installation screen
2. Wait for eSIM to be ready
3. Tap "Install eSIM Now" button

**Expected**:
- [ ] Alert shows "✓ Code Copied!"
- [ ] Instructions mention "Network & Internet"
- [ ] Tap "Open Settings" opens Settings app
- [ ] LPA string is in clipboard

**Verification**:
5. Navigate to Network & Internet → Mobile Network
6. Find "Download a SIM" or "Add eSIM"
7. Choose manual entry option
8. Paste LPA string

**Expected**:
- [ ] LPA string pastes successfully
- [ ] eSIM begins installing

**Actual Result**: _________________

---

#### Test 3.6.3: QR Code Fallback
**Steps**:
1. On Installation screen
2. Scroll past "Install eSIM Now" button
3. View QR code section

**Expected**:
- [ ] QR code visible and scannable
- [ ] Clear instructions below QR code
- [ ] Can scan from device Settings
- [ ] QR code contains valid LPA string

**Actual Result**: _________________

---

#### Test 3.6.4: Manual Installation Details
**Steps**:
1. On Installation screen
2. Tap "Manual Installation Details"
3. View expanded section

**Expected**:
- [ ] Full LPA string visible
- [ ] SM-DP+ Address shown
- [ ] Activation Code shown
- [ ] ICCID shown (if available)
- [ ] APN shown (if available)
- [ ] Activate Before date shown (if available)
- [ ] All fields have copy buttons

**Test Copy Buttons**:
7. Tap copy icon next to Full LPA string
8. Check alert

**Expected**:
- [ ] Alert shows "Full activation code copied to clipboard"
- [ ] Can paste LPA string elsewhere

**Actual Result**: _________________

---

### 3.7 Error Handling Tests

#### Test 3.7.1: Network Error (Browse)
**Steps**:
1. Turn off WiFi and mobile data
2. Open Browse Plans

**Expected**:
- [ ] Error message appears
- [ ] Says "Failed to load plans"
- [ ] Suggests checking connection
- [ ] App doesn't crash

**Actual Result**: _________________

---

#### Test 3.7.2: Payment Cancellation
**Steps**:
1. Tap "Buy now"
2. Payment Sheet opens
3. Tap "X" to cancel

**Expected**:
- [ ] Payment Sheet closes
- [ ] No error alert shown
- [ ] Returns to plan detail
- [ ] Can try again

**Actual Result**: _________________

---

#### Test 3.7.3: Payment Declined
**Steps**:
1. Tap "Buy now"
2. Use declined test card: 4000 0000 0000 0002
3. Tap "Pay"

**Expected**:
- [ ] Shows "Payment Error" alert
- [ ] Error message is clear
- [ ] Can try again with different card
- [ ] No order created

**Actual Result**: _________________

---

#### Test 3.7.4: Invalid Order ID
**Steps**:
1. Navigate to: `/install/invalid-uuid`

**Expected**:
- [ ] Shows "Order not found" error
- [ ] Icon and clear message
- [ ] Can navigate back
- [ ] App doesn't crash

**Actual Result**: _________________

---

### 3.8 Performance Tests

#### Test 3.8.1: App Launch Speed
**Steps**:
1. Force quit app
2. Reopen app (logged in)
3. Time until Browse Plans visible

**Expected**:
- [ ] < 1 second to main screen
- [ ] No long splash screen
- [ ] Plans visible immediately (cached)

**Actual Time**: _________ seconds

---

#### Test 3.8.2: Navigation Speed
**Steps**:
1. On Browse Plans
2. Tap plan card
3. Note transition time

**Expected**:
- [ ] < 200ms transition
- [ ] No loading spinner
- [ ] Instant plan detail view

**Actual Time**: _________ milliseconds

---

#### Test 3.8.3: Purchase Flow Speed
**Steps**:
1. Tap "Buy now"
2. Time until Payment Sheet opens

**Expected**:
- [ ] < 2 seconds total
- [ ] No delays or stuttering
- [ ] Single API call

**Actual Time**: _________ seconds

---

#### Test 3.8.4: API Call Reduction
**Steps**:
1. Open Browse Plans (first time)
2. Navigate to plan detail
3. Go back to Browse Plans
4. Check network tab (if available)

**Expected**:
- [ ] First load: 1 API call (plans)
- [ ] Plan detail: 0 API calls (uses cache)
- [ ] Return to browse: 0 API calls (still cached)
- [ ] Total: 1 API call for entire flow

**Actual Calls**: _________________

---

### 3.9 Currency Conversion Tests (VPN Required)

#### Test 3.9.1: UK Currency (GBP)
**Steps**:
1. Connect VPN to UK
2. Fresh app launch
3. View Browse Plans

**Expected**:
- [ ] All prices show £ symbol
- [ ] Example: $10 USD = £7.90 GBP
- [ ] Buy button shows "Buy now for £X.XX"

**Actual Result**: _________________

---

#### Test 3.9.2: Europe Currency (EUR)
**Steps**:
1. Connect VPN to Germany/France
2. Fresh app launch
3. View Browse Plans

**Expected**:
- [ ] All prices show € symbol
- [ ] Example: $10 USD = €9.20 EUR
- [ ] Buy button shows "Buy now for €X.XX"

**Actual Result**: _________________

---

#### Test 3.9.3: Japan Currency (JPY)
**Steps**:
1. Connect VPN to Japan
2. Fresh app launch
3. View Browse Plans

**Expected**:
- [ ] All prices show ¥ symbol
- [ ] No decimal places (JPY is zero-decimal)
- [ ] Example: $10 USD = ¥1,495 JPY
- [ ] Format: ¥1,495 (with comma separator)

**Actual Result**: _________________

---

#### Test 3.9.4: Australia Currency (AUD)
**Steps**:
1. Connect VPN to Australia
2. Fresh app launch
3. View Browse Plans

**Expected**:
- [ ] All prices show A$ symbol
- [ ] Example: $10 USD = A$15.30 AUD
- [ ] Buy button shows "Buy now for A$X.XX"

**Actual Result**: _________________

---

### 3.10 Dashboard & History Tests

#### Test 3.10.1: Order History Display
**Steps**:
1. Complete at least 2 purchases
2. Navigate to "My eSIMs" tab
3. View order list

**Expected**:
- [ ] All orders visible
- [ ] Most recent at top
- [ ] Status badges correct colors:
  - Completed: Green
  - Processing: Blue
  - Failed: Red
- [ ] Plan details (region, data, validity) shown
- [ ] Created date displayed

**Actual Result**: _________________

---

#### Test 3.10.2: Pull to Refresh
**Steps**:
1. On Dashboard
2. Pull down from top
3. Release

**Expected**:
- [ ] Refresh indicator appears
- [ ] Orders reload
- [ ] Refresh indicator disappears
- [ ] New orders appear if any

**Actual Result**: _________________

---

#### Test 3.10.3: Empty State
**Steps**:
1. New account with no orders
2. Navigate to Dashboard

**Expected**:
- [ ] Icon showing no orders
- [ ] Message: "No eSIMs yet"
- [ ] Description text helpful
- [ ] "Browse Plans" button visible
- [ ] Tapping button goes to Browse Plans

**Actual Result**: _________________

---

### 3.11 Account Management Tests

#### Test 3.11.1: Account Tab Display
**Steps**:
1. Navigate to Account tab

**Expected**:
- [ ] User email displayed
- [ ] Logout button visible
- [ ] Settings/preferences (if any)
- [ ] Clean, organized layout

**Actual Result**: _________________

---

#### Test 3.11.2: Logout
**Steps**:
1. On Account tab
2. Tap "Sign Out"
3. Confirm logout

**Expected**:
- [ ] Logged out successfully
- [ ] Redirected to login screen
- [ ] Session cleared
- [ ] Cannot access tabs without login

**Actual Result**: _________________

---

### 3.12 Edge Cases & Stress Tests

#### Test 3.12.1: Multiple Rapid Purchases
**Steps**:
1. Buy plan A
2. Immediately buy plan B (before A completes)
3. Buy plan C

**Expected**:
- [ ] All 3 orders created
- [ ] No race conditions
- [ ] All show in Dashboard
- [ ] Each has unique order ID
- [ ] All provision correctly

**Actual Result**: _________________

---

#### Test 3.12.2: App Backgrounding During Payment
**Steps**:
1. Tap "Buy now"
2. Payment Sheet opens
3. Home button (background app)
4. Wait 30 seconds
5. Return to app

**Expected**:
- [ ] Payment Sheet still open
- [ ] Can complete payment
- [ ] No crash or freeze
- [ ] Order processes normally

**Actual Result**: _________________

---

#### Test 3.12.3: Network Switch During Operation
**Steps**:
1. On WiFi
2. Start browsing plans
3. Switch to mobile data
4. Continue using app

**Expected**:
- [ ] Seamless transition
- [ ] No errors
- [ ] API calls continue working
- [ ] No crashes

**Actual Result**: _________________

---

#### Test 3.12.4: Very Long Plan Names
**Steps**:
1. Browse plans with long names
2. View plan cards

**Expected**:
- [ ] Text doesn't overflow
- [ ] Truncation handles gracefully
- [ ] Layout doesn't break
- [ ] Still readable

**Actual Result**: _________________

---

## Test Summary

### Pass/Fail Criteria
- ✅ **PASS**: All critical tests (3.1-3.6) must pass
- ⚠️ **WARNING**: Minor UI issues acceptable, major functionality must work
- ❌ **FAIL**: Any crash, payment failure, or data loss

### Test Execution Date
Date: _________________

### Device Information
- Device Model: _________________
- OS Version: _________________
- App Version: _________________

### Test Results Summary

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Currency Detection | 4 | ___ | ___ | |
| Authentication | 3 | ___ | ___ | |
| Browse & Search | 3 | ___ | ___ | |
| Purchase Flow | 3 | ___ | ___ | |
| Real-time Updates | 2 | ___ | ___ | |
| eSIM Installation | 4 | ___ | ___ | |
| Error Handling | 4 | ___ | ___ | |
| Performance | 4 | ___ | ___ | |
| Currency Conversion | 4 | ___ | ___ | |
| Dashboard | 3 | ___ | ___ | |
| Account Management | 2 | ___ | ___ | |
| Edge Cases | 4 | ___ | ___ | |

**Total**: ___/40 tests passed

---

## Known Issues

### Non-Critical
1. TypeScript className warnings (NativeWind) - **Expected, not a bug**
2. Development environment may default to USD - **Production will detect correctly**

### To Monitor
1. Currency API response time (should be < 500ms)
2. Stripe Payment Intent creation time (should be < 2s)
3. Real-time subscription latency (should be < 500ms)

---

## Sign-Off

Tester Name: _________________
Signature: _________________
Date: _________________

**Approval**: [ ] Ready for Production [ ] Needs Fixes

---

## Next Steps After Testing

If all tests pass:
1. ✅ Create production build with EAS
2. ✅ Submit to App Store / Play Store
3. ✅ Set up monitoring (Sentry, analytics)
4. ✅ Deploy to production

If tests fail:
1. ❌ Document failed tests
2. ❌ Create bug tickets
3. ❌ Fix issues
4. ❌ Re-test
