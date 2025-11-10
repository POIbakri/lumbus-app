import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlans } from '../../lib/api';
import { Plan } from '../../types';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { useLocation } from '../../hooks/useLocation';
import { useCurrency } from '../../hooks/useCurrency';

type BrowseTab = 'country' | 'region';

interface RegionGroup {
  region: string;
  planCount: number;
  minPrice: number;
  convertedMinPrice?: number;
  regionCode: string;
  isMultiCountry: boolean;
}

export default function Browse() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<BrowseTab>('country');
  const [regionsWithPrices, setRegionsWithPrices] = useState<RegionGroup[]>([]);
  const { scale, moderateScale, isSmallDevice } = useResponsive();
  const { location, loading: locationLoading } = useLocation();
  const { convertMultiplePrices, symbol, formatPrice, loading: currencyLoading } = useCurrency();

  const { data: plans, isLoading, isFetching, error } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
    staleTime: 600000, // 10 minutes - plans don't change frequently
    gcTime: 1800000, // 30 minutes - keep in cache longer
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Group plans by region/country and sort by user location
  const regionGroups: RegionGroup[] = useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];

    const groupMap = new Map<string, RegionGroup>();

    plans.forEach(plan => {
      const cleanName = (name: string) => name.replace(/['"]+/g, '').trim();
      const extractRegion = (name: string) => {
        const cleaned = cleanName(name);
        const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
        return match ? match[1].trim() : cleaned.split(' ')[0];
      };

      const region = extractRegion(plan.name);
      const regionCode = plan.region_code;

      // Determine if this is a multi-country region
      // Multi-country regions typically have codes like "EU", "ASIA", "LATAM" or word-based codes
      const isMultiCountry = regionCode.length > 2 ||
                            regionCode.toLowerCase() === 'eu' ||
                            regionCode.toLowerCase() === 'asia' ||
                            regionCode.toLowerCase() === 'latam' ||
                            regionCode.toLowerCase() === 'global' ||
                            region.toLowerCase().includes('europe') ||
                            region.toLowerCase().includes('asia') ||
                            region.toLowerCase().includes('america') ||
                            region.toLowerCase().includes('world') ||
                            region.toLowerCase().includes('global');

      const existing = groupMap.get(region);

      if (existing) {
        existing.planCount += 1;
        existing.minPrice = Math.min(existing.minPrice, plan.retail_price || plan.price);
      } else {
        groupMap.set(region, {
          region,
          planCount: 1,
          minPrice: plan.retail_price || plan.price,
          regionCode,
          isMultiCountry,
        });
      }
    });

    const regions = Array.from(groupMap.values());

    // Sort: user's location first, then alphabetically
    return regions.sort((a, b) => {
      // If we have location data
      if (location?.country_code) {
        const userCountry = location.country_code.toUpperCase();
        const aMatchesUser = a.regionCode.toUpperCase().includes(userCountry) || a.region.toUpperCase().includes(location.country_name?.toUpperCase() || '');
        const bMatchesUser = b.regionCode.toUpperCase().includes(userCountry) || b.region.toUpperCase().includes(location.country_name?.toUpperCase() || '');

        // User's region goes first
        if (aMatchesUser && !bMatchesUser) return -1;
        if (!aMatchesUser && bMatchesUser) return 1;
      }

      // Otherwise alphabetical
      return a.region.localeCompare(b.region);
    });
  }, [plans, location]);

  // Convert prices for region groups - memoized
  const convertRegionPrices = useCallback(async () => {
    if (regionGroups.length === 0) return;

    const prices = regionGroups.map(g => g.minPrice);
    const converted = await convertMultiplePrices(prices);

    const updatedRegions = regionGroups.map((group, index) => ({
      ...group,
      convertedMinPrice: converted[index].converted,
    }));

    setRegionsWithPrices(updatedRegions);
  }, [regionGroups, convertMultiplePrices]);

  useEffect(() => {
    if (regionGroups.length > 0 && !currencyLoading) {
      convertRegionPrices();
    }
  }, [regionGroups.length, currencyLoading, convertRegionPrices]);

  // Use regions with converted prices if available - memoized
  const displayRegions = useMemo(() =>
    regionsWithPrices.length > 0 ? regionsWithPrices : regionGroups,
    [regionsWithPrices, regionGroups]
  );

  // Filter regions by search query and active tab - memoized
  const filteredRegions = useMemo(() => {
    let filtered = displayRegions;

    // Filter by tab
    if (activeTab === 'country') {
      filtered = filtered.filter(group => !group.isMultiCountry);
    } else {
      filtered = filtered.filter(group => group.isMultiCountry);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.regionCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [displayRegions, searchQuery, activeTab]);

  // Determine background color based on index - memoized
  const getRegionColor = useCallback((index: number) => {
    const colors = ['#2EFECC', '#87EFFF', '#F7E2FB', '#FDFD74', '#E0FEF7'];
    return colors[index % colors.length];
  }, []);

  const renderRegionCard = useCallback(({ item: group, index }: { item: RegionGroup; index: number }) => {
    const icon = group.isMultiCountry ? '🌍' : '📍';

    return (
      <TouchableOpacity
        key={group.region}
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: getRegionColor(index),
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          borderWidth: 2,
          borderColor: '#E5E5E5'
        }}
        onPress={() => router.push(`/region/${encodeURIComponent(group.region)}`)}
        activeOpacity={0.8}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-3xl font-black mb-2 uppercase tracking-tight" style={{color: '#1A1A1A'}}>
              {group.region}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base font-bold uppercase tracking-wide" style={{color: '#1A1A1A', opacity: 0.7}}>
                {icon} {group.regionCode}
              </Text>
            </View>
          </View>
          <View className="px-4 py-2 rounded-xl" style={{backgroundColor: '#1A1A1A'}}>
            <Text className="font-black text-sm uppercase tracking-wide" style={{color: '#FFFFFF'}}>
              {group.planCount} {group.planCount === 1 ? 'PLAN' : 'PLANS'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3" style={{borderTopWidth: 2, borderTopColor: 'rgba(0,0,0,0.1)'}}>
          <Text className="text-base font-bold uppercase" style={{color: '#1A1A1A', opacity: 0.7}}>
            From {formatPrice(group.convertedMinPrice || group.minPrice)}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-black uppercase mr-2" style={{color: '#1A1A1A'}}>
              VIEW PLANS
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#1A1A1A" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getRegionColor, formatPrice, router]);

  // Only show full loading on initial load, not when refetching cached data
  if ((isLoading && !plans) || currencyLoading) {
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
          Failed to load regions
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
      <View style={{backgroundColor: '#2EFECC', paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(60), paddingBottom: moderateScale(24)}}>
        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 36 : 42), marginBottom: moderateScale(12)}}>
          BROWSE
        </Text>
        <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(16), marginBottom: moderateScale(20)}}>
          Choose your destination
        </Text>

        {/* Tab Switcher */}
        <View className="flex-row rounded-2xl p-1 mb-4" style={{backgroundColor: '#1A1A1A'}}>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: activeTab === 'country' ? '#FDFD74' : 'transparent',
              borderWidth: 2,
              borderColor: activeTab === 'country' ? '#1A1A1A' : 'transparent',
            }}
            onPress={() => setActiveTab('country')}
            activeOpacity={0.7}
          >
            <Text
              className="font-black uppercase tracking-wide"
              style={{
                color: activeTab === 'country' ? '#1A1A1A' : '#FDFD74',
                fontSize: getFontSize(14),
              }}
            >
              📍 COUNTRIES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: activeTab === 'region' ? '#FDFD74' : 'transparent',
              borderWidth: 2,
              borderColor: activeTab === 'region' ? '#1A1A1A' : 'transparent',
            }}
            onPress={() => setActiveTab('region')}
            activeOpacity={0.7}
          >
            <Text
              className="font-black uppercase tracking-wide"
              style={{
                color: activeTab === 'region' ? '#1A1A1A' : '#FDFD74',
                fontSize: getFontSize(14),
              }}
            >
              🌍 REGIONS
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl flex-row items-center" style={{borderWidth: 2, borderColor: '#E5E5E5', paddingHorizontal: scale(20), paddingVertical: moderateScale(14)}}>
          <Ionicons name="search" size={scale(22)} color="#2EFECC" />
          <TextInput
            className="flex-1 font-bold"
            style={{color: '#1A1A1A', marginLeft: scale(12), fontSize: getFontSize(15)}}
            placeholder={activeTab === 'country' ? 'Search countries...' : 'Search regions...'}
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {location && !locationLoading && (
          <View className="flex-row items-center" style={{marginTop: moderateScale(12)}}>
            <Ionicons name="location" size={scale(16)} color="#1A1A1A" />
            <Text className="font-bold" style={{color: '#1A1A1A', opacity: 0.7, fontSize: getFontSize(12), marginLeft: scale(6)}}>
              Your location: {location.country_name}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredRegions}
        renderItem={renderRegionCard}
        keyExtractor={(item) => item.region}
        contentContainerStyle={{
          padding: getHorizontalPadding(),
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="rounded-full p-6 mb-4" style={{backgroundColor: '#F5F5F5'}}>
              <Text style={{fontSize: 64}}>{activeTab === 'country' ? '📍' : '🌍'}</Text>
            </View>
            <Text className="text-xl font-black uppercase" style={{color: '#1A1A1A'}}>
              {searchQuery ? `No ${activeTab === 'country' ? 'countries' : 'regions'} found` : `No ${activeTab === 'country' ? 'countries' : 'regions'} available`}
            </Text>
            <Text className="font-bold mt-2" style={{color: '#666666'}}>
              {searchQuery ? 'Try a different search term' : `Switch to ${activeTab === 'country' ? 'Regions' : 'Countries'} tab`}
            </Text>
          </View>
        }
      />
    </View>
  );
}
