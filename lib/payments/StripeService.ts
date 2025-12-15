import { Platform } from 'react-native';
import { logger } from '../logger';
import { PurchaseParams, PurchaseResult } from './PaymentService';
import { createCheckout } from '../api';
import { config } from '../config';
import { storePendingPayment, clearPendingPayment } from './pendingPayment';

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
    try {
      const publishableKey = config.stripePublishableKey;

      if (!publishableKey) {
        throw new Error('Stripe publishable key not configured');
      }

      const { initStripe } = await getStripeModule();
      await initStripe({
        publishableKey,
        // Required for Apple Pay on iOS. Ignored on Android.
        merchantIdentifier: 'merchant.com.lumbus.app',
      });

      this.isInitialized = true;
      logger.log(
        Platform.OS === 'ios'
          ? '✅ Stripe initialized for iOS (Apple Pay + cards)'
          : '✅ Stripe initialized for Android (Google Pay + cards)'
      );
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

      const checkoutParams = {
        planId: params.planId,
        email: params.email,
        currency: params.currency,
        amount: params.price, // Send the price in the currency to backend
        isTopUp: params.isTopUp || false,
        existingOrderId: params.existingOrderId,
        iccid: params.iccid,
        referralCode: params.referralCode, // Pass referral code for discount
        discountCode: params.discountCode, // Pass discount code
      };

      const { clientSecret, orderId, publishableKey } = await createCheckout(checkoutParams);

      if (!clientSecret || !orderId) {
        throw new Error('Invalid checkout response from server');
      }

      // Check if we need to re-initialize with a test key (for reviewers)
      if (publishableKey && publishableKey !== config.stripePublishableKey) {
        logger.log('⚠️ Using dynamic Stripe key from backend (Test Mode)');
        const { initStripe } = await getStripeModule();
        await initStripe({
          publishableKey,
          merchantIdentifier: 'merchant.com.lumbus.app',
        });
      }

      // Step 2: Initialize payment sheet with Google Pay support
      logger.log('🔄 Initializing payment sheet...');
      const { initPaymentSheet } = await getStripeModule();
      const paymentSheetParams: any = {
        // Displayed at the top of the Stripe Payment Sheet
        merchantDisplayName: 'Lumbus (secure payments via Stripe)',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          email: params.email,
        },
        returnURL: 'lumbus://payment-complete',
        // Country of the merchant; required for Apple Pay and recommended for Google Pay
        merchantCountryCode: 'US',
        appearance: {
          colors: {
            primary: '#2EFECC',
            background: '#FFFFFF',
            componentBackground: '#FFFFFF',
            componentText: '#1A1A1A',
            componentBorder: '#E0E0E0',
            text: '#1A1A1A',
            placeholderText: '#999999',
            secondaryText: '#666666',
            icon: '#666666',
            error: '#FF3B30',
          },
          shapes: {
            borderRadius: 12,
            borderWidth: 1,
          },
          primaryButton: {
            colors: {
              background: '#2EFECC',
              text: '#1A1A1A',
              border: '#2EFECC',
            },
          },
        },
        // Enable Link for faster checkout
        allowsDelayedPaymentMethods: true,
      };

      // Google Pay configuration (Android only)
      if (Platform.OS === 'android') {
        paymentSheetParams.googlePay = {
          merchantCountryCode: 'US',
          testEnv: __DEV__, // Use test environment in development
          currencyCode: params.currency?.toUpperCase() || 'USD',
        };
      }

      // Apple Pay configuration (iOS only). PaymentSheet will show Apple Pay
      // as an option when the user has it set up and the merchantIdentifier is configured.
      if (Platform.OS === 'ios') {
        paymentSheetParams.applePay = {
          merchantCountryCode: 'US',
        };
      }

      const { error: initError } = await initPaymentSheet(paymentSheetParams);

      if (initError) {
        logger.error('❌ Payment sheet initialization error:', initError);
        throw new Error(initError.message);
      }

      // Store pending payment state before presenting sheet (for 3DS return handling)
      await storePendingPayment({
        orderId,
        planId: params.planId,
        planName: params.planName,
        isTopUp: params.isTopUp || false,
      });

      // Step 3: Present payment sheet to user
      logger.log('🔄 Presenting payment sheet...');
      const { presentPaymentSheet } = await getStripeModule();
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        // User cancelled - not an error, just return
        if (paymentError.code === 'Canceled') {
          await clearPendingPayment();
          return {
            success: false,
            error: 'Payment cancelled',
          };
        }

        logger.error('❌ Payment error:', paymentError);
        await clearPendingPayment();
        throw new Error(paymentError.message);
      }

      // Payment successful - clear pending state
      await clearPendingPayment();
      logger.log('✅ Payment successful');
      return {
        success: true,
        orderId,
        transactionId: clientSecret,
      };
    } catch (error: any) {
      logger.error('❌ Stripe purchase failed:', error);
      await clearPendingPayment();

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
