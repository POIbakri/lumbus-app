/**
 * Widget Module Exports
 *
 * Usage:
 * import { WidgetService } from '@/lib/widget';
 *
 * // Update widget with latest data
 * await WidgetService.updateWidget();
 *
 * // Clear widget on logout
 * await WidgetService.clearWidget();
 */

export { WidgetService } from './WidgetService';
export { updateNativeWidget, isWidgetSupported, reloadWidgetTimelines } from './WidgetBridge';
export * from './types';
