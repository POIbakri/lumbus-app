# Push Notifications Setup Guide

## ⚠️ Important: Development Build Required

Push notifications **DO NOT work in Expo Go**. You must create a development build to test and use push notifications.

### Why?

Starting with Expo SDK 53, remote push notifications were removed from Expo Go for Android. For iOS, while Expo Go supports some notification features, full push notification functionality requires a development build.

---

## Quick Start (Development)

For testing without push notifications (using Expo Go):

```bash
npm start
```

**Note:** Push notifications will be disabled, but all other features work normally.

---

## Production Setup (With Push Notifications)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Configure EAS Build

```bash
# Login to Expo
eas login

# Configure your project
eas build:configure
```

This will:
- Create an `eas.json` file
- Generate a project ID (UUID format)
- Set up build profiles

### Step 3: Add Project ID to .env

Copy your project ID from the EAS output or from:
https://expo.dev/accounts/[your-account]/projects/[project-name]/settings

Add to your `.env` file:

```env
EXPO_PUBLIC_PROJECT_ID=12345678-1234-1234-1234-123456789abc
```

**Important:** The project ID must be a valid UUID format.

### Step 4: Configure Push Notification Credentials

#### For iOS (APNs)

```bash
eas credentials
```

Select:
1. iOS
2. Push Notifications
3. Upload your Apple Push Notifications certificate

Or let EAS manage it automatically.

#### For Android (FCM)

1. Create a Firebase project: https://console.firebase.google.com/
2. Download `google-services.json`
3. Place it in your project root
4. Add to `.env`:

```env
GOOGLE_SERVICES_JSON=./google-services.json
```

### Step 5: Create Development Build

#### For iOS

```bash
# Development build (faster, includes Expo dev tools)
eas build --profile development --platform ios

# Install on device
# After build completes, scan QR code or download from Expo dashboard
```

#### For Android

```bash
# Development build
eas build --profile development --platform android

# Install APK on device
# Download from Expo dashboard and install
```

### Step 6: Run with Development Build

```bash
# Start the dev server
npx expo start --dev-client

# Scan QR code with your development build app
```

---

## Testing Push Notifications

### 1. Local Notifications (No Backend Required)

You can test local notifications immediately in your development build:

```typescript
import { sendLocalNotification, NotificationType } from '../lib/notifications';

// Send test notification
await sendLocalNotification(
  '🎉 Test Notification',
  'This is a test notification!',
  NotificationType.ESIM_READY,
  { test: true }
);
```

### 2. Remote Push Notifications (Backend Required)

See `BACKEND_NOTIFICATIONS.md` for complete backend setup.

Quick test using Expo's push tool:

1. Get your Expo push token (printed in console when app starts)
2. Go to: https://expo.dev/notifications
3. Enter your token
4. Send a test notification

---

## Troubleshooting

### Error: "Invalid UUID" for Project ID

**Problem:** `EXPO_PUBLIC_PROJECT_ID` is not a valid UUID.

**Solution:**
1. Run `eas build:configure` to get your project ID
2. Ensure it's in UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. Update `.env` file with the correct project ID

### Notifications Not Received

**Problem:** Notifications don't appear on device.

**Checklist:**
- [ ] Using development build (not Expo Go)
- [ ] Valid project ID in `.env`
- [ ] Notification permissions granted on device
- [ ] Valid push token generated
- [ ] Push token saved to backend database
- [ ] Backend sending notifications correctly

### "Must use physical device for push notifications"

**Problem:** Running on iOS Simulator or Android Emulator.

**Solution:** Push notifications require a physical device. Use a real iPhone or Android phone.

---

## Development vs Production

### Development Build

- Faster to build
- Includes Expo dev tools
- Hot reload support
- Can connect to localhost backend
- Perfect for testing

```bash
eas build --profile development --platform ios
```

### Production Build

- Optimized and minified
- No dev tools
- Submitted to App Store/Play Store
- Production-ready

```bash
eas build --profile production --platform ios
```

---

## Expo Go Limitations

When using Expo Go (development without custom builds):

**What Works:**
- ✅ All UI features
- ✅ Navigation
- ✅ Supabase auth
- ✅ Stripe payments
- ✅ Data fetching
- ✅ Usage tracking display
- ✅ iOS 17.4+ deep links
- ✅ Web installation fallback

**What Doesn't Work:**
- ❌ Remote push notifications
- ❌ Push token registration
- ❌ Notification permissions

**Workaround:** The app gracefully handles missing push notification support and logs helpful messages to the console.

---

## Environment Variables Summary

### Required for All Features

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_API_URL=https://getlumbus.com/api
```

### Required for Push Notifications

```env
# Must be valid UUID from `eas build:configure`
EXPO_PUBLIC_PROJECT_ID=12345678-1234-1234-1234-123456789abc
```

### Required for Android Push Notifications

```env
# Path to your Firebase config file
GOOGLE_SERVICES_JSON=./google-services.json
```

---

## Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project (generates project ID)
eas build:configure

# Build development version
eas build --profile development --platform ios
eas build --profile development --platform android

# Build production version
eas build --profile production --platform ios
eas build --profile production --platform android

# Run with development build
npx expo start --dev-client

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Next Steps

1. ✅ Create development build for testing
2. ✅ Test push notifications locally
3. ✅ Implement backend notification system (see `BACKEND_NOTIFICATIONS.md`)
4. ✅ Test end-to-end notification flow
5. ✅ Create production builds
6. ✅ Submit to App Store and Google Play

---

## Additional Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging Setup](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications Setup](https://developer.apple.com/documentation/usernotifications)

---

## Support

For issues or questions:
1. Check Expo documentation: https://docs.expo.dev/
2. Review `BACKEND_NOTIFICATIONS.md` for backend setup
3. Check console logs for detailed error messages
4. Review `IMPLEMENTATION_SUMMARY.md` for feature overview
