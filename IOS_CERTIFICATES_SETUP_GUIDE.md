# iOS Certificates & Provisioning Setup Guide

## Current Status

### ✅ Completed
- Created certificates in Apple Developer portal
  - Distribution Certificate
  - Development Certificate

### ⏳ Still Need to Do
- Create Provisioning Profiles
- Link certificates to EAS Build
- Test iOS build

---

## What Are These Things?

### 1. Certificates
Think of these as your "developer ID cards" that prove you're allowed to sign iOS apps.

- **Development Certificate**: For testing on your own devices
- **Distribution Certificate**: For TestFlight and App Store

**Status**: ✅ You created these already in Apple Developer portal

### 2. Provisioning Profiles
These link together:
- Your certificates (the ID cards)
- Your App ID (com.lumbus.app)
- Allowed devices (for development) OR App Store distribution

**Status**: ❌ Still need to create these

### 3. App ID
Your unique app identifier: `com.lumbus.app`

**Status**: ✅ Already configured in app.config.ts

---

## Two Options to Complete Setup

### Option A: Let EAS Do It Automatically (RECOMMENDED)

This is the easiest way. EAS will:
1. Detect you have certificates
2. Automatically create provisioning profiles
3. Link everything together

**Command:**
```bash
eas build --platform ios --profile preview
```

During the build, EAS will ask if you want it to create provisioning profiles. Say YES.

### Option B: Manual Setup (Advanced)

1. Go to Apple Developer portal
2. Navigate to Certificates, Identifiers & Profiles > Profiles
3. Create new profiles:
   - **iOS App Development** profile (for testing)
   - **App Store** profile (for distribution)
4. Upload to EAS:
   ```bash
   eas credentials
   ```

---

## Next Steps (Recommended Path)

### Step 1: Run First Build
```bash
eas build --platform ios --profile preview
```

**What will happen:**
- EAS will check for certificates ✅ (you have these)
- EAS will check for provisioning profiles ❌ (will create these)
- EAS will ask permission to create profiles automatically
- Build will start (takes ~10-15 minutes)

### Step 2: Verify Setup
After build completes:
```bash
eas credentials -p ios
```

This shows all your iOS credentials are properly set up.

### Step 3: Build for Production
When ready for TestFlight/App Store:
```bash
eas build --platform ios --profile production
```

---

## Important Info

### Your App Details
- **Bundle ID**: com.lumbus.app
- **EAS Project ID**: b38159ea-bd8e-4aca-92dc-5aecadc110b9
- **Owner**: lumbus

### Build Profiles (from eas.json)
- **development**: For development builds with dev client
- **preview**: For internal testing (AdHoc or TestFlight)
- **production**: For App Store submission

### Apple Developer Account Needed
Make sure you have:
- Apple Developer Program membership ($99/year)
- Access to Apple Developer portal
- Admin access to your team

---

## Troubleshooting

### "No valid provisioning profile found"
→ Run the build command, EAS will create profiles automatically

### "Certificate not found"
→ You may need to upload your certificates to EAS:
```bash
eas credentials -p ios
```

### "Bundle identifier mismatch"
→ Make sure com.lumbus.app matches in:
- Apple Developer portal
- app.config.ts (bundleIdentifier)
- Provisioning profiles

---

## What Happens Behind the Scenes

1. **You create certificates** ✅ DONE
   - These are like your signature

2. **You create provisioning profiles** ⏳ NEXT STEP
   - These say "this signature can sign this app"

3. **EAS uses both to build your app**
   - Signs the .ipa file with your certificate
   - Embeds the provisioning profile
   - Makes it installable on devices or App Store

4. **Result**: A properly signed iOS app

---

## Ready to Proceed?

Run this command when ready:
```bash
eas build --platform ios --profile preview
```

Or if you want to see current credentials first:
```bash
eas credentials -p ios
```
(This will prompt you interactively - just explore, don't change anything yet)
