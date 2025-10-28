// Lazy getter functions to avoid immediate evaluation
function getEnvVar(key: string, errorMessage: string): string {
  // Use type assertion to access process.env with dynamic key
  const value = (process.env as Record<string, string | undefined>)[key];

  if (!value) {
    console.error(`[CONFIG ERROR] Missing environment variable: ${key}`);
    throw new Error(errorMessage);
  }

  return value;
}

// Export lazy getters that only evaluate when accessed
export const config = {
  get supabaseUrl(): string {
    return getEnvVar(
      'EXPO_PUBLIC_SUPABASE_URL',
      'Supabase URL is missing. Ensure EXPO_PUBLIC_SUPABASE_URL is set in EAS secrets.'
    );
  },
  get supabaseAnonKey(): string {
    return getEnvVar(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'Supabase Anon Key is missing. Ensure EXPO_PUBLIC_SUPABASE_ANON_KEY is set in EAS secrets.'
    );
  },
  get stripePublishableKey(): string {
    return getEnvVar(
      'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'Stripe Publishable Key is missing. Ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in EAS secrets.'
    );
  },
  get apiUrl(): string {
    return getEnvVar(
      'EXPO_PUBLIC_API_URL',
      'API URL is missing. Ensure EXPO_PUBLIC_API_URL is set in EAS secrets.'
    );
  },
};
