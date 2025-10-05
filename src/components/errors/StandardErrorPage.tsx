/**
 * Standardized Error Page Component
 * 
 * A consistent error page component that provides a unified look and feel
 * for all error states in the application.
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  ErrorOutline as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

interface StandardErrorPageProps {
  /**
   * Error type determines the icon and default styling
   */
  type?: 'error' | 'warning' | 'info' | 'not-found' | 'network' | 'server';
  
  /**
   * Error title
   */
  title: string;
  
  /**
   * Error description
   */
  description: string;
  
  /**
   * Error code (e.g., 404, 500)
   */
  code?: string | number;
  
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  
  /**
   * Whether to show default navigation actions
   */
  showDefaultActions?: boolean;
  
  /**
   * Custom actions to display
   */
  customActions?: React.ReactNode;
  
  /**
   * Whether to show the error illustration
   */
  showIllustration?: boolean;
  
  /**
   * Custom illustration component
   */
  illustration?: React.ReactNode;
  
  /**
   * Additional content to display below the description
   */
  children?: React.ReactNode;
  
  /**
   * Whether to center the content
   */
  centered?: boolean;
  
  /**
   * Maximum width of the error page content
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const StandardErrorPage: React.FC<StandardErrorPageProps> = ({
  type = 'error',
  title,
  description,
  code,
  icon,
  primaryAction,
  secondaryAction,
  showDefaultActions = true,
  customActions,
  showIllustration = true,
  illustration,
  children,
  centered = true,
  maxWidth = 'sm',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const animationsEnabled = useFeatureFlag('animatedComponents');

  // Get type-specific styling
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
        };
      case 'info':
        return {
          color: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
        };
      case 'not-found':
        return {
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        };
      case 'network':
        return {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
        };
      case 'server':
        return {
          color: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
        };
      default: // 'error'
        return {
          color: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
        };
    }
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningIcon sx={{ fontSize: 80 }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 80 }} />;
      case 'not-found':
      case 'network':
      case 'server':
      case 'error':
      default:
        return <ErrorIcon sx={{ fontSize: 80 }} />;
    }
  };

  // Default actions
  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);
  const handleRefresh = () => window.location.reload();

  const typeStyles = getTypeStyles();
  const displayIcon = icon || getDefaultIcon();

  // Default illustration (simple geometric shape)
  const defaultIllustration = (
    <Box
      sx={{
        width: 200,
        height: 200,
        borderRadius: '50%',
        backgroundColor: typeStyles.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, transparent 30%, ${alpha(typeStyles.color, 0.1)} 50%, transparent 70%)`,
          animation: animationsEnabled ? 'pulse 2s ease-in-out infinite' : 'none',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      }}
    >
      <Box sx={{ color: typeStyles.color, zIndex: 1 }}>
        {displayIcon}
      </Box>
    </Box>
  );

  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start',
          justifyContent: 'center',
          textAlign: centered ? 'center' : 'left',
          py: 4,
        }}
      >
        {/* Error Code */}
        {code && (
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
              fontWeight: 900,
              color: alpha(typeStyles.color, 0.3),
              lineHeight: 0.8,
              mb: 2,
              userSelect: 'none',
            }}
          >
            {code}
          </Typography>
        )}

        {/* Illustration */}
        {showIllustration && (
          <Box sx={{ mb: 3 }}>
            {illustration || defaultIllustration}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 4,
            maxWidth: 600,
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          {description}
        </Typography>

        {/* Additional Content */}
        {children && (
          <Box sx={{ mb: 4, maxWidth: 600 }}>
            {children}
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: centered ? 'center' : 'flex-start',
          }}
        >
          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'contained'}
              onClick={primaryAction.onClick}
              size="large"
              sx={{
                minWidth: 140,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              {primaryAction.label}
            </Button>
          )}

          {/* Secondary Action */}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outlined'}
              onClick={secondaryAction.onClick}
              size="large"
              sx={{
                minWidth: 140,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              {secondaryAction.label}
            </Button>
          )}

          {/* Default Actions */}
          {showDefaultActions && !primaryAction && !secondaryAction && (
            <>
              <Button
                variant="contained"
                onClick={handleGoHome}
                startIcon={<HomeIcon />}
                size="large"
                sx={{
                  minWidth: 140,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Go Home
              </Button>

              <Button
                variant="outlined"
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon />}
                size="large"
                sx={{
                  minWidth: 140,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Go Back
              </Button>

              {(type === 'network' || type === 'server') && (
                <Button
                  variant="text"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                  size="large"
                  sx={{
                    minWidth: 140,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Retry
                </Button>
              )}
            </>
          )}

          {/* Custom Actions */}
          {customActions}
        </Box>
      </Box>
    </Container>
  );
};

// Specialized error page components

/**
 * 404 Not Found Page
 */
export const NotFoundErrorPage: React.FC<{
  customTitle?: string;
  customDescription?: string;
  showDefaultActions?: boolean;
}> = ({
  customTitle = "Page Not Found",
  customDescription = "The page you're looking for doesn't exist or has been moved.",
  showDefaultActions = true,
}) => (
  <StandardErrorPage
    type="not-found"
    code="404"
    title={customTitle}
    description={customDescription}
    showDefaultActions={showDefaultActions}
  />
);

/**
 * 500 Server Error Page
 */
export const ServerErrorPage: React.FC<{
  customTitle?: string;
  customDescription?: string;
  onRetry?: () => void;
}> = ({
  customTitle = "Server Error",
  customDescription = "Something went wrong on our end. Please try again later.",
  onRetry,
}) => (
  <StandardErrorPage
    type="server"
    code="500"
    title={customTitle}
    description={customDescription}
    primaryAction={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
    } : undefined}
    showDefaultActions={!onRetry}
  />
);

/**
 * Network Error Page
 */
export const NetworkErrorPage: React.FC<{
  customTitle?: string;
  customDescription?: string;
  onRetry?: () => void;
}> = ({
  customTitle = "Connection Problem",
  customDescription = "Please check your internet connection and try again.",
  onRetry,
}) => (
  <StandardErrorPage
    type="network"
    title={customTitle}
    description={customDescription}
    primaryAction={onRetry ? {
      label: "Retry",
      onClick: onRetry,
    } : undefined}
    showDefaultActions={!onRetry}
  />
);

/**
 * Access Denied Page
 */
export const AccessDeniedErrorPage: React.FC<{
  customTitle?: string;
  customDescription?: string;
}> = ({
  customTitle = "Access Denied",
  customDescription = "You don't have permission to access this page.",
}) => (
  <StandardErrorPage
    type="warning"
    code="403"
    title={customTitle}
    description={customDescription}
    showDefaultActions={true}
  />
);

export default StandardErrorPage;