import CryptoJS from 'crypto-js';

/**
 * Password hashing utilities for client-side password security
 * 
 * SECURITY NOTE: This is an additional security layer. The backend should
 * still implement proper password hashing (bcrypt/scrypt) as the primary security measure.
 */

interface HashedPassword {
  hash: string;
  salt: string;
}

/**
 * Generate a random salt for password hashing
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

/**
 * Hash a password with a given salt using PBKDF2
 * @param password - The plain text password
 * @param salt - The salt to use for hashing
 * @param iterations - Number of iterations (default: 10000)
 * @returns The hashed password
 */
export const hashPasswordWithSalt = (
  password: string, 
  salt: string, 
  iterations: number = 10000
): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: iterations
  }).toString(CryptoJS.enc.Hex);
};

/**
 * Hash a password with a new random salt
 * @param password - The plain text password
 * @param iterations - Number of iterations (default: 10000)
 * @returns Object containing the hash and salt
 */
export const hashPassword = (password: string, iterations: number = 10000): HashedPassword => {
  const salt = generateSalt();
  const hash = hashPasswordWithSalt(password, salt, iterations);
  
  return {
    hash,
    salt
  };
};

/**
 * Verify a password against a hash and salt
 * @param password - The plain text password to verify
 * @param hash - The stored hash
 * @param salt - The stored salt
 * @param iterations - Number of iterations used (default: 10000)
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = (
  password: string, 
  hash: string, 
  salt: string, 
  iterations: number = 10000
): boolean => {
  const computedHash = hashPasswordWithSalt(password, salt, iterations);
  return computedHash === hash;
};

/**
 * Create a deterministic hash for API transmission
 * This creates a consistent hash that can be used for login verification
 * @param password - The plain text password
 * @param userEmail - User's email (used as additional salt)
 * @returns A deterministic hash for API transmission
 */
export const createApiPasswordHash = (password: string, userEmail: string): string => {
  // Use email as part of the salt for deterministic hashing
  const emailSalt = CryptoJS.SHA256(userEmail.toLowerCase()).toString(CryptoJS.enc.Hex);
  
  // Create a deterministic hash using PBKDF2
  return CryptoJS.PBKDF2(password, emailSalt, {
    keySize: 256 / 32,
    iterations: 5000 // Lower iterations for API calls to reduce client load
  }).toString(CryptoJS.enc.Hex);
};

/**
 * Validate password strength
 * @param password - The password to validate
 * @returns Object with validation result and error messages
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-5 strength score
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  } else {
    score += 1;
  }

  // Additional complexity checks
  if (password.length >= 16) score += 1;
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 1;

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5)
  };
};

/**
 * Get password strength description
 * @param score - Password strength score (0-5)
 * @returns Human-readable strength description
 */
export const getPasswordStrengthText = (score: number): {
  text: string;
  color: 'error' | 'warning' | 'info' | 'success';
} => {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Very Weak', color: 'error' };
    case 2:
      return { text: 'Weak', color: 'error' };
    case 3:
      return { text: 'Fair', color: 'warning' };
    case 4:
      return { text: 'Good', color: 'info' };
    case 5:
      return { text: 'Strong', color: 'success' };
    default:
      return { text: 'Unknown', color: 'error' };
  }
};

/**
 * Secure password generation utility
 * @param length - Desired password length (default: 16)
 * @returns A cryptographically secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
  const randomBytes = CryptoJS.lib.WordArray.random(length);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.abs(randomBytes.words[Math.floor(i / 4)] >> ((i % 4) * 8)) % charset.length;
    password += charset[randomIndex];
  }
  
  return password;
};