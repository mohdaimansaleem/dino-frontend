import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Alert,
  Collapse,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    };

    logger.error('Global Error Boundary caught an error', errorData);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Report to error tracking service (if available)
    this.reportError(errorData);
  }

  private reportError = async (errorData: any) => {
    try {
      // Here you would integrate with your error reporting service
      // For example: Sentry, LogRocket, Bugsnag, etc.
      console.error('Error reported:', errorData);
      
      // You could also send to your own error reporting endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
      });
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    // Chunk loading errors (common after deployments)
    if (message.includes('loading chunk') || message.includes('chunkloaderror')) {
      return 'The app has been updated. Please refresh the page to get the latest version.';
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'There seems to be a connection problem. Please check your internet connection and try again.';
    }
    
    // Script loading errors
    if (message.includes('script') || message.includes('loading')) {
      return 'Failed to load some app resources. Please refresh the page to try again.';
    }
    
    // Memory errors
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'The app is using too much memory. Please close some browser tabs and refresh the page.';
    }
    
    // Generic error
    return 'Something unexpected happened. Our team has been notified and is working on a fix.';
  };

  private getSuggestions = (error: Error): string[] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('loading chunk') || message.includes('chunkloaderror')) {
      return [
        'Refresh the page to get the latest version',
        'Clear your browser cache if the problem persists',
        'Try using an incognito/private browsing window',
      ];
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable any VPN or proxy if you\'re using one',
        'Contact support if the problem continues',
      ];
    }
    
    return [
      'Try refreshing the page',
      'Clear your browser cache and cookies',
      'Try using a different browser',
      'Contact support if the issue persists',
    ];
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const userMessage = this.getErrorMessage(this.state.error);
      const suggestions = this.getSuggestions(this.state.error);
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <ErrorBoundaryUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          userMessage={userMessage}
          suggestions={suggestions}
          showDetails={this.state.showDetails}
          canRetry={canRetry}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Separate UI component for better testing and reusability
interface ErrorBoundaryUIProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string;
  userMessage: string;
  suggestions: string[];
  showDetails: boolean;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onGoHome: () => void;
  onToggleDetails: () => void;
}

const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
  error,
  errorInfo,
  errorId,
  userMessage,
  suggestions,
  showDetails,
  canRetry,
  retryCount,
  maxRetries,
  onRetry,
  onGoHome,
  onToggleDetails,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Error Icon */}
          <Box sx={{ mb: 3 }}>
            <ErrorOutline
              sx={{
                fontSize: { xs: 64, sm: 80 },
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              fontWeight="600"
              gutterBottom
              color="text.primary"
            >
              Oops! Something went wrong
            </Typography>
          </Box>

          {/* User-friendly message */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6, maxWidth: 600, mx: 'auto' }}
          >
            {userMessage}
          </Typography>

          {/* Suggestions */}
          <Box sx={{ mb: 4, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              What you can try:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {suggestions.map((suggestion, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {suggestion}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              size="large"
              disabled={!canRetry}
              sx={{ minWidth: { xs: '100%', sm: 160 } }}
            >
              {canRetry ? `Try Again (${maxRetries - retryCount} left)` : 'Reload Page'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={onGoHome}
              size="large"
              sx={{ minWidth: { xs: '100%', sm: 160 } }}
            >
              Go to Home
            </Button>
          </Stack>

          {/* Error Details (Collapsible) */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              size="small"
              onClick={onToggleDetails}
              startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
              sx={{ color: 'text.secondary' }}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>
            
            <Collapse in={showDetails}>
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  textAlign: 'left',
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Error ID: {errorId}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Error:</strong> {error.name}: {error.message}
                </Typography>
                {error.stack && (
                  <Box
                    component="pre"
                    sx={{
                      fontSize: '0.75rem',
                      backgroundColor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {error.stack}
                  </Box>
                )}
                {errorInfo && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Component Stack:</strong>
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.75rem',
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 150,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {errorInfo.componentStack}
                    </Box>
                  </Box>
                )}
              </Alert>
            </Collapse>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              If this problem continues, please contact our support team with the Error ID above.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default GlobalErrorBoundary;