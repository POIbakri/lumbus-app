import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useReferral } from '../../contexts/ReferralContext';
import { isValidUUID } from '../../lib/validation';
import { logger } from '../../lib/logger';

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
        const path = (u.pathname || '').replace(/^\//, '');
        const queryParams: Record<string, string> = {};
        u.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
        return { path, queryParams };
      } catch {
        return { path: null, queryParams: {} };
      }
    };

    const handleDeepLink = (event: { url: string }) => {
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
            '🎉 Referral Code Applied!',
            "You'll get 10% OFF + 1GB FREE on your first purchase!",
            [{ text: 'Got it!' }]
          );
          logger.log('✅ Referral code applied:', code);
          return;
        }

        // Whitelist allowed paths for security
        const allowedPaths = ['dashboard', 'payment-complete'];
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
