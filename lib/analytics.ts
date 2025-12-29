import * as Application from 'expo-application';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { config } from './config';
import { logger } from './logger';

const FIRST_OPEN_TRACKED_KEY = 'first_open_tracked';

/**
 * Tracks the first time the app is opened on this device.
 * Sends device info to the analytics API for install attribution.
 */
export async function trackFirstOpen(): Promise<void> {
  try {
    // Check if we already tracked first open
    const tracked = await AsyncStorage.getItem(FIRST_OPEN_TRACKED_KEY);
    if (tracked) return;

    const deviceId = Platform.OS === 'ios'
      ? await Application.getIosIdForVendorAsync()
      : Application.getAndroidId();

    const response = await fetch(`${config.apiUrl}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'first_open',
        device_id: deviceId,
        platform: Platform.OS,
        app_version: Application.nativeApplicationVersion,
        os_version: Device.osVersion,
        device_model: Device.modelName,
        install_source: Platform.OS === 'ios' ? 'app_store' : 'play_store',
      }),
    });

    if (response.ok) {
      await AsyncStorage.setItem(FIRST_OPEN_TRACKED_KEY, 'true');
      logger.log('📊 First open tracked successfully');
    } else {
      logger.error('Failed to track first open:', response.status);
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    logger.error('Error tracking first open:', error);
  }
}
