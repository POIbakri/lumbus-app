/**
 * Order Polling with Exponential Backoff
 *
 * This module ensures orders complete successfully after payment
 * by polling the order status with exponential backoff.
 */

import { fetchOrderById } from './api';
import { Order } from '../types';
import { logger } from './logger';

export interface PollingOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  onStatusUpdate?: (order: Order) => void;
  onError?: (error: Error) => void;
}

export interface PollingResult {
  success: boolean;
  order?: Order;
  error?: string;
  attempts: number;
  timedOut: boolean;
}

/**
 * Poll order status with exponential backoff
 *
 * @param orderId - The order ID to poll
 * @param options - Polling configuration options
 * @returns Promise with the polling result
 */
export async function pollOrderStatus(
  orderId: string,
  options: PollingOptions = {}
): Promise<PollingResult> {
  const {
    maxAttempts = 10,
    initialDelay = 2000,
    maxDelay = 30000,
    onStatusUpdate,
    onError
  } = options;

  let attempts = 0;

  logger.log(`📊 Starting order polling for ${orderId}`);

  const poll = async (): Promise<PollingResult> => {
    try {
      attempts++;
      logger.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`);

      // Fetch current order status
      const order = await fetchOrderById(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Notify status update callback
      if (onStatusUpdate) {
        onStatusUpdate(order);
      }

      // Check if order is complete with activation details
      if (order.status === 'completed' && order.activation_code && order.smdp) {
        logger.log('✅ Order completed successfully!');
        return {
          success: true,
          order,
          attempts,
          timedOut: false
        };
      }

      // Check if order is active (for existing eSIMs being topped up)
      if (order.status === 'active' && order.activation_code && order.smdp) {
        logger.log('✅ Order is active and ready!');
        return {
          success: true,
          order,
          attempts,
          timedOut: false
        };
      }

      // Check for terminal failure states
      if (order.status === 'failed' || order.status === 'cancelled' || order.status === 'revoked' || order.status === 'refunded') {
        logger.error(`❌ Order ${order.status}`);
        return {
          success: false,
          order,
          error: `Order ${order.status}`,
          attempts,
          timedOut: false
        };
      }

      // Check for terminal states that are not failures but should stop polling
      if (order.status === 'depleted' || order.status === 'expired') {
        logger.log(`⚠️ Order is ${order.status}, stopping poll`);
        return {
          success: false,
          order,
          error: `Order is ${order.status}`,
          attempts,
          timedOut: false
        };
      }

      // Continue polling if not at max attempts
      if (attempts < maxAttempts) {
        // Calculate delay with exponential backoff
        const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay);
        logger.log(`⏱️ Waiting ${delay}ms before next poll...`);

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));

        // Recursive poll
        return poll();
      }

      // Max attempts reached - order stuck
      logger.error(`⏰ Order polling timed out after ${attempts} attempts`);
      return {
        success: false,
        order,
        error: 'Order processing is taking longer than expected',
        attempts,
        timedOut: true
      };

    } catch (error) {
      logger.error('❌ Polling error:', error);

      // Notify error callback
      if (onError && error instanceof Error) {
        onError(error);
      }

      // Retry if not at max attempts
      if (attempts < maxAttempts) {
        const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        return poll();
      }

      // Max attempts reached with error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts,
        timedOut: true
      };
    }
  };

  return poll();
}

/**
 * Quick poll with shorter timeout for immediate checks
 */
export async function quickPollOrder(orderId: string): Promise<PollingResult> {
  return pollOrderStatus(orderId, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000
  });
}

/**
 * Extended poll for background processing
 */
export async function extendedPollOrder(orderId: string): Promise<PollingResult> {
  return pollOrderStatus(orderId, {
    maxAttempts: 30,
    initialDelay: 3000,
    maxDelay: 60000
  });
}

/**
 * Check if an order needs polling
 */
export function shouldPollOrder(order: Order | null): boolean {
  if (!order) return false;

  // Poll if order is in transitional states
  const transitionalStates = ['pending', 'paid', 'provisioning'];
  if (transitionalStates.includes(order.status)) {
    return true;
  }

  // Poll if order is completed but missing activation details
  if (order.status === 'completed' && (!order.activation_code || !order.smdp)) {
    return true;
  }

  // Don't poll terminal states
  const terminalStates = ['failed', 'cancelled', 'revoked', 'refunded', 'expired', 'depleted'];
  if (terminalStates.includes(order.status)) {
    return false;
  }

  return false;
}

/**
 * Format polling status for UI display
 */
export function formatPollingStatus(attempts: number, maxAttempts: number): string {
  if (attempts === 1) {
    return 'Checking order status...';
  }
  if (attempts < maxAttempts / 2) {
    return 'Processing your eSIM...';
  }
  if (attempts < maxAttempts) {
    return 'Almost ready, please wait...';
  }
  return 'This is taking longer than expected...';
}

/**
 * Get user-friendly error message
 */
export function getPollingErrorMessage(result: PollingResult): string {
  if (result.timedOut) {
    return 'Your eSIM is taking longer than expected to process. Please check back in a few minutes or contact support if the issue persists.';
  }

  if (result.error?.includes('failed')) {
    return 'Order processing failed. Please contact support for assistance.';
  }

  if (result.error?.includes('cancelled')) {
    return 'Order was cancelled. Please try again or contact support.';
  }

  if (result.error?.includes('revoked')) {
    return 'eSIM was revoked. Please contact support for assistance.';
  }

  if (result.error?.includes('refunded')) {
    return 'Order was refunded. Please check your payment method for the refund.';
  }

  if (result.error?.includes('depleted')) {
    return 'Your eSIM data has been fully used. Please purchase a new plan or top-up.';
  }

  if (result.error?.includes('expired')) {
    return 'Your eSIM has expired. Please purchase a new plan to continue using the service.';
  }

  if (result.error?.includes('not found')) {
    return 'Order not found. Please contact support with your order details.';
  }

  return result.error || 'An unexpected error occurred. Please try again.';
}

/**
 * Calculate total wait time for UI display
 */
export function calculateTotalWaitTime(maxAttempts: number, initialDelay: number, maxDelay: number): number {
  let totalTime = 0;
  for (let i = 0; i < maxAttempts; i++) {
    const delay = Math.min(initialDelay * Math.pow(2, i), maxDelay);
    totalTime += delay;
  }
  return totalTime;
}

// Export delay calculations for testing
export function calculateDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  return Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
}