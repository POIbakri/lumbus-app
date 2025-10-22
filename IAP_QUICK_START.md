# Apple IAP Quick Start Guide (1700+ Plans)

## ⚡ TL;DR

With **1700+ plans**, you'll use a **price-tier system**:
- ✅ One Apple IAP product per **unique price** (not per plan)
- ✅ Likely only 20-50 products needed (not 1700!)
- ✅ Much faster setup, easier maintenance
- ✅ Mobile app already supports this approach

---

## 🚀 Step-by-Step (30-60 minutes total)

### **Step 1: Find Your Unique Prices** (5 minutes)

Run this SQL on your database:

```sql
SELECT
  retail_price,
  COUNT(*) as plan_count,
  ROUND(retail_price * 100) as price_cents,
  'com.lumbus.app.esim.tier_' || ROUND(retail_price * 100) as product_id,
  '$' || retail_price as display_price
FROM plans
GROUP BY retail_price
ORDER BY retail_price;
```

**Example output:**
```
retail_price | plan_count | price_cents | product_id                     | display_price
-------------|------------|-------------|--------------------------------|---------------
1.50         | 45         | 150         | com.lumbus.app.esim.tier_150   | $1.50
2.99         | 78         | 299         | com.lumbus.app.esim.tier_299   | $2.99
4.99         | 234        | 499         | com.lumbus.app.esim.tier_499   | $4.99
9.99         | 187        | 999         | com.lumbus.app.esim.tier_999   | $9.99
...
(probably 20-50 unique prices total)
```

**✅ Action**: Save this output as a CSV or spreadsheet

---

### **Step 2: Create IAP Products in App Store Connect** (20-40 minutes)

For **each unique price** from Step 1:

1. Go to: https://appstoreconnect.apple.com
2. Select: Your App → **Features** → **In-App Purchases**
3. Click: **+ (Create In-App Purchase)**
4. Select: **Consumable**
5. Fill in:

```
Product ID: com.lumbus.app.esim.tier_{price_cents}
   Example: com.lumbus.app.esim.tier_499

Reference Name: eSIM Data Plan - ${price}
   Example: eSIM Data Plan - $4.99

Product Type: Consumable

Price:
   - Select the matching price tier
   - Or use custom pricing for exact match
   - Example: $4.99 = Tier 5

Localization (English - U.S.):
   Display Name: eSIM Data ${price}
      Example: eSIM Data $4.99

   Description:
      "High-speed eSIM data plan. Specific plan details (region, data amount, validity) are shown in the app before purchase. Works in 150+ countries worldwide."
```

6. Click **Save**

**⏱️ Time**: 2-3 minutes per product

**💡 Tip**: Open App Store Connect in multiple browser tabs to speed this up

---

### **Step 3: Get Apple Shared Secret** (2 minutes)

1. Go to: App Store Connect → Your App → **General**
2. Scroll to: **App Information**
3. Find: **App-Specific Shared Secret**
4. Click: **Generate** (if not exists)
5. Copy the secret

**✅ Action**: Add to backend `.env` file:
```bash
APPLE_IAP_SHARED_SECRET=your_secret_here
```

---

### **Step 4: Implement Backend Endpoints** (30-60 minutes)

See **BACKEND_IAP_IMPLEMENTATION.md** for full code.

#### **Endpoint 1: POST /api/checkout/iap**

```typescript
function generateAppleProductId(plan: Plan): string {
  const priceInCents = Math.round(plan.retail_price * 100);
  return `com.lumbus.app.esim.tier_${priceInCents}`;
}

// Handler
const plan = await db.plans.findById(planId);
const productId = generateAppleProductId(plan);
const order = await db.orders.create({ /* ... */ });

res.json({ orderId: order.id, productId });
```

#### **Endpoint 2: POST /api/iap/validate-receipt**

```typescript
// Validate with Apple
const validationResult = await verifyReceiptWithApple(receipt);

// Update order
await db.orders.update(orderId, {
  status: 'paid',
  apple_transaction_id: transaction.transaction_id,
});

// Provision eSIM or add top-up data
if (order.is_top_up) {
  await addDataToExistingEsim(order.target_iccid, order.plan_id);
} else {
  await provisionNewEsim(orderId);
}
```

**📄 Full implementation**: See `BACKEND_IAP_IMPLEMENTATION.md`

---

### **Step 5: Test with Sandbox** (15 minutes)

1. **Create sandbox tester**:
   - App Store Connect → **Users and Access** → **Sandbox Testers**
   - Create test Apple ID (e.g., `test-lumbus@icloud.com`)

2. **Test on device**:
   - Sign out of production Apple ID
   - Install app via TestFlight or Xcode
   - Select a $4.99 plan
   - When prompted, sign in with sandbox account
   - Complete purchase
   - Verify: eSIM provisioned, order status = 'active'

3. **Test different prices**:
   - Test at least 3 different price tiers
   - Verify each uses correct product ID

4. **Test top-up**:
   - Create existing eSIM
   - Purchase top-up plan
   - Verify: Data added, no new eSIM created

---

## ✅ Checklist

### App Store Connect
- [ ] Ran SQL query to find unique prices
- [ ] Created IAP product for each unique price
- [ ] All products in "Ready to Submit" status
- [ ] Generated App-Specific Shared Secret
- [ ] Added secret to backend `.env`

### Backend
- [ ] Implemented `POST /api/checkout/iap` endpoint
- [ ] Implemented `POST /api/iap/validate-receipt` endpoint
- [ ] Deployed backend with new endpoints
- [ ] Verified `APPLE_IAP_SHARED_SECRET` environment variable set

### Testing
- [ ] Created sandbox tester account
- [ ] Tested regular purchase (new eSIM)
- [ ] Tested top-up (add data to existing eSIM)
- [ ] Tested at least 3 different price tiers
- [ ] Verified receipt validation works
- [ ] Verified eSIM provisioning works

### Mobile App
- [ ] No changes needed! (Already supports price tiers)
- [ ] Updated to latest code from this session
- [ ] Build iOS app with `eas build --platform ios`

---

## 🎯 Expected Results

### Before Implementation:
- ❌ iOS users can't purchase (no payment method)
- ❌ Android users use Stripe (works)

### After Implementation:
- ✅ iOS users use Apple IAP (seamless)
- ✅ Android users use Stripe (unchanged)
- ✅ All 1700+ plans work with just 20-50 IAP products
- ✅ New plans automatically work (if price exists)
- ✅ Top-ups add data to existing eSIMs

---

## 🔢 Example: How It Works

```
Your Database:
├─ Plan 1: "USA 1GB - 7 days" ($4.99)
├─ Plan 2: "USA 5GB - 30 days" ($19.99)
├─ Plan 3: "Europe 1GB - 7 days" ($4.99)
├─ Plan 4: "Europe 5GB - 30 days" ($19.99)
└─ ... 1696 more plans

Apple IAP Products (only 2 needed!):
├─ com.lumbus.app.esim.tier_499  → $4.99
└─ com.lumbus.app.esim.tier_1999 → $19.99

User Flow:
1. User selects "USA 1GB - 7 days" ($4.99)
2. Backend maps: $4.99 → tier_499
3. App requests: com.lumbus.app.esim.tier_499
4. Apple shows: "eSIM Data $4.99"
5. User pays $4.99 via Apple Pay
6. Backend provisions: USA 1GB eSIM
✅ Success!

Later:
1. User selects "Europe 1GB - 7 days" ($4.99)
2. Backend maps: $4.99 → tier_499 (SAME product!)
3. App requests: com.lumbus.app.esim.tier_499 (SAME!)
4. Apple shows: "eSIM Data $4.99" (SAME!)
5. User pays $4.99 via Apple Pay
6. Backend provisions: Europe 1GB eSIM (DIFFERENT!)
✅ Success!
```

**Key insight**: The IAP product represents the **price**, not the plan. Your app UI shows the actual plan details.

---

## 💡 Advantages of This Approach

| Aspect | Individual Products (1700) | Price Tiers (20-50) |
|--------|---------------------------|---------------------|
| Setup Time | Weeks | 1-2 hours |
| App Store Connect | Impossible to manage | Easy |
| Maintenance | Nightmare | Simple |
| Add New Plan | Create new product + wait for approval | Instant (if price exists) |
| Analytics | Per-plan | Per-price (still useful) |
| Apple Approval | Likely rejected | Standard |

---

## 🆘 Common Issues

### "Cannot find product" error
**Cause**: IAP product not created for this price tier
**Fix**: Check plan's `retail_price`, calculate `price * 100`, create product with ID `com.lumbus.app.esim.tier_{cents}`

### Receipt validation fails
**Cause**: Missing or wrong `APPLE_IAP_SHARED_SECRET`
**Fix**: Copy secret from App Store Connect, add to backend `.env`, redeploy

### Top-up creates new eSIM
**Cause**: Backend not checking `isTopUp` flag
**Fix**: In receipt validation, check `order.is_top_up`, route to `addDataToExistingEsim` for top-ups

### Price mismatch (user pays $4.99 but gets $9.99 plan)
**Cause**: Backend using wrong price for product ID
**Fix**: Ensure `generateAppleProductId` uses `plan.retail_price`, not a hardcoded value

---

## 📚 Next Steps After Testing

1. **Submit app for review**:
   - Include IAP products in submission
   - Provide sandbox test account in review notes
   - Explain eSIM provisioning process

2. **Monitor in production**:
   - Check App Store Connect → Sales and Trends
   - Track which price tiers sell most
   - Monitor receipt validation success rate

3. **Optimize pricing**:
   - Use Apple's pricing reports to see conversion by tier
   - Consider consolidating to fewer price points if needed
   - A/B test different price strategies

---

## 📞 Support

- **Apple IAP Issues**: https://developer.apple.com/support/in-app-purchase/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Sandbox Testing**: https://developer.apple.com/apple-pay/sandbox-testing/
- **Receipt Validation**: https://developer.apple.com/documentation/appstorereceipts

---

**Last Updated**: 2025-10-22
**Estimated Total Time**: 1-2 hours
**Difficulty**: Medium
**Mobile Status**: ✅ Complete (no changes needed)
**Backend Status**: ⏳ 2 endpoints + 1 helper function needed
