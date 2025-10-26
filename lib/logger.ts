/**
 * Conditional Logger Utility
 *
 * Only logs in development mode to prevent sensitive data leakage in production.
 * For production error tracking, integrate with a service like Sentry.
 */

// Check if we're in development mode
// __DEV__ is a global variable set by React Native/Expo
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log info (alias for log)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors
   * In dev: logs to console
   * In production: should send to error tracking service
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(args[0]);
      // For now, we silently suppress to prevent data leakage
    }
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (dev only)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
