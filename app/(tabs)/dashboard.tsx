import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders, fetchUsageData, UsageData } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { Circle, Svg } from 'react-native-svg';

type TabType = 'active' | 'expired';

export default function Dashboard() {
  const router = useRouter();
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
    staleTime: 300000, // 5 minutes - data stays fresh
    gcTime: 600000, // 10 minutes - cache time
    refetchOnMount: false, // Don't refetch on mount, use cache
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    retry: 2,
  });

  // Fetch usage data for all orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      fetchAllUsageData();
    }
  }, [orders]);

  async function fetchAllUsageData() {
    if (!orders) return;

    const newUsageData = new Map<String, UsageData>();

    await Promise.all(
      orders
        .filter(order => order.status === 'active' || order.status === 'depleted' || order.status === 'provisioning')
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

  function getExpiryDate(order: Order) {
    // Only use activate_before for expiry calculation
    // Don't calculate from created_at + validity_days because eSIMs
    // aren't activated until installed by the user
    if (order.activate_before) {
      return new Date(order.activate_before);
    }

    return null;
  }

  function isExpired(order: Order) {
    // For eSIMs, trust the backend status
    // Only check date-based expiry if there's an explicit activate_before date
    const expiryDate = getExpiryDate(order);
    if (!expiryDate) return false;
    return new Date() > expiryDate;
  }

  function extractRegion(name: string) {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }

  function getCountryFlag(region: string) {
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
  }

  function CircularProgress({ percentage, size = 80, strokeWidth = 6, flag }: { percentage: number; size?: number; strokeWidth?: number; flag: string }) {
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
  }

  function renderOrderCard(order: Order) {
    const planName = order.plan?.name || 'Unknown Plan';
    const region = extractRegion(planName);
    const totalDataGB = order.plan?.data_gb || 0;
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
    const percentageUsed = totalDataGB > 0 ? (dataUsedGB / totalDataGB) * 100 : 0;

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
          borderColor: isProvisioning ? '#FDFD74' : '#E5E5E5',
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
                {totalDataGB} GB plan
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
  }

  // Filter orders based on active tab
  const filteredOrders = orders?.filter(order => {
    // Show active, depleted, and provisioning eSIMs (skip pending, failed, paid)
    const validStatuses = ['active', 'depleted', 'provisioning'];
    if (!validStatuses.includes(order.status)) {
      return false;
    }

    // Check if order is expired or depleted
    const isDateExpired = isExpired(order);
    const isDepleted = order.status === 'depleted';
    const expired = isDateExpired || isDepleted;

    // Provisioning eSIMs are always active (ready to activate)
    if (order.status === 'provisioning') {
      return activeTab === 'active';
    }

    return activeTab === 'active' ? !expired : expired;
  }) || [];

  // Only show full loading on initial load, not when refetching cached data
  if (isLoading && !orders) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
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
            {activeTab === 'active' && (
              <TouchableOpacity
                className="px-8 py-4 rounded-2xl"
                style={{
                  backgroundColor: '#2EFECC',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}
                onPress={() => router.push('/(tabs)/browse')}
                activeOpacity={0.8}
              >
                <Text className="font-black text-base uppercase tracking-wide" style={{ color: '#1A1A1A' }}>
                  Browse Plans →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
