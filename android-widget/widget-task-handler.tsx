/**
 * Widget Task Handler - Background Widget Updates for Android
 *
 * This file handles widget rendering when the app is in the background.
 * It's the entry point for react-native-android-widget to render widgets.
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LumbusWidget } from './LumbusWidget';
import type { WidgetState } from '../lib/widget/types';
import { WIDGET_CONSTANTS } from '../lib/widget/types';

// Widget task handler props type
interface WidgetTaskHandlerProps {
  widgetAction: string;
  widgetInfo: {
    widgetId: number;
    width: number;
    height: number;
  };
}

/**
 * Determine widget size from dimensions
 */
function getWidgetSize(
  width: number,
  height: number
): 'small' | 'medium' | 'large' {
  // Android widget cell sizes vary by device
  // Small: 2x2 cells (~150x150 dp)
  // Medium: 4x2 cells (~300x150 dp)
  // Large: 4x4 cells (~300x300 dp)

  if (height > 250) {
    return 'large';
  }
  if (width > 250) {
    return 'medium';
  }
  return 'small';
}

/**
 * Load widget data from storage
 */
async function loadWidgetData(): Promise<WidgetState | null> {
  try {
    const jsonData = await AsyncStorage.getItem(WIDGET_CONSTANTS.STORAGE_KEY);
    if (!jsonData) {
      return null;
    }
    return JSON.parse(jsonData) as WidgetState;
  } catch (error) {
    console.error('[WidgetTaskHandler] Failed to load widget data:', error);
    return null;
  }
}

/**
 * Widget Task Handler
 *
 * This function is called by react-native-android-widget when the widget
 * needs to be rendered (on add, update, or resize).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<React.ReactElement> {
  const { widgetInfo } = props;

  // Load data from storage
  const widgetData = await loadWidgetData();

  // Determine size from widget dimensions
  const size = getWidgetSize(
    widgetInfo?.width ?? 150,
    widgetInfo?.height ?? 150
  );

  console.log(`[WidgetTaskHandler] Rendering ${size} widget`);

  return <LumbusWidget widgetData={widgetData} size={size} />;
}

export default widgetTaskHandler;
