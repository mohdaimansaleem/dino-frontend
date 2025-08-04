import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { getRuntimeConfig, getConfigValue, isDevelopment } from '../../config/runtime';

/**
 * Configuration Debug Component
 * 
 * This component displays the current runtime configuration
 * for debugging purposes. Only shows in development mode.
 */
const ConfigDebug: React.FC = () => {
  const config = getRuntimeConfig();
  
  // Only show in development mode
  if (!isDevelopment()) {
    return null;
  }

  const featureFlags = [
    { key: 'ENABLE_THEME_TOGGLE', label: 'Theme Toggle' },
    { key: 'ENABLE_DEMO_MODE', label: 'Demo Mode' },
    { key: 'ENABLE_ANALYTICS', label: 'Analytics' },
    { key: 'ENABLE_QR_CODES', label: 'QR Codes' },
    { key: 'ENABLE_NOTIFICATIONS', label: 'Notifications' },
    { key: 'ENABLE_I18N', label: 'Internationalization' },
    { key: 'ENABLE_ANIMATIONS', label: 'Animations' },
  ];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        m: 2, 
        backgroundColor: 'background.paper',
        border: '2px solid',
        borderColor: 'warning.main'
      }}
    >
      <Typography variant="h6" gutterBottom color="warning.main">
        🔧 Runtime Configuration Debug
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This panel shows the current runtime configuration. It only appears in development mode.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Application Info
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {config.APP_NAME}
            </Typography>
            <Typography variant="body2">
              <strong>Version:</strong> {config.APP_VERSION}
            </Typography>
            <Typography variant="body2">
              <strong>Environment:</strong> {config.APP_ENV}
            </Typography>
            <Typography variant="body2">
              <strong>Debug Mode:</strong> {config.DEBUG_MODE ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            API Configuration
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              <strong>Base URL:</strong> {config.API_BASE_URL}
            </Typography>
            <Typography variant="body2">
              <strong>Timeout:</strong> {config.API_TIMEOUT}ms
            </Typography>
            <Typography variant="body2">
              <strong>Rate Limit:</strong> {config.API_RATE_LIMIT}/min
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Feature Flags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {featureFlags.map(({ key, label }) => {
              const isEnabled = getConfigValue(key as any) as boolean;
              return (
                <Chip
                  key={key}
                  label={`${label}: ${isEnabled ? 'ON' : 'OFF'}`}
                  color={isEnabled ? 'success' : 'default'}
                  variant={isEnabled ? 'filled' : 'outlined'}
                  size="small"
                />
              );
            })}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Environment Variables Test
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.100', 
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <Typography variant="body2">
              process.env.REACT_APP_ENABLE_THEME_TOGGLE: "{process.env.REACT_APP_ENABLE_THEME_TOGGLE}"
            </Typography>
            <Typography variant="body2">
              getConfigValue('ENABLE_THEME_TOGGLE'): {String(getConfigValue('ENABLE_THEME_TOGGLE'))}
            </Typography>
            <Typography variant="body2">
              Expected: false
            </Typography>
            <Typography variant="body2" color={
              getConfigValue('ENABLE_THEME_TOGGLE') === false ? 'success.main' : 'error.main'
            }>
              Status: {getConfigValue('ENABLE_THEME_TOGGLE') === false ? '✅ CORRECT' : '❌ INCORRECT'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ConfigDebug;