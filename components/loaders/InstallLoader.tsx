import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getFontSize } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// eSIM with download arrow
function EsimDownloadIcon({ size = 56, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Chip body */}
      <Rect x="3" y="4" width="18" height="12" rx="2" fill="#2EFECC" stroke={color} strokeWidth={1.5} />
      {/* Chip contacts */}
      <Rect x="6" y="7" width="4" height="5" rx="0.5" fill={color} />
      <Path d="M8 7V12" stroke="#2EFECC" strokeWidth={0.6} />
      <Path d="M6 9H10M6 10.5H10" stroke="#2EFECC" strokeWidth={0.6} />
      {/* Download arrow */}
      <Path
        d="M15 6V12M15 12L12.5 9.5M15 12L17.5 9.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Progress indicator */}
      <Rect x="6" y="19" width="12" height="2" rx="1" fill="#E0E0E0" />
      <Rect x="6" y="19" width="6" height="2" rx="1" fill={color} />
    </Svg>
  );
}

// Download arrow (floating)
function DownloadArrowIcon({ size = 16, color = '#2EFECC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4V16M12 16L7 11M12 16L17 11"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 20H19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Checkmark icon (floating)
function CheckmarkIcon({ size = 14, color = '#E0E0E0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path d="M8 12L11 15L16 9" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function InstallLoader() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrow1Anim = useRef(new Animated.Value(0)).current;
  const arrow2Anim = useRef(new Animated.Value(0)).current;
  const arrow3Anim = useRef(new Animated.Value(0)).current;
  const check1Anim = useRef(new Animated.Value(0)).current;
  const check2Anim = useRef(new Animated.Value(0)).current;

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

    // Download arrows falling down
    const animateArrow = (anim: Animated.Value, duration: number, delay: number) => {
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

    // Checkmarks floating across
    const animateCheck = (anim: Animated.Value, duration: number, delay: number) => {
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
    animateArrow(arrow1Anim, 1800, 0).start();
    animateArrow(arrow2Anim, 2200, 600).start();
    animateArrow(arrow3Anim, 2000, 1200).start();
    animateCheck(check1Anim, 4000, 0).start();
    animateCheck(check2Anim, 3500, 2000).start();

    return () => {
      pulse.stop();
      arrow1Anim.stopAnimation();
      arrow2Anim.stopAnimation();
      arrow3Anim.stopAnimation();
      check1Anim.stopAnimation();
      check2Anim.stopAnimation();
    };
  }, []);

  // Arrow falling down style
  const createArrowStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 100],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
  });

  const checkTranslate1 = check1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, SCREEN_WIDTH + 30],
  });

  const checkTranslate2 = check2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Floating checkmarks */}
      <Animated.View
        style={[styles.floatingElement, { top: '22%', transform: [{ translateX: checkTranslate1 }] }]}
      >
        <CheckmarkIcon size={18} color="#E5E5E5" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { top: '70%', transform: [{ translateX: checkTranslate2 }] }]}
      >
        <CheckmarkIcon size={14} color="#D5D5D5" />
      </Animated.View>

      {/* Download arrows falling */}
      <Animated.View
        style={[styles.floatingElement, { left: '18%', top: '30%' }, createArrowStyle(arrow1Anim)]}
      >
        <DownloadArrowIcon size={18} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { right: '20%', top: '28%' }, createArrowStyle(arrow2Anim)]}
      >
        <DownloadArrowIcon size={14} color="#2EFECC" />
      </Animated.View>
      <Animated.View
        style={[styles.floatingElement, { left: '40%', top: '32%' }, createArrowStyle(arrow3Anim)]}
      >
        <DownloadArrowIcon size={16} color="#2EFECC" />
      </Animated.View>

      <View style={styles.centerContent}>
        {/* Pulsing eSIM download icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <EsimDownloadIcon size={56} color="#1A1A1A" />
        </Animated.View>

        <Text style={styles.statusText}>Loading install guide</Text>
        <Text style={styles.subText}>Preparing your eSIM setup</Text>
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
