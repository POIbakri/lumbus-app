import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getIconSize, getBorderRadius } from '../hooks/useResponsive';
import { WorldMapIcon, CreditCardIcon, GlobeIcon, MobilePhoneIcon, CheckmarkIcon } from '../components/icons/flags';
import { AppleLogo } from '../components/icons/AppleLogo';
import { GoogleLogo } from '../components/icons/GoogleLogo';

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
  iconType?: 'map' | 'card' | 'globe' | 'phone';
  useLogo?: boolean;
  title: string;
  description: string;
  features: Array<{ text: string }>;
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
      { text: 'Instant eSIM delivery' },
      { text: 'Coverage in 150+ countries' },
      { text: 'Connect in under 5 minutes' },
    ],
  },
  {
    stepNumber: 1,
    stepBadge: {
      backgroundColor: COLORS.yellow,
      number: '1',
    },
    iconType: 'map',
    title: 'CHOOSE YOUR PLAN',
    description: 'Select the perfect data plan for your destination. We offer plans for 150+ countries with flexible data options and durations.',
    features: [
      { text: 'Pick your destination' },
      { text: 'Choose data amount (1GB - 20GB)' },
      { text: 'Select validity period (7-30 days)' },
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
    iconType: 'card',
    title: 'PAY INSTANTLY',
    description: 'Complete your purchase with Apple Pay, Google Pay, or any major credit card. Secure checkout powered by Stripe.',
    features: [
      { text: 'Apple Pay & Google Pay supported' },
      { text: 'All major credit cards accepted' },
      { text: 'Secure encrypted payment' },
    ],
    exampleCard: {
      backgroundColor: COLORS.purple,
      paymentMethods: [
        { type: 'apple', iconComponent: 'apple', label: 'Apple Pay' },
        { type: 'google', iconComponent: 'google', label: 'Google Pay' },
        { type: 'card', iconComponent: 'card', label: '•••• •••• •••• 4242' },
      ],
    },
  },
  {
    stepNumber: 3,
    stepBadge: {
      backgroundColor: COLORS.cyan,
      number: '3',
    },
    iconType: 'globe',
    title: 'GET CONNECTED',
    description: 'Receive your eSIM instantly. Activate it by scanning the QR code or using the one-tap installation on iOS 17.4+.',
    features: [
      { text: 'Instant eSIM delivery' },
      { text: 'QR code or one-tap activation' },
      { text: 'Online in less than 5 minutes' },
    ],
    exampleCard: {
      backgroundColor: COLORS.cyan,
      iconType: 'phone',
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
        contentContainerStyle={{ paddingHorizontal: getHorizontalPadding() }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Skip Button */}
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              paddingVertical: moderateScale(8),
              paddingHorizontal: moderateScale(12),
              marginTop: moderateScale(60),
            }}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: getFontSize(13),
              fontWeight: '700',
              color: COLORS.gray,
              letterSpacing: 1,
            }}>
              SKIP
            </Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={{
            paddingTop: moderateScale(20),
            paddingBottom: moderateScale(20),
          }}>
            {screens.map((screen, index) => {
              if (index !== currentIndex) return null;

              return (
                <View
                  key={index}
                  style={{ alignItems: 'center' }}
                >
                  {/* Logo or Icon */}
                  {screen.useLogo ? (
                    <Image
                      source={require('../assets/logotrans.png')}
                      style={{
                        width: adaptiveScale(isTablet ? 220 : 160),
                        height: adaptiveScale(isTablet ? 180 : 120),
                        resizeMode: 'contain',
                        marginBottom: moderateScale(24),
                      }}
                    />
                  ) : (
                    <View style={{ marginBottom: moderateScale(20) }}>
                      {screen.iconType === 'map' && <WorldMapIcon size={getFontSize(isTablet ? 80 : 56)} />}
                      {screen.iconType === 'card' && <CreditCardIcon size={getFontSize(isTablet ? 80 : 56)} />}
                      {screen.iconType === 'globe' && <GlobeIcon size={getFontSize(isTablet ? 80 : 56)} />}
                      {screen.iconType === 'phone' && <MobilePhoneIcon size={getFontSize(isTablet ? 80 : 56)} />}
                    </View>
                  )}

                  {/* Title */}
                  <Text style={{
                    fontSize: getFontSize(isTablet ? 36 : 28),
                    fontWeight: '900',
                    color: COLORS.black,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                    marginBottom: moderateScale(12),
                  }}>
                    {screen.title}
                  </Text>

                  {/* Description */}
                  <Text style={{
                    fontSize: getFontSize(15),
                    fontWeight: '600',
                    color: COLORS.gray,
                    textAlign: 'center',
                    lineHeight: getFontSize(15) * 1.5,
                    marginBottom: moderateScale(24),
                    paddingHorizontal: moderateScale(12),
                  }}>
                    {screen.description}
                  </Text>

                  {/* Features */}
                  <View style={{
                    width: '100%',
                    marginBottom: moderateScale(24),
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
                            paddingVertical: moderateScale(14),
                            paddingHorizontal: moderateScale(14),
                            marginBottom: moderateScale(12),
                          } : {
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: moderateScale(10),
                            paddingHorizontal: moderateScale(12),
                          }
                        }
                      >
                        {screen.stepNumber === 0 ? (
                          <View style={{
                            width: adaptiveScale(28),
                            height: adaptiveScale(28),
                            borderRadius: adaptiveScale(14),
                            backgroundColor: COLORS.black,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: moderateScale(10),
                          }}>
                            <CheckmarkIcon size={getFontSize(14)} color={COLORS.yellow} />
                          </View>
                        ) : (
                          <View style={{ marginRight: moderateScale(10) }}>
                            <CheckmarkIcon size={getFontSize(16)} color={COLORS.primary} />
                          </View>
                        )}
                        <Text style={{
                          fontSize: getFontSize(14),
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
                      marginTop: moderateScale(4),
                    }}>
                      {/* Plan Card (Screen 1) */}
                      {screen.stepNumber === 1 && (
                        <View style={{
                          backgroundColor: screen.exampleCard.backgroundColor,
                          borderRadius: getBorderRadius(16),
                          padding: moderateScale(16),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                        }}>
                          <Text style={{
                            fontSize: getFontSize(16),
                            fontWeight: '900',
                            color: COLORS.black,
                            marginBottom: moderateScale(6),
                            textTransform: 'uppercase',
                          }}>
                            {screen.exampleCard.title}
                          </Text>
                          <Text style={{
                            fontSize: getFontSize(24),
                            fontWeight: '900',
                            color: COLORS.black,
                            marginBottom: moderateScale(12),
                          }}>
                            {screen.exampleCard.price}
                          </Text>
                          <View style={{
                            height: 2,
                            backgroundColor: '#E5E5E5',
                            marginBottom: moderateScale(10),
                          }} />
                          {screen.exampleCard.details.map((detail: any, idx: number) => (
                            <View key={idx} style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: moderateScale(6),
                            }}>
                              <Text style={{
                                fontSize: getFontSize(13),
                                fontWeight: '700',
                                color: COLORS.gray,
                              }}>
                                {detail.label}
                              </Text>
                              <Text style={{
                                fontSize: getFontSize(13),
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
                          borderRadius: getBorderRadius(16),
                          padding: moderateScale(16),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                        }}>
                          {screen.exampleCard.paymentMethods.map((method: any, idx: number) => (
                            <View key={idx} style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: moderateScale(10),
                              borderBottomWidth: idx < screen.exampleCard.paymentMethods.length - 1 ? 1 : 0,
                              borderBottomColor: '#E5E5E5',
                            }}>
                              <View style={{ marginRight: moderateScale(10) }}>
                                {method.iconComponent === 'phone' && <MobilePhoneIcon size={getFontSize(20)} />}
                                {method.iconComponent === 'card' && <CreditCardIcon size={getFontSize(20)} />}
                                {method.iconComponent === 'apple' && <AppleLogo size={getFontSize(20)} color="#000000" />}
                                {method.iconComponent === 'google' && <GoogleLogo size={getFontSize(20)} />}
                                {method.icon && !method.iconComponent && (
                                  <Text style={{ fontSize: getFontSize(20), fontWeight: '900' }}>{method.icon}</Text>
                                )}
                              </View>
                              <Text style={{
                                fontSize: getFontSize(14),
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
                          borderRadius: getBorderRadius(16),
                          padding: moderateScale(24),
                          borderWidth: 2,
                          borderColor: '#E5E5E5',
                          alignItems: 'center',
                        }}>
                          <View style={{ marginBottom: moderateScale(12) }}>
                            {screen.exampleCard.iconType === 'phone' && <MobilePhoneIcon size={getFontSize(52)} />}
                          </View>
                          <Text style={{
                            fontSize: getFontSize(16),
                            fontWeight: '900',
                            color: COLORS.black,
                            textAlign: 'center',
                            marginBottom: moderateScale(6),
                            textTransform: 'uppercase',
                          }}>
                            {screen.exampleCard.title}
                          </Text>
                          <Text style={{
                            fontSize: getFontSize(13),
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
            marginTop: moderateScale(20),
            marginBottom: moderateScale(16),
            gap: moderateScale(6),
          }}>
            {screens.map((_, index) => (
              <View
                key={index}
                style={{
                  height: adaptiveScale(7),
                  borderRadius: adaptiveScale(3.5),
                  backgroundColor: index === currentIndex ? COLORS.primary : '#E5E5E5',
                  width: index === currentIndex ? adaptiveScale(20) : adaptiveScale(7),
                }}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: getBorderRadius(16),
              paddingVertical: moderateScale(14),
              paddingHorizontal: moderateScale(28),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: moderateScale(10),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              marginBottom: moderateScale(24),
            }}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: getFontSize(15),
              fontWeight: '900',
              color: COLORS.black,
              letterSpacing: 1,
            }}>
              {currentIndex === screens.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
            <Ionicons name="arrow-forward" size={getIconSize(18)} color={COLORS.black} />
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