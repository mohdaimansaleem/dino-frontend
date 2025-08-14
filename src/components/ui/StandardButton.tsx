import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface StandardButtonProps extends Omit<MuiButtonProps, 'size'> {
  loading?: boolean;
  loadingText?: string;
  responsive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StandardButton: React.FC<StandardButtonProps> = ({
  loading = false,
  loadingText,
  responsive = true,
  size = 'medium',
  children,
  disabled,
  startIcon,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
      fontWeight: 600,
      textTransform: 'none' as const,
      borderRadius: 2,
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[4],
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      '&:disabled': {
        transform: 'none',
      }
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

  const sizeStyles = getSizeStyles();

  return (
    <MuiButton
      {...props}
      size={responsiveSize}
      disabled={disabled || loading}
      startIcon={loading ? (
        <CircularProgress 
          size={responsiveSize === 'small' ? 14 : responsiveSize === 'large' ? 18 : 16} 
          color="inherit" 
        />
      ) : startIcon}
      sx={{
        ...sizeStyles,
        ...sx,
      }}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
};

export default StandardButton;