/**
 * Security utilities index
 * Centralized exports for all security-related utilities
 */

// Export password hashing utilities
export { 
  hashPassword,
  getFixedSalt,
  isPasswordHashingSupported,
  loginWithHashedPassword,
  registerWithHashedPassword,
  changePasswordWithHashing,
  isValidHashedPassword,
  getClientHashInfo
} from './passwordHashing';

// Export security utilities
export { 
  validatePasswordStrength,
  getPasswordStrengthText,
  sanitizeUserInput as sanitizeInput,
  isValidEmail as validateEmail,
  isValidPhone as validatePhone
} from './security';