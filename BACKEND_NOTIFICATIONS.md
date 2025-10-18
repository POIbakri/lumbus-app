# Backend Push Notification Setup

This document describes how to implement backend triggers for push notifications including eSIM ready alerts and data usage warnings (50%, 30%, 20%, 10%, and 0%).

## Overview

The app is configured to receive push notifications via Expo Push Notifications service. The backend must send notifications through Expo's API when specific events occur.

## Database Schema

### Required Tables

#### `user_push_tokens`
Stores user push tokens for sending notifications.

```sql
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ios' or 'android'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_push_tokens_user_id ON user_push_tokens(user_id);
```

#### `esim_usage`
Tracks real-time data usage for each eSIM order.

```sql
CREATE TABLE esim_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  data_used BIGINT NOT NULL DEFAULT 0, -- in MB
  data_total BIGINT NOT NULL, -- in MB (from plan.data_gb * 1024)
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

CREATE INDEX idx_esim_usage_order_id ON esim_usage(order_id);
```

#### `usage_notifications_sent`
Tracks which usage notifications have already been sent to avoid duplicates.

```sql
CREATE TABLE usage_notifications_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- '50', '30', '20', '10', '0'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, notification_type)
);

CREATE INDEX idx_usage_notifications_order_id ON usage_notifications_sent(order_id);
```

## Push Notification API

### Expo Push Notifications

Install the Expo Server SDK in your backend:

```bash
npm install expo-server-sdk
```

### Notification Service

Create a notification service in your backend:

```javascript
// backend/services/pushNotifications.js
const { Expo } = require('expo-server-sdk');

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true // Use FCM V1 API
});

async function sendPushNotification(pushToken, title, body, data = {}) {
  // Check that the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return null;
  }

  // Construct the message
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: data.type === 'esim_ready' ? 'esim-ready' : 'usage-alerts',
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticket);
    return ticket[0];
  } catch (error) {
    console.error('Error sending push notification:', error);
    return null;
  }
}

async function sendBatchNotifications(messages) {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending batch notifications:', error);
    }
  }

  return tickets;
}

module.exports = {
  sendPushNotification,
  sendBatchNotifications,
};
```

## Notification Triggers

### 1. eSIM Ready Notification

Trigger when order status changes to 'completed' and eSIM is provisioned.

```javascript
// backend/webhooks/orderCompleted.js
const { sendPushNotification } = require('../services/pushNotifications');
const { supabase } = require('../lib/supabase');

async function handleOrderCompleted(order) {
  // Get user's push token
  const { data: tokenData } = await supabase
    .from('user_push_tokens')
    .select('push_token')
    .eq('user_id', order.user_id)
    .single();

  if (!tokenData || !tokenData.push_token) {
    console.log('No push token found for user:', order.user_id);
    return;
  }

  // Get plan details
  const { data: plan } = await supabase
    .from('plans')
    .select('name')
    .eq('id', order.plan_id)
    .single();

  const planName = plan?.name || 'Your eSIM';

  // Send notification
  await sendPushNotification(
    tokenData.push_token,
    '🎉 Your eSIM is Ready!',
    `${planName} is ready to install. Tap to view installation instructions.`,
    {
      type: 'esim_ready',
      orderId: order.id,
      orderName: planName,
      action: 'install',
    }
  );

  console.log(`eSIM ready notification sent for order ${order.id}`);
}

module.exports = { handleOrderCompleted };
```

### 2. Usage Alert Notifications

Trigger when data usage crosses threshold percentages (50%, 30%, 20%, 10%, 0%).

```javascript
// backend/webhooks/usageUpdated.js
const { sendPushNotification } = require('../services/pushNotifications');
const { supabase } = require('../lib/supabase');

const USAGE_THRESHOLDS = [50, 30, 20, 10, 0];

async function handleUsageUpdate(usage) {
  const { order_id, data_used, data_total } = usage;

  // Calculate percentage used
  const percentageUsed = (data_used / data_total) * 100;

  // Check which threshold was crossed
  let triggeredThreshold = null;
  for (const threshold of USAGE_THRESHOLDS) {
    if (percentageUsed >= (100 - threshold) && percentageUsed < (100 - threshold + 5)) {
      triggeredThreshold = threshold;
      break;
    }
  }

  if (percentageUsed >= 100) {
    triggeredThreshold = 0;
  }

  if (!triggeredThreshold) {
    return; // No threshold crossed
  }

  // Check if notification already sent
  const { data: alreadySent } = await supabase
    .from('usage_notifications_sent')
    .select('id')
    .eq('order_id', order_id)
    .eq('notification_type', triggeredThreshold.toString())
    .single();

  if (alreadySent) {
    console.log(`Notification for ${triggeredThreshold}% already sent for order ${order_id}`);
    return;
  }

  // Get order and user details
  const { data: order } = await supabase
    .from('orders')
    .select('user_id, plan_id')
    .eq('id', order_id)
    .single();

  if (!order) return;

  const { data: plan } = await supabase
    .from('plans')
    .select('name, data_gb')
    .eq('id', order.plan_id)
    .single();

  const { data: tokenData } = await supabase
    .from('user_push_tokens')
    .select('push_token')
    .eq('user_id', order.user_id)
    .single();

  if (!tokenData || !tokenData.push_token) {
    console.log('No push token found for user:', order.user_id);
    return;
  }

  const planName = plan?.name || 'Your eSIM';
  const dataRemaining = ((data_total - data_used) / 1024).toFixed(2); // Convert MB to GB

  // Construct notification based on threshold
  let title, body, notificationType;

  if (triggeredThreshold === 0) {
    title = '📵 No Data Remaining';
    body = `Your ${planName} eSIM has run out of data. Consider purchasing a new plan.`;
    notificationType = 'usage_depleted';
  } else if (triggeredThreshold === 10) {
    title = '⚠️ 10% Data Remaining';
    body = `Your ${planName} eSIM has only ${dataRemaining} GB left. Time to top up!`;
    notificationType = 'usage_10';
  } else if (triggeredThreshold === 20) {
    title = '🔔 20% Data Remaining';
    body = `Your ${planName} eSIM has ${dataRemaining} GB left.`;
    notificationType = 'usage_20';
  } else if (triggeredThreshold === 30) {
    title = '📊 30% Data Remaining';
    body = `Your ${planName} eSIM has ${dataRemaining} GB remaining.`;
    notificationType = 'usage_30';
  } else {
    title = '📊 50% Data Used';
    body = `You've used half your data on ${planName}. ${dataRemaining} GB remaining.`;
    notificationType = 'usage_50';
  }

  // Send notification
  await sendPushNotification(
    tokenData.push_token,
    title,
    body,
    {
      type: notificationType,
      orderId: order_id,
      orderName: planName,
      dataRemaining: parseFloat(dataRemaining),
      percentage: percentageUsed.toFixed(0),
    }
  );

  // Mark notification as sent
  await supabase
    .from('usage_notifications_sent')
    .insert({
      order_id,
      notification_type: triggeredThreshold.toString(),
    });

  console.log(`Usage alert (${triggeredThreshold}%) sent for order ${order_id}`);
}

module.exports = { handleUsageUpdate };
```

### 3. Supabase Database Triggers

Set up Postgres triggers to call your webhooks when data changes:

```sql
-- Function to notify on order completion
CREATE OR REPLACE FUNCTION notify_order_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Call your backend webhook
    PERFORM pg_notify('order_completed', row_to_json(NEW)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_completed_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_completed();

-- Function to notify on usage update
CREATE OR REPLACE FUNCTION notify_usage_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Call your backend webhook
  PERFORM pg_notify('usage_updated', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usage_updated_trigger
AFTER INSERT OR UPDATE ON esim_usage
FOR EACH ROW
EXECUTE FUNCTION notify_usage_updated();
```

## API Endpoints

### GET /usage/:orderId

Returns current usage data for an order.

```javascript
// backend/routes/usage.js
app.get('/usage/:orderId', async (req, res) => {
  const { orderId } = req.params;

  const { data: usage, error } = await supabase
    .from('esim_usage')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !usage) {
    return res.status(404).json({ error: 'Usage data not found' });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('plan_id')
    .eq('id', orderId)
    .single();

  const { data: plan } = await supabase
    .from('plans')
    .select('data_gb')
    .eq('id', order.plan_id)
    .single();

  const dataTotal = (plan?.data_gb || 0) * 1024; // GB to MB
  const dataRemaining = dataTotal - usage.data_used;
  const percentageUsed = (usage.data_used / dataTotal) * 100;

  res.json({
    orderId,
    dataUsed: usage.data_used,
    dataTotal,
    dataRemaining,
    percentageUsed,
    lastUpdated: usage.last_updated,
  });
});
```

## Environment Variables

Add these to your backend `.env`:

```env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
EXPO_PROJECT_ID=your_expo_project_id_here
```

## Testing Notifications

### Test Script

```javascript
// backend/scripts/testNotification.js
const { sendPushNotification } = require('../services/pushNotifications');

async function testNotification() {
  const testToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'; // Replace with real token

  await sendPushNotification(
    testToken,
    '🎉 Test Notification',
    'This is a test notification from Lumbus!',
    {
      type: 'test',
      timestamp: new Date().toISOString(),
    }
  );

  console.log('Test notification sent!');
}

testNotification();
```

Run: `node backend/scripts/testNotification.js`

## Production Checklist

- [ ] Set up Expo project with push notification credentials
- [ ] Configure FCM for Android (google-services.json)
- [ ] Configure APNs for iOS (push notification certificate)
- [ ] Create database tables (user_push_tokens, esim_usage, usage_notifications_sent)
- [ ] Set up Postgres triggers for order completion and usage updates
- [ ] Implement webhook handlers in backend
- [ ] Test notifications on physical devices (iOS & Android)
- [ ] Monitor Expo push notification receipts for errors
- [ ] Set up error logging and alerting

## Notification Flow

1. **User purchases eSIM** → Order created with status 'pending'
2. **eSIM provisioned** → Order status changes to 'completed' → Trigger eSIM ready notification
3. **User installs eSIM** → User starts using data
4. **Usage tracked** → Backend updates `esim_usage` table periodically
5. **Threshold crossed** → Trigger usage alert notification (50%, 30%, 20%, 10%, 0%)
6. **App receives notification** → User taps → Navigates to dashboard or installation screen

## Rate Limiting

Expo has rate limits:
- Free plan: 100 notifications/hour
- Production: Consider upgrading to paid plan for higher limits

Implement queuing and batching for high-volume scenarios.

## Error Handling

Handle these common errors:
- `DeviceNotRegistered`: Remove invalid push tokens from database
- `MessageTooBig`: Reduce notification payload size
- `MessageRateExceeded`: Implement retry logic with exponential backoff
- `InvalidCredentials`: Check Expo access token and project ID

## Monitoring

Track these metrics:
- Notification delivery rate
- User engagement (notification tap-through rate)
- Error rates by notification type
- Average time from event to notification delivery

Use Expo's dashboard or integrate with your monitoring service (DataDog, Sentry, etc.).
