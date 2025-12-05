import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { supabase } from '../supabase';
import { logger } from '../logger';

// Warm up the browser for better performance
WebBrowser.maybeCompleteAuthSession();

/**
 * Send welcome email to new users (fire-and-forget)
 * Safe to call multiple times - endpoint has duplicate prevention
 */
export function sendWelcomeEmail(user: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } }) {
  if (!user.email) return;

  fetch('https://getlumbus.com/api/user/welcome-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      userName: user.user_metadata?.full_name || user.user_metadata?.name
    })
  }).catch(() => {}); // Fire-and-forget, don't block auth flow
}

/**
 * Sign in with Apple (iOS only)
 */
export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign In is not available on this device. Please use iOS 13+ or sign in with email.',
      };
    }

    // Request Apple authentication
    // We need to generate a nonce for Supabase to verify the integrity of the ID token
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In failed - no identity token returned');
    }

    // Sign in to Supabase with Apple ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) {
      logger.error('Apple Sign In - Supabase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Apple',
      };
    }

    logger.info('Apple Sign In successful:', data.user?.email);

    // Send welcome email for new users (fire-and-forget)
    if (data.user) {
      sendWelcomeEmail(data.user);
    }

    return { success: true };

  } catch (error: any) {
    // Check for various cancellation codes from Apple Auth
    // 'ERR_REQUEST_CANCELED' (Android/General)
    // 'ERR_CANCELED' (Expo)
    // '1001' (iOS ASAuthorizationErrorCanceled)
    if (
      error.code === 'ERR_REQUEST_CANCELED' || 
      error.code === 'ERR_CANCELED' || 
      error.code === '1001' ||
      (error.message && error.message.includes('canceled')) ||
      (error.message && error.message.includes('The authorization attempt failed for an unknown reason')) // Often masked cancellation on simulators/dev
    ) {
      // User canceled the sign-in flow
      logger.info('Apple Sign In canceled by user');
      return {
        success: false,
        error: 'canceled',
      };
    }

    logger.error('Apple Sign In error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during Apple Sign In',
    };
  }
}

/**
 * Sign in with Google (iOS and Android)
 */
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a redirect URI for OAuth callback
    const redirectUri = makeRedirectUri({
      scheme: 'lumbus',
      path: 'auth/callback',
    });

    // NOTE: When using skipBrowserRedirect: true with PKCE, Supabase's signInWithOAuth
    // does not automatically return the code_challenge/verifier pair.
    // However, for mobile apps, Supabase v2 client handles the PKCE flow internally
    // when not skipping browser redirect, OR we can rely on the automatic handling
    // if we let Supabase construct the URL.
    //
    // The issue is that when we manually handle the redirect, we need the verifier.
    // BUT, Supabase JS client v2 stores the verifier in local storage before returning the URL.
    // So when we call exchangeCodeForSession(code), it should automatically look up the verifier
    // from storage if it was set correctly.
    
    // Get the Supabase Google OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('Google Sign In - OAuth URL error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize Google Sign In',
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'No OAuth URL returned from Supabase',
      };
    }

    // Extract the state parameter from the generated URL to validate it later (CSRF protection)
    // Supabase generates this state automatically
    const urlParams = new URLSearchParams(data.url.split('?')[1]);
    const expectedState = urlParams.get('state');

    // Open the browser for Google OAuth
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri
    );

    if (result.type === 'cancel') {
      logger.info('Google Sign In canceled by user');
      return {
        success: false,
        error: 'canceled',
      };
    }

    if (result.type === 'success') {
      // Extract the URL parameters
      const url = result.url;
      const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);

      const returnedState = params.get('state');
      
      // Validate state to prevent CSRF attacks
      if (expectedState && returnedState !== expectedState) {
        logger.error('Google Sign In - State mismatch (CSRF check failed)');
        return {
          success: false,
          error: 'Security check failed. Please try again.',
        };
      }

      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (code) {
        // Handle PKCE flow (recommended)
        // IMPORTANT: exchangeCodeForSession automatically retrieves the code_verifier
        // from the storage (SecureStore) where signInWithOAuth stored it.
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          logger.error('Google Sign In - PKCE Session error:', sessionError);
          return {
            success: false,
            error: sessionError.message,
          };
        }

        logger.info('Google Sign In successful (PKCE)');

        // Send welcome email for new users (fire-and-forget)
        if (sessionData.user) {
          sendWelcomeEmail(sessionData.user);
        }

        return { success: true };
      }

      if (accessToken && refreshToken) {
        // Handle Implicit flow (legacy)
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          logger.error('Google Sign In - Implicit Session error:', sessionError);
          return {
            success: false,
            error: sessionError.message,
          };
        }

        logger.info('Google Sign In successful (Implicit)');

        // Send welcome email for new users (fire-and-forget)
        if (sessionData.user) {
          sendWelcomeEmail(sessionData.user);
        }

        return { success: true };
      }
    }

    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    };

  } catch (error: any) {
    logger.error('Google Sign In error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during Google Sign In',
    };
  }
}

/**
 * Check if Apple Sign In is available on the current device
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Handle social auth errors and display appropriate alerts
 */
export function handleSocialAuthError(error: string, provider: 'apple' | 'google') {
  if (error === 'canceled') {
    // Don't show an alert for user cancellation
    return;
  }

  const providerName = provider === 'apple' ? 'Apple' : 'Google';

  Alert.alert(
    `${providerName} Sign In Failed`,
    error,
    [{ text: 'OK' }]
  );
}
