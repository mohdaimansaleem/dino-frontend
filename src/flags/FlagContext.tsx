/**
 * Feature Flag Context
 * 
 * This file provides React context for feature flags, allowing components
 * to access and use feature flags throughout the application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppFlags, FlagContextType } from './types';
import { appFlags, validateFlags } from './index';

// Create the context
const FlagContext = createContext<FlagContextType | undefined>(undefined);

// Local storage key for flag overrides
const FLAG_STORAGE_KEY = 'dino_feature_flags';

interface FlagProviderProps {
  children: ReactNode;
  initialFlags?: Partial<AppFlags>;
}

/**
 * Feature Flag Provider Component
 * 
 * Wraps the application and provides feature flag functionality to all child components.
 */
export const FlagProvider: React.FC<FlagProviderProps> = ({ 
  children, 
  initialFlags = {} 
}) => {
  const [flags, setFlags] = useState<AppFlags>(() => {
    // Load flags from localStorage if available
    try {
      const savedFlags = localStorage.getItem(FLAG_STORAGE_KEY);
      if (savedFlags) {
        const parsedFlags = JSON.parse(savedFlags);
        if (validateFlags(parsedFlags)) {
          return { ...appFlags, ...parsedFlags };
        }
      }
    } catch (error) {
      console.warn('Failed to load flags from localStorage:', error);
    }
    
    // Fallback to default flags with any initial overrides
    return { ...appFlags, ...initialFlags };
  });

  /**
   * Update a specific flag by path
   * Path format: "section.flagName" (e.g., "dashboard.showOverviewTab")
   */
  const updateFlag = (path: string, value: boolean) => {
    const parts = path.split('.');
    
    if (parts.length !== 2) {
      console.error('Invalid flag path. Use format: "section.flagName"');
      return;
    }

    const [section, flagName] = parts;
    
    setFlags(prevFlags => {
      const currentSection = prevFlags[section as keyof AppFlags];
      const newFlags = {
        ...prevFlags,
        [section]: {
          ...(typeof currentSection === 'object' && currentSection !== null ? currentSection : {}),
          [flagName]: value
        }
      } as AppFlags;
      
      // Save to localStorage
      try {
        localStorage.setItem(FLAG_STORAGE_KEY, JSON.stringify(newFlags));
      } catch (error) {
        console.warn('Failed to save flags to localStorage:', error);
      }
      
      return newFlags;
    });
  };

  /**
   * Reset all flags to default values
   */
  const resetFlags = () => {
    setFlags(appFlags);
    try {
      localStorage.removeItem(FLAG_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear flags from localStorage:', error);
    }
  };

  /**
   * Load flags from localStorage
   */
  const loadFlags = () => {
    try {
      const savedFlags = localStorage.getItem(FLAG_STORAGE_KEY);
      if (savedFlags) {
        const parsedFlags = JSON.parse(savedFlags);
        if (validateFlags(parsedFlags)) {
          setFlags({ ...appFlags, ...parsedFlags });
        }
      }
    } catch (error) {
      console.error('Failed to load flags:', error);
    }
  };

  /**
   * Save current flags to localStorage
   */
  const saveFlags = () => {
    try {
      localStorage.setItem(FLAG_STORAGE_KEY, JSON.stringify(flags));
    } catch (error) {
      console.error('Failed to save flags:', error);
    }
  };

  // Context value
  const contextValue: FlagContextType = {
    flags,
    updateFlag,
    resetFlags,
    loadFlags,
    saveFlags,
  };

  return (
    <FlagContext.Provider value={contextValue}>
      {children}
    </FlagContext.Provider>
  );
};

/**
 * Hook to use feature flags
 * 
 * Returns the flag context with all flag management functions.
 */
export const useFlags = (): FlagContextType => {
  const context = useContext(FlagContext);
  
  if (context === undefined) {
    throw new Error('useFlags must be used within a FlagProvider');
  }
  
  return context;
};

/**
 * Hook to use a specific flag
 * 
 * Returns a boolean value for a specific flag path.
 */
export const useFlag = (path: string): boolean => {
  const { flags } = useFlags();
  
  const parts = path.split('.');
  if (parts.length !== 2) {
    console.error('Invalid flag path. Use format: "section.flagName"');
    return false;
  }

  const [section, flagName] = parts;
  
  try {
    const sectionFlags = flags[section as keyof AppFlags];
    
    if (typeof sectionFlags === 'object' && sectionFlags !== null) {
      const flagValue = (sectionFlags as Record<string, any>)[flagName];
      return typeof flagValue === 'boolean' ? flagValue : false;
    }
  } catch (error) {
    console.warn(`Error accessing flag ${path}:`, error);
  }
  
  return false;
};

/**
 * Hook to use dashboard flags
 */
export const useDashboardFlags = () => {
  const { flags } = useFlags();
  return flags.dashboard;
};

/**
 * Hook to use menu flags
 */
export const useMenuFlags = () => {
  const { flags } = useFlags();
  return flags.menu;
};

/**
 * Hook to use user flags
 */
export const useUserFlags = () => {
  const { flags } = useFlags();
  return flags.users;
};

/**
 * Hook to use table flags
 */
export const useTableFlags = () => {
  const { flags } = useFlags();
  return flags.tables;
};

/**
 * Hook to use order flags
 */
export const useOrderFlags = () => {
  const { flags } = useFlags();
  return flags.orders;
};

/**
 * Hook to use coupon flags
 */
export const useCouponFlags = () => {
  const { flags } = useFlags();
  return flags.coupons;
};

/**
 * Hook to use settings flags
 */
export const useSettingsFlags = () => {
  const { flags } = useFlags();
  return flags.settings;
};

/**
 * Hook to use sidebar flags
 */
export const useSidebarFlags = () => {
  const { flags } = useFlags();
  return flags.sidebar;
};

/**
 * Hook to use auth flags
 */
export const useAuthFlags = () => {
  const { flags } = useFlags();
  return flags.auth;
};

/**
 * Hook to use UI flags
 */
export const useUIFlags = () => {
  const { flags } = useFlags();
  return flags.ui;
};

export default FlagContext;