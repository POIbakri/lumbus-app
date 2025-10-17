import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

export default function Account() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    getUserEmail();
  }, []);

  async function getUserEmail() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || '');
    }
  }

  async function handleSignOut() {
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
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">
          Account
        </Text>
      </View>

      <View className="p-4">
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-sm text-gray-600 mb-1">
                Email
              </Text>
              <Text className="text-base font-semibold text-gray-900">
                {email}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
            onPress={() => {}}
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-900">
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
            onPress={() => {}}
          >
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={24} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-900">
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => {}}
          >
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={24} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-900">
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 border border-gray-100 flex-row items-center justify-center"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="ml-2 text-base font-semibold text-red-500">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-sm mt-6">
          Lumbus v1.0.0
        </Text>
      </View>
    </View>
  );
}
