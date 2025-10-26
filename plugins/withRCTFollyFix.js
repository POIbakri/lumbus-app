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
 * but newer iOS SDKs (iOS 15.1+) define it as an enum, causing a typedef redefinition error.
 *
 * Solution: Change the iOS version check from __IPHONE_10_0 to __IPHONE_12_0
 * to avoid the conflicting typedef definition.
 */

const FOLLY_FIX_MARKER = '# LUMBUS_RCT_FOLLY_FIX';

function withRCTFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        console.log('⚠️  [RCT-Folly Fix] Podfile not found, skipping...');
        return config;
      }

      // Read the Podfile
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Ensure iOS RN New Architecture is disabled to avoid Stripe NewArch compile issues
      const NEW_ARCH_MARKER = '# LUMBUS_DISABLE_RN_NEW_ARCH_IOS';
      const hasNewArchLine = podfileContent.includes("ENV['RCT_NEW_ARCH_ENABLED']") || podfileContent.includes('ENV["RCT_NEW_ARCH_ENABLED"]');
      const desiredNewArchLineSingle = "ENV['RCT_NEW_ARCH_ENABLED'] = '0'";
      const desiredNewArchLineDouble = 'ENV["RCT_NEW_ARCH_ENABLED"] = "0"';

      if (hasNewArchLine) {
        const updated = podfileContent
          .replace(/ENV\['RCT_NEW_ARCH_ENABLED'\]\s*=\s*['\"]\d['\"]/g, `${desiredNewArchLineSingle} ${NEW_ARCH_MARKER}`)
          .replace(/ENV\[\"RCT_NEW_ARCH_ENABLED\"\]\s*=\s*["']\d["']/g, `${desiredNewArchLineDouble} ${NEW_ARCH_MARKER}`);
        podfileContent = updated;
      } else if (!podfileContent.includes(NEW_ARCH_MARKER)) {
        // Prepend the setting at the top of the Podfile
        podfileContent = `${NEW_ARCH_MARKER}\n${desiredNewArchLineSingle}\n` + podfileContent;
      }

      // If our marker already exists (from a previous build), normalize any bad quoting
      // from earlier injections so Ruby doesn't choke on the Podfile.
      if (podfileContent.includes(FOLLY_FIX_MARKER)) {
        let changed = false;
        // Replace any previous system("ruby ...") invocation with a safe argv form: system('ruby', script_path)
        const safePodfile = podfileContent.replace(/system\(\s*\"ruby[^)]*\)/g, 'system("ruby", script_path)');
        if (safePodfile !== podfileContent) {
          podfileContent = safePodfile;
          changed = true;
        }
        // Ensure our Stripe NewArch cleanup exists; if not, append it right after the marker
        const stripeMarker = "[Stripe NewArch] Removed";
        if (!podfileContent.includes(stripeMarker)) {
          const ensureStripeCleanup = `\n    # Ensure Stripe New Arch sources are removed (idempotent)\n    begin\n      removed = 0\n      installer.pods_project.targets.each do |t|\n        next unless t.name == 'stripe-react-native'\n        phase = t.respond_to?(:sources_build_phase) ? t.sources_build_phase : nil\n        next unless phase\n        phase.files.to_a.each do |bf|\n          ref = bf.respond_to?(:file_ref) ? bf.file_ref : nil\n          next unless ref && ref.path\n          if ref.path.include?('/NewArch/') || ref.path.include?('StripeNewArch')\n            bf.remove_from_project\n            removed += 1\n          end\n        end\n      end\n      puts "✅ [Stripe NewArch] Removed #{removed} NewArch files from compile phase"\n    rescue => e\n      puts "⚠️  [Stripe NewArch] Cleanup skipped: #{e}"\n    end\n`;
          podfileContent = podfileContent.replace(FOLLY_FIX_MARKER, `${FOLLY_FIX_MARKER}\n${ensureStripeCleanup}`);
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(podfilePath, podfileContent, 'utf8');
          console.log('✅ [RCT-Folly Fix] Updated existing Podfile injection with safe calls and Stripe cleanup');
        } else {
          console.log('ℹ️  [RCT-Folly Fix] Existing Podfile injection already complete');
        }
        return config;
      }

      // The Ruby code to inject into the post_install hook
      // Minimal, parser-safe form; no else/rescue to avoid syntax ambiguity
      // Delegates patching to scripts/patch-rct-folly.rb (idempotent)
      const follyFixCode = `
    ${FOLLY_FIX_MARKER}
    scripts_dir = File.expand_path('../scripts', __dir__)
    script_path = File.join(scripts_dir, 'patch-rct-folly.rb')
    system('ruby', script_path) if File.exist?(script_path)

    # Remove Stripe New Architecture sources to avoid FollyConvert.h include errors
    begin
      removed = 0
      installer.pods_project.targets.each do |t|
        next unless t.name =~ /stripe[-_ ]react[-_ ]native/i
        # Exclude NewArch source files via build settings (most reliable)
        t.build_configurations.each do |config|
          patterns = ['**/NewArch/*', '**/StripeNewArch*']
          existing = config.build_settings['EXCLUDED_SOURCE_FILE_NAMES']
          if existing.is_a?(Array)
            config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = (existing + patterns).uniq
          elsif existing.is_a?(String)
            config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = (existing.split(/\s+/) + patterns).uniq.join(' ')
          else
            config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = patterns
          end
        end
        # Best-effort removal from build phases
        phase = t.respond_to?(:sources_build_phase) ? t.sources_build_phase : nil
        if phase
          phase.files.to_a.each do |bf|
            ref = bf.respond_to?(:file_ref) ? bf.file_ref : nil
            next unless ref && ref.path
            if ref.path.include?('/NewArch/') || ref.path.include?('StripeNewArch')
              bf.remove_from_project
              removed += 1
            end
          end
        end
      end
      puts "✅ [Stripe NewArch] Excluded NewArch sources; removed #{removed} from compile phase"
    rescue => e
      puts "⚠️  [Stripe NewArch] Cleanup skipped: #{e}"
    end
`;

      // Check if there's already a post_install block
      const postInstallRegex = /post_install do \|installer\|/;

      if (postInstallRegex.test(podfileContent)) {
        // Insert our fix code right after the existing post_install line
        podfileContent = podfileContent.replace(
          postInstallRegex,
          `post_install do |installer|${follyFixCode}`
        );
        console.log('✅ [RCT-Folly Fix] Injected into existing post_install hook');
      } else {
        // Create a new post_install hook at the end of the Podfile
        const newPostInstallHook = `

post_install do |installer|${follyFixCode}
end
`;
        podfileContent += newPostInstallHook;
        console.log('✅ [RCT-Folly Fix] Added new post_install hook to Podfile');
      }

      // Write the modified Podfile back
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');
      console.log('✅ [RCT-Folly Fix] Podfile updated successfully');

      return config;
    },
  ]);
}

module.exports = withRCTFollyFix;
