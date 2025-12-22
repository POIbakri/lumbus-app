import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// eSIM chip icon with signal waves
function EsimIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Chip body */}
      <Rect x="3" y="6" width="18" height="12" rx="2" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* Chip contacts */}
      <Rect x="6" y="9" width="5" height="6" rx="0.5" fill={color} />
      <Path d="M8.5 9V15" stroke="#2EFECC" strokeWidth={0.75} />
      <Path d="M6 11H11M6 13H11" stroke="#2EFECC" strokeWidth={0.75} />
      {/* Signal waves */}
      <Path d="M14 10C15.5 10 16.5 11 16.5 12C16.5 13 15.5 14 14 14" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M14 8C17 8 19 9.5 19 12C19 14.5 17 16 14 16" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

// Signal wave (floating)
function SignalWaveIcon({ size = 20, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 18H6V14H4V18ZM8 18H10V10H8V18ZM12 18H14V6H12V18ZM16 18H18V2H16V18Z" fill={color} />
    </Svg>
  );
}

// Data stream icon
function DataStreamIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 4L12 20M12 4L8 8M12 4L16 8" strokeWidth={2} stroke={color} fill="none" />
    </Svg>
  );
}

export function EsimDetailsLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const signal1Anim = useRef(new Animated.Value(0)).current;
  const signal2Anim = useRef(new Animated.Value(0)).current;

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

    // Signal wave animations - floating up
    const animateWave = (anim: Animated.Value, duration: number, delay: number) => {
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

    // Signal bars moving across
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
    animateWave(wave1Anim, 2000, 0).start();
    animateWave(wave2Anim, 2500, 600).start();
    animateWave(wave3Anim, 2200, 1200).start();
    animateSignal(signal1Anim, 3500, 0).start();
    animateSignal(signal2Anim, 4000, 1800).start();

    return () => {
      pulse.stop();
      wave1Anim.stopAnimation();
      wave2Anim.stopAnimation();
      wave3Anim.stopAnimation();
      signal1Anim.stopAnimation();
      signal2Anim.stopAnimation();
    };
  }, []);

  // Wave floating up style
  const createWaveStyle = (anim: Animated.Value, startX: number) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
      {
        translateX: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [startX, startX + 10, startX],
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
      {/* Floating signal bars */}
      <Animated.View
        style={[styles.floatingElement, { top: '22%', transform: [{ translateX: signalTranslate1 }] }]}
      >
        <SignalWaveIcon size={18} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '68%', transform: [{ translateX: signalTranslate2 }] }]}
      >
        <SignalWaveIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Data streams floating up */}
      <Animated.View
        style={[styles.floatingElement, { left: '20%', top: '55%' }, createWaveStyle(wave1Anim, 0)]}
      >
        <SignalWaveIcon size={16} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '22%', top: '58%' }, createWaveStyle(wave2Anim, 0)]}
      >
        <SignalWaveIcon size={14} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { left: '45%', top: '60%' }, createWaveStyle(wave3Anim, 0)]}
      >
        <SignalWaveIcon size={12} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing eSIM icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <EsimIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading eSIM details</Text>
        <Text style={styles.subText}>Fetching your plan info</Text>
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
