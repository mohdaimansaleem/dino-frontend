import React from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps,
  CardContent,
  CardActions,
  CardHeader,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

// Enhanced Card interface with professional variants
interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'elevated' | 'outlined' | 'soft' | 'interactive';
  header?: {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    avatar?: React.ReactNode;
  };
  actions?: React.ReactNode;
  interactive?: boolean;
  loading?: boolean;
  professional?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  header,
  actions,
  interactive = false,
  loading = false,
  professional = true,
  padding = 'medium',
  onClick,
  sx = {},
  ...props
}) => {
  // Professional styling enhancements
  const professionalSx = professional ? {
    borderRadius: 3,
    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    position: 'relative',
    overflow: 'hidden',
    
    // Variant-specific styling
    ...(variant === 'elevated' && {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      border: '1px solid',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      '&:hover': interactive || onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        borderColor: 'rgba(0, 0, 0, 0.12)',
      } : {},
    }),
    
    ...(variant === 'outlined' && {
      boxShadow: 'none',
      border: '1.5px solid',
      borderColor: 'divider',
      '&:hover': interactive || onClick ? {
        transform: 'translateY(-1px)',
        borderColor: 'primary.main',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      } : {},
    }),
    
    ...(variant === 'soft' && {
      backgroundColor: 'primary.50',
      border: '1px solid',
      borderColor: 'primary.100',
      boxShadow: 'none',
      '&:hover': interactive || onClick ? {
        backgroundColor: 'primary.100',
        borderColor: 'primary.200',
        transform: 'translateY(-1px)',
      } : {},
    }),
    
    ...(variant === 'interactive' && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      '&:active': {
        transform: 'translateY(-1px)',
      },
    }),
    
    // Interactive states
    ...(onClick && {
      cursor: 'pointer',
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2,
      },
    }),
    
    // Loading state
    ...(loading && {
      opacity: 0.7,
      pointerEvents: 'none',
    }),
  } : {};

  // Padding configuration
  const paddingConfig = {
    none: 0,
    small: 2,
    medium: 3,
    large: 4,
  };

  return (
    <MuiCard
      onClick={onClick}
      sx={{
        ...professionalSx,
        ...sx,
      }}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                border: '2px solid',
                borderColor: 'primary.main',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                mb: 1,
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header */}
      {header && (
        <>
          <CardHeader
            avatar={header.avatar}
            action={header.action || (
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            )}
            title={
              <Typography variant="h6" fontWeight={600}>
                {header.title}
              </Typography>
            }
            subheader={
              header.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {header.subtitle}
                </Typography>
              )
            }
            sx={{ pb: 1 }}
          />
          <Divider />
        </>
      )}

      {/* Content */}
      <CardContent sx={{ p: paddingConfig[padding] }}>
        {children}
      </CardContent>

      {/* Actions */}
      {actions && (
        <>
          <Divider />
          <CardActions sx={{ p: 2, pt: 1 }}>
            {actions}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
};

// Export default for convenience
export default Card;