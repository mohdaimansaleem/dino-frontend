/**
 * Feature Flag Hook
 * 
 * This hook provides a convenient way to check feature flags throughout
 * the application and enables conditional rendering based on environment
 * configuration.
 */

import { useMemo } from 'react';
import { config, isFeatureEnabled } from '../config/env';

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
export const useFeatureFlag = (featureName: keyof typeof isFeatureEnabled): boolean => {
  return useMemo(() => {
    return isFeatureEnabled[featureName]();
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
  featureNames: (keyof typeof isFeatureEnabled)[]
): Record<string, boolean> => {
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    featureNames.forEach(featureName => {
      flags[featureName] = isFeatureEnabled[featureName]();
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
    return {
      themeToggle: isFeatureEnabled.themeToggle(),
      demoMode: isFeatureEnabled.demoMode(),
      analytics: isFeatureEnabled.analytics(),
      qrCodes: isFeatureEnabled.qrCodes(),
      notifications: isFeatureEnabled.notifications(),
      i18n: isFeatureEnabled.i18n(),
    };
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
 *   const apiUrl = appConfig.api.baseUrl;
 *   const timeout = appConfig.api.timeout;
 *   
 *   // Use configuration values...
 * };
 * ```
 */
export const useAppConfig = () => {
  return useMemo(() => config, []);
};

/**
 * Hook to check if the application is in development mode
 * 
 * @returns boolean indicating if the app is in development mode
 */
export const useIsDevelopment = (): boolean => {
  return useMemo(() => config.app.env === 'development', []);
};

/**
 * Hook to check if the application is in production mode
 * 
 * @returns boolean indicating if the app is in production mode
 */
export const useIsProduction = (): boolean => {
  return useMemo(() => config.app.env === 'production', []);
};

export default useFeatureFlag;