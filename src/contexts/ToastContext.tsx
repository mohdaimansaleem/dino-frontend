import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface ToastContextType {
  showToast: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  showInfo: (message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

interface ToastActionsType {
  showOrderUpdate: (orderNumber: string, status: string) => void;
  showTableUpdate: (tableNumber: string, status: string) => void;
  showConnectionStatus: (isOnline: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleClose = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const showInfo = (message: string) => showToast(message, 'info');
  const showSuccess = (message: string) => showToast(message, 'success');
  const showError = (message: string) => showToast(message, 'error');
  const showWarning = (message: string) => showToast(message, 'warning');

  const value: ToastContextType = {
    showToast,
    showInfo,
    showSuccess,
    showError,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const useToastActions = (): ToastActionsType => {
  const { showToast } = useToast();
  
  return {
    showOrderUpdate: (orderNumber: string, status: string) => {
      showToast(`Order #${orderNumber} is now ${status}`, 'info');
    },
    showTableUpdate: (tableNumber: string, status: string) => {
      showToast(`Table ${tableNumber} is now ${status}`, 'info');
    },
    showConnectionStatus: (isOnline: boolean) => {
      showToast(
        isOnline ? 'Connection restored' : 'Connection lost', 
        isOnline ? 'success' : 'warning'
      );
    },
  };
};