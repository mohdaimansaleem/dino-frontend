import React from 'react';
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
        '& .MuiDrawer-paper': {
          width: 320,
          backgroundColor: 'background.paper',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
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
                sx={{
                  backgroundColor: 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                <AccountCircle />
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
                startIcon={<Dashboard />}
                onClick={() => handleNavigate(user.role === 'admin' ? '/admin' : '/profile')}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                Dashboard
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={onLogout}
                sx={{ flex: 1, textTransform: 'none' }}
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
                        backgroundColor: activeSection === item.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
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