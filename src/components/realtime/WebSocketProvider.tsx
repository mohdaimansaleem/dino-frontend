import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/api';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
  reconnect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  autoConnect = true,
  reconnectAttempts = 5,
  reconnectInterval = 3000
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const messageQueueRef = useRef<Array<{ type: string; payload: any }>>([]);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_URL || `${protocol}//${window.location.host}/ws`;
    const token = localStorage.getItem('dino_token');
    return `${host}?token=${token}`;
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      setConnectionStatus('disconnected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectCountRef.current = 0;

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
          }
        }

        // Subscribe to user-specific events
        if (user) {
          sendMessage('subscribe', {
            user_id: user.id,
            venue_id: user.venue_id,
            workspace_id: user.workspace_id,
            role: user.role
          });
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Notify subscribers
          const eventType = data.type || 'message';
          const subscribers = subscribersRef.current.get(eventType);
          if (subscribers) {
            subscribers.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                }
            });
          }

          // Handle specific event types
          handleWebSocketMessage(data);
        } catch (error) {
          }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        setConnectionStatus('error');
        scheduleReconnect();
      };

    } catch (error) {
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [isAuthenticated, user, getWebSocketUrl, reconnectAttempts]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      return;
    }

    reconnectCountRef.current++;
    const delay = reconnectInterval * Math.pow(1.5, reconnectCountRef.current - 1);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectInterval]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'order_update':
        // Dispatch custom event for order updates
        window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data.payload }));
        break;
      
      case 'table_update':
        // Dispatch custom event for table updates
        window.dispatchEvent(new CustomEvent('tableUpdate', { detail: data.payload }));
        break;
      
      case 'notification':
        // Handle notifications through notification service
        notificationService.createLocalNotification(
          data.payload.type,
          data.payload.title,
          data.payload.message,
          data.payload.data
        );
        break;
      
      case 'user_update':
        // Handle user-related updates
        window.dispatchEvent(new CustomEvent('userUpdate', { detail: data.payload }));
        break;
      
      case 'venue_update':
        // Handle venue status updates
        window.dispatchEvent(new CustomEvent('venueUpdate', { detail: data.payload }));
        break;
      
      default:
        }
  };

  const sendMessage = useCallback((type: string, payload: any) => {
    const message = { type, payload, timestamp: new Date().toISOString() };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      messageQueueRef.current.push(message);

    }
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectCountRef.current = 0;
    disconnect();
    setTimeout(connect, 1000);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    subscribersRef.current.clear();
    messageQueueRef.current = [];
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    subscribe,
    reconnect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Connection status indicator component
export const WebSocketStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { connectionStatus, isConnected, reconnect } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400 animate-pulse';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">{getStatusText()}</span>
      {!isConnected && connectionStatus !== 'connecting' && (
        <button
          onClick={reconnect}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};