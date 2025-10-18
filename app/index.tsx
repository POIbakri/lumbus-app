import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Small delay to ensure Root Layout is mounted
    const navigationTimer = setTimeout(() => {
      router.replace('/onboarding');
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.replace('/(tabs)/browse');
    } else {
      router.replace('/(auth)/login');
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
        {/* Main Logo Badge */}
        <View className="bg-white/20 border-4 border-white rounded-full px-12 py-6 mb-6 shadow-2xl">
          <Text className="text-white font-black text-2xl tracking-widest uppercase">
            ⚡ LUMBUS
          </Text>
        </View>

        {/* Tagline */}
        <View className="bg-white/10 px-8 py-3 rounded-full border-2 border-white/30">
          <Text className="text-white font-black text-sm tracking-widest uppercase">
            🌍 Global eSIM Solutions
          </Text>
        </View>

        {/* Loading indicator */}
        <View className="mt-12 flex-row gap-2">
          <Animated.View
            style={{
              width: 12,
              height: 12,
              backgroundColor: 'white',
              borderRadius: 6,
              opacity: pulseAnim1,
            }}
          />
          <Animated.View
            style={{
              width: 12,
              height: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 6,
              opacity: pulseAnim2,
            }}
          />
          <Animated.View
            style={{
              width: 12,
              height: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 6,
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
    backgroundColor: '#2EFECC', // Primary turquoise
  },
  blob1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 384,
    height: 384,
    backgroundColor: 'rgba(253, 253, 116, 0.15)', // Yellow #FDFD74
    borderRadius: 192,
  },
  blob2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 320,
    height: 320,
    backgroundColor: 'rgba(247, 226, 251, 0.3)', // Purple #F7E2FB
    borderRadius: 160,
  },
  blob3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 288,
    height: 288,
    backgroundColor: 'rgba(135, 239, 255, 0.2)', // Cyan #87EFFF
    borderRadius: 144,
    marginTop: -144,
    marginLeft: -144,
  },
});
