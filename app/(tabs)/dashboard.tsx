import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders, fetchOrderById } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { Circle, Svg } from 'react-native-svg';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getIconSize, getBorderRadius } from '../../hooks/useResponsive';
import { getFlag, GlobeIcon } from '../../components/icons/flags';

type TabType = 'active' | 'expired';

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { moderateScale, adaptiveScale, isTablet, screenWidth, isSmallDevice } = useResponsive();

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
    // Check if status is already depleted or expired
    if (order.status === 'depleted' || order.status === 'expired') return true;

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

  // Get country/region flag SVG - uses region name or code
  const getCountryFlag = useCallback((region: string, size: number = 32) => {
    return getFlag(region, size);
  }, []);

  // Memoize CircularProgress component to prevent re-renders
  const CircularProgress = memo(({ percentage, size, strokeWidth, region }: { percentage: number; size?: number; strokeWidth?: number; region: string }) => {
    const responsiveSize = size || adaptiveScale(80);
    const responsiveStrokeWidth = strokeWidth || adaptiveScale(6);
    const radius = (responsiveSize - responsiveStrokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = 100 - percentage; // Invert to show remaining
    const strokeDashoffset = (progress / 100) * circumference;
    const flagSize = Math.floor(responsiveSize * 0.4); // Flag takes 40% of circle

    return (
      <View style={{ width: responsiveSize, height: responsiveSize, position: 'relative' }}>
        <Svg width={responsiveSize} height={responsiveSize}>
          {/* Background circle */}
          <Circle
            cx={responsiveSize / 2}
            cy={responsiveSize / 2}
            r={radius}
            stroke="#E5E5E5"
            strokeWidth={responsiveStrokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={responsiveSize / 2}
            cy={responsiveSize / 2}
            r={radius}
            stroke="#2EFECC"
            strokeWidth={responsiveStrokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${responsiveSize / 2} ${responsiveSize / 2})`}
          />
        </Svg>
        {/* Flag in center */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {getFlag(region, flagSize)}
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

    const isProvisioning = order.status === 'provisioning' || order.status === 'completed';
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
      <View
        key={order.id}
        className="bg-white mb-4"
        style={{
          borderRadius: getBorderRadius(24),
          padding: getSpacing(24),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderWidth: 2,
          borderColor: isProvisioning ? '#FDFD74' : isOrderExpired ? '#EF4444' : '#E5E5E5',
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={isProvisioning} // Disable touch for provisioning cards - use button instead
        >
          {/* Ready to Activate Badge for Provisioning */}
          {isProvisioning && (
            <View className="flex-row items-center mb-3" style={{
              backgroundColor: '#FFFEF0',
              borderWidth: 2,
              borderColor: '#FDFD74',
              alignSelf: 'flex-start',
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(8),
              borderRadius: getBorderRadius(12),
            }}>
              <Ionicons name="download-outline" size={getIconSize(16)} color="#1A1A1A" />
              <Text className="ml-1 font-black uppercase tracking-wide" style={{ color: '#1A1A1A', fontSize: getFontSize(11) }}>
                Ready to Activate
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-black mb-2" style={{
                color: '#1A1A1A',
                fontSize: getFontSize(24),
              }}>
                {region}
              </Text>
              {isProvisioning ? (
                <Text className="font-bold mb-1" style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(20),
                }}>
                  {mbMatch ? `${mbMatch[1]} MB plan` : `${totalDataGB} GB plan`}
                </Text>
              ) : (
                <Text className="font-bold mb-1" style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(20),
                }}>
                  {formatDataRemaining()}
                </Text>
              )}
              {expiryDate ? (
                <Text className="font-bold" style={{
                  color: '#666666',
                  fontSize: getFontSize(14),
                }}>
                  Expires on {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </Text>
              ) : order.plan?.validity_days ? (
                <Text className="font-bold" style={{
                  color: '#666666',
                  fontSize: getFontSize(14),
                }}>
                  Valid for {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
                </Text>
              ) : null}
            </View>

            {/* Circular Progress with Flag */}
            {isProvisioning ? (
              <View style={{
                width: adaptiveScale(80),
                height: adaptiveScale(80),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFEF0',
                borderRadius: adaptiveScale(40),
                borderWidth: 3,
                borderColor: '#FDFD74'
              }}>
                {getFlag(region, Math.floor(adaptiveScale(32)))}
              </View>
            ) : (
              <CircularProgress percentage={percentageUsed} region={region} />
            )}
          </View>
        </TouchableOpacity>

        {/* Activate Button for Provisioning eSIMs */}
        {isProvisioning && (
          <TouchableOpacity
            style={{
              backgroundColor: '#2EFECC',
              paddingVertical: moderateScale(14),
              borderRadius: getBorderRadius(12),
              marginTop: moderateScale(16),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#1A1A1A',
            }}
            onPress={() => router.push(`/install/${order.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={getIconSize(20)} color="#1A1A1A" style={{ marginRight: moderateScale(8) }} />
            <Text className="font-black uppercase" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(16),
              letterSpacing: 1,
            }}>
              Activate eSIM
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [router, extractRegion, getExpiryDate, getCountryFlag, isExpired]);

  // Memoize filtered orders to prevent recalculation
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      // CRITICAL: Explicitly exclude invalid order statuses
      const invalidStatuses = ['cancelled', 'revoked', 'failed', 'unknown', 'pending', 'paid'];
      if (invalidStatuses.includes(order.status)) {
        return false;
      }

      // Show active, depleted, expired, provisioning, and completed eSIMs
      // IMPORTANT: 'completed' status means eSIM is ready to activate (backend provisioning done)
      const validStatuses = ['active', 'depleted', 'expired', 'provisioning', 'completed'];
      if (!validStatuses.includes(order.status)) {
        return false;
      }

      // Completed and Provisioning eSIMs are always active (ready to activate)
      if (order.status === 'provisioning' || order.status === 'completed') {
        return activeTab === 'active';
      }

      // Check if order is expired (includes depleted/expired status and 0 data remaining)
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
        <ActivityIndicator size={isTablet ? 'large' : 'large'} color="#2EFECC" />
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
      {/* Enhanced Header */}
      <View style={{
        backgroundColor: '#2EFECC',
        paddingHorizontal: getHorizontalPadding(),
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(32),
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {/* Title Section with accent */}
        <View style={{marginBottom: moderateScale(20)}}>
          <View className="flex-row items-center">
            <View style={{
              width: 4,
              height: getFontSize(isSmallDevice ? 32 : 36),
              backgroundColor: '#1A1A1A',
              marginRight: moderateScale(12),
              borderRadius: 2,
            }} />
            <Text className="font-black uppercase tracking-tight" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(isSmallDevice ? 32 : 36),
              letterSpacing: -0.5,
            }}>
              MY eSIMs
            </Text>
          </View>
        </View>

        {/* Enhanced Tabs */}
        <View style={{
          backgroundColor: 'rgba(26, 26, 26, 0.1)',
          borderRadius: 18,
          padding: 4,
        }}>
          <View className="flex-row">
            <TouchableOpacity
              className="flex-1"
              style={{
                paddingVertical: moderateScale(12),
                borderRadius: 14,
                backgroundColor: activeTab === 'active' ? '#1A1A1A' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setActiveTab('active')}
              activeOpacity={0.8}
            >
              <Text
                className="text-center font-bold tracking-wide"
                style={{
                  color: activeTab === 'active' ? '#2EFECC' : '#1A1A1A',
                  fontSize: getFontSize(14),
                  letterSpacing: 0.5,
                }}
              >
                ACTIVE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1"
              style={{
                paddingVertical: moderateScale(12),
                borderRadius: 14,
                backgroundColor: activeTab === 'expired' ? '#1A1A1A' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setActiveTab('expired')}
              activeOpacity={0.8}
            >
              <Text
                className="text-center font-bold tracking-wide"
                style={{
                  color: activeTab === 'expired' ? '#2EFECC' : '#1A1A1A',
                  fontSize: getFontSize(14),
                  letterSpacing: 0.5,
                }}
              >
                EXPIRED
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* eSIM List */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => renderOrderCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: getHorizontalPadding(),
          paddingTop: moderateScale(8),
          paddingBottom: moderateScale(120), // Space for fixed bottom button
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
          <View className="items-center justify-center" style={{ paddingVertical: moderateScale(48) }}>
            <View style={{
              backgroundColor: '#F5F5F5',
              borderRadius: adaptiveScale(50),
              padding: moderateScale(24),
              marginBottom: moderateScale(24),
            }}>
              <Ionicons name="receipt-outline" size={getIconSize(64)} color="#666666" />
            </View>
            <Text className="font-black mb-2 uppercase text-center" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(24),
            }}>
              {activeTab === 'active' ? 'No Active eSIMs' : 'No Expired eSIMs'}
            </Text>
            <Text className="text-center font-bold" style={{
              color: '#666666',
              fontSize: getFontSize(16),
              paddingHorizontal: getHorizontalPadding(),
            }}>
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
          paddingHorizontal: getHorizontalPadding(),
          paddingTop: moderateScale(16),
          paddingBottom: moderateScale(32),
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              paddingVertical: moderateScale(18),
              borderRadius: getBorderRadius(999),
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
            <Text className="font-black text-center" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(18),
            }}>
              Add more data
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
