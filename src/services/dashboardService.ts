import { apiService } from './api';
import { ApiResponse } from '../types';

// Dashboard-related types
export interface DashboardData {
  user_role: 'superadmin' | 'admin' | 'operator' | 'customer';
  workspace_id: string;
  venue_id?: string;
  summary: Record<string, any>;
  recent_orders: Array<{
    id: string;
    order_number: string;
    venue_name?: string;
    table_number?: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  active_orders?: Array<{
    id: string;
    order_number: string;
    table_number?: number;
    customer_name: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
    total_amount: number;
    status: string;
    estimated_ready_time?: string;
    actual_ready_time?: string;
    created_at: string;
  }>;
  analytics: Record<string, any>;
  alerts: Array<{
    type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
    message: string;
    venue_id?: string;
    table_id?: string;
    order_id?: string;
    created_at: string;
  }>;
  quick_actions: Array<{
    label: string;
    action: string;
    icon: string;
  }>;
}

export interface SuperAdminDashboard extends DashboardData {
  all_venues: Array<{
    venue_id: string;
    venue_name: string;
    today_orders: number;
    today_revenue: number;
    status: string;
    utilization: number;
  }>;
  workspace_analytics: Record<string, any>;
  user_management: Record<string, any>;
}

export interface AdminDashboard extends DashboardData {
  venue_analytics?: VenueAnalytics;
  staff_performance: Record<string, any>;
  inventory_alerts: Array<Record<string, any>>;
  menu_performance: Array<{
    item_id: string;
    item_name: string;
    orders_today: number;
    revenue_today: number;
    rating: number;
  }>;
  table_status: Array<{
    table_id: string;
    table_number: number;
    status: string;
    capacity: number;
    order_id?: string;
  }>;
}

export interface OperatorDashboard extends DashboardData {
  active_orders: Array<{
    id: string;
    order_number: string;
    table_number?: number;
    customer_name: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
    total_amount: number;
    status: string;
    estimated_ready_time?: string;
    actual_ready_time?: string;
    created_at: string;
  }>;
  table_status: Array<{
    table_id: string;
    table_number: number;
    status: string;
    capacity: number;
    order_id?: string;
  }>;
  today_summary: Record<string, any>;
}

export interface VenueAnalytics {
  venue_id: string;
  venue_name: string;
  period: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  popular_items: Array<Record<string, any>>;
  peak_hours: Array<Record<string, any>>;
  table_utilization: number;
  customer_satisfaction: number;
  order_status_breakdown: Record<string, number>;
}

export interface LiveOrdersData {
  venue_id: string;
  timestamp: string;
  total_active: number;
  orders_by_status: Record<string, any[]>;
  summary: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
  };
}

export interface LiveTablesData {
  venue_id: string;
  timestamp: string;
  total_tables: number;
  tables_by_status: Record<string, any[]>;
  summary: {
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
  };
  utilization_rate: number;
}

export interface RevenueAnalytics {
  venue_id: string;
  daily: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  weekly: Array<{
    week: string;
    revenue: number;
    orders: number;
  }>;
  monthly: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface CustomerAnalytics {
  venue_id: string;
  customer_segments: {
    new: number;
    returning: number;
    vip: number;
  };
  customer_satisfaction: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
  };
  repeat_rate: number;
  average_order_frequency: number;
  top_customers: Array<{
    customer_id: string;
    name: string;
    total_spent: number;
    total_orders: number;
    last_visit: string;
  }>;
}

class DashboardService {
  // Get main dashboard data based on user role
  async getDashboardData(): Promise<DashboardData | null> {
    try {
      const response = await apiService.get<DashboardData>('/dashboard');
      return response.data || null;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return null;
    }
  }

  // Get dashboard summary
  async getDashboardSummary(): Promise<Record<string, any> | null> {
    try {
      const response = await apiService.get<any>('/dashboard/summary');
      return response.data || null;
    } catch (error) {
      console.error('Failed to get dashboard summary:', error);
      return null;
    }
  }

  // Get venue analytics
  async getVenueAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<VenueAnalytics | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<VenueAnalytics>(`/dashboard/analytics/venue/${venueId}?${params.toString()}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get venue analytics:', error);
      return null;
    }
  }

  // Get workspace analytics (SuperAdmin only)
  async getWorkspaceAnalytics(): Promise<Record<string, any> | null> {
    try {
      const response = await apiService.get<any>('/dashboard/analytics/workspace');
      return response.data || null;
    } catch (error) {
      console.error('Failed to get workspace analytics:', error);
      return null;
    }
  }

  // Get live orders data
  async getLiveOrders(venueId?: string): Promise<LiveOrdersData | null> {
    try {
      const params = venueId ? `?venue_id=${venueId}` : '';
      const response = await apiService.get<LiveOrdersData>(`/dashboard/live/orders${params}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get live orders:', error);
      return null;
    }
  }

  // Get live table status
  async getLiveTableStatus(venueId?: string): Promise<LiveTablesData | null> {
    try {
      const params = venueId ? `?venue_id=${venueId}` : '';
      const response = await apiService.get<LiveTablesData>(`/dashboard/live/tables${params}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get live table status:', error);
      return null;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(venueId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RevenueAnalytics | null> {
    try {
      const response = await apiService.get<RevenueAnalytics>(`/analytics/revenue/${venueId}?period=${period}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      return null;
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(venueId: string): Promise<CustomerAnalytics | null> {
    try {
      const response = await apiService.get<CustomerAnalytics>(`/analytics/customers/${venueId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get customer analytics:', error);
      return null;
    }
  }

  // Real-time data polling
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Start polling for live data
  startLiveDataPolling(
    venueId: string,
    onOrdersUpdate: (data: LiveOrdersData) => void,
    onTablesUpdate: (data: LiveTablesData) => void,
    interval: number = 30000 // 30 seconds
  ): void {
    const pollKey = `live_${venueId}`;
    
    // Clear existing polling
    this.stopLiveDataPolling(venueId);

    const poll = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          this.getLiveOrders(venueId),
          this.getLiveTableStatus(venueId)
        ]);

        if (ordersData) onOrdersUpdate(ordersData);
        if (tablesData) onTablesUpdate(tablesData);
      } catch (error) {
        console.error('Live data polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.pollingIntervals.set(pollKey, intervalId);
  }

  // Stop polling for live data
  stopLiveDataPolling(venueId: string): void {
    const pollKey = `live_${venueId}`;
    const intervalId = this.pollingIntervals.get(pollKey);
    
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(pollKey);
    }
  }

  // Stop all polling
  stopAllPolling(): void {
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();
  }

  // Utility Methods

  // Format dashboard metrics
  formatMetric(value: number, type: 'currency' | 'number' | 'percentage'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      
      case 'percentage':
        return `${value.toFixed(1)}%`;
      
      case 'number':
      default:
        return new Intl.NumberFormat('en-IN').format(value);
    }
  }

  // Calculate growth rate
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Get growth indicator
  getGrowthIndicator(growthRate: number): {
    direction: 'up' | 'down' | 'neutral';
    color: string;
    icon: string;
  } {
    if (growthRate > 0) {
      return { direction: 'up', color: '#10b981', icon: '↗' };
    } else if (growthRate < 0) {
      return { direction: 'down', color: '#ef4444', icon: '↘' };
    } else {
      return { direction: 'neutral', color: '#6b7280', icon: '→' };
    }
  }

  // Get alert priority color
  getAlertColor(type: 'info' | 'warning' | 'error' | 'success' | 'urgent'): string {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      urgent: '#dc2626'
    };
    return colors[type] || '#6b7280';
  }

  // Format time ago
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Get peak hours data
  getPeakHours(analytics: VenueAnalytics): Array<{ hour: number; label: string; value: number }> {
    if (!analytics.peak_hours) return [];

    return analytics.peak_hours.map((peak: any) => ({
      hour: peak.hour,
      label: this.formatHour(peak.hour),
      value: peak.occupancy_rate || peak.order_count || 0
    }));
  }

  // Format hour for display
  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  }

  // Get table utilization status
  getTableUtilizationStatus(rate: number): {
    status: 'low' | 'medium' | 'high' | 'full';
    color: string;
    label: string;
  } {
    if (rate >= 95) {
      return { status: 'full', color: '#dc2626', label: 'Full' };
    } else if (rate >= 75) {
      return { status: 'high', color: '#f59e0b', label: 'High' };
    } else if (rate >= 50) {
      return { status: 'medium', color: '#10b981', label: 'Medium' };
    } else {
      return { status: 'low', color: '#3b82f6', label: 'Low' };
    }
  }

  // Generate dashboard insights
  generateInsights(analytics: VenueAnalytics): string[] {
    const insights: string[] = [];

    // Revenue insights
    if (analytics.average_order_value > 500) {
      insights.push('High average order value indicates premium positioning');
    }

    // Customer insights
    const newCustomerRate = (analytics.new_customers / analytics.total_customers) * 100;
    if (newCustomerRate > 30) {
      insights.push('Strong new customer acquisition');
    }

    // Table utilization insights
    if (analytics.table_utilization > 80) {
      insights.push('Consider adding more tables during peak hours');
    } else if (analytics.table_utilization < 40) {
      insights.push('Opportunity to improve table utilization');
    }

    // Customer satisfaction insights
    if (analytics.customer_satisfaction >= 4.5) {
      insights.push('Excellent customer satisfaction scores');
    } else if (analytics.customer_satisfaction < 3.5) {
      insights.push('Focus on improving customer experience');
    }

    return insights;
  }

  // Export dashboard data
  async exportDashboardData(venueId: string, format: 'csv' | 'pdf' | 'excel' = 'csv'): Promise<Blob | null> {
    try {
      const response = await apiService.get<Blob>(`/dashboard/export/${venueId}?format=${format}`, undefined, {
        responseType: 'blob'
      });
      return response.data || null;
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();