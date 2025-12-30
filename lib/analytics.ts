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
    logger.log('[Analytics] Starting trackFirstOpen');

    // Check if we already tracked first open
    const tracked = await AsyncStorage.getItem(FIRST_OPEN_TRACKED_KEY);
    logger.log('[Analytics] Already tracked:', tracked);
    if (tracked === 'true') return;

    const deviceId = Platform.OS === 'ios'
      ? await Application.getIosIdForVendorAsync()
      : Application.getAndroidId();
    logger.log('[Analytics] Device ID:', deviceId);

    const payload = {
      event_type: 'first_open',
      device_id: deviceId,
      platform: Platform.OS,
      app_version: Application.nativeApplicationVersion,
      os_version: Device.osVersion,
      device_model: Device.modelName,
      install_source: Platform.OS === 'ios' ? 'app_store' : 'play_store',
    };
    const analyticsUrl = `${config.apiUrl}/analytics/events`;
    logger.log('[Analytics] URL:', analyticsUrl);
    logger.log('[Analytics] Sending payload:', JSON.stringify(payload));

    const response = await fetch(analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    logger.log('[Analytics] Response status:', response.status);

    if (response.ok) {
      // Set flag FIRST before any JSON parsing that could throw
      await AsyncStorage.setItem(FIRST_OPEN_TRACKED_KEY, 'true');
      logger.log('📊 First open tracked successfully');

      // Try to log response body (optional, won't break if not JSON)
      try {
        const data = await response.json();
        logger.log('[Analytics] Response:', JSON.stringify(data));
      } catch {
        // Response might be empty or non-JSON, that's fine
      }
    } else {
      logger.error('[Analytics] Failed to track first open:', response.status);
    }
  } catch (error) {
    logger.error('[Analytics] Error tracking first open:', error);
  }
}
