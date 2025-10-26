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
# ANDROID: Fix react-native-iap product flavor ambiguity (DISABLED by default)
# To enable, set ENABLE_ANDROID_GRADLE_PATCH=1 in the env
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "android" ] && [ "$ENABLE_ANDROID_GRADLE_PATCH" = "1" ]; then
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
else
  if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
    echo "⏭️  [EAS Hook] Skipping Android build.gradle patch (disabled)"
  fi
fi
