import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.replace('/(tabs)/browse');
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
              Welcome back
            </Text>
            <Text className="text-gray-600 text-lg">
              Sign in to your Lumbus account
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

            <TouchableOpacity
              className={`mt-6 rounded-lg py-4 ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white text-center text-base font-semibold">
                {loading ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-blue-500 font-semibold">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
