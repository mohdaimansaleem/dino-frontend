import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  ErrorOutline,
  Home,
  Refresh,
  ArrowBack,
  BugReport,
  Wifi,
  Security,
  Block,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  error?: Error | string;
  errorCode?: number | string;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  className?: string;
}

interface ErrorConfig {
  icon: React.ReactElement;
  title: string;
  message: string;
  color: 'error' | 'warning' | 'info';
  suggestions: string[];
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  errorCode,
  title,
  message,
  showRetry = true,
  showGoHome = true,
  showGoBack = true,
  onRetry,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Default to false for authentication state to avoid hook dependency issues
  const isAuthenticated = false;

  // Determine error type and configuration
  const getErrorConfig = (): ErrorConfig => {
    const errorString = typeof error === 'string' ? error : error?.message || '';
    const code = errorCode?.toString() || '';

    // Network/Connection errors
    if (errorString.includes('Network') || errorString.includes('fetch') || code === 'NETWORK_ERROR') {
      return {
        icon: <Wifi sx={{ fontSize: { xs: 48, md: 64 }, color: 'warning.main' }} />,
        title: 'Connection Problem',
        message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
        color: 'warning',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ]
      };
    }

    // Authentication/Permission errors
    if (code === '401' || code === '403' || errorString.includes('permission') || errorString.includes('unauthorized')) {
      return {
        icon: <Security sx={{ fontSize: { xs: 48, md: 64 }, color: 'error.main' }} />,
        title: 'Access Denied',
        message: 'You don\'t have permission to access this page or your session has expired.',
        color: 'error',
        suggestions: [
          'Try logging in again',
          'Contact your administrator for access',
          'Check if you have the required permissions'
        ]
      };
    }

    // Not Found errors
    if (code === '404' || errorString.includes('Not Found') || errorString.includes('not found')) {
      return {
        icon: <Block sx={{ fontSize: { xs: 48, md: 64 }, color: 'info.main' }} />,
        title: 'Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist or has been moved.',
        color: 'info',
        suggestions: [
          'Check the URL for typos',
          'Go back to the previous page',
          'Visit our homepage to find what you need'
        ]
      };
    }

    // Server errors
    if (code === '500' || code === '502' || code === '503' || errorString.includes('server')) {
      return {
        icon: <BugReport sx={{ fontSize: { xs: 48, md: 64 }, color: 'error.main' }} />,
        title: 'Server Error',
        message: 'Something went wrong on our end. Our team has been notified and is working to fix it.',
        color: 'error',
        suggestions: [
          'Try again in a few minutes',
          'Clear your browser cache',
          'Contact support if the issue continues'
        ]
      };
    }

    // Component loading errors
    if (errorString.includes('Loading chunk') || errorString.includes('ChunkLoadError')) {
      return {
        icon: <Refresh sx={{ fontSize: { xs: 48, md: 64 }, color: 'warning.main' }} />,
        title: 'Loading Error',
        message: 'Failed to load the page content. This usually happens after an app update.',
        color: 'warning',
        suggestions: [
          'Refresh the page',
          'Clear your browser cache',
          'Try again in a few moments'
        ]
      };
    }

    // Generic error
    return {
      icon: <ErrorOutline sx={{ fontSize: { xs: 48, md: 64 }, color: 'error.main' }} />,
      title: title || 'Something Went Wrong',
      message: message || 'An unexpected error occurred. Please try again after some time.',
      color: 'error',
      suggestions: [
        'Refresh the page and try again',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    };
  };

  const errorConfig = getErrorConfig();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  return (
    <Container 
      maxWidth="md" 
      className={className}
      sx={{ 
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 3 },
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card 
        sx={{ 
          width: '100%',
          maxWidth: 600,
          borderRadius: 3,
          boxShadow: theme.shadows[4],
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Error Icon */}
            <Box sx={{ mb: 3 }}>
              {errorConfig.icon}
            </Box>

            {/* Error Code */}
            {errorCode && (
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  mb: 1
                }}
              >
                Error {errorCode}
              </Typography>
            )}

            {/* Error Title */}
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              fontWeight="600"
              color="text.primary"
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              {errorConfig.title}
            </Typography>

            {/* Error Message */}
            <Typography 
              variant="body1"
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', md: '1rem' },
                lineHeight: 1.6,
                maxWidth: 480,
                mx: 'auto'
              }}
            >
              {errorConfig.message}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Suggestions */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              What you can try:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {errorConfig.suggestions.map((suggestion, index) => (
                <Typography 
                  key={index}
                  component="li" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  {suggestion}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {showRetry && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetry}
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: { xs: 1.5, sm: 1.25 }
                }}
              >
                Try Again
              </Button>
            )}

            {showGoBack && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: { xs: 1.5, sm: 1.25 },
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50'
                  }
                }}
              >
                Go Back
              </Button>
            )}

            {showGoHome && (
              <Button
                variant="text"
                startIcon={<Home />}
                onClick={handleGoHome}
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: { xs: 1.5, sm: 1.25 },
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                {isAuthenticated ? 'Dashboard' : 'Home'}
              </Button>
            )}
          </Stack>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                Debug Info: {typeof error === 'string' ? error : error.message}
              </Typography>
              {typeof error !== 'string' && error.stack && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: 'monospace',
                    display: 'block',
                    mt: 1,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.7rem'
                  }}
                >
                  {error.stack}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ErrorPage;