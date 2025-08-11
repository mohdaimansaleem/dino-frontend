/**
 * API Configuration - Single Source of Truth
 * 
 * This file centralizes ALL API and WebSocket URLs using runtime configuration.
 * Configuration is loaded from window.APP_CONFIG (runtime) or environment variables (build-time).
 */

import { getRuntimeConfig, getConfigValue, isDevelopment, isProduction } from './runtime';

// =============================================================================
// RUNTIME CONFIGURATION INTEGRATION
// =============================================================================

/**
 * Get the appropriate API base URL based on runtime configuration
 * Priority: Runtime Config > Environment Variables > Default
 */
export const getApiBaseUrl = (): string => {
  return getConfigValue('API_BASE_URL');
};

/**
 * Get the appropriate WebSocket URL based on runtime configuration
 * Priority: Runtime Config > Environment Variables > Default
 */
export const getWebSocketUrl = (): string => {
  return getConfigValue('WS_URL');
};

/**
 * Get base URL without /api/v1 suffix (for WebSocket derivation)
 */
export const getBaseUrl = (): string => {
  return getApiBaseUrl().replace('/api/v1', '');
};

/**
 * Get backend URL for deployment configuration
 * This is used by nginx proxy configuration
 */
export const getBackendUrl = (): string => {
  return getConfigValue('BACKEND_URL');
};

// =============================================================================
// CENTRALIZED API CONFIGURATION
// =============================================================================

/**
 * Complete API Configuration
 * All services should import and use this configuration
 * Now uses runtime configuration for all values
 */
export const API_CONFIG = {
  // URLs - from runtime config
  BASE_URL: getApiBaseUrl(),
  WS_URL: getWebSocketUrl(),
  BASE_DOMAIN: getBaseUrl(),
  BACKEND_URL: getBackendUrl(),
  
  // Timeouts - from runtime config
  TIMEOUT: getConfigValue('API_TIMEOUT'),
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
  
  // Rate limiting
  RATE_LIMIT: getConfigValue('API_RATE_LIMIT'),
} as const;

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Get environment name from runtime config
 */
export const getEnvironment = (): string => {
  return getConfigValue('APP_ENV');
};

// =============================================================================
// DEBUGGING HELPERS
// =============================================================================

/**
 * Log current configuration (for debugging)
 */
export const logApiConfig = (): void => {
  const config = getRuntimeConfig();
  
  if (config.DEBUG_MODE || isDevelopment()) {
    // Use console directly for configuration logging to avoid circular dependency
    console.group('🔧 API Configuration');
    console.log('Environment:', getEnvironment());
    console.log('API Base URL:', API_CONFIG.BASE_URL);
    console.log('WebSocket URL:', API_CONFIG.WS_URL);
    console.log('Base Domain:', API_CONFIG.BASE_DOMAIN);
    console.log('Backend URL:', API_CONFIG.BACKEND_URL);
    console.log('API Timeout:', API_CONFIG.TIMEOUT);
    console.log('Rate Limit:', API_CONFIG.RATE_LIMIT);
    console.log('Configuration Source:', typeof window !== 'undefined' && window.APP_CONFIG ? 'Runtime' : 'Build-time/Default');
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
  
  // Check backend URL
  if (!API_CONFIG.BACKEND_URL) {
    errors.push('Backend URL is not configured');
  } else if (!API_CONFIG.BACKEND_URL.startsWith('http')) {
    errors.push('Backend URL must start with http:// or https://');
  }
  
  // Check for localhost in production
  if (isProduction()) {
    if (API_CONFIG.BASE_URL.startsWith('http') && API_CONFIG.BASE_URL.includes('localhost')) {
      errors.push('API URL should not use localhost in production');
    }
    if (API_CONFIG.WS_URL.startsWith('ws') && API_CONFIG.WS_URL.includes('localhost')) {
      errors.push('WebSocket URL should not use localhost in production');
    }
    if (API_CONFIG.BACKEND_URL.includes('localhost')) {
      errors.push('Backend URL should not use localhost in production');
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

// Initialize and validate configuration
if (typeof window !== 'undefined') {
  // Delay initialization to ensure window.APP_CONFIG is loaded
  setTimeout(() => {
    logApiConfig();
    
    const validation = validateApiConfig();
    if (!validation.valid) {
      console.warn('⚠️ API Configuration Issues:', validation.errors);
    }
    
    // Trigger API service configuration refresh if needed
    if ((window as any).apiService && typeof (window as any).apiService.refreshConfiguration === 'function') {
      (window as any).apiService.refreshConfiguration();
    }
  }, 150);
}