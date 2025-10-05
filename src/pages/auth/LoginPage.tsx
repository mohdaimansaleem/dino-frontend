import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  // FormControlLabel,
  // Checkbox,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DinoLogo from '../../components/DinoLogo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false); // Hidden - Remember Me functionality disabled

  const [formData, setFormData] = useState({
    email: location.state?.email || '', // Pre-fill email from registration success
    password: '',
  });

  const from = location.state?.from?.pathname || '/admin';
  const successMessage = location.state?.message;

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // const handleRememberMeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   setRememberMe(e.target.checked);
  // }, []); // Hidden - Remember Me functionality disabled

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Username and password are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        overflow: 'hidden', // This already prevents scrolling
        position: 'relative',
        backgroundColor: '#1976d2', // Fallback color
        backgroundImage: 'url("/img/signin_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Using background image only - no overlay component */}

      {/* Login Form Container */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '100%', md: '45%', lg: '40%' },
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="sm" sx={{ width: '100%' }}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 5, sm: 7, md: 8 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
              backdropFilter: 'blur(10px)', // Glass effect
              WebkitBackdropFilter: 'blur(10px)', // Safari support
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              maxWidth: '500px',
              mx: 'auto',
              '&:hover': {
                transform: 'translateY(-2px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <DinoLogo size={48} animated={true} sx={{ mr: 2 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="700"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    color: '#1976d2',
                    fontWeight: 700,
                  }}
                >
                  Welcome Back
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1rem',
                  fontWeight: 400,
                }}
              >
                Sign in to your space dashboard
              </Typography>
            </Box>

            {/* Success Message from Registration */}
            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    minHeight: '56px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1976d2',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                  },
                  '& .MuiInputBase-input': {
                    color: '#333333',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(25, 118, 210, 0.3)',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#1976d2' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    minHeight: '56px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1976d2',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                  },
                  '& .MuiInputBase-input': {
                    color: '#333333',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(25, 118, 210, 0.3)',
                  },
                }}
              />

              {/* Remember Me Checkbox - Hidden */}
              {/* 
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': {
                        color: '#1976d2',
                      },
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1976d2',
                      fontWeight: 500,
                    }}
                  >
                    Remember Me
                  </Typography>
                }
                sx={{ mb: 4, mt: 1 }}
              />
              */}

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.8,
                  fontWeight: 700,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                  mb: 3,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    background: 'rgba(25, 118, 210, 0.3)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {loading ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  'Login'
                )}
              </Button>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    fontWeight: 600,
                    color: '#1976d2',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.8rem' }}
              >
                © 2024 Dino Space Management System
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;