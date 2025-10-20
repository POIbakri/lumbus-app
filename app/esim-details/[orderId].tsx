import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrderById, fetchUsageData, subscribeToOrderUpdates, UsageData } from '../../lib/api';
import { UsageBar } from '../components/UsageBar';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function EsimDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
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

  // Fetch usage data
  useEffect(() => {
    if (order && (order.status === 'active' || order.status === 'depleted')) {
      loadUsageData();
    }
  }, [order]);

  async function loadUsageData() {
    if (!orderId) return;
    try {
      const usage = await fetchUsageData(orderId);
      if (usage) {
        setUsageData(usage);
      }
    } catch (error) {
      // Silently fail - usage data is optional
    }
  }

  function extractRegion(name: string) {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }

  function getExpiryDate() {
    if (!order) return null;

    // Only use activate_before for expiry calculation
    // Don't calculate from created_at + validity_days because eSIMs
    // aren't activated until installed by the user
    if (order.activate_before) {
      return new Date(order.activate_before);
    }

    return null;
  }

  function isExpired() {
    // Check backend status first
    if (order?.status === 'depleted') return true;

    // Then check date-based expiry if available
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

  // Parse actual data amount from plan name if it contains MB (e.g., "100MB", "500MB")
  // Otherwise use data_gb from database
  let totalDataGB = order.plan?.data_gb || 0;
  const mbMatch = planName.match(/(\d+)\s*MB/i);
  if (mbMatch) {
    // Plan specifies MB directly (e.g., "100MB", "500MB")
    // Use this as source of truth - convert to GB using decimal (1000 MB = 1 GB for display)
    const mbValue = parseInt(mbMatch[1]);
    totalDataGB = mbValue / 1024; // Convert to GB for consistency (100MB = 0.09765625 GB)
  }

  // Use data from order object directly
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
        {/* Header with brand turquoise */}
        <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(16)}}>
            <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
          </TouchableOpacity>

          <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(32), lineHeight: getFontSize(36), marginBottom: moderateScale(8)}}>
            {region}
          </Text>
          <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(16)}}>
            {mbMatch ? `${mbMatch[1]} MB` : `${totalDataGB} GB`} • {order.plan?.validity_days || 0} days
          </Text>
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
        {expiryDate && (
          <View className="rounded-2xl" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12), marginBottom: moderateScale(12)}}>
              Validity
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
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

        {/* Top Up Button */}
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
