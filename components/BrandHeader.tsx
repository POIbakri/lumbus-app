import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useResponsive, getFontSize, getHorizontalPadding } from '../hooks/useResponsive';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  showAccentBar?: boolean;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function BrandHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  backgroundColor = '#2EFECC',
  titleColor = '#1A1A1A',
  subtitleColor = '#1A1A1A',
  showAccentBar = true,
  rightContent,
  children,
  style,
}: BrandHeaderProps) {
  const { moderateScale, scale, isSmallDevice } = useResponsive();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor,
          paddingHorizontal: getHorizontalPadding(),
          paddingTop: moderateScale(60),
          paddingBottom: moderateScale(32),
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        style,
      ]}
    >
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            marginBottom: moderateScale(20),
            backgroundColor: 'rgba(26, 26, 26, 0.1)',
            borderRadius: 12,
            paddingVertical: moderateScale(8),
            paddingHorizontal: scale(12),
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 8,
              padding: 6,
              marginRight: 8,
            }}
          >
            <Ionicons name="arrow-back" size={scale(18)} color={backgroundColor} />
          </View>
          <Text
            style={{
              fontWeight: 'bold',
              color: titleColor,
              fontSize: getFontSize(14),
              letterSpacing: 0.5,
            }}
          >
            BACK
          </Text>
        </TouchableOpacity>
      )}

      {/* Title Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(8) }}>
            {showAccentBar && (
              <View
                style={{
                  width: 4,
                  height: getFontSize(isSmallDevice ? 36 : 42),
                  backgroundColor: titleColor,
                  marginRight: moderateScale(12),
                  borderRadius: 2,
                }}
              />
            )}
            <Text
              style={{
                fontWeight: '900',
                textTransform: 'uppercase',
                color: titleColor,
                fontSize: getFontSize(isSmallDevice ? 36 : 42),
                letterSpacing: -0.5,
              }}
            >
              {title}
            </Text>
          </View>

          {subtitle && (
            <Text
              style={{
                fontWeight: '600',
                color: subtitleColor,
                opacity: 0.75,
                fontSize: getFontSize(18),
                letterSpacing: 0.3,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightContent && <View style={{ marginLeft: moderateScale(16) }}>{rightContent}</View>}
      </View>

      {/* Additional Content */}
      {children && <View style={{ marginTop: moderateScale(20) }}>{children}</View>}
    </View>
  );
}

// Preset header variants for common use cases
export const HeaderPresets = {
  browse: {
    backgroundColor: '#2EFECC',
    titleColor: '#1A1A1A',
    subtitleColor: '#1A1A1A',
    showAccentBar: true,
  },
  account: {
    backgroundColor: '#FDFD74',
    titleColor: '#1A1A1A',
    subtitleColor: '#1A1A1A',
    showAccentBar: true,
  },
  dashboard: {
    backgroundColor: '#FFFFFF',
    titleColor: '#1A1A1A',
    subtitleColor: '#666666',
    showAccentBar: false,
  },
  error: {
    backgroundColor: '#EF4444',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    showAccentBar: false,
  },
};