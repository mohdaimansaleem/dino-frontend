/**
 * Security utilities index
 * Centralized exports for all security-related utilities
 */

// Export specific functions to avoid conflicts
export { 
  hashPassword as hashPasswordBcrypt, 
  getFixedSalt,
  isPasswordHashingSupported,
  loginWithHashedPassword,
  registerWithHashedPassword,
  changePasswordWithHashing
} from './passwordHashing';

export { 
  hashPassword as hashPasswordSHA256, 
  validatePasswordStrength,
  getPasswordStrengthText,
  generateSalt,
  hashPasswordWithSalt as hashWithSalt,
  verifyPassword as verifyPasswordUtils,
  validatePlainTextPassword
} from './passwordUtils';

export { 
  validatePasswordStrength as validatePasswordStrengthSecurity,
  sanitizeUserInput as sanitizeInput,
  isValidEmail as validateEmail,
  isValidPhone as checkPasswordComplexity
} from './security';

export { validatePasswordHashingSetup } from './passwordSecurity';

// Default hashPassword export (prefer bcrypt)
export { hashPassword } from './passwordHashing';

// Default verifyPassword export
export { verifyPassword } from './passwordUtils';