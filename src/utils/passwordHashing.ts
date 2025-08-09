/**
 * Client-side password hashing utilities
 * Implements secure password hashing before transmission to backend
 */

import { createApiUrl, getDefaultFetchOptions, getAuthenticatedFetchOptions } from './apiConfig';

/**
 * Hash password using SHA-256 with salt
 * @param password - Plain text password
 * @param salt - Salt string from backend
 * @returns Promise<string> - Hashed password (64 character hex string)
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  try {
    console.log('🔒 Starting password hashing...');
    console.log('   Password length:', password.length);
    console.log('   Salt length:', salt.length);
    console.log('   Salt (first 16 chars):', salt.substring(0, 16) + '...');
    
    // Combine password and salt
    const combined = password + salt;
    console.log('   Combined length:', combined.length);
    
    // Convert to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    console.log('   Encoded data length:', data.length);
    
    // Create SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    console.log('   Hash buffer length:', hashBuffer.byteLength);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('✅ Password hashing completed');
    console.log('   Final hash length:', hashHex.length);
    console.log('   Final hash:', hashHex);
    
    return hashHex;
  } catch (error) {
    console.error('❌ Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Get salt from environment variable
 * @returns string - Fixed salt from environment
 */
export function getFixedSalt(): string {
  // MANDATORY: Get salt from environment variable - NO DEFAULTS ALLOWED
  const salt = process.env.REACT_APP_PASSWORD_SALT;
  
  if (!salt) {
    throw new Error('REACT_APP_PASSWORD_SALT environment variable is required for secure password hashing. Please configure it in your .env file.');
  }
  
  if (salt.length < 32) {
    throw new Error('REACT_APP_PASSWORD_SALT must be at least 32 characters long for security.');
  }
  
  console.log('🧂 Using MANDATORY fixed salt from environment');
  console.log('   Salt length:', salt.length);
  console.log('   Salt (first 16 chars):', salt.substring(0, 16) + '...');
  
  return salt;
}

/**
 * Get user salt from backend (DEPRECATED - now using fixed salt)
 * @param email - User email
 * @returns Promise<string> - User salt
 * @deprecated Use getFixedSalt() instead
 */
export async function getUserSalt(email: string): Promise<string> {
  console.log('⚠️ getUserSalt is deprecated, using fixed salt instead');
  return getFixedSalt();
}

/**
 * Login with hashed password using fixed salt
 * @param email - User email
 * @param password - Plain text password
 * @returns Promise<any> - Login response
 */
export async function loginWithHashedPassword(email: string, password: string): Promise<any> {
  try {
    console.log('🔐 Starting MANDATORY login with fixed salt hashing');
    
    // MANDATORY: Validate input password is plain text (not already hashed)
    if (isValidHashedPassword(password)) {
      throw new Error('Password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment (will throw if missing)
    const salt = getFixedSalt();
    
    // Hash password with fixed salt
    const hashedPassword = await hashPassword(password, salt);
    
    // MANDATORY: Validate the hash was created correctly
    if (!isValidHashedPassword(hashedPassword)) {
      throw new Error('Password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Password successfully hashed - sending to backend');
    console.log('   Hash length:', hashedPassword.length);
    console.log('   Hash preview:', hashedPassword.substring(0, 16) + '...');
    
    // Use regular login endpoint with hashed password
    const response = await fetch(createApiUrl('/auth/login'), {
      method: 'POST',
      ...getDefaultFetchOptions(),
      body: JSON.stringify({
        email,
        password: hashedPassword, // GUARANTEED to be 64-char hash, never plain text
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    
    const data = await response.json();
    
    // Transform response to match authService format
    console.log('📦 Login response data:', data);
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token, // Include refresh token
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600,
      user: data.user
    };
  } catch (error) {
    console.error('❌ Hashed login failed:', error);
    throw error;
  }
}

/**
 * Register with hashed password using fixed salt
 * @param registrationData - Registration data with plain text password
 * @returns Promise<any> - Registration response
 */
export async function registerWithHashedPassword(registrationData: any): Promise<any> {
  try {
    console.log('📝 Starting MANDATORY registration with fixed salt hashing');
    
    // MANDATORY: Validate input password is plain text (not already hashed)
    if (isValidHashedPassword(registrationData.owner_password)) {
      throw new Error('Password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment (will throw if missing)
    const salt = getFixedSalt();
    
    // Hash password with fixed salt
    const hashedPassword = await hashPassword(registrationData.owner_password, salt);
    
    // MANDATORY: Validate the hash was created correctly
    if (!isValidHashedPassword(hashedPassword)) {
      throw new Error('Password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Password successfully hashed for registration - sending to backend');
    console.log('   Hash length:', hashedPassword.length);
    console.log('   Hash preview:', hashedPassword.substring(0, 16) + '...');
    
    // Replace plain password with hashed password - NO confirm_password needed
    const hashedRegistrationData = {
      ...registrationData,
      owner_password: hashedPassword, // GUARANTEED to be 64-char hash, never plain text
    };
    
    // Remove confirm_password field - UI already validated it
    delete hashedRegistrationData.confirm_password;
    
    // Register with hashed password
    const response = await fetch(createApiUrl('/auth/register'), {
      method: 'POST',
      ...getDefaultFetchOptions(),
      body: JSON.stringify(hashedRegistrationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Hashed registration failed:', error);
    throw error;
  }
}

/**
 * Change password with hashing using fixed salt
 * @param currentPassword - Current plain text password
 * @param newPassword - New plain text password
 * @param authToken - JWT token
 * @returns Promise<any> - Change password response
 */
export async function changePasswordWithHashing(
  currentPassword: string,
  newPassword: string,
  authToken: string
): Promise<any> {
  try {
    console.log('🔄 Starting MANDATORY password change with fixed salt hashing');
    
    // MANDATORY: Validate input passwords are plain text (not already hashed)
    if (isValidHashedPassword(currentPassword)) {
      throw new Error('Current password appears to be already hashed. Please provide plain text password.');
    }
    if (isValidHashedPassword(newPassword)) {
      throw new Error('New password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment (will throw if missing)
    const salt = getFixedSalt();
    
    // Hash both passwords with fixed salt
    const hashedCurrentPassword = await hashPassword(currentPassword, salt);
    const hashedNewPassword = await hashPassword(newPassword, salt);
    
    // MANDATORY: Validate the hashes were created correctly
    if (!isValidHashedPassword(hashedCurrentPassword)) {
      throw new Error('Current password hashing failed - invalid hash format generated');
    }
    if (!isValidHashedPassword(hashedNewPassword)) {
      throw new Error('New password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Both passwords successfully hashed for change - sending to backend');
    console.log('   Current hash length:', hashedCurrentPassword.length);
    console.log('   New hash length:', hashedNewPassword.length);
    
    // Change password with hashed passwords
    const response = await fetch(createApiUrl('/auth/change-password'), {
      method: 'POST',
      ...getAuthenticatedFetchOptions(authToken),
      body: JSON.stringify({
        current_password: hashedCurrentPassword, // GUARANTEED to be 64-char hash
        new_password: hashedNewPassword, // GUARANTEED to be 64-char hash
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Password change failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Hashed password change failed:', error);
    throw error;
  }
}

/**
 * Generate random salt for new users (DEPRECATED - now using fixed salt)
 * @returns string - Fixed salt
 * @deprecated Use getFixedSalt() instead
 */
function generateRandomSalt(): string {
  console.log('⚠️ generateRandomSalt is deprecated, using fixed salt instead');
  return getFixedSalt();
}

/**
 * Check if password hashing is supported
 * @returns boolean - True if crypto.subtle is available
 */
export function isPasswordHashingSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.subtle.digest === 'function';
}

/**
 * Validate password format (should be 64 character hex string when hashed)
 * @param hashedPassword - Hashed password string
 * @returns boolean - True if valid hash format
 */
export function isValidHashedPassword(hashedPassword: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hashedPassword);
}

/**
 * Get client hashing information from backend
 * @returns Promise<any> - Hashing implementation guide
 */
export async function getClientHashInfo(): Promise<any> {
  try {
    const response = await fetch(createApiUrl('/auth/client-hash-info'));
    
    if (!response.ok) {
      throw new Error('Failed to get client hash info');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to get client hash info:', error);
    throw error;
  }
}

// Export types for TypeScript
export interface HashingConfig {
  algorithm: string;
  salt_length: number;
  implementation_guide: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    example_js: string;
    example_python: string;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: any;
}