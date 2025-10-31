import { Platform } from 'react-native';
import { logger } from '../logger';
import { PurchaseParams, PurchaseResult } from './PaymentService';
import { createCheckout } from '../api';
import { config } from '../config';

// Dynamically load stripe module only when needed (Android) to avoid iOS native initialization
let stripeModule: any | null = null;
async function getStripeModule() {
  if (!stripeModule) {
    stripeModule = await import('@stripe/stripe-react-native');
  }
  return stripeModule;
}

/**
 * Android Stripe Payment Service
 *
 * Handles all Stripe transactions for Android including:
 * - Payment sheet initialization
 * - Credit/debit card processing
 * - Google Pay integration (automatic)
 * - Link (Stripe's one-click checkout)
 *
 * Benefits for Android:
 * - No Google commission (Google allows external payments)
 * - Keep ~97% after Stripe fees (2.9% + $0.30)
 * - Support for international cards
 * - Multi-currency support
 * - Instant refunds via Stripe dashboard
 *
 * Stripe automatically supports:
 * - Credit/Debit cards (Visa, Mastercard, Amex, etc.)
 * - Google Pay (if available on device)
 * - Link (Stripe's one-click payment)
 */
export class StripeService {
  private isInitialized = false;

  /**
   * Initialize Stripe
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('StripeService is only available on Android');
    }

    try {
      const publishableKey = config.stripePublishableKey;

      if (!publishableKey) {
        throw new Error('Stripe publishable key not configured');
      }

      const { initStripe } = await getStripeModule();
      await initStripe({
        publishableKey,
        merchantIdentifier: 'merchant.com.lumbus.app',
      });

      this.isInitialized = true;
      logger.log('✅ Stripe initialized for Android');
    } catch (error) {
      logger.error('❌ Failed to initialize Stripe:', error);
      throw new Error('Unable to initialize payment system. Please try again.');
    }
  }

  /**
   * Purchase using Stripe Payment Sheet
   */
  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      throw new Error('Stripe not initialized. Call initialize() first.');
    }

    try {
      // Step 1: Create checkout session with your backend
      logger.log('🔄 Creating Stripe checkout...');
      const { clientSecret, orderId } = await createCheckout({
        planId: params.planId,
        email: params.email,
        currency: params.currency,
        amount: params.price, // Send the price in the currency to backend
        isTopUp: params.isTopUp || false,
        existingOrderId: params.existingOrderId,
        iccid: params.iccid,
      });

      if (!clientSecret || !orderId) {
        throw new Error('Invalid checkout response from server');
      }

      // Step 2: Initialize payment sheet with Google Pay support
      logger.log('🔄 Initializing payment sheet...');
      const { initPaymentSheet } = await getStripeModule();
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Lumbus',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          email: params.email,
        },
        returnURL: 'lumbus://payment-complete',
        // Google Pay configuration (automatic for Android)
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: __DEV__, // Use test environment in development
          currencyCode: params.currency?.toUpperCase() || 'USD',
        },
        appearance: {
          colors: {
            primary: '#2EFECC',
            background: '#FFFFFF',
            componentBackground: '#F5F5F5',
          },
        },
        // Enable Link for faster checkout
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        logger.error('❌ Payment sheet initialization error:', initError);
        throw new Error(initError.message);
      }

      // Step 3: Present payment sheet to user
      logger.log('🔄 Presenting payment sheet...');
      const { presentPaymentSheet } = await getStripeModule();
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        // User cancelled - not an error, just return
        if (paymentError.code === 'Canceled') {
          return {
            success: false,
            error: 'Payment cancelled',
          };
        }

        logger.error('❌ Payment error:', paymentError);
        throw new Error(paymentError.message);
      }

      // Payment successful!
      logger.log('✅ Payment successful');
      return {
        success: true,
        orderId,
        transactionId: clientSecret,
      };
    } catch (error: any) {
      logger.error('❌ Stripe purchase failed:', error);

      // Handle specific error messages
      if (error.message?.includes('network')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message || 'Payment failed. Please try again.',
      };
    }
  }

  /**
   * Check if Google Pay is available on the device
   * (Stripe handles this automatically in payment sheet)
   */
  async isGooglePayAvailable(): Promise<boolean> {
    // Stripe's payment sheet automatically detects and offers Google Pay
    // if available on the device
    return Platform.OS === 'android';
  }
}
