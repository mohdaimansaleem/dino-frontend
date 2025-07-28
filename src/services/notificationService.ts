import { AppNotification, NotificationTypeEnum } from '../types';

type NotificationCallback = (notification: AppNotification) => void;
type ConnectionCallback = (connected: boolean) => void;

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private callbacks: NotificationCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem('dino_token');
    
    if (!token) {
      this.isConnecting = false;
      return;
    }

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.notifyConnectionCallbacks(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'notification':
        this.handleNotification(data.payload);
        break;
      case 'order_update':
        this.handleOrderUpdate(data.payload);
        break;
      case 'cafe_status_update':
        this.handleCafeStatusUpdate(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private handleNotification(payload: any) {
    const notification: AppNotification = {
      id: payload.id || Date.now().toString(),
      recipientId: payload.recipientId,
      recipientType: payload.recipientType || 'user',
      notificationType: payload.notificationType,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      isRead: false,
      priority: payload.priority || 'normal',
      createdAt: new Date(payload.createdAt || Date.now()),
    };

    this.notifyCallbacks(notification);
    this.showBrowserNotification(notification);
  }

  private handleOrderUpdate(payload: any) {
    const notification: AppNotification = {
      id: Date.now().toString(),
      recipientId: payload.cafeId,
      recipientType: 'cafe',
      notificationType: 'order_placed' as NotificationTypeEnum,
      title: 'New Order',
      message: `Order #${payload.orderNumber} has been ${payload.status}`,
      data: payload,
      isRead: false,
      priority: 'high',
      createdAt: new Date(),
    };

    this.notifyCallbacks(notification);
    
    // Dispatch custom event for order updates
    window.dispatchEvent(new CustomEvent('orderUpdate', { detail: payload }));
  }

  private handleCafeStatusUpdate(payload: any) {
    const notification: AppNotification = {
      id: Date.now().toString(),
      recipientId: payload.cafeId,
      recipientType: 'cafe',
      notificationType: 'system_alert' as NotificationTypeEnum,
      title: 'Cafe Status Update',
      message: `Cafe is now ${payload.isOpen ? 'open' : 'closed'}`,
      data: payload,
      isRead: false,
      priority: 'normal',
      createdAt: new Date(),
    };

    this.notifyCallbacks(notification);
    
    // Dispatch custom event for cafe status updates
    window.dispatchEvent(new CustomEvent('cafeStatusUpdate', { detail: payload }));
  }

  private notifyCallbacks(notification: AppNotification) {
    this.callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  private async showBrowserNotification(notification: AppNotification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    }
  }

  // Public methods
  subscribe(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks = [];
    this.connectionCallbacks = [];
  }

  // Send message to server
  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  // Create local notification (for testing)
  createLocalNotification(
    type: NotificationTypeEnum,
    title: string,
    message: string,
    data?: any
  ) {
    const notification: AppNotification = {
      id: Date.now().toString(),
      recipientId: 'local',
      recipientType: 'user',
      notificationType: type,
      title,
      message,
      data,
      isRead: false,
      priority: 'normal',
      createdAt: new Date(),
    };

    this.notifyCallbacks(notification);
    this.showBrowserNotification(notification);
  }
}

export const notificationService = new NotificationService();