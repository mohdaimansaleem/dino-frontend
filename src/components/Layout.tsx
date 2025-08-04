import React, { ReactNode, useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Badge,
  Fade,

  Typography,
} from '@mui/material';
import { 
  ShoppingCart, 
  Restaurant, 
  AccountCircle, 

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
import PermissionService from '../services/permissionService';
import { useCart } from '../contexts/CartContext';
import { PERMISSIONS } from '../types/auth';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import AppHeader from './layout/AppHeader';
import CafeStatusControl from './CafeStatusControl';
import { getUserFirstName } from '../utils/userUtils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, isOperator } = useAuth();
  const { getTotalItems } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // Reordered according to user request: Dashboard, Orders, Menu, Tables, Users, Permissions, Settings, Workspace
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
          label: 'Settings', 
          path: '/admin/settings', 
          icon: <Settings />, 
          permission: PERMISSIONS.SETTINGS_VIEW,
          roles: ['admin'] 
        },
        { 
          label: 'Workspace', 
          path: '/admin/workspace', 
          icon: <Business />, 
          permission: PERMISSIONS.WORKSPACE_VIEW,
          roles: ['superadmin'] 
        },
      ];

      // Filter navigation items based on user permissions and roles
      const adminNavItems = allAdminNavItems.filter(item => {
        // Check multiple possible role locations
        const backendRole = PermissionService.getBackendRole();
        const userRole = backendRole?.name || user.role || (user as any).role || 'unknown';
        // For superadmin, show all items
        if (userRole === 'superadmin') {
          return true;
        }
        
        // Check if user has required role
        if (item.roles && item.roles.length > 0) {
          const hasRequiredRole = item.roles.includes(userRole as string);
          if (!hasRequiredRole) {
            return false;
          }
        }
        
        // Check permission (fallback)
        const hasPermissionResult = hasPermission(item.permission);
        return hasPermissionResult;
      });
      


      return (
        <>
          {adminNavItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
                fontWeight: location.pathname === item.path ? 600 : 400,
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.100' : 'action.hover',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
                '& .MuiButton-startIcon': {
                  mr: 2,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </>
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
                {getUserFirstName(user) || user.email}
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      {/* Admin Layout with Sidebar */}
      {isAdminRoute && user ? (
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          {/* Admin Sidebar Navigation */}
          <Box sx={{ 
            position: 'sticky',
            top: 70, // Position below the sticky navbar (navbar height ~70px)
            height: 'calc(100vh - 70px)', // Adjust height to account for navbar
            width: 240,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            zIndex: 1050,
            boxShadow: 2,
            overflow: 'hidden', // Remove scroll from sidebar
            pt: 2,
            flexShrink: 0,
          }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Control Panel
              </Typography>
              
              {/* Cafe Status Control */}
              <CafeStatusControl />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {renderNavigation()}
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: 'background.default',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Fade in timeout={300}>
              <Box sx={{ flexGrow: 1 }}>
                {children}
              </Box>
            </Fade>
            
            {/* Footer for Admin Routes */}
            <Box 
              sx={{ 
                flexShrink: 0,
                textAlign: 'center',
                py: { xs: 2, lg: 1.5 },
                px: { xs: 2, lg: 1 },
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                mt: 'auto'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500 
                }}
              >
                © 2024 Dino E-Menu. All rights reserved.
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  display: 'block',
                  mt: 0.5
                }}
              >
                Digital Menu Revolution
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Non-admin routes */
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            pt: isCustomerFacingRoute ? 0 : 9, // Top padding for sticky navbar
            transition: 'padding-top 0.3s ease-in-out',
            // Smooth scrolling
            scrollBehavior: 'smooth',
          }}
        >
          <Fade in timeout={300}>
            <div>{children}</div>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default Layout;