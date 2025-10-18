# Restore Authentication

This guide explains how to remove the temporary testing features and restore full authentication.

## Changes Made for Testing

The following temporary changes were made to allow testing without authentication:

### 1. **Splash Screen** (`app/index.tsx`)
- Disabled Supabase auth check
- Now always redirects to login screen

### 2. **Login Screen** (`app/(auth)/login.tsx`)
- Added purple "Quick Test Login" button
- Added `quickLogin()` function that bypasses auth

### 3. **Tabs Layout** (`app/(tabs)/_layout.tsx`)
- Disabled authentication check
- Auto-sets `isAuthenticated = true`

---

## How to Restore Authentication

Follow these steps to re-enable proper authentication:

### Step 1: Restore Splash Screen Auth Check

**File:** `app/index.tsx`

**Find this code (around line 80-83):**
```typescript
// Skip auth check for testing - go straight to login
setTimeout(() => {
  router.replace('/(auth)/login');
}, 1000);
```

**Replace with:**
```typescript
// Check auth after animation
setTimeout(() => {
  checkAuth();
}, 1500);
```

### Step 2: Remove Quick Test Login Button

**File:** `app/(auth)/login.tsx`

**Remove the `quickLogin()` function (around line 34-38):**
```typescript
// Hardcoded quick login for testing
async function quickLogin() {
  setLoading(true);
  router.replace('/(tabs)/browse');
}
```

**Remove the Quick Test Login button (around line 136-145):**
```typescript
{/* Quick Test Login Button */}
<TouchableOpacity
  className="mt-6 rounded-2xl py-4 bg-purple-500 border-2 border-purple-600"
  onPress={quickLogin}
  activeOpacity={0.8}
>
  <Text className="text-white text-center text-sm font-black uppercase tracking-wide">
    🚀 Quick Test Login (Skip Auth)
  </Text>
</TouchableOpacity>
```

### Step 3: Restore Tabs Layout Auth Check

**File:** `app/(tabs)/_layout.tsx`

**Find this code (around line 12-19):**
```typescript
useEffect(() => {
  // TEMPORARILY DISABLED FOR TESTING - Skip auth check
  setIsAuthenticated(true);
  setIsLoading(false);

  // Uncomment below to re-enable auth check
  // checkAuth();
}, []);
```

**Replace with:**
```typescript
useEffect(() => {
  checkAuth();
}, []);
```

---

## Verification

After making these changes:

1. Restart the Expo development server:
   ```bash
   npx expo start --clear
   ```

2. Test the authentication flow:
   - ✅ App should show splash screen
   - ✅ Redirect to login if not authenticated
   - ✅ Redirect to browse screen if already logged in
   - ✅ Tabs should be protected and redirect to login if accessed without auth

---

## Quick Command to Restore All

If you want to quickly restore all authentication:

1. Remove quick login function and button from `app/(auth)/login.tsx`
2. Run this find/replace in your editor:

**In `app/index.tsx`:**
- Find: `router.replace('/(auth)/login');`
- Replace with: `checkAuth();`

**In `app/(tabs)/_layout.tsx`:**
- Find: `// checkAuth();`
- Replace with: `checkAuth();`
- Then remove the lines that set `isAuthenticated` and `isLoading` to true

---

## Notes

- The `checkAuth()` functions are still present in the code, just commented out or not being called
- No database or Supabase configuration changes were made
- All authentication logic remains intact and ready to use

---

## Support

If you encounter any issues after restoring authentication:

1. Clear the Metro bundler cache: `npx expo start --clear`
2. Check your Supabase credentials in `.env`
3. Verify your Supabase project is active and configured correctly
