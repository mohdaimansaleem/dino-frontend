import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  Tooltip,
  Divider,
  Collapse,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Assignment,
  Restaurant,
  TableRestaurant,
  People,
  Security,
  Settings,
  Business,
  Store,
  CheckCircle,
  Cancel,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../contexts/UserDataContext';
import { venueService } from '../../../services/venueService';
import PermissionService from '../../../services/permissionService';
import { PERMISSIONS } from '../../../types/auth';

import DinoLogo from '../../DinoLogo';
import { getUserFirstName } from '../../../utils/userUtils';
import './EnhancedSidebar.css';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission: string;
  roles: string[];
  badge?: string | number;
}

interface EnhancedSidebarProps {
  isTablet?: boolean;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ isTablet = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, hasPermission, isOperator } = useAuth();
  const { userData, refreshUserData } = useUserData();
  
  // Sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('sidebarStateChanged'));
  };

  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed;
  
  // Navigation items with enhanced design
  const allAdminNavItems: NavigationItem[] = [
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

  // Filter navigation items based on permissions
  const adminNavItems = allAdminNavItems.filter(item => {
    const backendRole = PermissionService.getBackendRole();
    const userRole = backendRole?.name || user?.role || 'unknown';
    
    if (userRole === 'superadmin') {
      return true;
    }
    
    if (item.roles && item.roles.length > 0) {
      const hasRequiredRole = item.roles.includes(userRole as string);
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    return hasPermission(item.permission as any);
  });

  // Get venue status for display
  const venueStatus = userData?.venue ? {
    isActive: userData.venue.is_active || false,
    isOpen: userData.venue.is_open || false,
    venueName: userData.venue.name || 'Current Venue'
  } : null;

  const sidebarWidth = showExpanded ? (isTablet ? 200 : 280) : 72;

  // Handle venue status toggle
  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;

    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      
      // Update venue status using the correct API call
      await venueService.updateVenue(userData.venue.id, { 
        status: newStatus ? 'active' : 'closed'
      });

      // Refresh user data to get updated venue status
      await refreshUserData();
    } catch (error) {
      console.error('Failed to update venue status:', error);
      // Show error message to user
      alert('Failed to update venue status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <Box
      className={`enhanced-sidebar sidebar-glass ${isCollapsed ? 'enhanced-sidebar-collapsed' : isTablet ? 'enhanced-sidebar-tablet' : 'enhanced-sidebar-expanded'}`}
      sx={{
        position: 'fixed',
        top: 70,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(24px)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 50%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1,
          height: '100%',
          background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: showExpanded ? 'space-between' : 'center',
        }}
      >
        {showExpanded && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              Dino Admin
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 500,
                display: 'block',
                lineHeight: 1,
              }}
            >
              Control Panel
            </Typography>
          </Box>
        )}
        
        {/* Expand/Collapse Button */}
        <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <Button
            onClick={toggleCollapsed}
            sx={{
              justifyContent: 'center',
              minWidth: showExpanded ? 48 : '100%',
              width: showExpanded ? 48 : '100%',
              height: 48,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.2),
                color: 'white',
                transform: 'translateX(2px)',
              },
              '&:active': {
                transform: 'translateX(1px)',
              },
              '& .MuiButton-startIcon': {
                mr: 0,
                color: 'inherit',
                fontSize: '1.25rem',
              },
            }}
            startIcon={isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          />
        </Tooltip>
      </Box>

      {/* User Info Section */}
      {user && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
            
            <Collapse in={showExpanded} orientation="horizontal">
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getUserFirstName(user) || user.email}
                </Typography>
                <Chip
                  label={(() => {
                    const backendRole = PermissionService.getBackendRole();
                    if (backendRole?.name) {
                      const roleDefinition = PermissionService.getRoleDefinition(backendRole.name);
                      return roleDefinition?.displayName || backendRole.name;
                    }
                    return user?.role || 'User';
                  })()}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    border: 'none',
                    mt: 0.5,
                  }}
                />
              </Box>
            </Collapse>
          </Box>
        </Box>
      )}

      {/* Venue Status */}
      {venueStatus && showExpanded && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            {/* Order Status */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Order Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                {venueStatus.isOpen ? (
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.1 }} />
                ) : (
                  <Cancel sx={{ fontSize: 16, color: 'error.main', mt: 0.1 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  }}
                >
                  {venueStatus.isOpen 
                    ? 'Currently accepting new orders from customers'
                    : 'Not accepting orders at the moment'
                  }
                </Typography>
              </Box>

              {/* Toggle Switch */}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {statusLoading && <CircularProgress size={12} />}
                    <Typography variant="caption" fontWeight={500}>
                      {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'center' }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Collapsed Venue Status Indicator */}
      {venueStatus && !showExpanded && (
        <Box
          sx={{
            p: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip 
            title={`${venueStatus.isOpen ? 'Accepting Orders' : 'Closed for Orders'} - Click to toggle`} 
            placement="right"
          >
            <IconButton
              onClick={handleToggleVenueOpen}
              disabled={statusLoading || !venueStatus.isActive}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.1),
                border: `2px solid ${alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.3)}`,
                '&:hover': {
                  backgroundColor: alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.2),
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {statusLoading ? (
                <CircularProgress size={16} />
              ) : venueStatus.isOpen ? (
                <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <Cancel sx={{ fontSize: 20, color: 'error.main' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 1.5,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.3),
            },
          },
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.7rem',
            mb: 1.5,
            display: showExpanded ? 'block' : 'none',
            px: 1,
          }}
        >
          Navigation
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip
                key={item.label}
                title={isCollapsed ? item.label : ''}
                placement="right"
                disableHoverListener={showExpanded}
              >
                <Button
                  onClick={() => navigate(item.path)}
                  fullWidth
                  sx={{
                    justifyContent: showExpanded ? 'flex-start' : 'center',
                    textAlign: 'left',
                    py: 1.5,
                    px: showExpanded ? 2 : 1,
                    borderRadius: 2,
                    minHeight: 48,
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isActive 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'transparent',
                    border: isActive 
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      borderColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2),
                      color: 'black',
                      transform: 'translateX(4px)',
                      '& .MuiButton-startIcon': {
                        color: 'black',
                      },
                    },
                    '&:active': {
                      transform: 'translateX(2px)',
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: 'primary.main',
                      borderRadius: '0 2px 2px 0',
                    } : {},
                    '& .MuiButton-startIcon': {
                      mr: showExpanded ? 1.5 : 0,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontSize: '1.25rem',
                      transition: 'color 0.2s ease',
                    },
                  }}
                  startIcon={item.icon}
                >
                  <Collapse in={showExpanded} orientation="horizontal">
                    <Typography
                      variant="inherit"
                      sx={{
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Collapse>
                </Button>
              </Tooltip>
            );
          })}
        </Box>
      </Box>




    </Box>
  );
};

export default EnhancedSidebar;