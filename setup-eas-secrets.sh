#!/bin/bash

# EAS Environment Variables Setup Script for Lumbus Mobile
# This script creates all necessary environment variables for EAS builds

echo "Setting up EAS environment variables..."

# Supabase URL
eas env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://qflokprwpxeynodcndbc.supabase.co" \
  --type string \
  --visibility plaintext

# Supabase Anon Key (sensitive)
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbG9rcHJ3cHhleW5vZGNuZGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQ1MDMsImV4cCI6MjA3NjE3MDUwM30.ef9h1oSJ7eYizwPrMfeXGi57j5FKjsnBol2ww2EzpXg" \
  --type string \
  --visibility secret

# Stripe Publishable Key
eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY \
  --value "pk_live_51SIpVDHqtxSfzV1toTSKPTl35biMGkzD0PoqUwTZg2hKWAOWSWNQpfQkZuZvDA8i0fsTegIi6pHXNrstIkn625FL00AYqdFng2" \
  --type string \
  --visibility plaintext

# API URL
eas env:create --name EXPO_PUBLIC_API_URL \
  --value "https://getlumbus.com/api" \
  --type string \
  --visibility plaintext

echo "✅ Environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. If you have google-services.json, run:"
echo "   eas env:create --name GOOGLE_SERVICES_JSON --value \"\$(cat path/to/google-services.json)\" --type file --visibility secret"
echo ""
echo "2. View all secrets with: eas env:list"
