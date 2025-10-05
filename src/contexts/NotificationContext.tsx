import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification } from '../types/api';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<NotificationPermission>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsConnected(false);
      return;
    }

    // Subscribe to notifications
    const unsubscribeNotifications = notificationService.subscribe((notification) => {
      addNotification(notification);
    });

    // Subscribe to connection status
    const unsubscribeConnection = notificationService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Set initial connection status
    setIsConnected(notificationService.isConnected());

    // Request notification permission
    notificationService.requestNotificationPermission();

    return () => {
      unsubscribeNotifications();
      unsubscribeConnection();
    };
  }, [isAuthenticated]);

  const addNotification = (notification: AppNotification) => {
    setNotifications(prev => {
      // Avoid duplicates
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      
      // Add new notification at the beginning
      const updated = [notification, ...prev];
      
      // Keep only last 50 notifications
      return updated.slice(0, 50);
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date()
      }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    return await notificationService.requestNotificationPermission();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};