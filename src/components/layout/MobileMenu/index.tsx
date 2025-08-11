import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import {
  Close,
  AccountCircle,
  ExitToApp,
  Login,
  PersonAdd,
  Dashboard,
} from '@mui/icons-material';
import DinoLogo from '../../DinoLogo';
import { getUserFirstName } from '../../../utils/userUtils';
import { ROLE_NAMES, isAdminLevel } from '../../../constants/roles';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  homeNavItems: Array<{
    label: string;
    id: string;
    icon: React.ReactNode;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  isHomePage: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  onClose,
  homeNavItems,
  activeSection,
  onSectionClick,
  user,
  onLogout,
  onNavigate,
  isHomePage,
}) => {
  const [dinoAvatar, setDinoAvatar] = useState<string>('');

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
    window.addEventListener('dinoAvatarUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dinoAvatarUpdated', handleStorageChange);
    };
  }, []);

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    onClose();
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1300,
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 320 },
          maxWidth: 320,
          backgroundColor: 'background.paper',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
          marginTop: { xs: '56px', sm: '64px', md: '70px' },
          height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)', md: 'calc(100vh - 70px)' },
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '& .MuiBackdrop-root': {
          marginTop: { xs: '56px', sm: '64px', md: '70px' },
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DinoLogo size={35} animated={false} />
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Dino E-Menu
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Digital Menu Revolution
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* User Section */}
        {user && (
          <Paper
            elevation={0}
            sx={{
              m: 2,
              p: 2,
              backgroundColor: 'rgba(25, 118, 210, 0.05)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={dinoAvatar || undefined}
                sx={{
                  backgroundColor: dinoAvatar ? 'transparent' : 'primary.main',
                  width: 40,
                  height: 40,
                  border: dinoAvatar ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                {dinoAvatar ? '🦕' : <AccountCircle />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {getUserFirstName(user) || user.email}
                </Typography>
                <Chip
                  label={user.role || 'User'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Dashboard sx={{ fontSize: 18 }} />}
                onClick={() => handleNavigate(isAdminLevel(user.role) ? '/admin' : '/profile')}
                sx={{ 
                  flex: 1, 
                  textTransform: 'none',
                  minHeight: 36,
                  fontSize: '0.875rem',
                  '&:active': {
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
                onClick={onLogout}
                sx={{ 
                  flex: 1, 
                  textTransform: 'none',
                  minHeight: 36,
                  fontSize: '0.875rem',
                  '&:active': {
                    backgroundColor: 'error.50',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        )}

        {/* Navigation Items */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isHomePage && (
            <>
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Navigation
              </Typography>
              <List sx={{ px: 2 }}>
                {homeNavItems.map((item) => (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleSectionClick(item.id)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 48,
                        backgroundColor: activeSection === item.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                        '&:active': {
                          backgroundColor: 'rgba(25, 118, 210, 0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: activeSection === item.id ? 'primary.main' : 'text.secondary',
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: activeSection === item.id ? 600 : 400,
                          color: activeSection === item.id ? 'primary.main' : 'text.primary',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ mx: 2, my: 2 }} />
            </>
          )}

          {/* Quick Actions */}
          <Typography
            variant="overline"
            sx={{
              px: 3,
              py: 1,
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Quick Actions
          </Typography>
          <List sx={{ px: 2 }}>
            {!user && (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigate('/register')}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&:active': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                      <PersonAdd />
                    </ListItemIcon>
                    <ListItemText
                      primary="Create Account"
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigate('/login')}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                      },
                      '&:active': {
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                      <Login />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sign In"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: 'primary.main',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', display: 'block' }}
          >
            © 2024 Dino E-Menu. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileMenu;