/**
 * Forms Components Barrel Export
 * 
 * Centralized export for all form-related components
 */

export {
  StandardForm,
  ContactForm,
  LoginForm,
  UserRegistrationForm,
} from './StandardForm';

// Re-export form validation utilities for convenience
export {
  useFormValidation,
  useSimpleFormValidation,
  usePerformantFormValidation,
} from '../../hooks/useFormValidation';

export {
  validators,
  validationRules,
  validateField,
  validateForm,
  type ValidationResult,
  type ValidationRule,
  type ValidationRules,
} from '../../utils/validation';