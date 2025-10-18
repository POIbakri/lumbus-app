# API Compatibility Report

## Summary

This report documents the compatibility between the Lumbus mobile app and the backend API, including endpoint mappings, authentication requirements, and missing endpoints that need to be implemented.

---

## ✅ Fixed Issues

### 1. Authentication Headers Missing
**Problem:** API calls were not including Bearer authentication tokens required by the backend.

**Fix:** Added `getAuthHeaders()` helper function that:
- Retrieves current session from Supabase
- Automatically includes `Authorization: Bearer {token}` header
- Applied to all API calls

### 2. Usage Endpoint Mismatch
**Problem:** Mobile app was calling `/usage/${orderId}` but API documentation specifies `/orders/${orderId}/usage`

**Fix:** Updated `fetchUsageData()` in `lib/api.ts:197` to use correct endpoint:
```typescript
const response = await fetch(`${API_URL}/orders/${orderId}/usage`, {
  method: 'GET',
  headers,
});
```

### 3. Direct Supabase Queries
**Problem:** Mobile app was querying Supabase directly instead of using backend API endpoints.

**Fix:** Updated all data fetching functions to:
1. **Primary**: Call backend API with authentication
2. **Fallback**: Use direct Supabase query if API fails (for development/offline resilience)

---

## 📊 API Endpoint Mapping

### Implemented & Working ✅

| Mobile App Function | Endpoint | Method | Auth Required | Status |
|-------------------|----------|---------|---------------|--------|
| `fetchPlans()` | `/plans` | GET | Yes | ✅ Updated |
| `fetchPlanById(id)` | `/plans/${id}` | GET | Yes | ✅ Updated |
| `fetchOrderById(orderId)` | `/orders/${orderId}` | GET | Yes | ✅ Updated |
| `createCheckout(params)` | `/checkout` | POST | Yes | ✅ Updated |
| `fetchUsageData(orderId)` | `/orders/${orderId}/usage` | GET | Yes | ✅ Fixed |

### Missing Backend Endpoints ⚠️

These endpoints are used by the mobile app but are **NOT YET IMPLEMENTED** in the backend:

| Mobile App Function | Expected Endpoint | Method | Auth Required | Purpose | Priority |
|-------------------|------------------|---------|---------------|---------|----------|
| `fetchUserOrders(userId)` | `/user/orders` | GET | Yes | Get all orders for logged-in user | **HIGH** |
| `savePushToken(userId, token)` | `/user/push-token` | POST/PUT | Yes | Register push notification token | **HIGH** |
| N/A | `/user/me` | GET | Yes | Get current user profile | MEDIUM |

---

## 🔴 Critical Missing Endpoints

### 1. `/user/orders` (HIGH PRIORITY)

**Current State:** App queries Supabase directly with fallback
**Required For:** Dashboard to display user's eSIM orders

**Expected Request:**
```http
GET /user/orders
Authorization: Bearer {token}
```

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "plan_id": "uuid",
    "status": "completed",
    "lpa_string": "LPA:1$...",
    "activation_code": "...",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "plan": {
      "id": "uuid",
      "name": "USA 5GB",
      "region_code": "US",
      "data_gb": 5,
      "validity_days": 30,
      "price": 1500
    }
  }
]
```

**Implementation Notes:**
- Must join with `plans` table to return plan details
- Filter by authenticated user's ID
- Order by `created_at DESC`

---

### 2. `/user/push-token` (HIGH PRIORITY)

**Current State:** App saves directly to Supabase `user_push_tokens` table
**Required For:** Push notifications for eSIM ready and usage alerts

**Expected Request:**
```http
POST /user/push-token
Authorization: Bearer {token}
Content-Type: application/json

{
  "push_token": "ExponentPushToken[xxxx]",
  "platform": "ios"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Push token saved successfully"
}
```

**Implementation Notes:**
- Upsert on `user_id` (one token per user)
- Store `push_token`, `platform` (ios/android), and `updated_at`
- Return success confirmation

**Database Table:**
```sql
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

### 3. `/user/me` (MEDIUM PRIORITY)

**Current State:** Not used yet, but recommended for future features
**Required For:** User profile, settings, account management

**Expected Request:**
```http
GET /user/me
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2025-01-01T00:00:00Z",
  "phone": "+1234567890",
  "preferred_currency": "USD"
}
```

---

## 📝 API Authentication

### Current Implementation

All API calls now include authentication headers:

```typescript
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}
```

### Backend Requirements

Backend must:
1. Validate JWT tokens from Supabase Auth
2. Extract `user_id` from token claims
3. Use `user_id` for filtering/authorization
4. Return 401 Unauthorized if token is invalid/missing

---

## 🔄 Fallback Strategy

To ensure the mobile app works during development and handles API failures gracefully, all API functions include a fallback to direct Supabase queries:

```typescript
export async function fetchPlans(): Promise<Plan[]> {
  try {
    // Try backend API first
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/plans`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    // Fallback to direct Supabase query
    const { data, error: supabaseError } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (supabaseError) throw supabaseError;
    return data || [];
  }
}
```

**Benefits:**
- ✅ App continues working even if backend is down
- ✅ Useful for local development without backend
- ✅ Graceful degradation in production
- ✅ Console logs help identify API issues

---

## 🧪 Testing Checklist

### API Endpoint Tests

- [ ] **GET /plans** - Returns all available eSIM plans
- [ ] **GET /plans/:id** - Returns specific plan details
- [ ] **GET /orders/:id** - Returns order with plan details
- [ ] **GET /orders/:id/usage** - Returns usage data
- [ ] **POST /checkout** - Creates payment intent and order
- [ ] **GET /user/orders** - Returns user's orders (MISSING - needs implementation)
- [ ] **POST /user/push-token** - Saves push token (MISSING - needs implementation)

### Authentication Tests

- [ ] All endpoints return 401 when no auth token provided
- [ ] All endpoints accept valid Supabase JWT token
- [ ] User can only access their own orders (authorization check)
- [ ] Invalid/expired tokens return 401

### Error Handling Tests

- [ ] 404 errors handled gracefully
- [ ] Network errors trigger Supabase fallback
- [ ] Invalid request bodies return 400 with error messages
- [ ] Server errors return 500 with error messages

---

## 🚀 Deployment Checklist

### Backend Requirements

1. **Implement Missing Endpoints:**
   - [ ] `GET /user/orders` - Fetch user's orders
   - [ ] `POST /user/push-token` - Save push notification token
   - [ ] `GET /user/me` - Get user profile (optional)

2. **Authentication:**
   - [ ] Validate Supabase JWT tokens
   - [ ] Extract user_id from token claims
   - [ ] Implement authorization checks

3. **Database:**
   - [ ] Create `user_push_tokens` table
   - [ ] Ensure `esim_usage` table exists
   - [ ] Set up proper indexes for performance

4. **Push Notifications:**
   - [ ] Install Expo Server SDK
   - [ ] Configure FCM (Android) and APNs (iOS)
   - [ ] Implement notification triggers (see `BACKEND_NOTIFICATIONS.md`)

### Mobile App

1. **Environment Variables:**
   - [ ] Set `EXPO_PUBLIC_API_URL` to production backend
   - [ ] Set `EXPO_PUBLIC_PROJECT_ID` with valid UUID from `eas build:configure`
   - [ ] Configure `GOOGLE_SERVICES_JSON` for Android

2. **Testing:**
   - [ ] Test all API endpoints with authentication
   - [ ] Verify fallback works when backend is unreachable
   - [ ] Test push notifications on physical devices
   - [ ] Verify usage tracking displays correctly

---

## 📦 Data Format Consistency

### Usage Data Interface

Mobile app expects:

```typescript
interface UsageData {
  orderId: string;
  dataUsed: number; // in MB
  dataTotal: number; // in MB
  dataRemaining: number; // in MB
  percentageUsed: number;
  lastUpdated: string;
}
```

Backend must return:
```json
{
  "orderId": "uuid",
  "dataUsed": 512,
  "dataTotal": 1024,
  "dataRemaining": 512,
  "percentageUsed": 50,
  "lastUpdated": "2025-01-15T10:30:00Z"
}
```

### Order Data Interface

Mobile app expects orders with plan details joined:

```typescript
interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'completed' | 'failed';
  lpa_string: string;
  activation_code: string;
  created_at: string;
  updated_at: string;
  plan: Plan;
}
```

---

## 🔍 Summary

### What's Working ✅

1. Authentication headers now included in all API calls
2. Usage endpoint corrected to `/orders/${orderId}/usage`
3. All API functions use backend endpoints with Supabase fallback
4. Proper error handling and logging

### What Needs Backend Implementation ⚠️

1. **HIGH PRIORITY:**
   - `GET /user/orders` - Dashboard requires this
   - `POST /user/push-token` - Push notifications require this

2. **MEDIUM PRIORITY:**
   - `GET /user/me` - Future user profile features

### Recommendation

The mobile app is now fully compatible with the documented API. However, you must implement the two **HIGH PRIORITY** missing endpoints for the app to function correctly in production:

1. Implement `GET /user/orders` so users can see their eSIM orders on the dashboard
2. Implement `POST /user/push-token` so push notifications can be sent

Until these endpoints are implemented, the app will continue using direct Supabase queries as a fallback.

---

## 📞 Support

For questions about API integration:
1. Review this compatibility report
2. Check `BACKEND_NOTIFICATIONS.md` for push notification setup
3. Review `IMPLEMENTATION_SUMMARY.md` for feature overview
4. Check console logs for API error messages
