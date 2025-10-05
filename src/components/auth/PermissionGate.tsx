import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PermissionService from '../../services/auth';
import { PermissionName, RoleName, PERMISSIONS } from '../../types/auth';

interface PermissionGateProps {
  children: ReactNode;
  permission?: PermissionName;
  permissions?: PermissionName[];
  role?: RoleName;
  roles?: RoleName[];
  resource?: string;
  action?: string;
  requireAll?: boolean; // If true, requires ALL permissions/roles; if false, requires ANY
  fallback?: ReactNode;
  showFallback?: boolean;
  inverse?: boolean; // If true, shows children when user DOESN'T have permission
  loading?: ReactNode;
  className?: string;
}

/**
 * PermissionGate - A more granular permission checking component
 * Supports checking specific permissions, roles, and resource-action combinations
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  resource,
  action,
  requireAll = false,
  fallback = null,
  showFallback = true,
  inverse = false,
  loading = null,
  className
}) => {
  const { user, isAuthenticated, loading: authLoading, getUserWithRole } = useAuth();

  // Show loading state if auth is still loading
  if (authLoading) {
    return loading ? <>{loading}</> : null;
  }

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  let hasAccess = true;

  // Get user with role information for permission checks
  const authUser = getUserWithRole();

  // Check single permission
  if (permission) {
    hasAccess = PermissionService.hasPermission(authUser, permission);
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && PermissionService.hasAllPermissions(authUser, permissions);
    } else {
      hasAccess = hasAccess && PermissionService.hasAnyPermission(authUser, permissions);
    }
  }

  // Check single role
  if (role) {
    hasAccess = hasAccess && PermissionService.hasRole(authUser, role);
  }

  // Check multiple roles
  if (roles.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && roles.every(r => PermissionService.hasRole(authUser, r));
    } else {
      hasAccess = hasAccess && roles.some(r => PermissionService.hasRole(authUser, r));
    }
  }

  // Check resource-action combination
  if (resource && action) {
    hasAccess = hasAccess && PermissionService.canPerformAction(authUser, resource, action);
  }

  // Apply inverse logic if specified
  if (inverse) {
    hasAccess = !hasAccess;
  }

  // Render children if user has access
  if (hasAccess) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  // Render fallback if no access
  return showFallback ? <>{fallback}</> : null;
};

export default PermissionGate;

// Convenience components for common permission patterns

export const CanViewDashboard: React.FC<Omit<PermissionGateProps, 'permission'>> = (props) => (
  <PermissionGate {...props} permission={PERMISSIONS.DASHBOARD_VIEW} />
);

export const CanManageOrders: React.FC<Omit<PermissionGateProps, 'permissions'>> = (props) => (
  <PermissionGate {...props} permissions={[PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE]} />
);

export const CanCreateOrders: React.FC<Omit<PermissionGateProps, 'permission'>> = (props) => (
  <PermissionGate {...props} permission={PERMISSIONS.ORDERS_CREATE} />
);

export const CanManageMenu: React.FC<Omit<PermissionGateProps, 'permissions'>> = (props) => (
  <PermissionGate {...props} permissions={[PERMISSIONS.MENU_VIEW, PERMISSIONS.MENU_UPDATE, PERMISSIONS.MENU_CREATE]} />
);

export const CanManageTables: React.FC<Omit<PermissionGateProps, 'permissions'>> = (props) => (
  <PermissionGate {...props} permissions={[PERMISSIONS.TABLES_VIEW, PERMISSIONS.TABLES_UPDATE]} />
);

export const CanManageUsers: React.FC<Omit<PermissionGateProps, 'permissions'>> = (props) => (
  <PermissionGate {...props} permissions={[PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE]} />
);

export const CanManageSettings: React.FC<Omit<PermissionGateProps, 'permission'>> = (props) => (
  <PermissionGate {...props} permission={PERMISSIONS.SETTINGS_UPDATE} />
);

export const CanManageWorkspace: React.FC<Omit<PermissionGateProps, 'permissions'>> = (props) => (
  <PermissionGate {...props} permissions={[PERMISSIONS.WORKSPACE_VIEW, PERMISSIONS.WORKSPACE_UPDATE]} />
);

// Higher-order component for wrapping entire components with permission checks
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  permissionProps: Omit<PermissionGateProps, 'children'>
) => {
  return (props: P) => (
    <PermissionGate {...permissionProps}>
      <Component {...props} />
    </PermissionGate>
  );
};

// Hook for conditional rendering based on permissions
export const usePermissionCheck = () => {
  const { user, isAuthenticated, getUserWithRole, hasBackendPermission, userPermissions } = useAuth();

  const checkPermission = (permission: PermissionName): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // First try backend permissions
    if (userPermissions && hasBackendPermission(permission)) {
      return true;
    }
    
    // Fallback to static permissions
    const authUser = getUserWithRole();
    return PermissionService.hasPermission(authUser, permission);
  };

  const checkPermissions = (permissions: PermissionName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    const authUser = getUserWithRole();
    return requireAll 
      ? PermissionService.hasAllPermissions(authUser, permissions)
      : PermissionService.hasAnyPermission(authUser, permissions);
  };

  const checkRole = (role: RoleName): boolean => {
    if (!isAuthenticated || !user) return false;
    const authUser = getUserWithRole();
    return PermissionService.hasRole(authUser, role);
  };

  const checkRoles = (roles: RoleName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    const authUser = getUserWithRole();
    return requireAll 
      ? roles.every(r => PermissionService.hasRole(authUser, r))
      : roles.some(r => PermissionService.hasRole(authUser, r));
  };

  const checkResourceAction = (resource: string, action: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const authUser = getUserWithRole();
    return PermissionService.canPerformAction(authUser, resource, action);
  };

  return {
    checkPermission,
    checkPermissions,
    checkRole,
    checkRoles,
    checkResourceAction,
    isAuthenticated,
    user
  };
};