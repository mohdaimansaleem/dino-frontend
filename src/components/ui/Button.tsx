import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

// Enhanced Button interface with professional variants and responsive features
interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'contained' | 'outlined' | 'text' | 'soft' | 'gradient' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  professional?: boolean;
  responsive?: boolean; // Auto-adjust size on mobile
  animated?: boolean; // Enable/disable animations based on feature flag
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  size = 'medium',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'start',
  disabled = false,
  professional = true,
  responsive = true,
  animated,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const animationsEnabled = useFeatureFlag('animatedComponents');
  
  // Use feature flag for animations unless explicitly overridden
  const shouldAnimate = animated !== undefined ? animated : animationsEnabled;
  
  // Responsive size adjustment
  const getResponsiveSize = () => {
    if (!responsive) return size;
    
    if (isMobile) {
      return size === 'large' ? 'medium' : size;
    }
    return size;
  };

  const responsiveSize = getResponsiveSize();

  // Size-based styling
  const getSizeStyles = () => {
    const baseStyles = {
      fontWeight: professional ? 600 : 500,
      textTransform: 'none' as const,
      borderRadius: professional ? 2 : 1,
      transition: shouldAnimate ? 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
      letterSpacing: professional ? '0.02em' : 'normal',
      '&:hover': {
        transform: professional && shouldAnimate ? 'translateY(-1px)' : 'none',
        boxShadow: professional ? theme.shadows[4] : undefined,
      },
      '&:active': {
        transform: professional && shouldAnimate ? 'translateY(0)' : 'none',
      },
      '&:disabled': {
        transform: 'none',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2,
      },
    };

    switch (responsiveSize) {
      case 'small':
        return {
          ...baseStyles,
          minHeight: 32,
          px: 2,
          py: 0.75,
          fontSize: '0.8125rem',
        };
      case 'large':
        return {
          ...baseStyles,
          minHeight: 48,
          px: 4,
          py: 1.5,
          fontSize: '1rem',
        };
      default: // medium
        return {
          ...baseStyles,
          minHeight: 40,
          px: 3,
          py: 1.25,
          fontSize: '0.875rem',
        };
    }
  };

  // Professional styling enhancements
  const getVariantStyles = () => {
    if (!professional) return {};

    switch (variant) {
      case 'soft':
        return {
          backgroundColor: 'primary.50',
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'primary.200',
          '&:hover': {
            backgroundColor: 'primary.100',
            borderColor: 'primary.300',
            transform: shouldAnimate ? 'translateY(-1px)' : 'none',
          },
        };
      case 'gradient':
        return {
          background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #0d47a1 30%, #1565c0 90%)',
            transform: shouldAnimate ? 'translateY(-1px)' : 'none',
          },
        };
      case 'danger':
        return {
          backgroundColor: 'error.main',
          color: 'error.contrastText',
          '&:hover': {
            backgroundColor: 'error.dark',
            transform: shouldAnimate ? 'translateY(-1px)' : 'none',
          },
        };
      case 'success':
        return {
          backgroundColor: 'success.main',
          color: 'success.contrastText',
          '&:hover': {
            backgroundColor: 'success.dark',
            transform: shouldAnimate ? 'translateY(-1px)' : 'none',
          },
        };
      default:
        return {};
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  // Convert custom variants to Material-UI variants
  const muiVariant = ['soft', 'gradient', 'danger', 'success'].includes(variant) ? 'contained' : variant as 'contained' | 'outlined' | 'text';

  // Loading state content
  const loadingContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress 
        size={responsiveSize === 'small' ? 14 : responsiveSize === 'large' ? 18 : 16} 
        color="inherit" 
      />
      {loadingText && loadingText}
    </Box>
  );

  // Button content with icon support
  const buttonContent = loading ? loadingContent : (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && iconPosition === 'start' && icon}
      {children}
      {icon && iconPosition === 'end' && icon}
    </Box>
  );

  return (
    <MuiButton
      variant={muiVariant}
      size={responsiveSize}
      disabled={disabled || loading}
      startIcon={loading && !loadingText ? (
        <CircularProgress 
          size={responsiveSize === 'small' ? 14 : responsiveSize === 'large' ? 18 : 16} 
          color="inherit" 
        />
      ) : (!loading && icon && iconPosition === 'start' ? icon : undefined)}
      endIcon={!loading && icon && iconPosition === 'end' ? icon : undefined}
      sx={{
        ...sizeStyles,
        ...variantStyles,
        ...sx,
      }}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
};

// Export default for backward compatibility
export default Button;