import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import ReferAndEarn from '../components/ReferAndEarn';

export default function Account() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  const getUserEmail = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || '');
    }
  }, []);

  useEffect(() => {
    getUserEmail();
  }, [getUserEmail]);

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
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, [router]);

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

  return (
    <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header with brand color */}
      <View className="px-6 pt-16 pb-6" style={{backgroundColor: '#FDFD74'}}>
        <Text className="text-4xl font-black uppercase tracking-tight" style={{color: '#1A1A1A', marginBottom: 12}}>
          ACCOUNT
        </Text>
        <Text className="text-base font-bold" style={{color: '#1A1A1A', opacity: 0.8}}>
          Manage your profile and settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 mb-6" style={{shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 2, borderColor: '#E5E5E5'}}>
          <View className="flex-row items-center">
            <View className="p-4 rounded-2xl" style={{backgroundColor: '#2EFECC'}}>
              <Ionicons name="person" size={32} color="#1A1A1A" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-xs mb-1 uppercase font-black tracking-wide" style={{color: '#666666'}}>
                Email Address
              </Text>
              <Text className="text-lg font-black" style={{color: '#1A1A1A'}}>
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* Refer & Earn Section */}
        <ReferAndEarn />

        {/* Menu Items */}
        <View className="bg-white rounded-2xl overflow-hidden mb-6" style={{shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 2, borderColor: '#E5E5E5'}}>
          <TouchableOpacity
            className="flex-row items-center justify-between p-5"
            style={{borderBottomWidth: 2, borderBottomColor: '#E5E5E5'}}
            onPress={openHelpSupport}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl" style={{backgroundColor: '#E0FEF7'}}>
                <Ionicons name="help-circle-outline" size={24} color="#2EFECC" />
              </View>
              <Text className="ml-4 text-base font-black uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#2EFECC" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-5"
            style={{borderBottomWidth: 2, borderBottomColor: '#E5E5E5'}}
            onPress={openTermsOfService}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl" style={{backgroundColor: '#E0FEF7'}}>
                <Ionicons name="document-text-outline" size={24} color="#2EFECC" />
              </View>
              <Text className="ml-4 text-base font-black uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#2EFECC" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-5"
            onPress={openPrivacyPolicy}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl" style={{backgroundColor: '#E0FEF7'}}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#2EFECC" />
              </View>
              <Text className="ml-4 text-base font-black uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#2EFECC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="rounded-2xl p-5 flex-row items-center justify-center"
          style={{backgroundColor: '#EF4444', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8}}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={26} color="white" />
          <Text className="ml-3 text-base font-black uppercase tracking-wide" style={{color: '#FFFFFF'}}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Version Badge */}
        <View className="items-center mt-8">
          <View className="px-5 py-2 rounded-full" style={{backgroundColor: '#F5F5F5'}}>
            <Text className="text-xs font-bold uppercase tracking-wide" style={{color: '#666666'}}>
              ⚡ Lumbus v1.0.0
            </Text>
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
