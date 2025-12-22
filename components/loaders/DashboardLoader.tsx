import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Signal tower icon with waves
function SignalTowerIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tower base */}
      <Path
        d="M12 22V14M9 22H15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Tower body */}
      <Path
        d="M12 14L9 8H15L12 14Z"
        fill="#2EFECC"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Tower top */}
      <Circle cx="12" cy="6" r="2" fill={color} />
      {/* Signal waves */}
      <Path
        d="M7 4C7 4 8.5 2 12 2C15.5 2 17 4 17 4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M5 6C5 6 7 3 12 3C17 3 19 6 19 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
}

// Floating data packet icon
function DataPacketIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12L12 4L20 12L12 20L4 12Z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M8 12L12 8L16 12L12 16L8 12Z"
        fill={color}
      />
    </Svg>
  );
}

// Signal bar icon (floating)
function SignalBarIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4 18H6V14H4V18ZM8 18H10V10H8V18ZM12 18H14V6H12V18ZM16 18H18V2H16V18Z" />
    </Svg>
  );
}

export function DashboardLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const packet1Anim = useRef(new Animated.Value(0)).current;
  const packet2Anim = useRef(new Animated.Value(0)).current;
  const packet3Anim = useRef(new Animated.Value(0)).current;
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

    // Wave animation for signal effect
    const wave = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Data packets floating up diagonally
    const animatePacket = (anim: Animated.Value, duration: number, delay: number) => {
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

    // Signal bars floating across
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
    wave.start();
    animatePacket(packet1Anim, 2500, 0).start();
    animatePacket(packet2Anim, 3000, 800).start();
    animatePacket(packet3Anim, 2800, 1600).start();
    animateSignal(signal1Anim, 4000, 0).start();
    animateSignal(signal2Anim, 3500, 2000).start();

    return () => {
      pulse.stop();
      wave.stop();
      packet1Anim.stopAnimation();
      packet2Anim.stopAnimation();
      packet3Anim.stopAnimation();
      signal1Anim.stopAnimation();
      signal2Anim.stopAnimation();
    };
  }, []);

  // Packet animations - float up and fade out
  const createPacketStyle = (anim: Animated.Value, startX: number, startY: number) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [startX, startX + 60],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [startY, startY - 120],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  // Signal bar animations - float across
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
        style={[
          styles.floatingElement,
          { top: '20%', transform: [{ translateX: signalTranslate1 }] },
        ]}
      >
        <SignalBarIcon size={18} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingElement,
          { top: '70%', transform: [{ translateX: signalTranslate2 }] },
        ]}
      >
        <SignalBarIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Floating data packets */}
      <Animated.View
        style={[
          styles.floatingElement,
          { left: '15%', top: '55%' },
          createPacketStyle(packet1Anim, 0, 0),
        ]}
      >
        <DataPacketIcon size={16} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingElement,
          { left: '70%', top: '60%' },
          createPacketStyle(packet2Anim, 0, 0),
        ]}
      >
        <DataPacketIcon size={12} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingElement,
          { left: '40%', top: '65%' },
          createPacketStyle(packet3Anim, 0, 0),
        ]}
      >
        <DataPacketIcon size={14} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing signal tower icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <SignalTowerIcon size={56} color="#1A1A1A" />
        </Animated.View>

        {/* Status text */}
        <Text style={styles.statusText}>Loading your eSIMs</Text>
        <Text style={styles.subText}>Fetching your data plans</Text>
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
