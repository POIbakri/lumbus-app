import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useReferral } from '../../contexts/ReferralContext';
import { logger } from '../../lib/logger';

export default function ReferralDeepLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { setReferralCode } = useReferral();

  useEffect(() => {
    if (code) {
      const normalizedCode = code.toUpperCase();
      setReferralCode(normalizedCode);

      Alert.alert(
        'Referral Code Applied!',
        "You'll get 10% OFF + 1GB FREE on your first purchase!",
        [{ text: 'Got it!' }]
      );

      logger.log('Referral code applied via route:', normalizedCode);
    }

    // Navigate to home/browse
    router.replace('/(tabs)/browse');
  }, [code, setReferralCode]);

  return null;
}
