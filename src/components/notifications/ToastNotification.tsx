import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onRemove,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (toast.type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (toast.type) {
      case 'success': return 'text-green-700';
      case 'error': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      case 'info': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const getPositionClasses = () => {
    const base = 'fixed z-50';
    switch (position) {
      case 'top-right': return `${base} top-4 right-4`;
      case 'top-left': return `${base} top-4 left-4`;
      case 'bottom-right': return `${base} bottom-4 right-4`;
      case 'bottom-left': return `${base} bottom-4 left-4`;
      case 'top-center': return `${base} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center': return `${base} bottom-4 left-1/2 transform -translate-x-1/2`;
      default: return `${base} top-4 right-4`;
    }
  };

  const getAnimationClasses = () => {
    if (isRemoving) {
      return 'opacity-0 scale-95 translate-x-2';
    }
    if (isVisible) {
      return 'opacity-100 scale-100 translate-x-0';
    }
    return 'opacity-0 scale-95 translate-x-2';
  };

  return (
    <div
      className={`
        ${getPositionClasses()}
        max-w-sm w-full shadow-lg rounded-lg border
        ${getBackgroundColor()}
        transform transition-all duration-300 ease-in-out
        ${getAnimationClasses()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTitleColor()}`}>
              {toast.title}
            </p>
            <p className={`mt-1 text-sm ${getMessageColor()}`}>
              {toast.message}
            </p>
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className={`text-sm font-medium underline hover:no-underline ${getTitleColor()}`}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className={`inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for timed toasts */}
      {!toast.persistent && toast.duration !== 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full transition-all ease-linear ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{
              animation: `shrink ${toast.duration || 5000}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
  maxToasts = 5
}) => {
  const displayedToasts = toasts.slice(0, maxToasts);

  if (displayedToasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none">
      <div className={`space-y-2 ${position.includes('bottom') ? 'flex flex-col-reverse' : ''}`}>
        {displayedToasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification
              toast={toast}
              onRemove={onRemove}
              position={position}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

// CSS for progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default ToastNotification;