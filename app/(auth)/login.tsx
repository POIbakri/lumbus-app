import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

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
              style={{backgroundColor: '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, marginTop: moderateScale(32), paddingVertical: moderateScale(20)}}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-center font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
                {loading ? 'SIGNING IN...' : 'SIGN IN →'}
              </Text>
            </TouchableOpacity>

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
