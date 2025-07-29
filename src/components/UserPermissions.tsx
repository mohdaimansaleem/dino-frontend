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

  // Component hidden - user permissions display removed
  return null;
};

export default UserPermissions;