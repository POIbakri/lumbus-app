import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans } from '../../lib/api';
import { Plan } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';

export default function Browse() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const { convertMultiplePrices, symbol, loading: currencyLoading } = useCurrency();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 300000, // Cache plans for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Convert prices when plans or currency info changes
  useEffect(() => {
    if (plans && !currencyLoading) {
      convertPricesForPlans();
    }
  }, [plans, currencyLoading]);

  async function convertPricesForPlans() {
    if (!plans) return;

    const prices = plans.map(p => p.retail_price || p.price);
    const converted = await convertMultiplePrices(prices);

    const updatedPlans = plans.map((plan, index) => ({
      ...plan,
      displayPrice: converted[index].formatted,
      convertedPrice: converted[index].converted,
    }));

    setPlansWithPrices(updatedPlans);
  }

  const filteredPlans = (plansWithPrices.length > 0 ? plansWithPrices : plans || []).filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.region_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function renderPlanCard(plan: Plan) {
    const extractRegion = (name: string) => {
      const match = name.match(/^([^0-9]+?)\s+\d+/);
      return match ? match[1].trim() : name.split(' ')[0];
    };

    return (
      <TouchableOpacity
        key={plan.id}
        className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
        onPress={() => router.push(`/plan/${plan.id}`)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {extractRegion(plan.name)}
            </Text>
            <Text className="text-sm text-gray-600">
              {plan.region_code}
            </Text>
          </View>
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-blue-600 font-bold text-lg">
              {plan.displayPrice || `${symbol}${plan.price}`}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <Ionicons name="cellular" size={16} color="#6B7280" />
            <Text className="text-gray-700 ml-2 font-medium">
              {plan.data_gb} GB
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text className="text-gray-700 ml-2 font-medium">
              {plan.validity_days} days
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading || currencyLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-gray-900 text-lg font-semibold mt-4">
          Failed to load plans
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-4">
          Browse Plans
        </Text>

        <View className="bg-gray-100 rounded-lg px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by country or region..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredPlans}
        renderItem={({ item }) => renderPlanCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-gray-600 text-lg mt-4">
              No plans found
            </Text>
          </View>
        }
      />
    </View>
  );
}
