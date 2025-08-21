import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PermissionService from '../../services/permissionService';
import StorageManager from '../../utils/storageManager';

const PermissionDebug: React.FC = () => {
  const { user, isSuperAdmin, isAdmin, isOperator, getUserWithRole } = useAuth();

  const backendRole = PermissionService.getBackendRole();
  const backendPermissions = PermissionService.getBackendPermissions();
  const authUser = getUserWithRole();
  const storedUser = StorageManager.getUserData();
  const storedPermissions = StorageManager.getPermissions();

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Permission Debug Information
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>User Information</Typography>
          <Typography variant="body2">Email: {user?.email}</Typography>
          <Typography variant="body2">User Role (raw): {JSON.stringify((user as any)?.role)}</Typography>
          <Typography variant="body2">User ID: {user?.id}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Role Checks</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Super Admin: ${isSuperAdmin()}`} 
              color={isSuperAdmin() ? 'success' : 'default'} 
            />
            <Chip 
              label={`Admin: ${isAdmin()}`} 
              color={isAdmin() ? 'primary' : 'default'} 
            />
            <Chip 
              label={`Operator: ${isOperator()}`} 
              color={isOperator() ? 'secondary' : 'default'} 
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Backend Role</Typography>
          <Typography variant="body2">
            Backend Role: {backendRole ? JSON.stringify(backendRole, null, 2) : 'None'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Auth User (getUserWithRole)</Typography>
          <Typography variant="body2">
            Auth User: {authUser ? JSON.stringify({
              email: authUser.email,
              role: authUser.role,
              permissionsCount: authUser.permissions?.length || 0
            }, null, 2) : 'None'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Backend Permissions</Typography>
          <Typography variant="body2">
            Count: {backendPermissions?.length || 0}
          </Typography>
          {backendPermissions?.slice(0, 5).map((perm: any, index: number) => (
            <Typography key={index} variant="caption" display="block">
              {perm.name} - {perm.description || 'No description'}
            </Typography>
          ))}
          {backendPermissions?.length > 5 && (
            <Typography variant="caption" color="text.secondary">
              ... and {backendPermissions.length - 5} more
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Stored Data</Typography>
          <Typography variant="body2">
            Stored User Role: {JSON.stringify((storedUser as any)?.role)}
          </Typography>
          <Typography variant="body2">
            Stored Permissions Count: {storedPermissions?.permissions?.length || 0}
          </Typography>
          <Typography variant="body2">
            Stored Role: {JSON.stringify(storedPermissions?.role)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PermissionDebug;