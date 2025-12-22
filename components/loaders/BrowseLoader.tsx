import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Globe icon with meridians
function GlobeIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Globe circle */}
      <Circle cx="12" cy="12" r="9" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* Meridians */}
      <Path
        d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
      <Path
        d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
      {/* Equator */}
      <Path
        d="M3 12H21"
        stroke={color}
        strokeWidth={1.2}
      />
      {/* Latitude lines */}
      <Path
        d="M5 8H19"
        stroke={color}
        strokeWidth={0.8}
        opacity={0.6}
      />
      <Path
        d="M5 16H19"
        stroke={color}
        strokeWidth={0.8}
        opacity={0.6}
      />
    </Svg>
  );
}

// Location pin icon (floating)
function LocationPinIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
    </Svg>
  );
}

// Airplane icon (floating)
function AirplaneIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
    </Svg>
  );
}

export function BrowseLoader() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pin1Anim = useRef(new Animated.Value(0)).current;
  const pin2Anim = useRef(new Animated.Value(0)).current;
  const pin3Anim = useRef(new Animated.Value(0)).current;
  const plane1Anim = useRef(new Animated.Value(0)).current;
  const plane2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle rotation for globe
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

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

    // Floating pins animation
    const animatePin = (anim: Animated.Value, duration: number, delay: number) => {
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
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Airplane across
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

    rotate.start();
    pulse.start();
    animatePin(pin1Anim, 2000, 0).start();
    animatePin(pin2Anim, 2500, 500).start();
    animatePin(pin3Anim, 2200, 1000).start();
    animatePlane(plane1Anim, 3500, 0).start();
    animatePlane(plane2Anim, 4000, 1500).start();

    return () => {
      rotate.stop();
      pulse.stop();
      pin1Anim.stopAnimation();
      pin2Anim.stopAnimation();
      pin3Anim.stopAnimation();
      plane1Anim.stopAnimation();
      plane2Anim.stopAnimation();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Pin bounce effect
  const createPinStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 1, 0.6],
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
        style={[styles.floatingElement, { top: '22%', transform: [{ translateX: planeTranslate1 }] }]}
      >
        <AirplaneIcon size={16} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '68%', transform: [{ translateX: planeTranslate2 }, { scaleX: -1 }] }]}
      >
        <AirplaneIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Floating location pins */}
      <Animated.View
        style={[styles.floatingElement, { left: '18%', top: '35%' }, createPinStyle(pin1Anim)]}
      >
        <LocationPinIcon size={18} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '20%', top: '30%' }, createPinStyle(pin2Anim)]}
      >
        <LocationPinIcon size={14} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { left: '25%', bottom: '32%' }, createPinStyle(pin3Anim)]}
      >
        <LocationPinIcon size={16} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Rotating globe with pulse */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <GlobeIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Exploring destinations</Text>
        <Text style={styles.subText}>Finding the best plans for you</Text>
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
