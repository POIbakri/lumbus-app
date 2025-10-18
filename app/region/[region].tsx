import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans, fetchRegionInfo, RegionInfo } from '../../lib/api';
import { Plan } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function RegionPlans() {
  const router = useRouter();
  const { region } = useLocalSearchParams<{ region: string }>();
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const [showCountries, setShowCountries] = useState(false);
  const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
  const { convertMultiplePrices, symbol, loading: currencyLoading } = useCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  const { data: allPlans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 300000,
  });

  // Helper functions - memoized to avoid recreation
  const cleanName = React.useCallback((name: string) => {
    return name.replace(/['"]+/g, '').trim();
  }, []);

  const extractRegion = React.useCallback((name: string) => {
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }, []);

  // Filter plans by region
  const regionPlans = React.useMemo(() => {
    if (!allPlans) return [];

    return allPlans.filter(plan => {
      const planRegion = extractRegion(plan.name);
      return planRegion.toLowerCase() === region?.toLowerCase() ||
             plan.region_code.toLowerCase().includes(region?.toLowerCase() || '') ||
             plan.name.toLowerCase().includes(region?.toLowerCase() || '');
    });
  }, [allPlans, region, extractRegion]);

  // Fetch region info to get countries
  useEffect(() => {
    async function loadRegionInfo() {
      if (regionPlans && regionPlans.length > 0) {
        // Get the region_code from the first plan
        const regionCode = regionPlans[0].region_code;
        const info = await fetchRegionInfo(regionCode);
        setRegionInfo(info);
      }
    }
    loadRegionInfo();
  }, [regionPlans]);

  // Convert prices - memoized
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

        {/* Countries dropdown */}
        {regionInfo?.isMultiCountry && regionInfo.subLocationList.length > 0 && (
          <View style={{marginTop: moderateScale(16)}}>
            <TouchableOpacity
              onPress={() => setShowCountries(!showCountries)}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#FDFD74',
                borderRadius: 12,
                paddingVertical: moderateScale(12),
                paddingHorizontal: scale(16),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="flag" size={scale(18)} color="#1A1A1A" />
                <Text className="font-black uppercase ml-2" style={{color: '#1A1A1A', fontSize: getFontSize(13)}}>
                  {regionInfo.subLocationList.length} COUNTRIES INCLUDED
                </Text>
              </View>
              <Ionicons
                name={showCountries ? "chevron-up" : "chevron-down"}
                size={scale(20)}
                color="#1A1A1A"
              />
            </TouchableOpacity>

            {showCountries && (
              <View style={{
                marginTop: moderateScale(8),
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
                padding: scale(12),
                maxHeight: 200,
              }}>
                <FlatList
                  data={regionInfo.subLocationList}
                  keyExtractor={(item) => item.code}
                  numColumns={2}
                  columnWrapperStyle={{gap: 8, marginBottom: 8}}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        paddingVertical: moderateScale(8),
                        paddingHorizontal: scale(12),
                        borderWidth: 1,
                        borderColor: '#E5E5E5',
                      }}
                    >
                      <Text className="font-bold text-xs" style={{color: '#1A1A1A'}}>
                        {item.name}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}
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
