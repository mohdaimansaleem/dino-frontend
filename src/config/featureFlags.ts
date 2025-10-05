/**
 * Feature Flag System
 * 
 * This module provides a centralized feature flag system that allows enabling/disabling
 * features through environment variables. This makes the application highly configurable
 * and allows for gradual feature rollouts.
 */

/**
 * Available feature flags in the application
 */
export interface FeatureFlags {
  // UI Features
  themeToggle: boolean;
  darkMode: boolean;
  newDashboard: boolean;
  enhancedSidebar: boolean;
  animatedComponents: boolean;
  
  // Analytics & Monitoring
  analytics: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  userActivityTracking: boolean;
  
  // Business Features
  qrCodes: boolean;
  notifications: boolean;
  realTimeUpdates: boolean;
  advancedReporting: boolean;
  multiWorkspace: boolean;
  
  // Payment & Commerce
  onlinePayments: boolean;
  coupons: boolean;
  loyaltyProgram: boolean;
  subscriptions: boolean;
  
  // Advanced Features
  aiRecommendations: boolean;
  voiceOrdering: boolean;
  inventoryManagement: boolean;
  staffScheduling: boolean;
  customerFeedback: boolean;
  
  // Development & Debug
  debugMode: boolean;
  apiLogging: boolean;
  performanceMetrics: boolean;
  betaFeatures: boolean;
  experimentalFeatures: boolean;
  
  // Security Features
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
  ipWhitelist: boolean;
  auditLogging: boolean;
  
  // Integration Features
  thirdPartyIntegrations: boolean;
  webhooks: boolean;
  apiAccess: boolean;
  exportData: boolean;
}

/**
 * Default feature flag values
 * These are used when environment variables are not set
 */
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // UI Features - Generally enabled for better UX
  themeToggle: false, // Disabled by default as mentioned in existing code
  darkMode: true,
  newDashboard: true,
  enhancedSidebar: true,
  animatedComponents: true,
  
  // Analytics & Monitoring - Enabled for insights
  analytics: true,
  performanceMonitoring: true,
  errorTracking: true,
  userActivityTracking: true,
  
  // Business Features - Core features enabled
  qrCodes: true,
  notifications: true,
  realTimeUpdates: true,
  advancedReporting: false, // Premium feature
  multiWorkspace: true,
  
  // Payment & Commerce - Disabled by default (require setup)
  onlinePayments: false,
  coupons: true,
  loyaltyProgram: false,
  subscriptions: false,
  
  // Advanced Features - Disabled by default (premium/future features)
  aiRecommendations: false,
  voiceOrdering: false,
  inventoryManagement: false,
  staffScheduling: false,
  customerFeedback: true,
  
  // Development & Debug - Environment dependent
  debugMode: false, // Will be overridden based on NODE_ENV
  apiLogging: false,
  performanceMetrics: false,
  betaFeatures: false,
  experimentalFeatures: false,
  
  // Security Features - Disabled by default (require configuration)
  twoFactorAuth: false,
  sessionTimeout: true,
  ipWhitelist: false,
  auditLogging: true,
  
  // Integration Features - Disabled by default
  thirdPartyIntegrations: false,
  webhooks: false,
  apiAccess: false,
  exportData: true,
};

/**
 * Environment variable mapping for feature flags
 * Maps feature flag names to their corresponding environment variable names
 */
const ENV_VAR_MAPPING: Record<keyof FeatureFlags, string> = {
  // UI Features
  themeToggle: 'REACT_APP_FEATURE_THEME_TOGGLE',
  darkMode: 'REACT_APP_FEATURE_DARK_MODE',
  newDashboard: 'REACT_APP_FEATURE_NEW_DASHBOARD',
  enhancedSidebar: 'REACT_APP_FEATURE_ENHANCED_SIDEBAR',
  animatedComponents: 'REACT_APP_FEATURE_ANIMATED_COMPONENTS',
  
  // Analytics & Monitoring
  analytics: 'REACT_APP_FEATURE_ANALYTICS',
  performanceMonitoring: 'REACT_APP_FEATURE_PERFORMANCE_MONITORING',
  errorTracking: 'REACT_APP_FEATURE_ERROR_TRACKING',
  userActivityTracking: 'REACT_APP_FEATURE_USER_ACTIVITY_TRACKING',
  
  // Business Features
  qrCodes: 'REACT_APP_FEATURE_QR_CODES',
  notifications: 'REACT_APP_FEATURE_NOTIFICATIONS',
  realTimeUpdates: 'REACT_APP_FEATURE_REAL_TIME_UPDATES',
  advancedReporting: 'REACT_APP_FEATURE_ADVANCED_REPORTING',
  multiWorkspace: 'REACT_APP_FEATURE_MULTI_WORKSPACE',
  
  // Payment & Commerce
  onlinePayments: 'REACT_APP_FEATURE_ONLINE_PAYMENTS',
  coupons: 'REACT_APP_FEATURE_COUPONS',
  loyaltyProgram: 'REACT_APP_FEATURE_LOYALTY_PROGRAM',
  subscriptions: 'REACT_APP_FEATURE_SUBSCRIPTIONS',
  
  // Advanced Features
  aiRecommendations: 'REACT_APP_FEATURE_AI_RECOMMENDATIONS',
  voiceOrdering: 'REACT_APP_FEATURE_VOICE_ORDERING',
  inventoryManagement: 'REACT_APP_FEATURE_INVENTORY_MANAGEMENT',
  staffScheduling: 'REACT_APP_FEATURE_STAFF_SCHEDULING',
  customerFeedback: 'REACT_APP_FEATURE_CUSTOMER_FEEDBACK',
  
  // Development & Debug
  debugMode: 'REACT_APP_FEATURE_DEBUG_MODE',
  apiLogging: 'REACT_APP_FEATURE_API_LOGGING',
  performanceMetrics: 'REACT_APP_FEATURE_PERFORMANCE_METRICS',
  betaFeatures: 'REACT_APP_FEATURE_BETA',
  experimentalFeatures: 'REACT_APP_FEATURE_EXPERIMENTAL',
  
  // Security Features
  twoFactorAuth: 'REACT_APP_FEATURE_TWO_FACTOR_AUTH',
  sessionTimeout: 'REACT_APP_FEATURE_SESSION_TIMEOUT',
  ipWhitelist: 'REACT_APP_FEATURE_IP_WHITELIST',
  auditLogging: 'REACT_APP_FEATURE_AUDIT_LOGGING',
  
  // Integration Features
  thirdPartyIntegrations: 'REACT_APP_FEATURE_THIRD_PARTY_INTEGRATIONS',
  webhooks: 'REACT_APP_FEATURE_WEBHOOKS',
  apiAccess: 'REACT_APP_FEATURE_API_ACCESS',
  exportData: 'REACT_APP_FEATURE_EXPORT_DATA',
};

/**
 * Parse boolean value from environment variable
 */
const parseBooleanEnvVar = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  const normalizedValue = value.toLowerCase().trim();
  
  // Handle various truthy values
  if (['true', '1', 'yes', 'on', 'enabled'].includes(normalizedValue)) {
    return true;
  }
  
  // Handle various falsy values
  if (['false', '0', 'no', 'off', 'disabled'].includes(normalizedValue)) {
    return false;
  }
  
  // If value is not recognized, use default
  console.warn(`Invalid boolean value for environment variable: "${value}". Using default: ${defaultValue}`);
  return defaultValue;
};

/**
 * Get feature flags from environment variables with fallbacks to defaults
 */
export const getFeatureFlags = (): FeatureFlags => {
  const flags: FeatureFlags = {} as FeatureFlags;
  
  // Process each feature flag
  for (const [flagName, envVarName] of Object.entries(ENV_VAR_MAPPING)) {
    const envValue = process.env[envVarName];
    const defaultValue = DEFAULT_FEATURE_FLAGS[flagName as keyof FeatureFlags];
    
    flags[flagName as keyof FeatureFlags] = parseBooleanEnvVar(envValue, defaultValue);
  }
  
  // Special handling for debug mode - auto-enable in development
  if (process.env.NODE_ENV === 'development') {
    flags.debugMode = parseBooleanEnvVar(process.env.REACT_APP_FEATURE_DEBUG_MODE, true);
    flags.apiLogging = parseBooleanEnvVar(process.env.REACT_APP_FEATURE_API_LOGGING, true);
    flags.performanceMetrics = parseBooleanEnvVar(process.env.REACT_APP_FEATURE_PERFORMANCE_METRICS, true);
  }
  
  return flags;
};

/**
 * Cached feature flags instance
 */
let cachedFeatureFlags: FeatureFlags | null = null;

/**
 * Get cached feature flags (for performance)
 */
export const getCachedFeatureFlags = (): FeatureFlags => {
  if (!cachedFeatureFlags) {
    cachedFeatureFlags = getFeatureFlags();
  }
  return cachedFeatureFlags;
};

/**
 * Clear feature flags cache (useful for testing or dynamic updates)
 */
export const clearFeatureFlagsCache = (): void => {
  cachedFeatureFlags = null;
};

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (flagName: keyof FeatureFlags): boolean => {
  const flags = getCachedFeatureFlags();
  return flags[flagName];
};

/**
 * Get multiple feature flags at once
 */
export const getFeatureFlagsSubset = (flagNames: (keyof FeatureFlags)[]): Partial<FeatureFlags> => {
  const flags = getCachedFeatureFlags();
  const subset: Partial<FeatureFlags> = {};
  
  for (const flagName of flagNames) {
    subset[flagName] = flags[flagName];
  }
  
  return subset;
};

/**
 * Feature flag groups for easier management
 */
export const FEATURE_FLAG_GROUPS = {
  UI: ['themeToggle', 'darkMode', 'newDashboard', 'enhancedSidebar', 'animatedComponents'] as const,
  ANALYTICS: ['analytics', 'performanceMonitoring', 'errorTracking', 'userActivityTracking'] as const,
  BUSINESS: ['qrCodes', 'notifications', 'realTimeUpdates', 'advancedReporting', 'multiWorkspace'] as const,
  COMMERCE: ['onlinePayments', 'coupons', 'loyaltyProgram', 'subscriptions'] as const,
  ADVANCED: ['aiRecommendations', 'voiceOrdering', 'inventoryManagement', 'staffScheduling', 'customerFeedback'] as const,
  DEBUG: ['debugMode', 'apiLogging', 'performanceMetrics', 'betaFeatures', 'experimentalFeatures'] as const,
  SECURITY: ['twoFactorAuth', 'sessionTimeout', 'ipWhitelist', 'auditLogging'] as const,
  INTEGRATION: ['thirdPartyIntegrations', 'webhooks', 'apiAccess', 'exportData'] as const,
} as const;

/**
 * Get feature flags for a specific group
 */
export const getFeatureFlagGroup = (groupName: keyof typeof FEATURE_FLAG_GROUPS): Partial<FeatureFlags> => {
  const flagNames = [...FEATURE_FLAG_GROUPS[groupName]] as (keyof FeatureFlags)[];
  return getFeatureFlagsSubset(flagNames);
};

/**
 * Log current feature flag status (for debugging)
 */
export const logFeatureFlags = (): void => {
  if (isFeatureEnabled('debugMode')) {
    const flags = getCachedFeatureFlags();
    console.group('🚩 Feature Flags Status');
    
    for (const [groupName, flagNames] of Object.entries(FEATURE_FLAG_GROUPS)) {
      console.group(`${groupName} Features`);
      for (const flagName of flagNames) {
        const isEnabled = flags[flagName];
        console.log(`${flagName}: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  }
};

/**
 * Validate feature flag configuration
 */
export const validateFeatureFlags = (): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  const flags = getCachedFeatureFlags();
  
  // Check for potentially problematic combinations
  if (flags.experimentalFeatures && process.env.NODE_ENV === 'production') {
    warnings.push('Experimental features are enabled in production environment');
  }
  
  if (flags.debugMode && process.env.NODE_ENV === 'production') {
    warnings.push('Debug mode is enabled in production environment');
  }
  
  if (flags.onlinePayments && !flags.analytics) {
    warnings.push('Online payments are enabled but analytics are disabled - this may impact payment tracking');
  }
  
  if (flags.realTimeUpdates && !flags.notifications) {
    warnings.push('Real-time updates are enabled but notifications are disabled - users may miss important updates');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
};

// Initialize feature flags and log them in development
if (typeof window !== 'undefined') {
  // Delay to ensure environment is fully loaded
  setTimeout(() => {
    const validation = validateFeatureFlags();
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Feature Flag Warnings:', validation.warnings);
    }
    
    logFeatureFlags();
  }, 100);
}

// Export the main feature flags instance
export const featureFlags = getCachedFeatureFlags();
export default featureFlags;