import React from 'react';
import {
  Card,
  CardProps,
  CardContent,
  CardActions,
  CardHeader,
  useTheme,
  Box,
  Divider,
} from '@mui/material';

interface StandardCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  header?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
  headerDivider?: boolean;
  actionsDivider?: boolean;
  children: React.ReactNode;
}

const StandardCard: React.FC<StandardCardProps> = ({
  variant = 'default',
  header,
  actions,
  noPadding = false,
  headerDivider = false,
  actionsDivider = false,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: 3,
      overflow: 'hidden' as const,
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: theme.shadows[2],
          },
        };
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: theme.shadows[4],
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
          },
        };
      case 'flat':
        return {
          ...baseStyles,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          border: 'none',
        };
      default: // default
        return {
          ...baseStyles,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Card
      {...props}
      sx={{
        ...variantStyles,
        ...sx,
      }}
    >
      {header && (
        <>
          {typeof header === 'string' ? (
            <CardHeader 
              title={header}
              sx={{
                pb: headerDivider ? 2 : 1,
                '& .MuiCardHeader-title': {
                  fontSize: '1.125rem',
                  fontWeight: 600,
                },
              }}
            />
          ) : (
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: headerDivider ? 2 : 1 }}>
              {header}
            </Box>
          )}
          {headerDivider && <Divider />}
        </>
      )}

      <CardContent 
        sx={{ 
          p: noPadding ? 0 : { xs: 2, sm: 3 },
          '&:last-child': {
            pb: noPadding ? 0 : { xs: 2, sm: 3 },
          },
        }}
      >
        {children}
      </CardContent>

      {actions && (
        <>
          {actionsDivider && <Divider />}
          <CardActions 
            sx={{ 
              p: { xs: 2, sm: 3 },
              pt: actionsDivider ? 2 : 1,
              gap: 1,
              justifyContent: 'flex-end',
            }}
          >
            {actions}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default StandardCard;