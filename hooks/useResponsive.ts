import { Dimensions, Platform, PixelRatio } from 'react-native';
import { useState, useEffect, useMemo } from 'react';

// Get initial dimensions
const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Device size breakpoints - comprehensive for both iOS and Android
const DEVICE_SIZES = {
  // Phones
  EXTRA_SMALL: 320,  // Very small phones (iPhone 5/SE 1st gen, old Android devices)
  SMALL: 360,        // Small Android phones (Galaxy A series, Pixel 4a)
  SMALL_IOS: 375,    // Small iOS phones (iPhone SE 2nd/3rd gen, iPhone 12/13 mini)
  MEDIUM: 390,       // Standard phones (iPhone 12/13/14/15, Pixel 6/7/8)
  MEDIUM_ANDROID: 412, // Medium Android phones (Galaxy S21/S22/S23, OnePlus)
  LARGE: 428,        // Large phones (iPhone Plus models, Galaxy S Plus models)
  EXTRA_LARGE: 448,  // Extra large phones (iPhone Pro Max, Galaxy S Ultra, Note series)
  PHABLET: 480,      // Phablet size (Galaxy Note 20 Ultra, S24 Ultra at 6.8-6.9")

  // Foldables (when unfolded)
  FOLD_SMALL: 640,   // Galaxy Z Flip unfolded width
  FOLD_LARGE: 860,   // Galaxy Z Fold, Pixel Fold unfolded width

  // Tablets
  SMALL_TABLET: 600,  // Small tablets (Android tablets 7")
  TABLET: 768,        // Regular tablets (iPad mini, Android tablets 8-10")
  LARGE_TABLET: 1024, // Large tablets (iPad Pro, Galaxy Tab S series)
};

// Platform specific constants
const IOS_NOTCH_DEVICES = ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'];
const IOS_HOME_INDICATOR_HEIGHT = 34;
const ANDROID_NAVIGATION_BAR_HEIGHT = 48;

export function useResponsive() {
  const [dimensions, setDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const responsive = useMemo(() => {
    const { width, height } = dimensions;
    const pixelRatio = PixelRatio.get();

    // Orientation detection
    const isLandscape = width > height;
    const isPortrait = !isLandscape;

    // Device type detection - more granular for Android support
    const isExtraSmallDevice = width < DEVICE_SIZES.EXTRA_SMALL;
    const isSmallDevice = width >= DEVICE_SIZES.EXTRA_SMALL && width < DEVICE_SIZES.SMALL_IOS;
    const isMediumDevice = width >= DEVICE_SIZES.SMALL_IOS && width < DEVICE_SIZES.MEDIUM_ANDROID;
    const isLargeDevice = width >= DEVICE_SIZES.MEDIUM_ANDROID && width < DEVICE_SIZES.EXTRA_LARGE;
    const isExtraLargeDevice = width >= DEVICE_SIZES.EXTRA_LARGE && width < DEVICE_SIZES.PHABLET;
    const isPhablet = width >= DEVICE_SIZES.PHABLET && width < DEVICE_SIZES.SMALL_TABLET;
    const isFoldable = width >= DEVICE_SIZES.FOLD_SMALL && width < DEVICE_SIZES.FOLD_LARGE;
    const isTablet = width >= DEVICE_SIZES.SMALL_TABLET;
    const isLargeTablet = width >= DEVICE_SIZES.LARGE_TABLET;

    // Platform checks
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    // Check for notch (iOS)
    const hasNotch = isIOS && height >= 812;

    // Base dimensions for scaling (iPhone 13 Pro as reference)
    const baseWidth = 390;
    const baseHeight = 844;

    // Scaling functions
    const scale = (size: number): number => {
      // Scale based on width with limits to prevent extreme scaling
      const scaleFactor = width / baseWidth;
      const limitedScale = Math.min(Math.max(scaleFactor, 0.85), 1.3);
      return Math.round(size * limitedScale);
    };

    const verticalScale = (size: number): number => {
      // Scale based on height with limits
      const scaleFactor = height / baseHeight;
      const limitedScale = Math.min(Math.max(scaleFactor, 0.85), 1.3);
      return Math.round(size * limitedScale);
    };

    // Moderate scaling - less aggressive, good for fonts and UI elements
    const moderateScale = (size: number, factor = 0.5): number => {
      return Math.round(size + (scale(size) - size) * factor);
    };

    // Moderate vertical scaling
    const moderateVerticalScale = (size: number, factor = 0.5): number => {
      return Math.round(size + (verticalScale(size) - size) * factor);
    };

    // Adaptive scale - uses different scaling based on device type
    const adaptiveScale = (size: number): number => {
      if (isLargeTablet) {
        // Large tablets need minimal scaling
        return moderateScale(size, 0.25);
      } else if (isTablet) {
        // Regular tablets need less aggressive scaling
        return moderateScale(size, 0.3);
      } else if (isFoldable) {
        // Foldable devices in unfolded mode
        return moderateScale(size, 0.35);
      } else if (isPhablet) {
        // Phablet size devices (Galaxy S Ultra, Note series)
        return moderateScale(size, 0.6);
      } else if (isExtraLargeDevice) {
        // Extra large phones
        return moderateScale(size, 0.55);
      } else if (isExtraSmallDevice) {
        // Small devices need more aggressive scaling
        return scale(size * 0.85);
      }
      return moderateScale(size);
    };

    return {
      // Dimensions
      width,
      height,
      pixelRatio,

      // Orientation
      isLandscape,
      isPortrait,

      // Device types
      isExtraSmallDevice,
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      isExtraLargeDevice,
      isPhablet,
      isFoldable,
      isTablet,
      isLargeTablet,

      // Platform
      isIOS,
      isAndroid,
      hasNotch,

      // Scaling functions
      scale,
      verticalScale,
      moderateScale,
      moderateVerticalScale,
      adaptiveScale,

      // Helper values
      screenWidth: width,
      screenHeight: height,
    };
  }, [dimensions]);

  return responsive;
}

// Enhanced responsive font sizes with Android large phone support
export const getFontSize = (baseSize: number): number => {
  const { width } = getWindowDimensions();

  // More granular scaling based on device width
  if (width < DEVICE_SIZES.EXTRA_SMALL) {
    return Math.round(baseSize * 0.85); // 15% smaller for very small devices
  } else if (width < DEVICE_SIZES.SMALL) {
    return Math.round(baseSize * 0.88); // 12% smaller for small Android devices
  } else if (width < DEVICE_SIZES.SMALL_IOS) {
    return Math.round(baseSize * 0.9); // 10% smaller for small iOS devices
  } else if (width >= DEVICE_SIZES.LARGE_TABLET) {
    return Math.round(baseSize * 1.3); // 30% larger for large tablets
  } else if (width >= DEVICE_SIZES.FOLD_LARGE) {
    return Math.round(baseSize * 1.25); // 25% larger for unfolded foldables
  } else if (width >= DEVICE_SIZES.TABLET) {
    return Math.round(baseSize * 1.2); // 20% larger for tablets
  } else if (width >= DEVICE_SIZES.PHABLET) {
    return Math.round(baseSize * 1.15); // 15% larger for phablets (S Ultra, Note)
  } else if (width >= DEVICE_SIZES.EXTRA_LARGE) {
    return Math.round(baseSize * 1.12); // 12% larger for extra large phones
  } else if (width >= DEVICE_SIZES.LARGE) {
    return Math.round(baseSize * 1.08); // 8% larger for large phones
  } else if (width >= DEVICE_SIZES.MEDIUM_ANDROID) {
    return Math.round(baseSize * 1.05); // 5% larger for medium Android phones
  }
  return baseSize;
};

// Responsive spacing with better scaling
export const getSpacing = (baseSpacing: number): number => {
  const { width } = getWindowDimensions();

  if (width < DEVICE_SIZES.SMALL) {
    return Math.round(baseSpacing * 0.85);
  } else if (width >= DEVICE_SIZES.TABLET) {
    return Math.round(baseSpacing * 1.5);
  } else if (width >= DEVICE_SIZES.LARGE) {
    return Math.round(baseSpacing * 1.15);
  }
  return baseSpacing;
};

// Enhanced horizontal padding for different screen sizes including Android
export const getHorizontalPadding = (): number => {
  const { width } = getWindowDimensions();

  if (width < DEVICE_SIZES.EXTRA_SMALL) {
    return 12;
  } else if (width < DEVICE_SIZES.SMALL) {
    return 14; // Small Android phones
  } else if (width < DEVICE_SIZES.SMALL_IOS) {
    return 16; // Small iOS phones
  } else if (width < DEVICE_SIZES.MEDIUM) {
    return 20; // Standard phones
  } else if (width < DEVICE_SIZES.MEDIUM_ANDROID) {
    return 22; // Medium Android phones
  } else if (width < DEVICE_SIZES.LARGE) {
    return 24; // Large phones
  } else if (width < DEVICE_SIZES.EXTRA_LARGE) {
    return 28; // Extra large phones (Pro Max, S Plus)
  } else if (width < DEVICE_SIZES.PHABLET) {
    return 32; // Phablets (S Ultra, Note series)
  } else if (width < DEVICE_SIZES.SMALL_TABLET) {
    return 36; // Transition to tablet
  } else if (width < DEVICE_SIZES.FOLD_LARGE) {
    return 44; // Foldable devices
  } else if (width < DEVICE_SIZES.TABLET) {
    return 48; // Small tablets
  } else if (width < DEVICE_SIZES.LARGE_TABLET) {
    return 60; // Regular tablets
  }
  return 80; // Large tablets
};

// Get responsive border radius
export const getBorderRadius = (baseRadius: number): number => {
  const { width } = getWindowDimensions();

  if (width < DEVICE_SIZES.SMALL) {
    return Math.round(baseRadius * 0.9);
  } else if (width >= DEVICE_SIZES.TABLET) {
    return Math.round(baseRadius * 1.3);
  }
  return baseRadius;
};

// Get responsive icon size
export const getIconSize = (baseSize: number): number => {
  const { width } = getWindowDimensions();

  if (width < DEVICE_SIZES.SMALL) {
    return Math.round(baseSize * 0.85);
  } else if (width >= DEVICE_SIZES.TABLET) {
    return Math.round(baseSize * 1.4);
  } else if (width >= DEVICE_SIZES.LARGE) {
    return Math.round(baseSize * 1.1);
  }
  return baseSize;
};

// Get responsive line height
export const getLineHeight = (fontSize: number): number => {
  return Math.round(fontSize * 1.5); // Standard 1.5x line height
};

// Safe area padding for notched devices
export const getSafeAreaPadding = (): { top: number; bottom: number } => {
  const { height } = getWindowDimensions();
  const isIOS = Platform.OS === 'ios';

  if (isIOS && height >= 812) {
    // iPhone with notch
    return { top: 44, bottom: 34 };
  } else if (isIOS) {
    // iPhone without notch
    return { top: 20, bottom: 0 };
  } else {
    // Android
    return { top: 0, bottom: 0 };
  }
};
