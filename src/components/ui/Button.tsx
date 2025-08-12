import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box
} from '@mui/material';

// Enhanced Button interface with professional variants
interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'contained' | 'outlined' | 'text' | 'soft' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  professional?: boolean; // Enhanced professional styling
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
  sx = {},
  ...props
}) => {
  // Professional styling enhancements
  const professionalSx = professional ? {
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'none',
    borderRadius: 2,
    minHeight: size === 'small' ? 32 : size === 'large' ? 48 : 40,
    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
    // Variant-specific enhancements
    ...(variant === 'soft' && {
      backgroundColor: 'primary.50',
      color: 'primary.main',
      border: '1px solid',
      borderColor: 'primary.200',
      '&:hover': {
        backgroundColor: 'primary.100',
        borderColor: 'primary.300',
        transform: 'translateY(-1px)',
      },
    }),
    ...(variant === 'gradient' && {
      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(45deg, #0d47a1 30%, #1565c0 90%)',
        transform: 'translateY(-1px)',
      },
    }),
  } : {};

  // Convert custom variants to Material-UI variants
  const muiVariant = variant === 'soft' || variant === 'gradient' ? 'contained' : variant;

  // Loading state content
  const loadingContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress 
        size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
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
      size={size}
      disabled={disabled || loading}
      sx={{
        ...professionalSx,
        ...sx,
      }}
      {...props}
    >
      {buttonContent}
    </MuiButton>
  );
};

// Export default for backward compatibility
export default Button;