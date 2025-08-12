import { apiService } from './api';
import { ApiResponse } from '../types';
import { dashboardCache, CacheKeys } from './cacheService';

interface DashboardStats {
  [key: string]: number | string;
}

interface SuperAdminDashboard {
  summary: {
    total_workspaces: number;
    total_venues: number;
    total_users: number;
    total_orders: number;
    total_revenue: number;
    active_venues: number;
  };
  workspaces: Array<{
    id: string;
    name: string;
    venue_count: number;
    user_count: number;
    is_active: boolean;
    created_at: string;
  }>;
}

interface AdminDashboard {
  summary: {
    today_orders: number;
    today_revenue: number;
    total_tables: number;
    occupied_tables: number;
    total_menu_items: number;
    active_menu_items: number;
    total_staff: number;
  };
  recent_orders: Array<{
    id: string;
    order_number: string;
    table_number: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

interface OperatorDashboard {
  summary: {
    active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    occupied_tables: number;
    total_tables: number;
  };
  active_orders: Array<{
    id: string;
    order_number: string;
    table_number: number;
    total_amount: number;
    status: string;
    created_at: string;
    estimated_ready_time?: string;
    items_count: number;
  }>;
}

class DashboardService {


  async getSuperAdminDashboard(): Promise<SuperAdminDashboard> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('superadmin'),
      async () => {
        try {
          const response = await apiService.get<SuperAdminDashboard>('/dashboard/superadmin');
          
          if (response.success && response.data) {
            return response.data;
          }
          
          // Throw error if API fails - no mock data
          throw new Error('Failed to load SuperAdmin dashboard data');
        } catch (error) {
          throw error;
        }
      },
      2 * 60 * 1000 // 2 minutes TTL for dashboard data
    );
  }

  async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      // Check if user has venue assigned first
      const userData = localStorage.getItem('dino_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.venue_id && !user.cafeId && user.role !== 'superadmin') {
          throw new Error('No venue assigned to your account. Please contact your administrator to assign you to a venue.');
        }
      }

      // Try multiple possible endpoints in order of preference
      const endpoints = [
        '/dashboard/admin',
        '/dashboard',
        '/venues/dashboard',
        '/admin/dashboard'
      ];
      
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiService.get<AdminDashboard>(endpoint);
          if (response.success && response.data) {
            return response.data;
          }
        } catch (error: any) {
          lastError = error;
          // Check if it's a venue assignment error
          if (error.response?.status === 400 && error.response?.data?.detail?.includes('venue')) {
            throw new Error('No venue assigned. Please contact your administrator to assign you to a venue.');
          }
          // For 404s, continue to try next endpoint
          if (error.response?.status === 404) {
            continue;
          }
          // For other errors, break and handle below
          break;
        }
      }
      
      // If all endpoints failed with 404s, it might be a venue assignment issue
      if (lastError?.response?.status === 404) {
        console.warn('All dashboard endpoints returned 404. This might indicate a venue assignment issue or backend configuration problem.');
        // Check user data again for venue assignment
        const userData = localStorage.getItem('dino_user');
        if (userData) {
          const user = JSON.parse(userData);
          if (!user.venue_id && !user.cafeId) {
            throw new Error('Dashboard endpoints not found. This appears to be related to missing venue assignment. Please contact your administrator.');
          }
        }
        throw new Error('Dashboard endpoints not found. Please check your permissions or contact support.');
      }
      
      // For other errors, throw the error - no mock data
      console.error('Dashboard API failed:', lastError?.message);
      throw new Error('Failed to load dashboard data. Please check your connection and try again.');
    } catch (error: any) {
      // Re-throw all errors - no fallback to mock data
      throw error;
    }
  }

  async getOperatorDashboard(): Promise<OperatorDashboard> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('operator'),
      async () => {
        try {
          const response = await apiService.get<OperatorDashboard>('/dashboard/operator');
          
          if (response.success && response.data) {
            return response.data;
          }
          
          // Throw error if API fails - no mock data
          throw new Error('Failed to load Operator dashboard data');
        } catch (error) {
          throw error;
        }
      },
      1 * 60 * 1000 // 1 minute TTL for operator dashboard (more real-time)
    );
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/dashboard/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  async getDashboardData(): Promise<any> {
    // Alias for getDashboardStats for compatibility
    return this.getDashboardStats();
  }

  async getVenueDashboard(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/venue/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return empty data if API fails - no mock data
      return {};
    } catch (error) {
      console.warn('Venue dashboard API failed, using mock data for development');
      // Return empty object to let component use its mock data
      return {};
    }
  }

  async getLiveOrderStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live-orders/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return empty data if API fails - no mock data
      return {
        summary: { total_active_orders: 0, pending_orders: 0, preparing_orders: 0, ready_orders: 0 },
        orders_by_status: {}
      };
    } catch (error) {
      return {
        summary: { total_active_orders: 0, pending_orders: 0, preparing_orders: 0, ready_orders: 0 },
        orders_by_status: {}
      };
    }
  }

  async getLiveTableStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live-tables/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return empty data if API fails - no mock data
      return {
        tables: [],
        summary: { total_tables: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 }
      };
    } catch (error) {
      return {
        tables: [],
        summary: { total_tables: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 }
      };
    }
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }


}

export const dashboardService = new DashboardService();