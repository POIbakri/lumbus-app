# Lumbus Mobile - Build Guide

This guide will help you build the Lumbus mobile app for iOS and Android using EAS Build.

## Prerequisites

1. **Node.js 20+** - Required for building
2. **EAS CLI** - Install with `npm install -g eas-cli`
3. **Expo Account** - Sign up at https://expo.dev
4. **EAS Login** - Run `eas login` to authenticate

## Quick Start

### 1. Validate Your Configuration

Before building, ensure all configurations are correct:

```bash
./validate-build-config.sh
```

This will check:
- ✅ All required environment variables are set
- ✅ `eas.json` has correct build profiles
- ✅ `app.config.ts` is properly configured
- ✅ Build scripts and plugins are in place
- ✅ `.env` is properly gitignored (security check)

### 2. Setup EAS Secrets (First Time Only)

Run this script to automatically create all EAS secrets from your `.env` file:

```bash
./setup-eas-secrets.sh
```

This will create the following secrets in your EAS project:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_PROJECT_ID`

**Note:** You'll also need to set the `GOOGLE_SERVICES_JSON` secret manually:

```bash
eas secret:push --scope project --name GOOGLE_SERVICES_JSON --value "$(cat google-services.json)"
```

### 3. Build Your App

#### iOS Build (Preview)

```bash
EXPO_NO_CAPABILITY_SYNC=1 npx --package=node@20 --yes eas build --platform ios --profile preview --clear-cache
```

#### Android Build (Preview)

```bash
npx --package=node@20 --yes eas build --platform android --profile preview --clear-cache
```

#### Production Build

```bash
# iOS Production
EXPO_NO_CAPABILITY_SYNC=1 npx --package=node@20 --yes eas build --platform ios --profile production

# Android Production
npx --package=node@20 --yes eas build --platform android --profile production
```

## Environment Variables

The app requires the following environment variables to be set:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` or `pk_test_...` |
| `EXPO_PUBLIC_API_URL` | Your API endpoint URL | `https://getlumbus.com/api` |
| `EXPO_PUBLIC_PROJECT_ID` | EAS project ID (for push notifications) | `b38159ea-...` |

### Local Development

For local development, these variables are read from the `.env` file in the project root.

### EAS Builds

For EAS builds, these variables must be set as EAS secrets (use `./setup-eas-secrets.sh`).

The values are referenced in `eas.json` using the `@SECRET_NAME` syntax:

```json
{
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "@EXPO_PUBLIC_SUPABASE_URL",
    ...
  }
}
```

## Build Profiles

The project has three build profiles configured in `eas.json`:

### Development
- Development client enabled
- Internal distribution
- Simulator: disabled (physical devices only)
- Use for: Development and testing on physical devices

### Preview
- Internal distribution
- iOS resource class: m1-medium (for better build performance)
- Use for: Testing before production release

### Production
- Auto-increment build numbers
- Use for: App Store and Play Store releases

## iOS Build Notes

### RCT-Folly Fix

The project includes a custom Expo config plugin (`plugins/withRCTFollyFix.js`) that automatically fixes the RCT-Folly typedef redefinition error on iOS.

This fix:
- Patches the Podfile during prebuild
- Modifies RCT-Folly's `Time.h` to prevent conflicts with iOS 15.1+ SDK
- Removes Stripe New Architecture sources to avoid compilation errors

### Capabilities

The build uses `EXPO_NO_CAPABILITY_SYNC=1` to prevent automatic capability syncing, which can cause issues with certain configurations.

### Apple Sign In

The app uses Apple Sign In, which requires:
- `usesAppleSignIn: true` in `app.config.ts` (already configured)
- Associated domains configured for `getlumbus.com`

## Android Build Notes

### Google Services

The Android build requires `google-services.json` for Firebase integration. This file is:
- ✅ Gitignored for security
- ✅ Uploaded to EAS as a secret (`GOOGLE_SERVICES_JSON`)
- ✅ Automatically applied during build via `eas.json`

### Permissions

The app requests the following Android permissions:
- `CAMERA` - For QR code scanning (eSIM installation)
- `POST_NOTIFICATIONS` - For push notifications

## Troubleshooting

### Build Fails with Missing Environment Variables

**Solution:** Run `./setup-eas-secrets.sh` to set up all required secrets.

### Build Fails with RCT-Folly Errors (iOS)

**Solution:** The fix should be automatic. If it still fails:
1. Check that `plugins/withRCTFollyFix.js` exists
2. Try running the build with `--clear-cache`

### Build Fails with Stripe New Architecture Errors (iOS)

**Solution:** The plugin automatically excludes New Architecture sources. If it still fails:
1. Ensure you're using the latest version of `@stripe/stripe-react-native`
2. Check that `expo-build-properties` has `useFrameworks: 'static'` for iOS

### Push Notifications Not Working

**Solution:**
1. Ensure `EXPO_PUBLIC_PROJECT_ID` is set correctly
2. Use a development build, not Expo Go (push notifications don't work in Expo Go)
3. Test on a physical device

### Build Succeeds but App Crashes on Launch

**Common causes:**
1. Missing environment variables - check CloudWatch/device logs
2. Incorrect Supabase credentials - verify `.env` values
3. Network issues - ensure API URLs are accessible

**Get device logs:**
```bash
# iOS
# Use Xcode > Window > Devices and Simulators > Open Console

# Android
adb logcat | grep -i lumbus
```

## Updating Dependencies

When updating dependencies, especially native modules:

1. Clear caches:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Rebuild with cache cleared:
   ```bash
   eas build --platform ios --profile preview --clear-cache
   ```

## CI/CD Integration

The build scripts are designed to work in CI/CD environments:

1. Set environment variables as CI secrets
2. Run validation: `./validate-build-config.sh`
3. Run build with appropriate profile

Example GitHub Actions snippet:

```yaml
- name: Validate Build Config
  run: ./validate-build-config.sh

- name: Build iOS
  run: EXPO_NO_CAPABILITY_SYNC=1 npx --package=node@20 --yes eas build --platform ios --profile production --non-interactive
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Support

If you encounter issues not covered in this guide:

1. Run the validation script: `./validate-build-config.sh`
2. Check EAS build logs: `eas build:list`
3. View detailed build logs: `eas build:view BUILD_ID`

## Files Reference

| File | Purpose |
|------|---------|
| `eas.json` | EAS Build configuration and profiles |
| `app.config.ts` | Expo app configuration |
| `.env` | Local environment variables (gitignored) |
| `setup-eas-secrets.sh` | Automated EAS secrets setup |
| `validate-build-config.sh` | Build configuration validation |
| `plugins/withRCTFollyFix.js` | iOS build fix plugin |
| `scripts/eas-build-post-install.js` | EAS post-install hook |

---

**Happy Building!** 🚀
