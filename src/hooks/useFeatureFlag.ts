/**
 * Enhanced Feature Flag Hooks
 * 
 * This module provides comprehensive feature flag functionality with improved
 * type safety, performance, and developer experience.
 */

import { useCallback, useMemo } from 'react';
import { isFeatureEnabled, getFeatureFlagsSubset, type FeatureFlags } from '../config/featureFlags';
import { getConfigValue, getRuntimeConfig } from '../config/runtime';

/**
 * Hook to check if a feature flag is enabled
 * @param flagName - The name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export const useFeatureFlag = (flagName: keyof FeatureFlags): boolean => {
  return useMemo(() => isFeatureEnabled(flagName), [flagName]);
};

/**
 * Hook to get multiple feature flags at once
 * @param flagNames - Array of feature flag names to check
 * @returns object with feature flag names as keys and boolean values
 */
export const useFeatureFlags = (flagNames: (keyof FeatureFlags)[]): Partial<FeatureFlags> => {
  return useMemo(() => getFeatureFlagsSubset(flagNames), [flagNames]);
};

/**
 * Hook to conditionally render components based on feature flags
 * @param flagName - The name of the feature flag to check
 * @returns object with render functions for enabled/disabled states
 */
export const useFeatureToggle = (flagName: keyof FeatureFlags) => {
  const isEnabled = useFeatureFlag(flagName);
  
  const renderIfEnabled = useCallback((component: React.ReactNode) => {
    return isEnabled ? component : null;
  }, [isEnabled]);
  
  const renderIfDisabled = useCallback((component: React.ReactNode) => {
    return !isEnabled ? component : null;
  }, [isEnabled]);
  
  return {
    isEnabled,
    renderIfEnabled,
    renderIfDisabled,
  };
};

/**
 * Hook for feature flag with fallback component
 * @param flagName - The name of the feature flag to check
 * @param enabledComponent - Component to render when feature is enabled
 * @param disabledComponent - Component to render when feature is disabled (optional)
 * @returns the appropriate component based on feature flag state
 */
export const useFeatureFlagComponent = (
  flagName: keyof FeatureFlags,
  enabledComponent: React.ReactNode,
  disabledComponent?: React.ReactNode
): React.ReactNode => {
  const isEnabled = useFeatureFlag(flagName);
  return isEnabled ? enabledComponent : (disabledComponent || null);
};

// Legacy support for backward compatibility
type LegacyFeatureFlagKey = 
  | 'themeToggle'
  | 'analytics'
  | 'qrCodes'
  | 'notifications'
  | 'i18n'
  | 'animations'
  | 'imageOptimization'
  | 'serviceWorker';

const LEGACY_FEATURE_FLAG_MAP: Record<LegacyFeatureFlagKey, string> = {
  themeToggle: 'ENABLE_THEME_TOGGLE',
  analytics: 'ENABLE_ANALYTICS',
  qrCodes: 'ENABLE_QR_CODES',
  notifications: 'ENABLE_NOTIFICATIONS',
  i18n: 'ENABLE_I18N',
  animations: 'ENABLE_ANIMATIONS',
  imageOptimization: 'ENABLE_IMAGE_OPTIMIZATION',
  serviceWorker: 'ENABLE_SERVICE_WORKER'
};

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useFeatureFlag with new FeatureFlags type instead
 */
export const useLegacyFeatureFlag = (featureName: LegacyFeatureFlagKey): boolean => {
  return useMemo(() => {
    const configKey = LEGACY_FEATURE_FLAG_MAP[featureName];
    return getConfigValue(configKey as any) as boolean;
  }, [featureName]);
};

/**
 * Legacy hook for multiple feature flags
 * @deprecated Use useFeatureFlags with new FeatureFlags type instead
 */
export const useLegacyFeatureFlags = (
  featureNames: LegacyFeatureFlagKey[]
): Record<string, boolean> => {
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    featureNames.forEach(featureName => {
      const configKey = LEGACY_FEATURE_FLAG_MAP[featureName];
      flags[featureName] = getConfigValue(configKey as any) as boolean;
    });
    return flags;
  }, [featureNames]);
};

/**
 * Hook to get all legacy feature flags
 * @deprecated Use the new feature flag system instead
 */
export const useAllLegacyFeatureFlags = (): Record<string, boolean> => {
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    Object.entries(LEGACY_FEATURE_FLAG_MAP).forEach(([featureName, configKey]) => {
      flags[featureName] = getConfigValue(configKey as any) as boolean;
    });
    return flags;
  }, []);
};

/**
 * Hook to get application configuration
 * @returns The complete application configuration object
 */
export const useAppConfig = () => {
  return useMemo(() => getRuntimeConfig(), []);
};

/**
 * Hook to check if the application is in development mode
 * @returns boolean indicating if the app is in development mode
 */
export const useIsDevelopment = (): boolean => {
  return useMemo(() => getConfigValue('APP_ENV') === 'development', []);
};

/**
 * Hook to check if the application is in production mode
 * @returns boolean indicating if the app is in production mode
 */
export const useIsProduction = (): boolean => {
  return useMemo(() => getConfigValue('APP_ENV') === 'production', []);
};

/**
 * Hook to check if debug mode is enabled
 * @returns boolean indicating if debug mode is enabled
 */
export const useIsDebugMode = (): boolean => {
  return useMemo(() => getConfigValue('DEBUG_MODE') as boolean, []);
};

export default useFeatureFlag;