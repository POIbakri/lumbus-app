import { Platform } from 'react-native';
// Use v13 IAP service for iOS to avoid NitroIap issues
import { IAPServiceV13 } from './IAPServiceV13.ios';
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
}

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  error?: string;
}

class PaymentServiceClass {
  private iapService: IAPServiceV13;
  private stripeService: StripeService;
  private initialized = false;

  constructor() {
    this.iapService = new IAPServiceV13();
    this.stripeService = new StripeService();
  }

  /**
   * Initialize the payment service
   * Must be called before any purchase attempts
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (Platform.OS === 'ios') {
        await this.iapService.initialize();
        logger.log('✅ iOS IAP Service initialized');
      } else {
        await this.stripeService.initialize();
        logger.log('✅ Android Stripe Service initialized');
      }
      this.initialized = true;
    } catch (error) {
      logger.error('❌ Payment service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Process a purchase using platform-specific payment method
   */
  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    if (!this.initialized) {
      throw new Error('Payment service not initialized. Call initialize() first.');
    }

    try {
      if (Platform.OS === 'ios') {
        logger.log('🍎 Processing via Apple IAP');
        return await this.iapService.purchase(params);
      } else {
        logger.log('🤖 Processing via Stripe');
        return await this.stripeService.purchase(params);
      }
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
    if (Platform.OS === 'ios') {
      return await this.iapService.getProducts(productIds);
    }
    // Android doesn't need to pre-fetch products
    return [];
  }

  /**
   * Restore purchases (iOS only)
   * Useful for users who reinstalled the app or switched devices
   */
  async restorePurchases(): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.iapService.restorePurchases();
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await this.iapService.cleanup();
      }
      // Stripe doesn't need cleanup
      this.initialized = false;
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
