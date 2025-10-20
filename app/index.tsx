import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Animated, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim1 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim2 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim3 = useRef(new Animated.Value(0.3)).current;

  // Responsive sizing
  const logoWidth = Math.min(width * 0.6, 300);
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
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Main Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.jpg')}
            style={{
              width: logoWidth,
              height: logoHeight,
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Tagline */}
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>
            🌍 Global eSIM Solutions
          </Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim1,
              }
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim2,
              }
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim3,
              }
            ]}
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
  blob1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: '#FDFD74', // Yellow
    borderRadius: 150,
    opacity: 0.3,
  },
  blob2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 350,
    height: 350,
    backgroundColor: '#F7E2FB', // Purple
    borderRadius: 175,
    opacity: 0.4,
  },
  blob3: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 280,
    height: 280,
    backgroundColor: '#87EFFF', // Cyan
    borderRadius: 140,
    opacity: 0.35,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  taglineBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  taglineText: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    marginTop: 48,
    flexDirection: 'row',
    gap: 12,
  },
  loadingDot: {
    width: 16,
    height: 16,
    backgroundColor: '#2EFECC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
});
