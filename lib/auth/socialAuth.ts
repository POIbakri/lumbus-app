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
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Sign in to Supabase with Apple ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
    });

    if (error) {
      logger.error('Apple Sign In - Supabase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Apple',
      };
    }

    logger.info('Apple Sign In successful:', data.user?.email);
    return { success: true };

  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
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

    // Generate a random state parameter for security
    const state = Crypto.randomUUID();

    // Get the Supabase Google OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
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

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session in Supabase
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          logger.error('Google Sign In - Session error:', sessionError);
          return {
            success: false,
            error: sessionError.message,
          };
        }

        logger.info('Google Sign In successful');
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
