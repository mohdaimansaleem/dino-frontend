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
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  StepConnector,
  styled
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
  Verified,
  Security,
  AccountCircle,
  Place,
  Restaurant,
  AttachMoney,
  Category,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { WorkspaceRegistration, VenueLocation, PriceRange } from '../types/api';
import DinoLogo from '../components/DinoLogo';

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

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const ResponsivePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(5),
  },
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
  '&::-webkit-scrollbar': {
    height: 4,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
    borderRadius: 2,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? '#4a4a4a' : '#bdbdbd',
    borderRadius: 2,
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2),
  },
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
    '& .MuiButton-root': {
      width: '100%',
      minHeight: 48,
    },
  },
}));

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
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
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});

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
        // Workspace name validation (matches backend: min_length=5, max_length=100)
        if (!formData.workspaceName.trim()) {
          errors.workspaceName = 'Workspace name is required';
        } else if (formData.workspaceName.length < 5) {
          errors.workspaceName = 'Workspace name must have at least 5 characters';
        } else if (formData.workspaceName.length > 100) {
          errors.workspaceName = 'Workspace name must not exceed 100 characters';
        }

        // Workspace description validation (matches backend: max_length=500, optional)
        if (formData.workspaceDescription && formData.workspaceDescription.length > 500) {
          errors.workspaceDescription = 'Workspace description must not exceed 500 characters';
        }
        break;

      case 1: // Venue Information
        // Venue name validation (matches backend: min_length=1, max_length=100)
        if (!formData.venueName.trim()) {
          errors.venueName = 'Venue name is required';
        } else if (formData.venueName.length < 1) {
          errors.venueName = 'Venue name must have at least 1 character';
        } else if (formData.venueName.length > 100) {
          errors.venueName = 'Venue name must not exceed 100 characters';
        }

        // Venue description validation (matches backend: max_length=1000, optional)
        if (formData.venueDescription && formData.venueDescription.length > 1000) {
          errors.venueDescription = 'Venue description must not exceed 1000 characters';
        }

        // Address validation (matches backend: min_length=5 based on error)
        if (!formData.venueLocation.address.trim()) {
          errors.address = 'Address is required';
        } else if (formData.venueLocation.address.length < 5) {
          errors.address = 'Address must have at least 5 characters';
        }

        // City validation (required)
        if (!formData.venueLocation.city.trim()) {
          errors.city = 'City is required';
        } else if (formData.venueLocation.city.length < 1) {
          errors.city = 'City must have at least 1 character';
        }

        // State validation (required)
        if (!formData.venueLocation.state.trim()) {
          errors.state = 'State is required';
        } else if (formData.venueLocation.state.length < 1) {
          errors.state = 'State must have at least 1 character';
        }

        // Postal code validation (required, min 3 characters based on backend error)
        const postalCode = formData.venueLocation.postal_code || '';
        if (!postalCode.trim()) {
          errors.postal_code = 'Postal code is required';
        } else if (postalCode.length < 3) {
          errors.postal_code = 'Postal code must have at least 3 characters';
        }

        // Landmark validation (optional, max length check)
        if (formData.venueLocation.landmark && formData.venueLocation.landmark.length > 100) {
          errors.landmark = 'Landmark must not exceed 100 characters';
        }

        // Venue phone validation (exactly 10 digits)
        if (!formData.venuePhone.trim()) {
          errors.venuePhone = 'Venue phone number is required';
        } else if (!/^\d{10}$/.test(formData.venuePhone)) {
          errors.venuePhone = 'Phone number must be exactly 10 digits';
        }

        // Venue email validation (required)
        if (!formData.venueEmail.trim()) {
          errors.venueEmail = 'Venue email is required';
        } else {
          // More strict email validation to match backend
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.venueEmail)) {
            errors.venueEmail = 'Please enter a valid email address';
          }
        }


        break;

      case 2: // Owner Account
        // First name validation (matches backend: min_length=1, max_length=50)
        if (!formData.ownerFirstName.trim()) {
          errors.ownerFirstName = 'First name is required';
        } else if (formData.ownerFirstName.length < 1) {
          errors.ownerFirstName = 'First name must have at least 1 character';
        } else if (formData.ownerFirstName.length > 50) {
          errors.ownerFirstName = 'First name must not exceed 50 characters';
        }

        // Last name validation (matches backend: min_length=1, max_length=50)
        if (!formData.ownerLastName.trim()) {
          errors.ownerLastName = 'Last name is required';
        } else if (formData.ownerLastName.length < 1) {
          errors.ownerLastName = 'Last name must have at least 1 character';
        } else if (formData.ownerLastName.length > 50) {
          errors.ownerLastName = 'Last name must not exceed 50 characters';
        }

        // Email validation (matches backend EmailStr validation)
        if (!formData.ownerEmail.trim()) {
          errors.ownerEmail = 'Email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.ownerEmail)) {
            errors.ownerEmail = 'Please enter a valid email address';
          }
        }

        // Phone validation (exactly 10 digits)
        if (!formData.ownerPhone.trim()) {
          errors.ownerPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.ownerPhone)) {
          errors.ownerPhone = 'Phone number must be exactly 10 digits';
        }

        // Password validation (matches backend exactly)
        if (!formData.ownerPassword) {
          errors.ownerPassword = 'Password is required';
        } else {
          const password = formData.ownerPassword;
          
          // Length validation (matches backend: min_length=8, max_length=128)
          if (password.length < 8) {
            errors.ownerPassword = 'Password must be at least 8 characters long';
          } else if (password.length > 128) {
            errors.ownerPassword = 'Password must not exceed 128 characters';
          }
          // Uppercase letter validation
          else if (!/[A-Z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one uppercase letter';
          }
          // Lowercase letter validation
          else if (!/[a-z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one lowercase letter';
          }
          // Digit validation
          else if (!/\d/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one digit';
          }
          // Special character validation (matches backend pattern)
          else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
          }
        }

        // Confirm password validation
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
      setBackendErrors({}); // Clear backend errors when moving to next step
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
    setBackendErrors({}); // Clear backend errors when moving back
  };

  const handleInputChange = (field: string, value: any) => {
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
    
    // Clear validation error for this field (handle nested fields)
    const errorKey = field.startsWith('venueLocation.') ? field.split('.')[1] : field;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
    
    // Clear backend error for this field
    if (backendErrors[errorKey]) {
      setBackendErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }

    // Real-time validation for immediate feedback
    validateFieldRealTime(field, value);
  };

  const validateFieldRealTime = (field: string, value: any) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'workspaceName':
        if (value && value.length > 0 && value.length < 5) {
          errors.workspaceName = 'Workspace name must have at least 5 characters';
        } else if (value && value.length > 100) {
          errors.workspaceName = 'Workspace name must not exceed 100 characters';
        }
        break;
      
      case 'workspaceDescription':
        if (value && value.length > 500) {
          errors.workspaceDescription = 'Description must not exceed 500 characters';
        }
        break;

      case 'venueName':
        if (value && value.length > 100) {
          errors.venueName = 'Venue name must not exceed 100 characters';
        }
        break;

      case 'venueDescription':
        if (value && value.length > 1000) {
          errors.venueDescription = 'Description must not exceed 1000 characters';
        }
        break;

      case 'venueLocation.address':
        if (value && value.length > 0 && value.length < 5) {
          errors.address = 'Address must have at least 5 characters';
        }
        break;

      case 'venueLocation.postal_code':
        if (value && typeof value === 'string') {
          if (value.length > 0 && value.length < 3) {
            errors.postal_code = 'Postal code must have at least 3 characters';
          } else if (value.length > 6) {
            errors.postal_code = 'Postal code must not exceed 6 digits';
          } else if (!/^\d*$/.test(value)) {
            errors.postal_code = 'Postal code must contain only numbers';
          }
        }
        break;

      case 'venuePhone':
        if (value && value.trim() && !/^\d{10}$/.test(value)) {
          errors.venuePhone = 'Phone number must be exactly 10 digits';
        }
        break;

      case 'venueEmail':
        if (value && value.trim()) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            errors.venueEmail = 'Please enter a valid email address';
          }
        }
        break;

      case 'ownerFirstName':
        if (value && value.length > 50) {
          errors.ownerFirstName = 'First name must not exceed 50 characters';
        }
        break;

      case 'ownerLastName':
        if (value && value.length > 50) {
          errors.ownerLastName = 'Last name must not exceed 50 characters';
        }
        break;

      case 'ownerEmail':
        if (value && value.trim()) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            errors.ownerEmail = 'Please enter a valid email address';
          }
        }
        break;

      case 'ownerPhone':
        if (value && value.trim() && !/^\d{10}$/.test(value)) {
          errors.ownerPhone = 'Phone number must be exactly 10 digits';
        }
        break;

      case 'ownerPassword':
        if (value) {
          if (value.length > 128) {
            errors.ownerPassword = 'Password must not exceed 128 characters';
          } else if (value.length >= 8) {
            // Only show detailed validation once minimum length is met
            if (!/[A-Z]/.test(value)) {
              errors.ownerPassword = 'Password must contain at least one uppercase letter';
            } else if (!/[a-z]/.test(value)) {
              errors.ownerPassword = 'Password must contain at least one lowercase letter';
            } else if (!/\d/.test(value)) {
              errors.ownerPassword = 'Password must contain at least one digit';
            } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) {
              errors.ownerPassword = 'Password must contain at least one special character';
            }
          }
        }
        break;

      case 'confirmPassword':
        if (value && formData.ownerPassword && value !== formData.ownerPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    // Update validation errors with real-time feedback
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  // Helper function to parse backend validation errors
  const parseBackendErrors = (error: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Check both direct response and preserved response from apiService
    const errorData = error.response?.data || (error as any).response?.data;
    
    if (errorData?.detail && Array.isArray(errorData.detail)) {
      errorData.detail.forEach((validationError: any) => {
        if (validationError.loc && validationError.msg) {
          // Extract field name from location array
          const fieldPath = validationError.loc;
          let fieldName = '';
          
          // Handle nested field paths like ["body", "venue_location", "postal_code"]
          if (fieldPath.length >= 2) {
            if (fieldPath[1] === 'venue_location' && fieldPath[2]) {
              fieldName = fieldPath[2]; // postal_code, address, etc.
            } else if (fieldPath[1]) {
              fieldName = fieldPath[1]; // venue_email, owner_email, etc.
            }
          }
          
          if (fieldName) {
            // Convert backend field names to frontend field names
            const fieldMapping: Record<string, string> = {
              'venue_email': 'venueEmail',
              'venue_phone': 'venuePhone',
              'venue_name': 'venueName',
              'venue_description': 'venueDescription',
              'workspace_name': 'workspaceName',
              'workspace_description': 'workspaceDescription',
              'owner_email': 'ownerEmail',
              'owner_phone': 'ownerPhone',
              'owner_first_name': 'ownerFirstName',
              'owner_last_name': 'ownerLastName',
              'owner_password': 'ownerPassword',
              'postal_code': 'postal_code',
              'address': 'address',
              'city': 'city',
              'state': 'state',
              'landmark': 'landmark'
            };
            
            const frontendFieldName = fieldMapping[fieldName] || fieldName;
            
            // Convert technical error messages to user-friendly ones
            let userFriendlyMessage = validationError.msg;
            
            if (validationError.type === 'string_too_short') {
              const minLength = validationError.ctx?.min_length || 1;
              userFriendlyMessage = `This field must have at least ${minLength} character${minLength > 1 ? 's' : ''}`;
            } else if (validationError.type === 'string_too_long') {
              const maxLength = validationError.ctx?.max_length || 100;
              userFriendlyMessage = `This field must not exceed ${maxLength} characters`;
            } else if (validationError.type === 'value_error' && validationError.msg.includes('email')) {
              userFriendlyMessage = 'Please enter a valid email address';
            } else if (validationError.type === 'missing') {
              userFriendlyMessage = 'This field is required';
            }
            
            errors[frontendFieldName] = userFriendlyMessage;
          }
        }
      });
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return; // Validate owner account step

    setLoading(true);
    setError(null);
    setBackendErrors({});

    try {

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

      const response = await authService.registerWorkspace(registrationData);
      
      // Handle success case - authService.registerWorkspace always returns success: true with data
      setSuccessData(response);
      setSuccessDialog(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Parse backend validation errors
      const parsedErrors = parseBackendErrors(err);
      
      if (Object.keys(parsedErrors).length > 0) {
        setBackendErrors(parsedErrors);
        setError('Please fix the highlighted errors and try again.');
        
        // Go back to the step with errors
        const errorFields = Object.keys(parsedErrors);
        if (errorFields.some(field => ['workspaceName', 'workspaceDescription'].includes(field))) {
          setActiveStep(0);
        } else if (errorFields.some(field => 
          ['venueName', 'venueDescription', 'venueEmail', 'venuePhone', 'address', 'city', 'state', 'postal_code', 'landmark'].includes(field)
        )) {
          setActiveStep(1);
        } else if (errorFields.some(field => 
          ['ownerFirstName', 'ownerLastName', 'ownerEmail', 'ownerPhone', 'ownerPassword'].includes(field)
        )) {
          setActiveStep(2);
        }
      } else {
        // Handle general error messages - show detailed error popup
        let displayErrorMessage = 'Registration failed. Please try again.';
        
        // Check for backend error response (err.response is preserved by apiService.handleError)
        const errorResponse = err.response?.data || (err as any).response?.data;
        if (errorResponse) {
          const errorData = errorResponse;
          
          // Handle direct message
          if (errorData.message) {
            displayErrorMessage = errorData.message;
          }
          // Handle detail field (string or array)
          else if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              displayErrorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              // Create detailed error messages from validation errors
              const errorMessages = errorData.detail.map((error: any) => {
                let message = '';
                
                // Extract field name for context
                let fieldName = 'Field';
                if (error.loc && Array.isArray(error.loc)) {
                  if (error.loc.length >= 2) {
                    if (error.loc[1] === 'venue_location' && error.loc[2]) {
                      fieldName = error.loc[2].replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    } else if (error.loc[1]) {
                      fieldName = error.loc[1].replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    }
                  }
                }
                
                // Create user-friendly error message
                if (error.type === 'string_too_short') {
                  const minLength = error.ctx?.min_length || 1;
                  message = `${fieldName}: Must have at least ${minLength} character${minLength > 1 ? 's' : ''}`;
                } else if (error.type === 'string_too_long') {
                  const maxLength = error.ctx?.max_length || 100;
                  message = `${fieldName}: Must not exceed ${maxLength} characters`;
                } else if (error.type === 'value_error' && error.msg.includes('email')) {
                  message = `${fieldName}: Please enter a valid email address`;
                } else if (error.type === 'missing') {
                  message = `${fieldName}: This field is required`;
                } else if (error.msg) {
                  message = `${fieldName}: ${error.msg}`;
                } else {
                  message = `${fieldName}: Invalid input`;
                }
                
                return message;
              });
              
              displayErrorMessage = 'Please fix the following errors:\n\n• ' + errorMessages.join('\n• ');
            }
          }
        }
        // Handle network or other errors
        else if (err.message && err.message !== '[object Object]') {
          displayErrorMessage = err.message;
        }
        setErrorMessage(displayErrorMessage);
        setErrorDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    navigate('/login');
  };

  const handleErrorClose = () => {
    setErrorDialog(false);
    setErrorMessage('');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Workspace Details
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <Business color="primary" />
                Workspace Information
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              >
                Set up your business workspace that will contain all your venues
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workspace Name"
                value={formData.workspaceName}
                onChange={(e) => handleInputChange('workspaceName', e.target.value)}
                error={hasFieldError('workspaceName')}
                helperText={getFieldError('workspaceName') || `This will be your main business identifier (${formData.workspaceName.length}/100)`}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workspace Description"
                value={formData.workspaceDescription}
                onChange={(e) => handleInputChange('workspaceDescription', e.target.value)}
                multiline
                rows={isMobile ? 2 : 3}
                error={hasFieldError('workspaceDescription')}
                helperText={getFieldError('workspaceDescription') || `Brief description of your business (optional) (${formData.workspaceDescription.length}/500)`}
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1: // Venue Information
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <Store color="primary" />
                Venue Details
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              >
                Configure your first venue under this workspace
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Name"
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                error={hasFieldError('venueName')}
                helperText={getFieldError('venueName')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                <InputLabel>Venue Type</InputLabel>
                <Select
                  value={formData.venueType}
                  label="Venue Type"
                  onChange={(e) => handleInputChange('venueType', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: { xs: '1rem', sm: '1rem' }
                    }
                  }}
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
                rows={isMobile ? 2 : 2}
                error={hasFieldError('venueDescription')}
                helperText={getFieldError('venueDescription') || `Describe your venue's atmosphere and specialties (${formData.venueDescription.length}/1000)`}
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? "body1" : "subtitle1"} 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mt: { xs: 1, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 500
                }}
              >
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
                error={hasFieldError('address')}
                helperText={getFieldError('address')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.venueLocation.city}
                onChange={(e) => handleInputChange('venueLocation.city', e.target.value)}
                error={hasFieldError('city')}
                helperText={getFieldError('city')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.venueLocation.state}
                onChange={(e) => handleInputChange('venueLocation.state', e.target.value)}
                error={hasFieldError('state')}
                helperText={getFieldError('state')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.venueLocation.postal_code}
                onChange={(e) => handleInputChange('venueLocation.postal_code', e.target.value)}
                error={hasFieldError('postal_code')}
                required
                helperText={getFieldError('postal_code') || 'Enter 6-digit postal code'}
                size={isMobile ? "medium" : "medium"}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.venueLocation.country}
                onChange={(e) => handleInputChange('venueLocation.country', e.target.value)}
                disabled
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                value={formData.venueLocation.landmark}
                onChange={(e) => handleInputChange('venueLocation.landmark', e.target.value)}
                helperText="Nearby landmark to help customers find you"
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? "body1" : "subtitle1"} 
                gutterBottom 
                sx={{ 
                  mt: { xs: 1, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 500
                }}
              >
                Contact & Business Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Phone"
                value={formData.venuePhone}
                onChange={(e) => handleInputChange('venuePhone', e.target.value)}
                error={hasFieldError('venuePhone')}
                helperText={getFieldError('venuePhone') || 'Required: Exactly 10 digits'}
                required
                size={isMobile ? "medium" : "medium"}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize={isMobile ? "small" : "medium"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Email"
                value={formData.venueEmail}
                onChange={(e) => handleInputChange('venueEmail', e.target.value)}
                error={hasFieldError('venueEmail')}
                helperText={getFieldError('venueEmail') || 'Required: Business email address'}
                size={isMobile ? "medium" : "medium"}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize={isMobile ? "small" : "medium"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            

            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={formData.priceRange}
                  label="Price Range"
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: { xs: '1rem', sm: '1rem' }
                    }
                  }}
                >
                  {priceRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                        {option.label}
                      </Typography>
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <Person color="primary" />
                Owner Account
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              >
                Create your admin account to manage the workspace and venue
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.ownerFirstName}
                onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                error={hasFieldError('ownerFirstName')}
                helperText={getFieldError('ownerFirstName')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.ownerLastName}
                onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                error={hasFieldError('ownerLastName')}
                helperText={getFieldError('ownerLastName')}
                required
                size={isMobile ? "medium" : "medium"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                error={hasFieldError('ownerEmail')}
                helperText={getFieldError('ownerEmail')}
                required
                size={isMobile ? "medium" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize={isMobile ? "small" : "medium"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                error={hasFieldError('ownerPhone')}
                helperText={getFieldError('ownerPhone') || 'Required: Exactly 10 digits'}
                required
                size={isMobile ? "medium" : "medium"}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize={isMobile ? "small" : "medium"} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
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
                error={hasFieldError('ownerPassword')}
                helperText={getFieldError('ownerPassword') || 'Required: 8-128 characters with uppercase, lowercase, digit, and special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'}
                required
                size={isMobile ? "medium" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
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
                error={hasFieldError('confirmPassword')}
                helperText={getFieldError('confirmPassword')}
                required
                size={isMobile ? "medium" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 3: // Review & Submit
        return (
          <Box sx={{ 
            background: 'linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%)',
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            position: 'relative',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                mb: 2,
                boxShadow: '0 4px 16px rgba(44, 62, 80, 0.2)'
              }}>
                <Verified sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: '#2c3e50',
                  mb: 1
                }}
              >
                Review Your Information
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                Please review all information before creating your workspace
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Workspace Information Card */}
              <Grid item xs={12} lg={4}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    p: 2.5,
                    color: 'white',
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Business sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          Workspace
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                          Business Identity
                        </Typography>
                      </Box>
                    </Box>
                    <CheckCircle 
                      sx={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: 20,
                        color: '#27ae60'
                      }} 
                    />
                  </Box>
                  
                  {/* Card Content */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                        Workspace Name
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                        {formData.workspaceName}
                      </Typography>
                    </Box>
                    
                    {formData.workspaceDescription && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 0.5, color: 'text.primary' }}>
                          {formData.workspaceDescription}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Venue Information Card */}
              <Grid item xs={12} lg={8}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #5d6d7e 0%, #34495e 100%)',
                    p: 2.5,
                    color: 'white',
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Restaurant sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          Venue Details
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                          Restaurant Information
                        </Typography>
                      </Box>
                    </Box>
                    <CheckCircle 
                      sx={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: 20,
                        color: '#27ae60'
                      }} 
                    />
                  </Box>
                  
                  {/* Card Content */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12} sm={6} md={12} lg={6}>
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Venue Name
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                            {formData.venueName}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Type
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Category sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body1" fontWeight="500" color="text.primary">
                              {formData.venueType.charAt(0).toUpperCase() + formData.venueType.slice(1).replace('_', ' ')}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Price Range
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AttachMoney sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.primary' }}>
                              {priceRangeOptions.find(p => p.value === formData.priceRange)?.label}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={12} lg={6}>
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Address
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                            <Place sx={{ fontSize: 16, color: '#7f8c8d', mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.primary' }}>
                                {formData.venueLocation.address}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {formData.venueLocation.city}, {formData.venueLocation.state} {formData.venueLocation.postal_code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {formData.venueLocation.country}
                              </Typography>
                              {formData.venueLocation.landmark && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                                  Near {formData.venueLocation.landmark}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {(formData.venuePhone || formData.venueEmail) && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                              Contact
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {formData.venuePhone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Phone sx={{ fontSize: 16, color: '#7f8c8d' }} />
                                  <Typography variant="body2" color="text.primary">
                                    {formData.venuePhone}
                                  </Typography>
                                </Box>
                              )}
                              {formData.venueEmail && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Email sx={{ fontSize: 16, color: '#7f8c8d' }} />
                                  <Typography variant="body2" color="text.primary">
                                    {formData.venueEmail}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Grid>
                      
                      {formData.venueDescription && (
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                              Description
                            </Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 0.5, color: 'text.primary' }}>
                              {formData.venueDescription}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              {/* Owner Account Card */}
              <Grid item xs={12}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    p: 2.5,
                    color: 'white',
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AccountCircle sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          Owner Account
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                          Super Admin Access
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Security sx={{ fontSize: 18, color: '#f39c12' }} />
                      <CheckCircle sx={{ fontSize: 20, color: '#27ae60' }} />
                    </Box>
                  </Box>
                  
                  {/* Card Content */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Full Name
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                            {formData.ownerFirstName} {formData.ownerLastName}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Email Address
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Email sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body1" color="text.primary">
                              {formData.ownerEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                            Phone Number
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Phone sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body1" color="text.primary">
                              {formData.ownerPhone}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2.5, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%)',
                          border: '1px solid rgba(52, 73, 94, 0.15)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Security sx={{ fontSize: 20, color: '#f39c12' }} />
                            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                              Super Admin Privileges
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            As the workspace owner, you'll have full administrative access to manage venues, users, menus, orders, and all system settings.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            {/* Summary Footer */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 2, 
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <DinoLogo size={24} animated={true} />
                  Ready to Launch Your Digital Restaurant
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Create Workspace" to set up your complete restaurant management system
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer maxWidth="md">
      <ResponsivePaper elevation={3}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          align="center" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            fontWeight: 600,
            mb: { xs: 2, sm: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <DinoLogo size={isMobile ? 28 : 32} animated={true} />
            Create Your Dino Workspace
          </Box>
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 3, sm: 4 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1, sm: 2 }
          }}
        >
          Set up your complete restaurant management workspace with venues and team
        </Typography>

        <StepperContainer>
          <Stepper 
            activeStep={activeStep} 
            connector={<ResponsiveStepConnector />}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "horizontal" : "horizontal"}
            sx={{
              minWidth: isMobile ? '100%' : 'auto',
              '& .MuiStepper-root': {
                padding: 0,
              },
            }}
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
                mt: 1, 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
            </Typography>
          )}
        </StepperContainer>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          {renderStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <NavigationContainer>
          {!isMobile && (
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              size={isMobile ? "large" : "medium"}
              sx={{ 
                minWidth: { xs: '100%', sm: 120 },
                order: { xs: 2, sm: 1 }
              }}
            >
              Back
            </Button>
          )}
          
          {isMobile && (
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
                sx={{ flex: 1 }}
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
                  sx={{ flex: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Workspace'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                  sx={{ flex: 1 }}
                >
                  Next
                </Button>
              )}
            </Stack>
          )}
          
          {!isMobile && (
            <>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  size="large"
                  sx={{ 
                    minWidth: 180,
                    order: { xs: 1, sm: 2 }
                  }}
                >
                  {loading ? 'Creating Workspace...' : 'Create Workspace'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                  sx={{ 
                    minWidth: 120,
                    order: { xs: 1, sm: 2 }
                  }}
                >
                  Next
                </Button>
              )}
            </>
          )}
        </NavigationContainer>

        <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '0.875rem' }
            }}
          >
            Already have an account?{' '}
            <Button 
              variant="text" 
              onClick={() => navigate('/login')}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                textTransform: 'none'
              }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </ResponsivePaper>

      {/* Success Dialog */}
      <Dialog 
        open={successDialog} 
        onClose={handleSuccessClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxHeight: { xs: 'calc(100% - 64px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          p: { xs: 2, sm: 3 }
        }}>
          <CheckCircle 
            color="success" 
            sx={{ 
              fontSize: { xs: 48, sm: 60 }, 
              mb: { xs: 1, sm: 2 } 
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Workspace Created Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            align="center" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {successData?.message || 'Your workspace and venue have been created successfully. You can now sign in and start managing your restaurant.'}
          </Typography>
          
          {successData && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                Account Details:
              </Typography>
              
              {successData.data?.workspace && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Workspace: <strong>{successData.data.workspace.name}</strong>
                  </Typography>
                </Box>
              )}
              
              {successData.data?.venue && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Venue: <strong>{successData.data.venue.name}</strong>
                  </Typography>
                </Box>
              )}
              
              {successData.data?.owner && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Owner: <strong>{successData.data.owner.first_name} {successData.data.owner.last_name}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Role: <strong>{successData.data.owner.role_name}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          p: { xs: 2, sm: 3 },
          pt: { xs: 1, sm: 2 }
        }}>
          <Button 
            variant="contained" 
            onClick={handleSuccessClose} 
            size={isMobile ? "medium" : "large"}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog 
        open={errorDialog} 
        onClose={handleErrorClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxHeight: { xs: 'calc(100% - 64px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          p: { xs: 2, sm: 3 }
        }}>
          <ErrorIcon 
            color="error" 
            sx={{ 
              fontSize: { xs: 48, sm: 60 }, 
              mb: { xs: 1, sm: 2 } 
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Registration Failed
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {errorMessage.includes('\n•') ? (
            <Box>
              <Typography 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500
                }}
              >
                {errorMessage.split('\n\n')[0]}
              </Typography>
              <Box 
                sx={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: 1,
                  p: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    '& > div': {
                      mb: 0.5
                    }
                  }}
                >
                  {errorMessage.split('\n\n')[1]?.split('\n').map((line: string, index: number) => (
                    <div key={index}>{line}</div>
                  ))}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography 
              align="center"
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          p: { xs: 2, sm: 3 },
          pt: { xs: 1, sm: 2 }
        }}>
          <Button 
            variant="contained" 
            onClick={handleErrorClose} 
            size={isMobile ? "medium" : "large"}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default RegistrationPage;