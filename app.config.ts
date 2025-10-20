import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lumbus',
  slug: 'lumbus-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/iconlogo.jpg',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'lumbus',
  splash: {
    image: './assets/logo.jpg',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lumbus.app',
    associatedDomains: ['applinks:getlumbus.com'],
    infoPlist: {
      NSCameraUsageDescription: 'This app requires camera access to scan QR codes for eSIM installation.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/iconlogo.jpg',
      backgroundColor: '#ffffff',
    },
    package: 'com.lumbus.app',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.CAMERA', 'android.permission.POST_NOTIFICATIONS'],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'getlumbus.com',
            pathPrefix: '/dashboard',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/iconlogofavicon/favicon.ico',
  },
  plugins: [
    'expo-router',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.lumbus.app',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/iconlogofavicon/android-chrome-192x192.png',
        color: '#2EFECC',
        sounds: ['./assets/notification-sound.wav'],
        mode: 'production',
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'local-dev',
    },
    // Environment variables - these MUST be set in .env file
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
