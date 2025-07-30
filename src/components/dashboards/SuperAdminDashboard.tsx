import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { dashboardService, SuperAdminDashboard as SuperAdminDashboardType } from '../../services/dashboardService';
import { workspaceService } from '../../services/workspaceService';
import { venueService } from '../../services/venueService';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedComponent from '../RoleBasedComponent';
import PermissionGate from '../PermissionGate';

interface SuperAdminDashboardProps {
  className?: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardType | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, workspaceList, venueList] = await Promise.all([
        dashboardService.getDashboardData(),
        workspaceService.getWorkspaces(),
        venueService.getVenues()
      ]);

      setDashboardData(dashboard as SuperAdminDashboardType);
      setWorkspaces(workspaceList.data || []);
      setVenues(venueList.data || []);
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

  const summary = dashboardData?.summary || {} as any;
  const analytics = dashboardData?.workspace_analytics || {};

  return (
    <RoleBasedComponent allowedRoles={['superadmin']} className={className}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-blue-100 mt-1">Super Administrator Dashboard</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workspaces</p>
                <p className="text-2xl font-bold text-gray-900">{workspaces.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardService.formatMetric(summary.total_revenue || 0, 'currency')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardService.formatMetric(summary.total_orders || 0, 'number')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Workspace Overview */}
        <PermissionGate permission="workspace:view">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Workspace Overview</h2>
              <PermissionGate permission="workspace:create">
                <Button size="sm">Add Workspace</Button>
              </PermissionGate>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workspace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workspaces.map((workspace) => (
                    <tr key={workspace.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{workspace.name}</div>
                        <div className="text-sm text-gray-500">{workspace.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {workspace.pricing_plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {venues.filter(v => v.workspace_id === workspace.id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          workspace.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {workspace.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <PermissionGate permission="workspace:update">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </PermissionGate>

        {/* Venue Performance */}
        <PermissionGate permission="cafe:view_all">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Performing Venues</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {venues.slice(0, 5).map((venue) => (
                <div key={venue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {venue.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{venue.name}</p>
                      <p className="text-sm text-gray-500">{venue.location?.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {venue.rating ? `${venue.rating}★` : 'No rating'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {venue.total_reviews || 0} reviews
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </PermissionGate>

        {/* Recent Alerts */}
        {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
            <div className="space-y-3">
              {dashboardData.alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-50 border-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' :
                    alert.type === 'warning' ? 'text-yellow-800' :
                    alert.type === 'success' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardService.formatTimeAgo(alert.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </RoleBasedComponent>
  );
};

export default SuperAdminDashboard;