import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  LocationOn,
  Security,
  CheckCircle
} from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  
  // Account Security
  password: string;
  confirmPassword: string;
  
  // Address Information
  addressLabel: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Preferences
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  spiceLevel: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Terms and Conditions
  termsAccepted: boolean;
  marketingConsent: boolean;
}

const steps = [
  'Personal Information',
  'Account Security',
  'Address Details',
  'Review & Submit'
];



const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    password: '',
    confirmPassword: '',
    addressLabel: 'Home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    dietaryRestrictions: [],
    favoriteCuisines: [],
    spiceLevel: 'medium',
    emailNotifications: true,
    smsNotifications: false,
    termsAccepted: false,
    marketingConsent: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[+]?[1-9]?[0-9]{7,15}$/.test(formData.phone)) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;

      case 1: // Account Security
        if (!formData.password) {
          errors.password = 'Password is required';
        } else {
          if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
          } else if (!/(?=.*[a-z])/.test(formData.password)) {
            errors.password = 'Password must contain at least one lowercase letter';
          } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            errors.password = 'Password must contain at least one uppercase letter';
          } else if (!/(?=.*\d)/.test(formData.password)) {
            errors.password = 'Password must contain at least one number';
          }
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2: // Address Details
        if (!formData.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.postalCode.trim()) {
          errors.postalCode = 'Postal code is required';
        } else if (!/^\d{5,10}$/.test(formData.postalCode)) {
          errors.postalCode = 'Please enter a valid postal code';
        }
        break;

      case 3: // Review & Submit
        if (!formData.termsAccepted) {
          errors.termsAccepted = 'You must accept the terms and conditions';
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
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
        role: 'customer',
        addresses: [{
          label: formData.addressLabel,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          isDefault: true
        }],
        preferences: {
          dietaryRestrictions: formData.dietaryRestrictions,
          favoriteCuisines: formData.favoriteCuisines,
          spiceLevel: formData.spiceLevel as 'mild' | 'medium' | 'hot' | 'extra_hot',
          notificationsEnabled: formData.emailNotifications,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications
        },
        termsAccepted: formData.termsAccepted,
        marketingConsent: formData.marketingConsent
      });

      setSuccessDialog(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    navigate('/dashboard');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
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
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value ? new Date(e.target.value) : null)}
                error={!!validationErrors.dateOfBirth}
                helperText={validationErrors.dateOfBirth || 'Optional - helps us personalize your experience'}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                Account Security
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!validationErrors.password}
                helperText={validationErrors.password || 'Password must be at least 8 characters with uppercase, lowercase, and number'}
                required
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                required
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
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Label"
                value={formData.addressLabel}
                onChange={(e) => handleInputChange('addressLabel', e.target.value)}
                placeholder="e.g., Home, Work, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                error={!!validationErrors.addressLine1}
                helperText={validationErrors.addressLine1}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!validationErrors.city}
                helperText={validationErrors.city}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                error={!!validationErrors.state}
                helperText={validationErrors.state}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                error={!!validationErrors.postalCode}
                helperText={validationErrors.postalCode}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                <Typography variant="body2">
                  Name: {formData.firstName} {formData.lastName}<br />
                  Email: {formData.email}<br />
                  Phone: {formData.phone}<br />
                  {formData.dateOfBirth && `Date of Birth: ${formData.dateOfBirth.toLocaleDateString()}`}<br />
                  {formData.gender && `Gender: ${formData.gender}`}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Address</Typography>
                <Typography variant="body2">
                  {formData.addressLabel}: {formData.addressLine1}<br />
                  {formData.addressLine2 && `${formData.addressLine2}`}<br />
                  {formData.city}, {formData.state} {formData.postalCode}<br />
                  {formData.country}
                </Typography>
              </Paper>
            </Grid>
            

            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the <Button variant="text" size="small">Terms and Conditions</Button> and <Button variant="text" size="small">Privacy Policy</Button>
                  </Typography>
                }
              />
              {validationErrors.termsAccepted && (
                <Typography color="error" variant="caption" display="block">
                  {validationErrors.termsAccepted}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.marketingConsent}
                    onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                  />
                }
                label="I would like to receive promotional offers and updates via email"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Account
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Register your cafe and start publishing your menu to reach more customers
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button variant="text" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessClose}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5">Welcome to Dino!</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Your cafe account has been created successfully. You can now start publishing your menu and managing your restaurant.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={handleSuccessClose} size="large">
            Get Started
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationPage;