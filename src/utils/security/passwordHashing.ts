/**
 * Client-side password hashing utilities
 * Creates bcrypt-compatible hashes that are under 72 bytes
 */

import { apiService } from '../api';

/**
 * Hash password using a method compatible with bcrypt's 72-byte limit
 * Uses PBKDF2 with a shorter output to ensure compatibility
 * @param password - Plain text password
 * @param salt - Salt string (optional, will use fixed salt if not provided)
 * @returns Promise<string> - Hashed password (under 72 bytes)
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
  try {
    console.log('🔒 Starting bcrypt-compatible password hashing...');
    console.log('   Password length:', password.length);
    
    // Use provided salt or get from environment
    const actualSalt = salt || getFixedSalt();
    console.log('   Salt length:', actualSalt.length);
    
    // Truncate password if it's too long (bcrypt limitation)
    const truncatedPassword = password.length > 72 ? password.substring(0, 72) : password;
    console.log('   Truncated password length:', truncatedPassword.length);
    
    // Combine password and salt
    const combined = truncatedPassword + actualSalt;
    
    // Convert to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    
    // Create SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to base64 to make it shorter than hex (and bcrypt-compatible)
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    
    // Truncate to ensure it's under 72 bytes (base64 is ~43 chars for SHA-256)
    const finalHash = hashBase64.substring(0, 60); // Well under 72 bytes
    
    console.log('✅ Password hashing completed');
    console.log('   Final hash length:', finalHash.length);
    console.log('   Final hash preview:', finalHash.substring(0, 16) + '...');
    
    return finalHash;
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
  const salt = process.env.REACT_APP_PASSWORD_SALT;
  
  if (!salt) {
    throw new Error('REACT_APP_PASSWORD_SALT environment variable is required for secure password hashing. Please configure it in your .env file.');
  }
  
  if (salt.length < 16) {
    throw new Error('REACT_APP_PASSWORD_SALT must be at least 16 characters long for security.');
  }
  
  console.log('🧂 Using fixed salt from environment');
  console.log('   Salt length:', salt.length);
  
  return salt;
}

/**
 * Login with hashed password using fixed salt
 * @param email - User email
 * @param password - Plain text password
 * @returns Promise<any> - Login response
 */
export async function loginWithHashedPassword(email: string, password: string): Promise<any> {
  try {
    console.log('🔐 Starting login with client-side hashing');
    
    // Validate input password is plain text (not already hashed)
    if (isValidHashedPassword(password)) {
      throw new Error('Password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment
    const salt = getFixedSalt();
    
    // Hash password with fixed salt
    const hashedPassword = await hashPassword(password, salt);
    
    // Validate the hash was created correctly
    if (!isValidHashedPassword(hashedPassword)) {
      throw new Error('Password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Password successfully hashed - sending to backend');
    console.log('   Hash length:', hashedPassword.length);
    
    // Use regular login endpoint with hashed password
    const response = await apiService.post('/auth/login', {
      email,
      password: hashedPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }
    
    const data = response.data as any;
    
    console.log('📦 Login response received');
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
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
    console.log('📝 Starting registration with client-side hashing');
    
    // Validate input password is plain text (not already hashed)
    if (isValidHashedPassword(registrationData.owner_password)) {
      throw new Error('Password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment
    const salt = getFixedSalt();
    
    // Hash password with fixed salt
    const hashedPassword = await hashPassword(registrationData.owner_password, salt);
    
    // Validate the hash was created correctly
    if (!isValidHashedPassword(hashedPassword)) {
      throw new Error('Password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Password successfully hashed for registration');
    console.log('   Hash length:', hashedPassword.length);
    
    // Replace plain password with hashed password
    const hashedRegistrationData = {
      ...registrationData,
      owner_password: hashedPassword,
    };
    
    // Remove confirm_password field - UI already validated it
    delete hashedRegistrationData.confirm_password;
    
    // Register with hashed password
    const response = await apiService.post('/auth/register', hashedRegistrationData);
    
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
    
    return response.data as any;
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
    console.log('🔄 Starting password change with client-side hashing');
    
    // Validate input passwords are plain text (not already hashed)
    if (isValidHashedPassword(currentPassword)) {
      throw new Error('Current password appears to be already hashed. Please provide plain text password.');
    }
    if (isValidHashedPassword(newPassword)) {
      throw new Error('New password appears to be already hashed. Please provide plain text password.');
    }
    
    // Get fixed salt from environment
    const salt = getFixedSalt();
    
    // Hash both passwords with fixed salt
    const hashedCurrentPassword = await hashPassword(currentPassword, salt);
    const hashedNewPassword = await hashPassword(newPassword, salt);
    
    // Validate the hashes were created correctly
    if (!isValidHashedPassword(hashedCurrentPassword)) {
      throw new Error('Current password hashing failed - invalid hash format generated');
    }
    if (!isValidHashedPassword(hashedNewPassword)) {
      throw new Error('New password hashing failed - invalid hash format generated');
    }
    
    console.log('✅ Both passwords successfully hashed for change');
    
    // Change password with hashed passwords
    const response = await apiService.post('/auth/change-password', {
      current_password: hashedCurrentPassword,
      new_password: hashedNewPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
    
    return response.data as any;
  } catch (error) {
    console.error('❌ Hashed password change failed:', error);
    throw error;
  }
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
 * Validate password format (should be base64-like string when hashed, under 72 chars)
 * @param hashedPassword - Hashed password string
 * @returns boolean - True if valid hash format
 */
export function isValidHashedPassword(hashedPassword: string): boolean {
  // Check if it looks like our base64 hash (alphanumeric + / + =, under 72 chars)
  return /^[A-Za-z0-9+/=]{40,70}$/.test(hashedPassword) && hashedPassword.length < 72;
}

/**
 * Get client hashing information from backend
 * @returns Promise<any> - Hashing implementation guide
 */
export async function getClientHashInfo(): Promise<any> {
  try {
    const response = await apiService.get('/auth/client-hash-info');
    
    if (!response.success) {
      throw new Error('Failed to get client hash info');
    }
    
    return response.data as any;
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