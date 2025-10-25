#!/usr/bin/env node

/**
 * EAS Build Post-Install Hook
 *
 * This script runs after npm install (and pod install on iOS).
 * It patches RCT-Folly to fix the typedef redefinition error on iOS.
 */

const fs = require('fs');
const path = require('path');

const platform = process.env.EAS_BUILD_PLATFORM;

console.log(`\n🔧 [EAS npm hook] Running post-install for platform: ${platform}\n`);

if (platform === 'ios') {
  // Path to the RCT-Folly Time.h file after pod install
  const follyTimePath = path.join(
    __dirname,
    '..',
    'ios',
    'Pods',
    'RCT-Folly',
    'folly',
    'portability',
    'Time.h'
  );

  console.log(`🔍 [EAS npm hook] Looking for RCT-Folly Time.h at: ${follyTimePath}`);

  if (fs.existsSync(follyTimePath)) {
    console.log('✅ [EAS npm hook] Found RCT-Folly Time.h, applying patch...');

    try {
      // Read the file
      let content = fs.readFileSync(follyTimePath, 'utf8');

      // Check if already patched
      if (content.includes('__IPHONE_12_0') && !content.includes('__IPHONE_10_0')) {
        console.log('✅ [EAS npm hook] RCT-Folly Time.h already patched, skipping');
      } else {
        // Apply the patch: replace __IPHONE_10_0 with __IPHONE_12_0
        const originalContent = content;
        content = content.replace(/__IPHONE_10_0/g, '__IPHONE_12_0');

        if (content !== originalContent) {
          // Write the patched content back
          fs.writeFileSync(follyTimePath, content, 'utf8');
          console.log('✅ [EAS npm hook] Successfully patched RCT-Folly Time.h (__IPHONE_10_0 -> __IPHONE_12_0)');
          console.log('   This fixes the typedef redefinition error with clockid_t\n');
        } else {
          console.log('⚠️  [EAS npm hook] No changes made - __IPHONE_10_0 not found in file');
        }
      }
    } catch (error) {
      console.error('❌ [EAS npm hook] Error patching RCT-Folly Time.h:', error.message);
      process.exit(1);
    }
  } else {
    console.log('⚠️  [EAS npm hook] RCT-Folly Time.h not found at expected location');
    console.log('   This might be normal if pod install hasn\'t run yet or Pods directory doesn\'t exist');
    console.log('   The Expo config plugin will handle the patch instead\n');
  }
} else if (platform === 'android') {
  console.log('✅ [EAS npm hook] Android platform - no iOS-specific patches needed\n');
} else {
  console.log(`ℹ️  [EAS npm hook] Unknown platform: ${platform}\n`);
}

console.log('✅ [EAS npm hook] Post-install hook completed\n');
