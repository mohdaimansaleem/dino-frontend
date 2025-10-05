import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage';
import { logger } from '../../utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    this.logError(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    // Log using the logger service
    try {
      logger.error('ErrorBoundary caught error', errorDetails);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    // Send to error reporting service (if configured)
    this.reportError(errorDetails);
  };

  private getUserId = (): string | null => {
    try {
      const userData = localStorage.getItem('dino_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.email || null;
      }
    } catch (error) {
      // Ignore errors when getting user ID
    }
    return null;
  };

  private reportError = (errorDetails: any) => {
    // In a real application, you would send this to your error reporting service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // Sentry.captureException(error, { extra: errorDetails });
      
      // Send to analytics or error reporting endpoint
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...errorDetails,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      } catch {
        // Silently fail if error reporting fails
      }
    }
  };

  private handleRetry = () => {
    // Clear the error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Add a small delay to prevent immediate re-error
    this.retryTimeoutId = window.setTimeout(() => {
      // Force a re-render by updating a dummy state
      this.forceUpdate();
    }, 100);
  };

  private getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError') return 'CHUNK_LOAD_ERROR';
    if (error.message.includes('Loading chunk')) return 'CHUNK_LOAD_ERROR';
    if (error.message.includes('Network')) return 'NETWORK_ERROR';
    if (error.message.includes('fetch')) return 'NETWORK_ERROR';
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    return 'UNKNOWN_ERROR';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Use default error page
      return (
        <ErrorPage
          error={this.state.error}
          errorCode={this.getErrorType(this.state.error)}
          onRetry={this.handleRetry}
          showRetry={this.props.showRetry}
          showGoHome={this.props.showGoHome}
          showGoBack={this.props.showGoBack}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;