import React, { useEffect } from 'react';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useRealTimeLiveOrders, useRealTimeLiveTables, useRealTimeDashboard } from '../../hooks/useRealTimeData';
import { useToastActions } from '../../contexts/ToastContext';
import { ConnectionStatus, LiveDataIndicator, OrderStatusIndicator, TableStatusIndicator } from '../realtime/StatusIndicators';
import ActivityFeed from '../realtime/ActivityFeed';
import { RoleBasedComponent } from '../auth';
import { PermissionGate } from '../auth';
import { PERMISSIONS } from '../../types/auth';

interface RealTimeDashboardProps {
  className?: string;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { showOrderUpdate, showTableUpdate, showConnectionStatus } = useToastActions();

  // Real-time data hooks
  const { 
    data: liveOrders, 
    loading: ordersLoading, 
    error: ordersError, 
    lastUpdated: ordersLastUpdated 
  } = useRealTimeLiveOrders();

  const { 
    data: liveTables, 
    loading: tablesLoading, 
    error: tablesError, 
    lastUpdated: tablesLastUpdated 
  } = useRealTimeLiveTables();

  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError 
  } = useRealTimeDashboard();

  // Show connection status notifications
  useEffect(() => {
    const handleOnline = () => showConnectionStatus(true);
    const handleOffline = () => showConnectionStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showConnectionStatus]);

  // Listen for real-time order updates
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      const { order_number, status } = event.detail;
      showOrderUpdate(order_number, status);
    };

    const handleTableUpdate = (event: CustomEvent) => {
      const { table_number, status } = event.detail;
      showTableUpdate(table_number, status);
    };

    window.addEventListener('orderUpdate', handleOrderUpdate as EventListener);
    window.addEventListener('tableUpdate', handleTableUpdate as EventListener);

    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate as EventListener);
      window.removeEventListener('tableUpdate', handleTableUpdate as EventListener);
    };
  }, [showOrderUpdate, showTableUpdate]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Real-Time Dashboard</h2>
            <ConnectionStatus showLabel={true} />
          </div>
          <div className="text-sm text-gray-500">
            {user?.venue_id ? `Venue: ${user.venue_id}` : 'All Venues'}
          </div>
        </div>
      </Card>

      {/* Live Orders Section */}
      <PermissionGate permission={PERMISSIONS.ORDERS_VIEW}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Orders</h3>
            <LiveDataIndicator
              lastUpdated={ordersLastUpdated}
              isLoading={ordersLoading}
              error={ordersError}
            />
          </div>

          {liveOrders ? (
            <div className="space-y-4">
              {/* Order Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {liveOrders.summary?.pending_orders || 0}
                      </p>
                      <p className="text-sm text-yellow-700">Pending</p>
                    </div>
                    <OrderStatusIndicator status="pending" showLabel={false} animated />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {liveOrders.summary?.total_active_orders || 0}
                      </p>
                      <p className="text-sm text-blue-700">Confirmed</p>
                    </div>
                    <OrderStatusIndicator status="confirmed" showLabel={false} />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {liveOrders.summary?.preparing_orders || 0}
                      </p>
                      <p className="text-sm text-orange-700">Preparing</p>
                    </div>
                    <OrderStatusIndicator status="preparing" showLabel={false} animated />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {liveOrders.summary?.ready_orders || 0}
                      </p>
                      <p className="text-sm text-green-700">Ready</p>
                    </div>
                    <OrderStatusIndicator status="ready" showLabel={false} />
                  </div>
                </div>
              </div>

              {/* Active Orders List */}
              {Object.entries(liveOrders.orders_by_status || {}).map(([status, orders]) => {
                const orderArray = Array.isArray(orders) ? orders : [];
                return orderArray.length > 0 && (
                  <div key={status} className="space-y-2">
                    <h4 className="font-medium text-gray-900 capitalize flex items-center space-x-2">
                      <OrderStatusIndicator status={status} size="sm" />
                      <span>{status} Orders ({orderArray.length})</span>
                    </h4>
                    <div className="grid gap-2">
                      {orderArray.slice(0, 3).map((order: any) => (
                        <div key={order.id} className="bg-gray-50 p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">#{order.order_number}</p>
                              <p className="text-xs text-gray-600">
                                {order.customer_name} • Table {order.table_number || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">₹{order.total_amount}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orderArray.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{orderArray.length - 3} more orders
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Loading live orders...</div>
            </div>
          )}
        </Card>
      </PermissionGate>

      {/* Live Tables Section */}
      <PermissionGate permission={PERMISSIONS.TABLES_VIEW}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Table Status</h3>
            <LiveDataIndicator
              lastUpdated={tablesLastUpdated}
              isLoading={tablesLoading}
              error={tablesError}
            />
          </div>

          {liveTables ? (
            <div className="space-y-4">
              {/* Table Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {liveTables.summary?.available || 0}
                      </p>
                      <p className="text-sm text-green-700">Available</p>
                    </div>
                    <TableStatusIndicator status="available" showLabel={false} />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {liveTables.summary?.occupied || 0}
                      </p>
                      <p className="text-sm text-red-700">Occupied</p>
                    </div>
                    <TableStatusIndicator status="occupied" showLabel={false} />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {liveTables.summary?.reserved || 0}
                      </p>
                      <p className="text-sm text-yellow-700">Reserved</p>
                    </div>
                    <TableStatusIndicator status="reserved" showLabel={false} />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {liveTables.summary?.cleaning || 0}
                      </p>
                      <p className="text-sm text-blue-700">Cleaning</p>
                    </div>
                    <TableStatusIndicator status="cleaning" showLabel={false} />
                  </div>
                </div>
              </div>

              {/* Utilization Rate */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Table Utilization</span>
                  <span className="text-sm font-bold text-gray-900">
                    {liveTables.utilization_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${liveTables.utilization_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Loading table status...</div>
            </div>
          )}
        </Card>
      </PermissionGate>

      {/* Activity Feed */}
      <RoleBasedComponent allowedRoles={['admin', 'superadmin']}>
        <ActivityFeed maxItems={15} showFilters={true} />
      </RoleBasedComponent>

      {/* Quick Stats for Operators */}
      <RoleBasedComponent allowedRoles={['operator']}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {(liveOrders?.summary?.pending_orders || 0) + (liveOrders?.summary?.total_active_orders || 0)}
              </p>
              <p className="text-sm text-gray-600">Orders to Process</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {liveOrders?.summary?.preparing_orders || 0}
              </p>
              <p className="text-sm text-gray-600">In Kitchen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {liveOrders?.summary?.ready_orders || 0}
              </p>
              <p className="text-sm text-gray-600">Ready to Serve</p>
            </div>
          </div>
        </Card>
      </RoleBasedComponent>
    </div>
  );
};

export default RealTimeDashboard;