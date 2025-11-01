import { ExpoConfig, ConfigContext } from 'expo/config';
import * as fs from 'fs';
import * as path from 'path';

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleServicesPath = path.join(__dirname, 'google-services.json');
  const hasGoogleServices = fs.existsSync(googleServicesPath);
  const isAndroidBuild = process.env.EAS_BUILD_PLATFORM === 'android' || process.env.EXPO_OS === 'android';

  // Build plugins list with conditional Stripe plugin for Android only
  const plugins: any[] = [
    'expo-router',
    'expo-font',
    'expo-web-browser',
  ];
  if (isAndroidBuild) {
    plugins.push([
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.lumbus.app',
      },
    ]);
    plugins.push([
      'expo-notifications',
      {
        icon: './assets/iconlogofavicon/android-chrome-192x192.png',
        color: '#2EFECC',
        mode: 'production',
      },
    ]);
  }

  // Force new build v1.0.8 - with Stripe key safety fix to prevent nil crash
  return {
    ...config,
    name: 'Lumbus',
    slug: 'lumbus',
    owner: 'lumbus',
    version: '1.0.9',
    orientation: 'portrait',
    icon: './assets/iconlogotrans.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: 'lumbus',
    description: 'Get instant eSIM data plans for travel. Stay connected worldwide with affordable mobile data. No physical SIM card needed - activate eSIM in minutes.',
    splash: {
      image: './assets/logotrans.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lumbus.app',
      associatedDomains: ['applinks:getlumbus.com'],
      usesAppleSignIn: true,
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSCameraUsageDescription: 'This app requires camera access to scan QR codes for eSIM installation.',
        ITSAppUsesNonExemptEncryption: false,
      },
      buildNumber: '9',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/iconlogotrans.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.lumbus.app',
      versionCode: 9,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.CAMERA', 'android.permission.POST_NOTIFICATIONS'],
      ...(hasGoogleServices && { googleServicesFile: './google-services.json' }),
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.lumbus.app',
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
      ...plugins,
      [
        'expo-build-properties',
        {
          android: {
            newArchEnabled: true,
            extraMavenRepos: [
              '$rootDir/../node_modules/react-native/android',
            ],
          },
          ios: {
            newArchEnabled: false,
            useFrameworks: 'static',
            buildReactNativeFromSource: true,
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'react-native-iap',
        {
          ios: {
            'with-folly-no-coroutines': true,
          },
        },
      ],
      // Ensure our Folly patch runs in Pod install via post_install hook
      './plugins/withRCTFollyFix',
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'b38159ea-bd8e-4aca-92dc-5aecadc110b9',
      },
    },
  };
};
