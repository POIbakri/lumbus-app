#!/usr/bin/env bash

# This hook runs when prebuild completes successfully
# We'll use it to patch the generated Podfile

set -e

if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "✅ [EAS Hook] Build succeeded!"
fi
