import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
  Avatar,
} from '@mui/material';
import { 
  Refresh,
  Restaurant,
  Dashboard,
  TableRestaurant,
  MenuBook,
  Assignment,
} from '@mui/icons-material';

// Table Loading Skeleton
export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card sx={{ 
      borderRadius: 3,
      boxShadow: theme.shadows[2],
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* Table Header Skeleton */}
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="text" width={100} height={24} />
            {!isMobile && <Skeleton variant="text" width={120} height={24} />}
            <Skeleton variant="text" width={60} height={24} />
          </Stack>
        </Box>

        {/* Table Rows Skeleton */}
        {Array.from({ length: rows }).map((_, index) => (
          <Box 
            key={index} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderBottom: index < rows - 1 ? '1px solid' : 'none',
              borderColor: 'divider'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Stack>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
              {!isMobile && <Skeleton variant="text" width={100} height={16} />}
              <Skeleton variant="circular" width={32} height={32} />
            </Stack>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Card Loading Skeleton
export const CardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index}
          sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          sx={{ mb: 1 }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={isMobile ? "80%" : "40%"} height={isMobile ? 32 : 40} />
            <Skeleton variant="text" width={isMobile ? "90%" : "60%"} height={20} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>
      </Box>

      {/* Content Skeleton */}
      <TableLoadingSkeleton rows={6} />
    </Box>
  );
};

// Inline Loading Spinner
export const InlineLoader: React.FC<{ 
  size?: number; 
  message?: string;
  color?: 'primary' | 'secondary' | 'inherit';
}> = ({ 
  size = 24, 
  message = 'Loading...', 
  color = 'primary' 
}) => {
  return (
    <Stack 
      direction="row" 
      spacing={2} 
      alignItems="center" 
      justifyContent="center"
      sx={{ py: 2 }}
    >
      <CircularProgress size={size} color={color} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Stack>
  );
};

// Full Page Loader
export const FullPageLoader: React.FC<{ 
  message?: string;
  showProgress?: boolean;
  progress?: number;
}> = ({ 
  message = 'Loading...', 
  showProgress = false,
  progress = 0
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant="h6" fontWeight="600" gutterBottom>
          {message}
        </Typography>
        {showProgress && (
          <Box sx={{ mt: 2, width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3
                }
              }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Retry Loading State
export const RetryLoader: React.FC<{
  onRetry: () => void;
  message?: string;
  retryText?: string;
  isRetrying?: boolean;
}> = ({
  onRetry,
  message = 'Failed to load data',
  retryText = 'Try Again',
  isRetrying = false
}) => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {isRetrying ? (
          <InlineLoader message="Retrying..." />
        ) : (
          <Box
            component="button"
            onClick={onRetry}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              backgroundColor: 'primary.main',
              color: 'white',
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            <Refresh fontSize="small" />
            {retryText}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({
  icon,
  title,
  description,
  action
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 3 } }}>
      {icon && (
        <Box sx={{ mb: 3 }}>
          {icon}
        </Box>
      )}
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        fontWeight="600"
        color="text.primary"
        gutterBottom
      >
        {title}
      </Typography>
      {description && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
        >
          {description}
        </Typography>
      )}
      {action && (
        <Box sx={{ mt: 3 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

// Smart Loading Component that shows contextual loading states
interface SmartLoadingProps {
  type: 'menu' | 'dashboard' | 'orders' | 'tables' | 'users' | 'profile';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  type,
  message,
  showProgress = false,
  progress = 0,
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'menu':
        return {
          icon: <Restaurant sx={{ fontSize: 48, color: 'primary.main' }} />,
          defaultMessage: 'Loading delicious menu items...',
          skeleton: 'menu' as const,
        };
      case 'dashboard':
        return {
          icon: <Dashboard sx={{ fontSize: 48, color: 'primary.main' }} />,
          defaultMessage: 'Preparing your dashboard...',
          skeleton: 'dashboard' as const,
        };
      case 'orders':
        return {
          icon: <Assignment sx={{ fontSize: 48, color: 'primary.main' }} />,
          defaultMessage: 'Fetching latest orders...',
          skeleton: 'list' as const,
        };
      case 'tables':
        return {
          icon: <TableRestaurant sx={{ fontSize: 48, color: 'primary.main' }} />,
          defaultMessage: 'Loading table information...',
          skeleton: 'table' as const,
        };
      case 'users':
        return {
          icon: <MenuBook sx={{ fontSize: 48, color: 'primary.main' }} />,
          defaultMessage: 'Loading user data...',
          skeleton: 'list' as const,
        };
      case 'profile':
        return {
          icon: <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }} />,
          defaultMessage: 'Loading profile information...',
          skeleton: 'profile' as const,
        };
      default:
        return {
          icon: <CircularProgress size={48} />,
          defaultMessage: 'Loading...',
          skeleton: 'card' as const,
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          gap: 2,
        }}
      >
        {config.icon}
        <Typography variant="h6" color="text.secondary" textAlign="center">
          {message || config.defaultMessage}
        </Typography>
        {showProgress && (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Use existing skeleton components based on type */}
      {config.skeleton === 'menu' && <CardLoadingSkeleton count={6} />}
      {config.skeleton === 'dashboard' && <PageLoadingSkeleton />}
      {config.skeleton === 'list' && <TableLoadingSkeleton />}
      {config.skeleton === 'table' && <TableLoadingSkeleton />}
      {config.skeleton === 'profile' && <CardLoadingSkeleton count={1} />}
      {config.skeleton === 'card' && <CardLoadingSkeleton />}
    </Box>
  );
};

// Enhanced Full Page Loader with better UX
export const EnhancedFullPageLoader: React.FC<{ 
  message?: string;
  showProgress?: boolean;
  progress?: number;
  type?: 'menu' | 'dashboard' | 'orders' | 'tables' | 'users' | 'profile';
}> = ({ 
  message = 'Loading...', 
  showProgress = false,
  progress = 0,
  type
}) => {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            p: 4,
            maxWidth: 400,
            mx: 2,
            textAlign: 'center',
          }}
        >
          {type ? (
            <SmartLoading 
              type={type} 
              message={message} 
              showProgress={showProgress} 
              progress={progress} 
            />
          ) : (
            <Box>
              <CircularProgress size={48} sx={{ mb: 3 }} />
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {message}
              </Typography>
              {showProgress && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {Math.round(progress)}% complete
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

const LoadingStates = {
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  PageLoadingSkeleton,
  InlineLoader,
  FullPageLoader,
  RetryLoader,
  EmptyState,
  SmartLoading,
  EnhancedFullPageLoader,
};

export default LoadingStates;