import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { fetchPlanById, createCheckout } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../hooks/useCurrency';

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const { convertMultiplePrices, symbol, loading: currencyLoading, currency } = useCurrency();

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => fetchPlanById(id!),
    enabled: !!id,
  });

  // Convert price when plan or currency info changes
  useEffect(() => {
    if (plan && !currencyLoading) {
      convertPlanPrice();
    }
  }, [plan, currencyLoading]);

  async function convertPlanPrice() {
    if (!plan) return;

    const prices = [plan.retail_price || plan.price];
    const converted = await convertMultiplePrices(prices);
    setDisplayPrice(converted[0].formatted);
  }

  const extractRegion = (name: string) => {
    const match = name.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : name.split(' ')[0];
  };

  async function handleCheckout() {
    if (!plan) return;

    setLoading(true);

    try {
      // Get current user - should always exist due to auth guard
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Session expired. Please log in again.');
        router.replace('/(auth)/login');
        return;
      }

      // Create checkout session - optimized single API call
      const { clientSecret, orderId } = await createCheckout({
        planId: plan.id,
        email: user.email!,
        currency, // Pass user's detected currency
      });

      // Initialize and present payment sheet in parallel
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Lumbus',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          email: user.email!,
        },
        returnURL: 'lumbus://payment-complete',
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        setLoading(false);
        return;
      }

      // Present payment sheet immediately
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        setLoading(false);
        // User cancelled - no error alert needed
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Error', paymentError.message);
        }
        return;
      }

      // Payment successful - navigate immediately to installation
      // No alert needed - user sees progress on next screen
      router.replace(`/install/${orderId}`);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to process payment');
    }
  }

  if (isLoading || currencyLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-gray-900 text-lg font-semibold mt-4">
          Plan not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <View className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 pt-16 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-4xl font-bold mb-2">
            {extractRegion(plan.name)}
          </Text>
          <Text className="text-blue-100 text-lg">
            {plan.region_code}
          </Text>
        </View>

        <View className="px-6 py-6">
          <View className="bg-gray-50 rounded-xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-600 text-base">Price</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {displayPrice || `${symbol}${plan.price}`}
              </Text>
            </View>

            <View className="border-t border-gray-200 pt-4 space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Data</Text>
                <Text className="text-gray-900 font-semibold">
                  {plan.data_gb} GB
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Validity</Text>
                <Text className="text-gray-900 font-semibold">
                  {plan.validity_days} days
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Region Code</Text>
                <Text className="text-gray-900 font-semibold">
                  {plan.region_code}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-3">
              What's included
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-gray-700 ml-3 flex-1">
                  {plan.data_gb} GB of high-speed data
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-gray-700 ml-3 flex-1">
                  Valid for {plan.validity_days} days from activation
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-gray-700 ml-3 flex-1">
                  Instant eSIM delivery via email
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-gray-700 ml-3 flex-1">
                  One-tap eSIM installation
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-gray-700 ml-3 flex-1">
                  24/7 customer support
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className={`rounded-lg py-4 ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text className="text-white text-center text-base font-semibold">
            {loading ? 'Processing...' : `Buy now for ${displayPrice || `${symbol}${plan.price}`}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
