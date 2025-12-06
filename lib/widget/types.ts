/**
 * Widget Data Types for Lumbus eSIM Widget
 * Shared between iOS (Swift) and Android (Kotlin/JSX) widgets
 */

/**
 * Individual eSIM data for display in widget
 */
export interface WidgetEsimData {
  // Identifiers
  orderId: string;

  // Plan information
  planName: string;           // e.g., "EU 10GB / 14 days"
  regionCode: string;         // e.g., "ES", "JP", "EU", "ASIA"
  regionName: string;         // e.g., "Spain", "Japan", "Europe"

  // Data usage (in bytes for precision, converted to GB for display)
  dataUsedBytes: number;
  dataTotalBytes: number;
  dataRemainingBytes: number;

  // Computed display values
  dataUsedGB: number;         // Rounded to 1 decimal
  dataTotalGB: number;
  dataRemainingGB: number;
  usagePercent: number;       // 0-100

  // Validity
  activatedAt: string | null; // ISO timestamp
  expiresAt: string | null;   // ISO timestamp
  daysRemaining: number;      // Computed days left

  // Status for UI coloring
  status: 'active' | 'low' | 'critical' | 'depleted' | 'expired';
}

/**
 * Complete widget state stored in shared storage
 */
export interface WidgetState {
  // Metadata
  lastUpdated: string;        // ISO timestamp
  appVersion: string;

  // User state
  isLoggedIn: boolean;

  // eSIM data (sorted by priority: lowest data → nearest expiry)
  activeEsims: WidgetEsimData[];

  // Quick stats
  totalActiveCount: number;
  hasActiveEsims: boolean;
}

/**
 * Widget configuration for shared storage keys
 */
export const WIDGET_CONSTANTS = {
  // iOS App Group identifier (must match app.config.ts)
  IOS_APP_GROUP: 'group.com.lumbus.app.widget',

  // Android SharedPreferences name
  ANDROID_SHARED_PREFS: 'lumbus_widget_prefs',

  // Storage keys
  STORAGE_KEY: 'lumbus_widget_data',

  // Refresh intervals
  REFRESH_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes

  // Widget identifiers
  IOS_WIDGET_KIND: 'LumbusWidget',
  ANDROID_WIDGET_NAME: 'LumbusEsimWidget',
} as const;

/**
 * Deep link URLs for widget tap actions
 */
export const WIDGET_DEEP_LINKS = {
  DASHBOARD: 'lumbus://dashboard',
  BROWSE: 'lumbus://browse',
  ESIM_DETAILS: (orderId: string) => `lumbus://esim-details/${orderId}`,
  TOP_UP: (orderId: string) => `lumbus://topup/${orderId}`,
} as const;

/**
 * Color constants matching Lumbus brand (from colourway.txt)
 */
export const WIDGET_COLORS = {
  // Primary brand colors
  PRIMARY: '#2EFECC',         // Turquoise/Mint - main accent
  SECONDARY: '#FDFD74',       // Yellow - secondary accent
  ACCENT_CYAN: '#87EFFF',     // Cyan - highlights

  // Background colors
  BACKGROUND: '#FFFFFF',      // White
  BACKGROUND_MUTED: '#F5F5F5', // Light gray
  BACKGROUND_MINT: '#E0FEF7', // Light mint

  // Text colors
  TEXT_PRIMARY: '#1A1A1A',    // Near black
  TEXT_SECONDARY: '#666666',  // Muted gray

  // Progress bar colors
  PROGRESS_ACTIVE: '#2EFECC', // Turquoise when healthy
  PROGRESS_LOW: '#FDFD74',    // Yellow when <20%
  PROGRESS_CRITICAL: '#EF4444', // Red when <10%
  PROGRESS_EMPTY: '#E5E5E5',  // Gray track
  PROGRESS_DEPLETED: '#9CA3AF', // Muted gray for depleted

  // Border
  BORDER: '#E5E5E5',

  // Error/Warning
  DESTRUCTIVE: '#EF4444',
} as const;

/**
 * Utility to determine status based on usage percentage
 */
export function getEsimStatus(usagePercent: number, isExpired: boolean, isDepleted: boolean): WidgetEsimData['status'] {
  if (isExpired) return 'expired';
  if (isDepleted) return 'depleted';
  if (usagePercent >= 90) return 'critical';
  if (usagePercent >= 80) return 'low';
  return 'active';
}

/**
 * Utility to get progress bar color based on status
 */
export function getProgressColor(status: WidgetEsimData['status']): string {
  switch (status) {
    case 'critical':
      return WIDGET_COLORS.PROGRESS_CRITICAL;
    case 'low':
      return WIDGET_COLORS.PROGRESS_LOW;
    case 'depleted':
    case 'expired':
      return WIDGET_COLORS.PROGRESS_DEPLETED;
    default:
      return WIDGET_COLORS.PROGRESS_ACTIVE;
  }
}

/**
 * Bytes to GB conversion utility
 */
export function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

/**
 * Calculate days remaining from expiry date
 */
export function calculateDaysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
