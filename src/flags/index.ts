/**
 * Feature Flags Index
 * 
 * This file exports all feature flags and provides the main flag configuration.
 * Import this file to access all feature flags across the application.
 */

import { AppFlags } from './types';
import dashboardFlags from './dashboard';
import menuFlags from './menu';
import userFlags from './users';
import tableFlags from './tables';
import orderFlags from './orders';
import couponFlags from './coupons';
import settingsFlags from './settings';
import sidebarFlags from './sidebar';
import authFlags from './auth';
import uiFlags from './ui';

/**
 * Master Feature Flags Configuration
 * 
 * This object contains all feature flags for the entire application.
 * Each page/feature has its own section with detailed flag controls.
 */
export const appFlags: AppFlags = {
  // Global base flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Page-specific flags
  dashboard: dashboardFlags,
  menu: menuFlags,
  users: userFlags,
  tables: tableFlags,
  orders: orderFlags,
  coupons: couponFlags,
  settings: settingsFlags,
  sidebar: sidebarFlags,
  auth: authFlags,
  ui: uiFlags,
};

/**
 * Flag Access Helper Functions
 * 
 * These functions provide easy access to specific flag categories.
 */

export const getDashboardFlags = () => appFlags.dashboard;
export const getMenuFlags = () => appFlags.menu;
export const getUserFlags = () => appFlags.users;
export const getTableFlags = () => appFlags.tables;
export const getOrderFlags = () => appFlags.orders;
export const getCouponFlags = () => appFlags.coupons;
export const getSettingsFlags = () => appFlags.settings;
export const getSidebarFlags = () => appFlags.sidebar;
export const getAuthFlags = () => appFlags.auth;
export const getUIFlags = () => appFlags.ui;

/**
 * Flag Validation Functions
 * 
 * These functions help validate flag configurations.
 */

export const validateFlags = (flags: Partial<AppFlags>): boolean => {
  try {
    // Basic validation - ensure all required properties exist
    const requiredSections = [
      'dashboard', 'menu', 'users', 'tables', 'orders', 
      'coupons', 'settings', 'sidebar', 'auth', 'ui'
    ];
    
    for (const section of requiredSections) {
      if (!(section in flags)) {
        console.warn(`Missing flag section: ${section}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Flag validation error:', error);
    return false;
  }
};

/**
 * Flag Override Functions
 * 
 * These functions allow runtime flag overrides for testing and development.
 */

export const createFlagOverride = (overrides: Partial<AppFlags>): AppFlags => {
  return {
    ...appFlags,
    ...overrides,
  };
};

/**
 * Development and Testing Helpers
 */

export const getAllFlags = (): AppFlags => appFlags;

export const getFlagByPath = (path: string): boolean => {
  const parts = path.split('.');
  let current: any = appFlags;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      console.warn(`Flag path not found: ${path}`);
      return false;
    }
  }
  
  return typeof current === 'boolean' ? current : false;
};

/**
 * Flag Statistics
 */

export const getFlagStatistics = () => {
  const stats = {
    totalFlags: 0,
    enabledFlags: 0,
    disabledFlags: 0,
    sections: {} as Record<string, { total: number; enabled: number; disabled: number }>
  };

  const countFlags = (obj: any, sectionName?: string) => {
    let sectionStats = { total: 0, enabled: 0, disabled: 0 };
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'boolean') {
        stats.totalFlags++;
        sectionStats.total++;
        
        if (value) {
          stats.enabledFlags++;
          sectionStats.enabled++;
        } else {
          stats.disabledFlags++;
          sectionStats.disabled++;
        }
      } else if (typeof value === 'object' && value !== null) {
        const subStats = countFlags(value);
        sectionStats.total += subStats.total;
        sectionStats.enabled += subStats.enabled;
        sectionStats.disabled += subStats.disabled;
      }
    }
    
    if (sectionName) {
      stats.sections[sectionName] = sectionStats;
    }
    
    return sectionStats;
  };

  // Count flags for each section
  Object.entries(appFlags).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      countFlags(value, key);
    }
  });

  return stats;
};

/**
 * Export all flag types and individual flag files
 */
export * from './types';
export { default as dashboardFlags } from './dashboard';
export { default as menuFlags } from './menu';
export { default as userFlags } from './users';
export { default as tableFlags } from './tables';
export { default as orderFlags } from './orders';
export { default as couponFlags } from './coupons';
export { default as settingsFlags } from './settings';
export { default as sidebarFlags } from './sidebar';
export { default as authFlags } from './auth';
export { default as uiFlags } from './ui';

export default appFlags;