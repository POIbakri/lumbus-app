import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Battery/data icon with fill
function DataFillIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Battery outline */}
      <Rect x="4" y="6" width="14" height="12" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
      {/* Battery cap */}
      <Path d="M18 9H20V15H18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Fill level (animated with CSS would be ideal, using static for now) */}
      <Rect x="5.5" y="7.5" width="6" height="9" rx="1" fill="#2EFECC" />
      {/* Plus icon */}
      <Path d="M9 10V14M7 12H11" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      {/* Signal bars on right */}
      <Path d="M14 13V15" stroke={color} strokeWidth={1} strokeLinecap="round" />
      <Path d="M15.5 11V15" stroke={color} strokeWidth={1} strokeLinecap="round" />
    </Svg>
  );
}

// Signal bar (floating)
function SignalBarIcon({ size = 18, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4 18H6V14H4V18ZM8 18H10V10H8V18ZM12 18H14V6H12V18ZM16 18H18V2H16V18Z" />
    </Svg>
  );
}

// Plus icon (floating)
function PlusIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path d="M12 7V17M7 12H17" stroke="white" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function TopUpLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const signal1Anim = useRef(new Animated.Value(0)).current;
  const signal2Anim = useRef(new Animated.Value(0)).current;
  const signal3Anim = useRef(new Animated.Value(0)).current;
  const plus1Anim = useRef(new Animated.Value(0)).current;
  const plus2Anim = useRef(new Animated.Value(0)).current;

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

    // Fill animation (simulating battery filling)
    const fill = Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Signal bars rising up
    const animateSignal = (anim: Animated.Value, duration: number, delay: number) => {
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

    // Plus icons floating across
    const animatePlus = (anim: Animated.Value, duration: number, delay: number) => {
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
    fill.start();
    animateSignal(signal1Anim, 2200, 0).start();
    animateSignal(signal2Anim, 2600, 700).start();
    animateSignal(signal3Anim, 2400, 1400).start();
    animatePlus(plus1Anim, 3500, 0).start();
    animatePlus(plus2Anim, 4000, 1800).start();

    return () => {
      pulse.stop();
      fill.stop();
      signal1Anim.stopAnimation();
      signal2Anim.stopAnimation();
      signal3Anim.stopAnimation();
      plus1Anim.stopAnimation();
      plus2Anim.stopAnimation();
    };
  }, []);

  // Signal bar rising style
  const createSignalStyle = (anim: Animated.Value, startX: number) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 0.8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  const plusTranslate1 = plus1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, SCREEN_WIDTH + 30],
  });

  const plusTranslate2 = plus2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Floating plus icons */}
      <Animated.View
        style={[styles.floatingElement, { top: '20%', transform: [{ translateX: plusTranslate1 }] }]}
      >
        <PlusIcon size={18} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '72%', transform: [{ translateX: plusTranslate2 }] }]}
      >
        <PlusIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Signal bars rising */}
      <Animated.View
        style={[styles.floatingElement, { left: '15%', top: '55%' }, createSignalStyle(signal1Anim, 0)]}
      >
        <SignalBarIcon size={20} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '18%', top: '58%' }, createSignalStyle(signal2Anim, 0)]}
      >
        <SignalBarIcon size={16} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { left: '42%', top: '60%' }, createSignalStyle(signal3Anim, 0)]}
      >
        <SignalBarIcon size={18} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing data fill icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <DataFillIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading top-up options</Text>
        <Text style={styles.subText}>Finding data packages for you</Text>
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
