import { Platform } from 'react-native';
import { StripeService } from './StripeService';
import { logger } from '../logger';

/**
 * Unified Payment Service
 *
 * Handles platform-specific payment processing:
 * - iOS: Apple In-App Purchase (IAP) - 15-30% commission to Apple
 * - Android: Stripe - Keep 97%+ after payment processing fees
 *
 * This abstraction ensures the same API surface across platforms
 * while using the optimal payment method for each platform.
 */

export interface PurchaseParams {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  email: string;
  userId: string;
  isTopUp?: boolean;
  existingOrderId?: string;
  iccid?: string;
  referralCode?: string; // Optional referral code for discount
}

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  error?: string;
}

class PaymentServiceClass {
  private stripeService: StripeService;
  private initialized = false;
  private initializing: Promise<void> | null = null;

  constructor() {
    this.stripeService = new StripeService();
  }

  /**
   * Initialize the payment service
   * Must be called before any purchase attempts
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) {
      // If initialization is already in progress, wait for it to complete
      return this.initializing;
    }

    this.initializing = (async () => {
      try {
        await this.stripeService.initialize();
        logger.log(
          Platform.OS === 'ios'
            ? '✅ Stripe Service initialized for iOS (Apple Pay + cards)'
            : '✅ Stripe Service initialized for Android (Google Pay + cards)'
        );
        this.initialized = true;
      } catch (error) {
        logger.error('❌ Payment service initialization failed:', error);
        throw error;
      } finally {
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  /**
   * Process a purchase using platform-specific payment method
   */
  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    // Ensure initialization is complete before attempting a purchase.
    // This also safely handles the case where initialize() was triggered
    // but has not yet finished when the user taps "Buy now".
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.log(
        Platform.OS === 'ios'
          ? '🍎 Processing payment via Stripe (Apple Pay / card)'
          : '🤖 Processing payment via Stripe (Google Pay / card)'
      );
      return await this.stripeService.purchase(params);
    } catch (error: any) {
      logger.error('❌ Purchase failed:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed. Please try again.',
      };
    }
  }

  /**
   * Get available products (iOS only - Stripe creates products dynamically)
   */
  async getProducts(productIds: string[]): Promise<any[]> {
    // With Stripe on both platforms, products are defined server-side,
    // so the mobile app does not need to prefetch them.
    return [];
  }

  /**
   * Restore purchases (iOS only)
   * Useful for users who reinstalled the app or switched devices
   */
  async restorePurchases(): Promise<void> {
    // Stripe-based payments do not require client-side "restore" logic
    // because entitlements come from your backend based on the user's account.
    logger.log('ℹ️ restorePurchases() called - no-op for Stripe-based payments');
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      // Stripe does not require explicit cleanup; we just reset the flags.
      this.initialized = false;
      this.initializing = null;
    } catch (error) {
      logger.error('Payment service cleanup error:', error);
    }
  }

  /**
   * Get the payment method name for display purposes
   */
  getPaymentMethodName(): string {
    return Platform.OS === 'ios' ? 'Apple Pay' : 'Credit/Debit Card';
  }

  /**
   * Check if the platform supports the payment method
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

// Singleton instance
export const PaymentService = new PaymentServiceClass();
