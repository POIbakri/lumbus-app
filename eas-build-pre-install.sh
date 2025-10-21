#!/usr/bin/env bash

# This script runs before npm install on EAS Build
# It creates google-services.json from the environment variable

set -e

# Try both possible variable names (GOOGLE_SERVICES_JSON is what we uploaded)
if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Creating google-services.json from GOOGLE_SERVICES_JSON environment variable..."
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
  echo "google-services.json created successfully"
else
  echo "Warning: GOOGLE_SERVICES_JSON environment variable not set"
  echo "Build will continue but push notifications may not work"
fi
