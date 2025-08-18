import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Login,
  Refresh,
  Home,
  Business,
  ArrowForward,
  ExpandMore,
  Email,
  Phone,
  HelpOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DinoLogo from './DinoLogo';
import { useToast } from '../contexts/ToastContext';

interface RegistrationResultProps {
  isSuccess: boolean;
  workspaceData?: any;
  error?: string;
  errorCode?: number;
  onRetry?: () => void;
}

const RegistrationResult: React.FC<RegistrationResultProps> = ({
  isSuccess,
  workspaceData,
  error = 'Registration failed. Please try again.',
  errorCode,
  onRetry
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess } = useToast();

  const workspaceName = workspaceData?.workspace_name || 'Your Workspace';
  const ownerEmail = workspaceData?.owner_email || '';

  const handleLoginRedirect = () => {
    showSuccess('Redirecting to login...');
    navigate('/login', {
      state: {
        message: 'Registration successful! Please sign in with your credentials.',
        email: ownerEmail
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetryRegistration = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/register', {
        state: {
          formData: workspaceData,
          retryAttempt: true
        }
      });
    }
  };

  const handleContactSupport = () => {
    window.open('mailto:support@dino.com?subject=Registration%20Issue', '_blank');
  };

  const getErrorSolution = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('email') && lowerError.includes('already')) {
      return {
        title: 'Email Already Registered',
        solution: 'This email address is already associated with an account. Try signing in instead, or use a different email address.',
        action: 'Sign In',
        actionHandler: () => navigate('/login')
      };
    }
    
    if (lowerError.includes('workspace') && lowerError.includes('exists')) {
      return {
        title: 'Workspace Name Taken',
        solution: 'A workspace with this name already exists. Please choose a different workspace name.',
        action: 'Try Again',
        actionHandler: handleRetryRegistration
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        title: 'Network Connection Issue',
        solution: 'Please check your internet connection and try again. If the problem persists, contact support.',
        action: 'Retry',
        actionHandler: handleRetryRegistration
      };
    }
    
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return {
        title: 'Validation Error',
        solution: 'Some of the information provided was invalid. Please review your details and try again.',
        action: 'Fix Details',
        actionHandler: handleRetryRegistration
      };
    }
    
    return {
      title: 'Registration Failed',
      solution: 'An unexpected error occurred during registration. Please try again or contact support if the issue persists.',
      action: 'Try Again',
      actionHandler: handleRetryRegistration
    };
  };

  const errorSolution = getErrorSolution(error);

  if (isSuccess) {
    // Success State
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={24}
            sx={{
              p: { xs: 4, md: 6, lg: 8 },
              borderRadius: { xs: 3, md: 4 },
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Success Icon Background */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                zIndex: 0,
              }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Header with Logo */}
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 4 }}>
                <DinoLogo size={48} animated={true} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="700"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Dino
                </Typography>
              </Stack>

              {/* Success Icon */}
              <Box sx={{ mb: 4 }}>
                <CheckCircle
                  sx={{
                    fontSize: { xs: 80, md: 100 },
                    color: 'success.main',
                    filter: 'drop-shadow(0 4px 12px rgba(76, 175, 80, 0.3))',
                  }}
                />
              </Box>

              {/* Success Message */}
              <Typography
                variant="h3"
                component="h2"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  color: 'success.main',
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                Workspace Created Successfully!
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Congratulations! Your restaurant workspace "{workspaceName}" has been created successfully. 
                You can now sign in and start managing your restaurant operations.
              </Typography>

              <Divider sx={{ my: 4 }} />

              {/* Features List */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ mb: 3, color: 'text.primary' }}
                >
                  What's Next?
                </Typography>
                
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={3}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                    <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                      Setup Your Menu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add your dishes and categories
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                    <Login sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                      Configure Tables
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Set up your dining areas
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                    <ArrowForward sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                      Start Taking Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Begin serving customers
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Action Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoginRedirect}
                  startIcon={<Login />}
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In Now
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBackToHome}
                  sx={{
                    minWidth: { xs: '100%', sm: 160 },
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Back to Home
                </Button>
              </Stack>

              {/* Additional Info */}
              {ownerEmail && (
                <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Login Email:</strong> {ownerEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Use the password you created during registration to sign in.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Failure State
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6, lg: 8 },
            borderRadius: { xs: 3, md: 4 },
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Error Icon Background */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              zIndex: 0,
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Header with Logo */}
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 4 }}>
              <DinoLogo size={48} animated={true} />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                }}
              >
                Dino
              </Typography>
            </Stack>

            {/* Error Icon */}
            <Box sx={{ mb: 4 }}>
              <Error
                sx={{
                  fontSize: { xs: 80, md: 100 },
                  color: 'error.main',
                  filter: 'drop-shadow(0 4px 12px rgba(244, 67, 54, 0.3))',
                }}
              />
            </Box>

            {/* Error Message */}
            <Typography
              variant="h3"
              component="h2"
              fontWeight="700"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                color: 'error.main',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Registration Failed
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: 'text.secondary',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              We encountered an issue while creating your workspace. Don't worry, we can help you resolve this.
            </Typography>

            {/* Error Details */}
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                {errorSolution.title}
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
              {errorCode && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  Error Code: {errorCode}
                </Typography>
              )}
            </Alert>

            <Divider sx={{ my: 4 }} />

            {/* Solution */}
            <Box sx={{ mb: 4, textAlign: 'left' }}>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 2, color: 'text.primary', textAlign: 'center' }}
              >
                How to Fix This
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  {errorSolution.solution}
                </Typography>
              </Alert>
            </Box>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={errorSolution.actionHandler}
                startIcon={<Refresh />}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {errorSolution.action}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleBackToHome}
                startIcon={<Home />}
                sx={{
                  minWidth: { xs: '100%', sm: 160 },
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Back to Home
              </Button>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Help Section */}
            <Box>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 3, color: 'text.primary' }}
              >
                Need Additional Help?
              </Typography>

              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HelpOutline sx={{ fontSize: 20 }} />
                    <Typography fontWeight="600">Common Solutions</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">
                      • <strong>Email already exists:</strong> Try signing in with your existing account
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Workspace name taken:</strong> Choose a unique workspace name
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Network issues:</strong> Check your internet connection and try again
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Validation errors:</strong> Ensure all required fields are filled correctly
                    </Typography>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="text"
                  onClick={handleContactSupport}
                  startIcon={<Email />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Email Support
                </Button>

                <Button
                  variant="text"
                  onClick={() => window.open('tel:+1234567890', '_self')}
                  startIcon={<Phone />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Call Support
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegistrationResult;