import React, { ReactNode } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge,
  Container,
  Fade,
  useScrollTrigger,
  Fab,
  Zoom,
} from '@mui/material';
import { 
  ShoppingCart, 
  Restaurant, 
  AccountCircle, 
  ExitToApp,
  KeyboardArrowUp,
  Dashboard,
  TableRestaurant,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CleanDinoLogo from './CleanDinoLogo';
import NotificationCenter from './NotificationCenter';

interface CleanLayoutProps {
  children: ReactNode;
}

const CleanLayout: React.FC<CleanLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicMenuRoute = location.pathname.includes('/menu/');
  const isCheckoutRoute = location.pathname.includes('/checkout/');
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isDemoMode = localStorage.getItem('dino_demo_mode') === 'true';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNavigation = () => {
    if (isPublicMenuRoute) {
      // Extract cafeId and tableId from current path for proper routing
      const pathParts = location.pathname.split('/');
      const cafeId = pathParts[2];
      const tableId = pathParts[3];
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      const adminNavItems = [
        { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
        { label: 'Menu', path: '/admin/menu', icon: <Restaurant /> },
        { label: 'Tables', path: '/admin/tables', icon: <TableRestaurant /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings /> },
      ];

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                '&:hover': {
                  backgroundColor: 'primary.50',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{
              ml: 1,
              color: 'error.main',
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
          {user ? (
            <>
              <NotificationCenter />
              <Button
                color="inherit"
                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
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
                Sign Up
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
    if (isPublicMenuRoute) return 'Dino E-Menu';
    if (isCheckoutRoute) return 'Checkout';
    if (isAdminRoute) return 'Dino Admin';
    return 'Dino E-Menu';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Clean AppBar */}
      <AppBar 
        position="fixed" 
        elevation={trigger ? 2 : 1}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 2 } }}>
            <Box
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1, 
                cursor: 'pointer',
                gap: 2,
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              onClick={() => {
                if (isPublicMenuRoute || isCheckoutRoute) {
                  // Extract cafeId and tableId from current path
                  const pathParts = location.pathname.split('/');
                  const cafeId = pathParts[2];
                  const tableId = pathParts[3];
                  if (cafeId && tableId) {
                    navigate(`/menu/${cafeId}/${tableId}`);
                  } else {
                    navigate('/');
                  }
                } else {
                  navigate('/');
                }
              }}
            >
              <CleanDinoLogo 
                size={40} 
                animated={false}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  color: 'text.primary',
                }}
              >
                {getPageTitle()}
              </Typography>
              {isDemoMode && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    backgroundColor: 'warning.light',
                    color: 'warning.dark',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  🧪 DEMO MODE
                </Box>
              )}
            </Box>
            {renderNavigation()}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          minHeight: '100vh',
          pt: 8, // Account for fixed AppBar
        }}
      >
        <Fade in timeout={300}>
          <div>{children}</div>
        </Fade>
      </Box>

      {/* Clean Footer */}
      {(isHomePage || isPublicMenuRoute || isCheckoutRoute) && (
        <Box
          component="footer"
          sx={{
            py: 4,
            px: 2,
            mt: 'auto',
            backgroundColor: 'grey.100',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CleanDinoLogo size={32} animated={false} />
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                © 2024 Dino E-Menu. Revolutionizing restaurant ordering.
              </Typography>
            </Box>
          </Container>
        </Box>
      )}

      {/* Scroll to Top Button */}
      <Zoom in={trigger}>
        <Fab
          onClick={scrollToTop}
          color="primary"
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 2,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default CleanLayout;