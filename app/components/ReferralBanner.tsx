import React from 'react';
import { View, Text } from 'react-native';
import { useResponsive, getFontSize } from '../../hooks/useResponsive';
import { useReferral } from '../../contexts/ReferralContext';
import { PartyIcon } from '../../components/icons/flags';

/**
 * Referral Banner Component
 *
 * Displays an active referral discount banner when a referral code is present.
 * Shows the benefits: 10% OFF + 1GB FREE
 */
export function ReferralBanner() {
  const { hasActiveReferral } = useReferral();
  const { scale, moderateScale } = useResponsive();

  if (!hasActiveReferral) {
    return null;
  }

  return (
    <View
      className="rounded-2xl flex-row items-center"
      style={{
        backgroundColor: '#FEF3C7', // Warm yellow background
        padding: moderateScale(16),
        marginBottom: moderateScale(16),
        borderWidth: 2,
        borderColor: '#FBBF24', // Amber border
      }}
    >
      <View style={{ marginRight: scale(12) }}>
        <PartyIcon size={getFontSize(24)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          className="font-black uppercase tracking-wide"
          style={{
            color: '#1A1A1A',
            fontSize: getFontSize(14),
            marginBottom: moderateScale(2),
          }}
        >
          REFERRAL ACTIVE!
        </Text>
        <Text
          className="font-bold"
          style={{
            color: '#666666',
            fontSize: getFontSize(12),
          }}
        >
          10% OFF + 1GB FREE on this purchase
        </Text>
      </View>
    </View>
  );
}

/**
 * Compact Referral Badge
 *
 * A smaller badge version for constrained spaces.
 */
export function ReferralBadge() {
  const { hasActiveReferral } = useReferral();
  const { scale, moderateScale } = useResponsive();

  if (!hasActiveReferral) {
    return null;
  }

  return (
    <View
      className="rounded-xl flex-row items-center"
      style={{
        backgroundColor: '#FEF3C7',
        paddingHorizontal: scale(12),
        paddingVertical: moderateScale(8),
        borderWidth: 2,
        borderColor: '#FBBF24',
      }}
    >
      <View style={{ marginRight: scale(6) }}>
        <PartyIcon size={getFontSize(16)} />
      </View>
      <Text
        className="font-black uppercase tracking-wide"
        style={{
          color: '#1A1A1A',
          fontSize: getFontSize(11),
        }}
      >
        10% OFF + 1GB FREE
      </Text>
    </View>
  );
}
