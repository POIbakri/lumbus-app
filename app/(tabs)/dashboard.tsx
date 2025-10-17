import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user ID on mount
  useEffect(() => {
    getUserId();
  }, []);

  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true,
  });

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'pending':
        return 'hourglass';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  function renderOrderCard(order: Order) {
    const extractRegion = (name: string) => {
      const match = name.match(/^([^0-9]+?)\s+\d+/);
      return match ? match[1].trim() : name.split(' ')[0];
    };

    const planName = order.plan?.name || 'Unknown Plan';
    const region = extractRegion(planName);

    return (
      <TouchableOpacity
        key={order.id}
        className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
        onPress={() => router.push(`/install/${order.id}`)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {region}
            </Text>
            <Text className="text-sm text-gray-600">
              {order.plan?.data_gb || 0} GB • {order.plan?.validity_days || 0} days
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
            <View className="flex-row items-center">
              <Ionicons
                name={getStatusIcon(order.status) as any}
                size={14}
                color={order.status === 'completed' ? '#16A34A' :
                       order.status === 'processing' ? '#2563EB' :
                       order.status === 'failed' ? '#DC2626' : '#CA8A04'}
              />
              <Text className={`ml-1 text-xs font-semibold ${
                order.status === 'completed' ? 'text-green-800' :
                order.status === 'processing' ? 'text-blue-800' :
                order.status === 'failed' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          {order.status === 'completed' && (
            <View className="flex-row items-center">
              <Text className="text-xs text-blue-600 font-medium mr-1">
                View eSIM
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">
          My eSIMs
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => renderOrderCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-600 text-lg mt-4 mb-2">
              No eSIMs yet
            </Text>
            <Text className="text-gray-500 text-center px-6">
              Browse our plans to get started with your first eSIM
            </Text>
            <TouchableOpacity
              className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
              onPress={() => router.push('/(tabs)/browse')}
            >
              <Text className="text-white font-semibold">
                Browse Plans
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
