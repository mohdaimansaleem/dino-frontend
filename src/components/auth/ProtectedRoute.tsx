import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { /* ROLE_NAMES, */ isAdminLevel } from '../../constants/roles';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  cafeOwnerOnly?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  cafeOwnerOnly = false,
  requiredRole,
  redirectTo
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo || "/login"} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check specific role requirements
  let hasAccess = true;
  let accessMessage = '';

  if (adminOnly && !isAdminLevel(user.role)) {
    hasAccess = false;
    accessMessage = 'Admin access required.';
  } else if (cafeOwnerOnly && !isAdminLevel(user.role) && (user.role as string) !== 'cafe_owner') {
    hasAccess = false;
    accessMessage = 'Cafe owner access required.';
  } else if (requiredRole && user.role !== requiredRole && !isAdminLevel(user.role)) {
    hasAccess = false;
    accessMessage = `${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} access required.`;
  }

  // Show access denied if user doesn't have required permissions
  if (!hasAccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 3,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Lock sx={{ fontSize: 80, color: 'error.main' }} />
        
        <Box>
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have permission to access this page
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {accessMessage}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          {`Current role: ${user.role}`}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;