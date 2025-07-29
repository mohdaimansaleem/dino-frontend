import { apiService } from './api';
import { ApiResponse } from '../types';

export interface DashboardAnalytics {
  venue_id: string;
  period: string;
  revenue: {
    total: number;
    today: number;
    yesterday: number;
    this_week: number;
    this_month: number;
    growth_rate: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    completed: number;
    cancelled: number;
    average_order_value: number;
  };
  customers: {
    total: number;
    new_today: number;
    returning: number;
    satisfaction_rate: number;
  };
  popular_items: Array<{
    menu_item_id: string;
    menu_item_name: string;
    order_count: number;
    revenue: number;
    rating: number;
  }>;
  peak_hours: Array<{
    hour: number;
    order_count: number;
    revenue: number;
  }>;
  table_utilization: {
    total_tables: number;
    occupied: number;
    available: number;
    utilization_rate: number;
  };
}

export interface LiveOrderData {
  venue_id: string;
  timestamp: string;
  total_active: number;
  orders_by_status: {
    pending: any[];
    confirmed: any[];
    preparing: any[];
    ready: any[];
  };
}

export interface LiveTableData {
  venue_id: string;
  timestamp: string;
  total_tables: number;
  tables_by_status: {
    available: any[];
    occupied: any[];
    reserved: any[];
    cleaning: any[];
  };
}

class DashboardService {
  async getDashboardAnalytics(venueId?: string, period?: string): Promise<DashboardAnalytics> {
    try {
      const params: any = {};
      if (venueId) params.venue_id = venueId;
      if (period) params.period = period;
      
      const response = await apiService.get<DashboardAnalytics>('/dashboard/analytics', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard analytics');
      }
    } catch (error: any) {
      console.error('Get dashboard analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch dashboard analytics');
    }
  }

  async getLiveOrderData(venueId: string): Promise<LiveOrderData> {
    try {
      const response = await apiService.get<LiveOrderData>(`/dashboard/live/orders`, {
        venue_id: venueId
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch live order data');
      }
    } catch (error: any) {
      console.error('Get live order data error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch live order data');
    }
  }

  async getLiveTableData(venueId: string): Promise<LiveTableData> {
    try {
      const response = await apiService.get<LiveTableData>(`/dashboard/live/tables`, {
        venue_id: venueId
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch live table data');
      }
    } catch (error: any) {
      console.error('Get live table data error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch live table data');
    }
  }

  async getRevenueAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = { venue_id: venueId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get('/analytics/revenue', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch revenue analytics');
      }
    } catch (error: any) {
      console.error('Get revenue analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch revenue analytics');
    }
  }

  async getCustomerAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = { venue_id: venueId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get('/analytics/customers', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch customer analytics');
      }
    } catch (error: any) {
      console.error('Get customer analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch customer analytics');
    }
  }

  async getMenuAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = { venue_id: venueId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get('/analytics/menu', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch menu analytics');
      }
    } catch (error: any) {
      console.error('Get menu analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch menu analytics');
    }
  }

  async exportAnalytics(venueId: string, type: 'revenue' | 'orders' | 'customers' | 'menu', format: 'csv' | 'pdf' = 'csv'): Promise<void> {
    try {
      const response = await apiService.get(`/analytics/export/${type}`, {
        venue_id: venueId,
        format
      });
      
      if (response.success) {
        // The API should return a download URL or trigger a download
        console.log('Export initiated successfully');
      } else {
        throw new Error(response.message || 'Failed to export analytics');
      }
    } catch (error: any) {
      console.error('Export analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to export analytics');
    }
  }

  // Real-time dashboard updates
  subscribeToDashboardUpdates(venueId: string, callback: (data: any) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement polling as a fallback
    const interval = setInterval(async () => {
      try {
        const [liveOrders, liveTables] = await Promise.all([
          this.getLiveOrderData(venueId),
          this.getLiveTableData(venueId)
        ]);
        
        callback({
          orders: liveOrders,
          tables: liveTables,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error polling dashboard updates:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }
}

export const dashboardService = new DashboardService();