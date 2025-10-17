# Lumbus Mobile App

React Native mobile application for Lumbus eSIM service, built with Expo.

## Project Status

✅ **Core app structure completed**

### Completed Features

1. **Project Setup**
   - Expo SDK 54 with TypeScript
   - Expo Router for file-based navigation
   - NativeWind (Tailwind CSS) for styling
   - Supabase authentication and database
   - Stripe React Native for payments
   - React Query for API state management

2. **Authentication**
   - Login screen (`app/(auth)/login.tsx`)
   - Signup screen (`app/(auth)/signup.tsx`)
   - Auto-redirect based on auth state

3. **Main Screens**
   - Browse Plans - View all available eSIM plans with search
   - Plan Detail & Checkout - View plan details and purchase with Stripe
   - Dashboard - View all user orders with real-time updates
   - Account - User profile and settings
   - eSIM Installation - QR code display and manual installation details

4. **Key Features Implemented**
   - QR code generation for eSIM installation
   - Real-time order status updates via Supabase subscriptions
   - Stripe Payment Sheet integration
   - Copy-to-clipboard functionality for manual installation
   - Pull-to-refresh on dashboard
   - Responsive layouts with NativeWind

## Project Structure

```
lumbus-mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx       # Auth layout
│   │   ├── login.tsx          # Login screen
│   │   └── signup.tsx         # Signup screen
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigation layout
│   │   ├── browse.tsx         # Browse plans screen
│   │   ├── dashboard.tsx      # User dashboard
│   │   └── account.tsx        # Account settings
│   ├── plan/
│   │   └── [id].tsx           # Plan detail & checkout
│   ├── install/
│   │   └── [orderId].tsx      # eSIM installation screen
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Entry point with auth check
├── lib/
│   ├── supabase.ts            # Supabase client configuration
│   └── api.ts                 # API helper functions
├── types/
│   └── index.ts               # TypeScript type definitions
├── app.json                   # Expo configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── babel.config.js            # Babel configuration with NativeWind
└── global.css                 # Global styles
```

## Configuration Status

✅ **All core configuration is complete and secured!**

### ✅ Configured & Secured
1. **Environment Variables** - All keys moved to `app.config.ts` with env variable support
2. **Supabase** - Production credentials loaded via `lib/config.ts`
3. **Stripe** - Live publishable key loaded via `lib/config.ts`
4. **API** - Production URL configured securely
5. **Backend** - New mobile checkout endpoint created at `/api/checkout`
6. **Webhooks** - Payment Intent support added to Stripe webhook handler
7. **Authentication** - Required for all purchases and sensitive operations
8. **Gitignore** - `.env` files protected from commits

### 🔐 Security Features
- ✅ No hardcoded keys in source code
- ✅ Authentication required for purchases
- ✅ Row Level Security on all database queries
- ✅ Session persistence with auto-refresh
- ✅ Passwordless signup flow

### ⚠️ Remaining Setup
```bash
# 1. Copy environment example
cp .env.example .env

# 2. Fill in your credentials (optional - defaults work for now)

# 3. Initialize EAS
eas init
# Then update the projectId in app.config.ts
```

For detailed configuration, see [CONFIGURATION.md](./CONFIGURATION.md).
For security details, see [SECURITY.md](./SECURITY.md).

## Running the App

### Prerequisites
- Node.js 20.19.4+ (currently using 18.20.5 - upgrade recommended)
- iOS Simulator (Mac) or Android Emulator
- Expo CLI
- EAS CLI (for builds)

### Development

```bash
# Navigate to the mobile app directory
cd /Users/bakripersonal/lumbus-mobile

# Start the development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

### Building for Production

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure the project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Dependencies

### Core
- `expo` - Expo SDK 54
- `expo-router` - File-based navigation
- `react-native` - React Native framework
- `typescript` - Type safety

### UI & Styling
- `nativewind` - Tailwind CSS for React Native
- `tailwindcss` - Utility-first CSS framework
- `react-native-svg` - SVG support
- `react-native-qrcode-svg` - QR code generation

### Backend & State
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Server state management
- `@react-native-async-storage/async-storage` - Persistent storage

### Payments
- `@stripe/stripe-react-native` - Stripe payment integration

### Utilities
- `expo-clipboard` - Clipboard access
- `expo-sharing` - Share functionality
- `expo-linking` - Deep linking support

## Next Steps

### Priority Tasks
1. **Update Configuration**
   - Add real Stripe publishable key
   - Verify API URL is correct
   - Set up EAS project

2. **Testing**
   - Test authentication flow
   - Test plan browsing and purchase
   - Test eSIM installation flow
   - Test on physical iOS device
   - Test on physical Android device

3. **App Store Preparation**
   - Create app icons and splash screens
   - Add screenshots for App Store/Play Store
   - Write app descriptions
   - Set up privacy policy and terms of service links

4. **Additional Features** (Future)
   - Push notifications for order updates
   - In-app support chat
   - Multi-language support
   - Data usage tracking
   - Referral system

### Known Issues
- Node version warnings (requires Node 20.19.4+, currently using 18.20.5)
- Help & Support, Terms of Service, and Privacy Policy links not yet implemented
- App icons and splash screens need to be created

## API Integration

The app integrates with the following backend endpoints:

- `POST /api/checkout` - Create payment intent and order
- Supabase `plans` table - Fetch available plans
- Supabase `orders` table - Fetch user orders
- Real-time subscriptions for order status updates

## Security Notes

- Supabase credentials are using the public anon key (safe for client-side)
- Stripe publishable key is safe for client-side use
- All sensitive operations are handled server-side
- User authentication is managed by Supabase Auth

## Support

For issues or questions:
- Check the main Lumbus repository documentation
- Review Expo documentation: https://docs.expo.dev/
- Review Stripe React Native docs: https://stripe.com/docs/mobile/react-native

## License

Copyright © 2025 Lumbus
