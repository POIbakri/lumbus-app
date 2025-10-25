const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to fix RCT-Folly typedef redefinition error on iOS
 *
 * This plugin modifies the Podfile to include a post_install hook that patches
 * the RCT-Folly Time.h file to prevent typedef conflicts with newer Xcode/iOS SDK.
 *
 * The error occurs because RCT-Folly's Time.h defines clockid_t as uint8_t,
 * but newer iOS SDKs define it as an enum, causing a typedef redefinition error.
 */
module.exports = function withRCTFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      // Read the Podfile
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Check if our fix is already present
      if (podfileContent.includes('RCT-Folly typedef fix')) {
        console.log('✅ [Expo Plugin] RCT-Folly fix already present in Podfile');
        return config;
      }

      // Find the post_install hook or create one
      const postInstallHook = `
  # RCT-Folly typedef fix for iOS SDK compatibility
  post_install do |installer|
    # Fix RCT-Folly Time.h typedef redefinition error
    # Changes minimum iOS version check from 10.0 to 13.0 to avoid clockid_t conflict
    \`sed -i -e  $'s/__IPHONE_10_0/__IPHONE_13_0/' Pods/RCT-Folly/folly/portability/Time.h\`

    # Standard Expo post_install modifications
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      end
    end
  end`;

      // Check if there's already a post_install block
      if (podfileContent.includes('post_install do |installer|')) {
        // Insert our sed command at the beginning of the existing post_install block
        podfileContent = podfileContent.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|
    # RCT-Folly typedef fix for iOS SDK compatibility
    # Changes minimum iOS version check from 10.0 to 13.0 to avoid clockid_t conflict
    \`sed -i -e  $'s/__IPHONE_10_0/__IPHONE_13_0/' Pods/RCT-Folly/folly/portability/Time.h\`
`
        );
        console.log('✅ [Expo Plugin] Injected RCT-Folly fix into existing post_install hook');
      } else {
        // Append our post_install hook at the end of the Podfile
        podfileContent += `\n${postInstallHook}\n`;
        console.log('✅ [Expo Plugin] Added post_install hook with RCT-Folly fix to Podfile');
      }

      // Write the modified Podfile back
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');

      return config;
    },
  ]);
};
