import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useReferral } from '../../contexts/ReferralContext';
import { isValidUUID } from '../../lib/validation';
import { logger } from '../../lib/logger';
import { getPendingPayment, clearPendingPayment } from '../../lib/payments/pendingPayment';
import { fetchOrderById } from '../../lib/api';
import { pollOrderStatus } from '../../lib/orderPolling';

/**
 * Deep Link Handler Component
 *
 * Handles incoming deep links for:
 * - Payment success redirects
 * - Referral code sharing (https://lumbus.com/r/ABC12345 or lumbus://ref/ABC12345)
 */
export function DeepLinkHandler() {
  const router = useRouter();
  const { setReferralCode } = useReferral();

  useEffect(() => {
    const parseUrl = (url: string): { path: string | null; queryParams: Record<string, string> } => {
      try {
        const u = new URL(url);

        // For custom schemes (lumbus://), combine host + pathname
        // Example: lumbus://ref/ABC12345 → host="ref", pathname="/ABC12345" → path="ref/ABC12345"
        // For HTTP/HTTPS, use pathname only
        // Example: https://lumbus.com/r/ABC12345 → pathname="/r/ABC12345" → path="r/ABC12345"
        let path: string;
        if (u.protocol === 'lumbus:') {
          // Custom scheme: join host + pathname
          const host = u.host || '';
          const pathname = (u.pathname || '').replace(/^\//, '');
          path = host ? (pathname ? `${host}/${pathname}` : host) : pathname;
        } else {
          // HTTP/HTTPS: use pathname only
          path = (u.pathname || '').replace(/^\//, '');
        }

        const queryParams: Record<string, string> = {};
        u.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
        return { path, queryParams };
      } catch {
        return { path: null, queryParams: {} };
      }
    };

    const handleDeepLink = async (event: { url: string }) => {
      try {
        const { path, queryParams } = parseUrl(event.url);

        // Handle referral deep links: https://lumbus.com/r/ABC12345 or lumbus://ref/ABC12345
        // Pattern 1: /r/CODE (web URL)
        // Pattern 2: ref/CODE (app deep link)
        const referralMatch = path?.match(/^(?:r|ref)\/([A-Z0-9]{8})$/i);
        if (referralMatch) {
          const code = referralMatch[1].toUpperCase();
          setReferralCode(code);
          Alert.alert(
            'Referral Code Applied!',
            "You'll get 10% OFF + 1GB FREE on your first purchase!",
            [{ text: 'Got it!' }]
          );
          logger.log('✅ Referral code applied:', code);
          return;
        }

        // Handle payment completion (Stripe 3DS return URL)
        if (path === 'payment-complete') {
          logger.log('🔄 Returned from 3DS authentication');

          // Check if there's a pending payment we need to complete
          const pendingPayment = await getPendingPayment();

          if (pendingPayment) {
            logger.log('📋 Found pending payment:', pendingPayment.orderId);

            // Check order status to see if payment succeeded
            try {
              const order = await fetchOrderById(pendingPayment.orderId);

              if (!order) {
                // Order not found - clear pending payment and notify user
                logger.warn('Order not found after 3DS:', pendingPayment.orderId);
                await clearPendingPayment();
                Alert.alert(
                  'Order Not Found',
                  'We couldn\'t find your order. Please check your dashboard or contact support.',
                  [{ text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }]
                );
                return;
              }

              // Check if payment was successful (order status should be 'paid' or later)
              const paidStatuses = ['paid', 'provisioning', 'completed', 'active'];

              if (paidStatuses.includes(order.status)) {
                logger.log('✅ Payment confirmed, order status:', order.status);

                // Clear pending payment only after successful verification
                await clearPendingPayment();

                // Payment succeeded - poll for completion and navigate
                if (pendingPayment.isTopUp) {
                  // Top-up flow
                  Alert.alert(
                    'Top-Up Successful!',
                    'Data has been added to your eSIM.',
                    [
                      {
                        text: 'Go to Dashboard',
                        onPress: () => router.replace('/(tabs)/dashboard'),
                      },
                    ]
                  );
                } else {
                  // New purchase flow - check if eSIM is ready
                  if (order.status === 'completed' && order.activation_code && order.smdp) {
                    // eSIM ready - go to install
                    router.replace(`/install/${pendingPayment.orderId}?fromPurchase=true`);
                  } else {
                    // eSIM still processing - show message and go to dashboard
                    Alert.alert(
                      'Payment Successful!',
                      'Your eSIM is being prepared. You can view the status in your dashboard.',
                      [
                        {
                          text: 'Go to Dashboard',
                          onPress: () => router.replace('/(tabs)/dashboard'),
                        },
                      ]
                    );
                  }
                }
                return;
              } else if (order.status === 'pending') {
                // Payment might still be processing
                logger.log('⏳ Payment still processing, polling...');

                // Quick poll to check if payment completes
                const result = await pollOrderStatus(pendingPayment.orderId, {
                  maxAttempts: 5,
                  initialDelay: 1000,
                });

                if (result.success && result.order) {
                  await clearPendingPayment();
                  if (pendingPayment.isTopUp) {
                    Alert.alert(
                      'Top-Up Successful!',
                      'Data has been added to your eSIM.',
                      [{ text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)/dashboard') }]
                    );
                  } else {
                    router.replace(`/install/${pendingPayment.orderId}?fromPurchase=true`);
                  }
                  return;
                }

                // Still pending - clear and let user check dashboard
                await clearPendingPayment();
                Alert.alert(
                  'Processing',
                  'Your payment is still being processed. Please check your dashboard in a moment.',
                  [{ text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }]
                );
                return;
              } else {
                // Order in unexpected state (failed, cancelled, etc) - clear it
                await clearPendingPayment();
                logger.warn('Order in unexpected status:', order.status);
                Alert.alert(
                  'Payment Issue',
                  'There was an issue with your payment. Please check your dashboard or try again.',
                  [{ text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }]
                );
                return;
              }
            } catch (error) {
              logger.error('Error checking order status after 3DS:', error);
              // Clear stale pending payment and navigate to dashboard
              await clearPendingPayment();
              Alert.alert(
                'Unable to Verify Payment',
                'Please check your dashboard to see your order status.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }]
              );
              return;
            }
          }

          // No pending payment - just go to dashboard
          logger.log('No pending payment found, navigating to dashboard');
          router.replace('/(tabs)/dashboard');
          return;
        }

        // Whitelist allowed paths for security
        const allowedPaths = ['dashboard'];
        if (!path || !allowedPaths.includes(path)) {
          logger.warn('Invalid deep link path attempted:', path);
          return;
        }

        // Handle top-up success redirect
        if (path === 'dashboard' && queryParams?.topup === 'success') {
          const orderId = queryParams.order as string;

          // Validate orderId format (must be valid UUID)
          if (!orderId || !isValidUUID(orderId)) {
            logger.error('Invalid order ID in deep link:', orderId);
            Alert.alert('Error', 'Invalid link. Please try again.');
            return;
          }

          Alert.alert(
            'Top-Up Successful!',
            'Data has been added to your eSIM',
            [
              {
                text: 'View eSIM',
                onPress: () => {
                  router.push(`/esim-details/${orderId}`);
                },
              },
            ]
          );
        }
      } catch (error) {
        logger.error('Error handling deep link:', error);
        Alert.alert('Error', 'Unable to process link. Please try again.');
      }
    };

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          handleDeepLink({ url });
        }
      })
      .catch(error => {
        logger.error('Error getting initial URL:', error);
      });

    return () => {
      subscription.remove();
    };
  }, [router, setReferralCode]);

  return null; // This component doesn't render anything
}
