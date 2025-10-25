#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# Runs before npm install for all platforms

set -e

# ========================================
# 1. Create google-services.json from secret
# ========================================
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "🔧 [EAS Hook] Creating google-services.json from secret..."
  echo "$GOOGLE_SERVICES_JSON" > ./google-services.json
  echo "✅ [EAS Hook] google-services.json created"
else
  echo "⚠️  [EAS Hook] Warning: GOOGLE_SERVICES_JSON secret not found"
fi

# ========================================
# 2. Android: Add REACT_NATIVE_IAP_STORE property
# ========================================
if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  echo "🔧 [EAS Hook] Adding REACT_NATIVE_IAP_STORE=play to gradle.properties..."

  GRADLE_PROPS="android/gradle.properties"

  if [ ! -f "$GRADLE_PROPS" ]; then
    echo "❌ [EAS Hook] gradle.properties not found at $GRADLE_PROPS"
    exit 1
  fi

  # Check if property already exists
  if grep -q "^REACT_NATIVE_IAP_STORE=" "$GRADLE_PROPS"; then
    echo "✅ [EAS Hook] REACT_NATIVE_IAP_STORE already set in gradle.properties"
  else
    echo "" >> "$GRADLE_PROPS"
    echo "# React Native IAP - Play Store variant (injected by EAS hook)" >> "$GRADLE_PROPS"
    echo "REACT_NATIVE_IAP_STORE=play" >> "$GRADLE_PROPS"
    echo "✅ [EAS Hook] Added REACT_NATIVE_IAP_STORE=play to gradle.properties"
  fi

  cat "$GRADLE_PROPS" | grep "REACT_NATIVE_IAP_STORE"
fi
