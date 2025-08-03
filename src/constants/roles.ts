/**
 * Role Constants
 * Centralized role definitions to avoid hardcoding throughout the app
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ROLES } from '../types/auth';

// Role name constants (matching backend)
export const ROLE_NAMES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin', 
  OPERATOR: 'operator',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

// Role display names for UI
export const ROLE_DISPLAY_NAMES = {
  [ROLE_NAMES.SUPERADMIN]: 'Super Administrator',
  [ROLE_NAMES.ADMIN]: 'Administrator',
  [ROLE_NAMES.OPERATOR]: 'Operator',
  [ROLE_NAMES.STAFF]: 'Staff',
  [ROLE_NAMES.CUSTOMER]: 'Customer',
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [ROLE_NAMES.SUPERADMIN]: 'Complete system access with all permissions',
  [ROLE_NAMES.ADMIN]: 'Full access to all features within workspace',
  [ROLE_NAMES.OPERATOR]: 'Limited access to daily operations',
  [ROLE_NAMES.STAFF]: 'Basic access for staff members',
  [ROLE_NAMES.CUSTOMER]: 'Customer access for ordering',
} as const;

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLE_NAMES.CUSTOMER]: 1,
  [ROLE_NAMES.STAFF]: 2,
  [ROLE_NAMES.OPERATOR]: 3,
  [ROLE_NAMES.ADMIN]: 4,
  [ROLE_NAMES.SUPERADMIN]: 5,
} as const;

// Helper functions
export const getRoleDisplayName = (roleName: string): string => {
  return ROLE_DISPLAY_NAMES[roleName as keyof typeof ROLE_DISPLAY_NAMES] || roleName;
};

export const getRoleDescription = (roleName: string): string => {
  return ROLE_DESCRIPTIONS[roleName as keyof typeof ROLE_DESCRIPTIONS] || 'No description available';
};

export const isHigherRole = (role1: string, role2: string): boolean => {
  const hierarchy1 = ROLE_HIERARCHY[role1 as keyof typeof ROLE_HIERARCHY] || 0;
  const hierarchy2 = ROLE_HIERARCHY[role2 as keyof typeof ROLE_HIERARCHY] || 0;
  return hierarchy1 > hierarchy2;
};

export const canManageRole = (userRole: string, targetRole: string): boolean => {
  return isHigherRole(userRole, targetRole);
};

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];