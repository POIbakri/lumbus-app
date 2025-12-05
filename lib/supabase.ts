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
      // Use AFTER_FIRST_UNLOCK to allow access when app is in background/locked
      // This prevents "User interaction is not allowed" errors during background tasks
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
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

// Lazy initialization to ensure config values are available
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: secureStorage, // Using encrypted SecureStore instead of AsyncStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
