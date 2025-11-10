import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { logger } from './logger';

// Define the background notification task name
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Define the background task handler
// This runs even when the app is closed or in the background
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    logger.error('Background notification error:', error);
    return;
  }

  if (data) {
    const notification = data.notification as Notifications.Notification;
    logger.log('Received background notification:', notification);

    // Update badge count for unread notifications
    try {
      const currentBadge = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(currentBadge + 1);
    } catch (err) {
      logger.error('Error updating badge in background:', err);
    }

    // You can perform background tasks here, like:
    // - Updating local database
    // - Syncing with server
    // - Pre-fetching data for faster app launch
    // - Updating widget data (iOS)
  }
});

// Register the background notification task
export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    logger.log('Background notification task registered');
  } catch (err) {
    logger.error('Failed to register background notification task:', err);
  }
}

// Unregister the background notification task (cleanup)
export async function unregisterBackgroundNotificationTask() {
  try {
    await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    logger.log('Background notification task unregistered');
  } catch (err) {
    logger.error('Failed to unregister background notification task:', err);
  }
}
