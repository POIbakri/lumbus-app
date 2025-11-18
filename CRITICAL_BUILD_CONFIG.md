# ⚠️ CRITICAL BUILD CONFIGURATION - DO NOT MODIFY

**Last Updated:** November 3, 2025
**Status:** ✅ Both iOS and Android builds working

---

## 🚨 CRITICAL: These Settings Must NOT Be Changed

The configurations below were carefully set to resolve critical iOS crash issues and build failures. **Changing any of these will break the builds.**

---

## 1. Package Versions (package.json)

### ✅ MUST Stay This Way:

```json
{
  "dependencies": {
    "react-native-iap": "13.0.4"  // ⚠️ DO NOT upgrade to v14+
  },
  "devDependencies": {
    "react-native-worklets": "^0.5.1"  // ⚠️ REQUIRED for Babel
  }
}
```

**Why:**
- **react-native-iap v13.0.4**: v14+ requires NitroModules which causes iOS startup crashes
- **react-native-worklets**: Required by Babel but excluded from native builds (see react-native.config.js)

**NEVER:**
- ❌ Upgrade react-native-iap to v14 or higher
- ❌ Remove react-native-worklets from devDependencies
- ❌ Add react-native-nitro-modules back

---

## 2. Platform Configuration (react-native.config.js)

### ✅ MUST Stay This Way:

```javascript
module.exports = {
  dependencies: {
    '@stripe/stripe-react-native': {
      // ⚠️ Stripe enabled on BOTH iOS and Android
      // iOS: Apple Pay + cards via Stripe Payment Sheet
      // Android: Google Pay + cards via Stripe Payment Sheet
    },
    'react-native-iap': {
      platforms: { android: null },  // ⚠️ iOS only
    },
    'react-native-worklets': {
      platforms: { ios: null, android: null },  // ⚠️ Babel only, no native
    },
  },
};
```

**Why:**
- **iOS & Android**: Use Stripe for payments (single unified flow)
- **react-native-iap v13**: Still present but only for legacy/backup; not used in current app flow
- **Worklets**: Needed for Babel plugin but NOT for native code

**NEVER:**
- ❌ Enable react-native-iap for Android
- ❌ Enable react-native-worklets native builds

---

## 3. Architecture Settings (app.config.ts)

### ✅ MUST Stay This Way:

```typescript
{
  newArchEnabled: false,  // ⚠️ Global setting (overridden by expo-build-properties)

  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          newArchEnabled: true   // ✅ Android: New Architecture ON
        },
        ios: {
          newArchEnabled: false  // ✅ iOS: New Architecture OFF
        }
      }
    ]
  ]
}
```

**Why:**
- iOS: Old architecture required for react-native-iap v13 stability
- Android: New architecture works fine with Stripe

**NEVER:**
- ❌ Enable new architecture for iOS (will break IAP v13)

---

## 4. Babel Configuration (babel.config.js)

### ✅ MUST Stay This Way:

```javascript
module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Conditionally add worklets plugin if it exists
  try {
    require.resolve('react-native-worklets/plugin');
    plugins.push('react-native-worklets/plugin');
  } catch (e) {
    // Plugin not available, skip it
  }

  // Add reanimated plugin (should be last)
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins,
  };
};
```

**Why:**
- Conditional loading prevents build failures if worklets is missing
- Try/catch ensures graceful fallback

**NEVER:**
- ❌ Remove the try/catch wrapper around worklets
- ❌ Hardcode worklets plugin without conditional check

---

## 5. iOS Podfile (ios/Podfile)

### ✅ Critical Settings:

```ruby
# Enforce Swift 5.10 for all Pods
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['SWIFT_VERSION'] = '5.10'
  end
end

# Disable Folly coroutines (for react-native-iap compatibility)
defs << 'FOLLY_NO_CONFIG=1'
defs << 'FOLLY_CFG_NO_COROUTINES=1'
defs << 'FOLLY_HAS_COROUTINES=0'
```

**Why:**
- Swift 5.10 prevents Swift 6 compiler crashes
- Folly coroutine flags prevent react-native-iap build errors

**NEVER:**
- ❌ Remove Folly preprocessor definitions
- ❌ Change Swift version to 6.0

---

## 6. Payment Service Structure

### ✅ File Structure:

```
lib/payments/
├── IAPServiceV13.ios.ts   ⚠️ iOS IAP (v13 API)
├── StripeService.ts       ✅ Android Stripe
└── PaymentService.ts      ✅ Platform router
```

**Platform Logic:**
- **iOS**: Uses `IAPServiceV13` (react-native-iap v13)
- **Android**: Uses `StripeService` (Stripe SDK)

**NEVER:**
- ❌ Delete IAPServiceV13.ios.ts
- ❌ Change PaymentService to use v14 API
- ❌ Use IAP for Android

---

## 🔍 Troubleshooting

### If iOS Build Fails:
1. Check react-native-iap version is still **13.0.4**
2. Verify `newArchEnabled: false` for iOS in app.config.ts
3. Run `cd ios && pod install` to ensure pods are correct
4. Check that NitroModules is NOT in package.json

### If Android Build Fails:
1. Verify react-native-iap is excluded: `platforms: { android: null }`
2. Check Stripe configuration is intact
3. Ensure worklets native build is disabled

### If Babel/Metro Fails:
1. Check react-native-worklets is in devDependencies
2. Verify babel.config.js has conditional plugin loading
3. Clear cache: `npx expo start --clear`

---

## 📝 Build Commands

Always use `--clear-cache` for EAS builds after config changes:

```bash
# iOS
eas build --platform ios --profile preview --clear-cache

# Android
eas build --platform android --profile preview --clear-cache
```

---

## 🚫 What NOT To Do

1. ❌ **DO NOT** upgrade react-native-iap to v14+
2. ❌ **DO NOT** add react-native-nitro-modules
3. ❌ **DO NOT** remove platform exclusions from react-native.config.js
4. ❌ **DO NOT** enable new architecture for iOS
5. ❌ **DO NOT** remove react-native-worklets from devDependencies
6. ❌ **DO NOT** remove the Folly preprocessor definitions from Podfile

---

## ✅ Summary

**iOS:**
- react-native-iap v13 (old architecture)
- Apple In-App Purchase
- Swift 5.10, Folly coroutines disabled

**Android:**
- Stripe payments only
- New architecture enabled
- IAP and worklets excluded

**Both:**
- react-native-worklets for Babel only (no native code)

---

**If you need to make changes to these configurations, consult this document first and understand the consequences!**
