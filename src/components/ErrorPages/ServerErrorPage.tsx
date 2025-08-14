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
} from '@mui/material';
import {
  BugReport,
  Home,
  Refresh,
  ArrowBack,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ServerErrorPageProps {
  errorCode?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  errorCode = '500',
  message = 'Something went wrong on our end. Our team has been notified and is working to fix it.',
  onRetry,
  showRetry = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [retrying, setRetrying] = React.useState(false);

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

  const handleContactSupport = () => {
    navigate('/contact');
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
              backgroundColor: 'error.50',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'error.main'
              }
            }} 
          />
        )}
        
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Error Icon */}
            <Box sx={{ mb: 3 }}>
              <BugReport sx={{ fontSize: { xs: 48, md: 64 }, color: 'error.main' }} />
            </Box>

            {/* Error Code */}
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

            {/* Error Title */}
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              fontWeight="600"
              color="error.main"
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              Server Error
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
              {message}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* What happened section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              What happened?
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.8rem', md: '0.875rem' }
              }}
            >
              Our servers encountered an unexpected issue while processing your request. 
              This is usually temporary and resolves quickly.
            </Typography>
            
            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              color="text.primary"
              gutterBottom
              sx={{ mb: 1, mt: 2 }}
            >
              What you can do:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Wait a moment and try again
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Check if the issue persists after refreshing
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                Contact our support team if the problem continues
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
                disabled={retrying}
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
              startIcon={<Support />}
              onClick={handleContactSupport}
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
              Contact Support
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default ServerErrorPage;