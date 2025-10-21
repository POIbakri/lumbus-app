/**
 * Security Validation Utilities
 */

/**
 * Validate UUID format (for order IDs, plan IDs, etc.)
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate region name format (only letters, spaces, hyphens, apostrophes)
 */
export function isValidRegionName(region: string): boolean {
  if (!region || typeof region !== 'string') return false;
  if (region.length > 100) return false;
  return /^[a-zA-Z\s\-']+$/.test(region);
}

/**
 * Validate LPA string format (for eSIM activation)
 * Format: LPA:1$smdp$activation_code
 */
export function isValidLPAString(lpa: string): boolean {
  if (!lpa || typeof lpa !== 'string') return false;
  return /^LPA:1\$[\w\-\.]+\$[\w\-]+$/.test(lpa);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Enhanced password validation
 * Returns { valid: boolean, error?: string }
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  // Minimum length check
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  // Maximum length check (prevent DoS)
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for complexity (at least 2 of: uppercase, lowercase, number, special char)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/.test(password);

  const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  if (complexityCount < 2) {
    return {
      valid: false,
      error: 'Password must contain at least 2 of: uppercase letter, lowercase letter, number, or special character',
    };
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '12345678', 'qwertyui', 'abcdefgh', '11111111',
    'password1', 'password123', 'welcome1', 'admin123', 'letmein1',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'This password is too common. Please choose a stronger password.' };
  }

  // Check for repeated characters (e.g., "aaaaaaaa")
  if (/(.)\1{7,}/.test(password)) {
    return { valid: false, error: 'Password cannot have too many repeated characters' };
  }

  return { valid: true };
}

/**
 * Sanitize string for safe display (remove potentially dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  // Trim to max length
  let sanitized = input.slice(0, maxLength);
  
  // Remove control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return sanitized.trim();
}
