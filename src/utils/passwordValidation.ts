/**
 * Password validation utilities to ensure secure hashing
 */

import { getFixedSalt, isPasswordHashingSupported } from './passwordHashing';

/**
 * Validate that the application is properly configured for secure password hashing
 * This should be called on app startup
 */
export function validatePasswordHashingSetup(): void {
  console.log('🔍 Validating password hashing setup...');
  
  // Check if crypto.subtle is supported
  if (!isPasswordHashingSupported()) {
    throw new Error(
      'Password hashing is not supported in this browser. ' +
      'Please use a modern browser with crypto.subtle support (HTTPS required).'
    );
  }
  
  // Check if salt is configured
  try {
    const salt = getFixedSalt();
    console.log('✅ Password hashing setup validation passed');
    console.log('   - crypto.subtle is supported');
    console.log('   - REACT_APP_PASSWORD_SALT is configured');
    console.log('   - Salt length:', salt.length, 'characters');
  } catch (error) {
    console.error('❌ Password hashing setup validation failed:', error);
    throw error;
  }
}

/**
 * Validate that a password appears to be plain text (not already hashed)
 */
export function validatePlainTextPassword(password: string): void {
  // Check if it looks like a hash (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(password)) {
    throw new Error('Password appears to be already hashed. Please provide plain text password.');
  }
  
  // Check minimum length
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  
  // Check maximum length (reasonable limit for plain text)
  if (password.length > 128) {
    throw new Error('Password is too long. Maximum 128 characters allowed.');
  }
}

/**
 * Validate that a password appears to be properly hashed
 */
export function validateHashedPassword(hashedPassword: string): void {
  if (!hashedPassword) {
    throw new Error('Hashed password is required.');
  }
  
  if (hashedPassword.length !== 64) {
    throw new Error(`Invalid hash length. Expected 64 characters, got ${hashedPassword.length}.`);
  }
  
  if (!/^[a-f0-9]{64}$/i.test(hashedPassword)) {
    throw new Error('Invalid hash format. Must be 64 hexadecimal characters.');
  }
}

/**
 * Get password security status for debugging
 */
export function getPasswordSecurityStatus(): {
  cryptoSupported: boolean;
  saltConfigured: boolean;
  saltLength: number;
  securityLevel: 'high' | 'medium' | 'low' | 'none';
} {
  const cryptoSupported = isPasswordHashingSupported();
  let saltConfigured = false;
  let saltLength = 0;
  
  try {
    const salt = getFixedSalt();
    saltConfigured = true;
    saltLength = salt.length;
  } catch {
    saltConfigured = false;
  }
  
  let securityLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  
  if (cryptoSupported && saltConfigured) {
    if (saltLength >= 64) {
      securityLevel = 'high';
    } else if (saltLength >= 32) {
      securityLevel = 'medium';
    } else {
      securityLevel = 'low';
    }
  }
  
  return {
    cryptoSupported,
    saltConfigured,
    saltLength,
    securityLevel
  };
}