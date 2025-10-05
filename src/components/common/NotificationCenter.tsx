import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  CheckCircle,
  Info,
  Warning,
  Clear,
  MarkEmailRead,
  ShoppingCart,
  Wifi,
  WifiOff,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppNotification } from '../../types/api';

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (notification: AppNotification) => {
    switch (notification.notificationType) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_ready':
      case 'order_delivered':
        return <ShoppingCart color="primary" />;
      case 'payment_received':
        return <CheckCircle color="success" />;
      case 'system_alert':
        return <Warning color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const now = new Date();
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Handle notification-specific actions
    if (notification.data?.orderId) {
      // Navigate to order details
      window.location.href = `/admin/orders?orderId=${notification.data.orderId}`;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 380, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Notifications</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={isConnected ? <Wifi /> : <WifiOff />}
                label={isConnected ? 'Live' : 'Offline'}
                size="small"
                color={isConnected ? 'success' : 'error'}
                variant="outlined"
              />
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead} startIcon={<MarkEmailRead />}>
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>
          
          {!isConnected && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Real-time notifications are offline. Reconnecting...
            </Alert>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! New notifications will appear here.
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
              {notifications.slice(0, 10).map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      '&:hover': { backgroundColor: 'action.selected' },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemIcon>
                      {getIcon(notification)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: notification.isRead ? 400 : 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              {notification.title}
                              {notification.priority === 'urgent' && (
                                <Chip
                                  label="URGENT"
                                  size="small"
                                  color="error"
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                              )}
                              {notification.priority === 'high' && (
                                <Chip
                                  label="HIGH"
                                  size="small"
                                  color="warning"
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                              )}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <Clear fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          
                          {notification.data && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              {notification.data.orderNumber && (
                                <Chip
                                  label={`Order #${notification.data.orderNumber}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {notification.data.tableNumber && (
                                <Chip
                                  label={`Table ${notification.data.tableNumber}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {notification.data.amount && (
                                <Chip
                                  label={`₹${notification.data.amount}`}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                            </Box>
                          )}
                          
                          {!notification.isRead && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              sx={{ mt: 1, p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                            >
                              Mark as read
                            </Button>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < Math.min(notifications.length, 10) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            
            {notifications.length > 0 && (
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {notifications.length > 10 && `Showing 10 of ${notifications.length} notifications`}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={clearAll}
                    startIcon={<Clear />}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;