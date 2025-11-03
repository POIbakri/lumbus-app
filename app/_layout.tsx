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

    return () => {
      if (Platform.OS === 'android') {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
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
