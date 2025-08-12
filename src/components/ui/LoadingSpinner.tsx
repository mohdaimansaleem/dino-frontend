import React from 'react';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Skeleton,
  LinearProgress
} from '@mui/material';

// Enhanced LoadingSpinner interface with professional variants
interface LoadingSpinnerProps {
  variant?: 'circular' | 'linear' | 'skeleton' | 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large' | number;
  color?: 'primary' | 'secondary' | 'inherit';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  professional?: boolean;
  thickness?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'circular',
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  professional = true,
  thickness = 4,
  className = '',
}) => {
  // Size configuration
  const sizeConfig = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const spinnerSize = typeof size === 'number' ? size : sizeConfig[size];

  // Professional styling
  const containerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
    }),
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1,
    }),
  };

  // Render different variants
  const renderSpinner = () => {
    switch (variant) {
      case 'circular':
        return (
          <CircularProgress
            size={spinnerSize}
            color={color}
            thickness={thickness}
            sx={{
              ...(professional && {
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }),
            }}
          />
        );

      case 'linear':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress
              color={color}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        );

      case 'skeleton':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Skeleton variant="rectangular" height={spinnerSize} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        );

      case 'dots':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: `${color}.main`,
                  animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                    },
                    '40%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
            ))}
          </Box>
        );

      case 'pulse':
        return (
          <Box
            sx={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: '50%',
              backgroundColor: `${color}.main`,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 0,
                },
              },
            }}
          />
        );

      default:
        return (
          <CircularProgress
            size={spinnerSize}
            color={color}
            thickness={thickness}
          />
        );
    }
  };

  return (
    <Box className={className} sx={containerSx}>
      {renderSpinner()}
      {text && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 200,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

// Specialized loading components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <LoadingSpinner
    variant="circular"
    size="large"
    text={text}
    fullScreen
    professional
  />
);

export const ContentLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <LoadingSpinner
      variant="circular"
      size="medium"
      text={text}
      professional
    />
  </Box>
);

export const InlineLoader: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'small' }) => (
  <LoadingSpinner
    variant="circular"
    size={size}
    professional
  />
);

// Export default for backward compatibility
export default LoadingSpinner;