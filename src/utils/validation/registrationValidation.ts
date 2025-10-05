/**
 * Registration Form Validation
 * 
 * Specialized validation rules for the registration process that extend
 * the centralized validation system with business-specific logic.
 */

import { validators, validateForm, type ValidationRules } from './index';
import type { ValidationResult } from './index';

export interface RegistrationFormData {
  // Workspace Information
  workspaceName: string;
  workspaceDescription: string;
  
  // Venue Information
  venueName: string;
  venueDescription: string;
  venueLocation: {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    landmark: string;
  };
  venuePhone: string;
  venueEmail: string;
  priceRange: string;
  venueType: string;
  
  // Owner Information
  ownerEmail: string;
  ownerPhone: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
  confirmPassword: string;
}

/**
 * Registration-specific validation rules that match backend DTO constraints
 */
export const REGISTRATION_VALIDATION_RULES = {
  workspace: {
    name: { minLength: 5, maxLength: 100, required: true },
    description: { maxLength: 500, required: false }
  },
  venue: {
    name: { minLength: 1, maxLength: 100, required: true },
    description: { maxLength: 1000, required: false },
    address: { minLength: 5, required: true },
    city: { minLength: 1, required: true },
    state: { minLength: 1, required: true },
    postalCode: { required: false }, // Made optional as per existing logic
    landmark: { maxLength: 100, required: false },
    phone: { pattern: /^[0-9]{10}$/, required: true },
    email: { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, required: false },
  },
  owner: {
    firstName: { minLength: 1, maxLength: 50, required: true },
    lastName: { minLength: 1, maxLength: 50, required: true },
    email: { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, required: true },
    phone: { pattern: /^[0-9]{10}$/, required: true },
    password: {
      minLength: 8,
      maxLength: 128,
      required: true,
      patterns: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        digit: /\d/,
        special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/
      }
    }
  }
} as const;

/**
 * Create validation rules for workspace step
 */
export const createWorkspaceValidationRules = (): ValidationRules<Pick<RegistrationFormData, 'workspaceName' | 'workspaceDescription'>> => ({
  workspaceName: [
    validators.required('Workspace name'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.workspace.name.minLength, 'Workspace name'),
    validators.maxLength(REGISTRATION_VALIDATION_RULES.workspace.name.maxLength, 'Workspace name'),
  ],
  workspaceDescription: [
    validators.maxLength(REGISTRATION_VALIDATION_RULES.workspace.description.maxLength, 'Workspace description'),
  ],
});

/**
 * Create validation rules for venue step
 */
export const createVenueValidationRules = (): ValidationRules<Pick<RegistrationFormData, 'venueName' | 'venueDescription' | 'venuePhone' | 'venueEmail'>> => ({
  venueName: [
    validators.required('Venue name'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.venue.name.minLength, 'Venue name'),
    validators.maxLength(REGISTRATION_VALIDATION_RULES.venue.name.maxLength, 'Venue name'),
  ],
  venueDescription: [
    validators.maxLength(REGISTRATION_VALIDATION_RULES.venue.description.maxLength, 'Venue description'),
  ],
  venuePhone: [
    validators.required('Venue phone number'),
    validators.phone,
  ],
  venueEmail: [
    // Email is optional for venue
    validators.email,
  ],
});

/**
 * Create validation rules for venue location
 */
export const createVenueLocationValidationRules = () => ({
  address: [
    validators.required('Address'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.venue.address.minLength, 'Address'),
  ],
  city: [
    validators.required('City'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.venue.city.minLength, 'City'),
  ],
  state: [
    validators.required('State'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.venue.state.minLength, 'State'),
  ],
  country: [
    validators.required('Country'),
  ],
  landmark: [
    validators.maxLength(REGISTRATION_VALIDATION_RULES.venue.landmark.maxLength, 'Landmark'),
  ],
  postal_code: [
    // postal_code is optional - no validation rules
  ],
});

/**
 * Create validation rules for owner step
 */
export const createOwnerValidationRules = (formData: RegistrationFormData): ValidationRules<Pick<RegistrationFormData, 'ownerFirstName' | 'ownerLastName' | 'ownerEmail' | 'ownerPhone' | 'ownerPassword' | 'confirmPassword'>> => ({
  ownerFirstName: [
    validators.required('First name'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.owner.firstName.minLength, 'First name'),
    validators.maxLength(REGISTRATION_VALIDATION_RULES.owner.firstName.maxLength, 'First name'),
  ],
  ownerLastName: [
    validators.required('Last name'),
    validators.minLength(REGISTRATION_VALIDATION_RULES.owner.lastName.minLength, 'Last name'),
    validators.maxLength(REGISTRATION_VALIDATION_RULES.owner.lastName.maxLength, 'Last name'),
  ],
  ownerEmail: [
    validators.required('Email'),
    validators.email,
  ],
  ownerPhone: [
    validators.required('Phone number'),
    validators.phone,
  ],
  ownerPassword: [
    validators.required('Password'),
    validators.password,
  ],
  confirmPassword: [
    validators.required('Password confirmation'),
    validators.passwordConfirmation(formData.ownerPassword),
  ],
});

/**
 * Validate workspace information (Step 0)
 */
export function validateWorkspaceStep(data: RegistrationFormData): { isValid: boolean; errors: Record<string, string> } {
  const rules = createWorkspaceValidationRules();
  const workspaceData = {
    workspaceName: data.workspaceName,
    workspaceDescription: data.workspaceDescription,
  };
  
  return validateForm(workspaceData, rules);
}

/**
 * Validate venue information (Step 1)
 */
export function validateVenueStep(data: RegistrationFormData): { isValid: boolean; errors: Record<string, string> } {
  const venueRules = createVenueValidationRules();
  const locationRules = createVenueLocationValidationRules();
  
  // Validate venue basic info
  const venueData = {
    venueName: data.venueName,
    venueDescription: data.venueDescription,
    venuePhone: data.venuePhone,
    venueEmail: data.venueEmail,
  };
  
  const venueResult = validateForm(venueData, venueRules);
  
  // Validate venue location
  const locationResult = validateForm(data.venueLocation, locationRules);
  
  // Combine results
  const combinedErrors = { ...venueResult.errors, ...locationResult.errors };
  
  return {
    isValid: venueResult.isValid && locationResult.isValid,
    errors: combinedErrors,
  };
}

/**
 * Validate owner account information (Step 2)
 */
export function validateOwnerStep(data: RegistrationFormData): { isValid: boolean; errors: Record<string, string> } {
  const rules = createOwnerValidationRules(data);
  const ownerData = {
    ownerFirstName: data.ownerFirstName,
    ownerLastName: data.ownerLastName,
    ownerEmail: data.ownerEmail,
    ownerPhone: data.ownerPhone,
    ownerPassword: data.ownerPassword,
    confirmPassword: data.confirmPassword,
  };
  
  return validateForm(ownerData, rules);
}

/**
 * Validate specific field for real-time feedback
 */
export function validateRegistrationField(
  field: keyof RegistrationFormData | string,
  value: any,
  formData: RegistrationFormData
): string | null {
  // Handle nested venue location fields
  if (field.startsWith('venueLocation.')) {
    const locationField = field.replace('venueLocation.', '') as keyof RegistrationFormData['venueLocation'];
    const locationRules = createVenueLocationValidationRules();
    const rule = locationRules[locationField];
    
    if (rule) {
      for (const validator of rule) {
        const result = validator(value);
        if (!result.isValid) {
          return result.error || null;
        }
      }
    }
    return null;
  }
  
  // Handle regular fields
  switch (field) {
    case 'workspaceName':
    case 'workspaceDescription': {
      const rules = createWorkspaceValidationRules();
      const rule = rules[field as keyof typeof rules];
      if (rule) {
        for (const validator of rule) {
          const result = validator(value);
          if (!result.isValid) {
            return result.error || null;
          }
        }
      }
      break;
    }
    
    case 'venueName':
    case 'venueDescription':
    case 'venuePhone':
    case 'venueEmail': {
      const rules = createVenueValidationRules();
      const rule = rules[field as keyof typeof rules];
      if (rule) {
        for (const validator of rule) {
          const result = validator(value);
          if (!result.isValid) {
            return result.error || null;
          }
        }
      }
      break;
    }
    
    case 'ownerFirstName':
    case 'ownerLastName':
    case 'ownerEmail':
    case 'ownerPhone':
    case 'ownerPassword':
    case 'confirmPassword': {
      const rules = createOwnerValidationRules(formData);
      const rule = rules[field as keyof typeof rules];
      if (rule) {
        for (const validator of rule) {
          const result = validator(value);
          if (!result.isValid) {
            return result.error || null;
          }
        }
      }
      break;
    }
  }
  
  return null;
}

/**
 * Get character count helper text
 */
export function getCharacterCountText(field: string, value: string, baseText: string): string {
  const maxLengths: Record<string, number> = {
    workspaceName: REGISTRATION_VALIDATION_RULES.workspace.name.maxLength,
    workspaceDescription: REGISTRATION_VALIDATION_RULES.workspace.description.maxLength,
    venueName: REGISTRATION_VALIDATION_RULES.venue.name.maxLength,
    venueDescription: REGISTRATION_VALIDATION_RULES.venue.description.maxLength,
    ownerFirstName: REGISTRATION_VALIDATION_RULES.owner.firstName.maxLength,
    ownerLastName: REGISTRATION_VALIDATION_RULES.owner.lastName.maxLength,
  };

  const maxLength = maxLengths[field];
  if (maxLength) {
    return `${baseText} (${value.length}/${maxLength})`;
  }

  return baseText;
}

// Legacy exports for backward compatibility
export { REGISTRATION_VALIDATION_RULES as VALIDATION_RULES };
export { validateRegistrationField as validateField };

// Re-export the ValidationResult interface for compatibility
export type { ValidationResult };