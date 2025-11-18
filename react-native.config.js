module.exports = {
  dependencies: {
    '@stripe/stripe-react-native': {
      // Allow Stripe on both iOS and Android:
      // - iOS: Apple Pay + cards via Stripe Payment Sheet
      // - Android: Google Pay + cards via Stripe Payment Sheet
    },
    'react-native-iap': {
      platforms: { android: null }, // iOS only - Android uses Stripe
    },
    'react-native-worklets': {
      platforms: { ios: null, android: null }, // Babel only, no native code
    },
  },
};


