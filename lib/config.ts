// Read configuration directly from environment variables
// These are set via EAS secrets and embedded into the app at build time
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
  apiUrl: process.env.EXPO_PUBLIC_API_URL as string,
};

// Validate required config
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in EAS secrets.'
  );
}

if (!config.stripePublishableKey) {
  throw new Error(
    'Stripe configuration is missing. Ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in EAS secrets.'
  );
}

if (!config.apiUrl) {
  throw new Error(
    'API URL is missing. Ensure EXPO_PUBLIC_API_URL is set in EAS secrets.'
  );
}
