#!/usr/bin/env node

/**
 * EAS Build Post-Install Hook
 *
 * This script runs after npm install (and pod install on iOS).
 * The actual Folly fixes are handled by expo-build-properties configuration.
 */

const platform = process.env.EAS_BUILD_PLATFORM;

console.log(`\n🔧 [EAS npm hook] Running post-install for platform: ${platform}`);

if (platform === 'ios') {
  console.log('✅ [EAS npm hook] iOS platform');
  console.log('   - RCT-Folly coroutines disabled via expo-build-properties');
  console.log('   - Static frameworks enabled for better compatibility');
  console.log('   - Clean build environment enforced\n');
} else if (platform === 'android') {
  console.log('✅ [EAS npm hook] Android platform - no iOS-specific patches needed\n');
} else {
  console.log(`ℹ️  [EAS npm hook] Unknown platform: ${platform}\n`);
}

console.log('✅ [EAS npm hook] Post-install hook completed\n');
