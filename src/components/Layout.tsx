import React, { ReactNode, useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Badge,
  Fade,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { 
  ShoppingCart, 
  Restaurant, 
  AccountCircle, 
  ExitToApp,
  Dashboard,
  TableRestaurant,
  Settings,
  Assignment,
  People,
  Business,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { PERMISSIONS } from '../types/auth';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import AppHeader from './layout/AppHeader';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, isAdmin, isOperator } = useAuth();
  const { getTotalItems } = useCart();
  const [cafeOpen, setCafeOpen] = useState(true);
  
  // Feature flags
  const isThemeToggleEnabled = useFeatureFlag('themeToggle');

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicMenuRoute = location.pathname.includes('/menu/');
  const isCheckoutRoute = location.pathname.includes('/checkout/');
  const isOrderTrackingRoute = location.pathname.includes('/order-tracking/') || location.pathname.includes('/order/');
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isCustomerFacingRoute = isPublicMenuRoute || isCheckoutRoute || isOrderTrackingRoute;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavigation = () => {
    if (isPublicMenuRoute) {
      // Extract cafeId and tableId from current path for proper routing
      const pathParts = location.pathname.split('/');
      const cafeId = pathParts[2];
      const tableId = pathParts[3];
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isThemeToggleEnabled && <ThemeToggle variant="icon" size="small" />}
          
          <IconButton
            color="primary"
            onClick={() => navigate(`/checkout/${cafeId}/${tableId}`)}
            disabled={getTotalItems() === 0}
            sx={{
              backgroundColor: getTotalItems() > 0 ? 'primary.50' : 'transparent',
              '&:hover': {
                backgroundColor: 'primary.100',
              },
            }}
          >
            <Badge 
              badgeContent={getTotalItems()} 
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'secondary.main',
                  color: 'white',
                },
              }}
            >
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      );
    }

    if (isAdminRoute && user) {
      // Define all possible admin navigation items with their required permissions
      const allAdminNavItems = [
        { 
          label: 'Dashboard', 
          path: '/admin', 
          icon: <Dashboard />, 
          permission: PERMISSIONS.DASHBOARD_VIEW,
          roles: ['admin'] 
        },
        { 
          label: 'Orders', 
          path: '/admin/orders', 
          icon: <Assignment />, 
          permission: PERMISSIONS.ORDERS_VIEW,
          roles: ['admin', 'operator'] 
        },
        { 
          label: 'Menu', 
          path: '/admin/menu', 
          icon: <Restaurant />, 
          permission: PERMISSIONS.MENU_VIEW,
          roles: ['admin'] 
        },
        { 
          label: 'Tables', 
          path: '/admin/tables', 
          icon: <TableRestaurant />, 
          permission: PERMISSIONS.TABLES_VIEW,
          roles: ['admin'] 
        },
        { 
          label: 'Settings', 
          path: '/admin/settings', 
          icon: <Settings />, 
          permission: PERMISSIONS.SETTINGS_VIEW,
          roles: ['admin'] 
        },
        { 
          label: 'Users', 
          path: '/admin/users', 
          icon: <People />, 
          permission: PERMISSIONS.USERS_VIEW,
          roles: ['admin', 'superadmin'] 
        },
        { 
          label: 'Permissions', 
          path: '/admin/permissions', 
          icon: <Security />, 
          permission: PERMISSIONS.USERS_VIEW,
          roles: ['admin', 'superadmin'] 
        },
        { 
          label: 'Workspace', 
          path: '/admin/workspace', 
          icon: <Business />, 
          permission: PERMISSIONS.WORKSPACE_VIEW,
          roles: ['superadmin'] 
        },
      ];

      // Filter navigation items based on user permissions
      const adminNavItems = allAdminNavItems.filter(item => 
        hasPermission(item.permission)
      );

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          {/* Cafe Status Toggle - Only for Admin */}
          {isAdmin() && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={cafeOpen ? 'OPEN' : 'CLOSED'}
                size="small"
                color={cafeOpen ? 'success' : 'error'}
                sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={cafeOpen}
                    onChange={(e) => setCafeOpen(e.target.checked)}
                    size="small"
                    color="success"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          )}

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            overflow: 'hidden',
            flexShrink: 1,
            minWidth: 0
          }}>
            {adminNavItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                  backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  minWidth: 'auto',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          
          {isThemeToggleEnabled && <ThemeToggle variant="switch" size="small" />}
          
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'error.50',
              },
            }}
          >
            <ExitToApp />
          </IconButton>
        </Box>
      );
    }

    if (isHomePage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isThemeToggleEnabled && <ThemeToggle variant="switch" size="small" />}
          {user ? (
            <>
              <NotificationCenter />
              <Button
                color="inherit"
                onClick={() => navigate('/admin')}
                startIcon={<AccountCircle />}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                {user.firstName || user.email}
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.50',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{ mr: 1 }}
              >
                Create Account
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 500,
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      );
    }

    return null;
  };

  const getPageTitle = () => {
    if (isPublicMenuRoute) return 'Dino';
    if (isCheckoutRoute) return 'Checkout';
    if (isAdminRoute) {
      if (isOperator()) return 'Dino Operator';
      return 'Dino Admin';
    }
    return 'Dino';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Enhanced AppHeader - Hidden for customer facing pages */}
      {!isCustomerFacingRoute && (
        <AppHeader />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          minHeight: '100vh',
          pt: isCustomerFacingRoute ? 0 : 9, // No padding for customer facing pages, account for enhanced AppBar for others
        }}
      >
        <Fade in timeout={300}>
          <div>{children}</div>
        </Fade>
      </Box>


    </Box>
  );
};

export default Layout;