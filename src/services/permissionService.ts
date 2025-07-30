import { User, Permission, UserRole, PERMISSIONS, ROLES, PermissionName, RoleName } from '../types/auth';

class PermissionService {
  // Role definitions - these should be loaded from API in production
  private static roleDefinitions: Record<string, UserRole> = {
    [ROLES.SUPERADMIN]: {
      id: 'superadmin-role',
      name: ROLES.SUPERADMIN,
      displayName: 'Super Administrator',
      description: 'Full system access with workspace management',
      permissions: [
        { id: '1', name: PERMISSIONS.DASHBOARD_VIEW, resource: 'dashboard', action: 'view', description: 'View dashboard' },
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'orders', action: 'view', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'orders', action: 'update', description: 'Update orders' },
        { id: '4', name: PERMISSIONS.ORDERS_CREATE, resource: 'orders', action: 'create', description: 'Create orders' },
        { id: '5', name: PERMISSIONS.ORDERS_DELETE, resource: 'orders', action: 'delete', description: 'Delete orders' },
        { id: '6', name: PERMISSIONS.MENU_VIEW, resource: 'menu', action: 'view', description: 'View menu' },
        { id: '7', name: PERMISSIONS.MENU_UPDATE, resource: 'menu', action: 'update', description: 'Update menu' },
        { id: '8', name: PERMISSIONS.MENU_CREATE, resource: 'menu', action: 'create', description: 'Create menu items' },
        { id: '9', name: PERMISSIONS.MENU_DELETE, resource: 'menu', action: 'delete', description: 'Delete menu items' },
        { id: '10', name: PERMISSIONS.TABLES_VIEW, resource: 'tables', action: 'view', description: 'View tables' },
        { id: '11', name: PERMISSIONS.TABLES_UPDATE, resource: 'tables', action: 'update', description: 'Update tables' },
        { id: '12', name: PERMISSIONS.TABLES_CREATE, resource: 'tables', action: 'create', description: 'Create tables' },
        { id: '13', name: PERMISSIONS.TABLES_DELETE, resource: 'tables', action: 'delete', description: 'Delete tables' },
        { id: '14', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'view', description: 'View settings' },
        { id: '15', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '16', name: PERMISSIONS.USERS_VIEW, resource: 'users', action: 'view', description: 'View users' },
        { id: '17', name: PERMISSIONS.USERS_UPDATE, resource: 'users', action: 'update', description: 'Update users' },
        { id: '18', name: PERMISSIONS.USERS_CREATE, resource: 'users', action: 'create', description: 'Create users' },
        { id: '19', name: PERMISSIONS.USERS_DELETE, resource: 'users', action: 'delete', description: 'Delete users' },
        { id: '20', name: PERMISSIONS.WORKSPACE_VIEW, resource: 'workspace', action: 'view', description: 'View workspaces' },
        { id: '21', name: PERMISSIONS.WORKSPACE_UPDATE, resource: 'workspace', action: 'update', description: 'Update workspaces' },
        { id: '22', name: PERMISSIONS.WORKSPACE_CREATE, resource: 'workspace', action: 'create', description: 'Create workspaces' },
        { id: '23', name: PERMISSIONS.WORKSPACE_DELETE, resource: 'workspace', action: 'delete', description: 'Delete workspaces' },
        { id: '24', name: PERMISSIONS.WORKSPACE_SWITCH, resource: 'workspace', action: 'switch', description: 'Switch workspaces' },
        { id: '25', name: PERMISSIONS.CAFE_ACTIVATE, resource: 'cafe', action: 'activate', description: 'Activate cafes' },
        { id: '26', name: PERMISSIONS.CAFE_DEACTIVATE, resource: 'cafe', action: 'deactivate', description: 'Deactivate cafes' },
        { id: '27', name: PERMISSIONS.CAFE_VIEW_ALL, resource: 'cafe', action: 'view_all', description: 'View all cafes' },
        { id: '28', name: PERMISSIONS.CAFE_SWITCH, resource: 'cafe', action: 'switch', description: 'Switch cafes' },
      ]
    },
    [ROLES.ADMIN]: {
      id: 'admin-role',
      name: ROLES.ADMIN,
      displayName: 'Administrator',
      description: 'Full access to all features',
      permissions: [
        { id: '1', name: PERMISSIONS.DASHBOARD_VIEW, resource: 'dashboard', action: 'view', description: 'View dashboard' },
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'orders', action: 'view', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'orders', action: 'update', description: 'Update orders' },
        { id: '4', name: PERMISSIONS.ORDERS_CREATE, resource: 'orders', action: 'create', description: 'Create orders' },
        { id: '5', name: PERMISSIONS.ORDERS_DELETE, resource: 'orders', action: 'delete', description: 'Delete orders' },
        { id: '6', name: PERMISSIONS.MENU_VIEW, resource: 'menu', action: 'view', description: 'View menu' },
        { id: '7', name: PERMISSIONS.MENU_UPDATE, resource: 'menu', action: 'update', description: 'Update menu' },
        { id: '8', name: PERMISSIONS.MENU_CREATE, resource: 'menu', action: 'create', description: 'Create menu items' },
        { id: '9', name: PERMISSIONS.MENU_DELETE, resource: 'menu', action: 'delete', description: 'Delete menu items' },
        { id: '10', name: PERMISSIONS.TABLES_VIEW, resource: 'tables', action: 'view', description: 'View tables' },
        { id: '11', name: PERMISSIONS.TABLES_UPDATE, resource: 'tables', action: 'update', description: 'Update tables' },
        { id: '12', name: PERMISSIONS.TABLES_CREATE, resource: 'tables', action: 'create', description: 'Create tables' },
        { id: '13', name: PERMISSIONS.TABLES_DELETE, resource: 'tables', action: 'delete', description: 'Delete tables' },
        { id: '14', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'view', description: 'View settings' },
        { id: '15', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '16', name: PERMISSIONS.USERS_VIEW, resource: 'users', action: 'view', description: 'View users' },
        { id: '17', name: PERMISSIONS.USERS_UPDATE, resource: 'users', action: 'update', description: 'Update users' },
        { id: '18', name: PERMISSIONS.USERS_CREATE, resource: 'users', action: 'create', description: 'Create users' },
        { id: '19', name: PERMISSIONS.USERS_DELETE, resource: 'users', action: 'delete', description: 'Delete users' },
      ]
    },
    [ROLES.OPERATOR]: {
      id: 'operator-role',
      name: ROLES.OPERATOR,
      displayName: 'Operator',
      description: 'Limited access to orders management only',
      permissions: [
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'orders', action: 'view', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'orders', action: 'update', description: 'Update order status only' },
      ]
    }
  };

  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User | null, permission: PermissionName): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    return user.permissions.some(p => p.name === permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User | null, permissions: PermissionName[]): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: User | null, permissions: PermissionName[]): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has a specific role
   */
  static hasRole(user: User | null, roleName: string | RoleName): boolean {
    if (!user || !user.role) {
      return false;
    }

    return user.role.name === roleName;
  }

  /**
   * Get user's role
   */
  static getUserRole(user: User | null): UserRole | null {
    return user?.role || null;
  }

  /**
   * Get permissions for a role
   */
  static getRolePermissions(roleName: string): Permission[] {
    const role = this.roleDefinitions[roleName];
    return role ? role.permissions : [];
  }

  /**
   * Get role definition
   */
  static getRoleDefinition(roleName: string): UserRole | null {
    return this.roleDefinitions[roleName] || null;
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User | null, route: string): boolean {
    if (!user) return false;

    // Route-based access control
    const routePermissions: Record<string, PermissionName[]> = {
      '/admin': [PERMISSIONS.DASHBOARD_VIEW],
      '/admin/orders': [PERMISSIONS.ORDERS_VIEW],
      '/admin/menu': [PERMISSIONS.MENU_VIEW],
      '/admin/tables': [PERMISSIONS.TABLES_VIEW],
      '/admin/settings': [PERMISSIONS.SETTINGS_VIEW],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) {
      return false;
    }

    return this.hasAnyPermission(user, requiredPermissions);
  }

  /**
   * Get allowed routes for user
   */
  static getAllowedRoutes(user: User | null): string[] {
    if (!user) return [];

    const allRoutes = [
      '/admin',
      '/admin/orders',
      '/admin/menu',
      '/admin/tables',
      '/admin/settings',
    ];

    return allRoutes.filter(route => this.canAccessRoute(user, route));
  }

  /**
   * Check if user can perform an action on a resource
   */
  static canPerformAction(user: User | null, resource: string, action: string): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    return user.permissions.some(p => p.resource === resource && p.action === action);
  }

  /**
   * Get user's permissions for a specific resource
   */
  static getResourcePermissions(user: User | null, resource: string): Permission[] {
    if (!user || !user.permissions) {
      return [];
    }

    return user.permissions.filter(p => p.resource === resource);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User | null): boolean {
    return this.hasRole(user, ROLES.ADMIN);
  }

  /**
   * Check if user is operator
   */
  static isOperator(user: User | null): boolean {
    return this.hasRole(user, ROLES.OPERATOR);
  }

  /**
   * Check if user is superadmin
   */
  static isSuperAdmin(user: User | null): boolean {
    return this.hasRole(user, ROLES.SUPERADMIN);
  }

  /**
   * Get user's permissions as readable list
   */
  static getUserPermissionsList(user: User | null): string[] {
    if (!user || !user.permissions) {
      return [];
    }
    return user.permissions.map(p => p.description || p.name);
  }

  /**
   * Check if user can manage workspace
   */
  static canManageWorkspace(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.hasPermission(user, PERMISSIONS.WORKSPACE_UPDATE);
  }

  /**
   * Check if user can switch cafes
   */
  static canSwitchCafe(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.hasPermission(user, PERMISSIONS.CAFE_SWITCH);
  }

  /**
   * Check if user can activate/deactivate cafe
   */
  static canManageCafeStatus(user: User | null): boolean {
    return this.isSuperAdmin(user) || 
           this.hasPermission(user, PERMISSIONS.CAFE_ACTIVATE) ||
           this.hasPermission(user, PERMISSIONS.CAFE_DEACTIVATE);
  }
}

export default PermissionService;
export const permissionService = PermissionService;