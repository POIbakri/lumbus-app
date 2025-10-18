import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders, fetchUsageData, UsageData } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { UsageBar } from '../components/UsageBar';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usageData, setUsageData] = useState<Map<string, UsageData>>(new Map());

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

  // Fetch usage data for all orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      fetchAllUsageData();
    }
  }, [orders]);

  async function fetchAllUsageData() {
    if (!orders) return;

    const newUsageData = new Map<string, UsageData>();

    // Fetch usage for all completed orders
    await Promise.all(
      orders
        .filter(order => order.status === 'completed')
        .map(async (order) => {
          try {
            const usage = await fetchUsageData(order.id);
            if (usage) {
              newUsageData.set(order.id, usage);
            }
          } catch (error) {
            console.error(`Error fetching usage for order ${order.id}:`, error);
          }
        })
    );

    setUsageData(newUsageData);
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    await fetchAllUsageData();
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
    const usage = usageData.get(order.id);
    const totalDataGB = order.plan?.data_gb || 0;

    return (
      <TouchableOpacity
        key={order.id}
        className="bg-white rounded-2xl p-5 mb-4"
        style={{shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 2, borderColor: '#E5E5E5'}}
        onPress={() => router.push(`/install/${order.id}`)}
        activeOpacity={0.8}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-black mb-2 uppercase tracking-tight" style={{color: '#1A1A1A'}}>
              {region}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="px-3 py-1 rounded-full" style={{backgroundColor: '#E0FEF7'}}>
                <Text className="font-black text-xs uppercase" style={{color: '#1A1A1A'}}>
                  📊 {totalDataGB} GB
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{backgroundColor: '#F7E2FB'}}>
                <Text className="font-black text-xs uppercase" style={{color: '#1A1A1A'}}>
                  ⏱️ {order.plan?.validity_days || 0} days
                </Text>
              </View>
            </View>
          </View>
          <View className="px-4 py-2 rounded-xl" style={{
            backgroundColor: order.status === 'completed' ? '#2EFECC' :
            order.status === 'processing' ? '#FDFD74' :
            order.status === 'failed' ? '#EF4444' : '#87EFFF'
          }}>
            <View className="flex-row items-center">
              <Ionicons
                name={getStatusIcon(order.status) as any}
                size={16}
                color="#1A1A1A"
              />
              <Text className="ml-1 text-xs font-black uppercase" style={{color: '#1A1A1A'}}>
                {order.status === 'completed' ? '✓' :
                 order.status === 'processing' ? '⏳' :
                 order.status === 'failed' ? '✗' : '⌛'}
              </Text>
            </View>
          </View>
        </View>

        {/* Usage Bar for completed orders */}
        {order.status === 'completed' && usage && (
          <UsageBar
            dataUsed={usage.dataUsed / 1024} // Convert MB to GB
            dataTotal={totalDataGB}
            percentageUsed={usage.percentageUsed}
          />
        )}

        <View className="flex-row items-center justify-between pt-4" style={{borderTopWidth: 2, borderTopColor: '#E5E5E5', marginTop: usage ? 12 : 0}}>
          <Text className="text-sm font-bold uppercase tracking-wide" style={{color: '#666666'}}>
            📅 {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          {order.status === 'completed' && (
            <View className="flex-row items-center px-3 py-2 rounded-full" style={{backgroundColor: '#2EFECC'}}>
              <Text className="text-xs font-black uppercase mr-1" style={{color: '#1A1A1A'}}>
                View eSIM
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#1A1A1A" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header with brand color */}
      <View className="px-6 pt-12 pb-6" style={{backgroundColor: '#87EFFF'}}>
        <Text className="text-4xl font-black uppercase tracking-tight" style={{color: '#1A1A1A'}}>
          MY eSIMs
        </Text>
        <Text className="text-base font-bold mt-2" style={{color: '#1A1A1A', opacity: 0.8}}>
          Manage your active eSIM plans
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
            tintColor="#2EFECC"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="rounded-full p-6 mb-6" style={{backgroundColor: '#F5F5F5'}}>
              <Ionicons name="receipt-outline" size={64} color="#666666" />
            </View>
            <Text className="text-2xl font-black mb-2 uppercase" style={{color: '#1A1A1A'}}>
              No eSIMs Yet
            </Text>
            <Text className="text-center px-6 font-bold mb-8" style={{color: '#666666'}}>
              Browse our plans to get started with your first eSIM
            </Text>
            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{backgroundColor: '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8}}
              onPress={() => router.push('/(tabs)/browse')}
              activeOpacity={0.8}
            >
              <Text className="font-black text-base uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Browse Plans →
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
