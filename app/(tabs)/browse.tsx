import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans } from '../../lib/api';
import { Plan } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { useLocation } from '../../hooks/useLocation';
import { sortPlansByLocation } from '../../lib/plan-sorting';

export default function Browse() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const { convertMultiplePrices, symbol, loading: currencyLoading } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();
  const { location, loading: locationLoading } = useLocation();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      try {
        const result = await fetchPlans();
        console.log('📦 Plans fetched:', result);
        console.log('📦 Is array?', Array.isArray(result));
        return result;
      } catch (err) {
        console.error('❌ Error fetching plans:', err);
        throw err;
      }
    },
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

  // Ensure we always have an array to filter
  const plansToDisplay = plansWithPrices.length > 0 ? plansWithPrices : (Array.isArray(plans) ? plans : []);

  // Filter by search query
  const searchFilteredPlans = plansToDisplay.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.region_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by location relevance (only if not searching)
  const filteredPlans = searchQuery.trim() === ''
    ? sortPlansByLocation(searchFilteredPlans, location)
    : searchFilteredPlans;

  function renderPlanCard(plan: Plan) {
    // Remove quotes from plan name
    const cleanName = (name: string) => {
      return name.replace(/['"]+/g, '').trim();
    };

    const extractRegion = (name: string) => {
      const cleaned = cleanName(name);
      const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
      return match ? match[1].trim() : cleaned.split(' ')[0];
    };

    return (
      <TouchableOpacity
        key={plan.id}
        className="bg-white rounded-2xl p-5 mb-4"
        style={{shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 2, borderColor: '#E5E5E5'}}
        onPress={() => router.push(`/plan/${plan.id}`)}
        activeOpacity={0.8}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-black mb-2 uppercase tracking-tight" style={{color: '#1A1A1A'}}>
              {extractRegion(plan.name)}
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold uppercase tracking-wide" style={{color: '#666666'}}>
                🌍 {plan.region_code}
              </Text>
            </View>
          </View>
          <View className="px-4 py-3 rounded-xl" style={{backgroundColor: '#2EFECC'}}>
            <Text className="font-black text-xl" style={{color: '#1A1A1A'}}>
              {plan.displayPrice || `${symbol}${plan.price}`}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-6">
          <View className="flex-row items-center px-4 py-2 rounded-full" style={{backgroundColor: '#E0FEF7'}}>
            <Ionicons name="cellular" size={18} color="#2EFECC" />
            <Text className="ml-2 font-black text-sm uppercase" style={{color: '#1A1A1A'}}>
              {plan.data_gb} GB
            </Text>
          </View>
          <View className="flex-row items-center px-4 py-2 rounded-full" style={{backgroundColor: '#F7E2FB'}}>
            <Ionicons name="time" size={18} color="#2EFECC" />
            <Text className="ml-2 font-black text-sm uppercase" style={{color: '#1A1A1A'}}>
              {plan.validity_days} days
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading || currencyLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#2EFECC" />
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
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header with brand color background */}
      <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(48), paddingBottom: moderateScale(24)}}>
        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 32 : 40), lineHeight: getFontSize(isSmallDevice ? 36 : 44), marginBottom: moderateScale(8)}}>
          BROWSE{'\n'}PLANS
        </Text>
        <View className="flex-row items-center" style={{marginBottom: moderateScale(8)}}>
          <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(14)}}>
            Find the perfect eSIM for your destination
          </Text>
        </View>
        {location && !locationLoading && (
          <View className="flex-row items-center" style={{marginBottom: moderateScale(16)}}>
            <Ionicons name="location" size={scale(14)} color="#1A1A1A" />
            <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.7, fontSize: getFontSize(12), marginLeft: scale(4)}}>
              Showing plans for {location.country_name}
            </Text>
          </View>
        )}

        <View className="bg-white rounded-2xl flex-row items-center" style={{borderWidth: 2, borderColor: '#E5E5E5', paddingHorizontal: scale(20), paddingVertical: moderateScale(16)}}>
          <Ionicons name="search" size={scale(22)} color="#2EFECC" />
          <TextInput
            className="flex-1 font-bold"
            style={{color: '#1A1A1A', marginLeft: scale(12), fontSize: getFontSize(15)}}
            placeholder="Search by country or region..."
            placeholderTextColor="#666666"
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
          padding: getHorizontalPadding(),
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="rounded-full p-6 mb-4" style={{backgroundColor: '#F5F5F5'}}>
              <Ionicons name="search" size={64} color="#666666" />
            </View>
            <Text className="text-xl font-black uppercase" style={{color: '#1A1A1A'}}>
              No plans found
            </Text>
            <Text className="font-bold mt-2" style={{color: '#666666'}}>
              Try a different search term
            </Text>
          </View>
        }
      />
    </View>
  );
}
