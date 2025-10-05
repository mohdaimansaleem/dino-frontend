import { apiService } from '../api';
import { 
  ValidationResponse,
  WorkspaceValidation,
  VenueCreate,
  UserCreate,
  MenuItemCreate,
  ApiResponse
} from '../../types/api';

class ValidationService {
  // =============================================================================
  // API VALIDATION ENDPOINTS
  // =============================================================================

  /**
   * Validate workspace data before creation
   */
  async validateWorkspaceData(data: WorkspaceValidation): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>('/validation/workspace-data', data);
      return response.data || { valid: false, errors: ['Validation failed'], warnings: [] };
    } catch (error) {
      return { valid: false, errors: ['Validation service unavailable'], warnings: [] };
    }
  }

  /**
   * Validate venue data before creation
   */
  async validateVenueData(data: Partial<VenueCreate>): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>('/validation/venue-data', data);
      return response.data || { valid: false, errors: ['Validation failed'], warnings: [] };
    } catch (error) {
      return { valid: false, errors: ['Validation service unavailable'], warnings: [] };
    }
  }

  /**
   * Validate user data before creation
   */
  async validateUserData(data: Partial<UserCreate>): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>('/validation/user-data', data);
      return response.data || { valid: false, errors: ['Validation failed'], warnings: [] };
    } catch (error) {
      return { valid: false, errors: ['Validation service unavailable'], warnings: [] };
    }
  }

  /**
   * Validate menu item data before creation
   */
  async validateMenuItemData(data: Partial<MenuItemCreate>): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>('/validation/menu-item-data', data);
      return response.data || { valid: false, errors: ['Validation failed'], warnings: [] };
    } catch (error) {
      return { valid: false, errors: ['Validation service unavailable'], warnings: [] };
    }
  }

  // =============================================================================
  // CLIENT-SIDE VALIDATION UTILITIES
  // =============================================================================

  /**
   * Validate email format
   */
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true };
  }

  /**
   * Validate phone number format
   */
  validatePhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }

    if (digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number is too long' };
    }

    // Basic international format validation
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }

    return { isValid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { 
    isValid: boolean; 
    error?: string; 
    strength: 'weak' | 'medium' | 'strong';
    suggestions: string[];
  } {
    if (!password) {
      return { 
        isValid: false, 
        error: 'Password is required', 
        strength: 'weak',
        suggestions: ['Password is required']
      };
    }

    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      suggestions.push('Use at least 8 characters');
    } else {
      score += 1;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Include at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      suggestions.push('Include at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      suggestions.push('Include at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      suggestions.push('Include at least one special character');
    } else {
      score += 1;
    }

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      suggestions.push('Avoid common passwords');
      score = Math.max(0, score - 2);
    }

    let strength: 'weak' | 'medium' | 'strong';
    if (score < 3) {
      strength = 'weak';
    } else if (score < 5) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    const isValid = score >= 3 && password.length >= 8;

    return {
      isValid,
      error: isValid ? undefined : 'Password does not meet requirements',
      strength,
      suggestions
    };
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(password: string, confirmPassword: string): { isValid: boolean; error?: string } {
    if (!confirmPassword) {
      return { isValid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true };
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): { isValid: boolean; error?: string } {
    if (!url) {
      return { isValid: true }; // URL is optional in most cases
    }

    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  }

  /**
   * Validate required field
   */
  validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
  }

  /**
   * Validate string length
   */
  validateLength(
    value: string, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): { isValid: boolean; error?: string } {
    if (!value) {
      return { isValid: true }; // Let required validation handle empty values
    }

    if (min !== undefined && value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters long` };
    }

    if (max !== undefined && value.length > max) {
      return { isValid: false, error: `${fieldName} must be less than ${max} characters long` };
    }

    return { isValid: true };
  }

  /**
   * Validate number range
   */
  validateNumberRange(
    value: number, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): { isValid: boolean; error?: string } {
    if (isNaN(value)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (min !== undefined && value < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min}` };
    }

    if (max !== undefined && value > max) {
      return { isValid: false, error: `${fieldName} must be at most ${max}` };
    }

    return { isValid: true };
  }

  /**
   * Validate date format and range
   */
  validateDate(
    dateString: string, 
    fieldName: string, 
    minDate?: Date, 
    maxDate?: Date
  ): { isValid: boolean; error?: string } {
    if (!dateString) {
      return { isValid: true }; // Let required validation handle empty values
    }

    const date = new Date(dateString);
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
  }

  /**
   * Validate file upload
   */
  validateFile(
    file: File, 
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): { isValid: boolean; error?: string } {
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
  }

  // =============================================================================
  // FORM VALIDATION HELPERS
  // =============================================================================

  /**
   * Validate entire form object
   */
  validateForm<T extends Record<string, any>>(
    data: T,
    rules: Record<keyof T, Array<(value: any) => { isValid: boolean; error?: string }>>
  ): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, validators] of Object.entries(rules)) {
      const value = data[field];
      
      for (const validator of validators) {
        const result = validator(value);
        if (!result.isValid) {
          errors[field as keyof T] = result.error;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    }

    return { isValid, errors };
  }

  /**
   * Create validation rules for common form fields
   */
  createValidationRules() {
    return {
      required: (fieldName: string) => (value: any) => this.validateRequired(value, fieldName),
      email: () => (value: string) => this.validateEmail(value),
      phone: () => (value: string) => this.validatePhone(value),
      password: () => (value: string) => ({ 
        isValid: this.validatePassword(value).isValid, 
        error: this.validatePassword(value).error 
      }),
      passwordConfirmation: (password: string) => (value: string) => 
        this.validatePasswordConfirmation(password, value),
      url: () => (value: string) => this.validateUrl(value),
      length: (fieldName: string, min?: number, max?: number) => (value: string) => 
        this.validateLength(value, fieldName, min, max),
      numberRange: (fieldName: string, min?: number, max?: number) => (value: number) => 
        this.validateNumberRange(value, fieldName, min, max),
      date: (fieldName: string, minDate?: Date, maxDate?: Date) => (value: string) => 
        this.validateDate(value, fieldName, minDate, maxDate)
    };
  }

  // =============================================================================
  // BUSINESS LOGIC VALIDATION
  // =============================================================================

  /**
   * Validate venue operating hours
   */
  validateOperatingHours(hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
    is_24_hours: boolean;
  }>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    hours.forEach((dayHours, index) => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayHours.day_of_week];

      if (dayHours.is_open && !dayHours.is_24_hours) {
        if (!dayHours.open_time) {
          errors.push(`${dayName}: Opening time is required`);
        }
        if (!dayHours.close_time) {
          errors.push(`${dayName}: Closing time is required`);
        }
        if (dayHours.open_time && dayHours.close_time && dayHours.open_time >= dayHours.close_time) {
          errors.push(`${dayName}: Opening time must be before closing time`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate table number uniqueness within venue
   */
  validateTableNumber(
    tableNumber: number, 
    existingTables: Array<{ table_number: number; id?: string }>,
    excludeTableId?: string
  ): { isValid: boolean; error?: string } {
    const conflict = existingTables.find(table => 
      table.table_number === tableNumber && 
      table.id !== excludeTableId
    );

    if (conflict) {
      return { isValid: false, error: `Table number ${tableNumber} already exists` };
    }

    return { isValid: true };
  }

  /**
   * Validate menu item pricing
   */
  validateMenuItemPricing(basePrice: number, venue?: { price_range: string }): { 
    isValid: boolean; 
    warnings: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (basePrice <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (basePrice > 10000) {
      errors.push('Price seems unusually high');
    }

    // Price range validation based on venue
    if (venue) {
      const priceRanges = {
        budget: { min: 0, max: 200 },
        mid_range: { min: 100, max: 800 },
        premium: { min: 500, max: 2000 },
        luxury: { min: 1000, max: 10000 }
      };

      const range = priceRanges[venue.price_range as keyof typeof priceRanges];
      if (range) {
        if (basePrice < range.min) {
          warnings.push(`Price is below typical ${venue.price_range} range (₹${range.min}+)`);
        }
        if (basePrice > range.max) {
          warnings.push(`Price is above typical ${venue.price_range} range (₹${range.max} max)`);
        }
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Debounce validation for real-time feedback
   */
  debounceValidation<T extends any[]>(
    validationFn: (...args: T) => any,
    delay: number = 300
  ): (...args: T) => Promise<any> {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: T) => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(validationFn(...args));
        }, delay);
      });
    };
  }

  /**
   * Format validation errors for display
   */
  formatValidationErrors(errors: Record<string, string>): string[] {
    return Object.values(errors).filter(Boolean);
  }

  /**
   * Check if validation result has errors
   */
  hasValidationErrors(result: { isValid: boolean; errors?: any }): boolean {
    return !result.isValid || (result.errors && Object.keys(result.errors).length > 0);
  }
}

export const validationService = new ValidationService();