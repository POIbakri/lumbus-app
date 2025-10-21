# Security Audit Report - Lumbus Mobile App

**Date:** 2025-10-21
**Auditor:** Claude (AI Security Analyst)
**App Version:** 1.0.0
**Scope:** Full codebase security review

---

## Executive Summary

This security audit identified **1 CRITICAL issue**, **3 HIGH priority issues**, **2 MEDIUM priority issues**, and **4 LOW priority improvements**. The critical issue involves production secrets in a local file, which while gitignored, poses risks if the repository is shared or leaked. Several high-priority issues relate to password validation, error handling, and input sanitization.

**Overall Security Rating:** ⚠️ **MODERATE RISK** (requires immediate attention to critical and high-priority items)

---

## 🔴 CRITICAL Issues (Must Fix Immediately)

### 1. Production Secrets in .env File ⚠️

**Location:** `.env` (lines 3-8)

**Issue:**
The `.env` file contains **LIVE PRODUCTION SECRETS**:
- Live Supabase URL and anon key
- Live Stripe publishable key (`pk_live_...`)
- Production API URL

**Risk:**
- If repository is accidentally shared, cloned by contractors, or leaked, production secrets are exposed
- `.env` is gitignored but could be included in backups, screenshots, or shared accidentally
- Stripe publishable key is less sensitive but still identifies production account

**Evidence:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://qflokprwpxeynodcndbc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SIpVDHqtxSfzV1t...
```

**Recommendation:**
1. ✅ **VERIFIED**: `.env` is in `.gitignore` and was never committed to git history
2. ⚠️ **ACTION REQUIRED**: Replace `.env` with `.env.example` containing dummy values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   EXPO_PUBLIC_API_URL=https://your-api.com/api
   ```
3. ✅ Use environment-specific configs (`.env.development`, `.env.production`)
4. ⚠️ Document setup process in README for developers
5. ⚠️ Use EAS Secrets for production builds instead of local `.env`

**Status:** ⚠️ PARTIALLY MITIGATED (gitignored but still present locally)

---

## 🟠 HIGH Priority Issues

### 2. Weak Password Validation

**Location:** `app/(auth)/signup.tsx:24`

**Issue:**
Password requirements are too weak - only 6 characters minimum with no complexity requirements.

**Current Implementation:**
```typescript
if (password.length < 6) {
  Alert.alert('Error', 'Password must be at least 6 characters');
  return;
}
```

**Risk:**
- Passwords like "123456", "aaaaaa", or "qwerty" are accepted
- No requirement for uppercase, lowercase, numbers, or special characters
- Vulnerable to brute force and dictionary attacks
- Does not meet modern security standards (NIST recommends 8+ characters)

**Recommendation:**
```typescript
// Enhanced password validation
if (password.length < 8) {
  Alert.alert('Error', 'Password must be at least 8 characters');
  return;
}

// Check for complexity (at least 2 of: uppercase, lowercase, number, special char)
const hasUpperCase = /[A-Z]/.test(password);
const hasLowerCase = /[a-z]/.test(password);
const hasNumber = /[0-9]/.test(password);
const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

if (complexityCount < 2) {
  Alert.alert(
    'Weak Password',
    'Password must contain at least 2 of: uppercase, lowercase, number, special character'
  );
  return;
}

// Check for common passwords (basic check)
const commonPasswords = ['password', '12345678', 'qwertyui'];
if (commonPasswords.includes(password.toLowerCase())) {
  Alert.alert('Error', 'This password is too common. Please choose a stronger password.');
  return;
}
```

**Impact:** HIGH - Affects all user accounts

---

### 3. Missing Rate Limiting on Authentication

**Location:** `app/(auth)/login.tsx:16-36`, `app/(auth)/signup.tsx:13-52`

**Issue:**
No client-side rate limiting or throttling for login/signup attempts.

**Risk:**
- Brute force attacks can be attempted repeatedly
- No delay between failed login attempts
- Account enumeration possible (checking if emails exist)

**Current State:**
- Relies entirely on Supabase backend rate limiting
- No UI-level protection or feedback
- User can spam login button during loading state (partially mitigated by `loading` state check)

**Recommendation:**
1. Implement exponential backoff after failed attempts:
```typescript
const [failedAttempts, setFailedAttempts] = useState(0);
const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

async function handleLogin() {
  // Check if locked out
  if (lockoutUntil && new Date() < lockoutUntil) {
    const remainingSeconds = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
    Alert.alert('Too Many Attempts', `Please wait ${remainingSeconds} seconds before trying again.`);
    return;
  }

  // ... existing validation ...

  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false);

  if (error) {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);

    // Exponential lockout: 5s, 15s, 30s, 60s
    if (newFailedAttempts >= 3) {
      const lockoutSeconds = Math.min(5 * Math.pow(2, newFailedAttempts - 3), 60);
      setLockoutUntil(new Date(Date.now() + lockoutSeconds * 1000));
    }

    Alert.alert('Error', error.message);
    return;
  }

  // Reset on success
  setFailedAttempts(0);
  setLockoutUntil(null);
  router.replace('/(tabs)/browse');
}
```

2. Add visual feedback for lockout state in UI
3. Consider implementing CAPTCHA after 5 failed attempts

**Impact:** HIGH - Affects account security

---

### 4. Excessive Console Logging in Production

**Location:** Multiple files (36 occurrences across 8 files)

**Issue:**
Production code contains `console.log()` and `console.error()` statements that may leak sensitive information.

**Files with console logs:**
- `lib/api.ts` (11 occurrences)
- `lib/currency.ts` (5 occurrences)
- `lib/notifications.ts` (8 occurrences)
- `app/plan/[id].tsx` (3 occurrences)
- `app/topup/[orderId].tsx` (3 occurrences)
- Others (6 occurrences)

**Risk:**
- Sensitive data (tokens, user IDs, order details) may be logged
- Error messages may reveal system internals
- Performance impact in production
- Logs accessible via debugging tools

**Examples of Sensitive Logging:**
```typescript
// lib/api.ts:34
console.error('API error:', response.status, errorText);

// app/plan/[id].tsx:114
console.error('Payment error:', paymentError);

// app/topup/[orderId].tsx:133
console.error('❌ Payment sheet initialization error:', initError);
```

**Recommendation:**
1. Remove all `console.log()` statements from production code
2. Use a logging service (e.g., Sentry) for production error tracking
3. Implement conditional logging:
```typescript
// lib/logger.ts
export const logger = {
  log: (__DEV__) ? console.log : () => {},
  error: (__DEV__) ? console.error : (error: Error) => {
    // Send to error tracking service in production
    if (!__DEV__) {
      // Sentry.captureException(error);
    }
  },
  warn: (__DEV__) ? console.warn : () => {},
};

// Usage
logger.error('Payment error:', paymentError);
```

4. Add babel plugin to strip console logs in production:
```json
// babel.config.js
{
  "plugins": [
    ["transform-remove-console", { "exclude": ["error", "warn"] }]
  ]
}
```

**Impact:** MEDIUM-HIGH - Information disclosure risk

---

## 🟡 MEDIUM Priority Issues

### 5. Unvalidated Deep Link Parameters

**Location:** `app/_layout.tsx:74-98`

**Issue:**
Deep link handling doesn't validate parameters before using them in navigation.

**Current Implementation:**
```typescript
const handleDeepLink = (event: { url: string }) => {
  const { path, queryParams } = Linking.parse(event.url);

  // Handle top-up success redirect
  if (path === 'dashboard' && queryParams?.topup === 'success') {
    const orderId = queryParams.order as string;

    Alert.alert('Top-Up Successful!', 'Data has been added to your eSIM', [
      {
        text: 'View eSIM',
        onPress: () => {
          if (orderId) {
            router.push(`/esim-details/${orderId}`); // ⚠️ No validation!
          }
        },
      },
    ]);
  }
};
```

**Risk:**
- Malicious deep links could inject arbitrary paths
- No validation that `orderId` is a valid UUID format
- Potential for navigation to unexpected routes

**Recommendation:**
```typescript
// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const handleDeepLink = (event: { url: string }) => {
  try {
    const { path, queryParams } = Linking.parse(event.url);

    // Whitelist allowed paths
    const allowedPaths = ['dashboard', 'payment-complete'];
    if (!path || !allowedPaths.includes(path)) {
      console.warn('Invalid deep link path:', path);
      return;
    }

    if (path === 'dashboard' && queryParams?.topup === 'success') {
      const orderId = queryParams.order as string;

      // Validate orderId format
      if (!orderId || !isValidUUID(orderId)) {
        Alert.alert('Error', 'Invalid order ID in link');
        return;
      }

      // ... rest of handler
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
    Alert.alert('Error', 'Invalid link format');
  }
};
```

**Impact:** MEDIUM - Could lead to unexpected navigation or crashes

---

### 6. Missing Input Sanitization for User-Generated Content

**Location:** `app/components/ReferAndEarn.tsx:69, 98`, `app/install/[orderId].tsx:56`

**Issue:**
User-generated content is used in URLs without proper sanitization beyond `encodeURIComponent`.

**Examples:**
```typescript
// ReferAndEarn.tsx:69
const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

// browse.tsx:145
router.push(`/region/${encodeURIComponent(group.region)}`);

// install/[orderId].tsx:56
const deepLinkUrl = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpaString)}`;
```

**Risk:**
- While `encodeURIComponent` prevents basic injection, it doesn't validate content
- Region names from API could contain unexpected characters
- LPA strings should be validated before encoding

**Current Mitigation:**
✅ `encodeURIComponent()` is used consistently
✅ React Native doesn't render HTML, preventing XSS
✅ No `dangerouslySetInnerHTML` or `innerHTML` usage found

**Recommendation:**
Add input validation before encoding:
```typescript
// Validate region name format
function isValidRegionName(region: string): boolean {
  // Only allow letters, spaces, and common punctuation
  return /^[a-zA-Z\s\-']+$/.test(region) && region.length <= 100;
}

// Validate LPA string format
function isValidLPAString(lpa: string): boolean {
  // LPA format: LPA:1$smdp$activation_code
  return /^LPA:1\$[\w\-\.]+\$[\w\-]+$/.test(lpa);
}
```

**Impact:** LOW-MEDIUM - Limited risk due to React Native architecture

---

## 🟢 LOW Priority / Best Practices

### 7. Missing Security Headers in API Requests

**Location:** `lib/api.ts`

**Issue:**
API requests don't include security headers beyond `Content-Type` and `Authorization`.

**Recommendation:**
Add additional headers for defense-in-depth:
```typescript
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    'Accept': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}
```

---

### 8. Sensitive Data in AsyncStorage

**Location:** `lib/supabase.ts:8`

**Issue:**
Supabase uses `AsyncStorage` for session persistence, which is unencrypted on iOS/Android.

**Current Implementation:**
```typescript
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // ⚠️ Unencrypted storage
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

**Risk:**
- Session tokens stored in plain text on device
- Accessible via backup extraction or rooted/jailbroken devices
- Lower risk than web localStorage but still not ideal

**Recommendation:**
Use Expo SecureStore for encrypted storage:
```typescript
import * as SecureStore from 'expo-secure-store';

// Wrapper for SecureStore to match AsyncStorage interface
const secureStorage = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

**Impact:** LOW - Requires device access to exploit

---

### 9. Missing Request Timeouts (Partially Addressed)

**Location:** `lib/api.ts`

**Status:** ✅ ALREADY IMPLEMENTED for checkout/region endpoints

**Good Implementation:**
```typescript
// lib/api.ts:203-204
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
```

**Missing:** Timeouts not implemented for `fetchPlans()`, `fetchUserOrders()`, `fetchOrderById()`

**Recommendation:**
Add timeout wrapper for all API calls:
```typescript
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
}
```

---

### 10. Potential Stripe Key Leakage (False Positive)

**Location:** `lib/config.ts:9`

**Status:** ✅ SAFE - Publishable key is meant to be public

**Analysis:**
The Stripe publishable key (`pk_live_...`) is exposed in the app, but this is **intentional and safe**:
- Publishable keys are designed for client-side use
- They cannot be used to charge cards or access sensitive data
- Stripe restricts publishable keys to frontend operations only
- The secret key (`sk_live_...`) is NOT in the codebase ✅

**No Action Required**

---

## ✅ Security Strengths (Things Done Right)

1. **Environment Variables:** Using Expo Constants for config (app.config.ts:72-84)
2. **gitignore:** `.env` is properly gitignored and never committed to git
3. **Authentication:** Using Supabase with JWT tokens (lib/supabase.ts:6-13)
4. **Auto Token Refresh:** `autoRefreshToken: true` prevents session expiration issues
5. **No SQL Injection:** Using Supabase ORM, not raw SQL queries
6. **No XSS:** React Native doesn't support `dangerouslySetInnerHTML`
7. **HTTPS Only:** All API calls use HTTPS (API_URL, Supabase, Stripe)
8. **Input Validation:** Email/password format checks in auth forms
9. **URL Encoding:** Consistent use of `encodeURIComponent()` for URL parameters
10. **Payment Security:** Using Stripe Payment Sheet (native, PCI-compliant)
11. **Session Validation:** Auth checks before sensitive operations (payment, top-up)
12. **Error Boundaries:** React error boundary implemented (app/components/ErrorBoundary.tsx)
13. **Request Timeouts:** Implemented for checkout and region API calls
14. **Retry Logic:** React Query configured with retry + exponential backoff
15. **Deep Link Verification:** iOS Associated Domains + Android App Links configured

---

## Priority Action Items

### Immediate (This Week)
1. 🔴 Replace `.env` with `.env.example` containing dummy values
2. 🔴 Document `.env` setup process in README
3. 🟠 Strengthen password validation (8+ chars, complexity requirements)
4. 🟠 Implement rate limiting on login/signup

### Short Term (This Month)
5. 🟠 Remove console.log statements or implement conditional logging
6. 🟡 Add deep link parameter validation
7. 🟢 Migrate from AsyncStorage to SecureStore for session storage
8. 🟢 Add request timeouts to all API calls

### Long Term (Next Quarter)
9. Set up error tracking service (Sentry/Bugsnag)
10. Implement CAPTCHA for failed login attempts
11. Add security headers to API requests
12. Consider penetration testing before major launch

---

## Testing Recommendations

1. **Authentication Testing:**
   - Test password validation edge cases
   - Verify session expiration handling
   - Test rate limiting after implementation

2. **Deep Link Testing:**
   - Test malicious deep links: `lumbus://esim-details/../../../etc/passwd`
   - Test invalid UUIDs: `lumbus://esim-details/invalidid`
   - Test XSS in deep link params: `lumbus://dashboard?order=<script>alert(1)</script>`

3. **API Security Testing:**
   - Test API calls without auth tokens
   - Test API calls with expired tokens
   - Verify timeout behavior with slow connections

4. **Input Validation Testing:**
   - Test special characters in search fields
   - Test extremely long inputs (> 1000 chars)
   - Test Unicode/emoji in region names

---

## Conclusion

The Lumbus mobile app has a **solid security foundation** with proper authentication, HTTPS, and modern security practices. However, the **critical issue of production secrets in .env** must be addressed immediately, and high-priority issues (password validation, rate limiting, console logging) should be fixed before production launch.

**Next Steps:**
1. Address CRITICAL and HIGH priority issues
2. Implement recommended fixes from this audit
3. Test fixes thoroughly
4. Consider security review again before v1.0 production release

**Overall Assessment:** The app is **not production-ready** until CRITICAL and HIGH priority issues are resolved. With these fixes, security posture will be **GOOD** for a v1.0 mobile app.

---

**Report Generated:** 2025-10-21
**Review Period:** Full codebase audit
**Files Reviewed:** 22 source files, 6 config files
**Issues Found:** 10 (1 critical, 3 high, 2 medium, 4 low)
