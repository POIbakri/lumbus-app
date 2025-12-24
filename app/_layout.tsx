import { Stack, useRouter } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { config } from '../lib/config';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from '../lib/supabase';
import { isValidUUID } from '../lib/validation';
import { logger } from '../lib/logger';
import { ReferralProvider, useReferral } from '../contexts/ReferralContext';
import { DeepLinkHandler } from './components/DeepLinkHandler';
import { fetchUserOrders } from '../lib/api';
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes default
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - persist cache for offline use
      refetchOnMount: false, // Use cached data by default
      refetchOnWindowFocus: false, // Don't refetch when app regains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: 2, // Retry failed requests twice
    },
  },
});

// AsyncStorage persister for offline cache
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'lumbus-query-cache',
});

function AppContent() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { hasActiveReferral, clearReferralCode } = useReferral();

  // Stripe configuration for both iOS and Android
  const stripePublishableKey = config.stripePublishableKey || '';

  // Clear referral code on app startup if user has already made a purchase
  useEffect(() => {
    async function checkAndClearReferral() {
      if (!hasActiveReferral) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const orders = await fetchUserOrders(user.id);
        // Only count successful orders (not pending/failed)
        const successfulOrders = orders?.filter(o =>
          ['active', 'completed', 'provisioning', 'depleted', 'paid'].includes(o.status)
        ) || [];

        if (successfulOrders.length > 0) {
          logger.log('🧹 Clearing referral code - user has existing orders');
          await clearReferralCode();
        }
      } catch (error) {
        // Silently fail - not critical
      }
    }

    checkAndClearReferral();
  }, [hasActiveReferral, clearReferralCode]);

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
      <StripeProvider 
        publishableKey={stripePublishableKey} 
        merchantIdentifier="merchant.com.lumbus.app"
        urlScheme="lumbus" // Required for 3D Secure redirect handling
      >
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
      </StripeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              // Only persist successful queries for orders and plans
              const queryKey = query.queryKey[0] as string;
              return query.state.status === 'success' &&
                ['orders', 'plans', 'regions', 'userId'].includes(queryKey);
            },
          },
        }}
      >
        <ReferralProvider>
          <AppContent />
        </ReferralProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}
