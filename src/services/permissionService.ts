import { User, Permission, UserRole, PERMISSIONS, ROLES, PermissionName, RoleName } from '../types/auth';
import { STORAGE_KEYS } from '../constants/storage';
import { ROLE_NAMES } from '../constants/roles';

class PermissionService {
  // Role definitions - these should be loaded from API in production
  private static roleDefinitions: Record<string, UserRole> = {
    [ROLES.SUPERADMIN]: {
      id: 'superadmin-role',
      name: ROLES.SUPERADMIN,
      displayName: 'Super Administrator',
      description: 'Full system access with workspace management',
      permissions: [
        { id: '1', name: PERMISSIONS.DASHBOARD_VIEW, resource: 'dashboard', action: 'read', description: 'View dashboard' },
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'order', action: 'read', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'order', action: 'update', description: 'Update orders' },
        { id: '4', name: PERMISSIONS.ORDERS_CREATE, resource: 'order', action: 'create', description: 'Create orders' },
        { id: '5', name: PERMISSIONS.ORDERS_DELETE, resource: 'order', action: 'delete', description: 'Delete orders' },
        { id: '6', name: PERMISSIONS.MENU_VIEW, resource: 'menu', action: 'read', description: 'View menu' },
        { id: '7', name: PERMISSIONS.MENU_UPDATE, resource: 'menu', action: 'update', description: 'Update menu' },
        { id: '8', name: PERMISSIONS.MENU_CREATE, resource: 'menu', action: 'create', description: 'Create menu items' },
        { id: '9', name: PERMISSIONS.MENU_DELETE, resource: 'menu', action: 'delete', description: 'Delete menu items' },
        { id: '10', name: PERMISSIONS.TABLES_VIEW, resource: 'table', action: 'read', description: 'View tables' },
        { id: '11', name: PERMISSIONS.TABLES_UPDATE, resource: 'table', action: 'update', description: 'Update tables' },
        { id: '12', name: PERMISSIONS.TABLES_CREATE, resource: 'table', action: 'create', description: 'Create tables' },
        { id: '13', name: PERMISSIONS.TABLES_DELETE, resource: 'table', action: 'delete', description: 'Delete tables' },
        { id: '14', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'read', description: 'View settings' },
        { id: '15', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '16', name: PERMISSIONS.USERS_VIEW, resource: 'user', action: 'read', description: 'View users' },
        { id: '17', name: PERMISSIONS.USERS_UPDATE, resource: 'user', action: 'update', description: 'Update users' },
        { id: '18', name: PERMISSIONS.USERS_CREATE, resource: 'user', action: 'create', description: 'Create users' },
        { id: '19', name: PERMISSIONS.USERS_DELETE, resource: 'user', action: 'delete', description: 'Delete users' },
        { id: '20', name: PERMISSIONS.WORKSPACE_VIEW, resource: 'workspace', action: 'read', description: 'View workspaces' },
        { id: '21', name: PERMISSIONS.WORKSPACE_UPDATE, resource: 'workspace', action: 'update', description: 'Update workspaces' },
        { id: '22', name: PERMISSIONS.WORKSPACE_CREATE, resource: 'workspace', action: 'create', description: 'Create workspaces' },
        { id: '23', name: PERMISSIONS.WORKSPACE_DELETE, resource: 'workspace', action: 'delete', description: 'Delete workspaces' },
        { id: '24', name: PERMISSIONS.WORKSPACE_SWITCH, resource: 'workspace', action: 'manage', description: 'Switch workspaces' },
        { id: '25', name: PERMISSIONS.VENUE_ACTIVATE, resource: 'venue', action: 'update', description: 'Activate venues' },
        { id: '26', name: PERMISSIONS.VENUE_DEACTIVATE, resource: 'venue', action: 'update', description: 'Deactivate venues' },
        { id: '27', name: PERMISSIONS.VENUE_VIEW_ALL, resource: 'venue', action: 'read', description: 'View all venues' },
        { id: '28', name: PERMISSIONS.VENUE_SWITCH, resource: 'venue', action: 'manage', description: 'Switch venues' },
      ]
    },
    [ROLES.ADMIN]: {
      id: 'admin-role',
      name: ROLES.ADMIN,
      displayName: 'Administrator',
      description: 'Full access to all features',
      permissions: [
        { id: '1', name: PERMISSIONS.DASHBOARD_VIEW, resource: 'dashboard', action: 'read', description: 'View dashboard' },
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'order', action: 'read', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'order', action: 'update', description: 'Update orders' },
        { id: '4', name: PERMISSIONS.ORDERS_CREATE, resource: 'order', action: 'create', description: 'Create orders' },
        { id: '5', name: PERMISSIONS.ORDERS_DELETE, resource: 'order', action: 'delete', description: 'Delete orders' },
        { id: '6', name: PERMISSIONS.MENU_VIEW, resource: 'menu', action: 'read', description: 'View menu' },
        { id: '7', name: PERMISSIONS.MENU_UPDATE, resource: 'menu', action: 'update', description: 'Update menu' },
        { id: '8', name: PERMISSIONS.MENU_CREATE, resource: 'menu', action: 'create', description: 'Create menu items' },
        { id: '9', name: PERMISSIONS.MENU_DELETE, resource: 'menu', action: 'delete', description: 'Delete menu items' },
        { id: '10', name: PERMISSIONS.TABLES_VIEW, resource: 'table', action: 'read', description: 'View tables' },
        { id: '11', name: PERMISSIONS.TABLES_UPDATE, resource: 'table', action: 'update', description: 'Update tables' },
        { id: '12', name: PERMISSIONS.TABLES_CREATE, resource: 'table', action: 'create', description: 'Create tables' },
        { id: '13', name: PERMISSIONS.TABLES_DELETE, resource: 'table', action: 'delete', description: 'Delete tables' },
        { id: '14', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'read', description: 'View settings' },
        { id: '15', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '16', name: PERMISSIONS.USERS_VIEW, resource: 'user', action: 'read', description: 'View users' },
        { id: '17', name: PERMISSIONS.USERS_UPDATE, resource: 'user', action: 'update', description: 'Update users' },
        { id: '18', name: PERMISSIONS.USERS_CREATE, resource: 'user', action: 'create', description: 'Create users' },
        { id: '19', name: PERMISSIONS.USERS_DELETE, resource: 'user', action: 'delete', description: 'Delete users' },
      ]
    },
    [ROLES.OPERATOR]: {
      id: 'operator-role',
      name: ROLES.OPERATOR,
      displayName: 'Operator',
      description: 'Limited access to orders management only',
      permissions: [
        { id: '2', name: PERMISSIONS.ORDERS_VIEW, resource: 'order', action: 'read', description: 'View orders' },
        { id: '3', name: PERMISSIONS.ORDERS_UPDATE, resource: 'order', action: 'update', description: 'Update order status only' },
      ]
    }
  };

  /**
   * Check if user has a specific permission (with backend fallback)
   */
  static hasPermission(user: User | null, permission: PermissionName): boolean {
    if (!user) {
      return false;
    }



    if (!user.permissions) {
      return false;
    }

    // First check backend permissions if available
    const backendPermissions = this.getBackendPermissions();
    const backendRole = this.getBackendRole();
    
    // If user is superadmin, grant all permissions
    if (backendRole && backendRole.name === ROLE_NAMES.SUPERADMIN) {
      return true;
    }
    
    if (backendPermissions && backendPermissions.length > 0) {
      // Check for exact match first
      if (backendPermissions.some((p: any) => p.name === permission)) {
        return true;
      }
      
      // Convert colon notation to dot notation for backend compatibility
      const dotNotationPermission = permission.replace(':', '.');
      if (backendPermissions.some((p: any) => p.name === dotNotationPermission)) {
        return true;
      }
      
      // Map frontend permission constants to backend permissions
      const permissionMapping: Record<string, string[]> = {
        'dashboard.read': ['dashboard.read', 'workspace.read', 'workspace.manage'],
        'order.read': ['order.read', 'order.manage'],
        'order.update': ['order.update', 'order.manage'],
        'order.create': ['order.create', 'order.manage'],
        'order.delete': ['order.delete', 'order.manage'],
        'menu.read': ['menu.read', 'menu.manage'],
        'menu.update': ['menu.update', 'menu.manage'],
        'menu.create': ['menu.create', 'menu.manage'],
        'menu.delete': ['menu.delete', 'menu.manage'],
        'table.read': ['table.read', 'table.manage'],
        'table.update': ['table.update', 'table.manage'],
        'table.create': ['table.create', 'table.manage'],
        'table.delete': ['table.delete', 'table.manage'],
        'user.read': ['user.read', 'user.manage'],
        'user.update': ['user.update', 'user.manage'],
        'user.create': ['user.create', 'user.manage'],
        'user.delete': ['user.delete', 'user.manage'],
        'workspace.read': ['workspace.read', 'workspace.manage'],
        'workspace.update': ['workspace.update', 'workspace.manage'],
        'workspace.create': ['workspace.create', 'workspace.manage'],
        'workspace.delete': ['workspace.delete', 'workspace.manage'],
        'venue.update': ['venue.update', 'venue.manage'],
        'venue.manage': ['venue.manage'],
        'settings.read': ['workspace.read', 'venue.read', 'workspace.manage', 'venue.manage'],
        'settings.update': ['workspace.update', 'venue.update', 'workspace.manage', 'venue.manage']
      };
      
      // Check mapped permissions
      const mappedPermissions = permissionMapping[permission] || [permission];
      if (mappedPermissions.some(mappedPerm => 
        backendPermissions.some((p: any) => p.name === mappedPerm)
      )) {
        return true;
      }
      
      // Check for wildcard permissions
      const [resource, action] = permission.split(/[:.]/);
      return backendPermissions.some((p: any) => 
        p.name === `${resource}.manage` || 
        p.name === `${resource}:manage` ||
        (p.resource === resource && p.action === 'manage')
      );
    }

    // Fallback to static permissions
    return user.permissions.some(p => p.name === permission);
  }

  /**
   * Get backend permissions from localStorage
   */
  static getBackendPermissions(): any[] {
    try {
      const permissionsData = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      if (permissionsData) {
        const parsed = JSON.parse(permissionsData);
        return parsed.permissions || [];
      }
    } catch (error) {
      }
    return [];
  }

  /**
   * Get backend role information
   */
  static getBackendRole(): any | null {
    try {
      const permissionsData = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      if (permissionsData) {
        const parsed = JSON.parse(permissionsData);
        return parsed.role || null;
      }
    } catch (error) {
      }
    return null;
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
   * Check if user has a specific role (with backend fallback)
   */
  static hasRole(user: User | null, roleName: string | RoleName): boolean {
    if (!user) {
      return false;
    }



    // First check backend role if available
    const backendRole = this.getBackendRole();
    if (backendRole) {
      return backendRole.name === roleName;
    }

    // Fallback to static role
    if (!user.role) {
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
    return this.isSuperAdmin(user) || this.hasPermission(user, PERMISSIONS.VENUE_SWITCH);
  }

  /**
   * Check if user can activate/deactivate cafe
   */
  static canManageCafeStatus(user: User | null): boolean {
    return this.isSuperAdmin(user) || 
           this.hasPermission(user, PERMISSIONS.VENUE_ACTIVATE) ||
           this.hasPermission(user, PERMISSIONS.VENUE_DEACTIVATE);
  }
}

export default PermissionService;
export const permissionService = PermissionService;