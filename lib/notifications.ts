import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { logger } from './logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification categories for different types
export enum NotificationType {
  ESIM_READY = 'esim_ready',
  USAGE_50 = 'usage_50',
  USAGE_30 = 'usage_30',
  USAGE_20 = 'usage_20',
  USAGE_10 = 'usage_10',
  USAGE_DEPLETED = 'usage_depleted',
}

// Register for push notifications
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    logger.log('Must use physical device for push notifications');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.log('Failed to get push notification permissions');
    return null;
  }

  // Get push token
  // NOTE: For Expo Go, push notifications don't work fully. Use development build.
  // For now, we'll skip token registration in Expo Go
  try {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;

    // Skip if no valid project ID (likely using Expo Go for development)
    if (!projectId || projectId === 'local-dev') {
      logger.log('⚠️ No valid Expo project ID. Push notifications disabled in development.');
      logger.log('💡 Use a development build for full push notification support.');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2EFECC',
        });

        // Create specific channels for different notification types
        await Notifications.setNotificationChannelAsync('esim-ready', {
          name: 'eSIM Ready',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2EFECC',
          description: 'Notifications when your eSIM is ready to install',
        });

        await Notifications.setNotificationChannelAsync('usage-alerts', {
          name: 'Usage Alerts',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#FDFD74',
          description: 'Data usage alerts and warnings',
        });
      }

    return token.data;
  } catch (error: any) {
    logger.error('Failed to get push token:', error.message);
    logger.log('💡 Push notifications require a development build, not Expo Go.');
    return null;
  }
}

// Save push token to database
export async function savePushToken(userId: string, token: string) {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        user_id: userId,
        push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id',
      });

    if (error) {
      logger.error('Error saving push token:', error);
    }
  } catch (error) {
    logger.error('Error saving push token:', error);
  }
}

// Schedule local notification for testing
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 5
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

// Send immediate local notification
export async function sendLocalNotification(
  title: string,
  body: string,
  type: NotificationType,
  data?: any
) {
  const channelId = type === NotificationType.ESIM_READY ? 'esim-ready' : 'usage-alerts';

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        type,
        ...data,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      categoryIdentifier: type,
      ...(Platform.OS === 'android' && { channelId }),
    },
    trigger: null, // Immediate
  });
}

// Notification handlers
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Get notification data from response
export function getNotificationData(response: Notifications.NotificationResponse) {
  return response.notification.request.content.data;
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

// Helper function to send usage alert notification
export async function sendUsageAlert(
  percentage: number,
  orderName: string,
  dataRemaining: number,
  orderId: string
) {
  let title = '';
  let body = '';
  let type: NotificationType;

  if (percentage <= 0) {
    title = '📵 No Data Remaining';
    body = `Your ${orderName} eSIM has run out of data. Consider purchasing a new plan.`;
    type = NotificationType.USAGE_DEPLETED;
  } else if (percentage <= 10) {
    title = '⚠️ 10% Data Remaining';
    body = `Your ${orderName} eSIM has only ${dataRemaining} GB left. Time to top up!`;
    type = NotificationType.USAGE_10;
  } else if (percentage <= 20) {
    title = '🔔 20% Data Remaining';
    body = `Your ${orderName} eSIM has ${dataRemaining} GB left.`;
    type = NotificationType.USAGE_20;
  } else if (percentage <= 30) {
    title = '📊 30% Data Remaining';
    body = `Your ${orderName} eSIM has ${dataRemaining} GB remaining.`;
    type = NotificationType.USAGE_30;
  } else {
    title = '📊 50% Data Used';
    body = `You've used half your data on ${orderName}. ${dataRemaining} GB remaining.`;
    type = NotificationType.USAGE_50;
  }

  await sendLocalNotification(title, body, type, {
    orderId,
    orderName,
    dataRemaining,
    percentage,
  });
}

// Helper function to send eSIM ready notification
export async function sendEsimReadyNotification(
  orderName: string,
  orderId: string
) {
  await sendLocalNotification(
    '🎉 Your eSIM is Ready!',
    `${orderName} is ready to install. Tap to view installation instructions.`,
    NotificationType.ESIM_READY,
    {
      orderId,
      orderName,
      action: 'install',
    }
  );
}
