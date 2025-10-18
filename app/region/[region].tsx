import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans } from '../../lib/api';
import { Plan } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function RegionPlans() {
  const router = useRouter();
  const { region } = useLocalSearchParams<{ region: string }>();
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const { convertMultiplePrices, symbol, loading: currencyLoading } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  const { data: allPlans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 300000,
  });

  // Helper functions
  function cleanName(name: string) {
    return name.replace(/['"]+/g, '').trim();
  }

  function extractRegion(name: string) {
    const cleaned = cleanName(name);
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }

  // Filter plans by region
  const regionPlans = React.useMemo(() => {
    if (!allPlans) return [];

    return allPlans.filter(plan => {
      const planRegion = extractRegion(plan.name);
      return planRegion.toLowerCase() === region?.toLowerCase() ||
             plan.region_code.toLowerCase().includes(region?.toLowerCase() || '') ||
             plan.name.toLowerCase().includes(region?.toLowerCase() || '');
    });
  }, [allPlans, region]);

  // Convert prices
  useEffect(() => {
    if (regionPlans && regionPlans.length > 0 && !currencyLoading) {
      convertPricesForPlans();
    }
  }, [regionPlans, currencyLoading]);

  async function convertPricesForPlans() {
    if (!regionPlans || regionPlans.length === 0) return;

    const prices = regionPlans.map(p => p.retail_price || p.price);
    const converted = await convertMultiplePrices(prices);

    const updatedPlans = regionPlans.map((plan, index) => ({
      ...plan,
      displayPrice: converted[index].formatted,
      convertedPrice: converted[index].converted,
    }));

    setPlansWithPrices(updatedPlans);
  }

  const plansToDisplay = plansWithPrices.length > 0 ? plansWithPrices : regionPlans;

  // Get all unique countries from plans in this region
  const allCountries = React.useMemo(() => {
    if (!plansToDisplay || plansToDisplay.length === 0) {
      return [];
    }

    const countriesSet = new Set<string>();
    plansToDisplay.forEach(plan => {
      if (plan.coverage && Array.isArray(plan.coverage)) {
        plan.coverage.forEach(country => countriesSet.add(country));
      }
    });

    return Array.from(countriesSet).sort();
  }, [plansToDisplay]);

  function renderPlanCard(plan: Plan) {
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
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-xl font-black uppercase mt-4" style={{color: '#1A1A1A'}}>
          Error Loading Plans
        </Text>
        <Text className="font-bold mt-2" style={{color: '#666666'}}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header */}
      <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(60), paddingBottom: moderateScale(24)}}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{marginBottom: moderateScale(16)}}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
            <Text className="font-black ml-2" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              BACK
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 36 : 42), marginBottom: moderateScale(12)}}>
          {region?.toUpperCase()}
        </Text>
        <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(16), marginBottom: moderateScale(12)}}>
          {plansToDisplay.length} {plansToDisplay.length === 1 ? 'plan' : 'plans'} available
        </Text>

        {/* Countries covered */}
        {allCountries.length > 0 && (
          <View style={{marginTop: moderateScale(8)}}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="flag" size={scale(16)} color="#1A1A1A" />
              <Text className="font-black uppercase ml-2" style={{color: '#1A1A1A', fontSize: getFontSize(12)}}>
                COUNTRIES COVERED
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {allCountries.slice(0, 8).map((country, idx) => (
                <View
                  key={idx}
                  className="px-3 py-1 rounded-full"
                  style={{backgroundColor: 'rgba(0,0,0,0.1)'}}
                >
                  <Text className="font-bold text-xs" style={{color: '#1A1A1A'}}>
                    {country}
                  </Text>
                </View>
              ))}
              {allCountries.length > 8 && (
                <View
                  className="px-3 py-1 rounded-full"
                  style={{backgroundColor: 'rgba(0,0,0,0.15)'}}
                >
                  <Text className="font-black text-xs" style={{color: '#1A1A1A'}}>
                    +{allCountries.length - 8} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={plansToDisplay}
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
              No plans available for this region
            </Text>
          </View>
        }
      />
    </View>
  );
}
