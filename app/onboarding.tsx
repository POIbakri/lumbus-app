import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  primary: '#2EFECC',
  cyan: '#87EFFF',
  purple: '#F7E2FB',
  yellow: '#FDFD74',
  mint: '#E0FEF7',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#666666',
};

interface OnboardingScreen {
  stepNumber: number;
  stepBadge: {
    backgroundColor: string;
    number: string;
  };
  emoji: string;
  title: string;
  description: string;
  features: Array<{ icon: string; text: string }>;
  exampleCard?: any;
}

const screens: OnboardingScreen[] = [
  {
    stepNumber: 0,
    stepBadge: {
      backgroundColor: COLORS.yellow, // No badge displayed, just for reference
      number: '0',
    },
    emoji: '🌍',
    title: 'WELCOME TO LUMBUS',
    description: 'Stay connected anywhere in the world with instant eSIM activation. No physical SIM cards, no hassle.',
    features: [
      { icon: '✓', text: 'Instant eSIM delivery' },
      { icon: '✓', text: 'Coverage in 150+ countries' },
      { icon: '✓', text: 'Connect in under 5 minutes' },
    ],
  },
  {
    stepNumber: 1,
    stepBadge: {
      backgroundColor: COLORS.yellow,
      number: '1',
    },
    emoji: '🗺️',
    title: 'CHOOSE YOUR PLAN',
    description: 'Select the perfect data plan for your destination. We offer plans for 150+ countries with flexible data options and durations.',
    features: [
      { icon: '✓', text: 'Pick your destination' },
      { icon: '✓', text: 'Choose data amount (1GB - 20GB)' },
      { icon: '✓', text: 'Select validity period (7-30 days)' },
    ],
    exampleCard: {
      backgroundColor: COLORS.yellow,
      title: 'Japan 5GB - 30 Days',
      price: '$19.99',
      details: [
        { label: 'Data:', value: '5 GB' },
        { label: 'Valid for:', value: '30 days' },
        { label: 'Coverage:', value: '4G/5G' },
      ],
    },
  },
  {
    stepNumber: 2,
    stepBadge: {
      backgroundColor: COLORS.purple,
      number: '2',
    },
    emoji: '💳',
    title: 'PAY INSTANTLY',
    description: 'Complete your purchase with Apple Pay, Google Pay, or any major credit card. Secure checkout powered by Stripe.',
    features: [
      { icon: '✓', text: 'Apple Pay & Google Pay supported' },
      { icon: '✓', text: 'All major credit cards accepted' },
      { icon: '✓', text: 'Secure encrypted payment' },
    ],
    exampleCard: {
      backgroundColor: COLORS.purple,
      paymentMethods: [
        { type: 'apple', icon: '📱', label: 'Apple Pay' },
        { type: 'google', icon: 'G', label: 'Google Pay' },
        { type: 'card', label: '•••• •••• •••• 4242' },
      ],
    },
  },
  {
    stepNumber: 3,
    stepBadge: {
      backgroundColor: COLORS.cyan,
      number: '3',
    },
    emoji: '🌐',
    title: 'GET CONNECTED',
    description: 'Receive your eSIM instantly. Activate it by scanning the QR code or using the one-tap installation on iOS 17.4+.',
    features: [
      { icon: '✓', text: 'Instant eSIM delivery' },
      { icon: '✓', text: 'QR code or one-tap activation' },
      { icon: '✓', text: 'Online in less than 5 minutes' },
    ],
    exampleCard: {
      backgroundColor: COLORS.cyan,
      icon: '📲',
      title: 'YOUR eSIM IS READY!',
      subtitle: 'Scan QR code or tap to install',
    },
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
    } else {
      // Navigate to login screen
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {screens.map((screen, index) => {
          if (index !== currentIndex) return null;

          return (
            <View
              key={index}
              style={styles.screenContainer}
            >
              {/* Emoji - larger for first screen */}
              <Text style={[styles.emoji, screen.stepNumber === 0 && styles.emojiLarge]}>{screen.emoji}</Text>

              {/* Title */}
              <Text style={styles.title}>{screen.title}</Text>

              {/* Description */}
              <Text style={styles.description}>{screen.description}</Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {screen.features.map((feature, idx) => (
                  <View key={idx} style={[
                    styles.featureRow,
                    screen.stepNumber === 0 && styles.featureRowColored
                  ]}>
                    <View style={screen.stepNumber === 0 ? styles.featureIconBadge : null}>
                      <Text style={[
                        styles.featureIcon,
                        screen.stepNumber === 0 && styles.featureIconColored
                      ]}>{feature.icon}</Text>
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              {/* Example Card */}
              {screen.exampleCard && (
                <View style={styles.exampleCardContainer}>
                  {/* Plan Card (Screen 1) */}
                  {screen.stepNumber === 1 && (
                    <View
                      style={[
                        styles.planCard,
                        { backgroundColor: screen.exampleCard.backgroundColor },
                      ]}
                    >
                      <Text style={styles.planCardTitle}>
                        {screen.exampleCard.title}
                      </Text>
                      <Text style={styles.planCardPrice}>
                        {screen.exampleCard.price}
                      </Text>
                      <View style={styles.planCardDivider} />
                      {screen.exampleCard.details.map((detail: any, idx: number) => (
                        <View key={idx} style={styles.planDetailRow}>
                          <Text style={styles.planDetailLabel}>{detail.label}</Text>
                          <Text style={styles.planDetailValue}>{detail.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Payment Card (Screen 2) */}
                  {screen.stepNumber === 2 && (
                    <View
                      style={[
                        styles.paymentCard,
                        { backgroundColor: screen.exampleCard.backgroundColor },
                      ]}
                    >
                      {screen.exampleCard.paymentMethods.map((method: any, idx: number) => (
                        <View key={idx} style={styles.paymentMethodRow}>
                          <Text style={styles.paymentIcon}>{method.icon}</Text>
                          <Text style={styles.paymentLabel}>{method.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Ready Card (Screen 3) */}
                  {screen.stepNumber === 3 && (
                    <View
                      style={[
                        styles.readyCard,
                        { backgroundColor: screen.exampleCard.backgroundColor },
                      ]}
                    >
                      <Text style={styles.readyIcon}>{screen.exampleCard.icon}</Text>
                      <Text style={styles.readyTitle}>{screen.exampleCard.title}</Text>
                      <Text style={styles.readySubtitle}>{screen.exampleCard.subtitle}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? COLORS.primary : '#E5E5E5',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>
          {currentIndex === screens.length - 1 ? 'GET STARTED' : 'NEXT'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  screenContainer: {
    alignItems: 'center',
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.black,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  emojiLarge: {
    fontSize: 96,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureRowColored: {
    backgroundColor: COLORS.yellow,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  featureIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 18,
    color: COLORS.primary,
    marginRight: 12,
    fontWeight: '900',
  },
  featureIconColored: {
    fontSize: 16,
    color: COLORS.yellow,
    marginRight: 0,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
  },
  exampleCardContainer: {
    width: '100%',
    marginTop: 8,
  },
  // Plan Card Styles
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  planCardPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 16,
  },
  planCardDivider: {
    height: 2,
    backgroundColor: '#E5E5E5',
    marginBottom: 12,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planDetailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
  },
  // Payment Card Styles
  paymentCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  // Ready Card Styles
  readyCard: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  readyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  readySubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
    textAlign: 'center',
  },
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  // Next Button
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 1,
  },
});
