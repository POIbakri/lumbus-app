import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders, fetchUsageData, fetchOrderById, UsageData } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { Circle, Svg } from 'react-native-svg';

type TabType = 'active' | 'expired';

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usageData, setUsageData] = useState<Map<string, UsageData>>(new Map());
  const [activeTab, setActiveTab] = useState<TabType>('active');

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

  const { data: orders, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
    staleTime: 600000, // 10 minutes - orders don't change frequently
    gcTime: 1800000, // 30 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch on mount, use cache
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    retry: 2,
  });

  // Prefetch order details for visible orders (improves navigation speed)
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Prefetch first 5 visible orders
      orders.slice(0, 5).forEach(order => {
        queryClient.prefetchQuery({
          queryKey: ['order', order.id],
          queryFn: () => fetchOrderById(order.id),
          staleTime: 600000,
        });
      });
    }
  }, [orders, queryClient]);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // Memoize helper functions to prevent recreation on every render
  const getExpiryDate = useCallback((order: Order) => {
    // Only use activate_before for expiry calculation
    // Don't calculate from created_at + validity_days because eSIMs
    // aren't activated until installed by the user
    if (order.activate_before) {
      return new Date(order.activate_before);
    }
    return null;
  }, []);

  const isExpired = useCallback((order: Order) => {
    // Check if status is already depleted
    if (order.status === 'depleted') return true;

    // Check if data is completely depleted (0 bytes remaining)
    if (order.data_remaining_bytes !== null && order.data_remaining_bytes !== undefined) {
      if (order.data_remaining_bytes === 0) return true;
    }

    // Check date-based expiry for activate_before date
    const expiryDate = getExpiryDate(order);
    if (expiryDate && new Date() > expiryDate) return true;

    return false;
  }, [getExpiryDate]);

  const extractRegion = useCallback((name: string) => {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }, []);

  const getCountryFlag = useCallback((region: string) => {
    const flagMap: { [key: string]: string } = {
      'Saudi Arabia': '🇸🇦',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Japan': '🇯🇵',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'UAE': '🇦🇪',
      'Turkey': '🇹🇷',
      'Thailand': '🇹🇭',
      'Singapore': '🇸🇬',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Mexico': '🇲🇽',
      'Brazil': '🇧🇷',
    };
    return flagMap[region] || '🌍';
  }, []);

  // Memoize CircularProgress component to prevent re-renders
  const CircularProgress = memo(({ percentage, size = 80, strokeWidth = 6, flag }: { percentage: number; size?: number; strokeWidth?: number; flag: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = 100 - percentage; // Invert to show remaining
    const strokeDashoffset = (progress / 100) * circumference;

    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E5E5"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2EFECC"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Flag in center */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 32 }}>{flag}</Text>
        </View>
      </View>
    );
  });

  // Memoize renderOrderCard to prevent recalculations
  const renderOrderCard = useCallback((order: Order) => {
    const planName = order.plan?.name || 'Unknown Plan';
    const region = extractRegion(planName);

    // Parse actual data amount from plan name if it contains MB (e.g., "100MB", "500MB")
    // Otherwise use data_gb from database
    let totalDataGB = order.plan?.data_gb || 0;
    const mbMatch = planName.match(/(\d+)\s*MB/i);
    if (mbMatch) {
      // Plan specifies MB directly (e.g., "100MB", "500MB")
      // Use this as source of truth - convert to GB
      const mbValue = parseInt(mbMatch[1]);
      totalDataGB = mbValue / 1024; // Convert to GB for consistency (100MB = 0.09765625 GB)
    }

    const isProvisioning = order.status === 'provisioning';
    const isDepleted = order.status === 'depleted';

    // Use data from order object directly if available, fallback to fetched usage data
    const dataUsedBytes = order.data_usage_bytes || 0;
    const dataRemainingBytes = order.data_remaining_bytes !== null && order.data_remaining_bytes !== undefined
      ? order.data_remaining_bytes
      : (totalDataGB * 1024 * 1024 * 1024);

    const dataUsedGB = dataUsedBytes / (1024 * 1024 * 1024);
    const dataRemainingGB = Math.max(0, dataRemainingBytes / (1024 * 1024 * 1024));
    const dataRemainingMB = Math.max(0, dataRemainingBytes / (1024 * 1024));

    // Calculate actual total from backend data
    const actualTotalBytes = dataUsedBytes + dataRemainingBytes;
    const actualTotalGB = actualTotalBytes / (1024 * 1024 * 1024);
    const actualTotalMB = actualTotalBytes / (1024 * 1024);

    // Use actual backend total for percentage calculation to avoid binary/decimal GB mismatch
    // Backend might allocate 100 MB while plan shows 0.1 GB = 102.4 MB
    const percentageUsed = actualTotalBytes > 0 ? (dataUsedBytes / actualTotalBytes) * 100 : 0;

    const expiryDate = getExpiryDate(order);
    const flag = getCountryFlag(region);
    const hasUsage = dataUsedBytes > 0;

    // Format data remaining display
    const formatDataRemaining = () => {
      if (isDepleted || dataRemainingGB === 0) {
        return '0.0 GB remaining';
      } else if (dataRemainingGB < 0.5) {
        // Show in MB if less than 500MB
        return `${Math.round(dataRemainingMB)} MB remaining`;
      } else {
        return `${dataRemainingGB.toFixed(1)} GB remaining`;
      }
    };

    // Determine click behavior
    const handlePress = () => {
      if (isProvisioning || !hasUsage) {
        // Provisioning or no usage yet -> go to install page
        router.push(`/install/${order.id}`);
      } else {
        // Has usage -> go to details page
        router.push(`/esim-details/${order.id}`);
      }
    };

    // Check if this order is expired
    const isOrderExpired = isExpired(order);

    return (
      <TouchableOpacity
        key={order.id}
        className="bg-white rounded-3xl p-6 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderWidth: 2,
          borderColor: isProvisioning ? '#FDFD74' : isOrderExpired ? '#EF4444' : '#E5E5E5',
        }}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Ready to Activate Badge for Provisioning */}
        {isProvisioning && (
          <View className="flex-row items-center mb-3 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFFEF0', borderWidth: 2, borderColor: '#FDFD74', alignSelf: 'flex-start' }}>
            <Ionicons name="download-outline" size={16} color="#1A1A1A" />
            <Text className="ml-1 font-black uppercase tracking-wide" style={{ color: '#1A1A1A', fontSize: 11 }}>
              Ready to Activate
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-black mb-2" style={{ color: '#1A1A1A' }}>
              {region}
            </Text>
            {isProvisioning ? (
              <Text className="text-xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                {mbMatch ? `${mbMatch[1]} MB plan` : `${totalDataGB} GB plan`}
              </Text>
            ) : (
              <Text className="text-xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                {formatDataRemaining()}
              </Text>
            )}
            {expiryDate ? (
              <Text className="text-sm font-bold" style={{ color: '#666666' }}>
                Expires on {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
              </Text>
            ) : order.plan?.validity_days ? (
              <Text className="text-sm font-bold" style={{ color: '#666666' }}>
                Valid for {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
              </Text>
            ) : null}
          </View>

          {/* Circular Progress with Flag */}
          {isProvisioning ? (
            <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFEF0', borderRadius: 40, borderWidth: 3, borderColor: '#FDFD74' }}>
              <Text style={{ fontSize: 32 }}>{flag}</Text>
            </View>
          ) : (
            <CircularProgress percentage={percentageUsed} flag={flag} />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [router, extractRegion, getExpiryDate, getCountryFlag, isExpired]);

  // Memoize filtered orders to prevent recalculation
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      // Show active, depleted, and provisioning eSIMs (skip pending, failed, paid)
      const validStatuses = ['active', 'depleted', 'provisioning'];
      if (!validStatuses.includes(order.status)) {
        return false;
      }

      // Provisioning eSIMs are always active (ready to activate)
      if (order.status === 'provisioning') {
        return activeTab === 'active';
      }

      // Check if order is expired (includes depleted status and 0 data remaining)
      const expired = isExpired(order);

      return activeTab === 'active' ? !expired : expired;
    });
  }, [orders, activeTab, isExpired]);

  // Get active eSIMs with ICCID (eligible for top-up) - memoized
  const activeEsimsWithIccid = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const expired = isExpired(order);
      return (order.status === 'active' && !expired && order.iccid);
    });
  }, [orders, isExpired]);

  // Only show full loading on initial load, not when refetching cached data
  if (isLoading && !orders) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  // Handle "Add more data" button click
  function handleAddMoreData() {
    if (activeEsimsWithIccid.length === 0) {
      // No active eSIMs with ICCID - go to browse
      router.push('/(tabs)/browse');
    } else if (activeEsimsWithIccid.length === 1) {
      // Single active eSIM - go directly to top-up
      router.push(`/topup/${activeEsimsWithIccid[0].id}`);
    } else {
      // Multiple active eSIMs - show options via ActionSheet or alert
      // For now, go to browse - user can also top up from eSIM details
      router.push('/(tabs)/browse');
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View className="px-6 pt-16 pb-6" style={{ backgroundColor: '#FFFFFF' }}>
        <Text className="text-4xl font-black uppercase tracking-tight mb-6" style={{ color: '#1A1A1A' }}>
          eSIM
        </Text>

        {/* Tabs */}
        <View className="flex-row rounded-2xl p-1" style={{ backgroundColor: '#F5F5F5' }}>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl"
            style={{
              backgroundColor: activeTab === 'active' ? '#FFFFFF' : 'transparent',
            }}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.8}
          >
            <Text
              className="text-center font-black uppercase tracking-wide"
              style={{
                color: activeTab === 'active' ? '#1A1A1A' : '#666666',
                fontSize: 14,
              }}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 rounded-xl"
            style={{
              backgroundColor: activeTab === 'expired' ? '#FFFFFF' : 'transparent',
            }}
            onPress={() => setActiveTab('expired')}
            activeOpacity={0.8}
          >
            <Text
              className="text-center font-black uppercase tracking-wide"
              style={{
                color: activeTab === 'expired' ? '#1A1A1A' : '#666666',
                fontSize: 14,
              }}
            >
              Expired
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* eSIM List */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => renderOrderCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100, // Space for fixed bottom button
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2EFECC"
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="rounded-full p-6 mb-6" style={{ backgroundColor: '#F5F5F5' }}>
              <Ionicons name="receipt-outline" size={64} color="#666666" />
            </View>
            <Text className="text-2xl font-black mb-2 uppercase" style={{ color: '#1A1A1A' }}>
              {activeTab === 'active' ? 'No Active eSIMs' : 'No Expired eSIMs'}
            </Text>
            <Text className="text-center px-6 font-bold mb-8" style={{ color: '#666666' }}>
              {activeTab === 'active'
                ? 'Browse our plans to get started with your first eSIM'
                : 'You have no expired eSIMs'}
            </Text>
          </View>
        }
      />

      {/* Fixed Bottom Button - Add more data */}
      {activeTab === 'active' && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
        }}>
          <TouchableOpacity
            className="rounded-full"
            style={{
              backgroundColor: '#FFFFFF',
              paddingVertical: 18,
              borderWidth: 2,
              borderColor: '#1A1A1A',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
            onPress={handleAddMoreData}
            activeOpacity={0.8}
          >
            <Text className="font-black text-lg text-center" style={{ color: '#1A1A1A' }}>
              Add more data
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
