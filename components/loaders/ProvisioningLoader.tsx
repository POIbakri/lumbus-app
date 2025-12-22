import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getFontSize, getHorizontalPadding, getIconSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProvisioningLoaderProps {
  isPolling: boolean;
  pollingStatus: string;
  onBack: () => void;
  onRefresh: () => void;
}

// eSIM chip icon
function EsimIcon({ size = 48, color = '#1A1A1A' }: { size?: number; color?: string }) {
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

// Small airplane icon
function AirplaneIcon({ size = 20, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
    </Svg>
  );
}

// Gear/processing icon (floating)
function GearIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
    </Svg>
  );
}

export function ProvisioningLoader({ isPolling, pollingStatus, onBack, onRefresh }: ProvisioningLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const plane1Anim = useRef(new Animated.Value(0)).current;
  const plane2Anim = useRef(new Animated.Value(0)).current;
  const gear1Anim = useRef(new Animated.Value(0)).current;
  const gear2Anim = useRef(new Animated.Value(0)).current;
  const gear3Anim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    // Slow rotation for processing feel
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Airplane animations
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

    // Gear floating animations
    const animateGear = (anim: Animated.Value, duration: number, delay: number) => {
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

    pulse.start();
    rotate.start();
    animatePlane(plane1Anim, 3500, 0).start();
    animatePlane(plane2Anim, 4000, 2000).start();
    animateGear(gear1Anim, 2500, 0).start();
    animateGear(gear2Anim, 2800, 800).start();
    animateGear(gear3Anim, 2600, 1600).start();

    return () => {
      pulse.stop();
      rotate.stop();
      plane1Anim.stopAnimation();
      plane2Anim.stopAnimation();
      gear1Anim.stopAnimation();
      gear2Anim.stopAnimation();
      gear3Anim.stopAnimation();
    };
  }, []);

  const planeTranslate1 = plane1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_WIDTH + 40],
  });

  const planeTranslate2 = plane2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 40, -40],
  });

  // Gear floating + rotating style
  const createGearStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={getIconSize(24)} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {/* Flying airplanes */}
        <Animated.View style={[styles.floatingElement, { top: '15%', transform: [{ translateX: planeTranslate1 }] }]}>
          <AirplaneIcon size={20} color="#E5E5E5" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { top: '75%', transform: [{ translateX: planeTranslate2 }, { scaleX: -1 }] }]}>
          <AirplaneIcon size={16} color="#D5D5D5" />
        </Animated.View>

        {/* Floating gears */}
        <Animated.View style={[styles.floatingElement, { left: '15%', top: '45%' }, createGearStyle(gear1Anim)]}>
          <GearIcon size={18} color="#2EFECC" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { right: '18%', top: '50%' }, createGearStyle(gear2Anim)]}>
          <GearIcon size={14} color="#2EFECC" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { left: '40%', top: '55%' }, createGearStyle(gear3Anim)]}>
          <GearIcon size={16} color="#2EFECC" />
        </Animated.View>

        {/* Center content */}
        <View style={styles.centerContent}>
          {/* Pulsing eSIM icon with subtle rotation */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }, { rotate: spin }] },
            ]}
          >
            <EsimIcon size={48} color="#1A1A1A" />
          </Animated.View>

          {/* Status text */}
          <Text style={styles.titleText}>
            {isPolling ? 'Processing Your Order' : 'Provisioning your eSIM'}
          </Text>

          <Text style={styles.statusText}>
            {pollingStatus || "This usually takes 1-2 minutes. You'll receive an email when your eSIM is ready."}
          </Text>

          {/* Refresh button - only show when not polling */}
          {!isPolling && (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} activeOpacity={0.8}>
              <Ionicons name="refresh" size={18} color="#1A1A1A" style={{ marginRight: 8 }} />
              <Text style={styles.refreshButtonText}>Refresh Status</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: 64,
    paddingBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0FEF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2EFECC',
    marginBottom: 32,
  },
  titleText: {
    fontSize: getFontSize(22),
    fontWeight: '900',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2EFECC',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  refreshButtonText: {
    fontSize: getFontSize(14),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  floatingElement: {
    position: 'absolute',
  },
});
