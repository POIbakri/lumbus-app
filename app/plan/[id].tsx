import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { fetchPlanById, createCheckout, fetchRegionInfo, RegionInfo } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [showCountries, setShowCountries] = useState(false);
  const { convertMultiplePrices, symbol, loading: currencyLoading, currency } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

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

    const prices = [plan.retail_price || plan.price];
    const converted = await convertMultiplePrices(prices);
    setDisplayPrice(converted[0].formatted);
  }, [plan, convertMultiplePrices]);

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

      // Create checkout session - optimized single API call
      const { clientSecret, orderId } = await createCheckout({
        planId: plan.id,
        email: user.email!,
        currency, // Pass user's detected currency
      });

      if (!clientSecret || !orderId) {
        throw new Error('Invalid checkout response from server');
      }

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Lumbus',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          email: user.email!,
        },
        returnURL: 'lumbus://payment-complete',
        appearance: {
          colors: {
            primary: '#2EFECC',
          },
        },
      });

      if (initError) {
        console.error('❌ Payment sheet initialization error:', initError);
        Alert.alert('Payment Setup Error', initError.message);
        setLoading(false);
        return;
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        setLoading(false);
        // User cancelled - no error alert needed
        if (paymentError.code === 'Canceled') {
          // User cancelled - do nothing
        } else {
          console.error('Payment error:', paymentError);
          Alert.alert('Payment Error', paymentError.message);
        }
        return;
      }

      // Payment successful
      router.replace(`/install/${orderId}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(false);
      Alert.alert(
        'Checkout Error',
        error.message || 'Failed to process payment. Please try again.',
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
        {/* Header with brand turquoise */}
        <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{marginBottom: moderateScale(16)}}
          >
            <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
          </TouchableOpacity>

          <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 36 : 48), lineHeight: getFontSize(isSmallDevice ? 40 : 52), marginBottom: moderateScale(8)}}>
            {extractRegion(plan.name)}
          </Text>
          <Text className="font-bold uppercase" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(16)}}>
            🌍 {plan.region_code}
          </Text>
        </View>

        <View style={{paddingHorizontal: getHorizontalPadding(), paddingVertical: moderateScale(24)}}>
          {/* Price Card */}
          <View className="rounded-2xl" style={{backgroundColor: '#F5F5F5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <View className="flex-row justify-between items-center" style={{marginBottom: moderateScale(20)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12)}}>Price</Text>
              <View className="rounded-xl" style={{backgroundColor: '#2EFECC', paddingHorizontal: scale(16), paddingVertical: moderateScale(8)}}>
                <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(28)}}>
                  {displayPrice || `${symbol}${plan.price}`}
                </Text>
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
          <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
            {loading ? 'Processing...' : `Buy now for ${displayPrice || `${symbol}${plan.price}`} →`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
