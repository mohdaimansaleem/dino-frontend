/**
 * Environment Configuration
 * 
 * This file centralizes all environment variable access and provides
 * type-safe configuration for the entire application.
 */

// =============================================================================
// TYPES
// =============================================================================

export type Environment = 'development' | 'staging' | 'production';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely gets an environment variable with a default value
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

/**
 * Gets a boolean environment variable
 */
const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

/**
 * Gets a number environment variable
 */
const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = process.env[key];
  if (value && !isNaN(Number(value))) {
    return Number(value);
  }
  return defaultValue;
};

// =============================================================================
// CONFIGURATION OBJECT
// =============================================================================

export const config = {
  // Application Settings
  app: {
    env: getEnvVar('REACT_APP_ENV', 'development') as Environment,
    name: getEnvVar('REACT_APP_NAME', 'Dino E-Menu'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    debugMode: getBooleanEnvVar('REACT_APP_DEBUG_MODE', false),
  },

  // Feature Flags
  features: {
    // Theme Toggle Feature
    // Controls visibility of the dark/light mode toggle button
    themeToggle: getBooleanEnvVar('REACT_APP_ENABLE_THEME_TOGGLE', true),
    
    // Demo Mode Feature
    // Enables demo login functionality for testing (disabled for production)
    demoMode: getBooleanEnvVar('REACT_APP_ENABLE_DEMO_MODE', false),
    
    // Analytics Feature
    // Enables advanced analytics and reporting
    analytics: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', false),
    
    // QR Code Feature
    // Enables QR code generation for tables and menus
    qrCodes: getBooleanEnvVar('REACT_APP_ENABLE_QR_CODES', true),
    
    // Real-time Notifications Feature
    // Enables real-time notifications for orders
    notifications: getBooleanEnvVar('REACT_APP_ENABLE_NOTIFICATIONS', true),
    
    // Multi-language Support Feature
    // Enables internationalization (i18n)
    i18n: getBooleanEnvVar('REACT_APP_ENABLE_I18N', false),
  },

  // API Configuration
  api: {
    baseUrl: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:8000/api/v1'),
    timeout: getNumberEnvVar('REACT_APP_API_TIMEOUT', 30000),
    rateLimit: getNumberEnvVar('REACT_APP_API_RATE_LIMIT', 100),
  },

  // Authentication & Security
  auth: {
    jwtExpiryHours: getNumberEnvVar('REACT_APP_JWT_EXPIRY_HOURS', 24),
    sessionTimeoutMinutes: getNumberEnvVar('REACT_APP_SESSION_TIMEOUT_MINUTES', 60),
    minPasswordLength: getNumberEnvVar('REACT_APP_MIN_PASSWORD_LENGTH', 8),
  },

  // Third-party Services
  services: {
    googleAnalyticsId: getEnvVar('REACT_APP_GOOGLE_ANALYTICS_ID'),
    stripePublicKey: getEnvVar('REACT_APP_STRIPE_PUBLIC_KEY'),
    sentryDsn: getEnvVar('REACT_APP_SENTRY_DSN'),
    firebase: {
      apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY'),
      authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
      storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnvVar('REACT_APP_FIREBASE_APP_ID'),
    },
  },

  // UI/UX Configuration
  ui: {
    defaultTheme: getEnvVar('REACT_APP_DEFAULT_THEME', 'light') as ThemeMode,
    enableAnimations: getBooleanEnvVar('REACT_APP_ENABLE_ANIMATIONS', true),
  },

  // Performance Settings
  performance: {
    imageOptimization: getBooleanEnvVar('REACT_APP_ENABLE_IMAGE_OPTIMIZATION', true),
    serviceWorker: getBooleanEnvVar('REACT_APP_ENABLE_SERVICE_WORKER', true),
  },

  // Development Settings
  development: {
    hotReload: getBooleanEnvVar('REACT_APP_ENABLE_HOT_RELOAD', true),
    generateSourcemap: getBooleanEnvVar('REACT_APP_GENERATE_SOURCEMAP', true),
  },

  // Logging Configuration
  logging: {
    level: getEnvVar('REACT_APP_LOG_LEVEL', 'info') as LogLevel,
    enableConsole: getBooleanEnvVar('REACT_APP_ENABLE_CONSOLE_LOGGING', true),
  },
} as const;

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates the configuration and logs warnings for missing required values
 */
export const validateConfig = (): void => {
  const warnings: string[] = [];

  // Check for required API configuration
  if (!config.api.baseUrl) {
    warnings.push('REACT_APP_API_BASE_URL is not set');
  }

  // Check for production-specific requirements
  if (config.app.env === 'production') {
    if (config.app.debugMode) {
      warnings.push('Debug mode should be disabled in production');
    }
    
    if (config.logging.level === 'debug') {
      warnings.push('Log level should not be debug in production');
    }
  }

  // Log warnings if any
  if (warnings.length > 0 && config.logging.enableConsole) {
    console.warn('Configuration warnings:', warnings);
  }
};

// =============================================================================
// FEATURE FLAG HELPERS
// =============================================================================

/**
 * Helper functions to check feature flags
 */
export const isFeatureEnabled = {
  themeToggle: () => config.features.themeToggle,
  demoMode: () => config.features.demoMode,
  analytics: () => config.features.analytics,
  qrCodes: () => config.features.qrCodes,
  notifications: () => config.features.notifications,
  i18n: () => config.features.i18n,
};

// =============================================================================
// EXPORTS
// =============================================================================

export default config;

// Validate configuration on import
if (config.app.env === 'development') {
  validateConfig();
}