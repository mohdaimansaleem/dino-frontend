/**
 * Password Security Utilities
 * 
 * Comprehensive password validation and security utilities that extend
 * the centralized validation system with password-specific functionality.
 */

// Define ValidationResult interface locally to avoid circular dependency
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Password hashing utilities (imported from existing implementation)
 */
let passwordHashingUtils: any = null;

try {
  // Dynamically import password hashing utilities if they exist
  passwordHashingUtils = require('../passwordHashing');
} catch (error) {
  // Password hashing utilities not available
  console.warn('Password hashing utilities not available');
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';

/**
 * Password security configuration
 */
export const PASSWORD_SECURITY_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
} as const;

/**
 * Common weak passwords to avoid
 */
const COMMON_WEAK_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'dragon', 'master', 'hello', 'freedom', 'whatever', 'qazwsx',
  'trustno1', 'jordan', 'hunter', 'buster', 'soccer', 'harley',
  'batman', 'andrew', 'tigger', 'sunshine', 'iloveyou', '2000',
  'charlie', 'robert', 'thomas', 'hockey', 'ranger', 'daniel',
  'starwars', 'klaster', '112233', 'george', 'asshole', 'computer',
  'michelle', 'jessica', 'pepper', '1111', 'zxcvbn', '555555',
  '11111111', '131313', 'freedom', '777777', 'pass', 'maggie',
  '159753', 'aaaaaa', 'ginger', 'princess', 'joshua', 'cheese',
  'amanda', 'summer', 'love', 'ashley', '6969', 'nicole',
  'chelsea', 'biteme', 'matthew', 'access', 'yankees', '987654321',
  'dallas', 'austin', 'thunder', 'taylor', 'matrix', 'william',
  'corvette', 'hello', 'martin', 'heather', 'secret', 'fucker',
  'merlin', 'diamond', '1234567', 'gfhjkm', 'hammer', 'silver',
  '222222', '88888888', 'anthony', 'justin', 'test', 'bailey',
  'q1w2e3r4t5', 'patrick', 'internet', 'scooter', 'orange',
  '11111', 'golfer', 'cookie', 'richard', 'samantha', 'bigdog',
  'guitar', 'jackson', 'whatever', 'mickey', 'chicken', 'sparky',
  'snoopy', 'maverick', 'phoenix', 'camaro', 'sexy', 'peanut',
  'morgan', 'welcome', 'falcon', 'cowboy', 'ferrari', 'samsung',
  'andrea', 'smokey', 'steelers', 'joseph', 'mercedes', 'dakota',
  'arsenal', 'eagles', 'melissa', 'boomer', 'booboo', 'spider',
  'nascar', 'monster', 'tigers', 'yellow', 'xxxxxx', '123123',
  'gateway', 'marina', 'diablo', 'bulldog', 'qwer1234', 'compaq',
  'purple', 'hardcore', 'banana', 'junior', 'hannah', '123654',
  'porsche', 'lakers', 'iceman', 'money', 'cowboys', '987654',
  'london', 'tennis', '999999', 'ncc1701', 'coffee', 'scooby',
  '0000', 'miller', 'boston', 'q1w2e3r4', 'fuckoff', 'brandon',
  'yamaha', 'chester', 'mother', 'forever', 'johnny', 'edward',
  '333333', 'oliver', 'redsox', 'player', 'nikita', 'knight',
  'fender', 'barney', 'midnight', 'please', 'brandy', 'chicago',
  'badboy', 'iwantu', 'slayer', 'rangers', 'charles', 'angel',
  'flower', 'bigdaddy', 'rabbit', 'wizard', 'bigdick', 'jasper',
  'enter', 'rachel', 'chris', 'steven', 'winner', 'adidas',
  'victoria', 'natasha', '1q2w3e4r', 'jasmine', 'winter', 'prince',
  'panties', 'marine', 'ghbdtn', 'fishing', 'cocacola', 'casper',
  'james', '232323', 'raiders', '888888', 'marlboro', 'gandalf',
  'asdfgh', 'crystal', '87654321', '12344321', 'sexsex', 'golden',
  'blowme', 'bigtits', '8675309', 'panther', 'lauren', 'angela',
  'bitch', 'spanky', 'thx1138', 'angels', 'madison', 'winston',
  'shannon', 'mike', 'toyota', 'blowjob', 'jordan23', 'canada',
  'sophie', 'Password', 'apples', 'dick', 'tiger', 'razz',
  '123abc', 'pokemon', 'qazxsw', '55555', 'qwaszx', 'muffin',
  'johnson', 'murphy', 'cooper', 'jonathan', 'liverpoo', 'david',
  'danielle', '159357', 'jackie', '1990', '123456a', '789456',
  'turtle', 'horny', 'abcd1234', 'scorpion', 'qazwsxedc', 'fuck',
  'mark', 'reddog', 'frank', 'qwe123', 'popcorn', 'patricia',
  'aaaaaaaa', '1969', 'teresa', 'mozart', 'buddha', 'anderson',
  'paul', 'melanie', 'abcdefg', 'security', 'lucky', 'lizard',
  'denise', '3333', 'a12345', '123789', 'rusty', 'stargate',
  'simpsons', 'scarface', 'eagle', '123456789a', 'thumper',
  'olivia', 'naruto', '1234554321', 'general', 'cherokee',
  'a123456', 'vincent', 'Usuckballz1', 'spooky', 'qweasd',
  'cumshot', 'free', 'frankie', 'douglas', 'death', '1980',
  'loveme', 'sidney', 'mistress', 'red', 'srinivas', 'wood',
  'sports', 'penis', '112112', 'qwerty123', 'zxcvbnm', 'tomcat',
  'arsenal', 'lovely', 'flash', 'steam', 'horney', 'hammer',
  'cooper', 'zzzzzz', 'gators', 'doctor', 'gateway', 'gfhjkm',
  'thunder', 'tigers', 'porsche', 'slipknot', 'theman', 'hentai',
  'dublin', 'travis', 'qwerty12', 'killer', 'getsome', 'lucky',
  'devils', 'testing', 'fire'
];

/**
 * Analyze password strength
 */
export function analyzePasswordStrength(password: string, userInfo?: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}): {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      strength: 'very-weak',
      score: 0,
      feedback: ['Password is required'],
      isValid: false,
    };
  }
  
  // Length check
  if (password.length < PASSWORD_SECURITY_CONFIG.minLength) {
    feedback.push(`Password must be at least ${PASSWORD_SECURITY_CONFIG.minLength} characters long`);
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  if (password.length > PASSWORD_SECURITY_CONFIG.maxLength) {
    feedback.push(`Password must not exceed ${PASSWORD_SECURITY_CONFIG.maxLength} characters`);
  }
  
  // Character variety checks
  if (PASSWORD_SECURITY_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Include at least one uppercase letter (A-Z)');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }
  
  if (PASSWORD_SECURITY_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Include at least one lowercase letter (a-z)');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }
  
  if (PASSWORD_SECURITY_CONFIG.requireNumbers && !/\d/.test(password)) {
    feedback.push('Include at least one number (0-9)');
  } else if (/\d/.test(password)) {
    score += 1;
  }
  
  if (PASSWORD_SECURITY_CONFIG.requireSpecialChars && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    feedback.push('Include at least one special character (!@#$%^&*(),.?\":{}|<>)');
  } else if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    score += 1;
  }
  
  // Advanced checks
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating the same character more than twice');
    score -= 1;
  }
  
  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    feedback.push('Avoid common sequences like "123", "abc", "qwe"');
    score -= 1;
  }
  
  // Common password check
  if (PASSWORD_SECURITY_CONFIG.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_WEAK_PASSWORDS.includes(lowerPassword)) {
      feedback.push('This password is too common. Choose a more unique password');
      score -= 2;
    }
  }
  
  // User info check
  if (PASSWORD_SECURITY_CONFIG.preventUserInfoInPassword && userInfo) {
    const userInfoValues = [
      userInfo.firstName,
      userInfo.lastName,
      userInfo.email?.split('@')[0],
      userInfo.username,
    ].filter(Boolean).map(val => val!.toLowerCase());
    
    const lowerPassword = password.toLowerCase();
    for (const info of userInfoValues) {
      if (info.length >= 3 && lowerPassword.includes(info)) {
        feedback.push('Password should not contain your personal information');
        score -= 1;
        break;
      }
    }
  }
  
  // Determine strength
  let strength: PasswordStrength;
  if (score < 2) {
    strength = 'very-weak';
  } else if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else if (score < 7) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }
  
  // Add positive feedback for strong passwords
  if (score >= 5 && feedback.length === 0) {
    feedback.push('Great! Your password is strong');
  }
  
  const isValid = feedback.length === 0 && score >= 3;
  
  return {
    strength,
    score: Math.max(0, score),
    feedback,
    isValid,
  };
}

/**
 * Enhanced password validator that uses strength analysis
 */
export const enhancedPasswordValidator = (userInfo?: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}) => (password: string): ValidationResult => {
  const analysis = analyzePasswordStrength(password, userInfo);
  
  if (!analysis.isValid) {
    return {
      isValid: false,
      error: analysis.feedback[0] || 'Password does not meet security requirements',
    };
  }
  
  return { isValid: true };
};

/**
 * Validate that a password appears to be plain text (not already hashed)
 */
export function validatePlainTextPassword(password: string): ValidationResult {
  // Check if it looks like a hash (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(password)) {
    return {
      isValid: false,
      error: 'Password appears to be already hashed. Please provide plain text password.',
    };
  }
  
  // Use basic password validation to avoid circular dependency
  if (!password) return { isValid: false, error: 'Password is required' };
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one digit' };
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
}

/**
 * Validate that a password appears to be properly hashed
 */
export function validateHashedPassword(hashedPassword: string): ValidationResult {
  if (!hashedPassword) {
    return {
      isValid: false,
      error: 'Hashed password is required.',
    };
  }
  
  if (hashedPassword.length !== 64) {
    return {
      isValid: false,
      error: `Invalid hash length. Expected 64 characters, got ${hashedPassword.length}.`,
    };
  }
  
  if (!/^[a-f0-9]{64}$/i.test(hashedPassword)) {
    return {
      isValid: false,
      error: 'Invalid hash format. Must be 64 hexadecimal characters.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate password hashing setup
 */
export function validatePasswordHashingSetup(): ValidationResult {
  try {
    if (!passwordHashingUtils) {
      return {
        isValid: false,
        error: 'Password hashing utilities are not available',
      };
    }
    
    // Check if crypto.subtle is supported
    if (!passwordHashingUtils.isPasswordHashingSupported()) {
      return {
        isValid: false,
        error: 'Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support (HTTPS required).',
      };
    }
    
    // Check if salt is configured
    const salt = passwordHashingUtils.getFixedSalt();
    
    if (!salt || salt.length < 32) {
      return {
        isValid: false,
        error: 'Password salt is not properly configured. Salt must be at least 32 characters long.',
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Password hashing setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get password security status for debugging
 */
export function getPasswordSecurityStatus(): {
  cryptoSupported: boolean;
  saltConfigured: boolean;
  saltLength: number;
  securityLevel: 'high' | 'medium' | 'low' | 'none';
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let cryptoSupported = false;
  let saltConfigured = false;
  let saltLength = 0;
  
  try {
    if (passwordHashingUtils) {
      cryptoSupported = passwordHashingUtils.isPasswordHashingSupported();
      
      if (cryptoSupported) {
        try {
          const salt = passwordHashingUtils.getFixedSalt();
          saltConfigured = true;
          saltLength = salt.length;
        } catch {
          saltConfigured = false;
          recommendations.push('Configure REACT_APP_PASSWORD_SALT environment variable');
        }
      } else {
        recommendations.push('Use HTTPS to enable crypto.subtle support');
      }
    } else {
      recommendations.push('Password hashing utilities not available');
    }
  } catch (error) {
    recommendations.push('Error checking password security setup');
  }
  
  let securityLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  
  if (cryptoSupported && saltConfigured) {
    if (saltLength >= 64) {
      securityLevel = 'high';
    } else if (saltLength >= 32) {
      securityLevel = 'medium';
      recommendations.push('Consider using a longer salt (64+ characters) for enhanced security');
    } else {
      securityLevel = 'low';
      recommendations.push('Use a salt of at least 32 characters');
    }
  }
  
  if (process.env.NODE_ENV === 'production' && securityLevel !== 'high') {
    recommendations.push('Ensure high security level for production environment');
  }
  
  return {
    cryptoSupported,
    saltConfigured,
    saltLength,
    securityLevel,
    recommendations,
  };
}

/**
 * Generate password strength indicator data for UI components
 */
export function getPasswordStrengthIndicator(password: string, userInfo?: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}): {
  strength: PasswordStrength;
  percentage: number;
  color: string;
  label: string;
  feedback: string[];
} {
  const analysis = analyzePasswordStrength(password, userInfo);
  
  const strengthConfig = {
    'very-weak': { percentage: 20, color: '#f44336', label: 'Very Weak' },
    'weak': { percentage: 40, color: '#ff9800', label: 'Weak' },
    'medium': { percentage: 60, color: '#ffeb3b', label: 'Medium' },
    'strong': { percentage: 80, color: '#4caf50', label: 'Strong' },
    'very-strong': { percentage: 100, color: '#2e7d32', label: 'Very Strong' },
  };
  
  const config = strengthConfig[analysis.strength];
  
  return {
    strength: analysis.strength,
    percentage: config.percentage,
    color: config.color,
    label: config.label,
    feedback: analysis.feedback,
  };
}

// Export password strength constants for UI components
export const PASSWORD_STRENGTH_COLORS = {
  'very-weak': '#f44336',
  'weak': '#ff9800',
  'medium': '#ffeb3b',
  'strong': '#4caf50',
  'very-strong': '#2e7d32',
} as const;

export const PASSWORD_STRENGTH_LABELS = {
  'very-weak': 'Very Weak',
  'weak': 'Weak',
  'medium': 'Medium',
  'strong': 'Strong',
  'very-strong': 'Very Strong',
} as const;