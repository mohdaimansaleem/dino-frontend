// Environment configuration for production deployment
export const config = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  
  // App Configuration
  APP_NAME: 'Dino E-Menu',
  APP_VERSION: '1.0.0',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Features
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
  
  // Timeouts and Limits
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '5242880'), // 5MB
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'dino_token',
    REFRESH_TOKEN: 'dino_refresh_token',
    USER: 'dino_user',
    THEME: 'dino_theme',
    LANGUAGE: 'dino_language',
  },
  
  // Default Values
  DEFAULTS: {
    LANGUAGE: 'en',
    CURRENCY: 'USD',
    TIMEZONE: 'UTC',
    PAGE_SIZE: 20,
  },
  
  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  
  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    MOBILE_BREAKPOINT: 768,
  },
};

export default config;