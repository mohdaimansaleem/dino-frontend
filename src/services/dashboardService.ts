import { apiService } from './api';
import { 
  DashboardData,
  SuperAdminDashboard,
  AdminDashboard,
  OperatorDashboard,
  LiveOrderData,
  VenueAnalyticsData,
  UserRole,
  ApiResponse
} from '../types/api';

class DashboardService {
  // =============================================================================
  // ROLE-BASED DASHBOARD DATA
  // =============================================================================

  /**
   * Get role-based dashboard data
   */
  async getDashboardData(): Promise<DashboardData | null> {
    try {
      const response = await apiService.get<DashboardData>('/dashboard');
      return response.data || null;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return null;
    }
  }

  /**
   * Get quick dashboard summary
   */
  async getDashboardSummary(): Promise<any> {
    try {
      const response = await apiService.get<any>('/dashboard/summary');
      return response.data || {};
    } catch (error) {
      console.error('Failed to get dashboard summary:', error);
      return {};
    }
  }

  // =============================================================================
  // VENUE ANALYTICS
  // =============================================================================

  /**
   * Get detailed venue analytics
   */
  async getVenueAnalytics(
    venueId: string,
    startDate?: string,
    endDate?: string
  ): Promise<VenueAnalyticsData | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<VenueAnalyticsData>(
        `/dashboard/analytics/venue/${venueId}?${params.toString()}`
      );
      return response.data || null;
    } catch (error) {
      console.error('Failed to get venue analytics:', error);
      return null;
    }
  }

  /**
   * Get workspace-wide analytics (SuperAdmin only)
   */
  async getWorkspaceAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<any>(
        `/dashboard/analytics/workspace?${params.toString()}`
      );
      return response.data || {};
    } catch (error) {
      console.error('Failed to get workspace analytics:', error);
      return {};
    }
  }

  // =============================================================================
  // REAL-TIME DATA
  // =============================================================================

  /**
   * Get real-time order status
   */
  async getLiveOrderStatus(venueId?: string): Promise<LiveOrderData | null> {
    try {
      const params = venueId ? `?venue_id=${venueId}` : '';
      const response = await apiService.get<LiveOrderData>(`/dashboard/live/orders${params}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get live order status:', error);
      return null;
    }
  }

  /**
   * Get real-time table status
   */
  async getLiveTableStatus(venueId?: string): Promise<any> {
    try {
      const params = venueId ? `?venue_id=${venueId}` : '';
      const response = await apiService.get<any>(`/dashboard/live/tables${params}`);
      return response.data || {};
    } catch (error) {
      console.error('Failed to get live table status:', error);
      return {};
    }
  }

  // =============================================================================
  // DASHBOARD UTILITIES
  // =============================================================================

  /**
   * Format dashboard data based on user role
   */
  formatDashboardData(data: DashboardData): {
    title: string;
    subtitle: string;
    primaryMetrics: Array<{ label: string; value: string | number; trend?: number }>;
    secondaryMetrics: Array<{ label: string; value: string | number }>;
  } {
    const role = data.user_role;
    
    switch (role) {
      case 'superadmin':
        return this.formatSuperAdminDashboard(data as SuperAdminDashboard);
      case 'admin':
        return this.formatAdminDashboard(data as AdminDashboard);
      case 'operator':
        return this.formatOperatorDashboard(data as OperatorDashboard);
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome back',
          primaryMetrics: [],
          secondaryMetrics: []
        };
    }
  }

  private formatSuperAdminDashboard(data: SuperAdminDashboard) {
    return {
      title: 'SuperAdmin Dashboard',
      subtitle: 'System Overview',
      primaryMetrics: [
        { label: 'Total Venues', value: data.summary.total_venues },
        { label: 'Active Venues', value: data.summary.active_venues },
        { label: 'Total Orders', value: data.summary.total_orders },
        { label: 'Total Revenue', value: this.formatCurrency(data.summary.total_revenue) }
      ],
      secondaryMetrics: [
        { label: 'Venue Utilization', value: `${Math.round((data.summary.active_venues / data.summary.total_venues) * 100)}%` }
      ]
    };
  }

  private formatAdminDashboard(data: AdminDashboard) {
    return {
      title: 'Admin Dashboard',
      subtitle: 'Venue Management',
      primaryMetrics: [
        { label: "Today's Orders", value: data.summary.today_orders },
        { label: "Today's Revenue", value: this.formatCurrency(data.summary.today_revenue) },
        { label: 'Active Tables', value: data.summary.active_tables },
        { label: 'Occupied Tables', value: data.summary.occupied_tables }
      ],
      secondaryMetrics: [
        { label: 'Table Occupancy', value: `${Math.round((data.summary.occupied_tables / data.summary.active_tables) * 100)}%` }
      ]
    };
  }

  private formatOperatorDashboard(data: OperatorDashboard) {
    return {
      title: 'Operator Dashboard',
      subtitle: 'Order Management',
      primaryMetrics: [
        { label: 'Active Orders', value: data.summary.active_orders },
        { label: 'Pending Orders', value: data.summary.pending_orders },
        { label: 'Ready Orders', value: data.summary.ready_orders },
        { label: 'Occupied Tables', value: data.summary.occupied_tables }
      ],
      secondaryMetrics: []
    };
  }

  /**
   * Get dashboard refresh interval based on role
   */
  getRefreshInterval(role: UserRole): number {
    const intervals = {
      superadmin: 60000, // 1 minute
      admin: 30000,      // 30 seconds
      operator: 10000,   // 10 seconds
      customer: 30000    // 30 seconds
    };
    return intervals[role] || 30000;
  }

  /**
   * Get dashboard widgets configuration based on role
   */
  getDashboardWidgets(role: UserRole): Array<{
    id: string;
    title: string;
    type: 'metric' | 'chart' | 'table' | 'list';
    size: 'small' | 'medium' | 'large';
    priority: number;
  }> {
    const widgets = {
      superadmin: [
        { id: 'workspace-overview', title: 'Workspace Overview', type: 'metric' as const, size: 'large' as const, priority: 1 },
        { id: 'venue-performance', title: 'Venue Performance', type: 'chart' as const, size: 'large' as const, priority: 2 },
        { id: 'revenue-trends', title: 'Revenue Trends', type: 'chart' as const, size: 'medium' as const, priority: 3 },
        { id: 'user-activity', title: 'User Activity', type: 'table' as const, size: 'medium' as const, priority: 4 },
        { id: 'system-alerts', title: 'System Alerts', type: 'list' as const, size: 'small' as const, priority: 5 }
      ],
      admin: [
        { id: 'venue-overview', title: 'Venue Overview', type: 'metric' as const, size: 'large' as const, priority: 1 },
        { id: 'order-trends', title: 'Order Trends', type: 'chart' as const, size: 'medium' as const, priority: 2 },
        { id: 'table-status', title: 'Table Status', type: 'table' as const, size: 'medium' as const, priority: 3 },
        { id: 'staff-performance', title: 'Staff Performance', type: 'chart' as const, size: 'small' as const, priority: 4 },
        { id: 'inventory-alerts', title: 'Inventory Alerts', type: 'list' as const, size: 'small' as const, priority: 5 }
      ],
      operator: [
        { id: 'active-orders', title: 'Active Orders', type: 'table' as const, size: 'large' as const, priority: 1 },
        { id: 'order-queue', title: 'Order Queue', type: 'list' as const, size: 'medium' as const, priority: 2 },
        { id: 'table-overview', title: 'Table Overview', type: 'metric' as const, size: 'medium' as const, priority: 3 },
        { id: 'kitchen-status', title: 'Kitchen Status', type: 'metric' as const, size: 'small' as const, priority: 4 }
      ],
      customer: [
        { id: 'order-history', title: 'Order History', type: 'list' as const, size: 'large' as const, priority: 1 },
        { id: 'favorites', title: 'Favorites', type: 'list' as const, size: 'medium' as const, priority: 2 },
        { id: 'recommendations', title: 'Recommendations', type: 'list' as const, size: 'medium' as const, priority: 3 }
      ]
    };

    return widgets[role] || [];
  }

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format large numbers for display
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get time period options for analytics
   */
  getTimePeriodOptions(): Array<{
    value: string;
    label: string;
    startDate: string;
    endDate: string;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    return [
      {
        value: 'today',
        label: 'Today',
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        value: 'yesterday',
        label: 'Yesterday',
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0]
      },
      {
        value: 'last7days',
        label: 'Last 7 Days',
        startDate: weekAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        value: 'last30days',
        label: 'Last 30 Days',
        startDate: monthAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        value: 'last365days',
        label: 'Last Year',
        startDate: yearAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    ];
  }

  /**
   * Generate chart colors
   */
  getChartColors(): {
    primary: string[];
    secondary: string[];
    success: string[];
    warning: string[];
    danger: string[];
  } {
    return {
      primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
      secondary: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
      success: ['#10b981', '#059669', '#047857', '#065f46'],
      warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
      danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b']
    };
  }

  /**
   * Get status indicators for real-time data
   */
  getStatusIndicators(): {
    online: { color: string; label: string };
    offline: { color: string; label: string };
    warning: { color: string; label: string };
    error: { color: string; label: string };
  } {
    return {
      online: { color: '#10b981', label: 'Online' },
      offline: { color: '#6b7280', label: 'Offline' },
      warning: { color: '#f59e0b', label: 'Warning' },
      error: { color: '#ef4444', label: 'Error' }
    };
  }

  /**
   * Format time for display
   */
  formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format relative time (e.g., "2 minutes ago")
   */
  formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return this.formatDate(date);
  }

  /**
   * Check if data needs refresh based on timestamp
   */
  needsRefresh(lastUpdated: string | Date, maxAgeMs: number = 30000): boolean {
    const now = new Date();
    const updated = new Date(lastUpdated);
    return (now.getTime() - updated.getTime()) > maxAgeMs;
  }

  // =============================================================================
  // REAL-TIME POLLING METHODS
  // =============================================================================

  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start live data polling for a venue
   */
  startLiveDataPolling(
    venueId: string,
    onOrdersUpdate: (data: any) => void,
    onTablesUpdate?: (data: any) => void,
    intervalMs: number = 10000
  ): void {
    // Clear existing interval if any
    this.stopLiveDataPolling(venueId);

    const pollData = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          this.getLiveOrderStatus(venueId),
          this.getLiveTableStatus(venueId)
        ]);

        if (ordersData) {
          onOrdersUpdate(ordersData);
        }

        if (tablesData && onTablesUpdate) {
          onTablesUpdate(tablesData);
        }
      } catch (error) {
        console.error('Failed to poll live data:', error);
      }
    };

    // Initial fetch
    pollData();

    // Set up interval
    const interval = setInterval(pollData, intervalMs);
    this.pollingIntervals.set(venueId, interval);
  }

  /**
   * Stop live data polling for a venue
   */
  stopLiveDataPolling(venueId: string): void {
    const interval = this.pollingIntervals.get(venueId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(venueId);
    }
  }

  /**
   * Stop all live data polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
  }

  /**
   * Get live orders data
   */
  async getLiveOrders(venueId: string): Promise<any> {
    return this.getLiveOrderStatus(venueId);
  }

  // =============================================================================
  // FORMATTING UTILITIES
  // =============================================================================

  /**
   * Format metric values for display
   */
  formatMetric(value: number, type: 'currency' | 'number' | 'percentage'): string {
    switch (type) {
      case 'currency':
        return this.formatCurrency(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return this.formatNumber(value);
      default:
        return value.toString();
    }
  }

  /**
   * Format time ago (alias for formatRelativeTime)
   */
  formatTimeAgo(date: string | Date): string {
    return this.formatRelativeTime(date);
  }

  /**
   * Generate mock data for development/testing
   */
  generateMockDashboardData(role: UserRole): DashboardData {
    const baseData = {
      user_role: role,
      workspace_id: 'mock-workspace-id',
      venue_id: role !== 'superadmin' ? 'mock-venue-id' : undefined
    };

    switch (role) {
      case 'superadmin':
        return {
          ...baseData,
          summary: {
            total_venues: 15,
            active_venues: 12,
            total_orders: 1250,
            total_revenue: 125000
          },
          all_venues: [],
          workspace_analytics: {},
          user_management: {},
          alerts: [],
          quick_actions: []
        } as SuperAdminDashboard;

      case 'admin':
        return {
          ...baseData,
          summary: {
            today_orders: 45,
            today_revenue: 8500,
            active_tables: 20,
            occupied_tables: 12
          },
          venue_analytics: {},
          staff_performance: {},
          inventory_alerts: []
        } as AdminDashboard;

      case 'operator':
        return {
          ...baseData,
          summary: {
            active_orders: 8,
            pending_orders: 3,
            ready_orders: 2,
            occupied_tables: 12
          },
          active_orders: [],
          table_status: [],
          today_summary: {}
        } as OperatorDashboard;

      default:
        return baseData as DashboardData;
    }
  }
}

export const dashboardService = new DashboardService();

// Export types for components
export type { 
  SuperAdminDashboard, 
  AdminDashboard, 
  OperatorDashboard 
} from '../types/api';