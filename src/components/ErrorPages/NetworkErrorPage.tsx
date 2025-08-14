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
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  WifiOff,
  Refresh,
  ArrowBack,
  Home,
  SignalWifiStatusbarConnectedNoInternet4,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NetworkErrorPageProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  isOffline?: boolean;
}

const NetworkErrorPage: React.FC<NetworkErrorPageProps> = ({
  message = 'Unable to connect to our servers. Please check your internet connection and try again.',
  onRetry,
  showRetry = true,
  isOffline = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [retrying, setRetrying] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setConnectionStatus(true);
    const handleOffline = () => setConnectionStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      setRetrying(true);
      try {
        await onRetry();
      } finally {
        setRetrying(false);
      }
    } else {
      setRetrying(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  const getConnectionIcon = () => {
    if (!connectionStatus || isOffline) {
      return <WifiOff sx={{ fontSize: { xs: 48, md: 64 }, color: 'error.main' }} />;
    }
    return <SignalWifiStatusbarConnectedNoInternet4 sx={{ fontSize: { xs: 48, md: 64 }, color: 'warning.main' }} />;
  };

  const getConnectionMessage = () => {
    if (!connectionStatus || isOffline) {
      return 'You appear to be offline. Please check your internet connection.';
    }
    return message;
  };

  return (
    <Container 
      maxWidth="md" 
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
        {retrying && (
          <LinearProgress 
            sx={{ 
              height: 3,
              backgroundColor: 'warning.50',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'warning.main'
              }
            }} 
          />
        )}
        
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Connection Status */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label={connectionStatus ? 'Connected' : 'Offline'}
                color={connectionStatus ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Error Icon */}
            <Box sx={{ mb: 3 }}>
              {getConnectionIcon()}
            </Box>

            {/* Error Title */}
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              fontWeight="600"
              color={connectionStatus ? 'warning.main' : 'error.main'}
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              {connectionStatus ? 'Connection Problem' : 'No Internet Connection'}
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
              {getConnectionMessage()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Troubleshooting section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Troubleshooting steps:
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Check your internet connection
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Try switching between WiFi and mobile data
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Restart your router or modem
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Check if other websites are working
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Contact your internet service provider if the problem persists
              </Typography>
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
                disabled={retrying || (!connectionStatus && !isOffline)}
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
                {retrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}

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
          </Stack>

          {/* Auto-retry notice */}
          {connectionStatus && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  fontStyle: 'italic'
                }}
              >
                The page will automatically retry when your connection is restored
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default NetworkErrorPage;