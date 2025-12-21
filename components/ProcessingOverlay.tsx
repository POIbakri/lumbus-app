import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getFontSize } from '../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProcessingOverlayProps {
  visible: boolean;
  status: string;
}

// eSIM chip icon
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

// Small airplane icon
function AirplaneIcon({ size = 20, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
    </Svg>
  );
}

export function ProcessingOverlay({ visible, status }: ProcessingOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const plane1Anim = useRef(new Animated.Value(0)).current;
  const plane2Anim = useRef(new Animated.Value(0)).current;
  const plane3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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

      // Airplane animations - flying across at different speeds/positions
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
      animatePlane(plane1Anim, 3000, 0).start();
      animatePlane(plane2Anim, 4000, 1000).start();
      animatePlane(plane3Anim, 3500, 2000).start();

      return () => {
        pulse.stop();
        plane1Anim.stopAnimation();
        plane2Anim.stopAnimation();
        plane3Anim.stopAnimation();
      };
    }
  }, [visible]);

  if (!visible) return null;

  const planeTranslate1 = plane1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_WIDTH + 40],
  });

  const planeTranslate2 = plane2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 40, -40],
  });

  const planeTranslate3 = plane3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_WIDTH + 40],
  });

  return (
    <View style={styles.overlay}>
      {/* Flying airplanes in background */}
      <Animated.View style={[styles.plane, styles.plane1, { transform: [{ translateX: planeTranslate1 }] }]}>
        <AirplaneIcon size={18} color="#E5E5E5" />
      </Animated.View>
      <Animated.View style={[styles.plane, styles.plane2, { transform: [{ translateX: planeTranslate2 }, { scaleX: -1 }] }]}>
        <AirplaneIcon size={14} color="#D5D5D5" />
      </Animated.View>
      <Animated.View style={[styles.plane, styles.plane3, { transform: [{ translateX: planeTranslate3 }] }]}>
        <AirplaneIcon size={16} color="#E0E0E0" />
      </Animated.View>

      <View style={styles.container}>
        {/* Pulsing eSIM icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <EsimIcon size={56} color="#1A1A1A" />
        </Animated.View>

        {/* Status text */}
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.subText}>This usually takes a few seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
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
  plane: {
    position: 'absolute',
  },
  plane1: {
    top: '25%',
  },
  plane2: {
    top: '40%',
  },
  plane3: {
    top: '60%',
  },
});
