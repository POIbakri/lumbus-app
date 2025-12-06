/**
 * WidgetService - Platform-agnostic widget data management
 *
 * This service handles:
 * - Fetching eSIM data from Supabase
 * - Transforming data for widget display
 * - Triggering widget updates on both platforms
 *
 * Platform-specific implementations are in:
 * - WidgetService.ios.ts (iOS native module)
 * - WidgetService.android.ts (Android native module)
 */

import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { logger } from '../logger';
import { COUNTRIES } from '../country-regions';
import {
  WidgetState,
  WidgetEsimData,
  WIDGET_CONSTANTS,
  getEsimStatus,
  bytesToGB,
  calculateDaysRemaining,
} from './types';
import type { Order } from '../../types';

// Import platform-specific implementations
import { updateNativeWidget, isWidgetSupported } from './WidgetBridge';

/**
 * Main WidgetService class
 */
class WidgetServiceClass {
  private lastUpdateTime: number = 0;

  /**
   * Check if widgets are supported on current platform/device
   */
  async isSupported(): Promise<boolean> {
    return isWidgetSupported();
  }

  /**
   * Fetch active eSIMs and update widget
   * Call this when:
   * - App launches
   * - User opens dashboard
   * - Order status changes
   * - Background refresh triggers
   */
  async updateWidget(): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // User not logged in - show empty state
        await this.setWidgetState({
          lastUpdated: new Date().toISOString(),
          appVersion: '1.0.14',
          isLoggedIn: false,
          activeEsims: [],
          totalActiveCount: 0,
          hasActiveEsims: false,
        });
        return;
      }

      // Fetch active orders with plan details
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          data_usage_bytes,
          data_remaining_bytes,
          activate_before,
          created_at,
          plans (
            id,
            name,
            region_code,
            data_gb,
            validity_days
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[WidgetService] Error fetching orders:', error);
        throw error;
      }

      // Transform orders to widget data
      const activeEsims = this.transformOrdersToWidgetData(orders || []);

      // Sort by priority: lowest data remaining → nearest expiry
      activeEsims.sort((a, b) => {
        // Depleted/expired first (need attention)
        if (a.status === 'depleted' || a.status === 'expired') return -1;
        if (b.status === 'depleted' || b.status === 'expired') return 1;

        // Then by usage (highest usage first = lowest remaining)
        if (a.usagePercent !== b.usagePercent) {
          return b.usagePercent - a.usagePercent;
        }

        // Then by days remaining
        return a.daysRemaining - b.daysRemaining;
      });

      // Limit to top 3 for widget display
      const topEsims = activeEsims.slice(0, 3);

      const widgetState: WidgetState = {
        lastUpdated: new Date().toISOString(),
        appVersion: '1.0.14',
        isLoggedIn: true,
        activeEsims: topEsims,
        totalActiveCount: activeEsims.length,
        hasActiveEsims: activeEsims.length > 0,
      };

      await this.setWidgetState(widgetState);
      this.lastUpdateTime = Date.now();

      logger.info(`[WidgetService] Widget updated with ${topEsims.length} eSIMs`);
    } catch (error) {
      logger.error('[WidgetService] Failed to update widget:', error);
      // Don't throw - widget update failures shouldn't break the app
    }
  }

  /**
   * Transform Order objects to WidgetEsimData
   */
  private transformOrdersToWidgetData(orders: any[]): WidgetEsimData[] {
    return orders
      .filter(order => order.plans) // Must have plan data
      .map(order => {
        const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
        if (!plan) return null;

        // Calculate data usage
        const dataTotalBytes = plan.data_gb * 1024 * 1024 * 1024;
        const dataRemainingBytes = order.data_remaining_bytes ?? dataTotalBytes;
        const dataUsedBytes = dataTotalBytes - dataRemainingBytes;
        const usagePercent = Math.min(100, Math.max(0,
          Math.round((dataUsedBytes / dataTotalBytes) * 100)
        ));

        // Get region name
        const regionCode = plan.region_code;
        const country = COUNTRIES[regionCode];
        const regionName = country?.name || this.getRegionDisplayName(regionCode);

        // Calculate days remaining
        const daysRemaining = calculateDaysRemaining(order.activate_before);

        // Determine status
        const isDepleted = order.status === 'depleted' || dataRemainingBytes <= 0;
        const isExpired = order.status === 'expired' || daysRemaining <= 0;
        const status = getEsimStatus(usagePercent, isExpired, isDepleted);

        // Skip if truly expired (more than 0 days past expiry)
        if (isExpired && order.status !== 'active' && order.status !== 'completed') {
          return null;
        }

        return {
          orderId: order.id,
          planName: plan.name,
          regionCode,
          regionName,
          dataUsedBytes,
          dataTotalBytes,
          dataRemainingBytes,
          dataUsedGB: bytesToGB(dataUsedBytes),
          dataTotalGB: bytesToGB(dataTotalBytes),
          dataRemainingGB: bytesToGB(dataRemainingBytes),
          usagePercent,
          activatedAt: order.created_at,
          expiresAt: order.activate_before,
          daysRemaining,
          status,
        } as WidgetEsimData;
      })
      .filter((esim): esim is WidgetEsimData => esim !== null);
  }

  /**
   * Get display name for multi-country regions
   */
  private getRegionDisplayName(regionCode: string): string {
    const regionNames: Record<string, string> = {
      'EU': 'Europe',
      'EUROPE': 'Europe',
      'ASIA': 'Asia',
      'ASIAPLUS': 'Asia+',
      'GLOBAL': 'Global',
      'WORLDWIDE': 'Worldwide',
      'AMERICAS': 'Americas',
      'CARIBBEAN': 'Caribbean',
      'AFRICA': 'Africa',
      'MIDDLE_EAST': 'Middle East',
      'OCEANIA': 'Oceania',
    };

    return regionNames[regionCode.toUpperCase()] || regionCode;
  }

  /**
   * Write widget state to native storage
   */
  private async setWidgetState(state: WidgetState): Promise<void> {
    try {
      await updateNativeWidget(state);
    } catch (error) {
      logger.error('[WidgetService] Failed to set widget state:', error);
    }
  }

  /**
   * Check if widget needs refresh (based on time interval)
   */
  shouldRefresh(): boolean {
    const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;
    return timeSinceLastUpdate >= WIDGET_CONSTANTS.REFRESH_INTERVAL_MS;
  }

  /**
   * Force refresh widget data
   */
  async forceRefresh(): Promise<void> {
    this.lastUpdateTime = 0;
    await this.updateWidget();
  }

  /**
   * Clear widget data (on logout)
   */
  async clearWidget(): Promise<void> {
    await this.setWidgetState({
      lastUpdated: new Date().toISOString(),
      appVersion: '1.0.14',
      isLoggedIn: false,
      activeEsims: [],
      totalActiveCount: 0,
      hasActiveEsims: false,
    });
    logger.info('[WidgetService] Widget cleared');
  }
}

// Export singleton instance
export const WidgetService = new WidgetServiceClass();
