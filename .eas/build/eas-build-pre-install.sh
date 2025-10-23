#!/usr/bin/env bash

set -euo pipefail

# Copy google-services.json from EAS Secret to project root
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "Copying google-services.json from EAS Secret..."
  echo "$GOOGLE_SERVICES_JSON" > ./google-services.json
  echo "google-services.json has been created"
else
  echo "Warning: GOOGLE_SERVICES_JSON secret not found"
fi
