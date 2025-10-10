import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService, WebSocketEventHandlers } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  connect: (venueId?: string) => void;
  disconnect: () => void;
  updateOrderStatus: (orderId: string, newStatus: string) => void;
  updateTableStatus: (tableId: string, newStatus: string) => void;
  requestVenueStatus: () => void;
  requestNotifications: () => void;
  // Real-time data
  realtimeOrders: any[];
  realtimeTables: any[];
  realtimeNotifications: any[];
  venueStatus: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const [realtimeTables, setRealtimeTables] = useState<any[]>([]);
  const [realtimeNotifications, setRealtimeNotifications] = useState<any[]>([]);
  const [venueStatus, setVenueStatus] = useState<any>(null);

  // WebSocket event handlers
  const eventHandlers: WebSocketEventHandlers = {
    onConnectionEstablished: () => {
      setIsConnected(true);
      setConnectionState('CONNECTED');
      showToast('Connected to real-time updates', 'success');
    },

    onConnectionLost: () => {
      setIsConnected(false);
      setConnectionState('DISCONNECTED');
      showToast('Lost connection to real-time updates', 'warning');
    },

    onError: (error: string) => {
      setIsConnected(false);
      setConnectionState('ERROR');
      showToast(`Connection error: ${error}`, 'error');
    },

    onOrderCreated: (data: any) => {
      setRealtimeOrders(prev => [data, ...prev]);
      
      // Show notification for new orders
      if (data.order_number) {
        showToast(`New order: ${data.order_number}`, 'info');
      }
    },

    onOrderStatusUpdated: (data: any) => {
      setRealtimeOrders(prev => 
        prev.map(order => 
          order.id === data.order_id 
            ? { ...order, status: data.new_status }
            : order
        )
      );

      // Show notification for status changes
      if (data.order_number && data.new_status) {
        showToast(`Order ${data.order_number} is now ${data.new_status}`, 'info');
      }
    },

    onTableStatusUpdated: (data: any) => {
      setRealtimeTables(prev =>
        prev.map(table =>
          table.id === data.table_id
            ? { ...table, table_status: data.new_status }
            : table
        )
      );

      // Show notification for table status changes
      if (data.table_number && data.new_status) {
        showToast(`Table ${data.table_number} is now ${data.new_status}`, 'info');
      }
    },

    onMenuItemUpdated: (data: any) => {
      // Handle menu item updates
      if (data.item_name) {
        const status = data.is_available ? 'available' : 'unavailable';
        showToast(`${data.item_name} is now ${status}`, 'info');
      }
    },

    onSystemNotification: (data: any) => {
      // Handle system notifications
      if (data.type === 'order_ready') {
        showToast(`Order ${data.order_number} is ready for Table ${data.table_number}!`, 'success');
      } else {
        showToast(data.message || 'System notification', 'info');
      }
    },

    onVenueStatus: (data: any) => {
      setVenueStatus(data);
      
      // Update realtime data from venue status
      if (data.active_orders) {
        setRealtimeOrders(data.active_orders);
      }
      if (data.table_status) {
        setRealtimeTables(data.table_status);
      }
    },

    onNotifications: (data: any) => {
      setRealtimeNotifications(data);
    },
  };

  // Connect to WebSocket when user is authenticated
  const connect = (venueId?: string) => {
    if (!isAuthenticated || !user) {
      console.log('🔌 WebSocket: Not connecting - user not authenticated');
      return;
    }

    const token = localStorage.getItem('dino_token');
    if (!token) {
      console.log('🔌 WebSocket: Not connecting - no token found');
      return;
    }

    // Determine venue ID
    const targetVenueId = venueId || user.venue_id || user.venueId;
    
    console.log('🔌 WebSocket: Attempting to connect...', {
      userId: user.id,
      venueId: targetVenueId,
      hasToken: !!token
    });
    
    if (targetVenueId) {
      // Connect to venue WebSocket for venue-specific updates
      console.log('🔌 WebSocket: Connecting to venue WebSocket');
      websocketService.connectToVenue(targetVenueId, token, eventHandlers);
    } else {
      // Connect to user WebSocket for personal notifications
      console.log('🔌 WebSocket: Connecting to user WebSocket');
      websocketService.connectToUser(user.id, token, eventHandlers);
    }

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => clearInterval(stateInterval);
  };

  const disconnect = () => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionState('DISCONNECTED');
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    websocketService.updateOrderStatus(orderId, newStatus);
  };

  const updateTableStatus = (tableId: string, newStatus: string) => {
    websocketService.updateTableStatus(tableId, newStatus);
  };

  const requestVenueStatus = () => {
    websocketService.requestVenueStatus();
  };

  const requestNotifications = () => {
    websocketService.requestNotifications();
  };

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Small delay to ensure token is available
      const timer = setTimeout(() => {
        connect();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      disconnect();
    }
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    connect,
    disconnect,
    updateOrderStatus,
    updateTableStatus,
    requestVenueStatus,
    requestNotifications,
    realtimeOrders,
    realtimeTables,
    realtimeNotifications,
    venueStatus,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;