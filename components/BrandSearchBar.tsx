import React from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive, getFontSize } from '../hooks/useResponsive';

interface BrandSearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  iconBackgroundColor?: string;
}

export function BrandSearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  iconColor = '#2EFECC',
  backgroundColor = '#FFFFFF',
  textColor = '#1A1A1A',
  placeholderColor = '#999999',
  showClearButton = true,
  onClear,
  iconBackgroundColor = '#E0FEF7',
  ...textInputProps
}: BrandSearchBarProps) {
  const { scale, moderateScale } = useResponsive();

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingVertical: moderateScale(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Search Icon */}
      <View
        style={{
          backgroundColor: iconBackgroundColor,
          borderRadius: 10,
          padding: 8,
        }}
      >
        <Ionicons name="search" size={scale(20)} color={iconColor} />
      </View>

      {/* Text Input */}
      <TextInput
        style={{
          flex: 1,
          fontWeight: '600',
          color: textColor,
          marginLeft: scale(12),
          fontSize: getFontSize(15),
          letterSpacing: 0.2,
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        {...textInputProps}
      />

      {/* Clear Button */}
      {showClearButton && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={{ padding: 4 }} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={scale(20)} color={placeholderColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}