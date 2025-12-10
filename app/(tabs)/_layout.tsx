import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { fetchUserOrders, fetchReferralInfo } from '../../lib/api';

export default function TabsLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/(auth)/login');
      return;
    }

    // Data should already be prefetched from splash screen
    // But ensure cache has user data in case of deep link or refresh
    const userId = session.user.id;
    const cachedUserId = queryClient.getQueryData(['userId']);

    if (!cachedUserId) {
      // Cache wasn't populated (maybe deep link) - populate it now
      queryClient.setQueryData(['userId'], userId);
      queryClient.setQueryData(['userEmail'], session.user.email || '');

      // Await prefetch to avoid race condition with dashboard rendering
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['orders', userId],
          queryFn: () => fetchUserOrders(userId),
          staleTime: 600000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['referralInfo'],
          queryFn: fetchReferralInfo,
          staleTime: 300000,
        }),
      ]);
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }

  if (isLoading || !isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2EFECC', // Primary turquoise
        tabBarInactiveTintColor: '#666666', // Muted text
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#E5E5E5',
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "globe" : "globe-outline"}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'My eSIMs',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
