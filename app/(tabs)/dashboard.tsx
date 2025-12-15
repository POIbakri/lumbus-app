import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, ActionSheetIOS, Platform, Modal } from 'react-native';
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showEsimPicker, setShowEsimPicker] = useState(false);
  const { moderateScale, adaptiveScale, isTablet, screenWidth, isSmallDevice } = useResponsive();

  // Check cache synchronously for userId (set during login)
  const cachedUserId = queryClient.getQueryData<string | null>(['userId']);

  // Fetch user ID - use cached value as initial data for instant load
  const { data: userId } = useQuery({
    queryKey: ['userId'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    },
    initialData: cachedUserId ?? undefined,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Check cache synchronously for orders (prefetched during login)
  const cachedOrders = userId ? queryClient.getQueryData<Order[]>(['orders', userId]) : undefined;

  // Fetch orders - use cached value as initial data for instant load
  const { data: orders, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
    initialData: cachedOrders,
    staleTime: 600000, // 10 minutes
    gcTime: 1800000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
    // Prioritize expires_at from API (server-calculated, most accurate)
    if (order.expires_at) {
      return new Date(order.expires_at);
    }
    // Fallback to activate_before for backward compatibility
    if (order.activate_before) {
      return new Date(order.activate_before);
    }
    return null;
  }, []);

  const isExpired = useCallback((order: Order) => {
    // Only check if validity period has ended (time-expired)
    // Depleted eSIMs (data used up) can still be topped up if validity remains
    if (order.status === 'expired') return true;

    // Use time_remaining from API if available (more accurate, server-calculated)
    if (order.time_remaining) {
      return order.time_remaining.is_expired;
    }

    // Fallback: Check date-based expiry for activate_before date
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

  // Get set of ICCIDs that have been topped up - for showing "Topped Up" badge
  const toppedUpIccids = useMemo(() => {
    if (!orders) return new Set<string>();
    const iccids = new Set<string>();
    orders.forEach(order => {
      if (order.is_topup === true && order.iccid) {
        iccids.add(order.iccid);
      }
    });
    return iccids;
  }, [orders]);

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

    // Use total_bytes from backend (includes top-ups), fallback to plan.data_gb
    const getTotalBytes = () => {
      // Priority 1: Use total_bytes from backend if available
      if (order.total_bytes !== null && order.total_bytes !== undefined && order.total_bytes > 0) {
        return order.total_bytes;
      }
      // Priority 2: Parse MB from plan name if present
      const mbMatch = planName.match(/(\d+)\s*MB/i);
      if (mbMatch) {
        return parseInt(mbMatch[1]) * 1024 * 1024; // Convert MB to bytes
      }
      // Priority 3: Use plan.data_gb
      return (order.plan?.data_gb || 0) * 1024 * 1024 * 1024;
    };

    const isProvisioning = order.status === 'provisioning' || order.status === 'completed';
    const isDepleted = order.status === 'depleted';

    // Use data_remaining_bytes from backend (most accurate)
    const dataRemainingBytes = order.data_remaining_bytes !== null && order.data_remaining_bytes !== undefined
      ? order.data_remaining_bytes
      : getTotalBytes();

    // Total bytes from backend
    const actualTotalBytes = getTotalBytes();
    const actualTotalGB = actualTotalBytes / (1024 * 1024 * 1024);
    const actualTotalMB = actualTotalBytes / (1024 * 1024);

    // Calculate used bytes from total - remaining (more accurate than data_usage_bytes which may lag)
    const dataUsedBytes = Math.max(0, actualTotalBytes - dataRemainingBytes);
    const dataUsedGB = dataUsedBytes / (1024 * 1024 * 1024);
    const dataRemainingGB = Math.max(0, dataRemainingBytes / (1024 * 1024 * 1024));
    const dataRemainingMB = Math.max(0, dataRemainingBytes / (1024 * 1024));

    // Calculate percentage used
    const percentageUsed = actualTotalBytes > 0 ? (dataUsedBytes / actualTotalBytes) * 100 : 0;

    const expiryDate = getExpiryDate(order);
    const hasUsage = dataUsedBytes > 0;
    const orderExpired = isExpired(order);

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

          {/* Topped Up Badge - shows on original eSIMs that have received top-ups */}
          {order.iccid && toppedUpIccids.has(order.iccid) && !isProvisioning && (
            <View className="flex-row items-center mb-2" style={{
              backgroundColor: '#E0FEF7',
              alignSelf: 'flex-start',
              paddingHorizontal: moderateScale(8),
              paddingVertical: moderateScale(4),
              borderRadius: getBorderRadius(8),
            }}>
              <Ionicons name="add-circle" size={getIconSize(12)} color="#2EFECC" />
              <Text className="ml-1 font-bold uppercase tracking-wide" style={{ color: '#1A1A1A', fontSize: getFontSize(9) }}>
                Topped Up
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
                  {actualTotalGB < 1 ? `${Math.round(actualTotalMB)} MB plan` : `${actualTotalGB.toFixed(1)} GB plan`}
                </Text>
              ) : (
                <Text className="font-bold mb-1" style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(20),
                }}>
                  {formatDataRemaining()}
                </Text>
              )}
              {orderExpired && order.plan?.validity_days ? (
                <Text className="font-bold" style={{
                  color: '#999999',
                  fontSize: getFontSize(14),
                }}>
                  Was valid for {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
                </Text>
              ) : order.time_remaining && !order.time_remaining.is_expired ? (
                <Text className="font-bold" style={{
                  color: '#666666',
                  fontSize: getFontSize(14),
                }}>
                  {order.time_remaining.days >= 1
                    ? `${order.time_remaining.days} ${order.time_remaining.days === 1 ? 'day' : 'days'} remaining`
                    : order.time_remaining.hours >= 1
                    ? `${order.time_remaining.hours} ${order.time_remaining.hours === 1 ? 'hour' : 'hours'} remaining`
                    : `${order.time_remaining.minutes} ${order.time_remaining.minutes === 1 ? 'min' : 'mins'} remaining`}
                </Text>
              ) : order.plan?.validity_days ? (
                <Text className="font-bold" style={{
                  color: '#666666',
                  fontSize: getFontSize(14),
                }}>
                  Valid for {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
                </Text>
              ) : expiryDate ? (
                <Text className="font-bold" style={{
                  color: '#666666',
                  fontSize: getFontSize(14),
                }}>
                  Expires on {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
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
  }, [router, extractRegion, getExpiryDate, getCountryFlag, isExpired, toppedUpIccids]);

  // Memoize filtered orders to prevent recalculation
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      // Exclude top-up orders - they add data to existing eSIMs, not new eSIMs
      if (order.is_topup === true) {
        return false;
      }

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

  // Get eSIMs eligible for top-up - memoized
  // Valid states: New (completed with iccid), In Use (active), Depleted (but not time-expired)
  // Excludes: Expired (validity ended), top-up orders
  const activeEsimsWithIccid = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      // Exclude top-up orders (they're not separate eSIMs)
      if (order.is_topup === true) return false;
      // Must have an ICCID to top-up
      if (!order.iccid) return false;
      // Check if validity period has ended (time-expired, not data-depleted)
      if (order.status === 'expired') return false;
      if (order.time_remaining?.is_expired) return false;
      const expiryDate = getExpiryDate(order);
      if (expiryDate && new Date() > expiryDate) return false;
      // Valid statuses for top-up: completed (new), active (in use), depleted (data used up)
      const validStatuses = ['completed', 'active', 'depleted'];
      return validStatuses.includes(order.status);
    });
  }, [orders, getExpiryDate]);

  // Only show full loading spinner if we have NO data at all (no cache, no orders)
  // If we have cached data from login prefetch, show it immediately
  const hasAnyData = orders !== undefined || cachedOrders !== undefined;

  if (!hasAnyData && (isLoading || !userId)) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size={isTablet ? 'large' : 'large'} color="#2EFECC" />
      </View>
    );
  }

  // Handle "Add more data" button click
  function handleAddMoreData() {
    if (activeEsimsWithIccid.length === 0) {
      // No active eSIMs with ICCID - go to browse to get first eSIM
      router.push('/(tabs)/browse');
    } else if (activeEsimsWithIccid.length === 1) {
      // Single active eSIM - go directly to top-up
      router.push(`/topup/${activeEsimsWithIccid[0].id}`);
    } else {
      // Multiple active eSIMs - show picker
      const esimOptions = activeEsimsWithIccid.map(esim => extractRegion(esim.plan?.name || 'Unknown'));

      if (Platform.OS === 'ios') {
        // iOS: Use ActionSheetIOS (supports unlimited options)
        ActionSheetIOS.showActionSheetWithOptions(
          {
            title: 'Select eSIM to Top Up',
            message: 'Choose which eSIM you want to add data to:',
            options: [...esimOptions, 'Cancel'],
            cancelButtonIndex: esimOptions.length,
          },
          (buttonIndex) => {
            if (buttonIndex < activeEsimsWithIccid.length) {
              router.push(`/topup/${activeEsimsWithIccid[buttonIndex].id}`);
            }
          }
        );
      } else if (activeEsimsWithIccid.length <= 2) {
        // Android with 2 or fewer eSIMs: Use Alert (max 3 buttons)
        const esimButtons = activeEsimsWithIccid.map(esim => ({
          text: extractRegion(esim.plan?.name || 'Unknown'),
          onPress: () => router.push(`/topup/${esim.id}`),
        }));

        Alert.alert(
          'Select eSIM to Top Up',
          'Choose which eSIM you want to add data to:',
          [...esimButtons, { text: 'Cancel', style: 'cancel' }]
        );
      } else {
        // Android with 3+ eSIMs: Show modal picker
        setShowEsimPicker(true);
      }
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

      {/* eSIM Picker Modal for Android with 3+ eSIMs */}
      <Modal
        visible={showEsimPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEsimPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowEsimPicker(false)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: getBorderRadius(16),
              padding: getSpacing(24),
              width: screenWidth * 0.85,
              maxHeight: '70%',
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text className="font-black" style={{
              fontSize: getFontSize(20),
              color: '#1A1A1A',
              marginBottom: getSpacing(8),
            }}>
              Select eSIM to Top Up
            </Text>
            <Text style={{
              fontSize: getFontSize(14),
              color: '#666666',
              marginBottom: getSpacing(16),
            }}>
              Choose which eSIM you want to add data to:
            </Text>
            <FlatList
              data={activeEsimsWithIccid}
              keyExtractor={(item) => item.id}
              style={{ flexGrow: 0, maxHeight: 300 }}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: getSpacing(14),
                    paddingHorizontal: getSpacing(16),
                    borderRadius: getBorderRadius(12),
                    backgroundColor: '#F5F5F5',
                    marginBottom: getSpacing(8),
                  }}
                  onPress={() => {
                    setShowEsimPicker(false);
                    router.push(`/topup/${item.id}`);
                  }}
                >
                  <Text className="font-bold" style={{ fontSize: getFontSize(16), color: '#1A1A1A' }}>
                    {extractRegion(item.plan?.name || 'Unknown')}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                paddingVertical: getSpacing(14),
                marginTop: getSpacing(8),
                borderRadius: getBorderRadius(12),
                borderWidth: 2,
                borderColor: '#E0E0E0',
              }}
              onPress={() => setShowEsimPicker(false)}
            >
              <Text className="font-bold text-center" style={{ fontSize: getFontSize(16), color: '#666666' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
