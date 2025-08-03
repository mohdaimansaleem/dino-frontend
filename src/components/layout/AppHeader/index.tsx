import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useScrollTrigger,
  Slide,

  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import DinoLogo from '../../DinoLogo';
import NotificationCenter from '../../NotificationCenter';
import ThemeToggle from '../../ThemeToggle';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';
import MobileMenu from '../MobileMenu';
import { NAVIGATION, COMPANY_INFO } from '../../../data/info';

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Feature flags
  const isThemeToggleEnabled = useFeatureFlag('themeToggle');

  // Scroll trigger for navbar background
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Navigation items for home page
  const homeNavItems = NAVIGATION.home.map(item => ({
    label: item.label,
    id: item.id,
    icon: React.createElement(item.icon)
  }));

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      if (onSectionScroll) {
        onSectionScroll(sectionId);
      }
    }
    setMobileMenuOpen(false);
  };

  // Track active section on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = homeNavItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, homeNavItems]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderDesktopNavigation = () => {
    if (isHomePage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {homeNavItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              sx={{
                color: activeSection === item.id ? 'primary.main' : 'text.primary',
                fontWeight: activeSection === item.id ? 600 : 400,
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: 2,
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: activeSection === item.id ? '80%' : '0%',
                  height: 2,
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                  transition: 'width 0.3s ease',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      );
    }

    return null;
  };

  const renderUserActions = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationCenter />
          <Button
            color="inherit"
            onClick={() => navigate(user.role === 'admin' ? '/admin' : '/profile')}
            startIcon={<AccountCircle />}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {user.firstName || (user as any).first_name || user.email}
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{
              color: 'error.main',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          color="inherit"
          onClick={() => navigate('/register')}
          startIcon={<PersonAdd />}
          sx={{
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Create Account
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          startIcon={<Login />}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  };

  const getPageTitle = () => {
    if (isHomePage) return COMPANY_INFO.name;
    return COMPANY_INFO.name;
  };

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger || isHomePage || isAdminRoute}>
        <AppBar
          position={isAdminRoute ? "sticky" : "fixed"}
          elevation={isAdminRoute ? 0 : (trigger ? 4 : 0)}
          sx={{
            backgroundColor: trigger || isAdminRoute
              ? 'rgba(255, 255, 255, 0.95)' 
              : isHomePage 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'background.paper',
            backdropFilter: trigger || isHomePage || isAdminRoute ? 'blur(20px)' : 'none',
            borderBottom: trigger || isAdminRoute ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
            color: 'text.primary',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1100,
            top: isAdminRoute ? 0 : 'auto',
            boxShadow: isAdminRoute ? 'none' : undefined,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ px: { xs: 0, sm: 0 }, minHeight: 70 }}>
              {/* Logo and Title */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexGrow: 1,
                  cursor: 'pointer',
                  gap: 1.5,
                  minWidth: 0,
                  pl: { xs: 1, sm: 2 }, // Add left padding to move logo left
                  '&:hover': {
                    opacity: 0.8,
                  },
                  transition: 'opacity 0.3s ease',
                }}
                onClick={() => navigate('/')}
              >
                <DinoLogo size={45} animated={true} />
                <Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      color: 'text.primary',
                      lineHeight: 1.2,
                    }}
                  >
                    {getPageTitle()}
                  </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        display: 'block',
                        lineHeight: 1,
                      }}
                    >
                      {COMPANY_INFO.tagline}
                    </Typography>
                </Box>
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {renderDesktopNavigation()}
                  
                  {/* Theme Toggle */}
                  {isThemeToggleEnabled && (
                    <ThemeToggle variant="switch" size="small" />
                  )}
                  
                  {/* User Actions */}
                  {renderUserActions()}
                </Box>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isThemeToggleEnabled && (
                    <ThemeToggle variant="icon" size="small" />
                  )}
                  <IconButton
                    color="inherit"
                    onClick={handleMobileMenuToggle}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={homeNavItems}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => {
          navigate(path);
          setMobileMenuOpen(false);
        }}
        isHomePage={isHomePage}
      />
    </>
  );
};

export default AppHeader;