import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Divider,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Settings,
  MarkEmailRead,
  ShoppingBag,
  Payment,
  Warning,
  Info,
  Close
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { AppNotification, NotificationType } from '../types';
import { notificationService, NotificationPreferences } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationCenterProps {
  onNotificationClick?: (notification: AppNotification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationClick
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleNewNotification = useCallback((notification: AppNotification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    
    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Play notification sound
    if (preferences?.pushNotifications && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Show visual indicator if popover is closed
    if (!anchorEl) {
      // Could add a toast notification here
    }
  }, [preferences?.pushNotifications, anchorEl]);

  const initializeNotifications = useCallback(() => {
    if (!user) return;

    // Connect WebSocket
    notificationService.connectWebSocket(user.id, 'users');

    // Setup event listeners
    notificationService.on('connected', () => {
      setConnectionStatus('connected');
      setError(null);
    });

    notificationService.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    notificationService.on('error', (error: any) => {
      setError('Connection error occurred');
      setConnectionStatus('error');
    });

    notificationService.on('notification', (notification: AppNotification) => {
      handleNewNotification(notification);
    });

    notificationService.on('notificationClick', (notification: AppNotification) => {
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    });
  }, [user, onNotificationClick, handleNewNotification]);

  useEffect(() => {
    if (user) {
      initializeNotifications();
      loadNotifications();
      loadPreferences();
      checkPermissionStatus();
    }

    return () => {
      notificationService.destroy();
    };
  }, [user, initializeNotifications]);

  useEffect(() => {
    // Setup notification sound
    audioRef.current = new Audio('/notification-sound.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(false, 20),
        notificationService.getUnreadCount()
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err: any) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (err: any) {
      console.error('Failed to load notification preferences:', err);
      // Set default preferences on error
      setPreferences({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationTypes: {
          orderUpdates: true,
          paymentConfirmations: true,
          promotionalOffers: true,
          systemAlerts: true
        }
      });
    }
  };

  const checkPermissionStatus = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      loadNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError('Failed to mark all as read');
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);
    } catch (err: any) {
      console.error('Failed to request permission:', err);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err: any) {
      setError('Failed to update preferences');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_ready':
      case 'order_delivered':
        return <ShoppingBag />;
      case 'payment_received':
        return <Payment />;
      case 'system_alert':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  const getNotificationColor = (type: NotificationType, priority: string) => {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    
    switch (type) {
      case 'order_placed':
        return 'primary';
      case 'order_confirmed':
        return 'info';
      case 'order_ready':
      case 'order_delivered':
        return 'success';
      case 'payment_received':
        return 'success';
      case 'system_alert':
        return 'warning';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{
            position: 'relative',
            '&::after': connectionStatus === 'connected' ? {
              content: '""',
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              border: '2px solid white'
            } : {}
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {connectionStatus === 'connected' ? (
              <NotificationsActive />
            ) : connectionStatus === 'error' ? (
              <NotificationsOff color="error" />
            ) : (
              <Notifications />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            
            <Box>
              <Tooltip title="Mark all as read">
                <IconButton
                  size="small"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  <MarkEmailRead />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {connectionStatus !== 'connected' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {connectionStatus === 'error' ? 'Connection error' : 'Connecting...'}
            </Alert>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: notification.isRead ? 'action.hover' : 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.notificationType, notification.priority)}.main`,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getNotificationIcon(notification.notificationType)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            flex: 1
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              ml: 1,
                              mt: 0.5
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small" onClick={() => setNotifications([])}>
              Clear All
            </Button>
          </Box>
        )}
      </Popover>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Notification Settings
          <IconButton
            onClick={() => setSettingsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {permissionStatus !== 'granted' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Browser notifications are not enabled.
              <Button size="small" onClick={handleRequestPermission} sx={{ ml: 1 }}>
                Enable
              </Button>
            </Alert>
          )}

          {preferences && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Notification Methods
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications || false}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.smsNotifications || false}
                    onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                  />
                }
                label="SMS notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.pushNotifications || false}
                    onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                  />
                }
                label="Browser notifications"
              />

              {preferences.notificationTypes && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Notification Types
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationTypes?.orderUpdates || false}
                        onChange={(e) => handlePreferenceChange('notificationTypes', {
                          ...(preferences.notificationTypes || {}),
                          orderUpdates: e.target.checked
                        })}
                      />
                    }
                    label="Order updates"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationTypes?.paymentConfirmations || false}
                        onChange={(e) => handlePreferenceChange('notificationTypes', {
                          ...(preferences.notificationTypes || {}),
                          paymentConfirmations: e.target.checked
                        })}
                      />
                    }
                    label="Payment confirmations"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationTypes?.promotionalOffers || false}
                        onChange={(e) => handlePreferenceChange('notificationTypes', {
                          ...(preferences.notificationTypes || {}),
                          promotionalOffers: e.target.checked
                        })}
                      />
                    }
                    label="Promotional offers"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationTypes?.systemAlerts || false}
                        onChange={(e) => handlePreferenceChange('notificationTypes', {
                          ...(preferences.notificationTypes || {}),
                          systemAlerts: e.target.checked
                        })}
                      />
                    }
                    label="System alerts"
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationCenter;