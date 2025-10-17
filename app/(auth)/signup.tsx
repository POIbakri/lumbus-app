import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Success',
      'Account created successfully! Please sign in.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Create account
            </Text>
            <Text className="text-gray-600 text-lg">
              Join Lumbus to get started with eSIMs
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              className={`mt-6 rounded-lg py-4 ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text className="text-white text-center text-base font-semibold">
                {loading ? 'Creating account...' : 'Sign up'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-blue-500 font-semibold">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
