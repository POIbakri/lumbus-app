import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrderById, fetchUsageData, subscribeToOrderUpdates, UsageData, fetchTopUpHistory } from '../../lib/api';
import { Order } from '../../types';
import { UsageBar } from '../components/UsageBar';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function EsimDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [topUpHistory, setTopUpHistory] = useState<Order[]>([]);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when screen is mounted
  });

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!orderId) return;

    const channel = subscribeToOrderUpdates(orderId, (updatedOrder) => {
      refetch();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [orderId]);

  // Fetch usage data with cleanup to prevent memory leak
  useEffect(() => {
    let isMounted = true;

    async function loadUsageData() {
      if (!orderId) return;
      try {
        const usage = await fetchUsageData(orderId);
        if (isMounted && usage) {
          setUsageData(usage);
        }
      } catch (error) {
        // Silently fail - usage data is optional
      }
    }

    if (order && (order.status === 'active' || order.status === 'depleted')) {
      loadUsageData();
    }

    return () => {
      isMounted = false;
    };
  }, [order, orderId]);

  // Fetch top-up history with cleanup to prevent memory leak
  useEffect(() => {
    let isMounted = true;

    async function loadTopUpHistory() {
      if (!order?.iccid) return;
      try {
        const history = await fetchTopUpHistory(order.iccid);
        if (isMounted) {
          setTopUpHistory(history);
        }
      } catch (error) {
        // Silently fail - top-up history is optional
      }
    }

    if (order?.iccid) {
      loadTopUpHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [order?.iccid]);

  function extractRegion(name: string) {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }

  function getExpiryDate() {
    if (!order) return null;

    // Prioritize expires_at from API (server-calculated, most accurate)
    if (order.expires_at) {
      return new Date(order.expires_at);
    }

    // Fallback to activate_before for backward compatibility
    if (order.activate_before) {
      return new Date(order.activate_before);
    }

    return null;
  }

  function isExpired() {
    // Check if validity period has ended (not just data depleted)
    // Depleted means data used up but validity may still be valid - can still top-up
    if (order?.status === 'expired') return true;

    // Use time_remaining from API if available (more accurate, server-calculated)
    if (order?.time_remaining) {
      return order.time_remaining.is_expired;
    }

    // Fallback: Check date-based expiry if available
    const expiryDate = getExpiryDate();
    if (!expiryDate) return false;
    return new Date() > expiryDate;
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16)}}>
          Order not found
        </Text>
      </View>
    );
  }

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

  const expiryDate = getExpiryDate();
  const expired = isExpired();

  // Format data remaining display
  const formatDataRemaining = () => {
    if (expired || dataRemainingGB === 0) {
      return '0.0 GB';
    } else if (dataRemainingGB < 0.5) {
      // Show in MB if less than 500MB
      return `${Math.round(dataRemainingMB)} MB`;
    } else {
      return `${dataRemainingGB.toFixed(2)} GB`;
    }
  };

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      <ScrollView>
        {/* Enhanced Header with modern design */}
        <View style={{
          backgroundColor: '#2EFECC',
          paddingHorizontal: getHorizontalPadding(),
          paddingTop: moderateScale(64),
          paddingBottom: moderateScale(36),
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 8,
        }}>
          {/* Enhanced Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginBottom: moderateScale(24),
              backgroundColor: 'rgba(26, 26, 26, 0.1)',
              borderRadius: 50,
              width: scale(40),
              height: scale(40),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={scale(22)} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Title Section with enhanced design */}
          <View>
            {/* Main Title with accent - single line layout */}
            <View className="flex-row items-center" style={{marginBottom: moderateScale(16)}}>
              <View style={{
                width: 4,
                height: getFontSize(isSmallDevice ? 28 : 34),
                backgroundColor: '#1A1A1A',
                marginRight: moderateScale(12),
                borderRadius: 2,
              }} />
              <Text
                className="font-black uppercase tracking-tight"
                style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(isSmallDevice ? 28 : 34),
                  letterSpacing: -0.5,
                  flex: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {region}
              </Text>
            </View>

            {/* Plan Info Row */}
            <View className="flex-row items-center flex-wrap">
              <View style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10,
                paddingVertical: moderateScale(6),
                paddingHorizontal: scale(14),
                marginRight: moderateScale(8),
              }}>
                <Text className="font-bold tracking-wide" style={{
                  color: '#2EFECC',
                  fontSize: getFontSize(13),
                  letterSpacing: 0.5,
                }}>
                  {/* Show actual total data (includes top-ups) */}
                  {actualTotalGB < 1 ? `${Math.round(actualTotalMB)} MB` : `${actualTotalGB.toFixed(1)} GB`}
                </Text>
              </View>

              <View style={{
                backgroundColor: 'rgba(26, 26, 26, 0.1)',
                borderRadius: 10,
                paddingVertical: moderateScale(6),
                paddingHorizontal: scale(12),
              }}>
                <Text className="font-semibold" style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(12),
                  letterSpacing: 0.2,
                }}>
                  {/* Show actual remaining time, or "Was valid for" if expired */}
                  {expired
                    ? `Was ${order.plan?.validity_days || 0} Days`
                    : order.time_remaining && !order.time_remaining.is_expired
                    ? `${order.time_remaining.days}d ${order.time_remaining.hours}h left`
                    : `${order.plan?.validity_days || 0} Days`}
                </Text>
              </View>
            </View>
          </View>
        </View>

      <View style={{paddingHorizontal: getHorizontalPadding(), paddingBottom: moderateScale(24)}}>
        {/* Status Badge */}
        <View className="flex-row items-center" style={{marginBottom: moderateScale(24)}}>
          <View
            className="px-4 py-2 rounded-xl flex-row items-center"
            style={{backgroundColor: expired ? '#FDFD74' : '#2EFECC'}}
          >
            <Ionicons
              name={expired ? 'time-outline' : 'checkmark-circle'}
              size={scale(20)}
              color="#1A1A1A"
            />
            <Text className="ml-2 font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13)}}>
              {expired ? 'Expired' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Data Usage Card */}
        <View className="rounded-2xl" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
          <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12), marginBottom: moderateScale(16)}}>
            Data Usage
          </Text>

          <>
            <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(28), marginBottom: moderateScale(8)}}>
              {formatDataRemaining()} remaining
            </Text>
            <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14), marginBottom: moderateScale(16)}}>
              {dataUsedGB.toFixed(2)} GB of {actualTotalGB.toFixed(2)} GB used
            </Text>

            <UsageBar
              dataUsed={dataUsedGB}
              dataTotal={actualTotalGB}
              percentageUsed={percentageUsed}
            />
          </>
        </View>

        {/* Validity Card */}
        {(expiryDate || order.time_remaining) && (
          <View className="rounded-2xl" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12), marginBottom: moderateScale(12)}}>
              Validity
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                {expired && order.plan?.validity_days ? (
                  <>
                    <Text className="font-bold" style={{color: '#999999', fontSize: getFontSize(14), marginBottom: moderateScale(4)}}>
                      Was valid for
                    </Text>
                    <Text className="font-black" style={{color: '#666666', fontSize: getFontSize(18)}}>
                      {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
                    </Text>
                  </>
                ) : order.time_remaining && !order.time_remaining.is_expired ? (
                  <>
                    <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14), marginBottom: moderateScale(4)}}>
                      Time remaining
                    </Text>
                    <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>
                      {order.time_remaining.days >= 1
                        ? `${order.time_remaining.days} ${order.time_remaining.days === 1 ? 'day' : 'days'}`
                        : order.time_remaining.hours >= 1
                        ? `${order.time_remaining.hours} ${order.time_remaining.hours === 1 ? 'hour' : 'hours'}`
                        : `${order.time_remaining.minutes} ${order.time_remaining.minutes === 1 ? 'min' : 'mins'}`}
                    </Text>
                  </>
                ) : order.plan?.validity_days ? (
                  <>
                    <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14), marginBottom: moderateScale(4)}}>
                      Validity period
                    </Text>
                    <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>
                      {order.plan.validity_days} {order.plan.validity_days === 1 ? 'day' : 'days'}
                    </Text>
                  </>
                ) : expiryDate ? (
                  <>
                    <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14), marginBottom: moderateScale(4)}}>
                      {expired ? 'Expired on' : 'Expires on'}
                    </Text>
                    <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>
                      {expiryDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </>
                ) : null}
              </View>
              <Ionicons
                name={expired ? 'close-circle' : 'calendar-outline'}
                size={scale(32)}
                color={expired ? '#EF4444' : '#2EFECC'}
              />
            </View>
          </View>
        )}

        {/* eSIM Details Card */}
        <View className="rounded-2xl" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
          <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12), marginBottom: moderateScale(16)}}>
            eSIM Details
          </Text>

          {order.iccid && (
            <View style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(6)}}>
                ICCID
              </Text>
              <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {order.iccid}
              </Text>
            </View>
          )}

          {order.apn && (
            <View style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(6)}}>
                APN
              </Text>
              <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {order.apn}
              </Text>
            </View>
          )}

          <View>
            <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(6)}}>
              Order ID
            </Text>
            <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
              {order.id.slice(0, 8)}...
            </Text>
          </View>
        </View>

        {/* Top-Up History Card */}
        {topUpHistory.length > 0 && (
          <View className="rounded-2xl" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <View className="flex-row items-center justify-between" style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12)}}>
                Top-Up History
              </Text>
              <View style={{
                backgroundColor: '#2EFECC',
                borderRadius: 12,
                paddingVertical: moderateScale(4),
                paddingHorizontal: moderateScale(10),
              }}>
                <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(11)}}>
                  {topUpHistory.length} {topUpHistory.length === 1 ? 'top-up' : 'top-ups'}
                </Text>
              </View>
            </View>

            {topUpHistory.map((topUp, index) => (
              <View
                key={topUp.id}
                style={{
                  paddingVertical: moderateScale(12),
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: '#E5E5E5',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(15)}}>
                      +{topUp.plan?.data_gb || 0} GB
                    </Text>
                    <Text className="font-medium" style={{color: '#666666', fontSize: getFontSize(12), marginTop: moderateScale(2)}}>
                      {topUp.plan?.validity_days || 0} days validity
                    </Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text className="font-medium" style={{color: '#666666', fontSize: getFontSize(12)}}>
                      {new Date(topUp.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <View style={{
                      backgroundColor: topUp.status === 'active' ? '#E0FEF7' : '#F5F5F5',
                      borderRadius: 8,
                      paddingVertical: moderateScale(2),
                      paddingHorizontal: moderateScale(8),
                      marginTop: moderateScale(4),
                    }}>
                      <Text className="font-medium" style={{
                        color: topUp.status === 'active' ? '#059669' : '#666666',
                        fontSize: getFontSize(10),
                        textTransform: 'uppercase',
                      }}>
                        {topUp.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Up Button - for active eSIMs */}
        {!expired && order.iccid && (
          <TouchableOpacity
            className="rounded-2xl"
            style={{backgroundColor: '#FDFD74', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(20), marginBottom: moderateScale(24), shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8}}
            onPress={() => router.push(`/topup/${order.id}`)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginBottom: moderateScale(4)}}>
                  Need more data?
                </Text>
                <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>
                  Top up your eSIM instantly
                </Text>
              </View>
              <Ionicons name="add-circle" size={scale(32)} color="#1A1A1A" />
            </View>
          </TouchableOpacity>
        )}

        {/* Buy Again Button - for expired eSIMs */}
        {expired && (
          <TouchableOpacity
            className="rounded-2xl"
            style={{backgroundColor: '#2EFECC', borderWidth: 2, borderColor: '#1A1A1A', padding: moderateScale(20), marginBottom: moderateScale(24), shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8}}
            onPress={() => router.push(`/region/${encodeURIComponent(region)}`)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginBottom: moderateScale(4)}}>
                  Buy Again
                </Text>
                <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(14), opacity: 0.7}}>
                  Get a new eSIM for {region}
                </Text>
              </View>
              <Ionicons name="refresh-circle" size={scale(32)} color="#1A1A1A" />
            </View>
          </TouchableOpacity>
        )}

        {/* Important Notes */}
        {!expired && (
          <View className="rounded-2xl flex-row items-start" style={{backgroundColor: '#E0FEF7', borderWidth: 2, borderColor: '#2EFECC', padding: moderateScale(20)}}>
            <Ionicons name="information-circle" size={scale(24)} color="#2EFECC" />
            <View className="flex-1" style={{marginLeft: scale(12)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginBottom: moderateScale(4)}}>
                Active eSIM
              </Text>
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                Your eSIM is active and ready to use in {region}. Make sure to enable data roaming when traveling.
              </Text>
            </View>
          </View>
        )}
      </View>
      </ScrollView>
    </View>
  );
}
