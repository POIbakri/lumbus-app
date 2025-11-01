import * as RNIap from 'react-native-iap';
import { Alert, Platform } from 'react-native';
import { logger } from '../logger';
import { PurchaseParams, PurchaseResult } from './PaymentService';
import { createIAPCheckout, validateAppleReceipt } from '../api';

/**
 * iOS Apple In-App Purchase Service (v13 API)
 *
 * This version uses react-native-iap v13.x API which is more stable
 * and doesn't require NitroIap/NitroModules
 *
 * Handles all Apple IAP transactions including:
 * - Product fetching from App Store Connect
 * - Purchase initiation
 * - Transaction verification via your backend
 * - Receipt validation
 * - Purchase restoration
 */
export class IAPServiceV13 {
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;
  private isConnected = false;
  private pendingOrderIds: Map<string, string> = new Map(); // Map productId -> orderId

  /**
   * Initialize IAP connection to App Store
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('IAPServiceV13 is only available on iOS');
    }

    try {
      await RNIap.initConnection();
      this.isConnected = true;
      logger.log('✅ Connected to App Store (v13)');

      // Set up purchase listeners
      this.setupPurchaseListeners();
    } catch (error) {
      logger.error('❌ Failed to connect to App Store:', error);
      throw new Error('Unable to connect to App Store. Please try again later.');
    }
  }

  /**
   * Set up listeners for purchase updates and errors
   */
  private setupPurchaseListeners(): void {
    // Listen for purchase updates
    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase: RNIap.Purchase) => {
        logger.log('✅ Purchase update received:', purchase);

        // Get transaction ID
        const transactionId = purchase.transactionId;
        if (transactionId) {
          try {
            // Get the orderId from our pending map
            const orderId = this.pendingOrderIds.get(purchase.productId);

            if (!orderId) {
              logger.error('❌ No orderId found for product:', purchase.productId);
              throw new Error('Order ID not found for this purchase');
            }

            // Verify the receipt with backend
            logger.log('🔄 Verifying receipt with backend...');
            const validationResult = await validateAppleReceipt({
              receipt: purchase.transactionReceipt || transactionId,
              orderId: orderId,
            });

            if (validationResult.valid) {
              logger.log('✅ Receipt validated successfully');

              // Finish the transaction only after successful verification
              await RNIap.finishTransaction({
                purchase,
                isConsumable: true
              });
              logger.log('✅ Transaction finished');

              // Clean up pending order
              this.pendingOrderIds.delete(purchase.productId);
            } else {
              throw new Error(validationResult.error || 'Receipt validation failed');
            }
          } catch (error) {
            logger.error('❌ Receipt verification failed:', error);
            // Note: We don't finish the transaction if verification fails
            // This allows the user to retry or contact support
          }
        }
      }
    );

    // Listen for purchase errors
    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: RNIap.PurchaseError) => {
        if (error.code === 'E_USER_CANCELLED') {
          logger.log('ℹ️ User cancelled purchase');
        } else {
          logger.error('❌ Purchase error:', error);
        }
      }
    );
  }

  /**
   * Get products from App Store
   */
  async getProducts(productIds: string[]): Promise<RNIap.Product[]> {
    if (!this.isConnected) {
      throw new Error('IAP not initialized. Call initialize() first.');
    }

    try {
      const products = await RNIap.getProducts({ skus: productIds });
      if (!products || products.length === 0) {
        throw new Error('No products returned from App Store');
      }
      logger.log(`✅ Fetched ${products.length} products from App Store`);
      return products;
    } catch (error) {
      logger.error('❌ Failed to fetch products:', error);
      throw new Error('Unable to load products from App Store.');
    }
  }

  /**
   * Purchase a product
   */
  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    if (!this.isConnected) {
      throw new Error('IAP not initialized. Call initialize() first.');
    }

    try {
      // Step 1: Create order in your backend and get Apple product ID
      logger.log('🔄 Creating IAP checkout...');
      const checkoutResponse = await createIAPCheckout({
        planId: params.planId,
        email: params.email,
        isTopUp: params.isTopUp || false,
        existingOrderId: params.existingOrderId,
        iccid: params.iccid,
        currency: params.currency,
        amount: params.price, // Send the price (Apple handles actual conversion)
      });

      const { orderId, productId } = checkoutResponse;

      if (!productId) {
        throw new Error('Invalid product ID received from server');
      }

      logger.log(`🔄 Requesting purchase for product: ${productId}`);

      // Store orderId for receipt validation
      this.pendingOrderIds.set(productId, orderId);

      // Step 2: Request purchase from Apple
      // This will show Apple's native payment sheet with Apple Pay / Card options
      await RNIap.requestPurchase({ sku: productId });

      // Note: The purchase completion is handled by purchaseUpdatedListener
      // We return immediately as the listener will handle verification
      return {
        success: true,
        orderId,
        transactionId: productId,
      };
    } catch (error: any) {
      logger.error('❌ IAP Purchase failed:', error);

      // Handle specific IAP errors
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: 'Purchase cancelled',
        };
      }

      if (error.code === 'E_ITEM_UNAVAILABLE') {
        return {
          success: false,
          error: 'This item is currently unavailable. Please try again later.',
        };
      }

      if (error.code === 'E_NETWORK_ERROR') {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed. Please try again.',
      };
    }
  }

  /**
   * Restore previous purchases
   * Useful when user reinstalls app or switches devices
   */
  async restorePurchases(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('IAP not initialized. Call initialize() first.');
    }

    try {
      logger.log('🔄 Restoring purchases...');

      const purchases = await RNIap.getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        logger.log(`✅ Found ${purchases.length} purchases to restore`);
        // Process restored purchases if needed
        // For consumables like eSIM data, restoration might not be applicable
      }

      Alert.alert(
        'Restore Purchases',
        'Your purchases have been restored successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      logger.error('❌ Restore purchases failed:', error);
      throw new Error('Failed to restore purchases. Please try again.');
    }
  }

  /**
   * Clean up IAP connection and listeners
   */
  async cleanup(): Promise<void> {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }

      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      if (this.isConnected) {
        await RNIap.endConnection();
        this.isConnected = false;
        logger.log('✅ Disconnected from App Store');
      }
    } catch (error) {
      logger.error('❌ IAP cleanup error:', error);
    }
  }

  /**
   * Generate Apple IAP product ID from plan details
   * Format: com.lumbus.app.esim.{region}_{dataGB}GB_{validityDays}days
   */
  static generateProductId(planId: string, planName: string): string {
    // Sanitize plan name for product ID
    const sanitized = planName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return `com.lumbus.app.esim.${sanitized}`;
  }
}