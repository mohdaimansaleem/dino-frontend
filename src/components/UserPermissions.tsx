import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Cancel,
  Visibility,
  Person,
  Business,
  Restaurant,
  Settings,
  TableRestaurant,
  ShoppingCart,
  MenuBook,
  People,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import PermissionService from '../services/permissionService';

const UserPermissions: React.FC = () => {
  const { user, getUserWithRole, isAdmin, isOperator, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);

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
        return <CheckCircle fontSize="small" />;
      case 'update':
        return <CheckCircle fontSize="small" />;
      case 'delete':
        return <Cancel fontSize="small" />;
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
        icon: <Person />
      };
    } else if (isOperator()) {
      return {
        title: 'Operator',
        description: 'Limited access to order management only',
        color: 'secondary',
        icon: <Person />
      };
    } else {
      return {
        title: 'User',
        description: 'Basic user access',
        color: 'default',
        icon: <Person />
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  Your Role & Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => setOpen(true)}
            >
              View Details
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={roleInfo.title}
              color={roleInfo.color as any}
              icon={roleInfo.icon}
              sx={{ mr: 1 }}
            />
            <Chip
              label={`${permissions.length} Permissions`}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            {roleInfo.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Detailed Permissions Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: `${roleInfo.color}.main`,
                mr: 2,
              }}
            >
              {roleInfo.icon}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {roleInfo.title} Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.firstName} {user?.lastName} • {user?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {roleInfo.description}
          </Typography>

          <Grid container spacing={2}>
            {permissionCategories.map((category) => (
              category.permissions.length > 0 && (
                <Grid item xs={12} sm={6} key={category.name}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
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
                      {category.permissions.map((permission, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Chip
                              icon={getActionIcon(permission.action)}
                              label={permission.action}
                              size="small"
                              color={getActionColor(permission.action) as any}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={permission.description}
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
              )
            ))}
          </Grid>

          {permissions.length === 0 && (
            <Paper
              elevation={1}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'grey.50',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Permissions Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact your administrator to get permissions assigned to your account.
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Permission Legend:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<Visibility fontSize="small" />}
                label="View"
                size="small"
                color="info"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle fontSize="small" />}
                label="Create"
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle fontSize="small" />}
                label="Update"
                size="small"
                color="warning"
                variant="outlined"
              />
              <Chip
                icon={<Cancel fontSize="small" />}
                label="Delete"
                size="small"
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserPermissions;