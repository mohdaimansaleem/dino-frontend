import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PermissionService from '../services/permissionService';
import { User, RoleName, PermissionName } from '../types/auth';

interface RoleBasedComponentProps {
  children: ReactNode;
  allowedRoles?: RoleName[];
  requiredPermissions?: PermissionName[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  fallback?: ReactNode;
  showFallback?: boolean;
  venueId?: string; // For venue-specific access control
  workspaceId?: string; // For workspace-specific access control
  className?: string;
}

/**
 * RoleBasedComponent - A wrapper component that conditionally renders children
 * based on user roles and permissions
 */
const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  showFallback = true,
  venueId,
  workspaceId,
  className
}) => {
  const { user, isAuthenticated, getUserWithRole } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check workspace access if specified
  if (workspaceId && user.workspace_id !== workspaceId) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check venue access if specified
  if (venueId && user.venue_id && user.venue_id !== venueId) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Get user with role information for permission checks
  const authUser = getUserWithRole();

  // Check role-based access
  const hasRoleAccess = allowedRoles.length === 0 || 
    allowedRoles.some(role => PermissionService.hasRole(authUser, role));

  // Check permission-based access
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      hasPermissionAccess = PermissionService.hasAllPermissions(authUser, requiredPermissions);
    } else {
      hasPermissionAccess = PermissionService.hasAnyPermission(authUser, requiredPermissions);
    }
  }

  // Render children if user has access
  if (hasRoleAccess && hasPermissionAccess) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  // Render fallback if no access
  return showFallback ? <>{fallback}</> : null;
};

export default RoleBasedComponent;

// Convenience components for specific roles
export const SuperAdminOnly: React.FC<Omit<RoleBasedComponentProps, 'allowedRoles'>> = (props) => (
  <RoleBasedComponent {...props} allowedRoles={['superadmin']} />
);

export const AdminOnly: React.FC<Omit<RoleBasedComponentProps, 'allowedRoles'>> = (props) => (
  <RoleBasedComponent {...props} allowedRoles={['admin']} />
);

export const OperatorOnly: React.FC<Omit<RoleBasedComponentProps, 'allowedRoles'>> = (props) => (
  <RoleBasedComponent {...props} allowedRoles={['operator']} />
);

export const AdminOrSuperAdmin: React.FC<Omit<RoleBasedComponentProps, 'allowedRoles'>> = (props) => (
  <RoleBasedComponent {...props} allowedRoles={['admin', 'superadmin']} />
);

export const StaffOnly: React.FC<Omit<RoleBasedComponentProps, 'allowedRoles'>> = (props) => (
  <RoleBasedComponent {...props} allowedRoles={['admin', 'operator', 'superadmin']} />
);

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user, getUserWithRole } = useAuth();

  const hasRole = (role: RoleName): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.hasRole(authUser, role);
  };

  const hasPermission = (permission: PermissionName): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.hasPermission(authUser, permission);
  };

  const hasAnyPermission = (permissions: PermissionName[]): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.hasAnyPermission(authUser, permissions);
  };

  const hasAllPermissions = (permissions: PermissionName[]): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.hasAllPermissions(authUser, permissions);
  };

  const canAccessRoute = (route: string): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.canAccessRoute(authUser, route);
  };

  const canPerformAction = (resource: string, action: string): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.canPerformAction(authUser, resource, action);
  };

  const authUser = getUserWithRole();

  return {
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction,
    isAdmin: PermissionService.isAdmin(authUser),
    isOperator: PermissionService.isOperator(authUser),
    isSuperAdmin: PermissionService.isSuperAdmin(authUser),
    canManageWorkspace: PermissionService.canManageWorkspace(authUser),
    canSwitchCafe: PermissionService.canSwitchCafe(authUser),
    canManageCafeStatus: PermissionService.canManageCafeStatus(authUser)
  };
};