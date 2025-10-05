/**
 * Centralized Configuration Export
 * 
 * This file provides a single entry point for all configuration
 * across the application.
 */

// Runtime configuration system
export {
  getRuntimeConfig,
  getConfigValue,
  isDevelopment,
  isProduction,
  logRuntimeConfig,
  RUNTIME_CONFIG,
  type RuntimeConfig
} from './runtime';

// API configuration
export {
  getApiBaseUrl,
  createApiUrl,
  getDefaultFetchOptions,
  getAuthenticatedFetchOptions
} from '../utils/api';

// Default export for convenience
export { RUNTIME_CONFIG as default } from './runtime';

// Configuration validation
export const validateAllConfigs = (): { valid: boolean; errors: string[] } => {
  const { validateApiConfig } = require('./api');
  const apiValidation = validateApiConfig();
  
  return {
    valid: apiValidation.valid,
    errors: [...apiValidation.errors]
  };
};

// Configuration summary for debugging
export const getConfigSummary = () => {
  const { getRuntimeConfig } = require('./runtime');
  const config = getRuntimeConfig();
  
  return {
    environment: config.APP_ENV,
    apiBaseUrl: config.API_BASE_URL,
    wsUrl: config.WS_URL,
    backendUrl: config.BACKEND_URL,
    debugMode: config.DEBUG_MODE,
    features: {
      analytics: config.ENABLE_ANALYTICS,
      notifications: config.ENABLE_NOTIFICATIONS,
      qrCodes: config.ENABLE_QR_CODES,
      themeToggle: config.ENABLE_THEME_TOGGLE,
      animations: config.ENABLE_ANIMATIONS
    },
    api: {
      timeout: config.API_TIMEOUT,
      rateLimit: config.API_RATE_LIMIT
    }
  };
};