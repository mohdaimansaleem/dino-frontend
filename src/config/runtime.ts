/**
 * Runtime Configuration Loader
 * 
 * This module loads configuration from window.APP_CONFIG which is set by /config.js
 * The config.js file is generated at container startup from environment variables
 */

// Type definition for runtime configuration
export interface RuntimeConfig {
  // API Configuration
  API_BASE_URL: string;
  WS_URL: string;
  BACKEND_URL: string;
  
  // App Configuration
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENV: string;
  
  // Feature Flags
  DEBUG_MODE: boolean;
  ENABLE_THEME_TOGGLE: boolean;

  ENABLE_ANALYTICS: boolean;
  ENABLE_QR_CODES: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_I18N: boolean;
  ENABLE_ANIMATIONS: boolean;
  ENABLE_IMAGE_OPTIMIZATION: boolean;
  ENABLE_SERVICE_WORKER: boolean;
  
  // API Configuration
  API_TIMEOUT: number;
  API_RATE_LIMIT: number;
  
  // Authentication
  JWT_EXPIRY_HOURS: number;
  SESSION_TIMEOUT_MINUTES: number;
  MIN_PASSWORD_LENGTH: number;
  
  // UI Configuration
  DEFAULT_THEME: string;
  
  // Chart Configuration
  CHART_ANIMATION_INTERVAL: number;
  CHART_ANIMATION_DURATION: number;
  CHART_ANIMATION_EASING: string;
  CHART_ANIMATIONS_ENABLED: boolean;
  CHART_AUTO_REFRESH_ENABLED: boolean;
  
  // Logging
  LOG_LEVEL: string;
  ENABLE_CONSOLE_LOGGING: boolean;
  
  // Development Settings
  ENABLE_HOT_RELOAD: boolean;
  GENERATE_SOURCEMAP: boolean;
}

// Extend window interface to include APP_CONFIG
declare global {
  interface Window {
    APP_CONFIG?: RuntimeConfig;
  }
}

// Default configuration (fallback)
const DEFAULT_CONFIG: RuntimeConfig = {
  // API Configuration - Use full backend URLs for direct connection
  API_BASE_URL: 'https://dino-frontend-867506203789.us-central1.run.app/api/v1',
  WS_URL: 'wss://dino-frontend-867506203789.us-central1.run.app/ws',
  BACKEND_URL: 'https://dino-frontend-867506203789.us-central1.run.app',
  
  // App Configuration
  APP_NAME: 'Dino',
  APP_VERSION: '1.0.0',
  APP_ENV: 'production',
  
  // Feature Flags
  DEBUG_MODE: false,
  ENABLE_THEME_TOGGLE: false,

  ENABLE_ANALYTICS: true,
  ENABLE_QR_CODES: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_I18N: false,
  ENABLE_ANIMATIONS: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_SERVICE_WORKER: true,
  
  // API Configuration
  API_TIMEOUT: 30000,
  API_RATE_LIMIT: 100,
  
  // Authentication
  JWT_EXPIRY_HOURS: 24,
  SESSION_TIMEOUT_MINUTES: 60,
  MIN_PASSWORD_LENGTH: 8,
  
  // UI Configuration
  DEFAULT_THEME: 'light',
  
  // Chart Configuration
  CHART_ANIMATION_INTERVAL: 30000,
  CHART_ANIMATION_DURATION: 1000,
  CHART_ANIMATION_EASING: 'easeInOutQuart',
  CHART_ANIMATIONS_ENABLED: true,
  CHART_AUTO_REFRESH_ENABLED: true,
  
  // Logging
  LOG_LEVEL: 'info',
  ENABLE_CONSOLE_LOGGING: false,
  
  // Development Settings
  ENABLE_HOT_RELOAD: false,
  GENERATE_SOURCEMAP: false
};

/**
 * Get runtime configuration
 * Priority: 
 * - Development: process.env (from .env files) > DEFAULT_CONFIG
 * - Production: window.APP_CONFIG (runtime) > DEFAULT_CONFIG
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  // In development, prioritize process.env over window.APP_CONFIG
  // This allows .env files to work properly in development
  if (process.env.NODE_ENV === 'development') {
    return {
      ...DEFAULT_CONFIG,
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || DEFAULT_CONFIG.API_BASE_URL,
      WS_URL: process.env.REACT_APP_WS_URL || DEFAULT_CONFIG.WS_URL,
      BACKEND_URL: process.env.REACT_APP_BACKEND_URL || DEFAULT_CONFIG.BACKEND_URL,
      APP_NAME: process.env.REACT_APP_NAME || DEFAULT_CONFIG.APP_NAME,
      APP_VERSION: process.env.REACT_APP_VERSION || DEFAULT_CONFIG.APP_VERSION,
      APP_ENV: process.env.REACT_APP_ENV || DEFAULT_CONFIG.APP_ENV,
      DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
      ENABLE_THEME_TOGGLE: process.env.REACT_APP_ENABLE_THEME_TOGGLE === 'true',

      ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
      ENABLE_QR_CODES: process.env.REACT_APP_ENABLE_QR_CODES !== 'false',
      ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
      ENABLE_I18N: process.env.REACT_APP_ENABLE_I18N === 'true',
      ENABLE_ANIMATIONS: process.env.REACT_APP_ENABLE_ANIMATIONS !== 'false',
      ENABLE_IMAGE_OPTIMIZATION: process.env.REACT_APP_ENABLE_IMAGE_OPTIMIZATION !== 'false',
      ENABLE_SERVICE_WORKER: process.env.REACT_APP_ENABLE_SERVICE_WORKER !== 'false',
      API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
      API_RATE_LIMIT: parseInt(process.env.REACT_APP_API_RATE_LIMIT || '100'),
      JWT_EXPIRY_HOURS: parseInt(process.env.REACT_APP_JWT_EXPIRY_HOURS || '24'),
      SESSION_TIMEOUT_MINUTES: parseInt(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES || '60'),
      MIN_PASSWORD_LENGTH: parseInt(process.env.REACT_APP_MIN_PASSWORD_LENGTH || '8'),
      DEFAULT_THEME: process.env.REACT_APP_DEFAULT_THEME || DEFAULT_CONFIG.DEFAULT_THEME,
      CHART_ANIMATION_INTERVAL: parseInt(process.env.REACT_APP_CHART_ANIMATION_INTERVAL || '30000'),
      CHART_ANIMATION_DURATION: parseInt(process.env.REACT_APP_CHART_ANIMATION_DURATION || '1000'),
      CHART_ANIMATION_EASING: process.env.REACT_APP_CHART_ANIMATION_EASING || DEFAULT_CONFIG.CHART_ANIMATION_EASING,
      CHART_ANIMATIONS_ENABLED: process.env.REACT_APP_CHART_ANIMATIONS_ENABLED !== 'false',
      CHART_AUTO_REFRESH_ENABLED: process.env.REACT_APP_CHART_AUTO_REFRESH_ENABLED !== 'false',
      LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || DEFAULT_CONFIG.LOG_LEVEL,
      ENABLE_CONSOLE_LOGGING: process.env.REACT_APP_ENABLE_CONSOLE_LOGGING === 'true',
      ENABLE_HOT_RELOAD: process.env.REACT_APP_ENABLE_HOT_RELOAD === 'true',
      GENERATE_SOURCEMAP: process.env.REACT_APP_GENERATE_SOURCEMAP === 'true'
    };
  }
  
  // In production, try to get from window.APP_CONFIG (runtime)
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    console.log('🔧 Using runtime configuration from window.APP_CONFIG');
    return { ...DEFAULT_CONFIG, ...window.APP_CONFIG };
  }
  
  // Use default configuration as final fallback
  return DEFAULT_CONFIG;
};

/**
 * Get specific configuration value
 */
export const getConfigValue = <K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] => {
  const config = getRuntimeConfig();
  return config[key];
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return getConfigValue('APP_ENV') === 'development' || process.env.NODE_ENV === 'development';
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  return getConfigValue('APP_ENV') === 'production' || process.env.NODE_ENV === 'production';
};

/**
 * Log current configuration (for debugging)
 */
export const logRuntimeConfig = (): void => {
  const config = getRuntimeConfig();
  
  if (config.DEBUG_MODE || isDevelopment()) {
    // Use console directly for configuration logging to avoid circular dependency
    console.group('🔧 Runtime Configuration');
    console.log('Environment:', config.APP_ENV);
    console.log('API Base URL:', config.API_BASE_URL);
    console.log('WebSocket URL:', config.WS_URL);
    console.log('Backend URL:', config.BACKEND_URL);
    console.log('App Name:', config.APP_NAME);
    console.log('App Version:', config.APP_VERSION);
    console.log('Debug Mode:', config.DEBUG_MODE);
    console.log('Feature Flags:', {
      ENABLE_THEME_TOGGLE: config.ENABLE_THEME_TOGGLE,
      ENABLE_ANALYTICS: config.ENABLE_ANALYTICS,
      ENABLE_QR_CODES: config.ENABLE_QR_CODES,
      ENABLE_NOTIFICATIONS: config.ENABLE_NOTIFICATIONS,
      ENABLE_I18N: config.ENABLE_I18N,
      ENABLE_ANIMATIONS: config.ENABLE_ANIMATIONS
    });
    console.log('Configuration Source:', window.APP_CONFIG ? 'Runtime' : 'Build-time/Default');
    console.groupEnd();
  }
};

// Export the runtime configuration instance
export const RUNTIME_CONFIG = getRuntimeConfig();

// Log configuration on module load
if (typeof window !== 'undefined') {
  // Delay logging to ensure window.APP_CONFIG is loaded
  setTimeout(() => {
    console.log('🔧 Runtime config loading - window.APP_CONFIG:', window.APP_CONFIG);
    console.log('🔧 Runtime config loading - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 Runtime config loading - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
    logRuntimeConfig();
  }, 100);
}