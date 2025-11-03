import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { validatePassword, isValidEmail } from '../../lib/validation';
import { signInWithApple, signInWithGoogle, isAppleSignInAvailable, handleSocialAuthError } from '../../lib/auth/socialAuth';
import { AppleLogo } from '../../components/icons/AppleLogo';
import { GoogleLogo } from '../../components/icons/GoogleLogo';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';
import { useReferral } from '../../contexts/ReferralContext';
import { linkReferralCode } from '../../lib/api';
import { ReferralBadge } from '../components/ReferralBanner';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const [manualReferralCode, setManualReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const { scale, moderateScale, isSmallDevice } = useResponsive();
  const { referralCode, setReferralCode: setGlobalReferralCode, clearReferralCode } = useReferral();
  const hasSyncedRef = useRef(false);

  // Check if Apple Sign In is available
  useEffect(() => {
    isAppleSignInAvailable().then(setShowAppleSignIn);
  }, []);

  // Sync manual input with global referral code (only once on mount)
  useEffect(() => {
    if (referralCode && !hasSyncedRef.current) {
      setManualReferralCode(referralCode);
      setShowReferralInput(true); // Show the input if code was applied via deep link
      hasSyncedRef.current = true;
    }
  }, [referralCode]);

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

  // Handle manual referral code input with validation
  const handleReferralCodeChange = (text: string) => {
    // Frontend validation: uppercase, alphanumeric only, max 8 chars
    const filtered = text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Only allow A-Z and 0-9
      .slice(0, 8); // Max 8 characters

    setManualReferralCode(filtered);

    // Auto-apply when 8 characters are entered
    if (filtered.length === 8) {
      setGlobalReferralCode(filtered);
      Alert.alert(
        'Referral Code Applied!',
        "You'll get 10% OFF + 1GB FREE on your first purchase!",
        [{ text: 'Got it!' }]
      );
    }
  };

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

    // Link referral code if present
    if (data.user && referralCode) {
      try {
        const result = await linkReferralCode({
          userId: data.user.id,
          referralCode: referralCode,
        });
        if (result.success) {
          // Don't show this message, we'll show it after login
          // clearReferralCode will happen after they make their first purchase
        }
      } catch (error) {
        // Silent fail - don't block signup flow
        // Referral code will still be stored and used at checkout
      }
    }

    Alert.alert(
      'Success',
      referralCode
        ? 'Account created! Sign in to use your referral discount.'
        : 'Account created successfully! Please sign in.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: getHorizontalPadding() }}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Blobs - Brand Colors */}
        <View className="absolute top-0 left-0 rounded-full" style={{width: scale(256), height: scale(256), backgroundColor: 'rgba(253, 253, 116, 0.1)'}} />
        <View className="absolute bottom-0 right-0 rounded-full" style={{width: scale(320), height: scale(320), backgroundColor: 'rgba(135, 239, 255, 0.1)'}} />
        <View className="absolute rounded-full" style={{top: '33%', right: '25%', width: scale(288), height: scale(288), backgroundColor: 'rgba(247, 226, 251, 0.15)'}} />

        <View className="relative" style={{paddingTop: moderateScale(70), paddingBottom: moderateScale(24)}}>
          {/* Logo Badge */}
          <View className="items-center" style={{marginBottom: moderateScale(20)}}>
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
          <View style={{marginBottom: moderateScale(referralCode ? 20 : 24)}}>
            <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(isSmallDevice ? 32 : 40), lineHeight: getFontSize(isSmallDevice ? 36 : 44), marginBottom: moderateScale(8)}}>
              CREATE{'\n'}ACCOUNT
            </Text>
            <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(15)}}>
              Join Lumbus to get started with eSIMs
            </Text>
          </View>

          {/* Referral Badge */}
          {referralCode && (
            <View className="items-center" style={{marginBottom: moderateScale(20)}}>
              <ReferralBadge />
            </View>
          )}

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
              <TextInput
                className="rounded-2xl font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(14), fontSize: getFontSize(16)}}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={{marginTop: moderateScale(12)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginBottom: moderateScale(8)}}>
                Confirm Password
              </Text>
              <TextInput
                className="rounded-2xl font-bold"
                style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(14), fontSize: getFontSize(16)}}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Referral Code Input */}
            {!referralCode && (
              <View style={{marginTop: moderateScale(12)}}>
                {!showReferralInput ? (
                  <TouchableOpacity
                    onPress={() => setShowReferralInput(true)}
                    style={{paddingVertical: moderateScale(8)}}
                  >
                    <Text className="font-bold text-center" style={{color: '#2EFECC', fontSize: getFontSize(13)}}>
                      Have a referral code? Tap to enter
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginBottom: moderateScale(8)}}>
                      Referral Code (Optional)
                    </Text>
                    <TextInput
                      className="rounded-2xl font-bold"
                      style={{backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: manualReferralCode.length === 8 ? '#2EFECC' : '#E5E5E5', color: '#1A1A1A', paddingHorizontal: scale(20), paddingVertical: moderateScale(14), fontSize: getFontSize(16)}}
                      placeholder="Enter 8-character code"
                      placeholderTextColor="#666666"
                      value={manualReferralCode}
                      onChangeText={handleReferralCodeChange}
                      autoCapitalize="characters"
                      maxLength={8}
                      editable={!loading}
                    />
                    {manualReferralCode.length > 0 && manualReferralCode.length < 8 && (
                      <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(11), marginTop: moderateScale(4)}}>
                        {8 - manualReferralCode.length} characters remaining
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Create Account Button */}
            <TouchableOpacity
              className="rounded-2xl"
              style={{backgroundColor: lockoutSeconds > 0 ? '#E5E5E5' : '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, marginTop: moderateScale(18), paddingVertical: moderateScale(16)}}
              onPress={handleSignup}
              disabled={loading || lockoutSeconds > 0}
              activeOpacity={0.8}
            >
              <Text className="text-center font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(15)}}>
                {loading ? 'CREATING ACCOUNT...' : lockoutSeconds > 0 ? `WAIT ${lockoutSeconds}S` : 'CREATE ACCOUNT →'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center" style={{marginTop: moderateScale(18)}}>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
              <Text className="font-bold" style={{color: '#999999', fontSize: getFontSize(12), paddingHorizontal: scale(12)}}>
                OR
              </Text>
              <View style={{flex: 1, height: 1, backgroundColor: '#E5E5E5'}} />
            </View>

            {/* Social Sign In Buttons */}
            <View style={{marginTop: moderateScale(14), gap: moderateScale(10)}}>
              {/* Apple Sign In (iOS only) */}
              {showAppleSignIn && (
                <TouchableOpacity
                  className="rounded-2xl flex-row items-center justify-center"
                  style={{backgroundColor: '#000000', paddingVertical: moderateScale(14), borderWidth: 2, borderColor: '#000000'}}
                  onPress={handleAppleSignIn}
                  disabled={socialLoading || loading}
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
                disabled={socialLoading || loading}
                activeOpacity={0.8}
              >
                <GoogleLogo size={scale(18)} />
                <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginLeft: scale(10)}}>
                  CONTINUE WITH GOOGLE
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center" style={{marginTop: moderateScale(16), flexWrap: 'wrap'}}>
              <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14)}}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="font-black" style={{color: '#2EFECC', fontSize: getFontSize(14)}}>SIGN IN</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Badge */}
            <View className="items-center" style={{marginTop: moderateScale(16)}}>
              <View className="flex-row items-center rounded-full" style={{backgroundColor: '#FDFD74', paddingHorizontal: scale(14), paddingVertical: moderateScale(6), gap: scale(6)}}>
                <Text style={{fontSize: getFontSize(16)}}>🌍</Text>
                <Text className="font-bold uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(11)}}>
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
