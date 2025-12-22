import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Plan/ticket icon
function PlanTicketIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Ticket body */}
      <Path
        d="M4 6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V9C18.9 9 18 9.9 18 11C18 12.1 18.9 13 20 13V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V13C5.1 13 6 12.1 6 11C6 9.9 5.1 9 4 9V6Z"
        fill="#2EFECC"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Dashed line */}
      <Path
        d="M10 7V17"
        stroke={color}
        strokeWidth={1.2}
        strokeDasharray="2 2"
      />
      {/* Data indicator */}
      <Circle cx="15" cy="10" r="1.5" fill={color} />
      <Circle cx="15" cy="14" r="1.5" fill={color} />
    </Svg>
  );
}

// Price tag icon (floating)
function PriceTagIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z" />
    </Svg>
  );
}

// Cellular icon (floating)
function CellularIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4 18H6V14H4V18ZM8 18H10V10H8V18ZM12 18H14V6H12V18ZM16 18H18V2H16V18Z" />
    </Svg>
  );
}

export function PlanDetailLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tag1Anim = useRef(new Animated.Value(0)).current;
  const tag2Anim = useRef(new Animated.Value(0)).current;
  const tag3Anim = useRef(new Animated.Value(0)).current;
  const cell1Anim = useRef(new Animated.Value(0)).current;
  const cell2Anim = useRef(new Animated.Value(0)).current;

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

    // Price tags floating
    const animateTag = (anim: Animated.Value, duration: number, delay: number) => {
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

    // Cellular icons across
    const animateCell = (anim: Animated.Value, duration: number, delay: number) => {
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
    animateTag(tag1Anim, 2200, 0).start();
    animateTag(tag2Anim, 2600, 700).start();
    animateTag(tag3Anim, 2400, 1400).start();
    animateCell(cell1Anim, 3500, 0).start();
    animateCell(cell2Anim, 4000, 1800).start();

    return () => {
      pulse.stop();
      tag1Anim.stopAnimation();
      tag2Anim.stopAnimation();
      tag3Anim.stopAnimation();
      cell1Anim.stopAnimation();
      cell2Anim.stopAnimation();
    };
  }, []);

  // Tag floating style
  const createTagStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
      {
        rotate: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '15deg', '0deg'],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  const cellTranslate1 = cell1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, SCREEN_WIDTH + 30],
  });

  const cellTranslate2 = cell2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Floating cellular icons */}
      <Animated.View
        style={[styles.floatingElement, { top: '22%', transform: [{ translateX: cellTranslate1 }] }]}
      >
        <CellularIcon size={16} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '70%', transform: [{ translateX: cellTranslate2 }] }]}
      >
        <CellularIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Price tags floating up */}
      <Animated.View
        style={[styles.floatingElement, { left: '18%', top: '55%' }, createTagStyle(tag1Anim)]}
      >
        <PriceTagIcon size={18} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '20%', top: '58%' }, createTagStyle(tag2Anim)]}
      >
        <PriceTagIcon size={14} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { left: '42%', top: '60%' }, createTagStyle(tag3Anim)]}
      >
        <PriceTagIcon size={16} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing plan icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <PlanTicketIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading plan details</Text>
        <Text style={styles.subText}>Getting the best price for you</Text>
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
