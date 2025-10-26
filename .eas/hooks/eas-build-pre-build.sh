#!/usr/bin/env bash

# EAS Build Pre-Build Hook
# Runs after expo prebuild (which includes pod install) but before xcodebuild

set -e

if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "🔧 [EAS Pre-Build] Running RCT-Folly Time.h patch..."

  # Run the Ruby script to patch Time.h
  ruby scripts/patch-rct-folly.rb

  echo "✅ [EAS Pre-Build] Pre-build hook completed"
fi


