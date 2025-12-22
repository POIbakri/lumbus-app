import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { fetchReferralInfo, ReferralData } from '../../lib/api';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { logger } from '../../lib/logger';
import { ReferralLoader } from '../../components/loaders';

export default function ReferAndEarn() {
  const { scale, moderateScale } = useResponsive();

  // Use React Query for caching and better performance
  const { data: referralData, isLoading: loading } = useQuery({
    queryKey: ['referralInfo'],
    queryFn: fetchReferralInfo,
    staleTime: 300000, // 5 minutes - referral stats don't change often
    gcTime: 1800000, // 30 minutes cache
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const copyToClipboard = async () => {
    if (!referralData) return;

    await Clipboard.setStringAsync(referralData.ref_code);
    Alert.alert('Copied', 'Referral code copied to clipboard');
  };

  const shareReferralLink = async () => {
    if (!referralData) return;

    const message = `Get your eSIM with Lumbus! Use my referral code ${referralData.ref_code} and we both get rewarded!\n\n${referralData.referral_link}`;

    try {
      const result = await Share.share({
        message,
        title: 'Join Lumbus and Get Rewarded!',
      });

      if (result.action === Share.sharedAction) {
        logger.log('Shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link');
    }
  };

  const shareViaWhatsApp = () => {
    if (!referralData) return;

    const message = `Get your eSIM with Lumbus! Use my referral code ${referralData.ref_code} and we both get rewarded!\n\n${referralData.referral_link}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp not installed');
        }
      })
      .catch((err) => logger.error('Error opening WhatsApp:', err));
  };

  const shareViaInstagram = () => {
    Alert.alert(
      'Share via Instagram',
      'Please copy your referral code and paste it in your Instagram story or post',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy Code', onPress: copyToClipboard },
      ]
    );
  };

  const shareViaEmail = () => {
    if (!referralData) return;

    const subject = 'Join Lumbus and Get Rewarded!';
    const body = `Get your eSIM with Lumbus!\n\nUse my referral code ${referralData.ref_code} and we both get rewarded!\n\n${referralData.referral_link}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch((err) =>
      logger.error('Error opening email:', err)
    );
  };

  if (loading) {
    return <ReferralLoader />;
  }

  if (!referralData) {
    return null;
  }

  return (
    <View style={{ marginBottom: moderateScale(24) }}>
      {/* Refer & Earn Card */}
      <View className="rounded-3xl" style={{ backgroundColor: '#2EFECC', padding: moderateScale(24), marginBottom: moderateScale(16), borderWidth: 2, borderColor: '#E5E5E5' }}>
        <View className="flex-row items-center" style={{ marginBottom: moderateScale(16) }}>
          <View className="p-3 rounded-2xl" style={{ backgroundColor: '#1A1A1A' }}>
            <Ionicons name="gift" size={scale(28)} color="#2EFECC" />
          </View>
          <View className="flex-1" style={{ marginLeft: scale(16) }}>
            <Text className="font-black uppercase tracking-tight" style={{ color: '#1A1A1A', fontSize: getFontSize(24), marginBottom: moderateScale(4) }}>
              REFER & EARN
            </Text>
            <Text className="font-bold" style={{ color: '#1A1A1A', opacity: 0.8, fontSize: getFontSize(13) }}>
              Share with friends, earn data rewards
            </Text>
          </View>
        </View>

        {/* Referral Code Display */}
        <View className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: moderateScale(20), marginBottom: moderateScale(16), borderWidth: 2, borderColor: '#1A1A1A' }}>
          <Text className="font-black uppercase tracking-wide text-center" style={{ color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8) }}>
            Your Referral Code
          </Text>
          <Text className="font-black text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(32), letterSpacing: 2 }}>
            {referralData.ref_code}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row" style={{ marginBottom: moderateScale(16), gap: 8 }}>
          <TouchableOpacity
            className="flex-1 rounded-2xl flex-row items-center justify-center"
            style={{ backgroundColor: '#1A1A1A', paddingVertical: moderateScale(14) }}
            onPress={copyToClipboard}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
            <Text className="font-black uppercase tracking-wide" style={{ color: '#FFFFFF', fontSize: getFontSize(13), marginLeft: scale(8) }}>
              COPY
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-2xl flex-row items-center justify-center"
            style={{ backgroundColor: '#1A1A1A', paddingVertical: moderateScale(14) }}
            onPress={shareReferralLink}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={scale(20)} color="#2EFECC" />
            <Text className="font-black uppercase tracking-wide" style={{ color: '#FFFFFF', fontSize: getFontSize(13), marginLeft: scale(8) }}>
              SHARE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Share Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="items-center"
            style={{ width: '23%' }}
            onPress={shareViaWhatsApp}
            activeOpacity={0.7}
          >
            <View className="rounded-2xl items-center justify-center" style={{ backgroundColor: '#FFFFFF', width: scale(56), height: scale(56), marginBottom: moderateScale(6) }}>
              <Ionicons name="logo-whatsapp" size={scale(28)} color="#25D366" />
            </View>
            <Text className="font-bold text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(10) }}>
              WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            style={{ width: '23%' }}
            onPress={shareViaInstagram}
            activeOpacity={0.7}
          >
            <View className="rounded-2xl items-center justify-center" style={{ backgroundColor: '#FFFFFF', width: scale(56), height: scale(56), marginBottom: moderateScale(6) }}>
              <Ionicons name="logo-instagram" size={scale(28)} color="#E4405F" />
            </View>
            <Text className="font-bold text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(10) }}>
              Instagram
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            style={{ width: '23%' }}
            onPress={shareViaEmail}
            activeOpacity={0.7}
          >
            <View className="rounded-2xl items-center justify-center" style={{ backgroundColor: '#FFFFFF', width: scale(56), height: scale(56), marginBottom: moderateScale(6) }}>
              <Ionicons name="mail-outline" size={scale(28)} color="#EA4335" />
            </View>
            <Text className="font-bold text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(10) }}>
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            style={{ width: '23%' }}
            onPress={shareReferralLink}
            activeOpacity={0.7}
          >
            <View className="rounded-2xl items-center justify-center" style={{ backgroundColor: '#FFFFFF', width: scale(56), height: scale(56), marginBottom: moderateScale(6) }}>
              <Ionicons name="ellipsis-horizontal" size={scale(28)} color="#666666" />
            </View>
            <Text className="font-bold text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(10) }}>
              More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="flex-row" style={{ marginBottom: moderateScale(16), gap: 8 }}>
        <View className="flex-1 rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: moderateScale(16), borderWidth: 2, borderColor: '#E5E5E5' }}>
          <Text className="font-black text-center" style={{ color: '#2EFECC', fontSize: getFontSize(28), marginBottom: moderateScale(4) }}>
            {referralData.stats.total_signups}
          </Text>
          <Text className="font-bold uppercase text-center tracking-wide" style={{ color: '#666666', fontSize: getFontSize(11) }}>
            Referrals
          </Text>
        </View>

        <View className="flex-1 rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: moderateScale(16), borderWidth: 2, borderColor: '#E5E5E5' }}>
          <Text className="font-black text-center" style={{ color: '#FDFD74', fontSize: getFontSize(28), marginBottom: moderateScale(4) }}>
            {(referralData.stats.pending_rewards / 1024).toFixed(1)}
          </Text>
          <Text className="font-bold uppercase text-center tracking-wide" style={{ color: '#666666', fontSize: getFontSize(11) }}>
            GB Pending
          </Text>
        </View>

        <View className="flex-1 rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: moderateScale(16), borderWidth: 2, borderColor: '#E5E5E5' }}>
          <Text className="font-black text-center" style={{ color: '#1A1A1A', fontSize: getFontSize(28), marginBottom: moderateScale(4) }}>
            {(referralData.stats.earned_rewards / 1024).toFixed(1)}
          </Text>
          <Text className="font-bold uppercase text-center tracking-wide" style={{ color: '#666666', fontSize: getFontSize(11) }}>
            GB Earned
          </Text>
        </View>
      </View>

      {/* Referee Bonus - subtle inline tag when pending reward displays as >= 0.1GB (0.05 rounds to 0.1) */}
      {((referralData.stats.referee_pending_rewards ?? 0) / 1024) >= 0.05 && (
        <View className="flex-row items-center justify-center" style={{ marginBottom: moderateScale(12) }}>
          <View className="flex-row items-center rounded-full" style={{ backgroundColor: '#E0FEF7', paddingVertical: 6, paddingHorizontal: 12 }}>
            <Ionicons name="gift-outline" size={14} color="#2EFECC" />
            <Text style={{ color: '#1A1A1A', fontSize: getFontSize(11), marginLeft: 6, fontWeight: '600' }}>
              +{((referralData.stats.referee_pending_rewards ?? 0) / 1024).toFixed(1)}GB bonus pending
            </Text>
          </View>
        </View>
      )}

      {/* Claim Rewards Notice - Always show */}
      <TouchableOpacity
        className="rounded-2xl flex-row items-center"
        style={{
          backgroundColor: '#FEF3C7',
          padding: moderateScale(16),
          marginBottom: moderateScale(16),
          borderWidth: 2,
          borderColor: '#FBBF24',
        }}
        onPress={() => {
          const url = 'https://getlumbus.com';
          Linking.openURL(url).catch((err) =>
            logger.error('Error opening website:', err)
          );
        }}
        activeOpacity={0.8}
      >
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: moderateScale(8),
          borderRadius: moderateScale(12),
          marginRight: scale(12)
        }}>
          <Ionicons name="gift-outline" size={scale(24)} color="#FBBF24" />
        </View>
        <View style={{ flex: 1, paddingRight: scale(8) }}>
          <Text
            className="font-black uppercase tracking-wide"
            style={{
              color: '#1A1A1A',
              fontSize: getFontSize(13),
              marginBottom: moderateScale(4),
            }}
          >
            {referralData.stats.pending_rewards > 0 || referralData.stats.earned_rewards > 0
              ? 'CLAIM YOUR REWARDS'
              : 'MANAGE REFERRALS'}
          </Text>
          <Text
            className="font-bold"
            style={{
              color: '#666666',
              fontSize: getFontSize(12),
              lineHeight: getFontSize(16),
              flexWrap: 'wrap',
            }}
          >
            Visit getlumbus.com to claim data rewards
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={scale(20)} color="#FBBF24" />
      </TouchableOpacity>

      {/* How it Works */}
      <View className="rounded-2xl" style={{ backgroundColor: '#E0FEF7', padding: moderateScale(20), borderWidth: 2, borderColor: '#2EFECC' }}>
        <View className="flex-row items-center" style={{ marginBottom: moderateScale(12) }}>
          <Ionicons name="information-circle" size={scale(24)} color="#2EFECC" />
          <Text className="font-black uppercase tracking-wide" style={{ color: '#1A1A1A', fontSize: getFontSize(14), marginLeft: scale(8) }}>
            How it works
          </Text>
        </View>
        <View style={{ marginBottom: moderateScale(8) }}>
          <Text className="font-bold" style={{ color: '#666666', fontSize: getFontSize(13), lineHeight: getFontSize(20) }}>
            <Text style={{ color: '#2EFECC', fontWeight: 'bold' }}>1.</Text> Share your referral code with friends
          </Text>
        </View>
        <View style={{ marginBottom: moderateScale(8) }}>
          <Text className="font-bold" style={{ color: '#666666', fontSize: getFontSize(13), lineHeight: getFontSize(20) }}>
            <Text style={{ color: '#2EFECC', fontWeight: 'bold' }}>2.</Text> They sign up and make a purchase
          </Text>
        </View>
        <View>
          <Text className="font-bold" style={{ color: '#666666', fontSize: getFontSize(13), lineHeight: getFontSize(20) }}>
            <Text style={{ color: '#2EFECC', fontWeight: 'bold' }}>3.</Text> You both earn data rewards!
          </Text>
        </View>
      </View>
    </View>
  );
}
