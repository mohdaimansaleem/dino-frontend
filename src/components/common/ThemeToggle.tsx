import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Zoom,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness4,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { getConfigValue } from '../../config/runtime';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'button';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  size = 'medium',
  showLabel = false 
}) => {
  const { mode, toggleTheme } = useTheme();

  // Check if theme toggle feature is enabled
  if (!getConfigValue('ENABLE_THEME_TOGGLE')) {
    return null;
  }

  const getIcon = () => {
    if (variant === 'switch') {
      return <Brightness4 />;
    }
    return mode === 'light' ? <DarkMode /> : <LightMode />;
  };

  const getTooltipText = () => {
    return mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  }[size];

  if (variant === 'button') {
    return (
      <Box
        onClick={toggleTheme}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 16px',
          borderRadius: '20px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'scale(1.02)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            transition: 'all 0.3s ease',
          }}
        >
          {getIcon()}
        </Box>
        {showLabel && (
          <Box
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {mode === 'light' ? 'Dark' : 'Light'} Mode
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Tooltip 
      title={getTooltipText()} 
      placement="bottom"
      TransitionComponent={Zoom}
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        size={size}
        sx={{
          color: 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            transition: 'all 0.3s ease',
          }}
        >
          {getIcon()}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;