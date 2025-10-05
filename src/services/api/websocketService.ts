/**
 * WebSocket Service for Real-time Updates
 * Handles real-time communication with the backend
 */

import { API_CONFIG, getWebSocketUrl } from '../../config/api';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

interface WebSocketEventHandlers {
  onOrderCreated?: (data: any) => void;
  onOrderStatusUpdated?: (data: any) => void;
  onTableStatusUpdated?: (data: any) => void;
  onMenuItemUpdated?: (data: any) => void;
  onSystemNotification?: (data: any) => void;
  onVenueStatus?: (data: any) => void;
  onNotifications?: (data: any) => void;
  onConnectionEstablished?: () => void;
  onConnectionLost?: () => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private pingInterval: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private isConnecting = false;
  private shouldReconnect = true;

  constructor() {
    this.setupHeartbeat();
  }

  /**
   * Connect to venue WebSocket for real-time updates
   */
  connectToVenue(venueId: string, token: string, handlers: WebSocketEventHandlers = {}) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.eventHandlers = handlers;
    this.isConnecting = true;
    this.shouldReconnect = true;

    const baseUrl = API_CONFIG.BASE_DOMAIN;
    
    const wsUrl = `${baseUrl}/ws/venue/${venueId}?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      
      } catch (error) {
      this.isConnecting = false;
      this.handleConnectionError();
    }
  }

  /**
   * Connect to user WebSocket for personal notifications
   */
  connectToUser(userId: string, token: string, handlers: WebSocketEventHandlers = {}) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.eventHandlers = handlers;
    this.isConnecting = true;
    this.shouldReconnect = true;

    const baseUrl = API_CONFIG.BASE_DOMAIN;
    
    const wsUrl = `${baseUrl}/ws/user/${userId}?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      
      } catch (error) {
      this.isConnecting = false;
      this.handleConnectionError();
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      if (this.eventHandlers.onConnectionEstablished) {
        this.eventHandlers.onConnectionEstablished();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        }
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.stopHeartbeat();
      
      if (this.eventHandlers.onConnectionLost) {
        this.eventHandlers.onConnectionLost();
      }

      // Attempt to reconnect if it wasn't a manual close
      if (this.shouldReconnect && event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      this.handleConnectionError();
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'connection_established':
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'order_created':
        if (this.eventHandlers.onOrderCreated) {
          this.eventHandlers.onOrderCreated(message.data);
        }
        break;

      case 'order_status_updated':
        if (this.eventHandlers.onOrderStatusUpdated) {
          this.eventHandlers.onOrderStatusUpdated(message.data);
        }
        break;

      case 'new_order_notification':
        // Special notification for operators
        if (this.eventHandlers.onOrderCreated) {
          this.eventHandlers.onOrderCreated(message.data);
        }
        break;

      case 'order_ready_notification':
        if (this.eventHandlers.onSystemNotification) {
          this.eventHandlers.onSystemNotification({
            type: 'order_ready',
            ...message.data
          });
        }
        break;

      case 'table_status_updated':
        if (this.eventHandlers.onTableStatusUpdated) {
          this.eventHandlers.onTableStatusUpdated(message.data);
        }
        break;

      case 'menu_item_updated':
        if (this.eventHandlers.onMenuItemUpdated) {
          this.eventHandlers.onMenuItemUpdated(message.data);
        }
        break;

      case 'system_notification':
        if (this.eventHandlers.onSystemNotification) {
          this.eventHandlers.onSystemNotification(message.data);
        }
        break;

      case 'venue_status':
        if (this.eventHandlers.onVenueStatus) {
          this.eventHandlers.onVenueStatus(message.data);
        }
        break;

      case 'notifications':
        if (this.eventHandlers.onNotifications) {
          this.eventHandlers.onNotifications(message.data);
        }
        break;

      case 'error':
        if (this.eventHandlers.onError) {
          this.eventHandlers.onError(message.message || 'Unknown error');
        }
        break;

      default:
        }
  }

  /**
   * Send a message to the WebSocket server
   */
  sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      }
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, newStatus: string) {
    this.sendMessage({
      type: 'order_status_update',
      data: {
        order_id: orderId,
        new_status: newStatus
      }
    });
  }

  /**
   * Update table status
   */
  updateTableStatus(tableId: string, newStatus: string) {
    this.sendMessage({
      type: 'table_status_update',
      data: {
        table_id: tableId,
        new_status: newStatus
      }
    });
  }

  /**
   * Request current venue status
   */
  requestVenueStatus() {
    this.sendMessage({
      type: 'get_venue_status'
    });
  }

  /**
   * Request user notifications
   */
  requestNotifications() {
    this.sendMessage({
      type: 'get_notifications'
    });
  }

  /**
   * Setup heartbeat mechanism
   */
  private setupHeartbeat() {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000);
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat() {
    if (!this.pingInterval) {
      this.setupHeartbeat();
    }
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError() {
    if (this.eventHandlers.onError) {
      this.eventHandlers.onError('Connection failed');
    }
    
    if (this.shouldReconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError('Failed to reconnect after multiple attempts');
      }
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      if (this.shouldReconnect && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) {
        // Note: This is a simplified reconnection. In a real implementation,
        // you'd need to store the connection parameters and retry the original connection
        }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export type { WebSocketEventHandlers, WebSocketMessage };