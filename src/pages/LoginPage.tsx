import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Restaurant, Email, Lock } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { UserRole, UserCreate } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setDemoUser } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'admin' as UserRole,
    agreeToTerms: false,
  });

  const [demoRole, setDemoRole] = useState<'admin' | 'operator' | 'superadmin'>('admin');

  const from = location.state?.from?.pathname || '/admin';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (!formData.agreeToTerms) {
        setError('You must agree to the terms and conditions');
        return false;
      }
    }

    return true;
  };

  const handleDemoBypass = () => {
    // Create a demo user session without backend authentication
    const demoUser = {
      id: `demo-user-${demoRole}-123`,
      email: demoRole === 'admin' ? 'admin@demo.com' : demoRole === 'operator' ? 'operator@demo.com' : 'superadmin@demo.com',
      firstName: 'Demo',
      lastName: demoRole === 'admin' ? 'Admin' : demoRole === 'operator' ? 'Operator' : 'SuperAdmin',
      role: demoRole === 'admin' ? 'admin' as const : 'staff' as const, // Map operator to staff for UserProfile compatibility
      phone: '+1234567890',
      isActive: true,
      isVerified: true,
      addresses: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteCuisines: [],
        spiceLevel: 'medium' as const,
        notificationsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
      },
      createdAt: new Date(),
      loginCount: 1,
      totalOrders: 0,
      totalSpent: 0,
      // Add custom property for RBAC role
      rbacRole: demoRole,
    };

    // Set demo user using auth context
    setDemoUser(demoUser);
    
    // Navigate based on role
    const targetPath = demoRole === 'operator' ? '/admin/orders' : '/admin';
    navigate(targetPath, { replace: true });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password);
        navigate(from, { replace: true });
      } else {
        // Register
        const userData: UserCreate = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.name.split(' ')[0] || formData.name,
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          phone: formData.phone || '',
          role: formData.role,
          termsAccepted: formData.agreeToTerms,
          marketingConsent: false,
        };

        await authService.register(userData);
        setSuccess('Registration successful! Please log in with your credentials.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      agreeToTerms: false,
    }));
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Restaurant sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              🦕 Dino E-Menu
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="name"
              />
            )}

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="email"
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            {!isLogin && (
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                autoComplete="tel"
              />
            )}

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            {!isLogin && (
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}

            {!isLogin && (
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" color="primary">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="#" color="primary">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2 }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {isLogin && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Demo Mode - Select Role:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant={demoRole === 'superadmin' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setDemoRole('superadmin')}
                    sx={{ flex: 1, minWidth: '100px' }}
                  >
                    SuperAdmin
                  </Button>
                  <Button
                    variant={demoRole === 'admin' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setDemoRole('admin')}
                    sx={{ flex: 1, minWidth: '100px' }}
                  >
                    Admin
                  </Button>
                  <Button
                    variant={demoRole === 'operator' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setDemoRole('operator')}
                    sx={{ flex: 1, minWidth: '100px' }}
                  >
                    Operator
                  </Button>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleDemoBypass}
                  sx={{ 
                    py: 1.5,
                    borderColor: 'warning.main',
                    color: 'warning.main',
                    '&:hover': {
                      borderColor: 'warning.dark',
                      backgroundColor: 'warning.light',
                      color: 'warning.dark'
                    }
                  }}
                >
                  🚀 Login as {demoRole === 'admin' ? 'Admin' : demoRole === 'operator' ? 'Operator' : 'SuperAdmin'} (Demo)
                </Button>
              </Box>
            )}



            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Typography>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => isLogin ? navigate('/register') : toggleMode()}
                sx={{ mt: 1, fontWeight: 'bold' }}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Link>
            </Box>

          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Dino E-Menu. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;