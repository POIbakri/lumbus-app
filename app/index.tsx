import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useResponsive, getFontSize, getSpacing } from '../hooks/useResponsive';

export default function Index() {
  const router = useRouter();
  const { width, height, isTablet, adaptiveScale } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim1 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim2 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim3 = useRef(new Animated.Value(0.3)).current;

  // Responsive sizing using our utilities
  const logoWidth = adaptiveScale(isTablet ? 350 : 240);
  const logoHeight = logoWidth * 0.8; // Maintain aspect ratio

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

    // Navigate after animations
    const navigationTimer = setTimeout(() => {
      checkAuth();
    }, 1500);

    return () => {
      clearTimeout(navigationTimer);
      pulse1.stop();
      pulse2.stop();
      pulse3.stop();
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // User is authenticated, skip onboarding
      router.replace('/(tabs)/browse');
    } else {
      // User is not authenticated, show onboarding
      router.replace('/onboarding');
    }
  }

  return (
    <View style={styles.container}>
      {/* Decorative Blobs */}
      <View style={{
        position: 'absolute',
        top: -getSpacing(50),
        right: -getSpacing(50),
        width: adaptiveScale(300),
        height: adaptiveScale(300),
        backgroundColor: '#FDFD74',
        borderRadius: adaptiveScale(150),
        opacity: 0.3,
      }} />
      <View style={{
        position: 'absolute',
        bottom: -getSpacing(80),
        left: -getSpacing(80),
        width: adaptiveScale(350),
        height: adaptiveScale(350),
        backgroundColor: '#F7E2FB',
        borderRadius: adaptiveScale(175),
        opacity: 0.4,
      }} />
      <View style={{
        position: 'absolute',
        top: '40%',
        right: -getSpacing(100),
        width: adaptiveScale(280),
        height: adaptiveScale(280),
        backgroundColor: '#87EFFF',
        borderRadius: adaptiveScale(140),
        opacity: 0.35,
      }} />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Main Logo */}
        <View style={[styles.logoContainer, { marginBottom: getSpacing(48) }]}>
          <Image
            source={require('../assets/logotrans.png')}
            style={{
              width: logoWidth,
              height: logoHeight,
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Loading indicator */}
        <View style={[styles.loadingContainer, { marginTop: getSpacing(48), gap: getSpacing(12) }]}>
          <Animated.View
            style={{
              width: adaptiveScale(16),
              height: adaptiveScale(16),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(8),
              borderWidth: 2,
              borderColor: '#1A1A1A',
              opacity: pulseAnim1,
            }}
          />
          <Animated.View
            style={{
              width: adaptiveScale(16),
              height: adaptiveScale(16),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(8),
              borderWidth: 2,
              borderColor: '#1A1A1A',
              opacity: pulseAnim2,
            }}
          />
          <Animated.View
            style={{
              width: adaptiveScale(16),
              height: adaptiveScale(16),
              backgroundColor: '#2EFECC',
              borderRadius: adaptiveScale(8),
              borderWidth: 2,
              borderColor: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
  },
});
