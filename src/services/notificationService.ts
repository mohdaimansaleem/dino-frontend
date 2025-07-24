import { AppNotification } from '../types';
import { apiService } from './api';

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    orderUpdates: boolean;
    paymentConfirmations: boolean;
    promotionalOffers: boolean;
    systemAlerts: boolean;
  };
}

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  // WebSocket connection management
  connectWebSocket(userId: string, userType: string = 'users'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/api/v1/notifications/ws/${userType}/${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connectWebSocket(userId, userType);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'notification':
        this.emit('notification', data.data);
        this.showBrowserNotification(data.data);
        break;
      case 'ping':
        this.sendPong();
        break;
      case 'pong':
        // Handle pong response
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
    }
  }

  private showBrowserNotification(notification: AppNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new window.Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
      });

      browserNotification.onclick = () => {
        window.focus();
        this.emit('notificationClick', notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds for normal priority
      if (notification.priority === 'normal' || notification.priority === 'low') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // API methods
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<AppNotification[]> {
    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unread_only', 'true');
      params.append('limit', limit.toString());

      const response = await apiService.get<AppNotification[]>(`/notifications?${params}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.get<{ unread_count: number }>('/notifications/unread-count');
      
      if (response.success && response.data) {
        return response.data.unread_count;
      }
      
      return 0;
    } catch (error: any) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const response = await apiService.put('/notifications/mark-all-read');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark all notifications as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to mark all notifications as read');
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiService.get<NotificationPreferences>('/notifications/preferences');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return default preferences
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationTypes: {
          orderUpdates: true,
          paymentConfirmations: true,
          promotionalOffers: true,
          systemAlerts: true
        }
      };
    } catch (error: any) {
      console.error('Failed to get notification preferences:', error);
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationTypes: {
          orderUpdates: true,
          paymentConfirmations: true,
          promotionalOffers: true,
          systemAlerts: true
        }
      };
    }
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const response = await apiService.put('/notifications/preferences', preferences);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update notification preferences');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update notification preferences');
    }
  }

  // Browser notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  isPermissionGranted(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Utility methods
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Clean up
  destroy(): void {
    this.disconnectWebSocket();
    this.listeners.clear();
  }
}

export const notificationService = new NotificationService();