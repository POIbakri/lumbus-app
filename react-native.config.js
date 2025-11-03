module.exports = {
  dependencies: {
    '@stripe/stripe-react-native': {
      platforms: { ios: null },
    },
    'react-native-iap': {
      platforms: { android: null }, // iOS only - Android uses Stripe
    },
  },
};


