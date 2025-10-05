/**
 * Feature Flag Components
 * 
 * This file provides React components that make it easy to conditionally
 * render content based on feature flags.
 */

import React, { ReactNode } from 'react';
import { useFlag, useFlags } from './FlagContext';

interface FlagGateProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * FlagGate Component
 * 
 * Conditionally renders children based on a feature flag.
 * 
 * @param flag - The flag path (e.g., "dashboard.showOverviewTab")
 * @param children - Content to render when flag is true
 * @param fallback - Content to render when flag is false (optional)
 */
export const FlagGate: React.FC<FlagGateProps> = ({ 
  flag, 
  children, 
  fallback = null 
}) => {
  const isEnabled = useFlag(flag);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

interface MultiFlagGateProps {
  flags: string[];
  operator?: 'AND' | 'OR';
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * MultiFlagGate Component
 * 
 * Conditionally renders children based on multiple feature flags.
 * 
 * @param flags - Array of flag paths
 * @param operator - 'AND' (all flags must be true) or 'OR' (any flag must be true)
 * @param children - Content to render when condition is met
 * @param fallback - Content to render when condition is not met (optional)
 */
export const MultiFlagGate: React.FC<MultiFlagGateProps> = ({ 
  flags, 
  operator = 'AND', 
  children, 
  fallback = null 
}) => {
  const { flags: allFlags } = useFlags();
  
  const flagValues = flags.map(flag => {
    const parts = flag.split('.');
    if (parts.length !== 2) return false;
    
    const [section, flagName] = parts;
    
    try {
      const sectionFlags = allFlags[section as keyof typeof allFlags];
      
      if (typeof sectionFlags === 'object' && sectionFlags !== null) {
        const flagValue = (sectionFlags as Record<string, any>)[flagName];
        return typeof flagValue === 'boolean' ? flagValue : false;
      }
    } catch (error) {
      console.warn(`Error accessing flag ${flag}:`, error);
    }
    
    return false;
  });
  
  const shouldRender = operator === 'AND' 
    ? flagValues.every(value => value)
    : flagValues.some(value => value);
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

interface FlagButtonProps {
  flag: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * FlagButton Component
 * 
 * A button that is only rendered when a feature flag is enabled.
 * 
 * @param flag - The flag path
 * @param children - Button content
 * @param onClick - Click handler
 * @param other props - Passed through to button element
 */
export const FlagButton: React.FC<FlagButtonProps> = ({ 
  flag, 
  children, 
  onClick, 
  disabled = false,
  ...props 
}) => {
  const isEnabled = useFlag(flag);
  
  if (!isEnabled) return null;
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

interface FlagLinkProps {
  flag: string;
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * FlagLink Component
 * 
 * A link that is only rendered when a feature flag is enabled.
 * 
 * @param flag - The flag path
 * @param href - Link destination
 * @param children - Link content
 * @param other props - Passed through to anchor element
 */
export const FlagLink: React.FC<FlagLinkProps> = ({ 
  flag, 
  href, 
  children, 
  ...props 
}) => {
  const isEnabled = useFlag(flag);
  
  if (!isEnabled) return null;
  
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

/**
 * ConditionalWrapper Component
 * 
 * Conditionally wraps children with a wrapper component.
 * Useful for conditionally adding containers, styling, etc.
 */
export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({ 
  condition, 
  wrapper, 
  children 
}) => {
  return condition ? <>{wrapper(children)}</> : <>{children}</>;
};

interface FlagWrapperProps {
  flag: string;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

/**
 * FlagWrapper Component
 * 
 * Conditionally wraps children based on a feature flag.
 * 
 * @param flag - The flag path
 * @param wrapper - Function that returns wrapped content
 * @param children - Content to potentially wrap
 */
export const FlagWrapper: React.FC<FlagWrapperProps> = ({ 
  flag, 
  wrapper, 
  children 
}) => {
  const isEnabled = useFlag(flag);
  
  return (
    <ConditionalWrapper condition={isEnabled} wrapper={wrapper}>
      {children}
    </ConditionalWrapper>
  );
};

interface FlagDebugProps {
  flag?: string;
  section?: string;
  showAll?: boolean;
}

/**
 * FlagDebug Component
 * 
 * Debug component to display flag values. Only renders in development mode.
 * 
 * @param flag - Specific flag to debug
 * @param section - Specific section to debug
 * @param showAll - Show all flags
 */
export const FlagDebug: React.FC<FlagDebugProps> = ({ 
  flag, 
  section, 
  showAll = false 
}) => {
  const { flags } = useFlags();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (flag) {
    // Get flag value directly from flags object instead of using useFlag hook
    const parts = flag.split('.');
    let flagValue = false;
    
    if (parts.length === 2) {
      const [sectionName, flagName] = parts;
      const sectionFlags = flags[sectionName as keyof typeof flags];
      
      if (typeof sectionFlags === 'object' && sectionFlags !== null) {
        const value = (sectionFlags as Record<string, any>)[flagName];
        flagValue = typeof value === 'boolean' ? value : false;
      }
    }
    
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        {flag}: {flagValue ? 'ON' : 'OFF'}
      </div>
    );
  }
  
  if (section) {
    const sectionFlags = flags[section as keyof typeof flags];
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <strong>{section} flags:</strong>
        <br />
        {typeof sectionFlags === 'object' && sectionFlags !== null && 
          Object.entries(sectionFlags).map(([key, value]) => (
            <div key={key}>
              {key}: {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : 'N/A'}
            </div>
          ))
        }
      </div>
    );
  }
  
  if (showAll) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        maxHeight: '400px',
        overflow: 'auto',
        width: '300px'
      }}>
        <strong>All Feature Flags:</strong>
        <br />
        {Object.entries(flags).map(([section, sectionFlags]) => (
          <div key={section}>
            <strong>{section}:</strong>
            {typeof sectionFlags === 'object' && sectionFlags !== null && 
              Object.entries(sectionFlags).map(([key, value]) => (
                <div key={key} style={{ marginLeft: '10px' }}>
                  {key}: {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : 'N/A'}
                </div>
              ))
            }
          </div>
        ))}
      </div>
    );
  }
  
  return null;
};

/**
 * Higher-Order Component for Feature Flags
 * 
 * Wraps a component and only renders it when a feature flag is enabled.
 */
export const withFlag = (flag: string, fallback?: ReactNode) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function FlaggedComponent(props: P) {
      const isEnabled = useFlag(flag);
      
      return isEnabled ? <Component {...props} /> : <>{fallback}</>;
    };
  };
};

export default FlagGate;