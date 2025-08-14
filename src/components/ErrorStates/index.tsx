import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  WifiOff,
  Restaurant,
  Search,
  Warning,
  Info,
} from '@mui/icons-material';

interface BaseErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  children?: React.ReactNode;
}

interface ErrorStateProps extends BaseErrorProps {
  type?: 'network' | 'notFound' | 'server' | 'unauthorized' | 'generic';
  icon?: React.ReactNode;
}

// Base Error Component
export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = true,
  icon,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff sx={{ fontSize: { xs: 48, sm: 64 }, color: 'error.main' }} />,
          title: 'Connection Problem',
          message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
          color: 'error.main' as const,
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if you\'re using one',
            'Contact support if the problem persists'
          ],
        };
      case 'notFound':
        return {
          icon: <Search sx={{ fontSize: { xs: 48, sm: 64 }, color: 'warning.main' }} />,
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist or may have been moved.',
          color: 'warning.main' as const,
          suggestions: [
            'Check the URL for typos',
            'Go back to the previous page',
            'Visit our home page',
            'Contact support if you believe this is an error'
          ],
        };
      case 'server':
        return {
          icon: <ErrorOutline sx={{ fontSize: { xs: 48, sm: 64 }, color: 'error.main' }} />,
          title: 'Server Temporarily Unavailable',
          message: 'Our servers are experiencing some issues right now. We\'re working to fix this as quickly as possible.',
          color: 'error.main' as const,
          suggestions: [
            'Try again in a few minutes',
            'Refresh the page',
            'Check our status page for updates',
            'Contact support if the issue continues'
          ],
        };
      case 'unauthorized':
        return {
          icon: <Warning sx={{ fontSize: { xs: 48, sm: 64 }, color: 'warning.main' }} />,
          title: 'Access Restricted',
          message: 'You don\'t have permission to view this content. Please contact your administrator if you believe this is an error.',
          color: 'warning.main' as const,
          suggestions: [
            'Make sure you\'re logged in',
            'Contact your administrator for access',
            'Check if you have the required permissions',
            'Try logging out and back in'
          ],
        };
      default:
        return {
          icon: <Info sx={{ fontSize: { xs: 48, sm: 64 }, color: 'info.main' }} />,
          title: 'Something Unexpected Happened',
          message: 'We encountered an unexpected issue. Don\'t worry, our team has been notified and is working on a fix.',
          color: 'info.main' as const,
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Try again in a few minutes',
            'Contact support if the problem continues'
          ],
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Container maxWidth="sm">
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: theme.shadows[4],
        }}
      >
        <Box sx={{ mb: 3 }}>
          {icon || config.icon}
        </Box>

        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight="600"
          gutterBottom
          color="text.primary"
        >
          {title || config.title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          {message || config.message}
        </Typography>

        {/* Suggestions */}
        {config.suggestions && (
          <Box sx={{ mb: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom color="text.primary">
              What you can try:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {config.suggestions.map((suggestion: string, index: number) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5, lineHeight: 1.4 }}
                >
                  {suggestion}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {children}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          {showRetry && onRetry && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              size="large"
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            >
              Try Again
            </Button>
          )}
          {showGoHome && onGoHome && (
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={onGoHome}
              size="large"
              sx={{ minWidth: { xs: '100%', sm: 140 } }}
            >
              Go Home
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

// Specific Error Components
export const NetworkError: React.FC<BaseErrorProps> = (props) => (
  <ErrorState type="network" {...props} />
);

export const NotFoundError: React.FC<BaseErrorProps> = (props) => (
  <ErrorState type="notFound" {...props} />
);

export const ServerError: React.FC<BaseErrorProps> = (props) => (
  <ErrorState type="server" {...props} />
);

export const UnauthorizedError: React.FC<BaseErrorProps> = (props) => (
  <ErrorState type="unauthorized" {...props} />
);

// Menu-specific Error Component
export const MenuError: React.FC<BaseErrorProps & { venueId?: string; tableId?: string }> = ({
  venueId,
  tableId,
  ...props
}) => (
  <ErrorState
    type="notFound"
    icon={<Restaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'warning.main' }} />}
    title="Menu Temporarily Unavailable"
    message="We're having trouble loading the menu right now. This could be because the restaurant is temporarily closed or updating their menu."
    {...props}
  >
    {venueId && tableId && (
      <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>What you can try:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Wait a few minutes and try again
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Ask your server for assistance
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Check if you scanned the correct QR code
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Table: {tableId} • Venue: {venueId}
        </Typography>
      </Alert>
    )}
  </ErrorState>
);

// Loading Error with Retry
export const LoadingError: React.FC<BaseErrorProps & { 
  isLoading?: boolean;
  loadingText?: string;
}> = ({ 
  isLoading = false, 
  loadingText = "Loading...",
  ...props 
}) => {
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <div className="animate-spin">
              <Refresh sx={{ fontSize: 48, color: 'primary.main' }} />
            </div>
          </Box>
          <Typography variant="h6" color="text.secondary">
            {loadingText}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return <ErrorState {...props} />;
};

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  icon,
  title = "No Data Found",
  message = "There's nothing to show here yet.",
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 8 },
        px: 3,
      }}
    >
      <Box sx={{ mb: 3 }}>
        {icon || <Search sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled' }} />}
      </Box>

      <Typography
        variant="h5"
        fontWeight="500"
        gutterBottom
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
      >
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          size="large"
          sx={{ px: 4 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;