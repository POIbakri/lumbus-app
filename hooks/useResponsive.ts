import { Dimensions, Platform } from 'react-native';
import { useMemo } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard device breakpoints
const SMALL_DEVICE = 375; // iPhone SE, smaller phones
const MEDIUM_DEVICE = 414; // iPhone Pro, standard phones
const LARGE_DEVICE = 480; // Large phones, small tablets

export function useResponsive() {
  const dimensions = useMemo(() => {
    const isSmallDevice = SCREEN_WIDTH < SMALL_DEVICE;
    const isMediumDevice = SCREEN_WIDTH >= SMALL_DEVICE && SCREEN_WIDTH < LARGE_DEVICE;
    const isLargeDevice = SCREEN_WIDTH >= LARGE_DEVICE;

    // Responsive scaling function
    const scale = (size: number) => {
      const baseWidth = 375; // Base design width (iPhone SE)
      return (SCREEN_WIDTH / baseWidth) * size;
    };

    // Vertical spacing
    const verticalScale = (size: number) => {
      const baseHeight = 812; // Base design height
      return (SCREEN_HEIGHT / baseHeight) * size;
    };

    // Moderate scale - less aggressive scaling
    const moderateScale = (size: number, factor = 0.5) => {
      return size + (scale(size) - size) * factor;
    };

    return {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      scale,
      verticalScale,
      moderateScale,
    };
  }, []);

  return dimensions;
}

// Responsive font sizes
export const getFontSize = (baseSize: number) => {
  if (SCREEN_WIDTH < SMALL_DEVICE) {
    return baseSize * 0.9; // 10% smaller on small devices
  } else if (SCREEN_WIDTH >= LARGE_DEVICE) {
    return baseSize * 1.1; // 10% larger on large devices
  }
  return baseSize;
};

// Responsive spacing
export const getSpacing = (baseSpacing: number) => {
  const scale = SCREEN_WIDTH / 375;
  return baseSpacing * scale;
};

// Responsive padding based on screen width
export const getHorizontalPadding = () => {
  if (SCREEN_WIDTH < SMALL_DEVICE) {
    return 16;
  } else if (SCREEN_WIDTH >= LARGE_DEVICE) {
    return 32;
  }
  return 24;
};
