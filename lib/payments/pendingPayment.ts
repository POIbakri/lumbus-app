/**
 * Pending Payment State Management
 *
 * Handles storage and retrieval of pending payment state for 3DS returns.
 * When a user is redirected to their bank for 3DS authentication and returns,
 * we need to know which order was being processed.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logger';

const PENDING_PAYMENT_KEY = '@lumbus_pending_payment';

export interface PendingPayment {
  orderId: string;
  planId: string;
  planName: string;
  isTopUp: boolean;
  timestamp: number;
}

/**
 * Store pending payment state before presenting payment sheet
 */
export async function storePendingPayment(payment: Omit<PendingPayment, 'timestamp'>): Promise<void> {
  try {
    const data: PendingPayment = {
      ...payment,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data));
    logger.log('💾 Stored pending payment:', data.orderId);
  } catch (error) {
    logger.error('Error storing pending payment:', error);
  }
}

/**
 * Get pending payment state
 */
export async function getPendingPayment(): Promise<PendingPayment | null> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
    if (!stored) return null;

    const data: PendingPayment = JSON.parse(stored);

    // Expire pending payments after 10 minutes
    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - data.timestamp > TEN_MINUTES) {
      await clearPendingPayment();
      logger.log('⏰ Pending payment expired');
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error getting pending payment:', error);
    return null;
  }
}

/**
 * Clear pending payment state
 */
export async function clearPendingPayment(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
    logger.log('🗑️ Cleared pending payment');
  } catch (error) {
    logger.error('Error clearing pending payment:', error);
  }
}

/**
 * Check if there's a valid pending payment
 */
export async function hasPendingPayment(): Promise<boolean> {
  const payment = await getPendingPayment();
  return payment !== null;
}
