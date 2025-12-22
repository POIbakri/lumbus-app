import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { TopUpLoader } from '../../components/loaders';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrderById, fetchPlans } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useLocationCurrency } from '../../hooks/useLocationCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { logger } from '../../lib/logger';
import { PaymentService } from '../../lib/payments/PaymentService';
import { getFlag } from '../../components/icons/flags';

interface TopUpPackage {
  id: string;
  name: string;
  dataGb: number;
  validityDays: number;
  price: number;
}

export default function TopUpScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);
  const [displayPrices, setDisplayPrices] = useState<Record<string, string>>({});

  // Use combined hook - same as Plan Detail
  const { convertMultiplePrices, loading: currencyLoading, currency } = useLocationCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  // Initialize payment service on mount - same as Plan Detail
  useEffect(() => {
    PaymentService.initialize().catch(error => {
      logger.error('Failed to initialize payment service:', error);
    });

    return () => {
      setLoading(false);
      PaymentService.cleanup();
    };
  }, []);

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
    staleTime: 300000,
    gcTime: 600000,
  });

  // Fetch plans - same query as Browse, cached from splash
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 600000,
    gcTime: 1800000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Filter plans by region - case-insensitive to handle inconsistent backend data
  const packages: TopUpPackage[] = React.useMemo(() => {
    if (!plans || !order?.plan?.region_code) return [];

    const regionCode = order.plan.region_code.toLowerCase().trim();
    return plans
      .filter(plan => {
        const planRegion = plan.region_code?.toLowerCase().trim() || '';
        // Match exact or if one contains the other (e.g., 'US' vs 'USA')
        return (planRegion === regionCode ||
                planRegion.includes(regionCode) ||
                regionCode.includes(planRegion)) &&
               plan.is_active !== false;
      })
      .sort((a, b) => a.data_gb - b.data_gb)
      .map(plan => ({
        id: plan.id,
        name: plan.name,
        dataGb: plan.data_gb,
        validityDays: plan.validity_days,
        price: plan.retail_price,
      }));
  }, [plans, order?.plan?.region_code]);

  // Convert prices - capture packages at start to avoid race condition
  const convertPrices = React.useCallback(async () => {
    if (packages.length === 0) return;

    // Capture current packages to avoid race condition if packages changes during await
    const currentPackages = [...packages];
    const prices = currentPackages.map(p => p.price);
    const converted = await convertMultiplePrices(prices);

    // Use captured packages for mapping to ensure indices align
    const priceMap: Record<string, string> = {};
    currentPackages.forEach((pkg, index) => {
      priceMap[pkg.id] = converted[index].formatted;
    });

    setDisplayPrices(priceMap);
  }, [packages, convertMultiplePrices]);

  // Run price conversion when packages or currency changes - same as Plan Detail
  useEffect(() => {
    if (packages.length > 0 && !currencyLoading) {
      convertPrices();
    }
  }, [packages, currencyLoading, convertPrices]);

  // Extract region from plan name
  const extractRegion = (name: string) => {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  };

  async function handlePurchase() {
    if (!selectedPackage || !order?.iccid) {
      Alert.alert('Error', 'Cannot process top-up. Please try again.');
      return;
    }

    if (loading) return;

    setLoading(true);
    setProcessingStatus('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Session Expired', 'Please log in again to continue.');
        setLoading(false);
        router.replace('/(auth)/login');
        return;
      }

      const purchaseParams = {
        planId: selectedPackage.id,
        planName: selectedPackage.name,
        price: selectedPackage.price,
        currency,
        email: user.email!,
        userId: user.id,
        isTopUp: true,
        existingOrderId: orderId!,
        iccid: order.iccid,
      };

      const result = await PaymentService.purchase(purchaseParams);

      if (result.success) {
        setProcessingStatus('Adding data...');

        // Invalidate caches so fresh data is fetched
        // Backend updates the original order with new data/validity
        await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        await queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Small delay to allow backend to process the top-up
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLoading(false);
        setProcessingStatus('');

        Alert.alert(
          'Top-Up Successful!',
          'Data has been added to your eSIM.',
          [{ text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      } else {
        setLoading(false);
        setProcessingStatus('');

        if (result.error && result.error !== 'Purchase cancelled' && result.error !== 'Payment cancelled') {
          Alert.alert('Top-Up Failed', result.error, [{ text: 'OK' }]);
        }
      }
    } catch (error: any) {
      logger.error('Top-up error:', error);
      setLoading(false);
      setProcessingStatus('');
      Alert.alert(
        'Top-Up Error',
        error.message || 'Failed to process top-up. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  // Loading state - SAME as Plan Detail: isLoading || currencyLoading
  if (orderLoading || plansLoading || currencyLoading) {
    return <TopUpLoader />;
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

  if (!order.iccid) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={64} color="#FDFD74" />
        <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16), marginBottom: moderateScale(8)}}>
          eSIM Not Ready
        </Text>
        <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(14)}}>
          Please wait for your eSIM to be provisioned before topping up.
        </Text>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="information-circle" size={64} color="#2EFECC" />
        <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16), marginBottom: moderateScale(8)}}>
          No packages available
        </Text>
        <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(14)}}>
          No compatible packages available for this eSIM.
        </Text>
        <TouchableOpacity
          className="rounded-2xl mt-6"
          style={{backgroundColor: '#FDFD74', paddingVertical: moderateScale(14), paddingHorizontal: moderateScale(24)}}
          onPress={() => router.push('/(tabs)/browse')}
          activeOpacity={0.8}
        >
          <Text className="font-black uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
            Browse New eSIMs
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const planName = order.plan?.name || 'Unknown Plan';
  const region = extractRegion(planName);
  const regionCode = order.plan?.region_code || '';

  // Calculate current eSIM data using total_bytes (includes previous top-ups)
  const getCurrentTotalBytes = () => {
    if (order.total_bytes !== null && order.total_bytes !== undefined && order.total_bytes > 0) {
      return order.total_bytes;
    }
    const mbMatch = planName.match(/(\d+)\s*MB/i);
    if (mbMatch) {
      return parseInt(mbMatch[1]) * 1024 * 1024;
    }
    return (order.plan?.data_gb || 0) * 1024 * 1024 * 1024;
  };
  const currentTotalBytes = getCurrentTotalBytes();
  const currentTotalGB = currentTotalBytes / (1024 * 1024 * 1024);
  const currentTotalMB = currentTotalBytes / (1024 * 1024);
  const currentDataDisplay = currentTotalGB < 1 ? `${Math.round(currentTotalMB)} MB` : `${currentTotalGB.toFixed(1)} GB`;

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      <ScrollView>
        {/* Header - same as Plan Detail */}
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

          <View className="flex-row items-center" style={{marginBottom: moderateScale(16)}}>
            <View style={{
              width: 4,
              height: getFontSize(isSmallDevice ? 32 : 38),
              backgroundColor: '#1A1A1A',
              marginRight: moderateScale(12),
              borderRadius: 2,
            }} />
            <View className="flex-row items-center" style={{gap: 8, flex: 1}}>
              {getFlag(regionCode, isSmallDevice ? 24 : 28)}
              <Text
                className="font-black uppercase tracking-tight"
                style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(isSmallDevice ? 24 : 30),
                  letterSpacing: -0.5,
                  flex: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                Top Up {region}
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: 'rgba(26, 26, 26, 0.1)',
            borderRadius: 10,
            paddingVertical: moderateScale(6),
            paddingHorizontal: scale(12),
            alignSelf: 'flex-start',
          }}>
            <Text className="font-semibold" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(12),
              letterSpacing: 0.2,
            }}>
              Add more data to your eSIM
            </Text>
          </View>
        </View>

        <View style={{paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(24)}}>
          {/* Current eSIM Info Card */}
          <View className="rounded-2xl" style={{backgroundColor: '#E0FEF7', padding: moderateScale(20), marginBottom: moderateScale(24), borderWidth: 2, borderColor: '#2EFECC'}}>
            <View className="flex-row items-center" style={{marginBottom: moderateScale(12)}}>
              <Ionicons name="phone-portrait-outline" size={scale(20)} color="#2EFECC" />
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginLeft: scale(8)}}>
                Current eSIM
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{gap: 8}}>
                {getFlag(regionCode, isSmallDevice ? 20 : 24)}
                <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>{region}</Text>
              </View>
              <View className="flex-row items-center" style={{gap: moderateScale(8)}}>
                <View className="px-3 py-1 rounded-full" style={{backgroundColor: '#FFFFFF'}}>
                  <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(12)}}>
                    {currentDataDisplay}
                  </Text>
                </View>
                <View className="px-3 py-1 rounded-full" style={{backgroundColor: '#FFFFFF'}}>
                  <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(12)}}>
                    {order.plan?.validity_days}d
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Top-up Packages */}
          <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(20), marginBottom: moderateScale(16)}}>
            Select top-up package
          </Text>

          {packages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;

            return (
              <TouchableOpacity
                key={pkg.id}
                className="bg-white rounded-2xl"
                style={{
                  padding: moderateScale(20),
                  marginBottom: moderateScale(12),
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? '#FDFD74' : '#E5E5E5',
                  backgroundColor: isSelected ? '#FFFEF0' : '#FFFFFF',
                }}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between items-center" style={{marginBottom: moderateScale(16), gap: 12}}>
                  <View className="flex-row items-center flex-1" style={{gap: 8}}>
                    {getFlag(regionCode, isSmallDevice ? 18 : 20)}
                    <Text
                      className="font-black uppercase tracking-tight"
                      style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 16 : 18), flex: 1}}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      {region}
                    </Text>
                  </View>
                  <View className="px-4 py-3 rounded-xl" style={{backgroundColor: '#2EFECC'}}>
                    <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>
                      {displayPrices[pkg.id] || '...'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center" style={{gap: moderateScale(12)}}>
                  <View className="flex-row items-center px-4 py-2 rounded-full" style={{backgroundColor: '#E0FEF7'}}>
                    <Ionicons name="cellular" size={16} color="#2EFECC" />
                    <Text className="ml-2 font-black text-sm uppercase" style={{color: '#1A1A1A'}}>
                      {pkg.dataGb} GB
                    </Text>
                  </View>
                  <View className="flex-row items-center px-4 py-2 rounded-full" style={{backgroundColor: '#FFFEF0'}}>
                    <Ionicons name="time" size={16} color="#1A1A1A" />
                    <Text className="ml-2 font-black text-sm uppercase" style={{color: '#1A1A1A'}}>
                      {pkg.validityDays} days
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View className="flex-row items-center" style={{marginTop: moderateScale(12)}}>
                    <Ionicons name="checkmark-circle" size={scale(18)} color="#1A1A1A" />
                    <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginLeft: scale(8)}}>
                      Selected
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Info Banner */}
          <View className="rounded-2xl flex-row items-start" style={{backgroundColor: '#E0FEF7', borderWidth: 2, borderColor: '#2EFECC', padding: moderateScale(20), marginTop: moderateScale(8)}}>
            <Ionicons name="information-circle" size={scale(24)} color="#2EFECC" />
            <View className="flex-1" style={{marginLeft: scale(12)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginBottom: moderateScale(4)}}>
                Instant Top-Up
              </Text>
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                Data is added instantly after payment. No need to reinstall your eSIM.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA - same as Plan Detail */}
      <View style={{backgroundColor: '#FFFFFF', borderTopWidth: 2, borderColor: '#E5E5E5', paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(20)}}>
        <TouchableOpacity
          className="rounded-2xl"
          style={{
            backgroundColor: loading ? '#87EFFF' : (selectedPackage ? '#2EFECC' : '#E5E5E5'),
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingVertical: moderateScale(20)
          }}
          onPress={handlePurchase}
          disabled={!selectedPackage || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#1A1A1A" style={{marginRight: 8}} />
              <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {processingStatus || 'Processing...'}
              </Text>
            </View>
          ) : (
            <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              {selectedPackage ? `Buy now for ${displayPrices[selectedPackage.id] || '...'}` : 'Select a package'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Payment method indicator - same as Plan Detail */}
        <Text className="text-center font-bold" style={{color: '#999999', fontSize: getFontSize(12), marginTop: moderateScale(8)}}>
          {Platform.OS === 'ios' ? 'Pay with Apple Pay or card' : 'Pay with Google Pay or card'}
        </Text>
        <Text className="text-center font-semibold" style={{color: '#B0B0B0', fontSize: getFontSize(11), marginTop: moderateScale(4)}}>
          Payments are securely processed by Stripe. We never store your card details.
        </Text>
      </View>
    </View>
  );
}
