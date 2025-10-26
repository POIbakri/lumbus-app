import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { isValidEmail } from '../../lib/validation';
import { signInWithApple, signInWithGoogle, isAppleSignInAvailable, handleSocialAuthError } from '../../lib/auth/socialAuth';
import { AppleLogo } from '../../components/icons/AppleLogo';
import { GoogleLogo } from '../../components/icons/GoogleLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

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
    router.replace('/(tabs)/browse');
  }

  async function handleAppleSignIn() {
    if (socialLoading) return;

    setSocialLoading(true);
    const result = await signInWithApple();
    setSocialLoading(false);

    if (result.success) {
      router.replace('/(tabs)/browse');
    } else if (result.error && result.error !== 'canceled') {
      handleSocialAuthError(result.error, 'apple');
    }
  }

  async function handleGoogleSignIn() {
    if (socialLoading) return;

    setSocialLoading(true);
    const result = await signInWithGoogle();
    setSocialLoading(false);

    if (result.success) {
      router.replace('/(tabs)/browse');
    } else if (result.error && result.error !== 'canceled') {
      handleSocialAuthError(result.error, 'google');
    }
  }


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: getHorizontalPadding() }}>
        {/* Decorative Blobs - Brand Colors */}
        <View className="absolute top-0 right-0 rounded-full" style={{width: scale(256), height: scale(256), backgroundColor: 'rgba(135, 239, 255, 0.1)'}} />
        <View className="absolute bottom-0 left-0 rounded-full" style={{width: scale(320), height: scale(320), backgroundColor: 'rgba(247, 226, 251, 0.15)'}} />
        <View className="absolute rounded-full" style={{top: '33%', left: '25%', width: scale(288), height: scale(288), backgroundColor: 'rgba(253, 253, 116, 0.1)'}} />

        <View className="flex-1 justify-center relative" style={{paddingVertical: moderateScale(40)}}>
          {/* Logo Badge */}
          <View className="items-center" style={{marginBottom: moderateScale(32)}}>
            <Image
              source={require('../../assets/iconlogotrans.png')}
              style={{
                width: scale(80),
                height: scale(80),
                resizeMode: 'contain',
              }}
            />
          </View>

          {/* Title */}
          <View style={{marginBottom: moderateScale(40)}}>
            <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 36 : 48), lineHeight: getFontSize(isSmallDevice ? 40 : 52), marginBottom: moderateScale(12)}}>
              WELCOME{'\n'}BACK
            </Text>
            <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(16)}}>
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
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(16), fontSize: getFontSize(16)}}
                placeholder="you@example.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={{marginTop: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginBottom: moderateScale(8)}}>
                Password
              </Text>
              <TextInput
                className="rounded-2xl font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(16), fontSize: getFontSize(16)}}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="rounded-2xl"
              style={{backgroundColor: lockoutSeconds > 0 ? '#E5E5E5' : '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, marginTop: moderateScale(32), paddingVertical: moderateScale(20)}}
              onPress={handleLogin}
              disabled={loading || lockoutSeconds > 0}
              activeOpacity={0.8}
            >
              <Text className="text-center font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
                {loading ? 'SIGNING IN...' : lockoutSeconds > 0 ? `WAIT ${lockoutSeconds}S` : 'SIGN IN →'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center" style={{marginTop: moderateScale(32)}}>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
              <Text className="font-bold" style={{color: '#999999', fontSize: getFontSize(12), paddingHorizontal: scale(12)}}>
                OR
              </Text>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
            </View>

            {/* Social Sign In Buttons */}
            <View style={{marginTop: moderateScale(24), gap: moderateScale(12)}}>
              {/* Apple Sign In (iOS only) */}
              {showAppleSignIn && (
                <TouchableOpacity
                  className="rounded-2xl flex-row items-center justify-center"
                  style={{backgroundColor: '#000000', paddingVertical: moderateScale(16), borderWidth: 2, borderColor: '#000000'}}
                  onPress={handleAppleSignIn}
                  disabled={socialLoading || loading}
                  activeOpacity={0.8}
                >
                  <AppleLogo size={scale(20)} color="#FFFFFF" />
                  <Text className="font-black uppercase tracking-wide" style={{color: '#FFFFFF', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                    CONTINUE WITH APPLE
                  </Text>
                </TouchableOpacity>
              )}

              {/* Google Sign In */}
              <TouchableOpacity
                className="rounded-2xl flex-row items-center justify-center"
                style={{backgroundColor: '#FFFFFF', paddingVertical: moderateScale(16), borderWidth: 2, borderColor: '#E5E5E5'}}
                onPress={handleGoogleSignIn}
                disabled={socialLoading || loading}
                activeOpacity={0.8}
              >
                <GoogleLogo size={scale(20)} />
                <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(14), marginLeft: scale(12)}}>
                  CONTINUE WITH GOOGLE
                </Text>
              </TouchableOpacity>
            </View>

            {/* Signup Link */}
            <View className="flex-row justify-center" style={{marginTop: moderateScale(32), flexWrap: 'wrap'}}>
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
