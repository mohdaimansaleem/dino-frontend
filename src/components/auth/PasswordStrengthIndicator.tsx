import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check,
  Close,
} from '@mui/icons-material';
import { validatePasswordStrength, getPasswordStrengthText } from '../../utils/security';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  compact?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
  compact = false,
}) => {
  const validation = validatePasswordStrength(password);
  const strengthInfo = getPasswordStrengthText(validation.score);

  const requirements = [
    {
      text: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      text: 'Contains lowercase letter',
      met: /(?=.*[a-z])/.test(password),
    },
    {
      text: 'Contains uppercase letter',
      met: /(?=.*[A-Z])/.test(password),
    },
    {
      text: 'Contains number',
      met: /(?=.*\d)/.test(password),
    },
    {
      text: 'Contains special character',
      met: /(?=.*[@$!%*?&])/.test(password),
    },
  ];

  if (!password) {
    return null;
  }

  if (compact) {
    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(validation.score / 5) * 100}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 
                  strengthInfo.color === 'error' ? 'error.main' :
                  strengthInfo.color === 'warning' ? 'warning.main' :
                  strengthInfo.color === 'info' ? 'info.main' :
                  'success.main',
              },
            }}
          />
          <Chip
            label={strengthInfo.text}
            size="small"
            color={strengthInfo.color}
            variant="outlined"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Strength Indicator */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Password Strength:
          </Typography>
          <Chip
            label={strengthInfo.text}
            size="small"
            color={strengthInfo.color}
            variant="outlined"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={(validation.score / 5) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 
                strengthInfo.color === 'error' ? 'error.main' :
                strengthInfo.color === 'warning' ? 'warning.main' :
                strengthInfo.color === 'info' ? 'info.main' :
                'success.main',
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {/* Requirements List */}
      {showRequirements && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Password Requirements:
          </Typography>
          <List dense sx={{ py: 0 }}>
            {requirements.map((requirement, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {requirement.met ? (
                    <Check color="success" fontSize="small" />
                  ) : (
                    <Close color="error" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={requirement.text}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: requirement.met ? 'success.main' : 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Error Messages */}
      {validation.errors.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {validation.errors.map((error, index) => (
            <Typography
              key={index}
              variant="caption"
              color="error"
              display="block"
            >
              • {error}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;