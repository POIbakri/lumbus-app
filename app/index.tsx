import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { fetchUserOrders, fetchPlans, fetchReferralInfo } from '../lib/api';
import { useResponsive, getSpacing } from '../hooks/useResponsive';
import { useLocationCurrency, preConvertPrices } from '../hooks/useLocationCurrency';
import { logger } from '../lib/logger';
import { Plan } from '../types';

const SPLASH_TIMEOUT_MS = 10000; // 10 second max wait time

export default function Index() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isTablet, adaptiveScale } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim1 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim2 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim3 = useRef(new Animated.Value(0.3)).current;
  const hasNavigated = useRef(false);

  // Start currency/location detection immediately during splash
  // This caches the result so Browse page loads with prices ready
  useLocationCurrency();

  // Safe navigation helper - prevents double navigation
  const safeNavigate = (route: '/(tabs)/browse' | '/onboarding') => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace(route);
  };

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing loading dots animation
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const pulse1 = createPulse(pulseAnim1, 0);
    const pulse2 = createPulse(pulseAnim2, 200);
    const pulse3 = createPulse(pulseAnim3, 400);

    pulse1.start();
    pulse2.start();
    pulse3.start();

    // Start prefetching and auth check
    checkAuthAndPrefetch();

    // Fallback timeout - navigate to onboarding if prefetch hangs
    const fallbackTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        logger.error('Splash screen timeout - navigating to fallback');
        safeNavigate('/onboarding');
      }
    }, SPLASH_TIMEOUT_MS);

    return () => {
      clearTimeout(fallbackTimer);
      pulse1.stop();
      pulse2.stop();
      pulse3.stop();
    };
  }, []);

  async function checkAuthAndPrefetch() {
    try {
      // Fetch plans (needed for Browse regardless of auth)
      const plans = await fetchPlans();
      queryClient.setQueryData(['plans'], plans);

      // Extract unique minimum prices per region for pre-conversion
      const regionMinPrices = new Map<string, number>();
      plans.forEach((plan: Plan) => {
        const current = regionMinPrices.get(plan.region_code);
        if (!current || plan.retail_price < current) {
          regionMinPrices.set(plan.region_code, plan.retail_price);
        }
      });
      const uniquePrices = [...new Set(regionMinPrices.values())];

      // Pre-convert prices for Browse page (runs in parallel with auth check)
      const priceConversionPromise = preConvertPrices(uniquePrices).catch((err) => {
        logger.error('Price conversion failed:', err);
        // Non-critical - continue without pre-converted prices
      });

      // Check auth
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const userId = session.user.id;
        const userEmail = session.user.email || '';

        // Cache user data
        queryClient.setQueryData(['userId'], userId);
        queryClient.setQueryData(['userEmail'], userEmail);

        // Prefetch user-specific data in parallel (non-blocking errors)
        const userDataPromises = Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['orders', userId],
            queryFn: () => fetchUserOrders(userId),
            staleTime: 600000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['referralInfo'],
            queryFn: fetchReferralInfo,
            staleTime: 300000,
          }),
        ]);

        // Wait for data prefetch and price conversion (with error tolerance)
        await Promise.allSettled([userDataPromises, priceConversionPromise]);

        // Navigate to browse - data is ready (or partially ready)
        safeNavigate('/(tabs)/browse');
      } else {
        // Not authenticated - wait for price conversion
        await priceConversionPromise;
        safeNavigate('/onboarding');
      }
    } catch (error) {
      logger.error('Splash prefetch error:', error);
      // On any error, try to check auth and navigate appropriately
      try {
        const { data: { session } } = await supabase.auth.getSession();
        safeNavigate(session ? '/(tabs)/browse' : '/onboarding');
      } catch {
        // Last resort - go to onboarding
        safeNavigate('/onboarding');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Icon Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/iconlogotrans.png')}
            style={{
              width: adaptiveScale(isTablet ? 180 : 120),
              height: adaptiveScale(isTablet ? 180 : 120),
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Loading indicator */}
        <View style={[styles.loadingContainer, { marginTop: getSpacing(48), gap: getSpacing(12) }]}>
          <Animated.View
            style={{
              width: adaptiveScale(12),
              height: adaptiveScale(12),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(6),
              opacity: pulseAnim1,
            }}
          />
          <Animated.View
            style={{
              width: adaptiveScale(12),
              height: adaptiveScale(12),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(6),
              opacity: pulseAnim2,
            }}
          />
          <Animated.View
            style={{
              width: adaptiveScale(12),
              height: adaptiveScale(12),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(6),
              opacity: pulseAnim3,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0FEF7',
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
  },
});
