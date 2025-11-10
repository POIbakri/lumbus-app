import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { config } from '../lib/config';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from '../lib/supabase';
import { isValidUUID } from '../lib/validation';
import { logger } from '../lib/logger';
import { ReferralProvider } from '../contexts/ReferralContext';
import { DeepLinkHandler } from './components/DeepLinkHandler';
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

function AppContent() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Only resolve Stripe key on Android to avoid touching Stripe on iOS
  const stripePublishableKey = Platform.OS === 'android' ? (config.stripePublishableKey || '') : '';
  // Dynamically load StripeProvider only on Android to avoid iOS native initialization
  const StripeProviderAny: any = Platform.OS === 'android' ? require('@stripe/stripe-react-native').StripeProvider : null;

  useEffect(() => {
    // Initialize notifications for both iOS and Android
    async function setupNotifications() {
      try {
        const notif = await import('../lib/notifications');
        const bgNotif = await import('../lib/backgroundNotifications');

        // Register background notification handler (works when app is closed)
        await bgNotif.registerBackgroundNotificationTask();

        const token = await notif.registerForPushNotifications();
        if (token) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await notif.savePushToken(user.id, token);
          }
        }

        // Foreground notification listener (app is open)
        notificationListener.current = notif.addNotificationReceivedListener((notification: any) => {
          // Update badge count when notification received in foreground
          notif.getBadgeCount().then(count => {
            notif.setBadgeCount(count + 1);
          });
        });

        // Notification tap listener (user taps notification)
        responseListener.current = notif.addNotificationResponseReceivedListener((response: any) => {
          const data = notif.getNotificationData(response);

          // Clear badge when user opens notification
          notif.clearBadge();

          // Navigate based on notification type
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

    setupNotifications();

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
    <>
      <DeepLinkHandler />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ReferralProvider>
          <AppContent />
        </ReferralProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
