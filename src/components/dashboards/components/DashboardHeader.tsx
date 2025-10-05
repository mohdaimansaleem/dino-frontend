import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Container,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserFirstName } from '../../../utils/userUtils';
import AnimatedBackground from '../../ui/AnimatedBackground';
import { usePermissions } from '../../auth';
import PermissionService from '../../../services/auth';

interface DashboardHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  loading,
  refreshing,
  onRefresh,
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, isOperator } = usePermissions();

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    // Use the same role detection as control panel
    const backendRole = PermissionService.getBackendRole();
    const detectedRole = backendRole?.name || user?.role || 'unknown';
    
    if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
      return 'SuperAdmin Dashboard';
    } else if (detectedRole === 'admin') {
      return 'Admin Dashboard';
    } else if (detectedRole === 'operator') {
      return 'Operator Dashboard';
    }
    
    // Fallback to permission hooks
    if (isSuperAdmin()) return 'SuperAdmin Dashboard';
    if (isAdmin()) return 'Admin Dashboard';
    if (isOperator()) return 'Operator Dashboard';
    return 'Dashboard';
  };

  // Get dashboard description based on role
  const getDashboardDescription = () => {
    // Use the same role detection as control panel
    const backendRole = PermissionService.getBackendRole();
    const detectedRole = backendRole?.name || user?.role || 'unknown';
    
    if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
      return 'Here\'s your system-wide performance overview and analytics.';
    } else if (detectedRole === 'admin') {
      return 'Here\'s your comprehensive venue overview and analytics.';
    } else if (detectedRole === 'operator') {
      return 'Here\'s your order management and operations overview.';
    }
    
    // Fallback to permission hooks
    if (isSuperAdmin()) return 'Here\'s your system-wide performance overview and analytics.';
    if (isAdmin()) return 'Here\'s your comprehensive venue overview and analytics.';
    if (isOperator()) return 'Here\'s your order management and operations overview.';
    return 'Here\'s your dashboard overview.';
  };

  const getSubtitle = () => {
    // Use the same role detection as control panel
    const backendRole = PermissionService.getBackendRole();
    const detectedRole = backendRole?.name || user?.role || 'unknown';
    
    if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
      return 'System-wide Analytics & Management';
    } else if (detectedRole === 'admin') {
      return 'Real-time Analytics & Management';
    } else if (detectedRole === 'operator') {
      return 'Order Management & Operations';
    }
    
    // Fallback to permission hooks
    if (isSuperAdmin()) return 'System-wide Analytics & Management';
    if (isAdmin()) return 'Real-time Analytics & Management';
    return 'Order Management & Operations';
  };

  return (
    <Box
      sx={{
        backgroundColor: 'grey.100',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        color: 'text.primary',
        padding: 0,
        margin: 0,
        width: '100%',
      }}
    >
      <AnimatedBackground />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: { xs: 2, md: 3 },
            py: { xs: 3, sm: 4 },
            px: { xs: 3, sm: 4 },
          }}
        >
          {/* Header Content */}
          <Box sx={{ flex: 1 }} data-tour="dashboard-header">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DashboardIcon sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                {getDashboardTitle()}
              </Typography>
            </Box>
            
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 400,
                mb: 1,
                maxWidth: '500px',
                color: 'text.secondary',
              }}
            >
              Welcome back, {getUserFirstName(user)}! {getDashboardDescription()}
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Business sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
              <Typography variant="body2" fontWeight="500" color="text.primary">
                {getSubtitle()}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexDirection: { xs: 'row', sm: 'row' },
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={onRefresh}
              disabled={loading || refreshing}
              size="medium"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'text.secondary',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title={loading || refreshing ? 'Refreshing...' : 'Refresh dashboard'}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardHeader;