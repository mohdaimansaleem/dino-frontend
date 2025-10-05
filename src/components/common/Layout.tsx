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
} from '@mui/material';
import { 
  ShoppingCart, 
  Restaurant, 
  AccountCircle, 
  Menu as MenuIcon,
  Dashboard,
  TableRestaurant,
  Settings,
  Assignment,
  People,
  Business,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PermissionService from '../../services/auth';
import { useCart } from '../../contexts/CartContext';
import { PERMISSIONS } from '../../types/auth';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { useSidebar } from '../../contexts/SidebarContext';
import AppHeader from '../layout/AppHeader';
import MobileMenu from '../layout/MobileMenu';
import Sidebar from '../layout/Sidebar';
// import VenueStatusControl from './VenueStatusControl'; // Unused
// import DinoLogo from './DinoLogo'; // Unused
import { getUserFirstName } from '../../utils/userUtils';


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  // const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // Unused
  const { user, logout, hasPermission, isOperator } = useAuth();
  const { getTotalItems } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [venueOpen, setVenueOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  // const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  
  // Feature flags
  const isThemeToggleEnabled = useFeatureFlag('themeToggle');
  
  // Sidebar state
  const { getSidebarWidth } = useSidebar();

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderNavigation = () => {
    if (isPublicMenuRoute) {
      // Extract venueId and tableId from current path for proper routing
      const pathParts = location.pathname.split('/');
      const venueId = pathParts[2];
      const tableId = pathParts[3];
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {isThemeToggleEnabled && <ThemeToggle variant="icon" size="small" />}
          
          <IconButton
            color="primary"
            onClick={() => navigate(`/checkout/${venueId}/${tableId}`)}
            disabled={getTotalItems() === 0}
            sx={{
              backgroundColor: getTotalItems() > 0 ? 'primary.50' : 'transparent',
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                backgroundColor: 'primary.100',
              },
              '&:disabled': {
                opacity: 0.5,
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
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                },
              }}
            >
              <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }} data-tour="sidebar-navigation">
          {adminNavItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              fullWidth
              data-tour={`${item.label.toLowerCase()}-nav`}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.25,
                px: 2,
                borderRadius: 2,
                minHeight: 44,
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? 600 : 500,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
                border: location.pathname === item.path ? '1px solid' : '1px solid transparent',
                borderColor: location.pathname === item.path ? 'primary.200' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.100' : 'action.hover',
                  borderColor: location.pathname === item.path ? 'primary.300' : 'divider',
                  transform: 'translateX(2px)',
                },
                '&:active': {
                  transform: 'translateX(0px)',
                },
                '& .MuiButton-startIcon': {
                  mr: 1.5,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  fontSize: '1.125rem',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      );
    }

    if (isHomePage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    transform: 'translateY(-1px)',
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
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'error.50',
                    transform: 'translateY(-1px)',
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
                sx={{ 
                  mr: 1,
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Create Account
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: '100vh', margin: 0, padding: 0, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Enhanced AppHeader - Hidden for customer facing pages and mobile admin routes */}
      {!isCustomerFacingRoute && !(isAdminRoute && isMobile) && (
        <AppHeader />
      )}

      {/* Admin Layout with Responsive Sidebar */}
      {isAdminRoute && user ? (
        <Box sx={{ display: 'flex', minHeight: isMobile ? '100vh' : 'calc(100vh - 70px)', position: 'relative', height: isMobile ? '100vh' : 'calc(100vh - 70px)', margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}>
          {/* Enhanced Desktop Sidebar Navigation */}
          {!isMobile && (
            <Sidebar isTablet={isTablet} />
          )}



          {/* Main Content */}
          <Box
            component="main"
            className={isMobile ? "admin-main-content" : ""}
            sx={{
              flex: 1,
              backgroundColor: 'background.default',
              minHeight: isMobile ? '100vh' : 'calc(100vh - 70px)',
              height: isMobile ? '100vh' : 'calc(100vh - 70px)',
              marginLeft: isMobile ? 0 : `${getSidebarWidth(isTablet)}px`,
              marginTop: isMobile ? 0 : '70px',
              marginRight: 0,
              paddingRight: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: isMobile ? 'visible' : 'auto',
              width: isMobile ? '100%' : `calc(100% - ${getSidebarWidth(isTablet)}px)`,
              maxWidth: '100%',
            }}
          >
            {/* Mobile Header for Admin - Now uses MobileMenu */}
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
                  minHeight: '64px', // Fixed height
                  maxHeight: '64px',
                }}
              >
                {/* Title only */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {isOperator() ? 'Operator Panel' : 'Admin Panel'}
                  </Typography>
                </Box>
                
                {/* Hamburger menu on the right */}
                <IconButton
                  onClick={handleMobileDrawerToggle}
                  sx={{
                    color: 'text.primary',
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&:active': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <MenuIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Box>
            )}

            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                height: 'auto',
                minHeight: 'auto',
              }}
            >
              <Fade in timeout={300}>
                <Box 
                  sx={{ 
                    flex: 1,
                    p: 0,
                    overflow: 'visible',
                    minHeight: 'auto',
                    height: 'auto',
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
                © 2025 Dino. All rights reserved.
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

          {/* Mobile Menu for Admin Routes */}
          {isMobile && (
            <MobileMenu
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              homeNavItems={[]}
              activeSection=""
              onSectionClick={() => {}}
              user={user}
              onLogout={handleLogout}
              onNavigate={(path) => {
                navigate(path);
                setMobileDrawerOpen(false);
              }}
              isHomePage={false}
              isAdminRoute={true}
            />
          )}
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
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
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