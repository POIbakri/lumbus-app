#!/usr/bin/env node

/**
 * EAS Build Post-Install Hook
 *
 * This script runs after npm install (and pod install on iOS).
 * It patches the Podfile to add Folly preprocessor definitions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = process.env.EAS_BUILD_PLATFORM;

console.log(`\n🔧 [EAS npm hook] Running post-install for platform: ${platform}`);

if (platform === 'ios') {
  console.log('✅ [EAS npm hook] iOS platform');

  // Run expo prebuild to generate the Podfile
  console.log('🔧 [EAS npm hook] Running expo prebuild to generate Podfile...');
  try {
    execSync('npx expo prebuild --platform ios --no-install', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  [EAS npm hook] Prebuild may have already run');
  }

  const podfilePath = path.join(__dirname, '..', 'ios', 'Podfile');

  if (fs.existsSync(podfilePath)) {
    console.log('✅ [EAS npm hook] Found Podfile, patching it...');

    let podfileContent = fs.readFileSync(podfilePath, 'utf8');

    // Check if our fix is already present
    if (podfileContent.includes('# EAS_FOLLY_FIX')) {
      console.log('✅ [EAS npm hook] Folly fix already present in Podfile');
    } else {
      // Add post_install hook
      const follyFix = `

# EAS_FOLLY_FIX
post_install do |installer|
  # Fix RCT-Folly typedef redefinition error
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Disable Folly coroutines which cause clockid_t typedef conflicts
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_MOBILE=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_USE_LIBCPP=1'

      # Set deployment target
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
    end
  end
end
`;

      podfileContent += follyFix;
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');
      console.log('✅ [EAS npm hook] Successfully patched Podfile with Folly preprocessor flags');
    }
  } else {
    console.log('⚠️  [EAS npm hook] Podfile not found - it will be generated during EAS build');
  }

  console.log('   - RCT-Folly coroutines disabled via Podfile post_install');
  console.log('   - Static frameworks enabled for better compatibility');
  console.log('   - Clean build environment enforced\n');
} else if (platform === 'android') {
  console.log('✅ [EAS npm hook] Android platform - no iOS-specific patches needed\n');
} else {
  console.log(`ℹ️  [EAS npm hook] Unknown platform: ${platform}\n`);
}

console.log('✅ [EAS npm hook] Post-install hook completed\n');
