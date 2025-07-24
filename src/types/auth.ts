export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: RoleName;
  displayName: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Permission constants
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard:view',
  
  // Orders permissions
  ORDERS_VIEW: 'orders:view',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_CREATE: 'orders:create',
  ORDERS_DELETE: 'orders:delete',
  
  // Menu permissions
  MENU_VIEW: 'menu:view',
  MENU_UPDATE: 'menu:update',
  MENU_CREATE: 'menu:create',
  MENU_DELETE: 'menu:delete',
  
  // Tables permissions
  TABLES_VIEW: 'tables:view',
  TABLES_UPDATE: 'tables:update',
  TABLES_CREATE: 'tables:create',
  TABLES_DELETE: 'tables:delete',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  
  // User management permissions
  USERS_VIEW: 'users:view',
  USERS_UPDATE: 'users:update',
  USERS_CREATE: 'users:create',
  USERS_DELETE: 'users:delete',
} as const;

// Role definitions
export const ROLES = {
  ADMIN: 'admin' as const,
  OPERATOR: 'operator' as const,
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type RoleName = typeof ROLES[keyof typeof ROLES];

// Ensure proper typing for role names
export type AdminRole = typeof ROLES.ADMIN;
export type OperatorRole = typeof ROLES.OPERATOR;