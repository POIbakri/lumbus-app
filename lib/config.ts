import Constants from 'expo-constants';

// Access environment variables from app.config.ts
const extra = Constants.expoConfig?.extra || {};

export const config = {
  supabaseUrl: extra.supabaseUrl as string,
  supabaseAnonKey: extra.supabaseAnonKey as string,
  stripePublishableKey: extra.stripePublishableKey as string,
  apiUrl: extra.apiUrl as string,
};

// Validate required config
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Supabase configuration is missing. Check app.config.ts');
}

if (!config.stripePublishableKey) {
  throw new Error('Stripe configuration is missing. Check app.config.ts');
}

if (!config.apiUrl) {
  throw new Error('API URL is missing. Check app.config.ts');
}
