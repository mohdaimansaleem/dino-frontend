/**
 * Feature Flag Hook
 * 
 * This hook provides a convenient way to check feature flags throughout
 * the application and enables conditional rendering based on runtime
 * configuration.
 */

import { useMemo } from 'react';
import { getConfigValue, getRuntimeConfig } from '../config/runtime';

// Feature flag mapping
type FeatureFlagKey = 
  | 'themeToggle'
  | 'analytics'
  | 'qrCodes'
  | 'notifications'
  | 'i18n'
  | 'animations'
  | 'imageOptimization'
  | 'serviceWorker';

const FEATURE_FLAG_MAP: Record<FeatureFlagKey, string> = {
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
 * Hook to check if a specific feature is enabled
 * 
 * @param featureName - The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isThemeToggleEnabled = useFeatureFlag('themeToggle');
 *   
 *   return (
 *     <div>
 *       {isThemeToggleEnabled && <ThemeToggle />}
 *     </div>
 *   );
 * };
 * ```
 */
export const useFeatureFlag = (featureName: FeatureFlagKey): boolean => {
  return useMemo(() => {
    const configKey = FEATURE_FLAG_MAP[featureName];
    return getConfigValue(configKey as any) as boolean;
  }, [featureName]);
};

/**
 * Hook to get multiple feature flags at once
 * 
 * @param featureNames - Array of feature names to check
 * @returns Object with feature names as keys and boolean values
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const features = useFeatureFlags(['themeToggle', 'analytics', 'qrCodes']);
 *   
 *   return (
 *     <div>
 *       {features.themeToggle && <ThemeToggle />}
 *       {features.analytics && <AnalyticsPanel />}
 *       {features.qrCodes && <QRCodeGenerator />}
 *     </div>
 *   );
 * };
 * ```
 */
export const useFeatureFlags = (
  featureNames: FeatureFlagKey[]
): Record<string, boolean> => {
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    featureNames.forEach(featureName => {
      const configKey = FEATURE_FLAG_MAP[featureName];
      flags[featureName] = getConfigValue(configKey as any) as boolean;
    });
    return flags;
  }, [featureNames]);
};

/**
 * Hook to get all feature flags
 * 
 * @returns Object with all feature flags and their current state
 * 
 * @example
 * ```tsx
 * const AdminPanel = () => {
 *   const allFeatures = useAllFeatureFlags();
 *   
 *   return (
 *     <div>
 *       <h3>Feature Flags Status</h3>
 *       {Object.entries(allFeatures).map(([feature, enabled]) => (
 *         <div key={feature}>
 *           {feature}: {enabled ? 'Enabled' : 'Disabled'}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const useAllFeatureFlags = (): Record<string, boolean> => {
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    Object.entries(FEATURE_FLAG_MAP).forEach(([featureName, configKey]) => {
      flags[featureName] = getConfigValue(configKey as any) as boolean;
    });
    return flags;
  }, []);
};

/**
 * Hook to get application configuration
 * 
 * @returns The complete application configuration object
 * 
 * @example
 * ```tsx
 * const ApiService = () => {
 *   const appConfig = useAppConfig();
 *   
 *   const apiUrl = appConfig.API_BASE_URL;
 *   const timeout = appConfig.API_TIMEOUT;
 *   
 *   // Use configuration values...
 * };
 * ```
 */
export const useAppConfig = () => {
  return useMemo(() => getRuntimeConfig(), []);
};

/**
 * Hook to check if the application is in development mode
 * 
 * @returns boolean indicating if the app is in development mode
 */
export const useIsDevelopment = (): boolean => {
  return useMemo(() => getConfigValue('APP_ENV') === 'development', []);
};

/**
 * Hook to check if the application is in production mode
 * 
 * @returns boolean indicating if the app is in production mode
 */
export const useIsProduction = (): boolean => {
  return useMemo(() => getConfigValue('APP_ENV') === 'production', []);
};

/**
 * Hook to check if debug mode is enabled
 * 
 * @returns boolean indicating if debug mode is enabled
 */
export const useIsDebugMode = (): boolean => {
  return useMemo(() => getConfigValue('DEBUG_MODE') as boolean, []);
};

export default useFeatureFlag;