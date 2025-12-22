import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

// Gift icon
function GiftIcon({ size = 40, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Box body */}
      <Rect x="3" y="12" width="18" height="9" rx="1" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* Box top */}
      <Rect x="2" y="8" width="20" height="4" rx="1" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* Ribbon vertical */}
      <Path d="M12 8V21" stroke={color} strokeWidth={1.5} />
      {/* Ribbon bow */}
      <Path
        d="M12 8C12 8 9 6 9 4C9 2 10.5 2 12 4C13.5 2 15 2 15 4C15 6 12 8 12 8Z"
        fill={color}
      />
    </Svg>
  );
}

// Star (floating)
function StarIcon({ size = 12, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </Svg>
  );
}

// Compact loader for modal content
export function ReferralLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Stars twinkling
    const animateStar = (anim: Animated.Value, duration: number, delay: number) => {
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

    pulse.start();
    animateStar(star1Anim, 600, 0).start();
    animateStar(star2Anim, 800, 200).start();
    animateStar(star3Anim, 700, 400).start();

    return () => {
      pulse.stop();
      star1Anim.stopAnimation();
      star2Anim.stopAnimation();
      star3Anim.stopAnimation();
    };
  }, []);

  // Star twinkle style
  const createStarStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.2],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  });

  return (
    <View style={styles.container}>
      {/* Twinkling stars around */}
      <Animated.View style={[styles.star, styles.star1, createStarStyle(star1Anim)]}>
        <StarIcon size={14} color="#2EFECC" />
      </Animated.View>
      <Animated.View style={[styles.star, styles.star2, createStarStyle(star2Anim)]}>
        <StarIcon size={10} color="#2EFECC" />
      </Animated.View>
      <Animated.View style={[styles.star, styles.star3, createStarStyle(star3Anim)]}>
        <StarIcon size={12} color="#2EFECC" />
      </Animated.View>

      {/* Pulsing gift icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <GiftIcon size={40} color="#1A1A1A" />
      </Animated.View>

      <Text style={styles.text}>Loading rewards...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0FEF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2EFECC',
  },
  text: {
    marginTop: 16,
    fontSize: getFontSize(14),
    fontWeight: '700',
    color: '#666666',
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 20,
    left: 30,
  },
  star2: {
    top: 40,
    right: 25,
  },
  star3: {
    bottom: 50,
    left: 40,
  },
});
