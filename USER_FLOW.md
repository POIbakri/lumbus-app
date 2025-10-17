# Lumbus Mobile App - User Flow

Complete user flow documentation for the Lumbus mobile app with optimizations for speed and efficiency.

## 🔐 Authentication-First Approach

**Rule**: Users MUST be logged in to access the app.

### First Launch Flow
```
App Opens
    ↓
Check Session
    ↓
No Session Found
    ↓
→ LOGIN SCREEN ←
```

Users cannot browse or view plans without being logged in. This ensures:
- Better tracking of user behavior
- Faster checkout (no need to check auth)
- Personalized experience from the start
- Simple, secure architecture

## 📱 Complete User Journey

### 1. New User Flow

```
Download App
    ↓
Open App → No Session
    ↓
Shown Login Screen
    ↓
Tap "Sign Up"
    ↓
Enter Email + Password
    ↓
Account Created
    ↓
→ BROWSE PLANS ←
(User is now fully authenticated)
```

**Optimizations**:
- ✅ Instant validation on signup
- ✅ No email verification required (faster onboarding)
- ✅ Session persists across app restarts
- ✅ No additional login step needed

### 2. Returning User Flow

```
Open App
    ↓
Session Found (AsyncStorage)
    ↓
Auto-Login
    ↓
→ BROWSE PLANS ←
(< 1 second)
```

**Optimizations**:
- ✅ Session cached locally
- ✅ Auto-refresh token
- ✅ No loading screen for valid sessions
- ✅ Instant access to app

### 3. Browse & Purchase Flow

```
Browse Plans Tab
    ↓
[Plans cached for 5min]
    ↓
Tap Plan Card
    ↓
View Plan Details
    ↓
Tap "Buy Now"
    ↓
[Already authenticated - no check needed]
    ↓
Payment Sheet Opens
(1 API call only)
    ↓
User Enters Card
    ↓
Payment Processes
    ↓
→ INSTALLATION SCREEN ←
(No confirmation dialog)
```

**Optimizations**:
- ✅ Plans cached for 5 minutes (reduces API calls)
- ✅ Single API call for checkout (Payment Intent + Order)
- ✅ No auth popup (already logged in)
- ✅ Direct navigation to installation (no alert)
- ✅ Real-time order updates via Supabase subscription

### 4. Post-Purchase Flow

```
Payment Complete
    ↓
Immediate Redirect to Installation Screen
    ↓
[Real-time order status updates]
    ↓
┌─────────────────┐
│ Order Status:   │
│ → Provisioning  │ ← Backend processing eSIM
└─────────────────┘
    ↓ (1-2 minutes)
┌─────────────────┐
│ Order Status:   │
│ → Completed     │ ← eSIM ready!
└─────────────────┘
    ↓
QR Code Displayed
    ↓
Manual Details Available
    ↓
User Installs eSIM
```

**Optimizations**:
- ✅ Real-time updates (no polling)
- ✅ Supabase subscription auto-updates UI
- ✅ No manual refresh needed
- ✅ Instant QR code display when ready

## ⚡ Performance Optimizations

### API Call Optimization

**Before**: Multiple API calls per action
```
Browse Plans: Fetch plans
View Plan: Fetch plan again
Checkout: Check auth, create order, create payment
```

**After**: Minimal API calls with caching
```
Browse Plans: Fetch once, cache 5min
View Plan: Use cached data
Checkout: Single API call (creates order + payment intent)
```

### Caching Strategy

| Data | Cache Duration | Refetch Trigger |
|------|----------------|-----------------|
| Plans | 5 minutes | Manual refresh only |
| Orders | 30 seconds | Pull-to-refresh or navigation |
| User Session | Persistent | Logout only |
| Order Detail | Real-time | Supabase subscription |

### Loading States

All screens have optimized loading states:
- ✅ Skeleton loaders (not just spinners)
- ✅ Instant navigation (no delays)
- ✅ Background data fetching
- ✅ Cached data shown immediately

## 🎯 User Experience Highlights

### Speed Improvements

1. **App Launch**: < 1 second to main screen (if logged in)
2. **Browse Plans**: Instant (cached)
3. **View Plan**: Instant (no new fetch)
4. **Checkout**: 2-3 seconds (Payment Sheet)
5. **Payment**: 3-5 seconds (Stripe processing)
6. **Installation Screen**: Instant navigation

### UX Improvements

1. **No Unnecessary Alerts**
   - ❌ Old: "Payment Successful! [OK]" alert
   - ✅ New: Direct navigation to installation screen

2. **No Auth Popups**
   - ❌ Old: "Please sign in" → redirect to login
   - ✅ New: Already logged in, seamless purchase

3. **Real-time Updates**
   - ❌ Old: Manual refresh to check order status
   - ✅ New: Auto-updates via Supabase subscription

4. **Smart Caching**
   - ❌ Old: Fetch plans every time
   - ✅ New: Cache for 5 minutes, instant display

## 📊 User Flow Diagram

### Complete Journey

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION GATE                     │
│                                                              │
│  App Launch → Check Session → No? → LOGIN REQUIRED          │
│                              → Yes? → Continue ↓             │
└─────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            New User (Signup)            Existing User (Auto-Login)
                    │                               │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                         MAIN APP                             │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Browse    │  │  Dashboard  │  │   Account   │        │
│  │   Plans     │  │  (Orders)   │  │  (Profile)  │        │
│  └──────┬──────┘  └─────────────┘  └─────────────┘        │
│         │                                                   │
│         ↓ (Tap plan)                                        │
│  ┌─────────────┐                                            │
│  │ Plan Detail │                                            │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ↓ (Tap "Buy Now")                                   │
│  ┌─────────────┐                                            │
│  │   Payment   │ ← Single API Call                          │
│  │    Sheet    │   Fast & Efficient                         │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ↓ (Payment Success)                                 │
│  ┌─────────────┐                                            │
│  │ Installation│ ← Real-time Updates                        │
│  │   Screen    │   Supabase Subscription                    │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Technical Optimizations

### 1. Authentication Optimization
```typescript
// Auth guard at tabs layout level
// Runs once when accessing tabs, not per screen
useEffect(() => {
  checkAuth(); // Single check for entire tab navigation
}, []);
```

### 2. Query Caching
```typescript
// Plans cached for 5 minutes
useQuery({
  queryKey: ['plans'],
  queryFn: fetchPlans,
  staleTime: 300000, // Don't refetch unless stale
});

// Orders cached for 30 seconds
useQuery({
  queryKey: ['orders', userId],
  queryFn: () => fetchUserOrders(userId),
  staleTime: 30000, // Shorter cache for dynamic data
});
```

### 3. Optimistic Navigation
```typescript
// Navigate immediately after payment
// Don't wait for confirmation alert
router.replace(`/install/${orderId}`);
```

### 4. Real-time Subscriptions
```typescript
// No polling - instant updates
supabase
  .channel(`order:${orderId}`)
  .on('postgres_changes', callback)
  .subscribe();
```

## 🎨 UI/UX Flow States

### Loading States
1. **Initial Load**: Full-screen spinner
2. **Data Fetching**: Skeleton loader
3. **Payment Processing**: Payment Sheet loading
4. **Navigation**: Instant (no loading)

### Error States
1. **Network Error**: Retry button + error message
2. **Payment Error**: Alert with clear message
3. **Session Expired**: Redirect to login

### Success States
1. **Payment Success**: Direct navigation (no alert)
2. **eSIM Ready**: QR code displayed
3. **Refresh Complete**: Pull indicator

## 📈 Performance Metrics

Target metrics for optimal UX:

| Action | Target Time | Optimization |
|--------|-------------|--------------|
| App Launch | < 1s | Session caching |
| Browse Plans | < 500ms | Data caching |
| View Plan | < 200ms | No API call |
| Start Checkout | < 2s | Single API call |
| Payment Sheet | < 1s | Pre-initialized |
| Post-Payment Nav | < 200ms | Immediate redirect |
| Real-time Update | < 500ms | Supabase subscription |

## ✅ User Flow Checklist

Before releasing, verify:
- [ ] New users can sign up in < 30 seconds
- [ ] Returning users auto-login in < 1 second
- [ ] Plans load instantly from cache
- [ ] Purchase requires only 2 taps (Buy → Confirm payment)
- [ ] No unnecessary confirmation dialogs
- [ ] Real-time order updates work
- [ ] QR code displays immediately when ready
- [ ] Pull-to-refresh works on dashboard
- [ ] Session persists across app restarts
- [ ] Error states are clear and actionable

## 🎯 Summary

The optimized user flow:
1. **Authentication-first** - Users log in once, stay logged in
2. **Fast API calls** - Single API call for checkout
3. **Smart caching** - Plans cached 5min, orders 30s
4. **Real-time updates** - No polling, instant notifications
5. **Seamless navigation** - No unnecessary alerts or delays
6. **Optimized performance** - < 1s for most actions

Result: **Simple, fast, efficient mobile app experience**
