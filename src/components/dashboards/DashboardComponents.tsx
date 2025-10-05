/**
 * Standardized Dashboard Components
 * 
 * Common reusable components for dashboard functionality
 * Following project standards for consistency and maintainability
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Standardized Stats Card Component
interface StatsCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactElement;
  description: string;
  progress?: number;
  isSmallScreen?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  icon,
  description,
  progress,
  isSmallScreen = false,
}) => {
  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2,
        backgroundColor: `${color}08`,
        border: `1px solid ${color}33`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}33`,
          backgroundColor: `${color}12`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Icon */}
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 2,
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { 
            fontSize: isSmallScreen ? 'medium' : 'large' 
          })}
        </Box>
        
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant={isSmallScreen ? "h6" : "h4"} 
            fontWeight="700" 
            color="text.primary"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '2rem' },
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            fontWeight="600"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {label}
          </Typography>
          {description && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                lineHeight: 1.2,
              }}
            >
              {description}
            </Typography>
          )}
          {progress !== undefined && (
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.3)',
                mt: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: color
                }
              }}
            />
          )}
        </Box>
      </Stack>
    </Card>
  );
};

// Standardized Chart Card Component
interface ChartCardProps {
  title: string;
  icon: React.ReactElement;
  loading?: boolean;
  children: React.ReactNode;
  height?: string | number;
  tourId?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  icon,
  loading = false,
  children,
  height = '400px',
  tourId,
}) => {
  return (
    <Card 
      sx={{ 
        height,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }} 
      data-tour={tourId}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {React.cloneElement(icon, {
              sx: { 
                fontSize: '1.5rem',
                color: 'primary.main'
              }
            })}
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {title}
            </Typography>
          </Box>
          {loading && <Box>Loading...</Box>}
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

// Standardized Section Header Component
interface SectionHeaderProps {
  title: string;
  icon: React.ReactElement;
  action?: React.ReactNode;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  action,
  subtitle,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {React.cloneElement(icon, {
          sx: { 
            fontSize: '1.5rem',
            color: 'primary.main'
          }
        })}
        <Box>
          <Typography 
            variant="h6"
            sx={{ 
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action}
    </Box>
  );
};

// Standardized Empty State Component
interface EmptyStateProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2,
      py: 4,
      textAlign: 'center'
    }}>
      {React.cloneElement(icon, { 
        sx: { fontSize: 48, color: 'text.disabled' } 
      })}
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
};

// Standardized Dashboard Hero Section
interface DashboardHeroProps {
  title: string;
  description: string;
  userName: string;
  badge: {
    icon: React.ReactElement;
    text: string;
  };
  actions?: React.ReactNode;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  title,
  description,
  userName,
  badge,
  actions,
}) => {
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
      <Box sx={{ position: 'relative', zIndex: 2 }}>
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
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
                {title}
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
              Welcome back, {userName}! {description}
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
              {React.cloneElement(badge.icon, {
                sx: { fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }
              })}
              <Typography variant="body2" fontWeight="500" color="text.primary">
                {badge.text}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {actions && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Status color helpers
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'preparing': return 'primary';
    case 'ready': return 'success';
    case 'served': return 'success';
    default: return 'default';
  }
};

export const getTableStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available': return '#4CAF50';
    case 'occupied': return '#F44336';
    case 'reserved': return '#FF9800';
    case 'maintenance': return '#9E9E9E';
    default: return '#9E9E9E';
  }
};

export const getOrderStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return '#FFF176';
    case 'confirmed': return '#FFCC02';
    case 'preparing': return '#81D4FA';
    case 'ready': return '#C8E6C9';
    case 'served': return '#E1BEE7';
    case 'delivered': return '#A5D6A7';
    default: return '#F5F5F5';
  }
};