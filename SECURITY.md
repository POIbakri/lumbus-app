# Security & Authentication Guide

This document outlines the security measures and authentication flow in the Lumbus mobile app.

## 🔐 Environment Variables & Key Management

### Keys Are NOT Hardcoded
All sensitive keys are managed through environment variables via `app.config.ts` and accessed through `lib/config.ts`.

### Configuration Files

**app.config.ts** - Main configuration
```typescript
extra: {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
}
```

**lib/config.ts** - Config accessor with validation
```typescript
export const config = {
  supabaseUrl: extra.supabaseUrl as string,
  supabaseAnonKey: extra.supabaseAnonKey as string,
  stripePublishableKey: extra.stripePublishableKey as string,
  apiUrl: extra.apiUrl as string,
};
```

### Environment Setup

1. Copy `.env.example` to `.env` (this file is gitignored)
2. Fill in your credentials
3. Keys are loaded at build time via Expo

**Note**: While keys have default values in `app.config.ts` for development, production builds should use environment variables.

### What's Safe to Expose?

✅ **Client-Safe Keys** (these are in the app):
- Supabase Anon Key - Protected by Row Level Security (RLS)
- Stripe Publishable Key - Designed for client-side use
- API URL - Public endpoint

❌ **NEVER Exposed** (server-side only):
- Supabase Service Key
- Stripe Secret Key
- eSIM Access API credentials
- Admin passwords
- Database connection strings

## 🔒 Authentication Flow

### Initial App Launch

```
App Start
    ↓
index.tsx checks session
    ↓
┌─────────────┐
│ Has session?│
└──────┬──────┘
       │
    ┌──┴──┐
   Yes    No
    │      │
    ↓      ↓
 Browse  Login
 Plans   Screen
```

**File**: `app/index.tsx`
```typescript
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    router.replace('/(tabs)/browse');  // Authenticated
  } else {
    router.replace('/(auth)/login');   // Not authenticated
  }
}
```

### Authentication States

1. **Unauthenticated**: User is on login/signup screens
2. **Authenticated**: User can browse, view dashboard, purchase plans

### Protected Actions

#### ✅ No Authentication Required
- View plans (`/browse`)
- View plan details (`/plan/[id]`)

#### 🔐 Authentication Required
- **Purchase plan** - Checked in `app/plan/[id].tsx:34-39`
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    Alert.alert('Error', 'Please sign in to continue');
    router.push('/(auth)/login');
    return;
  }
  ```
- **View dashboard** - Tab is only accessible when authenticated
- **View order details** - Requires authentication via Supabase RLS
- **View eSIM installation** - Requires authentication via Supabase RLS

## 🛡️ Row Level Security (RLS)

All Supabase queries are protected by Row Level Security policies:

### Orders Table
```sql
-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Plans Table
```sql
-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT
  USING (is_active = true);
```

## 🔍 Security Checks

### 1. Client-Side Checks
- Authentication status before purchase
- User validation before API calls
- Session validation on app startup

### 2. Server-Side Checks (Backend)
- Payment Intent creation validates user exists
- Webhook handlers verify Stripe signatures
- Order endpoints check user ownership via RLS

### 3. API Security
All backend API calls:
- Require valid Supabase session (for authenticated endpoints)
- Validate request bodies with Zod schemas
- Use Stripe webhook secrets to verify events
- Check user ownership before returning data

## 🚦 Authentication Guards Summary

| Screen | Auth Required | Guard Location |
|--------|---------------|----------------|
| Login | No | N/A |
| Signup | No | N/A |
| Browse Plans | No | Public access |
| Plan Detail | No | Public access |
| **Purchase Plan** | **YES** | `app/plan/[id].tsx:34` |
| Dashboard | YES | Supabase RLS |
| eSIM Installation | YES | Supabase RLS |
| Account | YES | Tab navigation guard |

## 📱 Session Management

### Session Persistence
```typescript
// lib/supabase.ts
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,      // Persist across app restarts
    autoRefreshToken: true,      // Auto-refresh when expired
    persistSession: true,         // Keep user logged in
    detectSessionInUrl: false,   // Mobile-optimized
  },
});
```

### Session Lifecycle
1. **Login** → Session stored in AsyncStorage
2. **App Restart** → Session auto-loaded
3. **Token Expires** → Auto-refreshed
4. **Logout** → Session cleared

## 🔄 Passwordless Flow (New Users)

For new users created during checkout:

1. User enters email at checkout
2. Backend creates user WITHOUT password
3. Payment completes
4. Backend sends "Set up your account" email
5. User clicks link to set password
6. User can now log in to mobile app

**Backend**: `/app/api/checkout/route.ts:121-128`
```typescript
const { data: authData } = await supabase.auth.admin.createUser({
  email: email,
  email_confirm: false,
  user_metadata: {
    created_via: 'mobile_checkout',
    needs_password_setup: true
  }
});
```

## ⚠️ Security Best Practices

### ✅ DO
- Use environment variables for all keys
- Check authentication before sensitive operations
- Validate user sessions on each request
- Use HTTPS for all API calls
- Keep dependencies updated
- Use Supabase RLS for data access control

### ❌ DON'T
- Hardcode API keys in source code
- Store sensitive data in AsyncStorage
- Skip authentication checks
- Trust client-side data
- Expose server-side keys
- Commit .env files to git

## 🔧 Testing Security

### Test Authentication Flow
```bash
# 1. Start app
npx expo start

# 2. Should redirect to login (no session)
# 3. Sign up with new email
# 4. Should redirect to browse plans
# 5. Kill app and restart
# 6. Should stay logged in (session persisted)
# 7. Try to purchase plan
# 8. Should proceed (authenticated)
# 9. Sign out
# 10. Try to purchase plan
# 11. Should redirect to login
```

### Test RLS Policies
Try to access another user's orders:
```typescript
// Should return empty (RLS blocks access)
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('id', 'someone-elses-order-id');
```

## 🆘 Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public GitHub issue
2. Email: security@getlumbus.com (if available)
3. Provide details about the vulnerability
4. Wait for acknowledgment before public disclosure

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security](https://stripe.com/docs/security)
- [Expo Security Best Practices](https://docs.expo.dev/guides/security/)
