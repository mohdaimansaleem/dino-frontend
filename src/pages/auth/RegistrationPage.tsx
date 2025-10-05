import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  StepConnector,
  styled
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import { WorkspaceRegistration } from '../../types/api';
import DinoLogo from '../../components/DinoLogo';
import { useToast } from '../../contexts/ToastContext';
import RegistrationResult from '../../components/RegistrationResult';


// Import registration components
import ImageSlider from '../../components/registration/ImageSlider';
import WorkspaceDetailsStep from '../../components/registration/WorkspaceDetailsStep';
import VenueInformationStep from '../../components/registration/VenueInformationStep';
import OwnerAccountStep from '../../components/registration/OwnerAccountStep';
import ReviewStep from '../../components/registration/ReviewStep';
import { RegistrationFormData, initialFormData } from '../../components/registration/types';

const steps = [
  'Workspace Details',
  'Venue Information', 
  'Owner Account',
  'Review & Submit'
];

// Custom styled components for responsive stepper
const ResponsiveStepConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 22,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  '&.MuiStepConnector-active': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '&.MuiStepConnector-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
  [theme.breakpoints.down('sm')]: {
    '&.MuiStepConnector-alternativeLabel': {
      top: 22,
      left: 'calc(-50% + 12px)',
      right: 'calc(50% + 12px)',
    },
    '& .MuiStepConnector-line': {
      borderTopWidth: 2,
    },
  },
}));

const ResponsiveStepLabel = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: theme.spacing(1),
    textAlign: 'center',
    lineHeight: 1.2,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      marginTop: theme.spacing(0.5),
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.7rem',
      display: 'none', // Hide labels on very small screens
    },
  },
  '& .MuiStepLabel-iconContainer': {
    paddingRight: 0,
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.25rem',
      },
    },
  },
}));

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError } = useToast();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegistrationFormData>(
    location.state?.formData || initialFormData
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  
  // Registration result state
  const [showResult, setShowResult] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>('');
  const [registrationErrorCode, setRegistrationErrorCode] = useState<number | undefined>();
  const [registrationData, setRegistrationData] = useState<WorkspaceRegistration | null>(null);

  // Helper function to get error message for a field (backend errors take priority)
  const getFieldError = (fieldName: string): string => {
    return backendErrors[fieldName] || validationErrors[fieldName] || '';
  };

  // Helper function to check if field has any error
  const hasFieldError = (fieldName: string): boolean => {
    return !!(backendErrors[fieldName] || validationErrors[fieldName]);
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Workspace Details
        if (!formData.workspaceName.trim()) {
          errors.workspaceName = 'Workspace name is required';
        } else if (formData.workspaceName.length < 5) {
          errors.workspaceName = 'Workspace name must have at least 5 characters';
        } else if (formData.workspaceName.length > 100) {
          errors.workspaceName = 'Workspace name must not exceed 100 characters';
        }

        if (formData.workspaceDescription && formData.workspaceDescription.length > 500) {
          errors.workspaceDescription = 'Workspace description must not exceed 500 characters';
        }
        break;

      case 1: // Venue Information
        if (!formData.venueName.trim()) {
          errors.venueName = 'Venue name is required';
        } else if (formData.venueName.length > 100) {
          errors.venueName = 'Venue name must not exceed 100 characters';
        }

        if (formData.venueDescription && formData.venueDescription.length > 1000) {
          errors.venueDescription = 'Venue description must not exceed 1000 characters';
        }

        if (!formData.venueLocation.address.trim()) {
          errors.address = 'Address is required';
        } else if (formData.venueLocation.address.length < 5) {
          errors.address = 'Address must have at least 5 characters';
        }

        if (!formData.venueLocation.city.trim()) {
          errors.city = 'City is required';
        }

        if (!formData.venueLocation.state.trim()) {
          errors.state = 'State is required';
        }

        const postalCode = formData.venueLocation.postal_code || '';
        if (!postalCode.trim()) {
          errors.postal_code = 'Postal code is required';
        } else if (postalCode.length < 3) {
          errors.postal_code = 'Postal code must have at least 3 characters';
        }

        if (!formData.venuePhone.trim()) {
          errors.venuePhone = 'Venue phone number is required';
        } else if (!/^\d{10}$/.test(formData.venuePhone)) {
          errors.venuePhone = 'Phone number must be exactly 10 digits';
        }

        if (!formData.venueEmail.trim()) {
          errors.venueEmail = 'Venue email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.venueEmail)) {
            errors.venueEmail = 'Please enter a valid email address';
          }
        }
        break;

      case 2: // Owner Account
        if (!formData.ownerFirstName.trim()) {
          errors.ownerFirstName = 'First name is required';
        } else if (formData.ownerFirstName.length > 50) {
          errors.ownerFirstName = 'First name must not exceed 50 characters';
        }

        if (!formData.ownerLastName.trim()) {
          errors.ownerLastName = 'Last name is required';
        } else if (formData.ownerLastName.length > 50) {
          errors.ownerLastName = 'Last name must not exceed 50 characters';
        }

        if (!formData.ownerEmail.trim()) {
          errors.ownerEmail = 'Email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.ownerEmail)) {
            errors.ownerEmail = 'Please enter a valid email address';
          }
        }

        if (!formData.ownerPhone.trim()) {
          errors.ownerPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.ownerPhone)) {
          errors.ownerPhone = 'Phone number must be exactly 10 digits';
        }

        if (!formData.ownerPassword) {
          errors.ownerPassword = 'Password is required';
        } else {
          const password = formData.ownerPassword;
          
          if (password.length < 8) {
            errors.ownerPassword = 'Password must be at least 8 characters long';
          } else if (password.length > 128) {
            errors.ownerPassword = 'Password must not exceed 128 characters';
          } else if (!/[A-Z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one uppercase letter';
          } else if (!/[a-z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one lowercase letter';
          } else if (!/\d/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one digit';
          } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
          }
        }

        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.ownerPassword !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
      setBackendErrors({});
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
    setBackendErrors({});
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    // Convert email fields to lowercase
    if (field === 'ownerEmail' || field === 'venueEmail') {
      value = typeof value === 'string' ? value.toLowerCase() : value;
    }
    
    // Restrict phone numbers to digits only (max 10 digits)
    if (field === 'venuePhone' || field === 'ownerPhone') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 10) : value;
    }
    
    // Restrict postal code to digits only (max 6 digits for Indian postal codes)
    if (field === 'venueLocation.postal_code') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 6) : value;
    }
    
    if (field.startsWith('venueLocation.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        venueLocation: {
          ...prev.venueLocation,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear validation error for this field
    const errorKey = field.startsWith('venueLocation.') ? field.split('.')[1] : field;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
    
    if (backendErrors[errorKey]) {
      setBackendErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  }, [validationErrors, backendErrors]);

  const handleRetry = () => {
    setShowResult(false);
    setRegistrationSuccess(false);
    setRegistrationError('');
    setRegistrationErrorCode(undefined);
    setRegistrationData(null);
    setError(null);
    setBackendErrors({});
    // Reset to last step to allow user to review and modify
    setActiveStep(steps.length - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    setError(null);
    setBackendErrors({});

    // Prepare registration data outside try block so it's accessible in catch
    const registrationData: WorkspaceRegistration = {
      workspace_name: formData.workspaceName,
      workspace_description: formData.workspaceDescription,
      venue_name: formData.venueName,
      venue_description: formData.venueDescription,
      venue_location: formData.venueLocation,
      venue_phone: formData.venuePhone,
      venue_email: formData.venueEmail,
      price_range: formData.priceRange,
      venue_type: formData.venueType,
      owner_email: formData.ownerEmail,
      owner_phone: formData.ownerPhone,
      owner_first_name: formData.ownerFirstName,
      owner_last_name: formData.ownerLastName,
      owner_password: formData.ownerPassword,
      confirm_password: formData.confirmPassword
    };

    try {
      await authService.registerWorkspace(registrationData);
      
      // Success - show success result
      setRegistrationData(registrationData);
      setRegistrationSuccess(true);
      setShowResult(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      
      // Show failure result
      setRegistrationData(registrationData);
      setRegistrationError(errorMessage);
      setRegistrationErrorCode(err.response?.status);
      setRegistrationSuccess(false);
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    const commonProps = {
      formData,
      onInputChange: handleInputChange,
      errors: { ...validationErrors, ...backendErrors }
    };

    switch (step) {
      case 0:
        return <WorkspaceDetailsStep {...commonProps} />;
      case 1:
        return <VenueInformationStep {...commonProps} />;
      case 2:
        return (
          <OwnerAccountStep
            {...commonProps}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );
      case 3:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  // Show result component if registration is complete
  if (showResult) {
    return (
      <RegistrationResult
        isSuccess={registrationSuccess}
        workspaceData={registrationData}
        error={registrationError}
        errorCode={registrationErrorCode}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Image Slider (55%) */}
      <Box
        sx={{
          width: { xs: '0%', lg: '55%' },
          height: '100vh',
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <ImageSlider />
      </Box>

      {/* Right Side - Registration Form (45%) */}
      <Box
        sx={{
          width: { xs: '100%', lg: '45%' },
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            color: 'text.primary',
            minHeight: { xs: '20vh', lg: '22vh' },
          }}
        >

          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                py: 4,
                px: 3,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DinoLogo size={40} animated={true} sx={{ mr: 2 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Create Your Dino Workspace
                </Typography>
              </Box>
              
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 400,
                  maxWidth: '400px',
                  color: 'text.secondary',
                }}
              >
                Set up your complete restaurant management workspace
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  mt: 1,
                }}
              >
                <Business sx={{ fontSize: 16, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  Complete Restaurant Setup
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Form Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3, lg: 4 } }}>
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, md: 4, lg: 5 },
              borderRadius: { xs: 2, md: 3, lg: 4 },
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
              maxWidth: '100%',
            }}
          >
            {/* Form Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Workspace Registration
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.secondary',
                }}
              >
                Complete the setup process to create your restaurant workspace
              </Typography>
            </Box>

            {/* Stepper */}
            <Box sx={{ mb: 3 }}>
              <Stepper 
                activeStep={activeStep} 
                connector={<ResponsiveStepConnector />}
                alternativeLabel={!isMobile}
                orientation={isMobile ? "horizontal" : "horizontal"}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <ResponsiveStepLabel>
                      {isMobile ? '' : label}
                    </ResponsiveStepLabel>
                  </Step>
                ))}
              </Stepper>
              {isMobile && (
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block" 
                  sx={{ 
                    mt: 2, 
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
                sx={{ 
                  minWidth: 100,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  size="large"
                  sx={{ 
                    minWidth: 160,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {loading ? 'Creating...' : 'Create Workspace'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                  sx={{ 
                    minWidth: 100,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            {/* Login Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                Already have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/login')}
                  size="small"
                  sx={{
                    fontSize: '0.875rem',
                    textTransform: 'none'
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationPage;