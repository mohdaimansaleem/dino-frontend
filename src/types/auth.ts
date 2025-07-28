export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: Permission[];
  workspaceId?: string;
  cafeId?: string;
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
  
  // Workspace permissions
  WORKSPACE_VIEW: 'workspace:view',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_SWITCH: 'workspace:switch',
  
  // Cafe management permissions
  CAFE_ACTIVATE: 'cafe:activate',
  CAFE_DEACTIVATE: 'cafe:deactivate',
  CAFE_VIEW_ALL: 'cafe:view_all',
  CAFE_SWITCH: 'cafe:switch',
} as const;

// Role definitions
export const ROLES = {
  SUPERADMIN: 'superadmin' as const,
  ADMIN: 'admin' as const,
  OPERATOR: 'operator' as const,
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type RoleName = typeof ROLES[keyof typeof ROLES];

// Ensure proper typing for role names
export type SuperAdminRole = typeof ROLES.SUPERADMIN;
export type AdminRole = typeof ROLES.ADMIN;
export type OperatorRole = typeof ROLES.OPERATOR;

// Workspace and Cafe interfaces
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  pricingPlan: PricingPlan;
  createdAt: string;
  updatedAt: string;
}

export interface Cafe {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  workspaceId: string;
  ownerId: string;
  logo?: string;
  isActive: boolean;
  isOpen: boolean;
  openingHours?: OpeningHours;
  settings: CafeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

export interface CafeSettings {
  currency: string;
  timezone: string;
  orderTimeout: number;
  allowOnlineOrders: boolean;
  requireCustomerInfo: boolean;
}

export interface PricingPlan {
  id: string;
  name: 'basic' | 'premium' | 'enterprise';
  displayName: string;
  price: number;
  features: string[];
  maxCafes: number;
  maxUsers: number;
}