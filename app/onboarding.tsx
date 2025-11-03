import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getIconSize, getBorderRadius } from '../hooks/useResponsive';

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
  emoji?: string;
  useLogo?: boolean;
  title: string;
  description: string;
  features: Array<{ icon: string; text: string }>;
  exampleCard?: any;
}

const screens: OnboardingScreen[] = [
  {
    stepNumber: 0,
    stepBadge: {
      backgroundColor: COLORS.yellow,
      number: '0',
    },
    useLogo: true,
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
  const { moderateScale, adaptiveScale, isTablet, screenWidth } = useResponsive();

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: getHorizontalPadding() }}>
          {/* Skip Button */}
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              paddingVertical: moderateScale(8),
              paddingHorizontal: moderateScale(16),
              marginTop: moderateScale(60),
            }}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: getFontSize(14),
              fontWeight: '700',
              color: COLORS.gray,
              letterSpacing: 1,
            }}>
              SKIP
            </Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={{
            flex: 1,
            justifyContent: 'center',
            paddingBottom: moderateScale(20),
          }}>
            {screens.map((screen, index) => {
              if (index !== currentIndex) return null;

              return (
                <View
                  key={index}
                  style={{ alignItems: 'center' }}
                >
                  {/* Logo or Emoji */}
                  {screen.useLogo ? (
                    <Image
                      source={require('../assets/logotrans.png')}
                      style={{
                        width: adaptiveScale(isTablet ? 250 : 200),
                        height: adaptiveScale(isTablet ? 200 : 160),
                        resizeMode: 'contain',
                        marginBottom: moderateScale(32),
                      }}
                    />
                  ) : (
                    <Text style={{
                      fontSize: getFontSize(isTablet ? 96 : 72),
                      marginBottom: moderateScale(24),
                    }}>
                      {screen.emoji}
                    </Text>
                  )}

                  {/* Title */}
                  <Text style={{
                    fontSize: getFontSize(isTablet ? 40 : 32),
                    fontWeight: '900',
                    color: COLORS.black,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                    marginBottom: moderateScale(16),
                  }}>
                    {screen.title}
                  </Text>

                  {/* Description */}
                  <Text style={{
                    fontSize: getFontSize(16),
                    fontWeight: '600',
                    color: COLORS.gray,
                    textAlign: 'center',
                    lineHeight: getFontSize(16) * 1.5,
                    marginBottom: moderateScale(32),
                    paddingHorizontal: moderateScale(16),
                  }}>
                    {screen.description}
                  </Text>

                  {/* Features */}
                  <View style={{
                    width: '100%',
                    marginBottom: moderateScale(32),
                  }}>
                    {screen.features.map((feature, idx) => (
                      <View
                        key={idx}
                        style={
                          screen.stepNumber === 0 ? {
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: COLORS.yellow,
                            borderRadius: getBorderRadius(12),
                            paddingVertical: moderateScale(16),
                            paddingHorizontal: moderateScale(16),
                            marginBottom: moderateScale(16),
                          } : {
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: moderateScale(12),
                            paddingHorizontal: moderateScale(16),
                          }
                        }
                      >
                        {screen.stepNumber === 0 ? (
                          <View style={{
                            width: adaptiveScale(32),
                            height: adaptiveScale(32),
                            borderRadius: adaptiveScale(16),
                            backgroundColor: COLORS.black,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: moderateScale(12),
                          }}>
                            <Text style={{
                              fontSize: getFontSize(16),
                              color: COLORS.yellow,
                              fontWeight: '900',
                            }}>
                              {feature.icon}
                            </Text>
                          </View>
                        ) : (
                          <Text style={{
                            fontSize: getFontSize(18),
                            color: COLORS.primary,
                            marginRight: moderateScale(12),
                            fontWeight: '900',
                          }}>
                            {feature.icon}
                          </Text>
                        )}
                        <Text style={{
                          fontSize: getFontSize(15),
                          fontWeight: '700',
                          color: COLORS.black,
                          flex: 1,
                        }}>
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Example Card */}
                  {screen.exampleCard && (
                    <View style={{
                      width: '100%',
                      marginTop: moderateScale(8),
                    }}>
                      {/* Plan Card (Screen 1) */}
                      {screen.stepNumber === 1 && (
                        <View style={{
                          backgroundColor: screen.exampleCard.backgroundColor,
                          borderRadius: getBorderRadius(20),
                          padding: moderateScale(20),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                        }}>
                          <Text style={{
                            fontSize: getFontSize(18),
                            fontWeight: '900',
                            color: COLORS.black,
                            marginBottom: moderateScale(8),
                            textTransform: 'uppercase',
                          }}>
                            {screen.exampleCard.title}
                          </Text>
                          <Text style={{
                            fontSize: getFontSize(28),
                            fontWeight: '900',
                            color: COLORS.black,
                            marginBottom: moderateScale(16),
                          }}>
                            {screen.exampleCard.price}
                          </Text>
                          <View style={{
                            height: 2,
                            backgroundColor: '#E5E5E5',
                            marginBottom: moderateScale(12),
                          }} />
                          {screen.exampleCard.details.map((detail: any, idx: number) => (
                            <View key={idx} style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: moderateScale(8),
                            }}>
                              <Text style={{
                                fontSize: getFontSize(14),
                                fontWeight: '700',
                                color: COLORS.gray,
                              }}>
                                {detail.label}
                              </Text>
                              <Text style={{
                                fontSize: getFontSize(14),
                                fontWeight: '900',
                                color: COLORS.black,
                              }}>
                                {detail.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Payment Card (Screen 2) */}
                      {screen.stepNumber === 2 && (
                        <View style={{
                          backgroundColor: screen.exampleCard.backgroundColor,
                          borderRadius: getBorderRadius(20),
                          padding: moderateScale(20),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                        }}>
                          {screen.exampleCard.paymentMethods.map((method: any, idx: number) => (
                            <View key={idx} style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: moderateScale(12),
                              borderBottomWidth: idx < screen.exampleCard.paymentMethods.length - 1 ? 1 : 0,
                              borderBottomColor: '#E5E5E5',
                            }}>
                              <Text style={{
                                fontSize: getFontSize(24),
                                marginRight: moderateScale(12),
                              }}>
                                {method.icon}
                              </Text>
                              <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '700',
                                color: COLORS.black,
                              }}>
                                {method.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Ready Card (Screen 3) */}
                      {screen.stepNumber === 3 && (
                        <View style={{
                          backgroundColor: screen.exampleCard.backgroundColor,
                          borderRadius: getBorderRadius(20),
                          padding: moderateScale(32),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            fontSize: getFontSize(64),
                            marginBottom: moderateScale(16),
                          }}>
                            {screen.exampleCard.icon}
                          </Text>
                          <Text style={{
                            fontSize: getFontSize(18),
                            fontWeight: '900',
                            color: COLORS.black,
                            textAlign: 'center',
                            marginBottom: moderateScale(8),
                            textTransform: 'uppercase',
                          }}>
                            {screen.exampleCard.title}
                          </Text>
                          <Text style={{
                            fontSize: getFontSize(14),
                            fontWeight: '700',
                            color: COLORS.gray,
                            textAlign: 'center',
                          }}>
                            {screen.exampleCard.subtitle}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Pagination Dots */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: moderateScale(16),
            gap: moderateScale(8),
          }}>
            {screens.map((_, index) => (
              <View
                key={index}
                style={{
                  height: adaptiveScale(8),
                  borderRadius: adaptiveScale(4),
                  backgroundColor: index === currentIndex ? COLORS.primary : '#E5E5E5',
                  width: index === currentIndex ? adaptiveScale(24) : adaptiveScale(8),
                }}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: getBorderRadius(16),
              paddingVertical: moderateScale(16),
              paddingHorizontal: moderateScale(32),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: moderateScale(12),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              marginBottom: moderateScale(20),
            }}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: getFontSize(16),
              fontWeight: '900',
              color: COLORS.black,
              letterSpacing: 1,
            }}>
              {currentIndex === screens.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
            <Ionicons name="arrow-forward" size={getIconSize(20)} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});