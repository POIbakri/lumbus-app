import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { RegionLoader } from '../../components/loaders';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans, fetchRegionInfo, RegionInfo } from '../../lib/api';
import { Plan } from '../../types';
import { useLocationCurrency } from '../../hooks/useLocationCurrency';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { GlobeIcon, getFlag } from '../../components/icons/flags';

export default function RegionPlans() {
  const router = useRouter();
  const { region } = useLocalSearchParams<{ region: string }>();
  const [plansWithPrices, setPlansWithPrices] = useState<Plan[]>([]);
  const [showCountries, setShowCountries] = useState(false);
  // Use combined hook - single API call for both location and currency
  const { convertMultiplePrices, symbol, loading: currencyLoading } = useLocationCurrency();
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  const { data: allPlans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 300000,
    gcTime: 600000, // 10 minutes
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

  // Fetch region info using React Query for better caching
  const firstRegionCode = regionPlans && regionPlans.length > 0 ? regionPlans[0].region_code : null;

  const { data: regionInfo } = useQuery({
    queryKey: ['region', firstRegionCode],
    queryFn: () => fetchRegionInfo(firstRegionCode!),
    enabled: !!firstRegionCode,
    staleTime: 1800000, // 30 minutes
    gcTime: 3600000, // 1 hour
    retry: 2,
  });

  // Convert prices - memoized
  const convertPricesForPlans = React.useCallback(async () => {
    if (!regionPlans || regionPlans.length === 0) return;

    // Capture current plans to avoid race condition if regionPlans changes during await
    const currentPlans = [...regionPlans];
    const prices = currentPlans.map(p => p.retail_price);
    const converted = await convertMultiplePrices(prices);

    // Use captured plans for mapping to ensure indices align
    const updatedPlans = currentPlans.map((plan, index) => ({
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
            <View className="flex-row items-center" style={{gap: 8}}>
              {getFlag(plan.region_code, isSmallDevice ? 20 : 24)}
              <Text
                className="font-black mb-1 uppercase tracking-tight"
                style={{
                  color: '#1A1A1A',
                  flex: 1,
                  fontSize: getFontSize(isSmallDevice ? 18 : 20), // Reduced size
                  marginTop: 2
                }}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {extractRegion(plan.name)}
              </Text>
            </View>
          </View>
          <View className="px-4 py-3 rounded-xl" style={{backgroundColor: '#2EFECC'}}>
            <Text className="font-black text-xl" style={{color: '#1A1A1A'}}>
              {plan.displayPrice || '...'}
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
    return <RegionLoader />;
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
      {/* Enhanced Header with improved design */}
      <View style={{
        backgroundColor: '#2EFECC',
        paddingHorizontal: getHorizontalPadding(),
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(32),
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {/* Enhanced Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginBottom: moderateScale(20),
            backgroundColor: 'rgba(26, 26, 26, 0.1)',
            borderRadius: 12,
            paddingVertical: moderateScale(8),
            paddingHorizontal: scale(12),
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <View style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 8,
            padding: 6,
            marginRight: 8,
          }}>
            <Ionicons name="arrow-back" size={scale(18)} color="#2EFECC" />
          </View>
          <Text className="font-bold tracking-wide" style={{
            color: '#1A1A1A',
            fontSize: getFontSize(14),
            letterSpacing: 0.5,
          }}>
            BACK
          </Text>
        </TouchableOpacity>

        {/* Title Section with accent bar */}
        <View style={{marginBottom: moderateScale(24)}}>
          <View className="flex-row items-center" style={{marginBottom: moderateScale(8)}}>
            <View style={{
              width: 4,
              height: getFontSize(isSmallDevice ? 36 : 42),
              backgroundColor: '#1A1A1A',
              marginRight: moderateScale(12),
              borderRadius: 2,
            }} />
            <View className="flex-row items-center" style={{gap: 8}}>
              {region && getFlag(region, isSmallDevice ? 28 : 32)}
              <Text
                className="font-black uppercase tracking-tight"
                style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(isSmallDevice ? 28 : 34), // Reduced size
                  letterSpacing: -0.5,
                  flex: 1,
                }}
                numberOfLines={2} // Allow wrapping for long names
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {region?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Plans Available Badge */}
          <View className="flex-row items-center">
            <View style={{
              backgroundColor: 'rgba(26, 26, 26, 0.15)',
              borderRadius: 10,
              paddingVertical: moderateScale(6),
              paddingHorizontal: scale(14),
              alignSelf: 'flex-start',
            }}>
              <Text className="font-semibold" style={{
                color: '#1A1A1A',
                fontSize: getFontSize(15),
                letterSpacing: 0.3,
              }}>
                {plansToDisplay.length} {plansToDisplay.length === 1 ? 'Plan' : 'Plans'} Available
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Countries Dropdown */}
        {regionInfo?.isMultiCountry && regionInfo.subLocationList.length > 0 && (
          <View>
            <TouchableOpacity
              onPress={() => setShowCountries(!showCountries)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 16,
                paddingVertical: moderateScale(14),
                paddingHorizontal: scale(18),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center flex-1">
                <View style={{
                  backgroundColor: '#FDFD74',
                  borderRadius: 8,
                  padding: 6,
                  marginRight: 10,
                }}>
                  <Ionicons name="flag" size={scale(16)} color="#1A1A1A" />
                </View>
                <View>
                  <Text className="font-bold tracking-wide" style={{
                    color: '#2EFECC',
                    fontSize: getFontSize(14),
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  }}>
                    {regionInfo.subLocationList.length} COUNTRIES
                  </Text>
                  <Text style={{
                    color: 'rgba(46, 254, 204, 0.7)',
                    fontSize: getFontSize(11),
                    letterSpacing: 0.2,
                  }}>
                    Tap to view included regions
                  </Text>
                </View>
              </View>
              <View style={{
                backgroundColor: '#2EFECC',
                borderRadius: 8,
                padding: 6,
              }}>
                <Ionicons
                  name={showCountries ? "chevron-up" : "chevron-down"}
                  size={scale(18)}
                  color="#1A1A1A"
                />
              </View>
            </TouchableOpacity>

            {showCountries && (
              <View style={{
                marginTop: moderateScale(12),
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: scale(16),
                maxHeight: 240,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}>
                <Text className="font-bold uppercase tracking-wide" style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(12),
                  marginBottom: moderateScale(12),
                  opacity: 0.6,
                }}>
                  Included Countries
                </Text>
                <FlatList
                  data={regionInfo.subLocationList}
                  keyExtractor={(item) => item.code}
                  numColumns={2}
                  columnWrapperStyle={{gap: 10, marginBottom: 10}}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: '#F0FFFB',
                        borderRadius: 10,
                        paddingVertical: moderateScale(10),
                        paddingHorizontal: scale(14),
                        borderWidth: 1,
                        borderColor: '#E0FEF7',
                      }}
                    >
                      <Text className="font-semibold" style={{
                        color: '#1A1A1A',
                        fontSize: getFontSize(13),
                        letterSpacing: 0.2,
                      }}>
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
