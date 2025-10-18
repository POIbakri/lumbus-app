# Push Notification Deployment & Testing Guide

## Overview

This guide walks you through deploying push notifications end-to-end, from development build to production notification delivery.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Backend endpoints implemented (`/user/orders`, `/user/push-token`)
- [ ] Database migration completed (`user_push_tokens` table exists)
- [ ] Expo account created
- [ ] Physical iOS or Android device (push notifications don't work on simulators)
- [ ] Expo CLI installed: `npm install -g eas-cli`

---

## Step 1: Configure Expo Project

### 1.1 Login to Expo

```bash
eas login
```

Enter your Expo credentials.

### 1.2 Configure EAS Build

```bash
eas build:configure
```

This will:
- Create `eas.json` file
- Generate a project ID (UUID format)
- Set up build profiles

**Output Example:**
```
✔ Created eas.json
✔ Project ID: 12345678-1234-1234-1234-123456789abc
```

### 1.3 Update .env File

Copy the project ID from the output above and add to `.env`:

```env
EXPO_PUBLIC_PROJECT_ID=12345678-1234-1234-1234-123456789abc
```

**Important:** Must be a valid UUID, not 'local-dev' or any other placeholder.

---

## Step 2: Configure Push Notification Credentials

### For iOS (APNs)

#### Option A: Automatic (Recommended)

```bash
eas credentials
```

Select:
1. iOS
2. Push Notifications
3. Let EAS manage credentials automatically

EAS will:
- Generate Apple Push Notifications certificate
- Upload to Apple Developer Portal
- Store securely in Expo

#### Option B: Manual

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Create a new certificate → Apple Push Notifications service SSL
3. Download the certificate
4. Upload to Expo:

```bash
eas credentials
# Select: iOS → Push Notifications → Upload certificate
```

### For Android (FCM)

#### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Lumbus Mobile"
4. Continue through setup (disable Google Analytics if not needed)

#### 2.2 Add Android App

1. In Firebase project, click "Add app" → Android
2. Enter package name: `com.lumbus.app` (or your package name from `app.config.ts`)
3. Download `google-services.json`

#### 2.3 Configure FCM in Expo

**Method 1: Upload google-services.json**

Place `google-services.json` in project root, then add to `.env`:

```env
GOOGLE_SERVICES_JSON=./google-services.json
```

**Method 2: Use FCM V1 (Modern)**

1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add to Expo:

```bash
eas credentials
# Select: Android → FCM → Upload service account key
```

---

## Step 3: Create Development Build

Development builds include push notification support but still allow hot reloading and debugging.

### 3.1 Build for iOS

```bash
eas build --profile development --platform ios
```

**What happens:**
1. EAS builds the app with push notification capabilities
2. Generates a QR code when complete
3. Uploads build to Expo dashboard

**Installation:**
- Scan QR code with Camera app on iPhone
- Or download from Expo dashboard: https://expo.dev

**First time:** You'll need to register your device UDID with Apple. EAS will guide you through this.

### 3.2 Build for Android

```bash
eas build --profile development --platform android
```

**Installation:**
- Download APK from Expo dashboard
- Transfer to Android device
- Install (you may need to allow "Install from unknown sources")

---

## Step 4: Test Push Notification Registration

### 4.1 Run Development Server

```bash
npx expo start --dev-client
```

### 4.2 Open App on Device

1. Launch the development build you installed in Step 3
2. Scan QR code from Metro bundler
3. App will load

### 4.3 Log In

Log in with a test account. The app will automatically:
1. Request notification permissions
2. Get Expo push token
3. Save token to backend via `POST /user/push-token`

### 4.4 Verify Token Registration

**Check Console Logs:**

Look for these messages:
```
✅ Authenticated as: test@example.com
🔔 Push token: ExponentPushToken[xxxxxxxxxxxxxx]
✅ Push token saved successfully
```

**Check Database:**

```sql
SELECT user_id, push_token, platform, created_at
FROM user_push_tokens
WHERE user_id = 'YOUR_USER_ID';
```

**Expected Result:**
```
| user_id | push_token | platform | created_at |
|---------|------------|----------|------------|
| uuid    | ExponentPushToken[xxx] | ios | 2025-01-15... |
```

✅ **Pass Criteria:** Token is saved in database with correct platform

---

## Step 5: Test Manual Push Notification

Before implementing the full backend notification system, test that push notifications work.

### 5.1 Get Your Push Token

From console logs in Step 4.3, copy the Expo push token:
```
ExponentPushToken[xxxxxxxxxxxxxx]
```

### 5.2 Send Test Notification

**Method A: Expo Push Notification Tool (Easiest)**

1. Go to https://expo.dev/notifications
2. Paste your push token
3. Enter:
   - **Title:** "🎉 Your eSIM is Ready!"
   - **Message:** "Test notification from Expo"
   - **Data (JSON):**
     ```json
     {
       "type": "esim_ready",
       "orderId": "test-123"
     }
     ```
4. Click "Send a Notification"

**Method B: cURL Command**

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
    "title": "🎉 Your eSIM is Ready!",
    "body": "Test notification from cURL",
    "data": {
      "type": "esim_ready",
      "orderId": "test-123"
    }
  }'
```

**Method C: Node.js Script**

Create `test-notification.js`:

```javascript
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const pushToken = 'ExponentPushToken[xxxxxxxxxxxxxx]'; // Your token here

const message = {
  to: pushToken,
  sound: 'default',
  title: '🎉 Your eSIM is Ready!',
  body: 'Test notification from Node.js',
  data: {
    type: 'esim_ready',
    orderId: 'test-123',
  },
};

expo.sendPushNotificationsAsync([message])
  .then(tickets => {
    console.log('✅ Notification sent:', tickets);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
```

Run:
```bash
npm install expo-server-sdk
node test-notification.js
```

### 5.3 Verify Notification Received

**On Device:**
1. Notification should appear on lock screen or notification center
2. Tap notification
3. App should open and navigate to `/install/test-123` (or dashboard if no orderId)

**Troubleshooting:**

If notification doesn't appear:
- [ ] Check device notification settings (Settings → Notifications → Lumbus)
- [ ] Verify push token is correct
- [ ] Check Expo dashboard for delivery errors
- [ ] Ensure app is installed via development build (not Expo Go)
- [ ] Check device is not in Do Not Disturb mode

✅ **Pass Criteria:** Notification appears and tap navigation works

---

## Step 6: Implement Backend Notification System

Now that manual notifications work, implement the automated system.

### 6.1 Install Expo Server SDK (Backend)

On your **backend server**:

```bash
npm install expo-server-sdk
```

### 6.2 Create Notification Service

See `BACKEND_NOTIFICATIONS.md` for complete implementation, but here's a quick example:

**File:** `services/pushNotifications.ts`

```typescript
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: any
) {
  // Get user's push token from database
  const { data: tokenData } = await supabase
    .from('user_push_tokens')
    .select('push_token')
    .eq('user_id', userId)
    .single();

  if (!tokenData?.push_token) {
    console.log('No push token for user:', userId);
    return;
  }

  // Validate token
  if (!Expo.isExpoPushToken(tokenData.push_token)) {
    console.error('Invalid push token:', tokenData.push_token);
    return;
  }

  // Create message
  const message: ExpoPushMessage = {
    to: tokenData.push_token,
    sound: 'default',
    title,
    body,
    data,
  };

  // Send notification
  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    console.log('✅ Notification sent:', tickets);
    return tickets[0];
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}
```

### 6.3 Trigger Notifications

**When eSIM is Ready:**

```typescript
// In your order completion handler
app.post('/api/orders/:orderId/provision', async (req, res) => {
  const { orderId } = req.params;

  // ... provision eSIM logic ...

  // Update order status
  await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId);

  // Send notification
  await sendPushNotification(
    userId,
    '🎉 Your eSIM is Ready!',
    `${orderName} is ready to install. Tap to view installation instructions.`,
    {
      type: 'esim_ready',
      orderId,
      orderName,
      action: 'install',
    }
  );

  res.json({ success: true });
});
```

**When Usage Threshold Reached:**

```typescript
// In your usage monitoring service
async function checkUsageThresholds(orderId: string) {
  const usage = await getUsageData(orderId);

  if (usage.percentageUsed >= 50 && !sentNotifications['50%']) {
    await sendPushNotification(
      userId,
      '📊 50% Data Used',
      `You've used half your data on ${orderName}. ${dataRemaining} GB remaining.`,
      {
        type: 'usage_50',
        orderId,
        orderName,
        dataRemaining,
        percentage: 50,
      }
    );

    // Mark as sent to avoid duplicate notifications
    await markNotificationSent(orderId, 'usage_50');
  }

  // Repeat for 30%, 20%, 10%, 0%
}
```

---

## Step 7: End-to-End Testing

### 7.1 Test eSIM Ready Notification

1. Create a test order in your backend
2. Mark it as completed/provisioned
3. Verify notification is sent
4. Check notification appears on device
5. Tap notification
6. Verify app navigates to `/install/[orderId]`

✅ **Pass Criteria:** Notification received and navigation works

### 7.2 Test Usage Alerts

This requires actual usage data or mock data:

**Option A: Mock Usage Data**

```sql
INSERT INTO esim_usage (order_id, data_used, data_total)
VALUES ('order-uuid', 512, 1024); -- 50% used
```

Then trigger your usage monitoring service to check thresholds.

**Option B: Wait for Real Usage**

After deploying, wait for real usage data to accumulate and verify notifications are sent at correct thresholds.

✅ **Pass Criteria:** Notifications sent at 50%, 30%, 20%, 10%, 0% thresholds

---

## Step 8: Production Deployment

### 8.1 Update Environment Variables

Set production values in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_API_URL=https://getlumbus.com/api
EXPO_PUBLIC_PROJECT_ID=12345678-1234-1234-1234-123456789abc
```

### 8.2 Build for Production

**iOS:**
```bash
eas build --profile production --platform ios
```

**Android:**
```bash
eas build --profile production --platform android
```

### 8.3 Submit to App Stores

**iOS (App Store):**
```bash
eas submit --platform ios
```

You'll need:
- Apple Developer account ($99/year)
- App Store Connect configured
- App screenshots and metadata

**Android (Google Play):**
```bash
eas submit --platform android
```

You'll need:
- Google Play Developer account ($25 one-time)
- Play Console configured
- App screenshots and metadata

---

## Step 9: Monitoring & Analytics

### 9.1 Monitor Push Notification Delivery

**Expo Dashboard:**
1. Go to https://expo.dev
2. Select your project
3. Click "Push Notifications"
4. View delivery stats:
   - Sent
   - Delivered
   - Failed
   - Click rate

### 9.2 Track Notification Engagement

Add analytics to notification handlers in `app/_layout.tsx`:

```typescript
responseListener.current = addNotificationResponseReceivedListener((response) => {
  const data = getNotificationData(response);

  // Track engagement
  console.log('📊 Notification tapped:', data.type);

  // Navigate based on notification type
  if (data.type === NotificationType.ESIM_READY && data.orderId) {
    router.push(`/install/${data.orderId}`);
  }
});
```

### 9.3 Monitor Errors

**Common Issues:**

1. **Invalid Push Token**
   - User uninstalled app
   - User disabled notifications
   - **Solution:** Clean up invalid tokens from database

2. **Delivery Failures**
   - Network issues
   - Expo service issues
   - **Solution:** Implement retry logic

3. **Rate Limiting**
   - Sending too many notifications
   - **Solution:** Implement queuing and batching

**Error Handling:**

```typescript
try {
  const tickets = await expo.sendPushNotificationsAsync([message]);

  // Check for errors
  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      console.error('Push notification error:', ticket.message);

      // If token is invalid, remove from database
      if (ticket.details?.error === 'DeviceNotRegistered') {
        await removeInvalidToken(userId);
      }
    }
  }
} catch (error) {
  console.error('Failed to send push notification:', error);
}
```

---

## Step 10: Production Checklist

Before launching to users:

### Backend
- [ ] `/user/orders` endpoint deployed
- [ ] `/user/push-token` endpoint deployed
- [ ] `user_push_tokens` table created with RLS policies
- [ ] Expo Server SDK installed
- [ ] Notification service implemented
- [ ] Usage monitoring service running
- [ ] Error handling and retry logic implemented
- [ ] Logging and monitoring configured

### Mobile App
- [ ] Production environment variables set
- [ ] Production build created and tested
- [ ] Push notifications tested on physical devices (iOS & Android)
- [ ] Navigation from notifications works
- [ ] App submitted to App Store
- [ ] App submitted to Google Play

### Credentials
- [ ] APNs certificate uploaded to Expo (iOS)
- [ ] FCM configured with Firebase (Android)
- [ ] Expo project ID is valid UUID
- [ ] All credentials stored securely

### Testing
- [ ] eSIM ready notifications work
- [ ] Usage alerts work (50%, 30%, 20%, 10%, 0%)
- [ ] Notification tap navigation works
- [ ] Tokens saved to database correctly
- [ ] Tokens removed on logout
- [ ] Invalid tokens cleaned up automatically

### Monitoring
- [ ] Expo dashboard monitoring set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics tracking notification engagement
- [ ] Logs available for debugging

---

## Troubleshooting

### Issue: Notifications not received

**Checklist:**
1. [ ] Using development/production build (not Expo Go)
2. [ ] Valid project ID in .env (UUID format)
3. [ ] Notification permissions granted on device
4. [ ] Push token saved in database
5. [ ] Push token is valid Expo format
6. [ ] Backend sending notifications correctly
7. [ ] Device not in Do Not Disturb mode
8. [ ] App is installed and logged in

**Debug Steps:**
1. Check console logs for token registration
2. Query database for user's push token
3. Test notification with Expo Push Tool
4. Check Expo dashboard for delivery errors
5. Review backend logs for send errors

### Issue: Navigation doesn't work when tapping notification

**Checklist:**
1. [ ] `data` object includes correct fields (type, orderId)
2. [ ] Notification handler in `app/_layout.tsx` is registered
3. [ ] Router navigation paths are correct
4. [ ] App is in foreground or background (not terminated)

**Fix:**
Review `app/_layout.tsx` notification handler:

```typescript
responseListener.current = addNotificationResponseReceivedListener((response) => {
  const data = getNotificationData(response);

  if (data.type === NotificationType.ESIM_READY && data.orderId) {
    router.push(`/install/${data.orderId}`);
  } else if (data.orderId) {
    router.push('/(tabs)/dashboard');
  }
});
```

### Issue: Push tokens not saving to database

**Checklist:**
1. [ ] Backend endpoint `/user/push-token` is deployed
2. [ ] User is authenticated (has valid session)
3. [ ] Database table `user_push_tokens` exists
4. [ ] RLS policies allow user to insert/update own token
5. [ ] Request includes valid Bearer token

**Debug:**
```typescript
// In lib/notifications.ts
export async function savePushToken(userId: string, token: string) {
  console.log('💾 Saving push token:', { userId, token, platform: Platform.OS });

  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        user_id: userId,
        push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('❌ Error saving push token:', error);
    } else {
      console.log('✅ Push token saved successfully');
    }
  } catch (error) {
    console.error('❌ Exception saving push token:', error);
  }
}
```

---

## Performance Optimization

### Batch Notifications

Instead of sending one at a time:

```typescript
async function sendBatchNotifications(notifications: ExpoPushMessage[]) {
  const chunks = expo.chunkPushNotifications(notifications);

  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending chunk:', error);
    }
  }

  return tickets;
}
```

### Queue System

For high-volume notifications, use a queue (Redis, BullMQ):

```typescript
import Queue from 'bull';

const notificationQueue = new Queue('push-notifications', {
  redis: { host: 'localhost', port: 6379 },
});

notificationQueue.process(async (job) => {
  const { userId, title, body, data } = job.data;
  await sendPushNotification(userId, title, body, data);
});

// Add to queue instead of sending directly
await notificationQueue.add({ userId, title, body, data });
```

---

## Summary

✅ **You've successfully deployed push notifications when:**

1. Users receive "eSIM Ready" notifications when orders complete
2. Users receive usage alerts at 50%, 30%, 20%, 10%, and 0%
3. Tapping notifications navigates correctly in the app
4. Push tokens are saved and managed automatically
5. Invalid tokens are cleaned up
6. Monitoring shows high delivery rates
7. No errors in production logs

**Next Steps:**
- Monitor delivery rates in Expo dashboard
- Track notification engagement with analytics
- Iterate on notification copy and timing
- Add more notification types as needed (promotions, updates, etc.)

---

## Support Resources

- **Expo Push Notifications:** https://docs.expo.dev/push-notifications/overview/
- **Expo Server SDK:** https://github.com/expo/expo-server-sdk-node
- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging
- **Apple Push Notifications:** https://developer.apple.com/documentation/usernotifications
- **Backend Implementation:** See `BACKEND_NOTIFICATIONS.md`
- **API Testing:** See `TEST_API_ENDPOINTS.md`
