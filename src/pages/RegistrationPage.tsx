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
  CircularProgress,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Store,
  Person,
  CheckCircle,
  LocationOn,
  Email,
  Phone,
  Language
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { WorkspaceRegistration, VenueLocation, PriceRange } from '../types/api';

interface RegistrationFormData {
  // Workspace Information
  workspaceName: string;
  workspaceDescription: string;
  
  // Venue Information
  venueName: string;
  venueDescription: string;
  venueLocation: VenueLocation;
  venuePhone: string;
  venueEmail: string;
  venueWebsite: string;
  priceRange: PriceRange;
  venueType: string;
  
  // Owner Information
  ownerEmail: string;
  ownerPhone: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
  confirmPassword: string;
}

const steps = [
  'Workspace Details',
  'Venue Information', 
  'Owner Account',
  'Review & Submit'
];

const priceRangeOptions = [
  { value: 'budget', label: 'Budget (₹ - Under ₹500 per person)' },
  { value: 'mid_range', label: 'Mid Range (₹₹ - ₹500-₹1500 per person)' },
  { value: 'premium', label: 'Premium (₹₹₹ - ₹1500-₹3000 per person)' },
  { value: 'luxury', label: 'Luxury (₹₹₹₹ - Above ₹3000 per person)' }
];

const venueTypeOptions = [
  'restaurant',
  'cafe',
  'bar',
  'fast_food',
  'fine_dining',
  'bakery',
  'food_truck',
  'cloud_kitchen',
  'other'
];

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    // Workspace Information
    workspaceName: '',
    workspaceDescription: '',
    
    // Venue Information
    venueName: '',
    venueDescription: '',
    venueLocation: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      landmark: ''
    },
    venuePhone: '',
    venueEmail: '',
    venueWebsite: '',
    priceRange: 'mid_range',
    venueType: 'restaurant',
    
    // Owner Information
    ownerEmail: '',
    ownerPhone: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Workspace Details
        if (!formData.workspaceName.trim()) {
          errors.workspaceName = 'Workspace name is required';
        } else if (formData.workspaceName.length < 3) {
          errors.workspaceName = 'Workspace name must be at least 3 characters';
        }
        break;

      case 1: // Venue Information
        if (!formData.venueName.trim()) {
          errors.venueName = 'Venue name is required';
        }
        if (!formData.venueLocation.address.trim()) {
          errors.address = 'Address is required';
        }
        if (!formData.venueLocation.city.trim()) {
          errors.city = 'City is required';
        }
        if (!formData.venueLocation.state.trim()) {
          errors.state = 'State is required';
        }
        if (!formData.venueLocation.postal_code.trim()) {
          errors.postal_code = 'Postal code is required';
        } else if (!/^\d{5,6}$/.test(formData.venueLocation.postal_code)) {
          errors.postal_code = 'Please enter a valid postal code';
        }
        if (formData.venuePhone && !/^[+]?[1-9]?[0-9]{7,15}$/.test(formData.venuePhone)) {
          errors.venuePhone = 'Please enter a valid phone number';
        }
        if (formData.venueEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.venueEmail)) {
          errors.venueEmail = 'Please enter a valid email address';
        }
        break;

      case 2: // Owner Account
        if (!formData.ownerFirstName.trim()) {
          errors.ownerFirstName = 'First name is required';
        }
        if (!formData.ownerLastName.trim()) {
          errors.ownerLastName = 'Last name is required';
        }
        if (!formData.ownerEmail.trim()) {
          errors.ownerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          errors.ownerEmail = 'Please enter a valid email address';
        }
        if (formData.ownerPhone && !/^[+]?[1-9]?[0-9]{7,15}$/.test(formData.ownerPhone)) {
          errors.ownerPhone = 'Please enter a valid phone number';
        }
        if (!formData.ownerPassword) {
          errors.ownerPassword = 'Password is required';
        } else {
          if (formData.ownerPassword.length < 8) {
            errors.ownerPassword = 'Password must be at least 8 characters long';
          } else if (!/(?=.*[a-z])/.test(formData.ownerPassword)) {
            errors.ownerPassword = 'Password must contain at least one lowercase letter';
          } else if (!/(?=.*[A-Z])/.test(formData.ownerPassword)) {
            errors.ownerPassword = 'Password must contain at least one uppercase letter';
          } else if (!/(?=.*\d)/.test(formData.ownerPassword)) {
            errors.ownerPassword = 'Password must contain at least one number';
          } else if (!/(?=.*[!@#$%^&*])/.test(formData.ownerPassword)) {
            errors.ownerPassword = 'Password must contain at least one special character';
          }
        }
        if (formData.ownerPassword !== formData.confirmPassword) {
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
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleInputChange = (field: string, value: any) => {
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
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return; // Validate owner account step

    setLoading(true);
    setError(null);

    try {
      const registrationData: WorkspaceRegistration = {
        workspace_name: formData.workspaceName,
        workspace_description: formData.workspaceDescription,
        venue_name: formData.venueName,
        venue_description: formData.venueDescription,
        venue_location: formData.venueLocation,
        venue_phone: formData.venuePhone,
        venue_email: formData.venueEmail,
        venue_website: formData.venueWebsite,
        price_range: formData.priceRange,
        venue_type: formData.venueType,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        owner_first_name: formData.ownerFirstName,
        owner_last_name: formData.ownerLastName,
        owner_password: formData.ownerPassword,
        confirm_password: formData.confirmPassword
      };

      const response = await authService.registerWorkspace(registrationData);
      setSuccessData(response.data);
      setSuccessDialog(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    navigate('/login');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Workspace Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" />
                Workspace Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set up your business workspace that will contain all your venues
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workspace Name"
                value={formData.workspaceName}
                onChange={(e) => handleInputChange('workspaceName', e.target.value)}
                error={!!validationErrors.workspaceName}
                helperText={validationErrors.workspaceName || 'This will be your main business identifier'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workspace Description"
                value={formData.workspaceDescription}
                onChange={(e) => handleInputChange('workspaceDescription', e.target.value)}
                multiline
                rows={3}
                helperText="Brief description of your business (optional)"
              />
            </Grid>
          </Grid>
        );

      case 1: // Venue Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store color="primary" />
                Venue Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure your first venue under this workspace
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Name"
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                error={!!validationErrors.venueName}
                helperText={validationErrors.venueName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Venue Type</InputLabel>
                <Select
                  value={formData.venueType}
                  label="Venue Type"
                  onChange={(e) => handleInputChange('venueType', e.target.value)}
                >
                  {venueTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue Description"
                value={formData.venueDescription}
                onChange={(e) => handleInputChange('venueDescription', e.target.value)}
                multiline
                rows={2}
                helperText="Describe your venue's atmosphere and specialties"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <LocationOn color="primary" />
                Location Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.venueLocation.address}
                onChange={(e) => handleInputChange('venueLocation.address', e.target.value)}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.venueLocation.city}
                onChange={(e) => handleInputChange('venueLocation.city', e.target.value)}
                error={!!validationErrors.city}
                helperText={validationErrors.city}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.venueLocation.state}
                onChange={(e) => handleInputChange('venueLocation.state', e.target.value)}
                error={!!validationErrors.state}
                helperText={validationErrors.state}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.venueLocation.postal_code}
                onChange={(e) => handleInputChange('venueLocation.postal_code', e.target.value)}
                error={!!validationErrors.postal_code}
                helperText={validationErrors.postal_code}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.venueLocation.country}
                onChange={(e) => handleInputChange('venueLocation.country', e.target.value)}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                value={formData.venueLocation.landmark}
                onChange={(e) => handleInputChange('venueLocation.landmark', e.target.value)}
                helperText="Nearby landmark to help customers find you"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Contact & Business Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Phone"
                value={formData.venuePhone}
                onChange={(e) => handleInputChange('venuePhone', e.target.value)}
                error={!!validationErrors.venuePhone}
                helperText={validationErrors.venuePhone}
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
                label="Venue Email"
                value={formData.venueEmail}
                onChange={(e) => handleInputChange('venueEmail', e.target.value)}
                error={!!validationErrors.venueEmail}
                helperText={validationErrors.venueEmail}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website (Optional)"
                value={formData.venueWebsite}
                onChange={(e) => handleInputChange('venueWebsite', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={formData.priceRange}
                  label="Price Range"
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                >
                  {priceRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Average cost per person</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2: // Owner Account
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Owner Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your admin account to manage the workspace and venue
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.ownerFirstName}
                onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                error={!!validationErrors.ownerFirstName}
                helperText={validationErrors.ownerFirstName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.ownerLastName}
                onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                error={!!validationErrors.ownerLastName}
                helperText={validationErrors.ownerLastName}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                error={!!validationErrors.ownerEmail}
                helperText={validationErrors.ownerEmail}
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
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                error={!!validationErrors.ownerPhone}
                helperText={validationErrors.ownerPhone}
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
                onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                error={!!validationErrors.ownerPassword}
                helperText={validationErrors.ownerPassword || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'}
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

      case 3: // Review & Submit
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review all information before submitting
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Workspace Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.workspaceName}<br />
                  {formData.workspaceDescription && (
                    <>
                      <strong>Description:</strong> {formData.workspaceDescription}<br />
                    </>
                  )}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Venue Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.venueName}<br />
                  <strong>Type:</strong> {formData.venueType.charAt(0).toUpperCase() + formData.venueType.slice(1).replace('_', ' ')}<br />
                  {formData.venueDescription && (
                    <>
                      <strong>Description:</strong> {formData.venueDescription}<br />
                    </>
                  )}
                  <strong>Address:</strong> {formData.venueLocation.address}<br />
                  <strong>City:</strong> {formData.venueLocation.city}, {formData.venueLocation.state} {formData.venueLocation.postal_code}<br />
                  <strong>Country:</strong> {formData.venueLocation.country}<br />
                  {formData.venueLocation.landmark && (
                    <>
                      <strong>Landmark:</strong> {formData.venueLocation.landmark}<br />
                    </>
                  )}
                  {formData.venuePhone && (
                    <>
                      <strong>Phone:</strong> {formData.venuePhone}<br />
                    </>
                  )}
                  {formData.venueEmail && (
                    <>
                      <strong>Email:</strong> {formData.venueEmail}<br />
                    </>
                  )}
                  {formData.venueWebsite && (
                    <>
                      <strong>Website:</strong> {formData.venueWebsite}<br />
                    </>
                  )}
                  <strong>Price Range:</strong> {priceRangeOptions.find(p => p.value === formData.priceRange)?.label}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Owner Account
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.ownerFirstName} {formData.ownerLastName}<br />
                  <strong>Email:</strong> {formData.ownerEmail}<br />
                  {formData.ownerPhone && (
                    <>
                      <strong>Phone:</strong> {formData.ownerPhone}<br />
                    </>
                  )}
                  <strong>Role:</strong> Super Admin (Workspace Owner)
                </Typography>
              </Paper>
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
          🦕 Create Your Dino Workspace
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Set up your complete restaurant management workspace with venues and team
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

        <Divider sx={{ my: 3 }} />

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
              size="large"
            >
              {loading ? 'Creating Workspace...' : 'Create Workspace'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              size="large"
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
      <Dialog open={successDialog} onClose={handleSuccessClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5">Workspace Created Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography align="center" sx={{ mb: 2 }}>
            Your workspace and venue have been created successfully. You can now sign in and start managing your restaurant.
          </Typography>
          
          {successData && (
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                What's Next:
              </Typography>
              <Typography variant="body2" component="div">
                {successData.next_steps?.map((step: string, index: number) => (
                  <div key={index}>• {step}</div>
                ))}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={handleSuccessClose} size="large">
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationPage;