/**
 * FeatureFlag Component
 * 
 * A declarative component for conditional rendering based on feature flags.
 * This component provides a clean way to show/hide features without cluttering
 * component logic with feature flag checks.
 */

import React from 'react';
import { useFeatureFlag, useFeatureFlags } from '../../hooks/useFeatureFlag';
import { type FeatureFlags } from '../../config/featureFlags';

interface FeatureFlagProps {
  /**
   * The feature flag to check
   */
  flag: keyof FeatureFlags;
  /**
   * Component to render when feature is enabled
   */
  children: React.ReactNode;
  /**
   * Component to render when feature is disabled (optional)
   */
  fallback?: React.ReactNode;
  /**
   * Invert the logic - render children when flag is disabled
   */
  invert?: boolean;
}

/**
 * FeatureFlag component for conditional rendering
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FeatureFlag flag="newDashboard">
 *   <NewDashboard />
 * </FeatureFlag>
 * 
 * // With fallback
 * <FeatureFlag flag="newDashboard" fallback={<OldDashboard />}>
 *   <NewDashboard />
 * </FeatureFlag>
 * 
 * // Inverted logic
 * <FeatureFlag flag="maintenanceMode" invert>
 *   <NormalOperation />
 * </FeatureFlag>
 * ```
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null,
  invert = false,
}) => {
  const isEnabled = useFeatureFlag(flag);
  const shouldRender = invert ? !isEnabled : isEnabled;
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

interface MultiFeatureFlagProps {
  /**
   * Array of feature flags to check
   */
  flags: (keyof FeatureFlags)[];
  /**
   * Logic for combining multiple flags
   * - 'and': All flags must be enabled (default)
   * - 'or': At least one flag must be enabled
   */
  logic?: 'and' | 'or';
  /**
   * Component to render when condition is met
   */
  children: React.ReactNode;
  /**
   * Component to render when condition is not met (optional)
   */
  fallback?: React.ReactNode;
  /**
   * Invert the logic
   */
  invert?: boolean;
}

/**
 * MultiFeatureFlag component for conditional rendering based on multiple flags
 * 
 * @example
 * ```tsx
 * // All flags must be enabled
 * <MultiFeatureFlag flags={['analytics', 'notifications']} logic="and">
 *   <AnalyticsWithNotifications />
 * </MultiFeatureFlag>
 * 
 * // At least one flag must be enabled
 * <MultiFeatureFlag flags={['onlinePayments', 'coupons']} logic="or">
 *   <CommerceFeatures />
 * </MultiFeatureFlag>
 * ```
 */
export const MultiFeatureFlag: React.FC<MultiFeatureFlagProps> = ({
  flags,
  logic = 'and',
  children,
  fallback = null,
  invert = false,
}) => {
  const featureFlags = useFeatureFlags(flags);
  
  const isConditionMet = logic === 'and'
    ? flags.every(flag => featureFlags[flag])
    : flags.some(flag => featureFlags[flag]);
  
  const shouldRender = invert ? !isConditionMet : isConditionMet;
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

interface FeatureFlagGroupProps {
  /**
   * Group of related feature flags with their components
   */
  flagComponents: Array<{
    flag: keyof FeatureFlags;
    component: React.ReactNode;
    priority?: number; // Higher priority renders first
  }>;
  /**
   * Default component when no flags are enabled
   */
  defaultComponent?: React.ReactNode;
  /**
   * Whether to render all enabled components or just the highest priority one
   */
  renderMode?: 'all' | 'highest-priority';
}

/**
 * FeatureFlagGroup component for managing multiple related feature flags
 * 
 * @example
 * ```tsx
 * <FeatureFlagGroup
 *   flagComponents={[
 *     { flag: 'newDashboard', component: <NewDashboard />, priority: 2 },
 *     { flag: 'betaDashboard', component: <BetaDashboard />, priority: 1 },
 *   ]}
 *   defaultComponent={<StandardDashboard />}
 *   renderMode="highest-priority"
 * />
 * ```
 */
export const FeatureFlagGroup: React.FC<FeatureFlagGroupProps> = ({
  flagComponents,
  defaultComponent = null,
  renderMode = 'all',
}) => {
  const flags = flagComponents.map(item => item.flag);
  const featureFlags = useFeatureFlags(flags);
  
  // Filter enabled components
  const enabledComponents = flagComponents.filter(item => featureFlags[item.flag]);
  
  if (enabledComponents.length === 0) {
    return <>{defaultComponent}</>;
  }
  
  if (renderMode === 'highest-priority') {
    // Sort by priority (highest first) and return the first one
    const sortedComponents = enabledComponents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return <>{sortedComponents[0].component}</>;
  }
  
  // Render all enabled components
  return (
    <>
      {enabledComponents.map((item, index) => (
        <React.Fragment key={`${item.flag}-${index}`}>
          {item.component}
        </React.Fragment>
      ))}
    </>
  );
};

interface FeatureFlagDebugProps {
  /**
   * Whether to show the debug panel
   */
  show?: boolean;
  /**
   * Position of the debug panel
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Flags to display in debug panel (if not provided, shows all)
   */
  flags?: (keyof FeatureFlags)[];
}

/**
 * FeatureFlagDebug component for development debugging
 * Only renders in development mode or when debug flag is enabled
 */
export const FeatureFlagDebug: React.FC<FeatureFlagDebugProps> = ({
  show = true,
  position = 'bottom-right',
  flags,
}) => {
  const isDebugMode = useFeatureFlag('debugMode');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const flagsToShow = flags || [
    'themeToggle', 'darkMode', 'newDashboard', 'analytics', 'notifications',
    'qrCodes', 'coupons', 'debugMode', 'betaFeatures'
  ] as (keyof FeatureFlags)[];
  
  const featureFlags = useFeatureFlags(flagsToShow);
  
  if (!show || (!isDebugMode && !isDevelopment)) {
    return null;
  }
  
  const positionStyles = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '250px',
        maxHeight: '300px',
        overflow: 'auto',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        🚩 Feature Flags
      </div>
      {flagsToShow.map(flag => (
        <div key={flag} style={{ marginBottom: '4px' }}>
          <span style={{ color: featureFlags[flag] ? '#4CAF50' : '#F44336' }}>
            {featureFlags[flag] ? '✅' : '❌'}
          </span>
          <span style={{ marginLeft: '8px' }}>{flag}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureFlag;