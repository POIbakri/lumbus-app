#!/usr/bin/env node

/**
 * EAS Build Post-Install Hook
 *
 * This script runs after npm install.
 * iOS RCT-Folly fix is handled by the Expo config plugin in plugins/withRCTFollyFix.js
 */

const platform = process.env.EAS_BUILD_PLATFORM;

console.log(`\n🔧 [EAS npm hook] Running post-install for platform: ${platform}`);

if (platform === 'ios') {
  console.log('✅ [EAS npm hook] iOS platform');
  console.log('ℹ️  [EAS npm hook] RCT-Folly typedef fix will be applied via pre-build hook');
  console.log('   - Hook: .eas/hooks/eas-build-pre-build.sh');
  console.log('   - Script: scripts/patch-rct-folly.rb');
  console.log('   - The script patches RCT-Folly Time.h after pod install completes\n');
} else if (platform === 'android') {
  console.log('✅ [EAS npm hook] Android platform - no additional patches needed\n');
} else {
  console.log(`ℹ️  [EAS npm hook] Unknown platform: ${platform}\n`);
}

console.log('✅ [EAS npm hook] Post-install hook completed\n');
