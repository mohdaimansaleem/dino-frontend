/**
 * StandardForm Component
 * 
 * A reusable form component that demonstrates the use of the centralized
 * validation system and provides consistent form styling and behavior.
 */

import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators, validationRules, type ValidationRules } from '../../utils/validation';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  autoComplete?: string;
}

interface StandardFormProps<T extends Record<string, any>> {
  /**
   * Form fields configuration
   */
  fields: FormField[];
  
  /**
   * Initial form values
   */
  initialValues: T;
  
  /**
   * Validation rules for form fields
   */
  validationRules: ValidationRules<T>;
  
  /**
   * Form submission handler
   */
  onSubmit: (values: T) => Promise<void> | void;
  
  /**
   * Form title
   */
  title?: string;
  
  /**
   * Submit button text
   */
  submitText?: string;
  
  /**
   * Whether to show success message after submission
   */
  showSuccessMessage?: boolean;
  
  /**
   * Custom success message
   */
  successMessage?: string;
  
  /**
   * Whether to reset form after successful submission
   */
  resetOnSuccess?: boolean;
  
  /**
   * Additional form actions (e.g., cancel button)
   */
  actions?: React.ReactNode;
  
  /**
   * Form layout direction
   */
  direction?: 'column' | 'row';
  
  /**
   * Maximum width of the form
   */
  maxWidth?: number | string;
  
  /**
   * Whether to disable the form
   */
  disabled?: boolean;
}

export function StandardForm<T extends Record<string, any>>({
  fields,
  initialValues,
  validationRules,
  onSubmit,
  title,
  submitText = 'Submit',
  showSuccessMessage = false,
  successMessage = 'Form submitted successfully!',
  resetOnSuccess = false,
  actions,
  direction = 'column',
  maxWidth = 600,
  disabled = false,
}: StandardFormProps<T>) {
  const theme = useTheme();
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useFormValidation(initialValues, validationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    resetOnSubmit: resetOnSuccess,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (disabled || isSubmitting) return;
    
    setSubmitError(null);
    setSubmitSuccess(false);
    
    if (!validateAll()) {
      return;
    }
    
    try {
      await onSubmit(values);
      
      if (showSuccessMessage) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
      
      if (resetOnSuccess) {
        reset();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An error occurred while submitting the form'
      );
    }
  };

  const getFieldProps = (field: FormField) => {
    const fieldName = field.name as keyof T;
    const hasError = touched[fieldName] && !!errors[fieldName];
    
    return {
      name: field.name,
      label: field.label,
      type: field.type || 'text',
      value: values[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      error: hasError,
      helperText: hasError ? errors[fieldName] : field.helperText,
      placeholder: field.placeholder,
      required: field.required,
      multiline: field.multiline,
      rows: field.rows,
      autoComplete: field.autoComplete,
      disabled: disabled || isSubmitting,
      fullWidth: true,
      variant: 'outlined' as const,
      margin: 'normal' as const,
    };
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth,
        mx: 'auto',
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.shadows[1],
      }}
    >
      {title && (
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
      )}

      {submitSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSubmitSuccess(false)}
        >
          {successMessage}
        </Alert>
      )}

      {submitError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: direction,
          gap: direction === 'row' ? 2 : 0,
          flexWrap: direction === 'row' ? 'wrap' : 'nowrap',
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field.name}
            {...getFieldProps(field)}
            sx={{
              flex: direction === 'row' ? '1 1 300px' : undefined,
              minWidth: direction === 'row' ? '300px' : undefined,
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          {actions}
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          disabled={disabled || isSubmitting || !isValid}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
          sx={{
            minWidth: 120,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1.5,
          }}
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </Button>
      </Box>
    </Box>
  );
}

// Example usage components for common form types

/**
 * Contact Form Example
 */
export const ContactForm: React.FC<{
  onSubmit: (data: { name: string; email: string; message: string }) => Promise<void>;
}> = ({ onSubmit }) => {
  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
      autoComplete: 'name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
      autoComplete: 'email',
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      multiline: true,
      rows: 4,
      placeholder: 'Enter your message',
      helperText: 'Please provide as much detail as possible',
    },
  ];

  const initialValues = {
    name: '',
    email: '',
    message: '',
  };

  const validationRulesConfig = {
    name: validationRules.name('Full Name'),
    email: validationRules.email(),
    message: [
      validators.required('Message'),
      validators.minLength(10, 'Message'),
      validators.maxLength(1000, 'Message'),
    ],
  };

  return (
    <StandardForm
      title="Contact Us"
      fields={fields}
      initialValues={initialValues}
      validationRules={validationRulesConfig}
      onSubmit={onSubmit}
      submitText="Send Message"
      showSuccessMessage
      successMessage="Thank you for your message! We'll get back to you soon."
      resetOnSuccess
    />
  );
};

/**
 * Login Form Example
 */
export const LoginForm: React.FC<{
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
}> = ({ onSubmit, onForgotPassword }) => {
  const fields: FormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter your password',
      autoComplete: 'current-password',
    },
  ];

  const initialValues = {
    email: '',
    password: '',
  };

  const validationRulesConfig = {
    email: validationRules.email(),
    password: [validators.required('Password')], // Don't validate password strength for login
  };

  const actions = onForgotPassword ? (
    <Button
      variant="text"
      onClick={onForgotPassword}
      sx={{ textTransform: 'none' }}
    >
      Forgot Password?
    </Button>
  ) : null;

  return (
    <StandardForm
      title="Sign In"
      fields={fields}
      initialValues={initialValues}
      validationRules={validationRulesConfig}
      onSubmit={onSubmit}
      submitText="Sign In"
      actions={actions}
      maxWidth={400}
    />
  );
};

/**
 * User Registration Form Example
 */
export const UserRegistrationForm: React.FC<{
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const fields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your first name',
      autoComplete: 'given-name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your last name',
      autoComplete: 'family-name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
      autoComplete: 'email',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter your phone number',
      autoComplete: 'tel',
      helperText: 'Enter 10-digit phone number',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Create a strong password',
      autoComplete: 'new-password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      placeholder: 'Confirm your password',
      autoComplete: 'new-password',
    },
  ];

  const validationRulesConfig = {
    firstName: validationRules.name('First Name'),
    lastName: validationRules.name('Last Name'),
    email: validationRules.email(),
    phone: validationRules.phone(),
    password: validationRules.password(),
    confirmPassword: validationRules.passwordConfirmation(formData.password),
  };

  // Update form data to keep password confirmation in sync
  const handleSubmit = async (values: typeof formData) => {
    setFormData(values);
    await onSubmit(values);
  };

  React.useEffect(() => {
    setFormData(prev => ({ ...prev }));
  }, []);

  return (
    <StandardForm
      title="Create Account"
      fields={fields}
      initialValues={formData}
      validationRules={validationRulesConfig}
      onSubmit={handleSubmit}
      submitText="Create Account"
      showSuccessMessage
      successMessage="Account created successfully! Please check your email to verify your account."
      maxWidth={500}
    />
  );
};

export default StandardForm;