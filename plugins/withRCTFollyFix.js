const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
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

const FOLLY_FIX_MARKER = '# EAS_RCT_FOLLY_FIX';

function withRCTFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        console.log('⚠️  [Expo Plugin] Podfile not found, skipping RCT-Folly fix');
        return config;
      }

      // Read the Podfile
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Check if our fix is already present
      if (podfileContent.includes(FOLLY_FIX_MARKER)) {
        console.log('✅ [Expo Plugin] RCT-Folly fix already present in Podfile');
        return config;
      }

      // The Ruby code to inject - using system() instead of backticks for better escaping
      const follyFixCode = `
  ${FOLLY_FIX_MARKER}
  post_install do |installer|
    # Fix RCT-Folly Time.h typedef redefinition error
    # This changes __IPHONE_10_0 to __IPHONE_12_0 to avoid clockid_t typedef conflict
    folly_time_h = File.join(installer.sandbox.root, 'RCT-Folly', 'folly', 'portability', 'Time.h')
    if File.exist?(folly_time_h)
      folly_time_content = File.read(folly_time_h)
      folly_time_content.gsub!('__IPHONE_10_0', '__IPHONE_12_0')
      File.write(folly_time_h, folly_time_content)
      puts "✅ [EAS] Patched RCT-Folly Time.h to fix typedef redefinition"
    else
      puts "⚠️  [EAS] RCT-Folly Time.h not found at: #{folly_time_h}"
    end

    # Ensure deployment target
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      end
    end
  end`;

      // Check if there's already a post_install block
      const postInstallRegex = /post_install do \|installer\|/;

      if (postInstallRegex.test(podfileContent)) {
        // Insert our fix code right after the existing post_install line
        podfileContent = podfileContent.replace(
          postInstallRegex,
          `post_install do |installer|
    ${FOLLY_FIX_MARKER}
    # Fix RCT-Folly Time.h typedef redefinition error
    folly_time_h = File.join(installer.sandbox.root, 'RCT-Folly', 'folly', 'portability', 'Time.h')
    if File.exist?(folly_time_h)
      folly_time_content = File.read(folly_time_h)
      folly_time_content.gsub!('__IPHONE_10_0', '__IPHONE_12_0')
      File.write(folly_time_h, folly_time_content)
      puts "✅ [EAS] Patched RCT-Folly Time.h to fix typedef redefinition"
    else
      puts "⚠️  [EAS] RCT-Folly Time.h not found at: #\{folly_time_h}"
    end
`
        );
        console.log('✅ [Expo Plugin] Injected RCT-Folly fix into existing post_install hook');
      } else {
        // Append our post_install hook at the end of the Podfile (before the final 'end' if it exists)
        podfileContent += follyFixCode + '\n';
        console.log('✅ [Expo Plugin] Added post_install hook with RCT-Folly fix to Podfile');
      }

      // Write the modified Podfile back
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');

      return config;
    },
  ]);
}

module.exports = withRCTFollyFix;
