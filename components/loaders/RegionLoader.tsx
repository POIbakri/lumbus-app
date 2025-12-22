import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Location pin with radar
function LocationPinIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Pin body */}
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill="#2EFECC"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Inner circle */}
      <Circle cx="12" cy="9" r="3" fill={color} />
    </Svg>
  );
}

// Signal wave for radar effect (separate component for animation)
function SignalWaveIcon({ size = 120, opacity = 0.3 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity }}>
      <Circle cx="12" cy="12" r="10" stroke="#2EFECC" strokeWidth={1} fill="none" />
    </Svg>
  );
}

// Small airplane
function AirplaneIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
    </Svg>
  );
}

export function RegionLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radar1Anim = useRef(new Animated.Value(0)).current;
  const radar2Anim = useRef(new Animated.Value(0)).current;
  const radar3Anim = useRef(new Animated.Value(0)).current;
  const plane1Anim = useRef(new Animated.Value(0)).current;
  const plane2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Radar wave animations - expanding circles
    const animateRadar = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Plane animation
    const animatePlane = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    pulse.start();
    animateRadar(radar1Anim, 0).start();
    animateRadar(radar2Anim, 700).start();
    animateRadar(radar3Anim, 1400).start();
    animatePlane(plane1Anim, 3500, 0).start();
    animatePlane(plane2Anim, 4000, 2000).start();

    return () => {
      pulse.stop();
      radar1Anim.stopAnimation();
      radar2Anim.stopAnimation();
      radar3Anim.stopAnimation();
      plane1Anim.stopAnimation();
      plane2Anim.stopAnimation();
    };
  }, []);

  // Radar wave style
  const createRadarStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 2.5],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.6, 0.4, 0],
    }),
  });

  const planeTranslate1 = plane1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, SCREEN_WIDTH + 30],
  });

  const planeTranslate2 = plane2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Floating planes */}
      <Animated.View
        style={[styles.floatingElement, { top: '25%', transform: [{ translateX: planeTranslate1 }] }]}
      >
        <AirplaneIcon size={16} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '65%', transform: [{ translateX: planeTranslate2 }, { scaleX: -1 }] }]}
      >
        <AirplaneIcon size={14} color="#D5D5D5" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Radar waves behind the icon */}
        <View style={styles.radarContainer}>
          <Animated.View style={[styles.radarWave, createRadarStyle(radar1Anim)]}>
            <SignalWaveIcon size={120} />
          </Animated.View>
          <Animated.View style={[styles.radarWave, createRadarStyle(radar2Anim)]}>
            <SignalWaveIcon size={120} />
          </Animated.View>
          <Animated.View style={[styles.radarWave, createRadarStyle(radar3Anim)]}>
            <SignalWaveIcon size={120} />
          </Animated.View>
        </View>

        {/* Pulsing location pin */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LocationPinIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading region</Text>
        <Text style={styles.subText}>Finding available plans</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarWave: {
    position: 'absolute',
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0FEF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2EFECC',
    zIndex: 1,
  },
  statusText: {
    marginTop: 28,
    fontSize: getFontSize(18),
    fontWeight: '900',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subText: {
    marginTop: 8,
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: '#666666',
  },
  floatingElement: {
    position: 'absolute',
  },
});
