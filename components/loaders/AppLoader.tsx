import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Lumbus-style logo/icon
function LumbusIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main circle */}
      <Circle cx="12" cy="12" r="9" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* L shape */}
      <Path
        d="M8 7V15H14"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Signal dot */}
      <Circle cx="16" cy="8" r="2" fill={color} />
    </Svg>
  );
}

// eSIM chip (floating)
function EsimChipIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="6" width="16" height="12" rx="2" fill={color} opacity={0.8} />
      <Rect x="7" y="9" width="4" height="5" rx="0.5" fill="#1A1A1A" opacity={0.6} />
    </Svg>
  );
}

// Signal wave (floating)
function SignalIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4 18H6V14H4V18ZM8 18H10V10H8V18ZM12 18H14V6H12V18ZM16 18H18V2H16V18Z" />
    </Svg>
  );
}

export function AppLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const chip1Anim = useRef(new Animated.Value(0)).current;
  const chip2Anim = useRef(new Animated.Value(0)).current;
  const signal1Anim = useRef(new Animated.Value(0)).current;
  const signal2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
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

    // Subtle rotation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Chips floating
    const animateChip = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
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

    // Signal icons across
    const animateSignal = (anim: Animated.Value, duration: number, delay: number) => {
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
    rotate.start();
    animateChip(chip1Anim, 2500, 0).start();
    animateChip(chip2Anim, 2800, 1200).start();
    animateSignal(signal1Anim, 3500, 0).start();
    animateSignal(signal2Anim, 4000, 1800).start();

    return () => {
      pulse.stop();
      rotate.stop();
      chip1Anim.stopAnimation();
      chip2Anim.stopAnimation();
      signal1Anim.stopAnimation();
      signal2Anim.stopAnimation();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Chip floating style
  const createChipStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  const signalTranslate1 = signal1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, SCREEN_WIDTH + 30],
  });

  const signalTranslate2 = signal2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Floating signals */}
      <Animated.View
        style={[styles.floatingElement, { top: '25%', transform: [{ translateX: signalTranslate1 }] }]}
      >
        <SignalIcon size={16} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '68%', transform: [{ translateX: signalTranslate2 }] }]}
      >
        <SignalIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Floating chips */}
      <Animated.View
        style={[styles.floatingElement, { left: '20%', top: '55%' }, createChipStyle(chip1Anim)]}
      >
        <EsimChipIcon size={18} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '22%', top: '58%' }, createChipStyle(chip2Anim)]}
      >
        <EsimChipIcon size={14} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing + rotating logo */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }, { rotate: spin }] },
          ]}
        >
          <LumbusIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading Lumbus</Text>
        <Text style={styles.subText}>Getting things ready</Text>
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
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0FEF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2EFECC',
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
