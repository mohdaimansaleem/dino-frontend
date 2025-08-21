/**
 * Coupon Validation Utilities
 * 
 * Provides validation functions for coupon data
 */

import { 
  CouponFormData, 
  CouponValidationResult, 
  COUPON_VALIDATION,
  DiscountType 
} from '../types/coupon';

/**
 * Validate coupon form data
 */
export const validateCouponForm = (formData: CouponFormData): CouponValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate coupon code
  if (!formData.code || formData.code.trim().length === 0) {
    errors.push('Coupon code is required');
  } else {
    const code = formData.code.trim().toUpperCase();
    
    if (code.length < COUPON_VALIDATION.CODE_MIN_LENGTH) {
      errors.push(`Coupon code must be at least ${COUPON_VALIDATION.CODE_MIN_LENGTH} characters long`);
    }
    
    if (code.length > COUPON_VALIDATION.CODE_MAX_LENGTH) {
      errors.push(`Coupon code must not exceed ${COUPON_VALIDATION.CODE_MAX_LENGTH} characters`);
    }
    
    if (!COUPON_VALIDATION.CODE_PATTERN.test(code)) {
      errors.push('Coupon code can only contain uppercase letters, numbers, hyphens, and underscores');
    }
  }

  // Validate discount value
  const discountValue = typeof formData.discountValue === 'string' 
    ? parseFloat(formData.discountValue) 
    : formData.discountValue;

  if (!discountValue || discountValue <= 0) {
    errors.push('Discount value must be greater than 0');
  } else {
    if (formData.discountType === 'percentage') {
      if (discountValue > COUPON_VALIDATION.MAX_PERCENTAGE_DISCOUNT) {
        errors.push(`Percentage discount cannot exceed ${COUPON_VALIDATION.MAX_PERCENTAGE_DISCOUNT}%`);
      }
      if (discountValue > 50) {
        warnings.push('High percentage discounts may significantly impact revenue');
      }
    } else if (formData.discountType === 'fixed') {
      if (discountValue < COUPON_VALIDATION.MIN_DISCOUNT_VALUE) {
        errors.push(`Fixed discount must be at least ₹${COUPON_VALIDATION.MIN_DISCOUNT_VALUE}`);
      }
      if (discountValue > 10000) {
        warnings.push('High fixed discounts may significantly impact revenue');
      }
    }
  }

  // Validate dates
  const startDate = new Date(formData.startDate);
  const expiryDate = new Date(formData.expiryDate);
  const now = new Date();

  if (!formData.startDate) {
    errors.push('Start date is required');
  } else if (isNaN(startDate.getTime())) {
    errors.push('Invalid start date');
  }

  if (!formData.expiryDate) {
    errors.push('Expiry date is required');
  } else if (isNaN(expiryDate.getTime())) {
    errors.push('Invalid expiry date');
  }

  if (startDate && expiryDate && startDate >= expiryDate) {
    errors.push('Expiry date must be after start date');
  }

  if (startDate && startDate < now) {
    warnings.push('Start date is in the past');
  }

  if (expiryDate && expiryDate < now) {
    warnings.push('Expiry date is in the past - coupon will be expired');
  }

  // Validate minimum order amount
  if (formData.minOrderAmount) {
    const minOrderAmount = typeof formData.minOrderAmount === 'string' 
      ? parseFloat(formData.minOrderAmount) 
      : formData.minOrderAmount;

    if (minOrderAmount < 0) {
      errors.push('Minimum order amount cannot be negative');
    }

    if (formData.discountType === 'fixed' && minOrderAmount <= discountValue) {
      warnings.push('Minimum order amount should be higher than the discount value');
    }
  }

  // Validate max claims
  if (formData.maxClaims) {
    const maxClaims = typeof formData.maxClaims === 'string' 
      ? parseInt(formData.maxClaims) 
      : formData.maxClaims;

    if (maxClaims < COUPON_VALIDATION.MAX_CLAIMS_MIN) {
      errors.push(`Maximum claims must be at least ${COUPON_VALIDATION.MAX_CLAIMS_MIN}`);
    }

    if (maxClaims > 10000) {
      warnings.push('Very high claim limits may impact system performance');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate coupon code format
 */
export const validateCouponCode = (code: string): { isValid: boolean; message?: string } => {
  if (!code || code.trim().length === 0) {
    return { isValid: false, message: 'Coupon code is required' };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < COUPON_VALIDATION.CODE_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Code must be at least ${COUPON_VALIDATION.CODE_MIN_LENGTH} characters long` 
    };
  }

  if (trimmedCode.length > COUPON_VALIDATION.CODE_MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Code must not exceed ${COUPON_VALIDATION.CODE_MAX_LENGTH} characters` 
    };
  }

  if (!COUPON_VALIDATION.CODE_PATTERN.test(trimmedCode)) {
    return { 
      isValid: false, 
      message: 'Code can only contain uppercase letters, numbers, hyphens, and underscores' 
    };
  }

  // Check for common reserved words
  const reservedWords = ['ADMIN', 'TEST', 'DEBUG', 'NULL', 'UNDEFINED', 'SYSTEM'];
  if (reservedWords.includes(trimmedCode)) {
    return {
      isValid: false,
      message: 'This code is reserved and cannot be used'
    };
  }

  return { isValid: true };
};

/**
 * Enhanced coupon code validation with uniqueness check
 */
export const validateCouponCodeWithUniqueness = async (
  code: string,
  venueId: string,
  validateCodeFn: (code: string, venueId: string, excludeId?: string) => Promise<{ isValid: boolean; message?: string }>,
  excludeId?: string
): Promise<{ isValid: boolean; message?: string }> => {
  // First check format
  const formatValidation = validateCouponCode(code);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // Then check uniqueness
  try {
    const uniquenessValidation = await validateCodeFn(code, venueId, excludeId);
    if (!uniquenessValidation.isValid) {
      return {
        isValid: false,
        message: uniquenessValidation.message || 'This coupon code already exists in your venue'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: 'Unable to validate coupon code uniqueness. Please try again.'
    };
  }
};

/**
 * Format coupon code (uppercase, trim)
 */
export const formatCouponCode = (code: string): string => {
  return code.trim().toUpperCase();
};

/**
 * Calculate discount amount for an order
 */
export const calculateDiscountAmount = (
  orderTotal: number,
  discountType: DiscountType,
  discountValue: number,
  minOrderAmount?: number
): { discountAmount: number; isApplicable: boolean; reason?: string } => {
  // Check minimum order amount
  if (minOrderAmount && orderTotal < minOrderAmount) {
    return {
      discountAmount: 0,
      isApplicable: false,
      reason: `Minimum order amount of ₹${minOrderAmount} required`
    };
  }

  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = (orderTotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(discountValue, orderTotal);
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    isApplicable: true
  };
};

/**
 * Check if coupon is currently valid
 */
export const isCouponValid = (
  startDate: string,
  expiryDate: string,
  isActive: boolean,
  maxClaims?: number,
  currentClaims?: number
): { isValid: boolean; reason?: string } => {
  const now = new Date();
  const start = new Date(startDate);
  const expiry = new Date(expiryDate);

  if (!isActive) {
    return { isValid: false, reason: 'Coupon is inactive' };
  }

  if (now < start) {
    return { isValid: false, reason: 'Coupon has not started yet' };
  }

  if (now > expiry) {
    return { isValid: false, reason: 'Coupon has expired' };
  }

  if (maxClaims && currentClaims && currentClaims >= maxClaims) {
    return { isValid: false, reason: 'Coupon claim limit reached' };
  }

  return { isValid: true };
};

/**
 * Generate suggested coupon codes
 */
export const generateCouponCodeSuggestions = (venueName?: string): string[] => {
  const suggestions: string[] = [];
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);

  // Basic patterns
  suggestions.push(`SAVE${Math.floor(Math.random() * 90) + 10}`);
  suggestions.push(`DISCOUNT${month}${year}`);
  suggestions.push(`WELCOME${Math.floor(Math.random() * 900) + 100}`);

  // Venue-based patterns
  if (venueName) {
    const venuePrefix = venueName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    if (venuePrefix.length >= 2) {
      suggestions.push(`${venuePrefix}${Math.floor(Math.random() * 90) + 10}`);
      suggestions.push(`${venuePrefix}_SPECIAL`);
      suggestions.push(`${venuePrefix}_${month}${year}`);
    }
  }

  // Seasonal patterns
  const seasonalCodes = [
    'SUMMER_DEAL',
    'MONSOON_OFFER',
    'WINTER_SPECIAL',
    'FESTIVE_DISCOUNT'
  ];
  suggestions.push(seasonalCodes[Math.floor(Math.random() * seasonalCodes.length)]);

  return suggestions.slice(0, 5); // Return top 5 suggestions
};