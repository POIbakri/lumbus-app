#!/usr/bin/env bash

# EAS Build Post-Install Hook
# Runs after npm install for all platforms

set -e

# ========================================
# iOS: Clean CocoaPods cache and DerivedData
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "🧹 [EAS Hook] Cleaning iOS build artifacts..."

  # Clean any existing Pods and lock files
  rm -rf ios/Pods
  rm -f ios/Podfile.lock

  echo "✅ [EAS Hook] Cleaned iOS build environment"
fi

# ========================================
# ANDROID: Fix react-native-iap product flavor ambiguity
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  echo "🔧 [EAS Hook] Patching Android build.gradle for react-native-iap..."

  BUILD_GRADLE_PATH="android/app/build.gradle"

  if [ ! -f "$BUILD_GRADLE_PATH" ]; then
    echo "❌ [EAS Hook] build.gradle not found at $BUILD_GRADLE_PATH"
    exit 1
  fi

  # Check if flavorDimensions already exists
  if grep -q 'flavorDimensions.*"store"' "$BUILD_GRADLE_PATH"; then
    echo "✅ [EAS Hook] Product flavors already configured, skipping patch"
  else
    # Find the line with 'defaultConfig {' and insert flavor configuration after its closing brace
    awk '
    /^[[:space:]]*defaultConfig[[:space:]]*{/ { in_block=1 }
    in_block && /^[[:space:]]*}/ {
      print
      print ""
      print "    // Product flavors for react-native-iap (injected by EAS hook)"
      print "    flavorDimensions \"store\""
      print "    productFlavors {"
      print "        play {"
      print "            dimension \"store\""
      print "        }"
      print "    }"
      in_block=0
      next
    }
    { print }
    ' "$BUILD_GRADLE_PATH" > "$BUILD_GRADLE_PATH.tmp"

    mv "$BUILD_GRADLE_PATH.tmp" "$BUILD_GRADLE_PATH"

    echo "✅ [EAS Hook] Successfully patched build.gradle with play product flavor"

    # Verify the patch
    if grep -q 'flavorDimensions.*"store"' "$BUILD_GRADLE_PATH"; then
      echo "✅ [EAS Hook] Verification passed: flavorDimensions found in build.gradle"
    else
      echo "❌ [EAS Hook] Verification failed: flavorDimensions not found after patch"
      exit 1
    fi
  fi
fi

# ========================================
# iOS: Patch Podfile to fix RCT-Folly typedef issue
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "🔧 [EAS Hook] Patching iOS Podfile to fix RCT-Folly typedef issue..."

  PODFILE_PATH="ios/Podfile"

  if [ ! -f "$PODFILE_PATH" ]; then
    echo "⚠️  [EAS Hook] Podfile not found yet, will be generated during prebuild"
  else
    echo "✅ [EAS Hook] Found Podfile, adding post_install hook..."

    # Check if our fix is already present
    if grep -q "# EAS_FOLLY_FIX" "$PODFILE_PATH"; then
      echo "✅ [EAS Hook] Folly fix already present in Podfile"
    else
      # Add post_install hook at the end of the Podfile
      cat >> "$PODFILE_PATH" <<'PODFILE_PATCH'

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

      # Set deployment target to 15.1
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
    end
  end
end
PODFILE_PATCH

      echo "✅ [EAS Hook] Added post_install hook to Podfile with Folly preprocessor flags"
    fi
  fi
fi
