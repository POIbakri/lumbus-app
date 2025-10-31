import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { config } from '../lib/config';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from '../lib/supabase';
import { isValidUUID } from '../lib/validation';
import { logger } from '../lib/logger';
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes default
      gcTime: 600000, // 10 minutes default cache time
      refetchOnMount: false, // Use cached data by default
      refetchOnWindowFocus: false, // Don't refetch when app regains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: 2, // Retry failed requests twice
    },
  },
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Only resolve Stripe key on Android to avoid touching Stripe on iOS
  const stripePublishableKey = Platform.OS === 'android' ? (config.stripePublishableKey || '') : '';
  // Dynamically load StripeProvider only on Android to avoid iOS native initialization
  const StripeProviderAny: any = Platform.OS === 'android' ? require('@stripe/stripe-react-native').StripeProvider : null;

  useEffect(() => {
    // Only initialize notifications on Android to avoid iOS native init
    async function setupAndroidNotifications() {
      try {
        if (Platform.OS !== 'android') return;
        const notif = await import('../lib/notifications');

        const token = await notif.registerForPushNotifications();
        if (token) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await notif.savePushToken(user.id, token);
          }
        }

        notificationListener.current = notif.addNotificationReceivedListener(() => {});

        responseListener.current = notif.addNotificationResponseReceivedListener((response: any) => {
          const data = notif.getNotificationData(response);
          if (data.type === notif.NotificationType.ESIM_READY && data.orderId) {
            router.push(`/install/${data.orderId}`);
          } else if (data.orderId) {
            router.push('/(tabs)/dashboard');
          }
        });
      } catch (e) {
        logger.error('Notifications init error:', e);
      }
    }

    setupAndroidNotifications();

    // Handle deep links for payment success
    const handleDeepLink = (event: { url: string }) => {
      try {
        const { path, queryParams } = Linking.parse(event.url);

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
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      if (Platform.OS === 'android') {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      }
      subscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {Platform.OS === 'android' ? (
          <StripeProviderAny publishableKey={stripePublishableKey} merchantIdentifier="merchant.com.lumbus.app">
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="plan" options={{ headerShown: false }} />
              <Stack.Screen name="region" options={{ headerShown: false }} />
              <Stack.Screen name="install" options={{ headerShown: false }} />
              <Stack.Screen name="esim-details" options={{ headerShown: false }} />
              <Stack.Screen name="topup" options={{ headerShown: false }} />
            </Stack>
          </StripeProviderAny>
        ) : (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="plan" options={{ headerShown: false }} />
            <Stack.Screen name="region" options={{ headerShown: false }} />
            <Stack.Screen name="install" options={{ headerShown: false }} />
            <Stack.Screen name="esim-details" options={{ headerShown: false }} />
            <Stack.Screen name="topup" options={{ headerShown: false }} />
          </Stack>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
