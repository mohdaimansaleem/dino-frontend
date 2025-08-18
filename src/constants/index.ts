/**
 * Centralized Constants Export
 * 
 * This file provides a single entry point for all constants
 * used throughout the application.
 */

// ===================================================================
// MAIN EXPORTS
// ===================================================================

// Application configuration and technical constants
export * from './app';

// User-facing messages and content (from info.ts)
export {
  // UI Messages
  PAGE_TITLES,
  APP_TITLES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  FORM_LABELS,
  ACCESS_MESSAGES,
  STATUS_LABELS,
  NOTIFICATION_MESSAGES,
  
  // Company & Content Information
  COMPANY_INFO,
  COMPANY_STATS,
  CORE_FEATURES,
  MANAGEMENT_FEATURES,
  ADVANCED_FEATURES,
  TESTIMONIALS,
  SUCCESS_STORIES,
  BENEFITS,
  INTEGRATIONS,
  CONTACT_DEPARTMENTS,
  CONTACT_INFO,
  FAQS,
  NAVIGATION,
  FOOTER_FEATURES,
  CONTENT,
  TESTIMONIAL_STATS,
} from '../data/info';

// Type exports for better TypeScript support
export type { ToastSeverity, ToastMessage } from '../components/ui/ToastNotification';

// Re-export auth types for convenience (excluding PERMISSIONS to avoid conflict)
export { ROLES, type User, type UserRole, type PermissionName, type RoleName } from '../types/auth';

// ===================================================================
// DEPRECATED EXPORTS (for backward compatibility)
// ===================================================================
// These will be removed in future versions

// Legacy storage keys (use STORAGE_KEYS from app.ts instead)
export const STORAGE_KEY = {
  TOKEN: 'dino_token',
  USER: 'dino_user',
  REFRESH_TOKEN: 'dino_refresh_token',
  CART: 'dino_cart',
  PREFERENCES: 'dino_preferences',
} as const;

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator',
    manager: 'Manager',
    operator: 'Operator',
    staff: 'Staff',
    customer: 'Customer',
  };
  return roleNames[role] || role;
};

/**
 * Get order status display name
 */
export const getOrderStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusNames[status] || status;
};

/**
 * Get payment status display name
 */
export const getPaymentStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusNames[status] || status;
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  // Import ROLE_PERMISSIONS from app.ts
  const { ROLE_PERMISSIONS } = require('./app');
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(requiredPermission);
};

/**
 * Get status color based on status type
 */
export const getStatusColor = (status: string, type: 'order' | 'payment' | 'table' = 'order'): string => {
  const colorMaps = {
    order: {
      pending: '#FF9800',
      confirmed: '#2196F3',
      preparing: '#FF5722',
      ready: '#4CAF50',
      served: '#4CAF50',
      completed: '#4CAF50',
      cancelled: '#F44336',
      refunded: '#9E9E9E',
    },
    payment: {
      pending: '#FF9800',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#F44336',
      cancelled: '#F44336',
      refunded: '#9E9E9E',
    },
    table: {
      available: '#4CAF50',
      occupied: '#F44336',
      reserved: '#FF9800',
      maintenance: '#9E9E9E',
      cleaning: '#2196F3',
    },
  };
  
  return (colorMaps[type] as Record<string, string>)?.[status] || '#9E9E9E';
};