import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
} from '@mui/icons-material';
import { validatePasswordStrength } from '../../utils/security';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface PasswordUpdateDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUpdate: (userId: string, newPassword: string) => Promise<void>;
}

const PasswordUpdateDialog: React.FC<PasswordUpdateDialogProps> = ({
  open,
  user,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };



  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '));
      return;
    }

    if (!user) {
      setError('No user selected');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(user.id, formData.newPassword);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Lock color="primary" />
          <Typography variant="h6">Update User Password</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* User Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Person color="primary" />
                <Typography variant="h6">
                  {user.firstName} {user.lastName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Email: {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
          </Grid>

          {/* Admin Notice */}
          <Grid item xs={12}>
            <Alert severity="info">
              As an Admin, you can update user passwords but cannot modify other user details. 
              The user will need to log in with the new password.
            </Alert>
          </Grid>

          {/* Error Alert */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* New Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Confirm Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              error={formData.confirmPassword !== '' && formData.newPassword !== formData.confirmPassword}
              helperText={
                formData.confirmPassword !== '' && formData.newPassword !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : 'Re-enter the new password to confirm'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Password Strength Indicator */}
          <Grid item xs={12}>
            <PasswordStrengthIndicator 
              password={formData.newPassword}
              showRequirements={true}
              compact={false}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.newPassword || !formData.confirmPassword}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordUpdateDialog;