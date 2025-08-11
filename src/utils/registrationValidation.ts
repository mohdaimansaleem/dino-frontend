/**
 * Registration Form Validation Utilities
 * Matches backend validation rules exactly to prevent server-side errors
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

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
 * Validation rules that match backend DTO constraints exactly
 */
export const VALIDATION_RULES = {
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
    postalCode: { required: true },
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
};

/**
 * Validate workspace information (Step 0)
 */
export function validateWorkspaceStep(data: RegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Workspace name validation
  if (!data.workspaceName.trim()) {
    errors.workspaceName = 'Workspace name is required';
  } else if (data.workspaceName.length < VALIDATION_RULES.workspace.name.minLength) {
    errors.workspaceName = `Workspace name must have at least ${VALIDATION_RULES.workspace.name.minLength} characters`;
  } else if (data.workspaceName.length > VALIDATION_RULES.workspace.name.maxLength) {
    errors.workspaceName = `Workspace name must not exceed ${VALIDATION_RULES.workspace.name.maxLength} characters`;
  }

  // Workspace description validation
  if (data.workspaceDescription && data.workspaceDescription.length > VALIDATION_RULES.workspace.description.maxLength) {
    errors.workspaceDescription = `Workspace description must not exceed ${VALIDATION_RULES.workspace.description.maxLength} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate venue information (Step 1)
 */
export function validateVenueStep(data: RegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Venue name validation
  if (!data.venueName.trim()) {
    errors.venueName = 'Venue name is required';
  } else if (data.venueName.length < VALIDATION_RULES.venue.name.minLength) {
    errors.venueName = `Venue name must have at least ${VALIDATION_RULES.venue.name.minLength} character`;
  } else if (data.venueName.length > VALIDATION_RULES.venue.name.maxLength) {
    errors.venueName = `Venue name must not exceed ${VALIDATION_RULES.venue.name.maxLength} characters`;
  }

  // Venue description validation
  if (data.venueDescription && data.venueDescription.length > VALIDATION_RULES.venue.description.maxLength) {
    errors.venueDescription = `Venue description must not exceed ${VALIDATION_RULES.venue.description.maxLength} characters`;
  }

  // Address validation
  if (!data.venueLocation.address.trim()) {
    errors.address = 'Address is required';
  } else if (data.venueLocation.address.length < VALIDATION_RULES.venue.address.minLength) {
    errors.address = `Address must have at least ${VALIDATION_RULES.venue.address.minLength} characters`;
  }

  // City validation
  if (!data.venueLocation.city.trim()) {
    errors.city = 'City is required';
  } else if (data.venueLocation.city.length < VALIDATION_RULES.venue.city.minLength) {
    errors.city = `City must have at least ${VALIDATION_RULES.venue.city.minLength} character`;
  }

  // State validation
  if (!data.venueLocation.state.trim()) {
    errors.state = 'State is required';
  } else if (data.venueLocation.state.length < VALIDATION_RULES.venue.state.minLength) {
    errors.state = `State must have at least ${VALIDATION_RULES.venue.state.minLength} character`;
  }

  // Postal code validation (optional)
  // No validation required for postal code

  // Landmark validation
  if (data.venueLocation.landmark && data.venueLocation.landmark.length > VALIDATION_RULES.venue.landmark.maxLength) {
    errors.landmark = `Landmark must not exceed ${VALIDATION_RULES.venue.landmark.maxLength} characters`;
  }

  // Venue phone validation
  if (!data.venuePhone.trim()) {
    errors.venuePhone = 'Venue phone number is required';
  } else if (!VALIDATION_RULES.venue.phone.pattern.test(data.venuePhone)) {
    errors.venuePhone = 'Phone number must be exactly 10 digits';
  }

  // Venue email validation (optional)
  if (data.venueEmail && data.venueEmail.trim()) {
    if (!VALIDATION_RULES.venue.email.pattern.test(data.venueEmail)) {
      errors.venueEmail = 'Please enter a valid email address';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate owner account information (Step 2)
 */
export function validateOwnerStep(data: RegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // First name validation
  if (!data.ownerFirstName.trim()) {
    errors.ownerFirstName = 'First name is required';
  } else if (data.ownerFirstName.length < VALIDATION_RULES.owner.firstName.minLength) {
    errors.ownerFirstName = `First name must have at least ${VALIDATION_RULES.owner.firstName.minLength} character`;
  } else if (data.ownerFirstName.length > VALIDATION_RULES.owner.firstName.maxLength) {
    errors.ownerFirstName = `First name must not exceed ${VALIDATION_RULES.owner.firstName.maxLength} characters`;
  }

  // Last name validation
  if (!data.ownerLastName.trim()) {
    errors.ownerLastName = 'Last name is required';
  } else if (data.ownerLastName.length < VALIDATION_RULES.owner.lastName.minLength) {
    errors.ownerLastName = `Last name must have at least ${VALIDATION_RULES.owner.lastName.minLength} character`;
  } else if (data.ownerLastName.length > VALIDATION_RULES.owner.lastName.maxLength) {
    errors.ownerLastName = `Last name must not exceed ${VALIDATION_RULES.owner.lastName.maxLength} characters`;
  }

  // Email validation
  if (!data.ownerEmail.trim()) {
    errors.ownerEmail = 'Email is required';
  } else if (!VALIDATION_RULES.owner.email.pattern.test(data.ownerEmail)) {
    errors.ownerEmail = 'Please enter a valid email address';
  }

  // Phone validation
  if (!data.ownerPhone.trim()) {
    errors.ownerPhone = 'Phone number is required';
  } else if (!VALIDATION_RULES.owner.phone.pattern.test(data.ownerPhone)) {
    errors.ownerPhone = 'Phone number must be exactly 10 digits';
  }

  // Password validation
  if (!data.ownerPassword) {
    errors.ownerPassword = 'Password is required';
  } else {
    const password = data.ownerPassword;
    const rules = VALIDATION_RULES.owner.password;
    
    if (password.length < rules.minLength) {
      errors.ownerPassword = `Password must be at least ${rules.minLength} characters long`;
    } else if (password.length > rules.maxLength) {
      errors.ownerPassword = `Password must not exceed ${rules.maxLength} characters`;
    } else if (!rules.patterns.uppercase.test(password)) {
      errors.ownerPassword = 'Password must contain at least one uppercase letter';
    } else if (!rules.patterns.lowercase.test(password)) {
      errors.ownerPassword = 'Password must contain at least one lowercase letter';
    } else if (!rules.patterns.digit.test(password)) {
      errors.ownerPassword = 'Password must contain at least one digit';
    } else if (!rules.patterns.special.test(password)) {
      errors.ownerPassword = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.ownerPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate specific field for real-time feedback
 */
export function validateField(field: string, value: any, formData: RegistrationFormData): string | null {
  switch (field) {
    case 'workspaceName':
      if (value && value.length > 0 && value.length < VALIDATION_RULES.workspace.name.minLength) {
        return `Workspace name must have at least ${VALIDATION_RULES.workspace.name.minLength} characters`;
      } else if (value && value.length > VALIDATION_RULES.workspace.name.maxLength) {
        return `Workspace name must not exceed ${VALIDATION_RULES.workspace.name.maxLength} characters`;
      }
      break;
    
    case 'workspaceDescription':
      if (value && value.length > VALIDATION_RULES.workspace.description.maxLength) {
        return `Description must not exceed ${VALIDATION_RULES.workspace.description.maxLength} characters`;
      }
      break;

    case 'venueName':
      if (value && value.length > VALIDATION_RULES.venue.name.maxLength) {
        return `Venue name must not exceed ${VALIDATION_RULES.venue.name.maxLength} characters`;
      }
      break;

    case 'venueDescription':
      if (value && value.length > VALIDATION_RULES.venue.description.maxLength) {
        return `Description must not exceed ${VALIDATION_RULES.venue.description.maxLength} characters`;
      }
      break;

    case 'venueLocation.address':
      if (value && value.length > 0 && value.length < VALIDATION_RULES.venue.address.minLength) {
        return `Address must have at least ${VALIDATION_RULES.venue.address.minLength} characters`;
      }
      break;

    case 'venuePhone':
      if (value && value.trim() && !VALIDATION_RULES.venue.phone.pattern.test(value)) {
        return 'Phone number must be exactly 10 digits';
      }
      break;

    case 'venueEmail':
      if (value && value.trim() && !VALIDATION_RULES.venue.email.pattern.test(value)) {
        return 'Please enter a valid email address';
      }
      break;

    case 'ownerFirstName':
      if (value && value.length > VALIDATION_RULES.owner.firstName.maxLength) {
        return `First name must not exceed ${VALIDATION_RULES.owner.firstName.maxLength} characters`;
      }
      break;

    case 'ownerLastName':
      if (value && value.length > VALIDATION_RULES.owner.lastName.maxLength) {
        return `Last name must not exceed ${VALIDATION_RULES.owner.lastName.maxLength} characters`;
      }
      break;

    case 'ownerEmail':
      if (value && value.trim() && !VALIDATION_RULES.owner.email.pattern.test(value)) {
        return 'Please enter a valid email address';
      }
      break;

    case 'ownerPhone':
      if (value && value.trim() && !VALIDATION_RULES.owner.phone.pattern.test(value)) {
        return 'Phone number must be exactly 10 digits';
      }
      break;

    case 'ownerPassword':
      if (value) {
        const rules = VALIDATION_RULES.owner.password;
        if (value.length > rules.maxLength) {
          return `Password must not exceed ${rules.maxLength} characters`;
        } else if (value.length >= rules.minLength) {
          // Only show detailed validation once minimum length is met
          if (!rules.patterns.uppercase.test(value)) {
            return 'Password must contain at least one uppercase letter';
          } else if (!rules.patterns.lowercase.test(value)) {
            return 'Password must contain at least one lowercase letter';
          } else if (!rules.patterns.digit.test(value)) {
            return 'Password must contain at least one digit';
          } else if (!rules.patterns.special.test(value)) {
            return 'Password must contain at least one special character';
          }
        }
      }
      break;

    case 'confirmPassword':
      if (value && formData.ownerPassword && value !== formData.ownerPassword) {
        return 'Passwords do not match';
      }
      break;
  }

  return null;
}

/**
 * Get character count helper text
 */
export function getCharacterCountText(field: string, value: string, baseText: string): string {
  const maxLengths: Record<string, number> = {
    workspaceName: VALIDATION_RULES.workspace.name.maxLength,
    workspaceDescription: VALIDATION_RULES.workspace.description.maxLength,
    venueName: VALIDATION_RULES.venue.name.maxLength,
    venueDescription: VALIDATION_RULES.venue.description.maxLength,
    ownerFirstName: VALIDATION_RULES.owner.firstName.maxLength,
    ownerLastName: VALIDATION_RULES.owner.lastName.maxLength,
  };

  const maxLength = maxLengths[field];
  if (maxLength) {
    return `${baseText} (${value.length}/${maxLength})`;
  }

  return baseText;
}

