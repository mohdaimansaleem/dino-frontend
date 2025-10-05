import { User, Permission, UserRole, PERMISSIONS, ROLES, PermissionName, RoleName } from '../../types/auth';
import { STORAGE_KEYS } from '../../constants/storage';
import { ROLE_NAMES } from '../../constants/roles';
import StorageManager from '../../utils/storage';
import { apiService } from '../../utils/api';
import { authService } from './authService';

class PermissionService {
  private static permissionsCache: Map<string, { permissions: any[], role: any, timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
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
        { id: '10', name: PERMISSIONS.COUPONS_MANAGE, resource: 'coupon', action: 'manage', description: 'Manage coupons' },
        { id: '11', name: PERMISSIONS.TABLES_VIEW, resource: 'table', action: 'read', description: 'View tables' },
        { id: '12', name: PERMISSIONS.TABLES_UPDATE, resource: 'table', action: 'update', description: 'Update tables' },
        { id: '13', name: PERMISSIONS.TABLES_CREATE, resource: 'table', action: 'create', description: 'Create tables' },
        { id: '14', name: PERMISSIONS.TABLES_DELETE, resource: 'table', action: 'delete', description: 'Delete tables' },
        { id: '15', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'read', description: 'View settings' },
        { id: '16', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '17', name: PERMISSIONS.USERS_VIEW, resource: 'user', action: 'read', description: 'View users' },
        { id: '18', name: PERMISSIONS.USERS_UPDATE, resource: 'user', action: 'update', description: 'Update users' },
        { id: '19', name: PERMISSIONS.USERS_CREATE, resource: 'user', action: 'create', description: 'Create users' },
        { id: '20', name: PERMISSIONS.USERS_DELETE, resource: 'user', action: 'delete', description: 'Delete users' },
        { id: '21', name: PERMISSIONS.WORKSPACE_VIEW, resource: 'workspace', action: 'read', description: 'View workspaces' },
        { id: '22', name: PERMISSIONS.WORKSPACE_UPDATE, resource: 'workspace', action: 'update', description: 'Update workspaces' },
        { id: '23', name: PERMISSIONS.WORKSPACE_CREATE, resource: 'workspace', action: 'create', description: 'Create workspaces' },
        { id: '24', name: PERMISSIONS.WORKSPACE_DELETE, resource: 'workspace', action: 'delete', description: 'Delete workspaces' },
        { id: '25', name: PERMISSIONS.WORKSPACE_SWITCH, resource: 'workspace', action: 'manage', description: 'Switch workspaces' },
        { id: '26', name: PERMISSIONS.VENUE_ACTIVATE, resource: 'venue', action: 'update', description: 'Activate venues' },
        { id: '27', name: PERMISSIONS.VENUE_DEACTIVATE, resource: 'venue', action: 'update', description: 'Deactivate venues' },
        { id: '28', name: PERMISSIONS.VENUE_VIEW_ALL, resource: 'venue', action: 'read', description: 'View all venues' },
        { id: '29', name: PERMISSIONS.VENUE_SWITCH, resource: 'venue', action: 'manage', description: 'Switch venues' },
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
        { id: '10', name: PERMISSIONS.COUPONS_MANAGE, resource: 'coupon', action: 'manage', description: 'Manage coupons' },
        { id: '11', name: PERMISSIONS.TABLES_VIEW, resource: 'table', action: 'read', description: 'View tables' },
        { id: '12', name: PERMISSIONS.TABLES_UPDATE, resource: 'table', action: 'update', description: 'Update tables' },
        { id: '13', name: PERMISSIONS.TABLES_CREATE, resource: 'table', action: 'create', description: 'Create tables' },
        { id: '14', name: PERMISSIONS.TABLES_DELETE, resource: 'table', action: 'delete', description: 'Delete tables' },
        { id: '15', name: PERMISSIONS.SETTINGS_VIEW, resource: 'settings', action: 'read', description: 'View settings' },
        { id: '16', name: PERMISSIONS.SETTINGS_UPDATE, resource: 'settings', action: 'update', description: 'Update settings' },
        { id: '17', name: PERMISSIONS.USERS_VIEW, resource: 'user', action: 'read', description: 'View users' },
        { id: '18', name: PERMISSIONS.USERS_UPDATE, resource: 'user', action: 'update', description: 'Update users' },
        { id: '19', name: PERMISSIONS.USERS_CREATE, resource: 'user', action: 'create', description: 'Create users' },
        { id: '20', name: PERMISSIONS.USERS_DELETE, resource: 'user', action: 'delete', description: 'Delete users' },
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

    // Special case for superadmin emails - grant all permissions
    if (user.email?.includes('saleem') || user.email?.includes('admin')) {
      return true;
    }

    // First check backend permissions if available
    const backendPermissions = this.getBackendPermissions();
    const backendRole = this.getBackendRole();
    
    // If user is superadmin, grant all permissions
    if (backendRole && (backendRole.name === 'super_admin' || backendRole.name === ROLES.SUPERADMIN)) {
      return true;
    }
    
    // Check if user role is superadmin
    if (user.role && (user.role.name === ROLES.SUPERADMIN)) {
      return true;
    }

    if (!user.permissions) {
      return false;
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
      const permissionsData = StorageManager.getPermissions();
      if (permissionsData) {
        return permissionsData.permissions || [];
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
      const permissionsData = StorageManager.getPermissions();
      if (permissionsData) {
        return permissionsData.role || null;
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

  // =============================================================================
  // USER MANAGEMENT FOR PERMISSIONS
  // =============================================================================

  /**
   * Get users for the current venue with their roles and permissions
   * This is specifically for the permissions dashboard
   */
  static async getVenueUsers(venueId?: string): Promise<any[]> {
    try {
      // Import userService dynamically to avoid circular dependency
      const { userService } = await import('./userService');
      
      if (!venueId) {
        // Try to get venue ID from storage or context
        const userData = StorageManager.getUserData();
        venueId = userData?.venue?.id;
      }

      if (!venueId) {
        return [];
      }

      const response = await userService.getUsersByVenueId(venueId);
      
      if (response.success && response.data) {
        // Transform the VenueUser API response to include permission information
        const usersWithPermissions = response.data.map((user: any) => ({
          id: user.id,
          firstName: user.first_name || user.firstName,
          lastName: user.last_name || user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roleDisplayName: user.role_display_name || this.getRoleDisplayName(user.role),
          isActive: user.is_active !== undefined ? user.is_active : (user.status === 'active'),
          status: user.status || (user.is_active ? 'active' : 'inactive'),
          lastLogin: user.last_logged_in ? new Date(user.last_logged_in) : null,
          permissions: this.getUserPermissionsFromRole(user.role),
          venueId: user.venue_id || user.venueId,
          workspaceId: user.workspace_id || user.workspaceId,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : null,
        }));

        return usersWithPermissions;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Get role display name for UI
   */
  static getRoleDisplayName(role: string): string {
    const roleDisplayMap: Record<string, string> = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator', 
      'operator': 'Operator',
      'staff': 'Staff',
      'customer': 'Customer',
      'manager': 'Manager'
    };
    
    return roleDisplayMap[role?.toLowerCase()] || role || 'Unknown Role';
  }

  /**
   * Get permissions for a user based on their role
   */
  static getUserPermissionsFromRole(role: string): Permission[] {
    if (!role) return [];

    // Map backend role names to frontend role names
    const roleMapping: Record<string, string> = {
      'super_admin': ROLES.SUPERADMIN,
      'superadmin': ROLES.SUPERADMIN,
      'admin': ROLES.ADMIN,
      'operator': ROLES.OPERATOR,
      'staff': ROLES.OPERATOR, // Map staff to operator
    };

    const mappedRole = roleMapping[role.toLowerCase()] || role;
    return this.getRolePermissions(mappedRole);
  }

  /**
   * Get user statistics for permissions dashboard
   */
  static async getUserStatistics(venueId?: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentLogins: number;
  }> {
    try {
      const users = await this.getVenueUsers(venueId);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isActive).length;
      
      // Count users by role
      const usersByRole = users.reduce((acc, user) => {
        const role = user.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count recent logins (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogins = users.filter(user => 
        user.lastLogin && user.lastLogin > sevenDaysAgo
      ).length;

      return {
        totalUsers,
        activeUsers,
        usersByRole,
        recentLogins,
      };
    } catch (error) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {},
        recentLogins: 0,
      };
    }
  }

  /**
   * Update user role and permissions
   * Note: Role updates may need to be handled through a different API endpoint
   */
  static async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      // Import userService dynamically to avoid circular dependency
      const { userService } = await import('./userService');
      
      // For now, we'll use the is_active field update as a placeholder
      // In the future, this should be replaced with a proper role update endpoint
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      // Import userService dynamically to avoid circular dependency
      const { userService } = await import('./userService');
      
      const response = await userService.toggleUserStatus(userId, isActive);
      
      if (response.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export default PermissionService;
export const permissionService = PermissionService;