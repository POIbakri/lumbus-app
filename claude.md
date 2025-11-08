# Claude AI Agent Instructions for Lumbus Mobile

**Project:** Lumbus Mobile (React Native / Expo App)
**Purpose:** Critical configuration and constraints for AI agents

---

## 🚨 CRITICAL BUILD CONFIGURATION - READ FIRST

**BEFORE making ANY changes to dependencies, build config, or native modules, read this entire section.**

---

## ⚠️ Critical Package Versions - DO NOT MODIFY

### react-native-iap: MUST stay at v13.0.4

```json
"react-native-iap": "13.0.4"  // ⚠️ NEVER upgrade to v14+
```

**Why:**
- v14+ requires NitroModules which causes **iOS startup crashes**
- v13.0.4 is stable and works perfectly for iOS
- Android doesn't use IAP at all (uses Stripe)

**NEVER:**
- ❌ Upgrade to v14 or higher
- ❌ Add react-native-nitro-modules
- ❌ Suggest "updating to latest version"

---

### react-native-worklets: MUST be in devDependencies

```json
"devDependencies": {
  "react-native-worklets": "^0.5.1"  // ⚠️ Required for Babel
}
```

**Why:**
- Required by Babel (dependency of react-native-reanimated)
- Excluded from native builds in react-native.config.js
- Removing it causes "Cannot find module 'react-native-worklets/plugin'" error

**NEVER:**
- ❌ Remove from devDependencies
- ❌ Add react-native-worklets-core (causes build issues)

---

## ⚠️ Platform Configuration (react-native.config.js)

**MUST maintain these exact exclusions:**

```javascript
module.exports = {
  dependencies: {
    '@stripe/stripe-react-native': {
      platforms: { ios: null },  // Android only
    },
    'react-native-iap': {
      platforms: { android: null },  // iOS only
    },
    'react-native-worklets': {
      platforms: { ios: null, android: null },  // Babel only, no native
    },
  },
};
```

**Why:**
- **iOS**: Uses Apple In-App Purchase (IAP v13)
- **Android**: Uses Stripe (no IAP)
- **Worklets**: Babel needs the plugin, but native code causes CMake errors

**NEVER:**
- ❌ Remove any platform exclusions
- ❌ Enable react-native-iap for Android
- ❌ Enable worklets native builds
- ❌ Suggest "fixing" the exclusions

---

## ⚠️ Architecture Settings (app.config.ts)

**iOS MUST use old architecture, Android MUST use new architecture:**

```typescript
{
  newArchEnabled: false,  // Global default

  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          newArchEnabled: true   // ✅ New Arch for Android
        },
        ios: {
          newArchEnabled: false  // ✅ Old Arch for iOS
        }
      }
    ]
  ]
}
```

**Why:**
- react-native-iap v13 requires old architecture for iOS
- Android works fine with new architecture

**NEVER:**
- ❌ Enable new architecture for iOS
- ❌ Suggest "upgrading to new architecture" for iOS

---

## ⚠️ Babel Configuration (babel.config.js)

**MUST maintain conditional worklets loading:**

```javascript
const plugins = [];

// Conditionally add worklets plugin
try {
  require.resolve('react-native-worklets/plugin');
  plugins.push('react-native-worklets/plugin');
} catch (e) {
  // Plugin not available, skip it
}

plugins.push('react-native-reanimated/plugin');
```

**Why:**
- Prevents build failures if worklets is missing
- Graceful fallback

**NEVER:**
- ❌ Remove try/catch wrapper
- ❌ Hardcode the plugin without conditional check

---

## 🏗️ Build Process

### When making dependency changes:

1. **Always run with --clear-cache**:
   ```bash
   eas build --platform ios --profile preview --clear-cache
   eas build --platform android --profile preview --clear-cache
   ```

2. **For iOS changes, always run pod install**:
   ```bash
   cd ios && pod install
   ```

3. **Test TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

---

## 📱 Platform-Specific Payment Flow

### iOS:
- Uses `IAPServiceV13.ios.ts` (react-native-iap v13 API)
- Apple In-App Purchase
- 15-30% commission to Apple

### Android:
- Uses `StripeService.ts` (Stripe SDK)
- Credit/Debit cards, Google Pay
- ~3% fees, no Google commission

**NEVER:**
- ❌ Use IAP for Android
- ❌ Use Stripe for iOS
- ❌ Delete IAPServiceV13.ios.ts
- ❌ Suggest "unifying" payment systems across platforms

---

## 🚫 What NEVER To Do

1. ❌ Upgrade react-native-iap to v14+
2. ❌ Add react-native-nitro-modules to package.json
3. ❌ Remove platform exclusions from react-native.config.js
4. ❌ Enable new architecture for iOS
5. ❌ Remove react-native-worklets from devDependencies
6. ❌ Remove conditional plugin loading from babel.config.js
7. ❌ Suggest "updating all packages to latest"
8. ❌ Remove Folly preprocessor definitions from ios/Podfile

---

## 🎯 Project Structure

```
lumbus-mobile/
├── app/                    # Expo Router pages
├── lib/
│   ├── payments/
│   │   ├── IAPServiceV13.ios.ts    # iOS IAP (v13 API)
│   │   ├── StripeService.ts        # Android Stripe
│   │   └── PaymentService.ts       # Platform router
│   ├── api.ts             # Supabase API calls
│   └── logger.ts          # Logging utility
├── ios/                   # Native iOS code
├── android/               # Native Android code
└── CRITICAL_BUILD_CONFIG.md   # Detailed config docs
```

---

## 💡 Common Tasks

### Adding a new dependency:
1. Check if it affects native modules
2. Test on BOTH iOS and Android
3. Update this file if it's critical

### Fixing build errors:
1. Check CRITICAL_BUILD_CONFIG.md first
2. Verify package versions haven't changed
3. Check platform exclusions are intact
4. Use --clear-cache flag

### Updating Expo SDK:
1. Be extremely careful with react-native-iap
2. Test iOS thoroughly (IAP is fragile)
3. Verify android build still works

---

## 📞 Payment Integration Details

### iOS IAP Products:
- Product IDs format: `com.lumbus.app.esim.{sanitized_name}`
- Managed in App Store Connect
- Receipt validation via backend API

### Android Stripe:
- Uses Payment Sheet
- Supports Google Pay automatically
- Webhook validation on backend

### Backend API:
- `createIAPCheckout()` - iOS order creation
- `createCheckout()` - Android Stripe session
- `validateAppleReceipt()` - iOS receipt verification

---

## 🔍 If Something Breaks

### iOS crashes on startup:
- **Cause**: NitroModules or IAP v14
- **Fix**: Ensure react-native-iap is v13.0.4
- **Check**: package.json, pod install

### "Cannot find module 'react-native-worklets/plugin'":
- **Cause**: worklets removed from devDependencies
- **Fix**: Add it back, exclude from native in react-native.config.js

### Android build fails with IAP errors:
- **Cause**: react-native-iap not excluded for Android
- **Fix**: Add `platforms: { android: null }` to react-native.config.js

### Metro bundler errors:
- **Cause**: Babel config changed
- **Fix**: Restore conditional plugin loading
- **Command**: `npx expo start --clear`

---

## ✅ Testing Checklist

Before committing changes that affect builds:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] iOS builds locally: `npx expo run:ios`
- [ ] Android builds locally: `npx expo run:android`
- [ ] react-native-iap is still v13.0.4
- [ ] Platform exclusions are intact
- [ ] New architecture settings unchanged

---

## 📚 Additional Documentation

- **CRITICAL_BUILD_CONFIG.md** - Detailed build configuration
- **IAP_QUICK_START.md** - iOS IAP setup guide
- **PAYMENT_FLOW_REVIEW.md** - Payment flow documentation

---

**Remember: These configurations were set after extensive debugging to fix critical iOS crashes. Don't change them without understanding the full context!**
