import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlanById, fetchRegionInfo, RegionInfo } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { logger } from '../../lib/logger';
import { PaymentService } from '../../lib/payments/PaymentService';
import { useReferral } from '../../contexts/ReferralContext';
import { ReferralBanner } from '../components/ReferralBanner';
import { pollOrderStatus, formatPollingStatus, getPollingErrorMessage } from '../../lib/orderPolling';

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [showCountries, setShowCountries] = useState(false);
  const { convertMultiplePrices, symbol, formatPrice, loading: currencyLoading, currency } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();
  const { hasActiveReferral, referralCode } = useReferral();

  // Initialize payment service on mount
  useEffect(() => {
    PaymentService.initialize().catch(error => {
      logger.error('Failed to initialize payment service:', error);
    });

    return () => {
      PaymentService.cleanup();
    };
  }, []);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => fetchPlanById(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: 2,
  });

  // Fetch region info using React Query for better caching
  const { data: regionInfo } = useQuery({
    queryKey: ['region', plan?.region_code],
    queryFn: () => fetchRegionInfo(plan!.region_code),
    enabled: !!plan?.region_code,
    staleTime: 1800000, // 30 minutes
    gcTime: 3600000, // 1 hour
    retry: 2,
  });

  // Convert price when plan or currency info changes - memoized
  const convertPlanPrice = React.useCallback(async () => {
    if (!plan) return;

    const prices = [plan.retail_price];
    const converted = await convertMultiplePrices(prices);
    setDisplayPrice(converted[0].formatted);

    // Calculate discounted price if referral is active (10% off)
    if (hasActiveReferral) {
      const originalValue = converted[0].converted;
      const discountedValue = originalValue * 0.9; // 10% off
      const formatted = formatPrice(discountedValue);
      setDiscountedPrice(formatted);
    }
  }, [plan, convertMultiplePrices, hasActiveReferral, formatPrice]);

  useEffect(() => {
    if (plan && !currencyLoading) {
      convertPlanPrice();
    }
  }, [plan, currencyLoading, convertPlanPrice]);

  // Remove quotes from plan name
  const cleanName = (name: string) => {
    return name.replace(/['"]+/g, '').trim();
  };

  const extractRegion = (name: string) => {
    const cleaned = cleanName(name);
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  };

  async function handleCheckout() {
    if (!plan) {
      Alert.alert('Error', 'Plan information is not available. Please try again.');
      return;
    }

    if (loading) return; // Prevent double-tap

    setLoading(true);

    try {
      // Get current user - should always exist due to auth guard
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Session Expired', 'Please log in again to continue.');
        setLoading(false);
        router.replace('/(auth)/login');
        return;
      }

      // Purchase using platform-specific payment method
      // iOS: Apple In-App Purchase (seamless, no disclosure needed)
      // Android: Stripe (keeps 97%+ revenue)
      const result = await PaymentService.purchase({
        planId: plan.id,
        planName: plan.name,
        price: plan.retail_price,
        currency,
        email: user.email!,
        userId: user.id,
        referralCode: referralCode || undefined, // Pass referral code if available
      });

      if (result.success && result.orderId) {
        // Payment successful - poll for order completion
        logger.log('✅ Payment successful, polling order status...');

        // Show loading alert while polling
        Alert.alert(
          'Processing Your eSIM',
          'Your payment was successful! Preparing your eSIM...',
          [],
          { cancelable: false }
        );

        // Poll for order completion with exponential backoff
        const pollingResult = await pollOrderStatus(result.orderId, {
          maxAttempts: 10,
          initialDelay: 2000,
          maxDelay: 30000,
          onStatusUpdate: (order) => {
            logger.log(`📊 Order status: ${order.status}`);
          }
        });

        setLoading(false);

        if (pollingResult.success && pollingResult.order) {
          // Order ready - navigate to install screen
          logger.log('✅ Order completed, navigating to install screen');
          router.replace(`/install/${result.orderId}`);
        } else if (pollingResult.timedOut) {
          // Order taking too long - still navigate but show warning
          logger.warn('⏰ Order polling timed out, navigating anyway');
          Alert.alert(
            'eSIM Processing',
            'Your eSIM is taking longer than expected to process. You can check the status in a moment.',
            [
              {
                text: 'View Order',
                onPress: () => router.replace(`/install/${result.orderId}`)
              },
              {
                text: 'Check Later',
                onPress: () => router.replace('/(tabs)/dashboard')
              }
            ]
          );
        } else {
          // Order failed
          const errorMessage = getPollingErrorMessage(pollingResult);
          Alert.alert(
            'Order Processing Failed',
            errorMessage,
            [
              {
                text: 'Contact Support',
                onPress: () => router.replace('/(tabs)/account')
              },
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/dashboard')
              }
            ]
          );
        }
      } else {
        setLoading(false);

        if (result.error) {
          // Only show alert if it's not a cancellation
          if (result.error !== 'Purchase cancelled' && result.error !== 'Payment cancelled') {
            Alert.alert(
              'Purchase Failed',
              result.error,
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error: any) {
      logger.error('Checkout error:', error);
      setLoading(false);
      Alert.alert(
        'Purchase Error',
        error.message || 'Failed to process purchase. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  if (isLoading || currencyLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16)}}>
          Plan not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      <ScrollView>
        {/* Enhanced Header with gradient and modern design */}
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
                height: getFontSize(isSmallDevice ? 32 : 38),
                backgroundColor: '#1A1A1A',
                marginRight: moderateScale(12),
                borderRadius: 2,
              }} />
              <Text
                className="font-black uppercase tracking-tight"
                style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(isSmallDevice ? 32 : 38),
                  letterSpacing: -0.5,
                  flex: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {extractRegion(plan.name)}
              </Text>
            </View>

            {/* Region Code and Plan Info Row */}
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
                  {plan.region_code}
                </Text>
              </View>

              {/* Plan Type Indicator */}
              {plan.data_gb && (
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
                    {plan.data_gb}GB • {plan.validity_days} Days
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(24)}}>
          {/* Referral Banner */}
          <ReferralBanner />

          {/* Price Card */}
          <View className="rounded-2xl" style={{backgroundColor: '#F5F5F5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <View className="flex-row justify-between items-center" style={{marginBottom: moderateScale(20)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12)}}>Price</Text>
              <View className="items-end">
                {hasActiveReferral && (
                  <Text
                    className="font-bold line-through"
                    style={{
                      color: '#999999',
                      fontSize: getFontSize(16),
                      marginBottom: moderateScale(4),
                    }}
                  >
                    {displayPrice || formatPrice(plan.retail_price)}
                  </Text>
                )}
                <View className="rounded-xl" style={{backgroundColor: '#2EFECC', paddingHorizontal: scale(16), paddingVertical: moderateScale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(28)}}>
                    {hasActiveReferral && discountedPrice ? discountedPrice : (displayPrice || formatPrice(plan.retail_price))}
                  </Text>
                </View>
                {hasActiveReferral && (
                  <View className="rounded-lg" style={{backgroundColor: '#FEF3C7', paddingHorizontal: scale(8), paddingVertical: moderateScale(4), marginTop: moderateScale(4)}}>
                    <Text className="font-black uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>
                      10% OFF
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{borderTopWidth: 2, borderColor: '#E5E5E5', paddingTop: moderateScale(16)}}>
              <View className="flex-row justify-between" style={{marginBottom: moderateScale(12)}}>
                <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>Data</Text>
                <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                  {plan.data_gb} GB
                </Text>
              </View>
              <View className="flex-row justify-between" style={{marginBottom: moderateScale(12)}}>
                <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>Validity</Text>
                <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                  {plan.validity_days} days
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>Region Code</Text>
                <Text className="font-black uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                  {plan.region_code}
                </Text>
              </View>
            </View>
          </View>

          {/* Countries Included Dropdown */}
          {regionInfo?.isMultiCountry && regionInfo.subLocationList.length > 0 && (
            <View style={{marginBottom: moderateScale(24)}}>
              <TouchableOpacity
                onPress={() => setShowCountries(!showCountries)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#FDFD74',
                  borderRadius: 16,
                  paddingVertical: moderateScale(16),
                  paddingHorizontal: scale(20),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 2,
                  borderColor: '#E5E5E5',
                }}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="flag" size={scale(22)} color="#1A1A1A" />
                  <Text className="font-black uppercase ml-3" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                    {regionInfo.subLocationList.length} COUNTRIES INCLUDED
                  </Text>
                </View>
                <Ionicons
                  name={showCountries ? "chevron-up" : "chevron-down"}
                  size={scale(24)}
                  color="#1A1A1A"
                />
              </TouchableOpacity>

              {showCountries && (
                <View style={{
                  marginTop: moderateScale(12),
                  backgroundColor: '#F5F5F5',
                  borderRadius: 16,
                  padding: scale(16),
                  borderWidth: 2,
                  borderColor: '#E5E5E5',
                }}>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                    {regionInfo.subLocationList.map((country) => (
                      <View
                        key={country.code}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          paddingVertical: moderateScale(8),
                          paddingHorizontal: scale(12),
                          borderWidth: 1,
                          borderColor: '#E5E5E5',
                          minWidth: '47%',
                        }}
                      >
                        <Text className="font-bold text-xs" style={{color: '#1A1A1A'}}>
                          {country.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* What's Included Section */}
          <View style={{marginBottom: moderateScale(24)}}>
            <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(20), marginBottom: moderateScale(16)}}>
              What's included
            </Text>
            <View>
              <View className="flex-row items-start" style={{marginBottom: moderateScale(12)}}>
                <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                <Text className="font-bold flex-1" style={{color: '#666666', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  {plan.data_gb} GB of high-speed data
                </Text>
              </View>
              <View className="flex-row items-start" style={{marginBottom: moderateScale(12)}}>
                <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                <Text className="font-bold flex-1" style={{color: '#666666', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  Valid for {plan.validity_days} days from activation
                </Text>
              </View>
              <View className="flex-row items-start" style={{marginBottom: moderateScale(12)}}>
                <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                <Text className="font-bold flex-1" style={{color: '#666666', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  Instant eSIM delivery via email
                </Text>
              </View>
              <View className="flex-row items-start" style={{marginBottom: moderateScale(12)}}>
                <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                <Text className="font-bold flex-1" style={{color: '#666666', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  One-tap eSIM installation (iOS 17.4+)
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                <Text className="font-bold flex-1" style={{color: '#666666', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  24/7 customer support
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={{backgroundColor: '#FFFFFF', borderTopWidth: 2, borderColor: '#E5E5E5', paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(20)}}>
        <TouchableOpacity
          className="rounded-2xl"
          style={{backgroundColor: loading ? '#87EFFF' : '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, paddingVertical: moderateScale(20)}}
          onPress={handleCheckout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {Platform.OS === 'ios' && (
              <Ionicons name="logo-apple" size={getFontSize(20)} color="#1A1A1A" style={{marginRight: scale(8)}} />
            )}
            <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              {loading ? 'Processing...' : `Buy now for ${hasActiveReferral && discountedPrice ? discountedPrice : (displayPrice || formatPrice(plan.retail_price))} →`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Payment method indicator */}
        <Text className="text-center font-bold" style={{color: '#999999', fontSize: getFontSize(12), marginTop: moderateScale(12)}}>
          {Platform.OS === 'ios' ? 'Pay with Apple Pay or Card' : 'Pay with Google Pay or Card'}
        </Text>
      </View>
    </View>
  );
}
