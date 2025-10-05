/**
 * Standardized Card Component
 * 
 * A consistent, feature-rich card component that provides various layouts
 * and styling options while maintaining design consistency across the app.
 */

import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardActions,
  CardHeader,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

interface CardProps extends Omit<MuiCardProps, 'variant'> {
  /**
   * Card variant for different use cases
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat' | 'glass';
  
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Card header avatar
   */
  avatar?: React.ReactNode;
  
  /**
   * Card header action (usually menu button)
   */
  headerAction?: React.ReactNode;
  
  /**
   * Card media (image/video)
   */
  media?: {
    src: string;
    alt: string;
    height?: number;
    component?: 'img' | 'video';
  };
  
  /**
   * Card content
   */
  children?: React.ReactNode;
  
  /**
   * Card actions (buttons, etc.)
   */
  actions?: React.ReactNode;
  
  /**
   * Whether to show loading skeleton
   */
  loading?: boolean;
  
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  
  /**
   * Click handler for clickable cards
   */
  onClick?: () => void;
  
  /**
   * Whether to show hover effects
   */
  hoverable?: boolean;
  
  /**
   * Card padding
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Whether to enable animations
   */
  animated?: boolean;
  
  /**
   * Custom header content
   */
  header?: React.ReactNode;
  
  /**
   * Whether to show default header action (menu button)
   */
  showHeaderAction?: boolean;
  
  /**
   * Header action click handler
   */
  onHeaderActionClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  title,
  subtitle,
  avatar,
  headerAction,
  media,
  children,
  actions,
  loading = false,
  clickable = false,
  onClick,
  hoverable = true,
  padding = 'medium',
  animated,
  header,
  showHeaderAction = false,
  onHeaderActionClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const animationsEnabled = useFeatureFlag('animatedComponents');
  
  // Use feature flag for animations unless explicitly overridden
  const shouldAnimate = animated !== undefined ? animated : animationsEnabled;

  // Get variant-specific styles
  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      transition: shouldAnimate ? 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        };
      
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: theme.shadows[4],
          '&:hover': hoverable && shouldAnimate ? {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
          } : {},
        };
      
      case 'flat':
        return {
          ...baseStyles,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        };
      
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        };
      
      default: // 'default'
        return {
          ...baseStyles,
          boxShadow: theme.shadows[1],
          '&:hover': hoverable && shouldAnimate ? {
            boxShadow: theme.shadows[3],
            transform: 'translateY(-1px)',
          } : {},
        };
    }
  };

  // Get padding styles
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { p: 0 };
      case 'small':
        return { p: 1 };
      case 'large':
        return { p: 3 };
      default: // 'medium'
        return { p: 2 };
    }
  };

  // Get clickable styles
  const getClickableStyles = () => {
    if (!clickable) return {};
    
    return {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    };
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();
  const clickableStyles = getClickableStyles();

  // Loading skeleton
  if (loading) {
    return (
      <MuiCard
        sx={{
          ...variantStyles,
          ...sx,
        }}
        {...props}
      >
        {(title || subtitle || header) && (
          <CardHeader
            avatar={avatar ? <Skeleton variant="circular" width={40} height={40} /> : undefined}
            title={title ? <Skeleton variant="text" width="60%" /> : undefined}
            subheader={subtitle ? <Skeleton variant="text" width="40%" /> : undefined}
            action={showHeaderAction ? <Skeleton variant="circular" width={24} height={24} /> : undefined}
          />
        )}
        
        {media && (
          <Skeleton variant="rectangular" height={media.height || 200} />
        )}
        
        <CardContent sx={paddingStyles}>
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
        
        {actions && (
          <CardActions>
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </CardActions>
        )}
      </MuiCard>
    );
  }

  // Render header action
  const renderHeaderAction = () => {
    if (headerAction) return headerAction;
    
    if (showHeaderAction) {
      return (
        <IconButton
          onClick={onHeaderActionClick}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon />
        </IconButton>
      );
    }
    
    return undefined;
  };

  return (
    <MuiCard
      onClick={clickable ? onClick : undefined}
      sx={{
        ...variantStyles,
        ...clickableStyles,
        ...sx,
      }}
      {...props}
    >
      {/* Custom header or standard header */}
      {header ? (
        <Box sx={{ p: 2, pb: 0 }}>
          {header}
        </Box>
      ) : (title || subtitle || avatar || showHeaderAction || headerAction) ? (
        <CardHeader
          avatar={avatar}
          title={title && (
            <Typography variant="h6" component="h2" fontWeight={600}>
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={renderHeaderAction()}
          sx={{ pb: children ? 1 : 2 }}
        />
      ) : null}
      
      {/* Media */}
      {media && (
        <CardMedia
          component={media.component || 'img'}
          height={media.height || 200}
          image={media.src}
          alt={media.alt}
        />
      )}
      
      {/* Content */}
      {children && (
        <CardContent sx={paddingStyles}>
          {children}
        </CardContent>
      )}
      
      {/* Actions */}
      {actions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

// Specialized card components for common use cases

/**
 * Simple content card
 */
export const ContentCard: React.FC<{
  title: string;
  content: string;
  actions?: React.ReactNode;
  variant?: CardProps['variant'];
}> = ({ title, content, actions, variant = 'default' }) => (
  <Card title={title} actions={actions} variant={variant}>
    <Typography variant="body2" color="text.secondary">
      {content}
    </Typography>
  </Card>
);

/**
 * Media card with image
 */
export const MediaCard: React.FC<{
  title: string;
  subtitle?: string;
  content: string;
  image: { src: string; alt: string; height?: number };
  actions?: React.ReactNode;
  variant?: CardProps['variant'];
}> = ({ title, subtitle, content, image, actions, variant = 'default' }) => (
  <Card
    title={title}
    subtitle={subtitle}
    media={image}
    actions={actions}
    variant={variant}
  >
    <Typography variant="body2" color="text.secondary">
      {content}
    </Typography>
  </Card>
);

/**
 * Profile card with avatar
 */
export const ProfileCard: React.FC<{
  name: string;
  role?: string;
  avatar: React.ReactNode;
  content?: string;
  actions?: React.ReactNode;
  variant?: CardProps['variant'];
  onMenuClick?: () => void;
}> = ({ name, role, avatar, content, actions, variant = 'default', onMenuClick }) => (
  <Card
    title={name}
    subtitle={role}
    avatar={avatar}
    actions={actions}
    variant={variant}
    showHeaderAction={!!onMenuClick}
    onHeaderActionClick={onMenuClick}
  >
    {content && (
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    )}
  </Card>
);

/**
 * Stats card for displaying metrics
 */
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: CardProps['variant'];
  clickable?: boolean;
  onClick?: () => void;
}> = ({ title, value, subtitle, icon, trend, variant = 'default', clickable, onClick }) => (
  <Card
    variant={variant}
    clickable={clickable}
    onClick={onClick}
    padding="large"
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="h6" component="h3" fontWeight={600}>
        {title}
      </Typography>
      {icon}
    </Box>
    
    <Typography variant="h4" component="div" fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
      {value}
    </Typography>
    
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
    
    {trend && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: trend.direction === 'up' ? 'success.main' : 
                   trend.direction === 'down' ? 'error.main' : 'text.secondary',
            fontWeight: 600,
          }}
        >
          {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          {trend.label}
        </Typography>
      </Box>
    )}
  </Card>
);

export default Card;