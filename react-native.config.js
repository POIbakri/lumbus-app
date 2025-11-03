module.exports = {
  dependencies: {
    '@stripe/stripe-react-native': {
      platforms: { ios: null },
    },
    'react-native-iap': {
      platforms: { android: null }, // iOS only - Android uses Stripe
    },
    'react-native-worklets': {
      platforms: { ios: null, android: null }, // Babel only, no native code
    },
  },
};


