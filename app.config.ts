import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lumbus',
  slug: 'lumbus-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'lumbus',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lumbus.app',
    infoPlist: {
      NSCameraUsageDescription: 'This app requires camera access to scan QR codes for eSIM installation.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.lumbus.app',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.CAMERA'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.lumbus.app',
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'your-project-id-here',
    },
    // Environment variables - these are safe to expose in the app
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qflokprwpxeynodcndbc.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbG9rcHJ3cHhleW5vZGNuZGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQ1MDMsImV4cCI6MjA3NjE3MDUwM30.ef9h1oSJ7eYizwPrMfeXGi57j5FKjsnBol2ww2EzpXg',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SIpVDHqtxSfzV1toTSKPTl35biMGkzD0PoqUwTZg2hKWAOWSWNQpfQkZuZvDA8i0fsTegIi6pHXNrstIkn625FL00AYqdFng2',
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://getlumbus.com/api',
  },
});
