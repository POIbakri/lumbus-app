import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { validatePassword, isValidEmail } from '../../lib/validation';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= lockoutUntil) {
        setLockoutUntil(null);
        setLockoutSeconds(0);
      } else {
        const remaining = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 1000);
        setLockoutSeconds(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  async function handleSignup() {
    // Check if locked out
    if (lockoutUntil && new Date() < lockoutUntil) {
      Alert.alert('Too Many Attempts', `Please wait ${lockoutSeconds} seconds before trying again.`);
      return;
    }

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Weak Password', passwordValidation.error || 'Please choose a stronger password');
      return;
    }

    if (loading) return; // Prevent double-tap

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      // Exponential lockout: 5s, 10s, 30s, 60s, 120s
      if (newFailedAttempts >= 3) {
        const lockoutDuration = Math.min(5 * Math.pow(2, newFailedAttempts - 3), 120);
        const lockoutTime = new Date(Date.now() + lockoutDuration * 1000);
        setLockoutUntil(lockoutTime);
        setLockoutSeconds(lockoutDuration);
        Alert.alert(
          'Too Many Failed Attempts',
          `Please wait ${lockoutDuration} seconds before trying again.`
        );
      } else {
        Alert.alert('Error', error.message);
      }
      return;
    }

    // Reset on success
    setFailedAttempts(0);
    setLockoutUntil(null);

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
        {/* Decorative Blobs - Brand Colors */}
        <View className="absolute top-0 left-0 w-64 h-64 rounded-full" style={{backgroundColor: 'rgba(253, 253, 116, 0.1)'}} />
        <View className="absolute bottom-0 right-0 w-80 h-80 rounded-full" style={{backgroundColor: 'rgba(135, 239, 255, 0.1)'}} />
        <View className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full" style={{backgroundColor: 'rgba(247, 226, 251, 0.15)'}} />

        <View className="flex-1 justify-center px-6 relative">
          {/* Logo Badge */}
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/iconlogotrans.png')}
              style={{
                width: 80,
                height: 80,
                resizeMode: 'contain',
              }}
            />
          </View>

          {/* Title */}
          <View className="mb-10">
            <Text className="text-5xl font-black mb-3 uppercase tracking-tight text-center" style={{color: '#1A1A1A'}}>
              CREATE{'\n'}ACCOUNT
            </Text>
            <Text className="text-lg font-bold text-center" style={{color: '#666666'}}>
              Join Lumbus to get started with eSIMs
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-black mb-2 uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Email
              </Text>
              <TextInput
                className="rounded-2xl px-5 py-4 text-base font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A'}}
                placeholder="you@example.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-black mb-2 uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Password
              </Text>
              <TextInput
                className="rounded-2xl px-5 py-4 text-base font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A'}}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-black mb-2 uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                Confirm Password
              </Text>
              <TextInput
                className="rounded-2xl px-5 py-4 text-base font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A'}}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              className="mt-8 rounded-2xl py-5"
              style={{backgroundColor: lockoutSeconds > 0 ? '#E5E5E5' : '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8}}
              onPress={handleSignup}
              disabled={loading || lockoutSeconds > 0}
              activeOpacity={0.8}
            >
              <Text className="text-center text-lg font-black uppercase tracking-wide" style={{color: '#1A1A1A'}}>
                {loading ? 'CREATING ACCOUNT...' : lockoutSeconds > 0 ? `WAIT ${lockoutSeconds}S` : 'CREATE ACCOUNT →'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="font-bold" style={{color: '#666666'}}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="font-black" style={{color: '#2EFECC'}}>SIGN IN</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Badge */}
            <View className="items-center mt-8">
              <View className="flex-row items-center gap-2 px-4 py-2 rounded-full" style={{backgroundColor: '#FDFD74'}}>
                <Text className="text-lg">🌍</Text>
                <Text className="text-xs font-bold uppercase" style={{color: '#1A1A1A'}}>
                  Join 50,000+ Users
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
