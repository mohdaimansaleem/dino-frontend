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
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

// Enhanced Card interface with professional variants and responsive features
interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'elevated' | 'outlined' | 'soft' | 'interactive' | 'flat';
  header?: {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    avatar?: React.ReactNode;
  } | React.ReactNode | string;
  actions?: React.ReactNode;
  interactive?: boolean;
  loading?: boolean;
  professional?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  headerDivider?: boolean;
  actionsDivider?: boolean;
  responsive?: boolean;
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
  headerDivider = false,
  actionsDivider = false,
  responsive = true,
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Professional styling enhancements
  const professionalSx = professional ? {
    borderRadius: 3,
    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    position: 'relative',
    overflow: 'hidden',
    
    // Variant-specific styling
    ...(variant === 'elevated' && {
      boxShadow: theme.shadows[2],
      border: '1px solid',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      '&:hover': (interactive || onClick) ? {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8],
        borderColor: 'rgba(0, 0, 0, 0.12)',
      } : {
        boxShadow: theme.shadows[4],
      },
    }),
    
    ...(variant === 'outlined' && {
      boxShadow: 'none',
      border: '1.5px solid',
      borderColor: 'divider',
      '&:hover': (interactive || onClick) ? {
        transform: 'translateY(-1px)',
        borderColor: 'primary.main',
        boxShadow: theme.shadows[2],
      } : {
        borderColor: 'primary.main',
      },
    }),
    
    ...(variant === 'soft' && {
      backgroundColor: 'primary.50',
      border: '1px solid',
      borderColor: 'primary.100',
      boxShadow: 'none',
      '&:hover': (interactive || onClick) ? {
        backgroundColor: 'primary.100',
        borderColor: 'primary.200',
        transform: 'translateY(-1px)',
      } : {
        backgroundColor: 'primary.100',
      },
    }),
    
    ...(variant === 'interactive' && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.shadows[12],
      },
      '&:active': {
        transform: 'translateY(-1px)',
      },
    }),

    ...(variant === 'flat' && {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      border: 'none',
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

  // Responsive padding configuration
  const paddingConfig = {
    none: 0,
    small: responsive ? { xs: 1, sm: 2 } : 2,
    medium: responsive ? { xs: 2, sm: 3 } : 3,
    large: responsive ? { xs: 3, sm: 4 } : 4,
  };

  // Render header based on type
  const renderHeader = () => {
    if (!header) return null;

    if (typeof header === 'string') {
      return (
        <>
          <CardHeader 
            title={
              <Typography variant="h6" fontWeight={600}>
                {header as React.ReactNode}
              </Typography>
            }
            sx={{ 
              pb: headerDivider ? 2 : 1,
              p: responsive ? { xs: 2, sm: 3 } : 3,
            }}
          />
          {headerDivider && <Divider />}
        </>
      );
    }

    if (React.isValidElement(header) || typeof header === 'object') {
      // Check if it's our header object format
      if (header && typeof header === 'object' && 'title' in header) {
        const headerObj = header as { title?: string; subtitle?: string; action?: React.ReactNode; avatar?: React.ReactNode };
        return (
          <>
            <CardHeader
              avatar={headerObj.avatar}
              action={headerObj.action || (
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              )}
              title={
                <Typography variant="h6" fontWeight={600}>
                  {headerObj.title}
                </Typography>
              }
              subheader={
                headerObj.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {headerObj.subtitle}
                  </Typography>
                )
              }
              sx={{ 
                pb: headerDivider ? 2 : 1,
                p: responsive ? { xs: 2, sm: 3 } : 3,
              }}
            />
            {headerDivider && <Divider />}
          </>
        );
      }

      // Custom header component
      return (
        <>
          <Box sx={{ 
            p: responsive ? { xs: 2, sm: 3 } : 3, 
            pb: headerDivider ? 2 : 1 
          }}>
            {header as React.ReactNode}
          </Box>
          {headerDivider && <Divider />}
        </>
      );
    }

    return null;
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
      {renderHeader()}

      {/* Content */}
      <CardContent 
        sx={{ 
          p: paddingConfig[padding],
          '&:last-child': {
            pb: paddingConfig[padding],
          },
        }}
      >
        {children}
      </CardContent>

      {/* Actions */}
      {actions && (
        <>
          {actionsDivider && <Divider />}
          <CardActions 
            sx={{ 
              p: responsive ? { xs: 2, sm: 3 } : 3,
              pt: actionsDivider ? 2 : 1,
              gap: 1,
              justifyContent: 'flex-end',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}
          >
            {actions}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
};

// Export default for convenience
export default Card;