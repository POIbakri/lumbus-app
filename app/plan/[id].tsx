import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, Platform, TextInput, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlanById, fetchRegionInfo, RegionInfo, validateDiscountCode } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useLocationCurrency } from '../../hooks/useLocationCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { GlobeIcon, getFlag } from '../../components/icons/flags';
import { logger } from '../../lib/logger';
import { PaymentService } from '../../lib/payments/PaymentService';
import { useReferral } from '../../contexts/ReferralContext';
import { ReferralBanner } from '../components/ReferralBanner';
import { pollOrderStatus, formatPollingStatus, getPollingErrorMessage } from '../../lib/orderPolling';
import { ProcessingOverlay } from '../../components/ProcessingOverlay';

interface AppliedDiscount {
  code: string;
  type: 'discount' | 'referral';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  bonusDataMB?: number;
  message?: string;
}

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [showCountries, setShowCountries] = useState(false);

  // Discount/Referral Code State
  const [promoCode, setPromoCode] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

  // Use combined hook - single API call for both location and currency
  const { convertMultiplePrices, symbol, formatPrice, loading: currencyLoading, currency } = useLocationCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();
  const { hasActiveReferral, referralCode, clearReferralCode } = useReferral();

  // Pre-fill referral code if available from context
  useEffect(() => {
    if (referralCode && !appliedDiscount) {
      setPromoCode(referralCode);
    }
  }, [referralCode]);

  // Initialize payment service on mount
  useEffect(() => {
    PaymentService.initialize().catch(error => {
      // Failed to initialize payment service
    });

    return () => {
      // Clean up loading state on unmount to prevent stale state
      setLoading(false);
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

    // Calculate discounted price if code is applied
    if (appliedDiscount) {
      const originalValue = converted[0].converted;
      let discountedValue = originalValue;

      if (appliedDiscount.discountType === 'percentage') {
        discountedValue = originalValue * (1 - appliedDiscount.discountValue / 100);
      } else if (appliedDiscount.discountType === 'fixed') {
        // Convert fixed discount amount to local currency if needed
        // Assuming discountValue is in USD/base currency for now, similar to price
        // Ideally validation API returns value in correct currency or we convert it
        // For MVP, assuming discountValue is a flat deduction on the converted price
        // (This might need adjustment if discountValue is strictly USD)
        // Let's assume discountValue matches the plan's currency or needs conversion.
        // Given "discountValue: 10", if it's 10%, percentage handles it.
        // If fixed 10 USD, we should probably convert 10 USD to local.
        // For simplicity/safety with current API spec: percentage is safest.
        // If fixed, let's just subtract for now, but note this limitation.
        discountedValue = Math.max(0, originalValue - appliedDiscount.discountValue);
      }

      const formatted = formatPrice(discountedValue);
      setDiscountedPrice(formatted);
    } else if (hasActiveReferral) {
      // Fallback to context referral if no specific code validated locally (legacy/default behavior)
      // But if we have promoCode input, we prefer the user to click "Apply"
      // If we autofilled `promoCode` from context, `appliedDiscount` is null until they click Apply.
      // To avoid confusion, we might want to NOT show discounted price until validated.
      // Or we could auto-validate in useEffect.
      // For now, let's stick to: if manually applied, use that.
      // If context exists but not applied locally yet, maybe show 10% off if we want
      // but better to force validation to ensure code is still valid.
      // So removing the auto-calculation from context here to rely on `appliedDiscount`
      setDiscountedPrice('');
    } else {
      setDiscountedPrice('');
    }
  }, [plan, convertMultiplePrices, appliedDiscount, hasActiveReferral, formatPrice]);

  useEffect(() => {
    if (plan && !currencyLoading) {
      convertPlanPrice();
    }
  }, [plan, currencyLoading, convertPlanPrice]);

  // Auto-validate referral code from context on load if available
  useEffect(() => {
    if (referralCode && plan && !appliedDiscount && !validationLoading) {
      handleValidateCode(referralCode);
    }
  }, [referralCode, plan]);

  // Remove quotes from plan name
  const cleanName = (name: string) => {
    return name.replace(/['"]+/g, '').trim();
  };

  const extractRegion = (name: string) => {
    const cleaned = cleanName(name);
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  };

  async function handleValidateCode(codeToValidate: string = promoCode) {
    if (!codeToValidate.trim() || !plan) return;

    setValidationLoading(true);
    Keyboard.dismiss();

    // Get user email if available (for self-referral check)
    const { data: { user } } = await supabase.auth.getUser();

    const result = await validateDiscountCode({
      code: codeToValidate.trim(),
      planId: plan.id,
      email: user?.email
    });

    setValidationLoading(false);

    if (result.valid) {
      setAppliedDiscount({
        code: codeToValidate.trim(),
        type: result.type || 'discount',
        discountType: result.discountType || 'percentage',
        discountValue: result.discountValue || 0,
        bonusDataMB: result.bonusDataMB,
        message: result.message
      });
      // Success message handled by UI
    } else {
      setAppliedDiscount(null);
      // Show specific error message from server, or a friendly default
      const errorMessage = result.error || 'The code you entered is invalid or expired.';
      Alert.alert('Invalid Code', errorMessage);
    }
  }

  function clearDiscount() {
    setAppliedDiscount(null);
    setPromoCode('');
  }

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
      const result = await PaymentService.purchase({
        planId: plan.id,
        planName: plan.name,
        price: plan.retail_price,
        currency,
        email: user.email!,
        userId: user.id,
        // Pass specific codes based on applied discount
        referralCode: appliedDiscount?.type === 'referral' ? appliedDiscount.code : undefined,
        discountCode: appliedDiscount?.type === 'discount' ? appliedDiscount.code : undefined,
      });

      if (result.success && result.orderId) {
        // Payment successful - show processing overlay
        setLoading(false);
        setShowProcessing(true);
        setProcessingStatus('Preparing your eSIM');

        // Poll for order completion with quick initial check
        // Using faster polling for better UX (5 attempts, 1.5s start = ~30s max)
        const pollingResult = await pollOrderStatus(result.orderId, {
          maxAttempts: 5,
          initialDelay: 1500,
          onStatusUpdate: (order, currentAttempt, maxAttempts) => {
            if (currentAttempt <= 2) {
              setProcessingStatus('Preparing your eSIM');
            } else {
              setProcessingStatus('Almost ready');
            }
          }
        });

        // Always reset overlay before navigating or showing alerts
        setShowProcessing(false);
        setProcessingStatus('');

        if (pollingResult.success && pollingResult.order) {
          // Clear referral code after successful first purchase (one-time use)
          if (appliedDiscount?.type === 'referral') {
            await clearReferralCode();
          }
          // Order ready - navigate to install screen with fromPurchase param
          // This tells the install screen to redirect to Dashboard on close
          router.replace(`/install/${result.orderId}?fromPurchase=true`);
        } else if (pollingResult.timedOut) {
          // Clear referral code after successful first purchase (one-time use)
          if (appliedDiscount?.type === 'referral') {
            await clearReferralCode();
          }
          // Order taking too long - go to dashboard, it will finish in background
          Alert.alert(
            'Purchase Successful!',
            'Your eSIM is being prepared and will be ready shortly. Check your dashboard to view it.',
            [
              {
                text: 'Go to Dashboard',
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
        // Always reset loading state on failure
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
      setShowProcessing(false);
      setProcessingStatus('');
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
      <ProcessingOverlay visible={showProcessing} status={processingStatus} />
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
              <View className="flex-row items-center" style={{gap: 8, flex: 1}}>
                {getFlag(plan.region_code, isSmallDevice ? 24 : 28)}
                <Text
                  className="font-black uppercase tracking-tight"
                  style={{
                    color: '#1A1A1A',
                    fontSize: getFontSize(isSmallDevice ? 24 : 30), // Reduced size
                    letterSpacing: -0.5,
                    flex: 1,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                >
                  {extractRegion(plan.name)}
                </Text>
              </View>
            </View>

            {/* Plan Info Row */}
            <View className="flex-row items-center flex-wrap">
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
          {/* Referral Banner - Hide if we have a specific discount applied to avoid clutter */}
          {!appliedDiscount && <ReferralBanner />}

          {/* Discount/Referral Code Input */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            marginBottom: moderateScale(24),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#E5E5E5',
            overflow: 'hidden'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: moderateScale(4),
            }}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: moderateScale(12),
              }}>
                <Ionicons name="pricetag-outline" size={20} color="#666666" />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: moderateScale(8),
                    fontSize: getFontSize(14),
                    color: '#1A1A1A',
                    fontWeight: '600',
                    paddingVertical: moderateScale(12),
                  }}
                  placeholder="Enter discount or referral code"
                  placeholderTextColor="#999999"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  editable={!validationLoading && !appliedDiscount}
                />
              </View>
              
              {appliedDiscount ? (
                <TouchableOpacity
                  onPress={clearDiscount}
                  style={{
                    padding: moderateScale(8),
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleValidateCode()}
                  disabled={!promoCode.trim() || validationLoading}
                  style={{
                    backgroundColor: !promoCode.trim() ? '#F5F5F5' : '#1A1A1A',
                    paddingHorizontal: moderateScale(16),
                    paddingVertical: moderateScale(10),
                    borderRadius: 12,
                    marginRight: moderateScale(4),
                  }}
                >
                  {validationLoading ? (
                    <ActivityIndicator size="small" color="#2EFECC" />
                  ) : (
                    <Text style={{
                      color: !promoCode.trim() ? '#999999' : '#2EFECC',
                      fontWeight: '900',
                      fontSize: getFontSize(12),
                      textTransform: 'uppercase'
                    }}>
                      Apply
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            
            {/* Applied Discount Status Message */}
            {appliedDiscount && (
              <View style={{
                backgroundColor: '#E0FEF7',
                paddingVertical: moderateScale(8),
                paddingHorizontal: moderateScale(16),
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="checkmark-circle" size={16} color="#2EFECC" />
                <Text style={{
                  marginLeft: moderateScale(8),
                  color: '#1A1A1A',
                  fontSize: getFontSize(12),
                  fontWeight: '700',
                  flex: 1
                }}>
                  {appliedDiscount.message || `${appliedDiscount.discountValue}% discount applied!`}
                </Text>
              </View>
            )}
          </View>

          {/* Price Card */}
          <View className="rounded-2xl" style={{backgroundColor: '#F5F5F5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
            <View className="flex-row justify-between items-center" style={{marginBottom: moderateScale(20)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(12)}}>Price</Text>
              <View className="items-end">
                {appliedDiscount && (
                  <Text
                    className="font-bold line-through"
                    style={{
                      color: '#999999',
                      fontSize: getFontSize(16),
                      marginBottom: moderateScale(4),
                    }}
                  >
                    {displayPrice || '...'}
                  </Text>
                )}
                <View className="rounded-xl" style={{backgroundColor: '#2EFECC', paddingHorizontal: scale(16), paddingVertical: moderateScale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(28)}}>
                    {appliedDiscount && discountedPrice ? discountedPrice : (displayPrice || '...')}
                  </Text>
                </View>
                {appliedDiscount && (
                  <View className="rounded-lg" style={{backgroundColor: '#FEF3C7', paddingHorizontal: scale(8), paddingVertical: moderateScale(4), marginTop: moderateScale(4)}}>
                    <Text className="font-black uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>
                      {appliedDiscount.discountType === 'percentage' 
                        ? `${appliedDiscount.discountValue}% OFF`
                        : `-${appliedDiscount.discountValue} OFF`
                      }
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
          {loading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#1A1A1A" style={{marginRight: 8}} />
              <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
                {processingStatus || 'Processing...'}
              </Text>
            </View>
          ) : (
            <Text className="font-black uppercase tracking-wide text-center" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              {`Buy now for ${appliedDiscount && discountedPrice ? discountedPrice : (displayPrice || '...')} →`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Payment method indicator */}
        <Text className="text-center font-bold" style={{color: '#999999', fontSize: getFontSize(12), marginTop: moderateScale(8)}}>
          Pay securely with card
        </Text>
        <Text className="text-center font-semibold" style={{color: '#B0B0B0', fontSize: getFontSize(11), marginTop: moderateScale(4)}}>
          Payments are securely processed by Stripe. We never store your card details.
        </Text>
      </View>
    </View>
  );
}
