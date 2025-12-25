import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useState, useCallback } from 'react';
import { fetchReferralInfo } from '../../lib/api';
import ReferAndEarn from '../components/ReferAndEarn';
import FreeDataWallet from '../components/FreeDataWallet';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getIconSize, getBorderRadius } from '../../hooks/useResponsive';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { LightningIcon } from '../../components/icons/flags';
import { deletePushToken } from '../../lib/notifications';
import { useReferral } from '../../contexts/ReferralContext';

export default function Account() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const { moderateScale, adaptiveScale, isTablet, isSmallDevice } = useResponsive();
  const { clearReferralCode } = useReferral();

  // Use React Query for user email - shares cache with Dashboard's userId query
  const { data: email = '' } = useQuery({
    queryKey: ['userEmail'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email || '';
    },
    staleTime: Infinity, // Email doesn't change during session
    gcTime: Infinity,
  });

  // Prefetch referral info when account page loads (ReferAndEarn will use cached data)
  useQuery({
    queryKey: ['referralInfo'],
    queryFn: fetchReferralInfo,
    staleTime: 300000, // 5 minutes
    gcTime: 1800000, // 30 minutes
  });

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // Clear user data before signing out
            await deletePushToken();
            await clearReferralCode();
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, [router, clearReferralCode]);

  const openHelpSupport = useCallback(async () => {
    const url = 'https://getlumbus.com/support';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open support page');
    }
  }, []);

  const openTermsOfService = useCallback(async () => {
    const url = 'https://getlumbus.com/terms';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open terms page');
    }
  }, []);

  const openPrivacyPolicy = useCallback(async () => {
    const url = 'https://getlumbus.com/privacy';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open privacy policy');
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setDeleteAccountModalVisible(true);
  }, []);

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Enhanced Header with improved design */}
      <View style={{
        backgroundColor: '#FDFD74',
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
      }}>
        {/* Title Section with accent */}
        <View>
          <View className="flex-row items-center" style={{marginBottom: moderateScale(8)}}>
            <View style={{
              width: 4,
              height: getFontSize(isSmallDevice ? 32 : 36),
              backgroundColor: '#1A1A1A',
              marginRight: moderateScale(12),
              borderRadius: 2,
            }} />
            <Text className="font-black uppercase tracking-tight" style={{
              color: '#1A1A1A',
              fontSize: getFontSize(isSmallDevice ? 32 : 36),
              letterSpacing: -0.5,
            }}>
              ACCOUNT
            </Text>
          </View>
          <Text className="font-semibold" style={{
            color: '#1A1A1A',
            opacity: 0.7,
            fontSize: getFontSize(16),
            letterSpacing: 0.2,
          }}>
            Manage your profile and settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View style={{ padding: getHorizontalPadding() }}>
        {/* Profile Card */}
        <View className="bg-white" style={{
          borderRadius: getBorderRadius(16),
          padding: moderateScale(24),
          marginBottom: moderateScale(24),
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          borderWidth: 2,
          borderColor: '#E5E5E5',
        }}>
          <View className="flex-row items-center">
            <View style={{
              backgroundColor: '#2EFECC',
              padding: moderateScale(16),
              borderRadius: getBorderRadius(16),
            }}>
              <Ionicons name="person" size={getIconSize(32)} color="#1A1A1A" />
            </View>
            <View style={{ marginLeft: moderateScale(20), flex: 1 }}>
              <Text className="mb-1 uppercase font-black tracking-wide" style={{
                color: '#666666',
                fontSize: getFontSize(12),
              }}>
                Email Address
              </Text>
              <Text
                className="font-black"
                style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(18),
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* Refer & Earn Section */}
        <ReferAndEarn />

        {/* Rewards Wallet Section */}
        <FreeDataWallet />

        {/* Menu Items */}
        <View className="bg-white overflow-hidden" style={{
          borderRadius: getBorderRadius(16),
          marginBottom: moderateScale(24),
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          borderWidth: 2,
          borderColor: '#E5E5E5',
        }}>
          <TouchableOpacity
            className="flex-row items-center justify-between"
            style={{
              padding: moderateScale(20),
              borderBottomWidth: 2,
              borderBottomColor: '#E5E5E5',
            }}
            onPress={openHelpSupport}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View style={{
                backgroundColor: '#E0FEF7',
                padding: moderateScale(8),
                borderRadius: getBorderRadius(12),
              }}>
                <Ionicons name="help-circle-outline" size={getIconSize(24)} color="#2EFECC" />
              </View>
              <Text className="font-black uppercase tracking-wide" style={{
                color: '#1A1A1A',
                fontSize: getFontSize(16),
                marginLeft: moderateScale(16),
              }}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={getIconSize(22)} color="#2EFECC" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between"
            style={{
              padding: moderateScale(20),
              borderBottomWidth: 2,
              borderBottomColor: '#E5E5E5',
            }}
            onPress={openTermsOfService}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View style={{
                backgroundColor: '#E0FEF7',
                padding: moderateScale(8),
                borderRadius: getBorderRadius(12),
              }}>
                <Ionicons name="document-text-outline" size={getIconSize(24)} color="#2EFECC" />
              </View>
              <Text className="font-black uppercase tracking-wide" style={{
                color: '#1A1A1A',
                fontSize: getFontSize(16),
                marginLeft: moderateScale(16),
              }}>
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={getIconSize(22)} color="#2EFECC" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between"
            style={{
              padding: moderateScale(20),
            }}
            onPress={openPrivacyPolicy}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View style={{
                backgroundColor: '#E0FEF7',
                padding: moderateScale(8),
                borderRadius: getBorderRadius(12),
              }}>
                <Ionicons name="shield-checkmark-outline" size={getIconSize(24)} color="#2EFECC" />
              </View>
              <Text className="font-black uppercase tracking-wide" style={{
                color: '#1A1A1A',
                fontSize: getFontSize(16),
                marginLeft: moderateScale(16),
              }}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={getIconSize(22)} color="#2EFECC" />
          </TouchableOpacity>
        </View>

        {/* Delete Account Button - placed before Sign Out for better flow */}
        <TouchableOpacity
          className="flex-row items-center justify-center"
          style={{
            backgroundColor: '#FEE2E2',
            borderRadius: getBorderRadius(16),
            padding: moderateScale(20),
            marginBottom: moderateScale(16),
            borderWidth: 2,
            borderColor: '#FCA5A5',
          }}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={getIconSize(26)} color="#EF4444" />
          <Text className="font-black uppercase tracking-wide" style={{
            color: '#EF4444',
            fontSize: getFontSize(16),
            marginLeft: moderateScale(12),
          }}>
            Delete Account
          </Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center"
          style={{
            backgroundColor: '#EF4444',
            borderRadius: getBorderRadius(16),
            padding: moderateScale(20),
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={getIconSize(26)} color="white" />
          <Text className="font-black uppercase tracking-wide" style={{
            color: '#FFFFFF',
            fontSize: getFontSize(16),
            marginLeft: moderateScale(12),
          }}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Version Badge */}
        <View className="items-center" style={{ marginTop: moderateScale(32) }}>
          <View style={{
            backgroundColor: '#F5F5F5',
            paddingHorizontal: moderateScale(20),
            paddingVertical: moderateScale(8),
            borderRadius: getBorderRadius(999),
          }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <LightningIcon size={getFontSize(12)} color="#666666" />
              <Text className="font-bold uppercase tracking-wide" style={{
                color: '#666666',
                fontSize: getFontSize(12),
              }}>
                Lumbus v1.0.20
              </Text>
            </View>
          </View>
        </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={deleteAccountModalVisible}
        onClose={() => setDeleteAccountModalVisible(false)}
      />
    </View>
  );
}
