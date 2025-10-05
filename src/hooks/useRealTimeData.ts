import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../components/realtime/WebSocketProvider';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/business';
import { orderService } from '../services/business';
import { tableService } from '../services/business';

// Generic real-time data hook
export const useRealTimeData = <T>(
  fetchFunction: () => Promise<T>,
  eventTypes: string[] = [],
  refreshInterval: number = 30000,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { subscribe } = useWebSocket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchFunction();
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Set up polling interval
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchData, refreshInterval]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    eventTypes.forEach(eventType => {
      const unsubscribe = subscribe(eventType, () => {
        // Refresh data when relevant events occur
        fetchData();
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe, eventTypes, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
};

// Real-time orders hook
export const useRealTimeOrders = (venueId?: string, status?: string) => {
  const { user } = useAuth();
  const targetVenueId = venueId || user?.venue_id;

  const fetchOrders = useCallback(async () => {
    if (!targetVenueId) return [];
    
    const filters: any = { venue_id: targetVenueId };
    if (status) filters.status = status;
    
    const result = await orderService.getOrders(filters);
    return result.data;
  }, [targetVenueId, status]);

  return useRealTimeData(
    fetchOrders,
    ['order_update', 'order_created', 'order_status_changed'],
    15000, // 15 seconds for orders
    [targetVenueId, status]
  );
};

// Real-time live orders hook (for dashboard)
export const useRealTimeLiveOrders = (venueId?: string) => {
  const { user } = useAuth();
  const targetVenueId = venueId || user?.venue_id;

  const fetchLiveOrders = useCallback(async () => {
    if (!targetVenueId) return null;
    return await dashboardService.getLiveOrderStatus(targetVenueId);
  }, [targetVenueId]);

  return useRealTimeData(
    fetchLiveOrders,
    ['order_update', 'order_status_changed'],
    10000, // 10 seconds for live data
    [targetVenueId]
  );
};

// Real-time tables hook
export const useRealTimeTables = (venueId?: string) => {
  const { user } = useAuth();
  const targetVenueId = venueId || user?.venue_id;

  const fetchTables = useCallback(async () => {
    if (!targetVenueId) return [];
    const result = await tableService.getTables({ venue_id: targetVenueId });
    return result.data;
  }, [targetVenueId]);

  return useRealTimeData(
    fetchTables,
    ['table_update', 'table_status_changed'],
    30000, // 30 seconds for tables
    [targetVenueId]
  );
};

// Real-time live tables hook (for dashboard)
export const useRealTimeLiveTables = (venueId?: string) => {
  const { user } = useAuth();
  const targetVenueId = venueId || user?.venue_id;

  const fetchLiveTables = useCallback(async () => {
    if (!targetVenueId) return null;
    return await dashboardService.getLiveTableStatus(targetVenueId);
  }, [targetVenueId]);

  return useRealTimeData(
    fetchLiveTables,
    ['table_update', 'table_status_changed'],
    20000, // 20 seconds for live table data
    [targetVenueId]
  );
};

// Real-time dashboard analytics hook
export const useRealTimeDashboard = () => {
  const { user } = useAuth();

  const fetchDashboard = useCallback(async () => {
    return await dashboardService.getDashboardData();
  }, []);

  return useRealTimeData(
    fetchDashboard,
    ['order_update', 'table_update', 'venue_update'],
    60000, // 1 minute for dashboard
    [user?.id]
  );
};

// Real-time notifications hook
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('notification', (data) => {
      setNotifications(prev => [data.payload, ...prev.slice(0, 49)]); // Keep last 50
    });

    return unsubscribe;
  }, [subscribe]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
};

// Custom event listeners for real-time updates
export const useRealTimeEvents = () => {
  const [orderUpdates, setOrderUpdates] = useState<any[]>([]);
  const [tableUpdates, setTableUpdates] = useState<any[]>([]);
  const [userUpdates, setUserUpdates] = useState<any[]>([]);
  const [venueUpdates, setVenueUpdates] = useState<any[]>([]);

  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      setOrderUpdates(prev => [event.detail, ...prev.slice(0, 9)]); // Keep last 10
    };

    const handleTableUpdate = (event: CustomEvent) => {
      setTableUpdates(prev => [event.detail, ...prev.slice(0, 9)]);
    };

    const handleUserUpdate = (event: CustomEvent) => {
      setUserUpdates(prev => [event.detail, ...prev.slice(0, 9)]);
    };

    const handleVenueUpdate = (event: CustomEvent) => {
      setVenueUpdates(prev => [event.detail, ...prev.slice(0, 9)]);
    };

    window.addEventListener('orderUpdate', handleOrderUpdate as EventListener);
    window.addEventListener('tableUpdate', handleTableUpdate as EventListener);
    window.addEventListener('userUpdate', handleUserUpdate as EventListener);
    window.addEventListener('venueUpdate', handleVenueUpdate as EventListener);

    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate as EventListener);
      window.removeEventListener('tableUpdate', handleTableUpdate as EventListener);
      window.removeEventListener('userUpdate', handleUserUpdate as EventListener);
      window.removeEventListener('venueUpdate', handleVenueUpdate as EventListener);
    };
  }, []);

  return {
    orderUpdates,
    tableUpdates,
    userUpdates,
    venueUpdates
  };
};

// Connection status hook
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isConnected, connectionStatus } = useWebSocket();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isWebSocketConnected: isConnected,
    connectionStatus,
    isFullyConnected: isOnline && isConnected
  };
};