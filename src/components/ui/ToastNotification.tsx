import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  severity: ToastSeverity;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: React.ReactNode;
}

interface ToastNotificationProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  position = { vertical: 'bottom', horizontal: 'right' },
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' && toast.persistent) {
      return;
    }
    onClose(toast.id);
  };

  const getIcon = () => {
    switch (toast.severity) {
      case 'success':
        return <CheckCircle fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
        return <Info fontSize="small" />;
      default:
        return null;
    }
  };

  const getSeverityColor = () => {
    switch (toast.severity) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={toast.persistent ? null : (toast.duration || 6000)}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbar-root': {
          position: 'fixed',
        },
        // Mobile positioning adjustments
        ...(isMobile && {
          left: 16,
          right: 16,
          '& .MuiSnackbar-root': {
            left: 16,
            right: 16,
            transform: 'none',
          },
        }),
      }}
    >
      <Alert
        severity={toast.severity}
        onClose={toast.persistent ? undefined : handleClose}
        icon={getIcon()}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {toast.action}
            {toast.persistent && (
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          width: '100%',
          maxWidth: isMobile ? 'none' : 400,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          border: '1px solid',
          borderColor: `${getSeverityColor()}20`,
          '& .MuiAlert-icon': {
            color: getSeverityColor(),
          },
          '& .MuiAlert-message': {
            flex: 1,
            minWidth: 0,
          },
          '& .MuiAlert-action': {
            alignItems: 'flex-start',
            paddingTop: 0,
          },
        }}
      >
        {toast.title && (
          <AlertTitle sx={{ 
            fontWeight: 600, 
            fontSize: '0.875rem',
            mb: toast.message ? 0.5 : 0,
          }}>
            {toast.title}
          </AlertTitle>
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8125rem',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {toast.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  maxToasts?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  maxToasts = 3,
  position = { vertical: 'bottom', horizontal: 'right' },
}) => {
  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  return (
    <>
      {visibleToasts.map((toast, index) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={onClose}
          position={{
            ...position,
            // Stack toasts vertically
            vertical: position.vertical === 'top' ? 'top' : 'bottom',
          }}
        />
      ))}
    </>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = {
      id,
      duration: 6000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = React.useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({ severity: 'success', message, ...options });
  }, [addToast]);

  const showError = React.useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({ severity: 'error', message, ...options });
  }, [addToast]);

  const showWarning = React.useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({ severity: 'warning', message, ...options });
  }, [addToast]);

  const showInfo = React.useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({ severity: 'info', message, ...options });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default ToastNotification;