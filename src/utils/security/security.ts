/**
 * Security utilities for input sanitization and validation
 */

// HTML sanitization
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL injection prevention for search terms
export const sanitizeSearchTerm = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/['"\\;]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  errors: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    errors: feedback,
  };
};

// Get password strength description
export const getPasswordStrengthText = (score: number): {
  text: string;
  color: 'error' | 'warning' | 'info' | 'success';
} => {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Very Weak', color: 'error' };
    case 2:
      return { text: 'Weak', color: 'error' };
    case 3:
      return { text: 'Fair', color: 'warning' };
    case 4:
      return { text: 'Good', color: 'info' };
    case 5:
      return { text: 'Strong', color: 'success' };
    default:
      return { text: 'Unknown', color: 'error' };
  }
};

// XSS prevention for user input
export const sanitizeUserInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File upload validation
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingTime(key: string, windowMs: number): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingTime = windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

// CSRF token management
export const csrfTokenManager = {
  getToken(): string | null {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  },

  setToken(token: string): void {
    let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'csrf-token';
      document.head.appendChild(metaTag);
    }
    metaTag.content = token;
  },

  addToHeaders(headers: Record<string, string>): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  },
};

// Content Security Policy helpers
export const cspHelpers = {
  // Generate nonce for inline scripts
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  // Check if script source is allowed
  isScriptSourceAllowed(src: string, allowedSources: string[]): boolean {
    return allowedSources.some(allowed => {
      if (allowed === "'self'") {
        return new URL(src, window.location.href).origin === window.location.origin;
      }
      if (allowed === "'unsafe-inline'") {
        return true;
      }
      return src.startsWith(allowed);
    });
  },
};

// Secure local storage wrapper
export const secureStorage = {
  setItem(key: string, value: any, encrypt: boolean = false): void {
    try {
      let serializedValue = JSON.stringify(value);
      
      if (encrypt) {
        // In a real application, you would use proper encryption
        // This is a simple obfuscation for demonstration
        serializedValue = btoa(serializedValue);
      }
      
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  },

  getItem<T>(key: string, decrypt: boolean = false): T | null {
    try {
      let item = localStorage.getItem(key);
      if (!item) return null;
      
      if (decrypt) {
        // Reverse the obfuscation
        item = atob(item);
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

export default {
  sanitizeHtml,
  sanitizeSearchTerm,
  sanitizeUserInput,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePasswordStrength,
  validateFileUpload,
  RateLimiter,
  csrfTokenManager,
  cspHelpers,
  secureStorage,
};