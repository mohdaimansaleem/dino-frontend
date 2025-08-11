/**
 * Simplified Environment Configuration
 * 
 * Provides a clean interface for environment variables with proper defaults
 * and production-ready configuration management.
 */

// Environment detection
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

// Core configuration interface
export interface AppConfig {
  // Environment
  NODE_ENV: string;
  APP_ENV: string;
  
  // Application
  APP_NAME: string;
  APP_VERSION: string;
  
  // API Configuration
  API_BASE_URL: string;
  WS_URL: string;
  BACKEND_URL: string;
  API_TIMEOUT: number;
  
  // Authentication
  PASSWORD_SALT: string;
  JWT_EXPIRY_HOURS: number;
  
  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_QR_CODES: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_THEME_TOGGLE: boolean;
  
  // Logging
  LOG_LEVEL: string;
  ENABLE_CONSOLE_LOGGING: boolean;
  DEBUG_MODE: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'production',
  APP_ENV: 'production',
  
  // Application
  APP_NAME: 'Dino',
  APP_VERSION: '1.0.0',
  
  // API Configuration - Use relative URLs for nginx proxy
  API_BASE_URL: '/api/v1',
  WS_URL: '/ws',
  BACKEND_URL: 'https://dino-backend-api-867506203789.us-central1.run.app',
  API_TIMEOUT: 30000,
  
  // Authentication
  PASSWORD_SALT: 'dino-secure-salt-2024-change-in-production',
  JWT_EXPIRY_HOURS: 24,
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_QR_CODES: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_THEME_TOGGLE: false,
  
  // Logging
  LOG_LEVEL: isProduction() ? 'warn' : 'info',
  ENABLE_CONSOLE_LOGGING: !isProduction(),
  DEBUG_MODE: false,
};

// Get configuration value with proper type conversion
function getEnvValue<T>(key: string, defaultValue: T, converter?: (value: string) => T): T {
  const envKey = `REACT_APP_${key}`;
  const value = process.env[envKey];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  if (converter) {
    try {
      return converter(value);
    } catch {
      return defaultValue;
    }
  }
  
  // Type-specific conversion
  if (typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as T;
  }
  
  if (typeof defaultValue === 'number') {
    const num = parseInt(value, 10);
    return (isNaN(num) ? defaultValue : num) as T;
  }
  
  return value as T;
}

// Build configuration from environment variables
function buildConfig(): AppConfig {
  return {
    // Environment
    NODE_ENV: process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV,
    APP_ENV: getEnvValue('ENV', DEFAULT_CONFIG.APP_ENV),
    
    // Application
    APP_NAME: getEnvValue('NAME', DEFAULT_CONFIG.APP_NAME),
    APP_VERSION: getEnvValue('VERSION', DEFAULT_CONFIG.APP_VERSION),
    
    // API Configuration
    API_BASE_URL: getEnvValue('API_BASE_URL', DEFAULT_CONFIG.API_BASE_URL),
    WS_URL: getEnvValue('WS_URL', DEFAULT_CONFIG.WS_URL),
    BACKEND_URL: getEnvValue('BACKEND_URL', DEFAULT_CONFIG.BACKEND_URL),
    API_TIMEOUT: getEnvValue('API_TIMEOUT', DEFAULT_CONFIG.API_TIMEOUT),
    
    // Authentication
    PASSWORD_SALT: getEnvValue('PASSWORD_SALT', DEFAULT_CONFIG.PASSWORD_SALT),
    JWT_EXPIRY_HOURS: getEnvValue('JWT_EXPIRY_HOURS', DEFAULT_CONFIG.JWT_EXPIRY_HOURS),
    
    // Feature Flags
    ENABLE_ANALYTICS: getEnvValue('ENABLE_ANALYTICS', DEFAULT_CONFIG.ENABLE_ANALYTICS),
    ENABLE_QR_CODES: getEnvValue('ENABLE_QR_CODES', DEFAULT_CONFIG.ENABLE_QR_CODES),
    ENABLE_NOTIFICATIONS: getEnvValue('ENABLE_NOTIFICATIONS', DEFAULT_CONFIG.ENABLE_NOTIFICATIONS),
    ENABLE_THEME_TOGGLE: getEnvValue('ENABLE_THEME_TOGGLE', DEFAULT_CONFIG.ENABLE_THEME_TOGGLE),
    
    // Logging
    LOG_LEVEL: getEnvValue('LOG_LEVEL', DEFAULT_CONFIG.LOG_LEVEL),
    ENABLE_CONSOLE_LOGGING: getEnvValue('ENABLE_CONSOLE_LOGGING', DEFAULT_CONFIG.ENABLE_CONSOLE_LOGGING),
    DEBUG_MODE: getEnvValue('DEBUG_MODE', DEFAULT_CONFIG.DEBUG_MODE),
  };
}

// Export the configuration
export const config: AppConfig = buildConfig();

// Validation function
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required URLs
  if (!config.API_BASE_URL) {
    errors.push('API_BASE_URL is required');
  }
  
  if (!config.BACKEND_URL) {
    errors.push('BACKEND_URL is required');
  }
  
  if (!config.PASSWORD_SALT || config.PASSWORD_SALT.length < 32) {
    errors.push('PASSWORD_SALT must be at least 32 characters long');
  }
  
  // Validate production settings
  if (isProduction()) {
    if (config.API_BASE_URL.includes('localhost')) {
      errors.push('API_BASE_URL should not use localhost in production');
    }
    
    if (config.BACKEND_URL.includes('localhost')) {
      errors.push('BACKEND_URL should not use localhost in production');
    }
    
    if (config.PASSWORD_SALT === DEFAULT_CONFIG.PASSWORD_SALT) {
      errors.push('PASSWORD_SALT should be changed from default value in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Log configuration (only in development or when debug is enabled)
export function logConfig(): void {
  if (config.DEBUG_MODE || isDevelopment()) {
    console.group('🔧 Application Configuration');
    console.log('Environment:', config.APP_ENV);
    console.log('Node Environment:', config.NODE_ENV);
    console.log('API Base URL:', config.API_BASE_URL);
    console.log('Backend URL:', config.BACKEND_URL);
    console.log('Debug Mode:', config.DEBUG_MODE);
    console.log('Console Logging:', config.ENABLE_CONSOLE_LOGGING);
    console.log('Log Level:', config.LOG_LEVEL);
    console.groupEnd();
  }
}

// Initialize configuration validation
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const validation = validateConfig();
    if (!validation.valid) {
      console.error('❌ Configuration Validation Failed:', validation.errors);
    } else if (config.DEBUG_MODE || isDevelopment()) {
      console.log('✅ Configuration validation passed');
    }
    
    logConfig();
  }, 100);
}

export default config;