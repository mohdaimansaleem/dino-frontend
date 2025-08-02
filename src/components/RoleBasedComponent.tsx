import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionName, RoleName, ROLES } from '../types/auth';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  requiredPermissions?: PermissionName[];
  requiredRole?: RoleName;
  allowedRoles?: RoleName[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user role and permissions
 */
export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  allowedRoles = [],
  fallback = null,
  showFallback = true,
}) => {
  const { hasPermission, hasRole, getUserWithRole } = useAuth();
  const user = getUserWithRole();

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(permission =>
      hasPermission(permission)
    );
    if (!hasRequiredPermissions) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
};

/**
 * Hook to get user permissions and role information
 */
export const usePermissions = () => {
  const { getUserWithRole, hasPermission, hasRole, isAdmin, isOperator, isSuperAdmin } = useAuth();
  const user = getUserWithRole();

  return {
    user,
    hasPermission,
    hasRole,
    isAdmin,
    isOperator,
    isSuperAdmin,
    
    // Role checks
    checkIsSuperAdmin: () => hasRole(ROLES.SUPERADMIN),
    isAdminOrAbove: () => hasRole(ROLES.SUPERADMIN) || hasRole(ROLES.ADMIN),
    isOperatorOrAbove: () => hasRole(ROLES.SUPERADMIN) || hasRole(ROLES.ADMIN) || hasRole(ROLES.OPERATOR),
    
    // Permission checks (using dot notation to match backend)
    canViewDashboard: () => hasPermission('dashboard.read'),
    canManageUsers: () => hasPermission('user.read') || hasPermission('user.create'),
    canManageVenues: () => hasPermission('workspace.read') || hasPermission('workspace.create'),
    canManageOrders: () => hasPermission('order.read') || hasPermission('order.update'),
    canManageMenu: () => hasPermission('menu.read') || hasPermission('menu.create'),
    canManageTables: () => hasPermission('table.read') || hasPermission('table.create'),
    canViewSettings: () => hasPermission('settings.read'),
  };
};

/**
 * Higher-order component for role-based access control
 */
export const withRoleAccess = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: PermissionName[],
  requiredRole?: RoleName,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <RoleBasedComponent
      requiredPermissions={requiredPermissions}
      requiredRole={requiredRole}
      fallback={fallback}
    >
      <Component {...props} />
    </RoleBasedComponent>
  );
};

export default RoleBasedComponent;