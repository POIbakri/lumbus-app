#!/usr/bin/env bash

# EAS Build Post-Install Hook
# Runs after npm install for all platforms

set -e

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
# iOS: Fix RCT-Folly typedef redefinition error
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "🔧 [EAS Hook] Applying RCT-Folly iOS typedef fix..."

  # Path to the RCT-Folly Time.h file in the iOS Pods directory
  FOLLY_TIME_H="ios/Pods/RCT-Folly/folly/portability/Time.h"

  # Check if the file exists (it should after pod install)
  if [ -f "$FOLLY_TIME_H" ]; then
    echo "✅ [EAS Hook] Found RCT-Folly Time.h at $FOLLY_TIME_H"

    # Fix the typedef redefinition by changing the iOS version check
    # This changes __IPHONE_10_0 to __IPHONE_12_0 to avoid the clockid_t conflict
    sed -i.bak 's/__IPHONE_10_0/__IPHONE_12_0/g' "$FOLLY_TIME_H"

    echo "✅ [EAS Hook] RCT-Folly typedef fix applied successfully"
  else
    echo "⚠️  [EAS Hook] Warning: RCT-Folly Time.h not found at $FOLLY_TIME_H"
    echo "This is expected if pods haven't been installed yet"
  fi
fi
