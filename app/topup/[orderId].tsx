import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrderById, fetchPlans } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { Plan } from '../../types';
import { logger } from '../../lib/logger';
import { PaymentService } from '../../lib/payments/PaymentService';

export default function TopUpScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const { convertMultiplePrices, symbol, formatPrice, loading: currencyLoading, currency } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  // Initialize payment service on mount
  useEffect(() => {
    PaymentService.initialize().catch(error => {
      logger.error('Failed to initialize payment service:', error);
    });

    return () => {
      PaymentService.cleanup();
    };
  }, []);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  const { data: allPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 300000,
    gcTime: 600000,
  });

  // Helper function to extract region from plan name
  const extractRegion = React.useCallback((name: string) => {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }, []);

  // Filter plans by region (same logic as region/[region].tsx)
  const regionPlans = React.useMemo(() => {
    if (!allPlans || !order?.plan?.name) return [];

    const currentRegion = extractRegion(order.plan.name);

    return allPlans.filter(plan => {
      const planRegion = extractRegion(plan.name);
      const matches = planRegion.toLowerCase() === currentRegion.toLowerCase() ||
                     plan.region_code.toLowerCase().includes(currentRegion.toLowerCase()) ||
                     plan.name.toLowerCase().includes(currentRegion.toLowerCase());

      return matches;
    });
  }, [allPlans, order, extractRegion]);

  // Convert prices (same logic as region/[region].tsx)
  const convertPricesForPlans = React.useCallback(async () => {
    if (!regionPlans || regionPlans.length === 0) return;

    const prices = regionPlans.map(p => p.retail_price || p.price);
    const converted = await convertMultiplePrices(prices);

    const updatedPlans = regionPlans.map((plan, index) => ({
      ...plan,
      displayPrice: converted[index].formatted,
      convertedPrice: converted[index].converted,
    }));

    setPlansWithPrices(updatedPlans);
  }, [regionPlans, convertMultiplePrices]);

  useEffect(() => {
    if (regionPlans && regionPlans.length > 0 && !currencyLoading) {
      convertPricesForPlans();
    }
  }, [regionPlans, currencyLoading, convertPricesForPlans]);

  const plansToDisplay = plansWithPrices.length > 0 ? plansWithPrices : regionPlans;

  async function handlePurchase() {
    if (!selectedPlan || !order?.iccid) {
      Alert.alert('Error', 'Cannot process top-up. Please try again.');
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
      // iOS: Apple In-App Purchase (seamless)
      // Android: Stripe (keeps 97%+ revenue)
      const result = await PaymentService.purchase({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.retail_price || selectedPlan.price,
        currency,
        email: user.email!,
        userId: user.id,
        isTopUp: true,
        existingOrderId: orderId!,
        iccid: order.iccid,
      });

      setLoading(false);

      if (result.success) {
        // Top-up successful
        logger.log('✅ Top-up successful');
        Alert.alert(
          'Top-Up Successful!',
          'Data has been added to your eSIM.',
          [
            {
              text: 'View eSIM',
              onPress: () => router.replace(`/esim-details/${orderId}`),
            },
          ]
        );
      } else if (result.error) {
        // Only show alert if it's not a cancellation
        if (result.error !== 'Purchase cancelled' && result.error !== 'Payment cancelled') {
          Alert.alert(
            'Top-Up Failed',
            result.error,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      logger.error('Top-up error:', error);
      setLoading(false);
      Alert.alert(
        'Top-Up Error',
        error.message || 'Failed to process top-up. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  if (orderLoading || plansLoading || currencyLoading) {
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

  if (!plansToDisplay || plansToDisplay.length === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="information-circle" size={64} color="#2EFECC" />
        <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16), marginBottom: moderateScale(8)}}>
          No plans available
        </Text>
        <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(14)}}>
          No top-up plans are currently available for this region.
        </Text>
      </View>
    );
  }

  const planName = order.plan?.name || 'Unknown Plan';
  const region = extractRegion(planName);

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      <ScrollView>
        {/* Header with brand turquoise */}
        <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(16)}}>
            <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
          </TouchableOpacity>

          <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 32 : 40), lineHeight: getFontSize(isSmallDevice ? 36 : 44), marginBottom: moderateScale(8)}}>
            Top Up {region}
          </Text>
          <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(16)}}>
            Add more data to your eSIM
          </Text>
        </View>

        <View style={{paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(24)}}>
          {/* Current eSIM Info Card */}
          <View className="rounded-2xl" style={{backgroundColor: '#F5F5F5', padding: moderateScale(20), marginBottom: moderateScale(24)}}>
            <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12), marginBottom: moderateScale(12)}}>
              Current eSIM
            </Text>
            <View className="flex-row justify-between items-center" style={{marginBottom: moderateScale(8)}}>
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>Region</Text>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {region}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>Current Plan</Text>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {order.plan?.data_gb} GB • {order.plan?.validity_days} days
              </Text>
            </View>
          </View>

          {/* Top-up Plans */}
          <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(20), marginBottom: moderateScale(16)}}>
            Select top-up plan
          </Text>

          {plansToDisplay.map((plan, index) => {
            const isSelected = selectedPlan?.id === plan.id;
            const priceDisplay = plan.displayPrice || formatPrice(plan.retail_price || plan.price);

            return (
              <TouchableOpacity
                key={plan.id}
                className="rounded-2xl p-5 mb-4"
                style={{
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? '#2EFECC' : '#E5E5E5',
                }}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-black mb-2 uppercase tracking-tight" style={{color: '#1A1A1A'}}>
                      {plan.data_gb} GB
                    </Text>
                    <Text className="text-base font-bold" style={{color: '#666666'}}>
                      Valid for {plan.validity_days} days
                    </Text>
                  </View>
                  <View className="px-4 py-3 rounded-xl" style={{backgroundColor: '#2EFECC'}}>
                    <Text className="font-black text-xl" style={{color: '#1A1A1A'}}>
                      {priceDisplay}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={scale(18)} color="#2EFECC" />
                  <Text className="ml-2 font-bold text-sm" style={{color: '#666666'}}>
                    Instant data top-up for your eSIM
                  </Text>
                </View>
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

      {/* Fixed Bottom CTA */}
      <View style={{backgroundColor: '#FFFFFF', borderTopWidth: 2, borderColor: '#E5E5E5', paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(20)}}>
        <TouchableOpacity
          className="rounded-2xl"
          style={{backgroundColor: loading ? '#87EFFF' : (selectedPlan ? '#2EFECC' : '#E5E5E5'), shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, paddingVertical: moderateScale(20)}}
          onPress={handlePurchase}
          disabled={!selectedPlan || loading}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {Platform.OS === 'ios' && selectedPlan && (
              <Ionicons name="logo-apple" size={getFontSize(20)} color="#1A1A1A" style={{marginRight: scale(8)}} />
            )}
            <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              {loading ? 'Processing...' : (selectedPlan ? `Buy now for ${selectedPlan.displayPrice || formatPrice(selectedPlan.retail_price || selectedPlan.price)} →` : 'Select a plan')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Payment method indicator */}
        {selectedPlan && (
          <Text className="text-center font-bold" style={{color: '#999999', fontSize: getFontSize(12), marginTop: moderateScale(12)}}>
            {Platform.OS === 'ios' ? 'Pay with Apple Pay or Card' : 'Pay with Google Pay or Card'}
          </Text>
        )}
      </View>
    </View>
  );
}
