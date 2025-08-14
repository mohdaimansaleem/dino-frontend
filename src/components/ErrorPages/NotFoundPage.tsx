import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  Explore,
  StorefrontOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showSuggestions?: boolean;
}

// Custom 404 Shop Avatar Component
const Shop404Avatar: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        mb: 3,
      }}
    >
      {/* Main Shop Avatar */}
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: 'primary.main',
          border: '4px solid',
          borderColor: 'background.paper',
          boxShadow: 4,
          position: 'relative',
          animation: 'shopBounce 3s ease-in-out infinite',
          '@keyframes shopBounce': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-5px) scale(1.05)' },
          },
        }}
      >
        {/* Shop Icon */}
        <StorefrontOutlined 
          sx={{ 
            fontSize: size * 0.5,
            color: 'white',
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
          }} 
        />
        
        {/* 404 Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            backgroundColor: 'error.main',
            color: 'white',
            borderRadius: '50%',
            width: size * 0.3,
            height: size * 0.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.08,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            border: '2px solid white',
            boxShadow: 2,
            animation: 'badgePulse 2s ease-in-out infinite',
            '@keyframes badgePulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          404
        </Box>
      </Avatar>

      {/* Floating question marks */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -5,
          width: 24,
          height: 24,
          backgroundColor: 'error.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': {
              transform: 'translateY(0)',
            },
            '40%': {
              transform: 'translateY(-10px)',
            },
            '60%': {
              transform: 'translateY(-5px)',
            },
          },
        }}
      >
        ?
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: -10,
          width: 20,
          height: 20,
          backgroundColor: 'warning.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'bounce 2s infinite 0.5s',
        }}
      >
        ?
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: -5,
          right: 15,
          width: 18,
          height: 18,
          backgroundColor: 'info.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          animation: 'bounce 2s infinite 1s',
        }}
      >
        ?
      </Box>
    </Box>
  );
};

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = 'Page Not Found',
  message = 'The page you\'re looking for doesn\'t exist or has been moved.',
  showSuggestions = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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

  const handleExplore = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Get suggested pages based on current path
  const getSuggestions = () => {
    const path = location.pathname.toLowerCase();
    const suggestions = [];

    if (isAuthenticated) {
      if (path.includes('admin')) {
        suggestions.push(
          { label: 'Dashboard', path: '/admin' },
          { label: 'Orders', path: '/admin/orders' },
          { label: 'Menu', path: '/admin/menu' },
          { label: 'Settings', path: '/admin/settings' }
        );
      } else {
        suggestions.push(
          { label: 'Admin Dashboard', path: '/admin' },
          { label: 'Profile', path: '/profile' }
        );
      }
    } else {
      suggestions.push(
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
        { label: 'Contact', path: '/contact' }
      );
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = getSuggestions();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: { xs: 3, md: 4 },
        py: { xs: 4, md: 6 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      {/* Floating Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: 60, md: 80 },
          height: { xs: 60, md: 80 },
          borderRadius: '50%',
          backgroundColor: 'primary.100',
          opacity: 0.4,
          animation: 'float1 8s ease-in-out infinite',
          '@keyframes float1': {
            '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
            '33%': { transform: 'translateY(-30px) translateX(10px)' },
            '66%': { transform: 'translateY(-10px) translateX(-15px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          right: '8%',
          width: { xs: 40, md: 60 },
          height: { xs: 40, md: 60 },
          borderRadius: '50%',
          backgroundColor: 'secondary.100',
          opacity: 0.4,
          animation: 'float2 6s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
            '50%': { transform: 'translateY(-25px) translateX(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: { xs: 30, md: 45 },
          height: { xs: 30, md: 45 },
          borderRadius: '50%',
          backgroundColor: 'info.100',
          opacity: 0.3,
          animation: 'float3 10s ease-in-out infinite',
          '@keyframes float3': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '25%': { transform: 'translateY(-15px) rotate(90deg)' },
            '50%': { transform: 'translateY(-30px) rotate(180deg)' },
            '75%': { transform: 'translateY(-15px) rotate(270deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: { xs: 50, md: 70 },
          height: { xs: 50, md: 70 },
          borderRadius: '50%',
          backgroundColor: 'warning.100',
          opacity: 0.3,
          animation: 'float4 7s ease-in-out infinite',
          '@keyframes float4': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-20px) scale(1.1)' },
          },
        }}
      />
      
      {/* Geometric Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: { xs: 25, md: 35 },
          height: { xs: 25, md: 35 },
          backgroundColor: 'error.100',
          opacity: 0.4,
          animation: 'rotate 15s linear infinite',
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '10%',
          width: 0,
          height: 0,
          borderLeft: { xs: '15px solid transparent', md: '20px solid transparent' },
          borderRight: { xs: '15px solid transparent', md: '20px solid transparent' },
          borderBottom: { xs: '25px solid', md: '35px solid' },
          borderBottomColor: 'success.200',
          opacity: 0.4,
          animation: 'triangleFloat 9s ease-in-out infinite',
          '@keyframes triangleFloat': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '33%': { transform: 'translateY(-20px) rotate(120deg)' },
            '66%': { transform: 'translateY(-10px) rotate(240deg)' },
          },
        }}
      />
      
      {/* Dotted Pattern */}
      {Array.from({ length: 12 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: { xs: 4, md: 6 },
            height: { xs: 4, md: 6 },
            borderRadius: '50%',
            backgroundColor: 'text.disabled',
            opacity: 0.2,
            top: `${15 + (index * 6)}%`,
            left: `${5 + (index % 3) * 2}%`,
            animation: `dot${index % 3} ${3 + (index % 3)}s ease-in-out infinite`,
            '@keyframes dot0': {
              '0%, 100%': { opacity: 0.1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(1.5)' },
            },
            '@keyframes dot1': {
              '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
              '50%': { opacity: 0.5, transform: 'scale(1.3)' },
            },
            '@keyframes dot2': {
              '0%, 100%': { opacity: 0.15, transform: 'scale(1)' },
              '50%': { opacity: 0.3, transform: 'scale(1.2)' },
            },
          }}
        />
      ))}

      {/* Main Content */}
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Custom 404 Shop Avatar */}
        <Shop404Avatar size={isMobile ? 100 : 120} />

        {/* Error Code */}
        <Typography 
          variant="h1" 
          sx={{ 
            fontFamily: 'monospace',
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1,
            lineHeight: 1,
          }}
        >
          404
        </Typography>

        {/* Error Title */}
        <Typography 
          variant="h3"
          fontWeight="600"
          color="text.primary"
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            lineHeight: 1.2,
            mb: 2,
          }}
        >
          {title}
        </Typography>

        {/* Error Message */}
        <Typography 
          variant="h6"
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '1rem', md: '1.125rem' },
            lineHeight: 1.6,
            mb: 3,
            fontWeight: 400,
          }}
        >
          {message}
        </Typography>

        {/* Current URL display */}
        <Box 
          sx={{ 
            mb: 4,
            p: 2, 
            backgroundColor: 'grey.100', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.300',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              wordBreak: 'break-all',
            }}
          >
            Requested URL: {location.pathname}
          </Typography>
        </Box>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Try these instead:
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
            >
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => navigate(suggestion.path)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    borderColor: 'primary.200',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    }
                  }}
                >
                  {suggestion.label}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
            sx={{
              minWidth: 160,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
              }
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
            sx={{
              minWidth: 160,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Go Back
          </Button>

          <Button
            variant="text"
            startIcon={<Explore />}
            onClick={handleExplore}
            size="large"
            sx={{
              minWidth: 160,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Explore
          </Button>
        </Stack>

        {/* Help text */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mt: 4,
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}
        >
          If you believe this is an error, please contact our support team.
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFoundPage;