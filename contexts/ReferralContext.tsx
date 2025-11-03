import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../lib/logger';

interface ReferralContextType {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  hasActiveReferral: boolean;
  clearReferralCode: () => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

const REFERRAL_CODE_KEY = '@lumbus_referral_code';

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load referral code from storage on mount
  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      const stored = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
      if (stored) {
        setReferralCodeState(stored);
        logger.log('📋 Loaded referral code from storage:', stored);
      }
    } catch (error) {
      logger.error('Error loading referral code:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setReferralCode = async (code: string | null) => {
    try {
      if (code) {
        await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
        setReferralCodeState(code);
        logger.log('💾 Saved referral code:', code);
      } else {
        await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
        setReferralCodeState(null);
        logger.log('🗑️ Removed referral code');
      }
    } catch (error) {
      logger.error('Error saving referral code:', error);
    }
  };

  const clearReferralCode = async () => {
    await setReferralCode(null);
  };

  const hasActiveReferral = !!referralCode;

  // Don't render children until we've loaded the stored referral code
  if (!isLoaded) {
    return null;
  }

  return (
    <ReferralContext.Provider
      value={{
        referralCode,
        setReferralCode,
        hasActiveReferral,
        clearReferralCode,
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}
