import React from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Visibility,
  Business,
  ShoppingCart,
  MenuBook,
  TableRestaurant,
  Settings,
  People,
  Restaurant,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserPermissions: React.FC = () => {
  const { user, getUserWithRole, isAdmin, isOperator, isSuperAdmin } = useAuth();

  const authUser = getUserWithRole();
  const permissions = authUser?.permissions || [];
  const role = authUser?.role;

  const permissionCategories = [
    {
      name: 'Dashboard',
      icon: <Business />,
      color: '#1976d2',
      permissions: permissions.filter(p => p.resource === 'dashboard')
    },
    {
      name: 'Orders',
      icon: <ShoppingCart />,
      color: '#388e3c',
      permissions: permissions.filter(p => p.resource === 'orders')
    },
    {
      name: 'Menu',
      icon: <MenuBook />,
      color: '#f57c00',
      permissions: permissions.filter(p => p.resource === 'menu')
    },
    {
      name: 'Tables',
      icon: <TableRestaurant />,
      color: '#7b1fa2',
      permissions: permissions.filter(p => p.resource === 'tables')
    },
    {
      name: 'Settings',
      icon: <Settings />,
      color: '#d32f2f',
      permissions: permissions.filter(p => p.resource === 'settings')
    },
    {
      name: 'Users',
      icon: <People />,
      color: '#0288d1',
      permissions: permissions.filter(p => p.resource === 'users')
    },
    {
      name: 'Workspace',
      icon: <Business />,
      color: '#5d4037',
      permissions: permissions.filter(p => p.resource === 'workspace')
    },
    {
      name: 'Cafe Management',
      icon: <Restaurant />,
      color: '#00796b',
      permissions: permissions.filter(p => p.resource === 'cafe')
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Visibility fontSize="small" />;
      case 'create':
      case 'update':
        return <CheckCircle fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'info';
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleInfo = () => {
    if (isSuperAdmin()) {
      return {
        title: 'Super Administrator',
        description: 'Full system access with workspace management capabilities',
        color: 'error',
        icon: <Security />
      };
    } else if (isAdmin()) {
      return {
        title: 'Administrator',
        description: 'Full access to restaurant management features',
        color: 'primary',
        icon: <Security />
      };
    } else if (isOperator()) {
      return {
        title: 'Operator',
        description: 'Limited access to order management only',
        color: 'secondary',
        icon: <Security />
      };
    } else {
      return {
        title: 'User',
        description: 'Basic user access',
        color: 'default',
        icon: <Security />
      };
    }
  };

  const roleInfo = getRoleInfo();

  if (!user || !authUser) {
    return (
      <Alert severity="info">
        Please log in to view your permissions.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Role Information */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${roleInfo.color}.main`,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            {roleInfo.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="600">
              {roleInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {roleInfo.description}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${permissions.length} Permissions`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={typeof role === 'string' ? role : role?.name || 'Unknown'}
            color={roleInfo.color as any}
            size="small"
          />
        </Box>
      </Paper>

      {/* Permissions by Category */}
      <Typography variant="h6" gutterBottom fontWeight="600">
        Your Permissions
      </Typography>
      
      {permissions.length === 0 ? (
        <Alert severity="warning">
          No specific permissions assigned. Contact your administrator if you need access to additional features.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {permissionCategories
            .filter(category => category.permissions.length > 0)
            .map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.name}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: category.color,
                        width: 32,
                        height: 32,
                        mr: 1,
                      }}
                    >
                      {React.cloneElement(category.icon, { fontSize: 'small' })}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="600">
                      {category.name}
                    </Typography>
                  </Box>

                  <List dense>
                    {category.permissions.map((permission: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Chip
                            icon={getActionIcon(permission.action || '')}
                            label={permission.action || 'view'}
                            size="small"
                            color={getActionColor(permission.action || '') as any}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={permission.description || permission.name || 'Access granted'}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.875rem'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Permission Summary */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="600">
          Permission Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You have access to {permissions.length} specific permissions across{' '}
          {permissionCategories.filter(cat => cat.permissions.length > 0).length} categories.
          {permissions.length === 0 && ' Contact your administrator to request additional access.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserPermissions;