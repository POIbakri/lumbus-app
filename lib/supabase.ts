import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { config } from './config';
import { logger } from './logger';

// Create a SecureStore adapter for Supabase
// This provides encrypted storage for session tokens instead of plain AsyncStorage
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // SecureStore may fail on some devices/emulators
      // Fall back gracefully by returning null
      logger.error('SecureStore getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      logger.error('SecureStore setItem error:', error);
      // Don't throw - allow auth to continue even if storage fails
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      logger.error('SecureStore removeItem error:', error);
      // Don't throw - allow logout to continue even if deletion fails
    }
  },
};

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: secureStorage, // Using encrypted SecureStore instead of AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
