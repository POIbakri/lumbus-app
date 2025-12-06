/**
 * WidgetBridge - Native module bridge for widget updates
 *
 * iOS: Uses native WidgetBridge module to write to shared UserDefaults (App Group)
 * Android: Uses react-native-android-widget with AsyncStorage
 *
 * The iOS widget is pure Swift and completely independent of React Native.
 */

import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logger';
import type { WidgetState } from './types';
import { WIDGET_CONSTANTS } from './types';

// Type declarations for native modules
interface IOSWidgetBridge {
  updateWidget: (data: Record<string, any>) => void;
  clearWidget: () => void;
}

interface AndroidWidgetModule {
  updateWidget: (data: string, widgetName: string) => Promise<void>;
  isWidgetSupported: () => Promise<boolean>;
}

// Get native modules (may be undefined in Expo Go or before prebuild)
const WidgetBridge = NativeModules.WidgetBridge as IOSWidgetBridge | undefined;
const AndroidWidget = NativeModules.LumbusWidgetModule as AndroidWidgetModule | undefined;

/**
 * Check if widget functionality is supported on current device
 */
export async function isWidgetSupported(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      // iOS widgets require iOS 14+ (we target 16.0+ for full features)
      const iosVersion = parseInt(Platform.Version as string, 10);
      return iosVersion >= 14;
    }

    if (Platform.OS === 'android') {
      // Android widgets are supported on all versions we target
      if (AndroidWidget?.isWidgetSupported) {
        return await AndroidWidget.isWidgetSupported();
      }
      return true;
    }

    return false;
  } catch (error) {
    logger.warn('[WidgetBridge] Could not check widget support:', error);
    return false;
  }
}

/**
 * Update the native widget with new data
 *
 * iOS: Writes to UserDefaults (App Group) via native WidgetBridge module
 * Android: Writes to AsyncStorage and broadcasts widget update intent
 */
export async function updateNativeWidget(state: WidgetState): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await updateIOSWidget(state);
    } else if (Platform.OS === 'android') {
      await updateAndroidWidget(state);
    }
  } catch (error) {
    logger.error('[WidgetBridge] Failed to update native widget:', error);
    throw error;
  }
}

/**
 * iOS-specific widget update
 * Uses native WidgetBridge module to write to App Group UserDefaults
 */
async function updateIOSWidget(state: WidgetState): Promise<void> {
  if (!WidgetBridge) {
    logger.warn('[WidgetBridge] iOS native module not available (Expo Go?)');
    return;
  }

  // Get the primary eSIM data for the widget
  const primaryEsim = state.activeEsims[0];

  // Prepare data for native module
  const widgetData: Record<string, any> = {
    isLoggedIn: state.isLoggedIn,
    hasActiveEsim: state.hasActiveEsims,
  };

  if (primaryEsim) {
    widgetData.dataLeftGB = primaryEsim.dataRemainingGB;
    widgetData.dataTotalGB = primaryEsim.dataTotalGB;
    widgetData.usagePercent = primaryEsim.usagePercent;
    widgetData.country = primaryEsim.regionName;
    widgetData.countryCode = primaryEsim.regionCode;
    widgetData.expiresAt = primaryEsim.expiresAt || '';
    widgetData.daysRemaining = primaryEsim.daysRemaining;
    widgetData.planName = primaryEsim.planName;
  }

  try {
    WidgetBridge.updateWidget(widgetData);
    logger.info('[WidgetBridge] iOS widget updated via native module');
  } catch (error) {
    logger.error('[WidgetBridge] Failed to update iOS widget:', error);
  }
}

/**
 * Android-specific widget update
 */
async function updateAndroidWidget(state: WidgetState): Promise<void> {
  const jsonData = JSON.stringify(state);

  // Store data in AsyncStorage for widget to read
  try {
    await AsyncStorage.setItem(WIDGET_CONSTANTS.STORAGE_KEY, jsonData);
  } catch (e) {
    logger.warn('[WidgetBridge] Failed to save to AsyncStorage:', e);
  }

  if (AndroidWidget) {
    // Use native module if available
    await AndroidWidget.updateWidget(jsonData, WIDGET_CONSTANTS.ANDROID_WIDGET_NAME);
    logger.info('[WidgetBridge] Android widget updated via native module');
    return;
  }

  // Try react-native-android-widget if available
  try {
    // Dynamic import to avoid build errors if not installed
    const androidWidget = require('react-native-android-widget');

    if (androidWidget && typeof androidWidget.requestWidgetUpdate === 'function') {
      await androidWidget.requestWidgetUpdate({
        widgetName: WIDGET_CONSTANTS.ANDROID_WIDGET_NAME,
        renderWidget: () => null, // Widget will read from AsyncStorage
        widgetNotFound: () => {
          logger.warn('[WidgetBridge] Android widget not found on home screen');
        },
      });
      logger.info('[WidgetBridge] Android widget updated via requestWidgetUpdate');
    }
  } catch (e) {
    // Android widget library not available, that's OK in Expo Go
    logger.warn('[WidgetBridge] Android widget library not available:', e);
  }
}

/**
 * Clear widget data (on logout)
 */
export async function clearNativeWidget(): Promise<void> {
  try {
    if (Platform.OS === 'ios' && WidgetBridge) {
      WidgetBridge.clearWidget();
      logger.info('[WidgetBridge] iOS widget cleared');
    } else if (Platform.OS === 'android') {
      // Clear AsyncStorage and update widget
      await AsyncStorage.removeItem(WIDGET_CONSTANTS.STORAGE_KEY);
      // Trigger widget update with empty state
      await updateAndroidWidget({
        lastUpdated: new Date().toISOString(),
        appVersion: '1.0.14',
        isLoggedIn: false,
        activeEsims: [],
        totalActiveCount: 0,
        hasActiveEsims: false,
      });
      logger.info('[WidgetBridge] Android widget cleared');
    }
  } catch (error) {
    logger.warn('[WidgetBridge] Failed to clear widget:', error);
  }
}

/**
 * Force reload all widget timelines (iOS only)
 * Call this after significant data changes
 */
export async function reloadWidgetTimelines(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  // The native WidgetBridge.updateWidget already calls WidgetCenter.shared.reloadAllTimelines()
  // So this is a no-op - the widget reloads automatically on update
  logger.info('[WidgetBridge] Widget timelines reload triggered via update');
}
