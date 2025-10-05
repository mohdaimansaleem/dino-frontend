import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Container, CircularProgress } from '@mui/material';
import { Lock, Warning } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionName } from '../../types/auth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: PermissionName[];
  requiredRole?: string;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/admin',
  showAccessDenied = true,
}) => {
  const { isAuthenticated, hasPermission, hasRole, canAccessRoute, isOperator, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being determined
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypass - grant access to everything
  if (user?.role === 'superadmin') {
    return <>{children}</>;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    if (showAccessDenied) {
      return <AccessDeniedPage />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(permission => {
      const result = hasPermission(permission);
      return result;
    });
    
    if (!hasRequiredPermissions) {
      // Special handling for operators trying to access admin dashboard
      if (isOperator() && location.pathname === '/admin') {
        return <Navigate to="/admin/orders" replace />;
      }
      
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check route-based access (only if no specific permissions are required)
  if (requiredPermissions.length === 0 && !canAccessRoute(location.pathname)) {
    if (showAccessDenied) {
      return <AccessDeniedPage />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

const AccessDeniedPage: React.FC = () => {
  const { user, isOperator } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          backgroundColor: 'error.50',
          border: '1px solid',
          borderColor: 'error.200'
        }}
      >
        <Lock sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
        
        <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
          Access Denied
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to access this page
        </Typography>
        
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'warning.50', 
          borderRadius: 2, 
          border: '1px solid',
          borderColor: 'warning.200',
          mb: 3 
        }}>
          <Warning sx={{ color: 'warning.main', mr: 1, verticalAlign: 'middle' }} />
          <Typography variant="body1" component="span" color="warning.dark">
            {`Current Role: ${user?.role || 'Unknown'}`}
          </Typography>
        </Box>

        {isOperator() && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              As an operator, you only have access to the Orders page.
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If you believe this is an error, please contact your administrator.
        </Typography>
      </Paper>
    </Container>
  );
};

export default RoleProtectedRoute;