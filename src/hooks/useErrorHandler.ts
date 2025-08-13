import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectTo?: string;
  logError?: boolean;
  retryAction?: () => void;
}

interface ErrorInfo {
  message: string;
  code?: string | number;
  type: 'network' | 'auth' | 'permission' | 'validation' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userFriendlyMessage: string;
  suggestions: string[];
}

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  const analyzeError = useCallback((error: any): ErrorInfo => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorCode = error?.response?.status || error?.code || error?.status;
    
    // Network errors
    if (errorMessage.includes('Network') || errorMessage.includes('fetch') || errorCode === 'NETWORK_ERROR') {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'network',
        severity: 'medium',
        userFriendlyMessage: 'Connection problem. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ]
      };
    }

    // Authentication errors
    if (errorCode === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'auth',
        severity: 'high',
        userFriendlyMessage: 'Your session has expired. Please log in again.',
        suggestions: [
          'Log in again',
          'Clear your browser cache',
          'Contact support if you continue having issues'
        ]
      };
    }

    // Permission errors
    if (errorCode === 403 || errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'permission',
        severity: 'medium',
        userFriendlyMessage: 'You don\'t have permission to perform this action.',
        suggestions: [
          'Contact your administrator for access',
          'Check if you have the required permissions',
          'Try logging out and back in'
        ]
      };
    }

    // Not found errors
    if (errorCode === 404 || errorMessage.includes('not found')) {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'client',
        severity: 'low',
        userFriendlyMessage: 'The requested resource was not found.',
        suggestions: [
          'Check the URL for typos',
          'Go back to the previous page',
          'Contact support if the issue persists'
        ]
      };
    }

    // Validation errors
    if (errorCode === 400 || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'validation',
        severity: 'low',
        userFriendlyMessage: 'Please check your input and try again.',
        suggestions: [
          'Review the form for errors',
          'Make sure all required fields are filled',
          'Check that your input follows the required format'
        ]
      };
    }

    // Server errors
    if (errorCode >= 500 || errorMessage.includes('server') || errorMessage.includes('internal')) {
      return {
        message: errorMessage,
        code: errorCode,
        type: 'server',
        severity: 'high',
        userFriendlyMessage: 'Something went wrong on our end. Please try again after some time.',
        suggestions: [
          'Try again in a few minutes',
          'Refresh the page',
          'Contact support if the issue continues'
        ]
      };
    }

    // Component loading errors
    if (errorMessage.includes('Loading chunk') || errorMessage.includes('ChunkLoadError')) {
      return {
        message: errorMessage,
        code: 'CHUNK_LOAD_ERROR',
        type: 'client',
        severity: 'medium',
        userFriendlyMessage: 'Failed to load page content. This usually happens after an app update.',
        suggestions: [
          'Refresh the page',
          'Clear your browser cache',
          'Try again in a few moments'
        ]
      };
    }

    // Generic error
    return {
      message: errorMessage,
      code: errorCode,
      type: 'unknown',
      severity: 'medium',
      userFriendlyMessage: 'Something went wrong. Please try again after some time.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    };
  }, []);

  const handleError = useCallback((error: any, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      redirectTo,
      logError = true,
      retryAction
    } = options;

    const errorInfo = analyzeError(error);

    // Log the error
    if (logError) {
      const logData = {
        error: errorInfo,
        originalError: error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        isAuthenticated,
      };

      if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
        logger.error('Error handled by useErrorHandler', logData);
      } else {
        logger.warn('Error handled by useErrorHandler', logData);
      }
    }

    // Handle authentication errors
    if (errorInfo.type === 'auth' && isAuthenticated) {
      logout();
      navigate('/login', { 
        state: { 
          message: 'Your session has expired. Please log in again.',
          from: window.location.pathname 
        }
      });
      return errorInfo;
    }

    // Handle redirects
    if (redirectTo) {
      navigate(redirectTo, { 
        state: { 
          error: errorInfo,
          retryAction: retryAction ? 'available' : undefined
        }
      });
      return errorInfo;
    }

    // Show toast notification (if toast context is available)
    if (showToast) {
      // This would integrate with your toast/notification system
      console.warn('Error toast:', errorInfo.userFriendlyMessage);
    }

    return errorInfo;
  }, [analyzeError, logout, navigate, isAuthenticated]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorInfo = handleError(error, options);
      throw errorInfo; // Re-throw the processed error info
    }
  }, [handleError]);

  const createErrorHandler = useCallback((options: ErrorHandlerOptions = {}) => {
    return (error: any) => handleError(error, options);
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
    analyzeError,
  };
};

export default useErrorHandler;