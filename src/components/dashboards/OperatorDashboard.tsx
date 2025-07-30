import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { dashboardService, OperatorDashboard as OperatorDashboardType } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedComponent from '../RoleBasedComponent';
import PermissionGate from '../PermissionGate';

interface OperatorDashboardProps {
  className?: string;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<OperatorDashboardType | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time data polling for operator
    if (user?.venue_id) {
      dashboardService.startLiveDataPolling(
        user.venue_id,
        (ordersData) => {
          // Update active orders from live data
          const allActiveOrders = Object.values(ordersData.orders_by_status || {}).flat();
          setActiveOrders(allActiveOrders as any[]);
        },
        () => {}, // Operator doesn't need table updates
        15000 // 15 seconds for more frequent updates
      );
    }

    return () => {
      if (user?.venue_id) {
        dashboardService.stopLiveDataPolling(user.venue_id);
      }
    };
  }, [user?.venue_id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboard = await dashboardService.getDashboardData();
      setDashboardData(dashboard as OperatorDashboardType);
      
      // Load active orders
      if (dashboard?.active_orders) {
        setActiveOrders(dashboard.active_orders);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      await orderService.updateOrderStatus(orderId, newStatus as any);
      
      // Update local state
      setActiveOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      // You might want to show a toast notification here
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Served';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <Button 
          onClick={loadDashboardData} 
          variant="outline" 
          size="sm" 
          className="mt-3"
        >
          Retry
        </Button>
      </div>
    );
  }

  const summary = dashboardData?.today_summary || {} as any;

  return (
    <RoleBasedComponent allowedRoles={['operator']} className={className}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-orange-100 mt-1">Kitchen Operations Dashboard</p>
          <div className="flex items-center mt-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-orange-200 text-sm">Live Order Updates</span>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                <p className="text-2xl font-bold text-gray-900">{summary.orders_processed || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
                <p className="text-2xl font-bold text-gray-900">{summary.avg_prep_time || 0}m</p>
                <p className="text-xs text-gray-500 mt-1">Minutes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Orders - Main Focus */}
        <PermissionGate permission="orders:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Auto-refreshing</span>
              </div>
            </div>
            
            {activeOrders.length > 0 ? (
              <div className="grid gap-4">
                {activeOrders
                  .filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status))
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {(order as any).table_number ? `Table ${(order as any).table_number}` : 'Takeaway'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {dashboardService.formatTimeAgo(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Customer: {(order as any).customer_name || 'N/A'}</p>
                        <div className="space-y-1">
                          {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              {item.special_instructions && (
                                <span className="text-orange-600 text-xs italic">
                                  {item.special_instructions}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            Total: {dashboardService.formatMetric(order.total_amount, 'currency')}
                          </span>
                          {order.estimated_ready_time && (
                            <span className="ml-4 text-orange-600">
                              ETA: {new Date(order.estimated_ready_time).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        <PermissionGate permission="orders:update">
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order.id, getNextStatus(order.status)!)}
                              disabled={updatingOrder === order.id}
                              className={
                                order.status === 'pending' ? 'bg-blue-600 hover:bg-blue-700' :
                                order.status === 'confirmed' ? 'bg-orange-600 hover:bg-orange-700' :
                                order.status === 'preparing' ? 'bg-green-600 hover:bg-green-700' :
                                'bg-gray-600 hover:bg-gray-700'
                              }
                            >
                              {updatingOrder === order.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                getStatusAction(order.status)
                              )}
                            </Button>
                          )}
                        </PermissionGate>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active orders</h3>
                <p className="mt-1 text-sm text-gray-500">All orders are completed or no new orders yet.</p>
              </div>
            )}
          </Card>
        </PermissionGate>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PermissionGate permission="orders:view">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm">All Orders</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission="orders:create">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm">New Order</span>
              </Button>
            </PermissionGate>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Kitchen Timer</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm">Reports</span>
            </Button>
          </div>
        </Card>

        {/* Recent Completed Orders */}
        <PermissionGate permission="orders:view">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed</h2>
            
            {dashboardData?.active_orders && dashboardData.active_orders.filter(o => o.status === 'served').length > 0 ? (
              <div className="space-y-3">
                {dashboardData.active_orders
                  .filter(order => order.status === 'served')
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(order as any).customer_name || 'N/A'} • {(order as any).table_number ? `Table ${(order as any).table_number}` : 'Takeaway'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Completed</p>
                        <p className="text-xs text-gray-500">
                          {order.actual_ready_time 
                            ? dashboardService.formatTimeAgo(order.actual_ready_time)
                            : dashboardService.formatTimeAgo(order.created_at)
                          }
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No completed orders yet today
              </div>
            )}
          </Card>
        </PermissionGate>
      </div>
    </RoleBasedComponent>
  );
};

export default OperatorDashboard;