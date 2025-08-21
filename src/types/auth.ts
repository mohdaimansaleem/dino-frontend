export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: Permission[];
  workspaceId?: string;
  venueId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: RoleName | string;
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

// Permission constants (using dot notation to match backend)
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard.read',
  
  // Orders permissions
  ORDERS_VIEW: 'order.read',
  ORDERS_UPDATE: 'order.update',
  ORDERS_CREATE: 'order.create',
  ORDERS_DELETE: 'order.delete',
  
  // Menu permissions
  MENU_VIEW: 'menu.read',
  MENU_UPDATE: 'menu.update',
  MENU_CREATE: 'menu.create',
  MENU_DELETE: 'menu.delete',
  
  // Coupons permissions
  COUPONS_MANAGE: 'coupon.manage',
  
  // Tables permissions
  TABLES_VIEW: 'table.read',
  TABLES_UPDATE: 'table.update',
  TABLES_CREATE: 'table.create',
  TABLES_DELETE: 'table.delete',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  
  // User management permissions
  USERS_VIEW: 'user.read',
  USERS_UPDATE: 'user.update',
  USERS_CREATE: 'user.create',
  USERS_DELETE: 'user.delete',
  
  // Workspace permissions
  WORKSPACE_VIEW: 'workspace.read',
  WORKSPACE_UPDATE: 'workspace.update',
  WORKSPACE_CREATE: 'workspace.create',
  WORKSPACE_DELETE: 'workspace.delete',
  WORKSPACE_SWITCH: 'workspace.manage',
  
  // Venue management permissions (renamed from cafe)
  VENUE_ACTIVATE: 'venue.update',
  VENUE_DEACTIVATE: 'venue.update',
  VENUE_VIEW_ALL: 'venue.read',
  VENUE_SWITCH: 'venue.manage',
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

// Workspace and Venue interfaces
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
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
  settings: VenueSettings;
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

export interface VenueSettings {
  currency: string;
  timezone: string;
  orderTimeout: number;
  allowOnlineOrders: boolean;
  requireCustomerInfo: boolean;
}

