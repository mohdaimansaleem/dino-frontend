import React from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { Person, Email, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { RegistrationFormData } from './types';

interface OwnerAccountStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

const OwnerAccountStep: React.FC<OwnerAccountStepProps> = ({
  formData,
  onInputChange,
  errors,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: '1.25rem'
          }}
        >
          <Person color="primary" />
          Owner Account
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Create your admin account to manage the workspace and venue
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.ownerFirstName}
          onChange={(e) => onInputChange('ownerFirstName', e.target.value)}
          error={!!errors.ownerFirstName}
          helperText={errors.ownerFirstName}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.ownerLastName}
          onChange={(e) => onInputChange('ownerLastName', e.target.value)}
          error={!!errors.ownerLastName}
          helperText={errors.ownerLastName}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.ownerEmail}
          onChange={(e) => onInputChange('ownerEmail', e.target.value)}
          error={!!errors.ownerEmail}
          helperText={errors.ownerEmail}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.ownerPhone}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]+$/.test(value)) {
              onInputChange('ownerPhone', value);
            }
          }}
          error={!!errors.ownerPhone}
          helperText={errors.ownerPhone || 'Required: Exactly 10 digits'}
          required
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 10
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.ownerPassword}
          onChange={(e) => onInputChange('ownerPassword', e.target.value)}
          error={!!errors.ownerPassword}
          helperText={errors.ownerPassword || 'Required: 8-128 characters with uppercase, lowercase, digit, and special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={onTogglePassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => onInputChange('confirmPassword', e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={onToggleConfirmPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default OwnerAccountStep;