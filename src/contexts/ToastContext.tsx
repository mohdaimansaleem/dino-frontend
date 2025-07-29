import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, Toast } from '../components/notifications/ToastNotification';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message: string, options?: Partial<Toast>) => string;
  error: (title: string, message: string, options?: Partial<Toast>) => string;
  warning: (title: string, message: string, options?: Partial<Toast>) => string;
  info: (title: string, message: string, options?: Partial<Toast>) => string;
  showInfo: (title: string, message: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    setToasts(prev => [newToast, ...prev]);
    return id;
  }, [generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((title: string, message: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 7000, // Longer duration for errors
      ...options
    });
  }, [addToast]);

  const warning = useCallback((title: string, message: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [addToast]);

  const info = useCallback((title: string, message: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    showInfo: info
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        position={position}
        maxToasts={maxToasts}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hook for common toast patterns
export const useToastActions = () => {
  const { success, error, warning, info } = useToast();

  const showSuccess = useCallback((message: string, title = 'Success') => {
    return success(title, message);
  }, [success]);

  const showError = useCallback((message: string, title = 'Error') => {
    return error(title, message);
  }, [error]);

  const showWarning = useCallback((message: string, title = 'Warning') => {
    return warning(title, message);
  }, [warning]);

  const showInfo = useCallback((message: string, title = 'Information') => {
    return info(title, message);
  }, [info]);

  const showOrderUpdate = useCallback((orderNumber: string, status: string) => {
    const statusMessages = {
      confirmed: 'Order has been confirmed',
      preparing: 'Order is being prepared',
      ready: 'Order is ready for pickup',
      served: 'Order has been served',
      cancelled: 'Order has been cancelled'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`;
    
    return info(`Order #${orderNumber}`, message, {
      duration: 4000,
      action: {
        label: 'View Order',
        onClick: () => {
          // Navigate to order details
          window.location.href = `/admin/orders/${orderNumber}`;
        }
      }
    });
  }, [info]);

  const showTableUpdate = useCallback((tableNumber: number, status: string) => {
    const statusMessages = {
      available: 'Table is now available',
      occupied: 'Table is now occupied',
      reserved: 'Table has been reserved',
      cleaning: 'Table is being cleaned',
      maintenance: 'Table is under maintenance'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Table status updated to ${status}`;
    
    return info(`Table ${tableNumber}`, message, {
      duration: 3000
    });
  }, [info]);

  const showConnectionStatus = useCallback((isConnected: boolean) => {
    if (isConnected) {
      return success('Connected', 'Real-time updates are now active', {
        duration: 3000
      });
    } else {
      return warning('Disconnected', 'Real-time updates are temporarily unavailable', {
        persistent: true,
        action: {
          label: 'Retry',
          onClick: () => {
            window.location.reload();
          }
        }
      });
    }
  }, [success, warning]);

  const showApiError = useCallback((operation: string, errorMessage?: string) => {
    return error(
      `${operation} Failed`,
      errorMessage || 'An unexpected error occurred. Please try again.',
      {
        duration: 8000,
        action: {
          label: 'Retry',
          onClick: () => {
            window.location.reload();
          }
        }
      }
    );
  }, [error]);

  const showPermissionDenied = useCallback((action: string) => {
    return warning(
      'Permission Denied',
      `You don't have permission to ${action}. Please contact your administrator.`,
      {
        duration: 6000
      }
    );
  }, [warning]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showOrderUpdate,
    showTableUpdate,
    showConnectionStatus,
    showApiError,
    showPermissionDenied
  };
};