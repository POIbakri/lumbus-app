import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { fetchUserOrders } from '../../lib/api';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { isValidEmail } from '../../lib/validation';
import { signInWithApple, signInWithGoogle, isAppleSignInAvailable, handleSocialAuthError } from '../../lib/auth/socialAuth';
import { AppleLogo } from '../../components/icons/AppleLogo';
import { GoogleLogo } from '../../components/icons/GoogleLogo';
import { registerForPushNotifications, savePushToken } from '../../lib/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

  // Pre-populate cache with user data and prefetch orders for instant Dashboard
  const preCacheUserData = async (userId: string, userEmail: string) => {
    // Set user data in cache immediately
    queryClient.setQueryData(['userId'], userId);
    queryClient.setQueryData(['userEmail'], userEmail);

    // Prefetch orders - await to ensure data is ready before Dashboard loads
    await queryClient.prefetchQuery({
      queryKey: ['orders', userId],
      queryFn: () => fetchUserOrders(userId),
      staleTime: 600000, // 10 minutes
    });
  };

  // Check if Apple Sign In is available
  useEffect(() => {
    isAppleSignInAvailable().then(setShowAppleSignIn);
  }, []);

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

  async function handleLogin() {
    // Check if locked out
    if (lockoutUntil && new Date() < lockoutUntil) {
      Alert.alert('Too Many Attempts', `Please wait ${lockoutSeconds} seconds before trying again.`);
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (loading) return; // Prevent double-tap

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
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

    // Reset on success and show success state
    setLoading(false);
    setFailedAttempts(0);
    setLockoutUntil(null);
    setSignInSuccess(true);

    // Pre-cache user data and prefetch orders for instant Dashboard
    if (data.user) {
      const userId = data.user.id;
      const userEmail = data.user.email || '';

      // Await prefetch to ensure Dashboard has data ready
      try {
        await preCacheUserData(userId, userEmail);
      } catch {
        // Silent fail - still navigate even if prefetch fails
      }

      // Register push token (fire-and-forget - don't block navigation)
      (async () => {
        try {
          const token = await registerForPushNotifications();
          if (token) {
            await savePushToken(userId, token);
          }
        } catch {
          // Silent fail - don't block user experience
        }
      })();
    }

    router.replace('/(tabs)/browse');
  }

  async function handleAppleSignIn() {
    if (socialLoading) return;

    setSocialLoading(true);
    const result = await signInWithApple();

    if (result.success) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          // Await prefetch to ensure Dashboard has data ready
          await preCacheUserData(data.user.id, data.user.email || '');

          // Register push token (fire-and-forget - don't block navigation)
          (async () => {
            try {
              const token = await registerForPushNotifications();
              if (token) {
                await savePushToken(data.user.id, token);
              }
            } catch {
              // Silent fail
            }
          })();
        }
      } catch {
        // Silent fail - still navigate
      }

      setSocialLoading(false);
      setSignInSuccess(true);
      router.replace('/(tabs)/browse');
    } else {
      setSocialLoading(false);
      if (result.error && result.error !== 'canceled') {
        handleSocialAuthError(result.error, 'apple');
      }
    }
  }

  async function handleGoogleSignIn() {
    if (socialLoading) return;

    setSocialLoading(true);
    const result = await signInWithGoogle();

    if (result.success) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          // Await prefetch to ensure Dashboard has data ready
          await preCacheUserData(data.user.id, data.user.email || '');

          // Register push token (fire-and-forget - don't block navigation)
          (async () => {
            try {
              const token = await registerForPushNotifications();
              if (token) {
                await savePushToken(data.user.id, token);
              }
            } catch {
              // Silent fail
            }
          })();
        }
      } catch {
        // Silent fail - still navigate
      }

      setSocialLoading(false);
      setSignInSuccess(true);
      router.replace('/(tabs)/browse');
    } else {
      setSocialLoading(false);
      if (result.error && result.error !== 'canceled') {
        handleSocialAuthError(result.error, 'google');
      }
    }
  }


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: getHorizontalPadding() }}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Blobs - Brand Colors */}
        <View className="absolute top-0 right-0 rounded-full" style={{width: scale(256), height: scale(256), backgroundColor: 'rgba(135, 239, 255, 0.1)'}} />
        <View className="absolute bottom-0 left-0 rounded-full" style={{width: scale(320), height: scale(320), backgroundColor: 'rgba(247, 226, 251, 0.15)'}} />
        <View className="absolute rounded-full" style={{top: '33%', left: '25%', width: scale(288), height: scale(288), backgroundColor: 'rgba(253, 253, 116, 0.1)'}} />

        <View className="relative" style={{paddingTop: moderateScale(80), paddingBottom: moderateScale(24)}}>
          {/* Logo Badge */}
          <View className="items-center" style={{marginBottom: moderateScale(24)}}>
            <Image
              source={require('../../assets/iconlogotrans.png')}
              style={{
                width: scale(64),
                height: scale(64),
                resizeMode: 'contain',
              }}
            />
          </View>

          {/* Title */}
          <View style={{marginBottom: moderateScale(28)}}>
            <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 24 : 28), marginBottom: moderateScale(8)}}>
              WELCOME TO LUMBUS
            </Text>
            <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(15)}}>
              Sign in to manage your eSIMs
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginBottom: moderateScale(8)}}>
                Email
              </Text>
              <TextInput
                className="rounded-2xl font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(14), fontSize: getFontSize(16)}}
                placeholder="you@example.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={{marginTop: moderateScale(12)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginBottom: moderateScale(8)}}>
                Password
              </Text>
              <View style={{position: 'relative'}}>
                <TextInput
                  className="rounded-2xl font-bold"
                  style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(14), paddingRight: scale(50), fontSize: getFontSize(16)}}
                  placeholder="••••••••"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{position: 'absolute', right: scale(16), top: 0, bottom: 0, justifyContent: 'center'}}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={getFontSize(20)} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="rounded-2xl"
              style={{backgroundColor: lockoutSeconds > 0 ? '#E5E5E5' : '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, marginTop: moderateScale(20), paddingVertical: moderateScale(16)}}
              onPress={handleLogin}
              disabled={loading || signInSuccess || lockoutSeconds > 0}
              activeOpacity={0.8}
            >
              <Text className="text-center font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(15)}}>
                {loading || signInSuccess ? 'SIGNING IN...' : lockoutSeconds > 0 ? `WAIT ${lockoutSeconds}S` : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center" style={{marginTop: moderateScale(20)}}>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
              <Text className="font-bold" style={{color: '#999999', fontSize: getFontSize(12), paddingHorizontal: scale(12)}}>
                OR
              </Text>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
            </View>

            {/* Social Sign In Buttons */}
            <View style={{marginTop: moderateScale(16), gap: moderateScale(10)}}>
              {/* Apple Sign In (iOS only) */}
              {showAppleSignIn && (
                <TouchableOpacity
                  className="rounded-2xl flex-row items-center justify-center"
                  style={{backgroundColor: '#000000', paddingVertical: moderateScale(14), borderWidth: 2, borderColor: '#000000'}}
                  onPress={handleAppleSignIn}
                  disabled={socialLoading || loading || signInSuccess}
                  activeOpacity={0.8}
                >
                  <AppleLogo size={scale(18)} color="#FFFFFF" />
                  <Text className="font-black uppercase tracking-wide" style={{color: '#FFFFFF', fontSize: getFontSize(13), marginLeft: scale(10)}}>
                    CONTINUE WITH APPLE
                  </Text>
                </TouchableOpacity>
              )}

              {/* Google Sign In */}
              <TouchableOpacity
                className="rounded-2xl flex-row items-center justify-center"
                style={{backgroundColor: '#FFFFFF', paddingVertical: moderateScale(14), borderWidth: 2, borderColor: '#E5E5E5'}}
                onPress={handleGoogleSignIn}
                disabled={socialLoading || loading || signInSuccess}
                activeOpacity={0.8}
              >
                <GoogleLogo size={scale(18)} />
                <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginLeft: scale(10)}}>
                  CONTINUE WITH GOOGLE
                </Text>
              </TouchableOpacity>
            </View>

            {/* Signup Link */}
            <View className="flex-row justify-center" style={{marginTop: moderateScale(20), flexWrap: 'wrap'}}>
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="font-black" style={{color: '#2EFECC', fontSize: getFontSize(14)}}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
