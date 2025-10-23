#!/usr/bin/env bash

# EAS Build Hook: Fix react-native-iap product flavor ambiguity
# This hook patches android/app/build.gradle to add the "play" product flavor

set -e

echo "🔧 [EAS Hook] Patching Android build.gradle for react-native-iap..."

BUILD_GRADLE_PATH="android/app/build.gradle"

if [ ! -f "$BUILD_GRADLE_PATH" ]; then
  echo "❌ [EAS Hook] build.gradle not found at $BUILD_GRADLE_PATH"
  exit 1
fi

# Check if flavorDimensions already exists
if grep -q 'flavorDimensions.*"store"' "$BUILD_GRADLE_PATH"; then
  echo "✅ [EAS Hook] Product flavors already configured, skipping patch"
  exit 0
fi

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
