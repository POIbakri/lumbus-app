
  import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useResponsive, getFontSize } from '../hooks/useResponsive';

export interface TabOption {
  key: string;
  label: string;
  icon?: string;
}

interface BrandTabSwitcherProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  containerBackgroundColor?: string;
}

export function BrandTabSwitcher({
  tabs,
  activeTab,
  onTabChange,
  backgroundColor = 'rgba(26, 26, 26, 0.1)',
  activeBackgroundColor = '#1A1A1A',
  inactiveBackgroundColor = 'transparent',
  activeTextColor = '#2EFECC',
  inactiveTextColor = '#1A1A1A',
  containerBackgroundColor,
}: BrandTabSwitcherProps) {
  const { moderateScale } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: containerBackgroundColor || backgroundColor,
        borderRadius: 18,
        padding: 4,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
                borderRadius: 14,
                paddingVertical: moderateScale(14),
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.8}
            >
              {tab.icon && (
                <Text style={{ fontSize: getFontSize(16), marginRight: 8 }}>
                  {tab.icon}
                </Text>
              )}
              <Text
                style={{
                  fontWeight: 'bold',
                  color: isActive ? activeTextColor : inactiveTextColor,
                  fontSize: getFontSize(14),
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Preset tab switcher variants
export const TabSwitcherPresets = {
  primary: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    activeBackgroundColor: '#1A1A1A',
    activeTextColor: '#2EFECC',
    inactiveTextColor: '#1A1A1A',
  },
  secondary: {
    backgroundColor: 'rgba(253, 253, 116, 0.2)',
    activeBackgroundColor: '#FDFD74',
    activeTextColor: '#1A1A1A',
    inactiveTextColor: '#666666',
  },
  dark: {
    backgroundColor: '#1A1A1A',
    activeBackgroundColor: '#2EFECC',
    activeTextColor: '#1A1A1A',
    inactiveTextColor: '#FFFFFF',
  },
  light: {
    backgroundColor: '#F5F5F5',
    activeBackgroundColor: '#FFFFFF',
    activeTextColor: '#1A1A1A',
    inactiveTextColor: '#666666',
  },
};