#!/bin/bash

# Build Configuration Validation Script
# This script validates that all required files and configurations are correct before building

set -e

echo "🔍 Validating build configuration..."
echo ""

ERRORS=0
WARNINGS=0

# Function to report errors
error() {
    echo "❌ ERROR: $1"
    ERRORS=$((ERRORS + 1))
}

# Function to report warnings
warn() {
    echo "⚠️  WARNING: $1"
    WARNINGS=$((WARNINGS + 1))
}

# Function to report success
success() {
    echo "✅ $1"
}

# Check for uncommitted changes (critical for EAS builds)
if [ -d .git ]; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        error "You have uncommitted changes in your working directory"
        echo "   EAS remote builds only use committed code. Please commit and push before building."
        echo ""
        echo "   Modified files:"
        git status --short | sed 's/^/   /'
        echo ""
    else
        success "Working directory is clean (all changes committed)"
    fi
else
    warn "Not a git repository - skipping git check"
fi
echo ""

# Check if .env exists
if [ -f .env ]; then
    success ".env file exists"

    # Load and validate environment variables
    source .env

    REQUIRED_VARS=(
        "EXPO_PUBLIC_SUPABASE_URL"
        "EXPO_PUBLIC_SUPABASE_ANON_KEY"
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        "EXPO_PUBLIC_API_URL"
        "EXPO_PUBLIC_PROJECT_ID"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            error "$var is not set in .env"
        else
            success "$var is set"
        fi
    done
else
    error ".env file not found"
fi

# Check if eas.json exists and has correct structure
if [ -f eas.json ]; then
    success "eas.json exists"

    # Check if all build profiles exist
    for profile in development preview production; do
        if grep -q "\"$profile\"" eas.json; then
            success "Build profile '$profile' exists"
        fi
    done
else
    error "eas.json not found"
fi

# Check EAS environment variables for preview profile (default build target)
echo ""
echo "Checking EAS environment variables for 'preview' profile..."
if command -v eas &> /dev/null; then
    # Check if we can run eas env:list
    if eas env:list --environment preview &> /dev/null; then
        EAS_ENV_OUTPUT=$(eas env:list --environment preview 2>&1)

        for var in "${REQUIRED_VARS[@]}"; do
            if echo "$EAS_ENV_OUTPUT" | grep -q "$var"; then
                success "EAS preview environment has $var"
            else
                warn "EAS preview environment missing $var - run './setup-eas-secrets.sh'"
            fi
        done
    else
        warn "Unable to check EAS environment variables (not logged in or no network)"
    fi
else
    warn "EAS CLI not found - skipping EAS environment check"
fi
echo ""

# Check if app.config.ts exists
if [ -f app.config.ts ]; then
    success "app.config.ts exists"

    # Check if it references environment variables
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" app.config.ts; then
        success "app.config.ts references EXPO_PUBLIC_SUPABASE_URL"
    else
        warn "app.config.ts doesn't reference EXPO_PUBLIC_SUPABASE_URL"
    fi
else
    error "app.config.ts not found"
fi

# Check if package.json has post-install hook
if [ -f package.json ]; then
    success "package.json exists"

    if grep -q "eas-build-post-install" package.json; then
        success "package.json has eas-build-post-install script"
    else
        warn "package.json missing eas-build-post-install script"
    fi
else
    error "package.json not found"
fi

# Check if RCT-Folly fix plugin exists
if [ -f plugins/withRCTFollyFix.js ]; then
    success "RCT-Folly fix plugin exists"
else
    error "plugins/withRCTFollyFix.js not found"
fi

# Check if post-install script exists
if [ -f scripts/eas-build-post-install.js ]; then
    success "EAS post-install script exists"
else
    error "scripts/eas-build-post-install.js not found"
fi

# Check if .gitignore properly excludes .env
if [ -f .gitignore ]; then
    if grep -q "^\.env$" .gitignore; then
        success ".env is properly gitignored"
    else
        error ".env is not in .gitignore - SECURITY RISK!"
    fi
else
    warn ".gitignore not found"
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    success "node_modules directory exists"
else
    warn "node_modules not found - run 'npm install' first"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "Please fix the errors before building."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)"
    echo ""
    echo "You can proceed with the build, but consider fixing the warnings."
    exit 0
else
    echo "✅ All validations passed!"
    echo ""
    echo "You're ready to build. Run one of the following commands:"
    echo ""
    echo "  # Setup EAS secrets (first time only):"
    echo "  ./setup-eas-secrets.sh"
    echo ""
    echo "  # Build for iOS preview:"
    echo "  EXPO_NO_CAPABILITY_SYNC=1 npx --package=node@20 --yes eas build --platform ios --profile preview --clear-cache"
    echo ""
    echo "  # Build for Android preview:"
    echo "  npx --package=node@20 --yes eas build --platform android --profile preview --clear-cache"
    echo ""
    exit 0
fi
