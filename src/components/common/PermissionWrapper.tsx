/**
 * Standardized Permission Wrapper Component
 * 
 * A unified component for handling role-based access control throughout the application
 * Following project standards for consistent permission checking
 */

import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../auth';
import { PermissionName, RoleName } from '../../types/auth';

interface PermissionWrapperProps {
  children: React.ReactNode;
  
  // Permission-based access
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAllPermissions?: boolean; // If true, requires ALL permissions; if false, requires ANY
  
  // Role-based access
  role?: RoleName;
  roles?: RoleName[];
  requireAllRoles?: boolean; // If true, requires ALL roles; if false, requires ANY
  
  // Custom permission checks
  customCheck?: () => boolean;
  
  // Fallback content
  fallback?: React.ReactNode;
  showFallback?: boolean;
  
  // Error states
  showPermissionError?: boolean;
  permissionErrorMessage?: string;
  
  // Loading state
  loading?: React.ReactNode;
  
  // Inverse logic (show when user DOESN'T have permission)
  inverse?: boolean;
  
  // Wrapper styling
  className?: string;
  sx?: any;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  permissions = [],
  requireAllPermissions = false,
  role,
  roles = [],
  requireAllRoles = false,
  customCheck,
  fallback = null,
  showFallback = true,
  showPermissionError = false,
  permissionErrorMessage = 'You don\'t have permission to access this feature.',
  loading = null,
  inverse = false,
  className,
  sx = {},
}) => {
  const { user, isAuthenticated, loading: authLoading, hasPermission, hasBackendPermission, hasRole } = useAuth();
  const {
    isSuperAdmin,
    isAdmin,
    isOperator,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
  } = usePermissions();

  // Show loading state if auth is still loading
  if (authLoading) {
    return loading ? <>{loading}</> : null;
  }

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    if (showPermissionError) {
      return (
        <Alert severity="warning" sx={sx} className={className}>
          <Typography variant="body2">
            Please log in to access this feature.
          </Typography>
        </Alert>
      );
    }
    return showFallback ? <>{fallback}</> : null;
  }

  let hasAccess = true;

  // SuperAdmin bypass - SuperAdmins have access to everything
  if (isSuperAdmin()) {
    hasAccess = true;
  } else {
    // Check single permission
    if (permission) {
      hasAccess = hasAccess && (hasPermission(permission) || hasBackendPermission(permission));
    }

    // Check multiple permissions
    if (permissions.length > 0) {
      if (requireAllPermissions) {
        hasAccess = hasAccess && permissions.every(p => hasPermission(p) || hasBackendPermission(p));
      } else {
        hasAccess = hasAccess && permissions.some(p => hasPermission(p) || hasBackendPermission(p));
      }
    }

    // Check single role
    if (role) {
      hasAccess = hasAccess && hasRole(role);
    }

    // Check multiple roles
    if (roles.length > 0) {
      if (requireAllRoles) {
        hasAccess = hasAccess && roles.every(r => hasRole(r));
      } else {
        hasAccess = hasAccess && roles.some(r => hasRole(r));
      }
    }

    // Custom permission check
    if (customCheck) {
      hasAccess = hasAccess && customCheck();
    }
  }

  // Apply inverse logic if specified
  if (inverse) {
    hasAccess = !hasAccess;
  }

  // Render children if user has access
  if (hasAccess) {
    return className || sx ? (
      <Box className={className} sx={sx}>
        {children}
      </Box>
    ) : (
      <>{children}</>
    );
  }

  // Render permission error if requested
  if (showPermissionError) {
    return (
      <Alert severity="error" sx={sx} className={className}>
        <Typography variant="body2">
          {permissionErrorMessage}
        </Typography>
        {user?.role && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Current role: {user.role}
          </Typography>
        )}
      </Alert>
    );
  }

  // Render fallback if no access
  return showFallback ? <>{fallback}</> : null;
};

export default PermissionWrapper;

// Convenience components for common permission patterns

export const CanViewDashboard: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canViewDashboard } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canViewDashboard()} />;
};

export const CanManageOrders: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageOrders } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageOrders()} />;
};

export const CanManageMenu: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageMenu } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageMenu()} />;
};

export const CanManageTables: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageTables } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageTables()} />;
};

export const CanManageUsers: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageUsers } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageUsers()} />;
};

export const CanManageVenues: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageVenues } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageVenues()} />;
};

export const CanViewSettings: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canViewSettings } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canViewSettings()} />;
};

// Role-based convenience components
export const SuperAdminOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isSuperAdmin } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isSuperAdmin()} />;
};

export const AdminOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isAdmin } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isAdmin()} />;
};

export const OperatorOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isOperator } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isOperator()} />;
};

export const AdminOrAbove: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isSuperAdmin, isAdmin } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isSuperAdmin() || isAdmin()} />;
};

export const OperatorOrAbove: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isSuperAdmin, isAdmin, isOperator } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isSuperAdmin() || isAdmin() || isOperator()} />;
};

// Higher-order component for wrapping entire components with permission checks
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  permissionProps: Omit<PermissionWrapperProps, 'children'>
) => {
  return (props: P) => (
    <PermissionWrapper {...permissionProps}>
      <Component {...props} />
    </PermissionWrapper>
  );
};

// Hook for conditional rendering based on permissions
export const usePermissionCheck = () => {
  const { user, isAuthenticated, hasPermission, hasBackendPermission, hasRole } = useAuth();
  const {
    isSuperAdmin,
    isAdmin,
    isOperator,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
  } = usePermissions();

  const checkPermission = (permission: PermissionName): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isSuperAdmin()) return true;
    return hasPermission(permission) || hasBackendPermission(permission);
  };

  const checkPermissions = (permissions: PermissionName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isSuperAdmin()) return true;
    
    return requireAll 
      ? permissions.every(p => hasPermission(p) || hasBackendPermission(p))
      : permissions.some(p => hasPermission(p) || hasBackendPermission(p));
  };

  const checkRole = (role: RoleName): boolean => {
    if (!isAuthenticated || !user) return false;
    return hasRole(role);
  };

  const checkRoles = (roles: RoleName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    return requireAll 
      ? roles.every(r => hasRole(r))
      : roles.some(r => hasRole(r));
  };

  return {
    checkPermission,
    checkPermissions,
    checkRole,
    checkRoles,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
    isSuperAdmin,
    isAdmin,
    isOperator,
    isAuthenticated,
    user
  };
};