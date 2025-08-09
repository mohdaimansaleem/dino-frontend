import React, { ReactNode, useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Badge,
  Fade,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
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
import VenueStatusControl from './VenueStatusControl';
import { getUserFirstName } from '../utils/userUtils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { user, logout, hasPermission, isOperator } = useAuth();
  const { getTotalItems } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [venueOpen, setVenueOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
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
    setMobileDrawerOpen(false);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const renderNavigation = () => {
    if (isPublicMenuRoute) {
      // Extract venueId and tableId from current path for proper routing
      const pathParts = location.pathname.split('/');
      const venueId = pathParts[2];
      const tableId = pathParts[3];
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isThemeToggleEnabled && <ThemeToggle variant="icon" size="small" />}
          
          <IconButton
            color="primary"
            onClick={() => navigate(`/checkout/${venueId}/${tableId}`)}
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

      {/* Admin Layout with Responsive Sidebar */}
      {isAdminRoute && user ? (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative' }}>
          {/* Desktop Sidebar Navigation - Fixed */}
          {!isMobile && (
            <Box sx={{ 
              position: 'fixed',
              top: 70,
              left: 0,
              bottom: 0,
              width: isTablet ? 200 : 240,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              zIndex: 1200,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Box 
                sx={{ 
                  p: 2,
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { md: '1rem', lg: '1.25rem' }
                  }}
                >
                  Control Panel
                </Typography>
                
                {/* Venue Status Control */}
                <VenueStatusControl />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
                  {renderNavigation()}
                </Box>
              </Box>
            </Box>
          )}

          {/* Mobile Drawer Navigation */}
          {isMobile && (
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileDrawerOpen}
              onClose={handleMobileDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 280,
                  backgroundColor: 'background.paper',
                  pt: 2,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                  Control Panel
                </Typography>
                
                {/* Venue Status Control */}
                <VenueStatusControl />
                
                <Divider sx={{ my: 2 }} />
                
                <List sx={{ p: 0 }}>
                  {/* Render admin navigation items as list items for mobile */}
                  {(() => {
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
                      const backendRole = PermissionService.getBackendRole();
                      const userRole = backendRole?.name || user.role || (user as any).role || 'unknown';
                      
                      if (userRole === 'superadmin') {
                        return true;
                      }
                      
                      if (item.roles && item.roles.length > 0) {
                        const hasRequiredRole = item.roles.includes(userRole as string);
                        if (!hasRequiredRole) {
                          return false;
                        }
                      }
                      
                      const hasPermissionResult = hasPermission(item.permission);
                      return hasPermissionResult;
                    });

                    return adminNavItems.map((item) => (
                      <ListItem key={item.label} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            navigate(item.path);
                            setMobileDrawerOpen(false);
                          }}
                          selected={location.pathname === item.path}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.50',
                              color: 'primary.main',
                              '& .MuiListItemIcon-root': {
                                color: 'primary.main',
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.label}
                            primaryTypographyProps={{
                              fontWeight: location.pathname === item.path ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ));
                  })()}
                </List>
              </Box>
            </Drawer>
          )}

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              backgroundColor: 'background.default',
              minHeight: 'calc(100vh - 70px)',
              marginLeft: isMobile ? 0 : (isTablet ? '200px' : '240px'),
              marginTop: '70px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Mobile Header for Admin */}
            {isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  flexShrink: 0,
                }}
              >
                <IconButton
                  onClick={handleMobileDrawerToggle}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Dashboard />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isOperator() ? 'Dino Operator' : 'Dino Admin'}
                </Typography>
                <Box sx={{ width: 48 }} /> {/* Spacer for centering */}
              </Box>
            )}

            <Fade in timeout={300}>
              <Box 
                sx={{ 
                  flex: 1,
                  p: { xs: 2, sm: 3, md: 4 },
                  pt: { xs: 3, sm: 4, md: 5 },
                  overflow: 'auto',
                  height: '100%',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                  },
                }}
              >
                {children}
              </Box>
            </Fade>
            
            {/* Footer for Admin Routes */}
            <Box 
              sx={{ 
                flexShrink: 0,
                textAlign: 'center',
                py: { xs: 1, lg: 1 },
                px: { xs: 2, lg: 1 },
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                mt: 'auto',
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500 
                }}
              >
                © 2024 Dino E-Menu. All rights reserved.
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
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
            pt: isCustomerFacingRoute ? 0 : { xs: 8, sm: 9 }, // Responsive top padding for sticky navbar
            transition: 'padding-top 0.3s ease-in-out',
            // Smooth scrolling
            scrollBehavior: 'smooth',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Fade in timeout={300}>
            <Box 
              sx={{ 
                width: '100%',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              {children}
            </Box>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default Layout;