/**
 * API Configuration - Single Source of Truth
 * 
 * This file centralizes ALL API and WebSocket URLs.
 * Change URLs here ONCE and they apply everywhere.
 */

// =============================================================================
// ENVIRONMENT VARIABLE HELPERS
// =============================================================================

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

// =============================================================================
// SINGLE SOURCE OF TRUTH - CHANGE URLS HERE ONLY
// =============================================================================

/**
 * API URLs - Now using relative paths for nginx proxy
 * All API calls will go through nginx which will proxy to backend
 */
const API_URL = '/api/v1';
const WS_URL = '/ws';

/**
 * Backend URLs (for environment configuration)
 * These are used by nginx or deployment scripts, not directly by frontend
 */
const PRODUCTION_BACKEND_URL = 'https://dino-backend-api-867506203789.us-central1.run.app';
const DEVELOPMENT_BACKEND_URL = 'http://localhost:8000';

// =============================================================================
// AUTOMATIC URL RESOLUTION
// =============================================================================

/**
 * Get the appropriate API base URL based on environment
 * Now returns relative URL for nginx proxy
 */
export const getApiBaseUrl = (): string => {
  // Priority: Environment Variable > Relative URL Default
  const envUrl = getEnvVar('REACT_APP_API_BASE_URL');
  if (envUrl) {
    return envUrl;
  }
  
  // Use relative URL for nginx proxy
  return API_URL;
};

/**
 * Get the appropriate WebSocket URL based on environment
 * Now returns relative URL for nginx proxy
 */
export const getWebSocketUrl = (): string => {
  // Priority: Environment Variable > Relative URL Default
  const envWsUrl = getEnvVar('REACT_APP_WS_URL');
  if (envWsUrl) {
    return envWsUrl;
  }
  
  // Use relative URL for nginx proxy
  return WS_URL;
};

/**
 * Get base URL without /api/v1 suffix (for WebSocket derivation)
 */
export const getBaseUrl = (): string => {
  return getApiBaseUrl().replace('/api/v1', '');
};

/**
 * Get backend URL for deployment configuration
 * This is used by deployment scripts, not by frontend directly
 */
export const getBackendUrl = (): string => {
  const envUrl = getEnvVar('REACT_APP_BACKEND_URL');
  if (envUrl) {
    return envUrl;
  }
  
  // Default to production backend
  return PRODUCTION_BACKEND_URL;
};

// =============================================================================
// CENTRALIZED API CONFIGURATION
// =============================================================================

/**
 * Complete API Configuration
 * All services should import and use this configuration
 */
export const API_CONFIG = {
  // URLs
  BASE_URL: getApiBaseUrl(),
  WS_URL: getWebSocketUrl(),
  BASE_DOMAIN: getBaseUrl(),
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  WS_TIMEOUT: 5000, // 5 seconds for WebSocket connection
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Authentication
  TOKEN_KEY: 'dino_token',
  REFRESH_TOKEN_KEY: 'dino_refresh_token',
  USER_KEY: 'dino_user',
  
  // WebSocket configuration
  WS_RECONNECT_ATTEMPTS: 5,
  WS_RECONNECT_DELAY: 1000,
  WS_HEARTBEAT_INTERVAL: 30000, // 30 seconds
} as const;

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENV === 'development';
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' || 
         process.env.REACT_APP_ENV === 'production';
};

/**
 * Get environment name
 */
export const getEnvironment = (): string => {
  return process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';
};

// =============================================================================
// DEBUGGING HELPERS
// =============================================================================

/**
 * Log current configuration (for debugging)
 */
export const logApiConfig = (): void => {
  if (isDevelopment()) {
    console.group('🔧 API Configuration');
    console.log('Environment:', getEnvironment());
    console.log('API Base URL:', API_CONFIG.BASE_URL);
    console.log('WebSocket URL:', API_CONFIG.WS_URL);
    console.log('Base Domain:', API_CONFIG.BASE_DOMAIN);
    console.log('Environment Variables:');
    console.log('  REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || 'not set');
    console.log('  REACT_APP_WS_URL:', process.env.REACT_APP_WS_URL || 'not set');
    console.log('  REACT_APP_ENV:', process.env.REACT_APP_ENV || 'not set');
    console.groupEnd();
  }
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate API configuration
 */
export const validateApiConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check API URL
  if (!API_CONFIG.BASE_URL) {
    errors.push('API Base URL is not configured');
  } else if (!API_CONFIG.BASE_URL.startsWith('http') && !API_CONFIG.BASE_URL.startsWith('/')) {
    errors.push('API Base URL must start with http://, https://, or / (for relative URLs)');
  }
  
  // Check WebSocket URL
  if (!API_CONFIG.WS_URL) {
    errors.push('WebSocket URL is not configured');
  } else if (!API_CONFIG.WS_URL.startsWith('ws') && !API_CONFIG.WS_URL.startsWith('/')) {
    errors.push('WebSocket URL must start with ws://, wss://, or / (for relative URLs)');
  }
  
  // Check for relative URLs (should be relative in production)
  if (isProduction()) {
    if (API_CONFIG.BASE_URL.startsWith('http') && API_CONFIG.BASE_URL.includes('localhost')) {
      errors.push('API URL should not use localhost in production');
    }
    if (API_CONFIG.WS_URL.startsWith('ws') && API_CONFIG.WS_URL.includes('localhost')) {
      errors.push('WebSocket URL should not use localhost in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default API_CONFIG;

// Log configuration in development
if (isDevelopment()) {
  logApiConfig();
  
  const validation = validateApiConfig();
  if (!validation.valid) {
    console.warn('⚠️ API Configuration Issues:', validation.errors);
  }
}

// Always log in production for debugging
console.group('🔧 API Configuration (Production Debug)');
console.log('Environment:', getEnvironment());
console.log('API Base URL:', API_CONFIG.BASE_URL);
console.log('WebSocket URL:', API_CONFIG.WS_URL);
console.log('Base Domain:', API_CONFIG.BASE_DOMAIN);
console.log('Environment Variables:');
console.log('  REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || 'not set');
console.log('  REACT_APP_WS_URL:', process.env.REACT_APP_WS_URL || 'not set');
console.log('  REACT_APP_ENV:', process.env.REACT_APP_ENV || 'not set');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.groupEnd();