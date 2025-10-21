# iOS Push Notifications Setup Guide

## Prerequisites
- Apple Developer Account ($99/year)
- Required for push notifications, TestFlight, and App Store submission
- Register at: https://developer.apple.com/programs/

## Setup Steps

### 1. Generate APNs Key in Apple Developer Portal

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click the **+** button to create a new key
3. Enter a key name (e.g., "Lumbus APNs Key")
4. Enable **Apple Push Notifications service (APNs)** checkbox
5. Click **Continue**, then **Register**
6. **Download the `.p8` key file** (you can only download this once!)
7. **Save the Key ID** (shown on the download page)
8. **Note your Team ID** (found in the top right of the developer portal)

### 2. Upload APNs Key to Expo

Run the following command in your terminal:

```bash
eas credentials
```

When prompted:
- Select **iOS**
- Select **Push Notifications**
- Choose **Upload a Push Notification Key**
- Provide:
  - Path to your `.p8` file
  - Key ID (from step 1)
  - Team ID (from step 1)

### 3. Verify Setup

Once uploaded, Expo will automatically:
- Configure APNs for your app
- Use the key for all push notifications
- Handle token registration

Your existing `expo-notifications` code will work automatically!

## Current Status

### ✅ Android Push Notifications
- Firebase/Google Services configured
- `google-services.json` uploaded to EAS
- Ready to use

### ⏳ iOS Push Notifications
- Waiting on Apple Developer account
- Will be configured when you register for the developer program
- Cannot test iOS push notifications without this account

## Testing Push Notifications

After setup, test notifications using Expo's push notification tool:

```bash
npx expo send-notification --token YOUR_EXPO_PUSH_TOKEN
```

Or use the web tool: https://expo.dev/notifications

## Important Notes

- The `.p8` key file can only be downloaded **once** - keep it secure!
- You can reuse the same APNs key for multiple apps
- APNs keys don't expire (unlike certificates)
- Your `expo-notifications` configuration in `app.config.ts` already handles both platforms

## Documentation

- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Apple APNs Setup: https://developer.apple.com/documentation/usernotifications
- EAS Credentials: https://docs.expo.dev/app-signing/app-credentials/
