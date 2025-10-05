/**
 * Centralized Validation System
 * 
 * This module provides a unified validation system for the entire application.
 * All form validations should use these standardized validators to ensure consistency.
 */

// Define ValidationResult for validation compatibility
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  score?: number;
  strength?: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback?: string[];
  requirements?: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    noCommonPatterns: boolean;
  };
}

export type ValidationRule<T = any> = (value: T) => ValidationResult;
export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule[];
};

/**
 * Core validation functions that can be composed together
 */
export const validators = {
  /**
   * Email validation with comprehensive pattern matching
   */
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Email is required' };
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    if (value.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }
    
    return { isValid: true };
  },

  /**
   * Phone number validation (supports 10-digit format)
   */
  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Phone number is required' };
    
    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length !== 10) {
      return { isValid: false, error: 'Phone number must be exactly 10 digits' };
    }
    
    return { isValid: true };
  },

  /**
   * Password validation with strength requirements
   */
  password: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Password is required' };
    
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    
    if (value.length > 128) {
      return { isValid: false, error: 'Password must not exceed 128 characters' };
    }
    
    if (!/(?=.*[a-z])/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one digit' };
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)' };
    }
    
    return { isValid: true };
  },

  /**
   * Required field validation
   */
  required: (fieldName: string) => (value: any): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    return { isValid: true };
  },

  /**
   * Minimum length validation
   */
  minLength: (min: number, fieldName: string) => (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Let required validator handle empty values
    
    if (value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters long` };
    }
    
    return { isValid: true };
  },

  /**
   * Maximum length validation
   */
  maxLength: (max: number, fieldName: string) => (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    
    if (value.length > max) {
      return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
    }
    
    return { isValid: true };
  },

  /**
   * Number validation with optional range
   */
  number: (fieldName: string, min?: number, max?: number) => (value: any): ValidationResult => {
    if (value === '' || value === null || value === undefined) {
      return { isValid: true }; // Let required validator handle empty values
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (min !== undefined && numValue < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min}` };
    }
    
    if (max !== undefined && numValue > max) {
      return { isValid: false, error: `${fieldName} must not exceed ${max}` };
    }
    
    return { isValid: true };
  },

  /**
   * URL validation
   */
  url: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // URL is typically optional
    
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },

  /**
   * Date validation
   */
  date: (fieldName: string, minDate?: Date, maxDate?: Date) => (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: `${fieldName} must be a valid date` };
    }
    
    if (minDate && date < minDate) {
      return { isValid: false, error: `${fieldName} must be after ${minDate.toLocaleDateString()}` };
    }
    
    if (maxDate && date > maxDate) {
      return { isValid: false, error: `${fieldName} must be before ${maxDate.toLocaleDateString()}` };
    }
    
    return { isValid: true };
  },

  /**
   * Pattern matching validation
   */
  pattern: (pattern: RegExp, fieldName: string, errorMessage?: string) => (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    
    if (!pattern.test(value)) {
      return { 
        isValid: false, 
        error: errorMessage || `${fieldName} format is invalid` 
      };
    }
    
    return { isValid: true };
  },

  /**
   * Password confirmation validation
   */
  passwordConfirmation: (originalPassword: string) => (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Please confirm your password' };
    
    if (value !== originalPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }
    
    return { isValid: true };
  },

  /**
   * File validation
   */
  file: (options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}) => (file: File): ValidationResult => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;
    
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { isValid: false, error: `File type ${file.type} is not allowed` };
    }
    
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return { isValid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` };
      }
    }
    
    return { isValid: true };
  },
};

/**
 * Validation rule builders for common use cases
 */
export const validationRules = {
  /**
   * Standard email field validation
   */
  email: () => [validators.required('Email'), validators.email],

  /**
   * Standard password field validation
   */
  password: () => [validators.required('Password'), validators.password],

  /**
   * Password confirmation field validation
   */
  passwordConfirmation: (originalPassword: string) => [
    validators.required('Password confirmation'),
    validators.passwordConfirmation(originalPassword),
  ],

  /**
   * Standard phone number validation
   */
  phone: () => [validators.required('Phone number'), validators.phone],

  /**
   * Standard name field validation
   */
  name: (fieldName: string) => [
    validators.required(fieldName),
    validators.minLength(1, fieldName),
    validators.maxLength(50, fieldName),
  ],

  /**
   * Standard text field validation
   */
  text: (fieldName: string, minLength = 1, maxLength = 255) => [
    validators.required(fieldName),
    validators.minLength(minLength, fieldName),
    validators.maxLength(maxLength, fieldName),
  ],

  /**
   * Optional text field validation
   */
  optionalText: (fieldName: string, maxLength = 255) => [
    validators.maxLength(maxLength, fieldName),
  ],

  /**
   * Standard number field validation
   */
  number: (fieldName: string, min?: number, max?: number) => [
    validators.required(fieldName),
    validators.number(fieldName, min, max),
  ],

  /**
   * Optional number field validation
   */
  optionalNumber: (fieldName: string, min?: number, max?: number) => [
    validators.number(fieldName, min, max),
  ],

  /**
   * Standard URL field validation
   */
  url: () => [validators.url],

  /**
   * Standard date field validation
   */
  date: (fieldName: string, minDate?: Date, maxDate?: Date) => [
    validators.required(fieldName),
    validators.date(fieldName, minDate, maxDate),
  ],

  /**
   * Optional date field validation
   */
  optionalDate: (fieldName: string, minDate?: Date, maxDate?: Date) => [
    validators.date(fieldName, minDate, maxDate),
  ],
};

/**
 * Utility function to validate a single field
 */
export const validateField = <T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * Utility function to validate an entire form
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const field in rules) {
    const fieldRules = rules[field];
    if (fieldRules) {
      const result = validateField(values[field], fieldRules);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};

/**
 * Utility function to get character count text for form fields
 */
export const getCharacterCountText = (
  value: string,
  maxLength: number,
  baseText: string
): string => {
  return `${baseText} (${value.length}/${maxLength})`;
};

/**
 * Utility function to format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string[] => {
  return Object.values(errors).filter(Boolean);
};

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\\d{10}$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_ONLY: /^[a-zA-Z]+$/,
  NUMERIC_ONLY: /^\\d+$/,
} as const;

// Re-export specialized validation modules
export * from './registrationValidation';

/**
 * Common validation limits
 */
export const VALIDATION_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_LENGTH: 10,
  FILE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const;