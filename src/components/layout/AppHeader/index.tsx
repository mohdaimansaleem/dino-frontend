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
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Login,
  PersonAdd,
  Store,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import DinoLogo from '../../DinoLogo';
import NotificationCenter from '../../NotificationCenter';
import ThemeToggle from '../../ThemeToggle';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';
import MobileMenu from '../MobileMenu';
import { NAVIGATION, COMPANY_INFO } from '../../../data/info';
import { getUserFirstName } from '../../../utils/userUtils';
import { ROLE_NAMES, isAdminLevel } from '../../../constants/roles';
import { useUserData } from '../../../contexts/UserDataContext';
import { venueService } from '../../../services/venueService';

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { userData } = useUserData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [dinoAvatar, setDinoAvatar] = useState<string>('');
  const [venueStatus, setVenueStatus] = useState<{
    isActive: boolean;
    isOpen: boolean;
    venueName: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Feature flags
  const isThemeToggleEnabled = useFeatureFlag('themeToggle');

  // Load dinosaur avatar from localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem('dinoAvatar');
    if (savedAvatar) {
      setDinoAvatar(savedAvatar);
    }
    
    // Listen for avatar updates
    const handleStorageChange = () => {
      const newAvatar = localStorage.getItem('dinoAvatar');
      if (newAvatar) {
        setDinoAvatar(newAvatar);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events from the profile page
    window.addEventListener('dinoAvatarUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dinoAvatarUpdated', handleStorageChange);
    };
  }, []);

  // Load venue status for admin users
  useEffect(() => {
    const loadVenueStatus = async () => {
      const userIsAdmin = isAdmin() || isSuperAdmin();
      
      if (!user || !userIsAdmin) {
        setVenueStatus(null);
        return;
      }

      if (!userData?.venue?.id) {
        setVenueStatus({
          isActive: false,
          isOpen: false,
          venueName: userData?.venue?.name || 'No Venue Selected'
        });
        return;
      }

      try {
        const venue = await venueService.getVenue(userData.venue.id);
        
        if (venue) {
          const statusData = {
            isActive: venue.is_active || false,
            isOpen: venue.status === 'active' || venue.is_open || false,
            venueName: venue.name || userData.venue.name || 'Current Venue'
          };
          setVenueStatus(statusData);
        }
      } catch (error) {
        console.error('❌ AppHeader - Error loading venue status:', error);
        setVenueStatus({
          isActive: false,
          isOpen: false,
          venueName: userData?.venue?.name || 'Error Loading Venue'
        });
      }
    };

    loadVenueStatus();
  }, [user, userData?.venue?.id, isAdmin, isSuperAdmin]);

  // Handle venue status toggle
  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;

    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      
      await venueService.updateVenue(userData.venue.id, { 
        status: newStatus ? 'active' : 'closed' 
      });

      setVenueStatus(prev => prev ? { ...prev, isOpen: newStatus } : null);
    } catch (error) {
      console.error('❌ AppHeader - Error toggling venue status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

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

  const renderVenueStatus = () => {
    if (!user || !(isAdmin() || isSuperAdmin()) || !venueStatus) return null;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          backgroundColor: venueStatus.isOpen ? 'success.50' : 'error.50',
          border: '1px solid',
          borderColor: venueStatus.isOpen ? 'success.200' : 'error.200',
          borderRadius: 2,
          minWidth: 200,
          maxWidth: 280,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Store sx={{ fontSize: 16, color: venueStatus.isOpen ? 'success.main' : 'error.main' }} />
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {venueStatus.venueName}
            </Typography>
          </Box>
          <Chip
            icon={venueStatus.isOpen ? <CheckCircle /> : <Cancel />}
            label={venueStatus.isOpen ? 'OPEN' : 'CLOSED'}
            size="small"
            color={venueStatus.isOpen ? 'success' : 'error'}
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={venueStatus.isOpen}
              onChange={handleToggleVenueOpen}
              disabled={statusLoading || !venueStatus.isActive}
              color="success"
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {statusLoading && <CircularProgress size={10} />}
              <Typography variant="caption" fontWeight={500}>
                {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
              </Typography>
            </Box>
          }
          sx={{ m: 0, alignItems: 'center' }}
        />
      </Paper>
    );
  };

  const renderUserActions = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationCenter />
          <Button
            color="inherit"
            onClick={() => navigate(isAdminLevel(user.role) ? '/admin' : '/profile')}
            startIcon={
              dinoAvatar ? (
                <Avatar 
                  src={dinoAvatar} 
                  sx={{ 
                    width: { xs: 20, sm: 24 }, 
                    height: { xs: 20, sm: 24 },
                    border: '1px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  🦕
                </Avatar>
              ) : (
                <AccountCircle sx={{ fontSize: { xs: 20, sm: 24 } }} />
              )
            }
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 500,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              minHeight: { xs: 36, sm: 40 },
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {getUserFirstName(user) || user.email}
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            sx={{
              color: 'error.main',
              textTransform: 'none',
              fontWeight: 500,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              minHeight: { xs: 36, sm: 40 },
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
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
          startIcon={<PersonAdd sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          sx={{
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 500,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            minHeight: { xs: 36, sm: 40 },
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' },
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
          startIcon={<Login sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            minHeight: { xs: 36, sm: 40 },
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' },
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
      <AppBar
        position="fixed"
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
          zIndex: 1200,
          top: 0,
          left: 0,
          right: 0,
          boxShadow: isAdminRoute ? 'none' : undefined,
        }}
      >
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Toolbar sx={{ px: 0, minHeight: { xs: 56, sm: 64, md: 70 } }}>
              {/* Logo and Title */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexGrow: 1,
                  cursor: 'pointer',
                  gap: { xs: 1, sm: 1.5 },
                  minWidth: 0,
                  '&:hover': {
                    opacity: 0.8,
                  },
                  transition: 'opacity 0.3s ease',
                }}
                onClick={() => {
                  if (user) {
                    // Redirect all logged-in users to dashboard page
                    navigate('/admin');
                  } else {
                    // Redirect non-logged-in users to home page
                    navigate('/');
                  }
                }}
              >
                <DinoLogo size={isMobile ? 35 : 45} animated={true} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                      color: 'text.primary',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getPageTitle()}
                  </Typography>
                  {!isMobile && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        display: 'block',
                        lineHeight: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {COMPANY_INFO.tagline}
                    </Typography>
                  )}
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
                      minWidth: 44,
                      minHeight: 44,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&:active': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    }}
                  >
                    <MenuIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>

      {/* Mobile Menu - Only for non-admin routes */}
      {!isAdminRoute && (
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
      )}
    </>
  );
};

export default AppHeader;