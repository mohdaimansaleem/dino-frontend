/**
 * Role Constants and Utilities
 * 
 * Centralized role definitions and helper functions
 */

// Role Names (matching backend)
export const ROLE_NAMES = {
  SUPERADMIN: 'super_admin',
  ADMIN: 'admin', 
  MANAGER: 'manager',
  OPERATOR: 'operator',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  CAFE_OWNER: 'cafe_owner', // Legacy support
} as const;

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLE_NAMES.CUSTOMER]: 1,
  [ROLE_NAMES.STAFF]: 2,
  [ROLE_NAMES.OPERATOR]: 3,
  [ROLE_NAMES.MANAGER]: 4,
  [ROLE_NAMES.ADMIN]: 5,
  [ROLE_NAMES.CAFE_OWNER]: 5, // Same level as admin
  [ROLE_NAMES.SUPERADMIN]: 6,
} as const;

// Role Display Names
export const ROLE_DISPLAY_NAMES = {
  [ROLE_NAMES.SUPERADMIN]: 'Super Administrator',
  [ROLE_NAMES.ADMIN]: 'Administrator',
  [ROLE_NAMES.MANAGER]: 'Manager',
  [ROLE_NAMES.OPERATOR]: 'Operator',
  [ROLE_NAMES.STAFF]: 'Staff',
  [ROLE_NAMES.CUSTOMER]: 'Customer',
  [ROLE_NAMES.CAFE_OWNER]: 'Cafe Owner',
} as const;

// Helper Functions
export const isAdminLevel = (role: string): boolean => {
  const adminRoles = [
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.SUPERADMIN,
    ROLE_NAMES.CAFE_OWNER
  ];
  return adminRoles.includes(role as any);
};

export const isSuperAdmin = (role: string): boolean => {
  return role === ROLE_NAMES.SUPERADMIN;
};

export const isManager = (role: string): boolean => {
  return role === ROLE_NAMES.MANAGER;
};

export const isOperator = (role: string): boolean => {
  return role === ROLE_NAMES.OPERATOR;
};

export const isStaff = (role: string): boolean => {
  return role === ROLE_NAMES.STAFF;
};

export const isCustomer = (role: string): boolean => {
  return role === ROLE_NAMES.CUSTOMER;
};

export const getRoleDisplayName = (role: string): string => {
  return ROLE_DISPLAY_NAMES[role as keyof typeof ROLE_DISPLAY_NAMES] || role;
};

export const getRoleHierarchy = (role: string): number => {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
};

export const hasHigherRole = (userRole: string, requiredRole: string): boolean => {
  return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
};

export const canAccessAdminFeatures = (role: string): boolean => {
  return isAdminLevel(role) || isSuperAdmin(role);
};

export const canManageUsers = (role: string): boolean => {
  return isAdminLevel(role) || isSuperAdmin(role);
};

export const canManageMenu = (role: string): boolean => {
  return hasHigherRole(role, ROLE_NAMES.MANAGER);
};

export const canManageOrders = (role: string): boolean => {
  return hasHigherRole(role, ROLE_NAMES.OPERATOR);
};

export const canViewAnalytics = (role: string): boolean => {
  return hasHigherRole(role, ROLE_NAMES.MANAGER);
};

// Default role for new users
export const DEFAULT_ROLE = ROLE_NAMES.CUSTOMER;

// Available roles for user creation (excluding customer)
export const ASSIGNABLE_ROLES = [
  ROLE_NAMES.STAFF,
  ROLE_NAMES.OPERATOR,
  ROLE_NAMES.MANAGER,
  ROLE_NAMES.ADMIN,
] as const;

// Roles that can be assigned by different user levels
export const ROLE_ASSIGNMENT_PERMISSIONS = {
  [ROLE_NAMES.SUPERADMIN]: Object.values(ROLE_NAMES),
  [ROLE_NAMES.ADMIN]: [
    ROLE_NAMES.STAFF,
    ROLE_NAMES.OPERATOR,
    ROLE_NAMES.MANAGER,
  ],
  [ROLE_NAMES.MANAGER]: [
    ROLE_NAMES.STAFF,
    ROLE_NAMES.OPERATOR,
  ],
} as const;

export const canAssignRole = (assignerRole: string, targetRole: string): boolean => {
  const permissions = ROLE_ASSIGNMENT_PERMISSIONS[assignerRole as keyof typeof ROLE_ASSIGNMENT_PERMISSIONS];
  return permissions ? permissions.includes(targetRole as any) : false;
};