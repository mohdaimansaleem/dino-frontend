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
  Avatar,
  Chip,
} from '@mui/material';
import {
  RestaurantMenu,
  Schedule,
  Home,
  Refresh,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface VenueNotAcceptingOrdersPageProps {
  venueName?: string;
  venueStatus?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

const VenueNotAcceptingOrdersPage: React.FC<VenueNotAcceptingOrdersPageProps> = ({
  venueName = 'This venue',
  venueStatus,
  message = 'This venue is currently not accepting orders. Please try again later.',
  onRetry,
  showRetry = true,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'maintenance':
        return 'warning';
      case 'closed':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'maintenance':
        return 'Under Maintenance';
      case 'closed':
        return 'Closed';
      case 'inactive':
        return 'Temporarily Unavailable';
      default:
        return 'Not Available';
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
            {/* Venue Avatar */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                <RestaurantMenu sx={{ fontSize: 'inherit' }} />
              </Avatar>
            </Box>

            {/* Venue Status Chip */}
            {venueStatus && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={<Info />}
                  label={getStatusText(venueStatus)}
                  color={getStatusColor(venueStatus) as any}
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                />
              </Box>
            )}

            {/* Main Title */}
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
              {venueName} is Not Accepting Orders
            </Typography>

            {/* Message */}
            <Typography 
              variant="body1"
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', md: '1rem' },
                lineHeight: 1.6,
                maxWidth: 480,
                mx: 'auto',
                mb: 3
              }}
            >
              {message}
            </Typography>

            {/* Additional Info */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 4,
                p: 2,
                backgroundColor: 'info.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.200'
              }}
            >
              <Schedule color="info" sx={{ fontSize: '1.25rem' }} />
              <Typography 
                variant="body2" 
                color="info.main"
                fontWeight="500"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                We'll be back soon! Please check again later.
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
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  minWidth: { xs: 'auto', sm: 160 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: { xs: 1.5, sm: 1.25 }
                }}
              >
                Check Again
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={handleGoHome}
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
              sx={{
                minWidth: { xs: 'auto', sm: 160 },
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
              Go to Homepage
            </Button>
          </Stack>

          {/* Footer Note */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', md: '0.8rem' },
                fontStyle: 'italic'
              }}
            >
              Thank you for your patience and understanding.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default VenueNotAcceptingOrdersPage;