import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { config } from '../lib/config';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getNotificationData,
  NotificationType,
} from '../lib/notifications';
import { supabase } from '../lib/supabase';
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
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    async function setupNotifications() {
      const token = await registerForPushNotifications();

      if (token) {
        // Get current user and save token
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await savePushToken(user.id, token);
        }
      }
    }

    setupNotifications();

    // Handle notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification taps
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      const data = getNotificationData(response);

      // Navigate based on notification type
      if (data.type === NotificationType.ESIM_READY && data.orderId) {
        router.push(`/install/${data.orderId}`);
      } else if (data.orderId) {
        // For usage alerts, navigate to dashboard
        router.push('/(tabs)/dashboard');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={config.stripePublishableKey}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="plan" options={{ headerShown: false }} />
            <Stack.Screen name="region" options={{ headerShown: false }} />
            <Stack.Screen name="install" options={{ headerShown: false }} />
            <Stack.Screen name="esim-details" options={{ headerShown: false }} />
          </Stack>
        </StripeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
