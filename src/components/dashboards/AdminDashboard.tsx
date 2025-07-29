import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { dashboardService, AdminDashboard as AdminDashboardType } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedComponent from '../RoleBasedComponent';
import PermissionGate from '../PermissionGate';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardType | null>(null);
  const [liveOrders, setLiveOrders] = useState<any>(null);
  const [liveTables, setLiveTables] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time data polling for admin
    if (user?.venue_id) {
      dashboardService.startLiveDataPolling(
        user.venue_id,
        setLiveOrders,
        setLiveTables,
        30000 // 30 seconds
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
      setDashboardData(dashboard as AdminDashboardType);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const summary = dashboardData?.summary || {};
  const analytics = dashboardData?.venue_analytics || {};

  return (
    <RoleBasedComponent allowedRoles={['admin']} className={className}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}!</h1>
          <p className="text-green-100 mt-1">Restaurant Administrator Dashboard</p>
          {user?.venue_id && (
            <p className="text-green-200 text-sm mt-2">Managing: {summary.venue_name || 'Your Restaurant'}</p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summary.today_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {liveOrders?.total_active || 0} active
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardService.formatMetric(summary.today_revenue || 0, 'currency')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {dashboardService.formatMetric(summary.average_order_value || 0, 'currency')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Table Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardService.formatMetric(summary.table_utilization || 0, 'percentage')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {liveTables?.summary?.occupied || 0} / {liveTables?.total_tables || 0} occupied
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.customer_rating ? `${summary.customer_rating}★` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total_reviews || 0} reviews
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Order Status */}
        <PermissionGate permission="orders:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Order Status</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            
            {liveOrders ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {liveOrders.summary?.pending || 0}
                  </p>
                  <p className="text-sm text-yellow-700">Pending</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {liveOrders.summary?.confirmed || 0}
                  </p>
                  <p className="text-sm text-blue-700">Confirmed</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {liveOrders.summary?.preparing || 0}
                  </p>
                  <p className="text-sm text-orange-700">Preparing</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {liveOrders.summary?.ready || 0}
                  </p>
                  <p className="text-sm text-green-700">Ready</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-500">Loading live data...</span>
              </div>
            )}
          </Card>
        </PermissionGate>

        {/* Table Status Overview */}
        <PermissionGate permission="tables:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Table Status</h2>
              <PermissionGate permission="tables:update">
                <Button size="sm">Manage Tables</Button>
              </PermissionGate>
            </div>
            
            {liveTables ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {liveTables.summary?.available || 0}
                  </p>
                  <p className="text-sm text-green-700">Available</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {liveTables.summary?.occupied || 0}
                  </p>
                  <p className="text-sm text-red-700">Occupied</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {liveTables.summary?.reserved || 0}
                  </p>
                  <p className="text-sm text-yellow-700">Reserved</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {liveTables.summary?.cleaning || 0}
                  </p>
                  <p className="text-sm text-blue-700">Cleaning</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-500">Loading table data...</span>
              </div>
            )}
          </Card>
        </PermissionGate>

        {/* Recent Orders */}
        <PermissionGate permission="orders:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Button variant="outline" size="sm">View All Orders</Button>
            </div>
            
            {dashboardData?.recent_orders && dashboardData.recent_orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recent_orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.table_number ? `Table ${order.table_number}` : 'Takeaway'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dashboardService.formatMetric(order.total_amount, 'currency')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'pending' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dashboardService.formatTimeAgo(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent orders found
              </div>
            )}
          </Card>
        </PermissionGate>

        {/* Menu Performance */}
        <PermissionGate permission="menu:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Menu Items</h2>
              <PermissionGate permission="menu:update">
                <Button variant="outline" size="sm">Manage Menu</Button>
              </PermissionGate>
            </div>
            
            {dashboardData?.menu_performance && dashboardData.menu_performance.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.menu_performance.slice(0, 5).map((item, index) => (
                  <div key={item.item_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-500">{item.orders_today} orders today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {dashboardService.formatMetric(item.revenue_today, 'currency')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.rating ? `${item.rating}★` : 'No rating'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No menu performance data available
              </div>
            )}
          </Card>
        </PermissionGate>
      </div>
    </RoleBasedComponent>
  );
};

export default AdminDashboard;