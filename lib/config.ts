// Direct access to environment variables with lazy evaluation
// Metro can only inline process.env.EXPO_PUBLIC_* when accessed directly, not dynamically

function validateValue(value: string | undefined, varName: string, errorMessage: string): string {
  if (!value || value === 'undefined' || value.trim() === '') {
    console.error(`[CONFIG ERROR] Missing or invalid: ${varName}`);
    console.error(`[CONFIG ERROR] Value received:`, JSON.stringify(value));
    throw new Error(`${errorMessage}\n\nReceived value: ${JSON.stringify(value)}`);
  }
  return value;
}

// Export lazy getters with DIRECT process.env access (required for Metro inlining)
export const config = {
  get supabaseUrl(): string {
    return validateValue(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      'EXPO_PUBLIC_SUPABASE_URL',
      'Supabase URL is missing. Ensure EXPO_PUBLIC_SUPABASE_URL is set in EAS secrets.'
    );
  },
  get supabaseAnonKey(): string {
    return validateValue(
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'Supabase Anon Key is missing. Ensure EXPO_PUBLIC_SUPABASE_ANON_KEY is set in EAS secrets.'
    );
  },
  get stripePublishableKey(): string {
    return validateValue(
      process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'Stripe Publishable Key is missing. Ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in EAS secrets.'
    );
  },
  get apiUrl(): string {
    return validateValue(
      process.env.EXPO_PUBLIC_API_URL,
      'EXPO_PUBLIC_API_URL',
      'API URL is missing. Ensure EXPO_PUBLIC_API_URL is set in EAS secrets.'
    );
  },
};
