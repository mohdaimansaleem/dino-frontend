import { apiService } from './api';
import { ApiResponse } from '../types';
import { dashboardCache, CacheKeys } from './cacheService';
import { 
  ComprehensiveDashboardData, 
  AdminDashboardResponse, 
  OperatorDashboardResponse, 
  SuperAdminDashboardResponse 
} from '../types/dashboard';

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


  async getSuperAdminDashboard(): Promise<SuperAdminDashboardResponse> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('superadmin'),
      async () => {
        try {
          // Get user's assigned venue ID - both Admin and SuperAdmin should have venue assigned
          const userDataResponse = await apiService.get<any>('/auth/user-data');
          
          console.log('🔍 Full user data response:', userDataResponse);
          console.log('🔍 Response data field:', userDataResponse.data);
          console.log('🔍 Venue field:', userDataResponse.data?.venue);
          console.log('🔍 Venue ID:', userDataResponse.data?.venue?.id);
          
          // Check different possible paths
          const responseData = userDataResponse.data as any;
          const venueId = responseData?.venue?.id || 
                         responseData?.data?.venue?.id ||
                         (userDataResponse as any).venue?.id;
          
          if (!venueId) {
            console.error('❌ No venue ID found in any expected path');
            console.error('❌ Full response structure:', JSON.stringify(userDataResponse, null, 2));
            throw new Error('No venue assigned to your account. Please contact your administrator.');
          }
          console.log('🏢 Using venue ID for dashboard:', venueId);
          
          // Only call venue dashboard API - backend will return appropriate data based on user role
          const response = await apiService.get<SuperAdminDashboardResponse>(`/dashboard/venue/${venueId}`);
          
          if (response.success && response.data) {
            const responseData = userDataResponse.data as any;
            const venueName = responseData?.venue?.name || 
                             responseData?.data?.venue?.name || 
                             (userDataResponse as any).venue?.name || 
                             'Unknown Venue';
            
            console.log('✅ Dashboard data loaded from venue API:', {
              venueId: venueId,
              venueName: venueName,
              todayOrders: response.data.system_stats?.total_orders_today,
              todayRevenue: response.data.system_stats?.total_revenue_today
            });
            return response.data;
          }
          
          throw new Error('Invalid dashboard response format');
        } catch (error: any) {
          console.error('❌ SuperAdmin dashboard API failed:', error);
          
          // Check for specific error types
          if (error.response?.status === 404) {
            throw new Error('Dashboard endpoint not found. Please ensure the backend API is properly configured.');
          } else if (error.response?.status === 403) {
            throw new Error('Access denied. You may not have permission to view dashboard data.');
          } else if (error.response?.status === 400 && error.response?.data?.detail?.includes('venue')) {
            throw new Error('No venue assigned to your account. Please contact your administrator.');
          }
          
          throw new Error(error.message || 'Failed to load SuperAdmin dashboard data');
        }
      },
      2 * 60 * 1000 // 2 minutes TTL for dashboard data
    );
  }

  /**
   * Get comprehensive admin dashboard data from venue-specific endpoint
   * This endpoint returns all dashboard data based on real database records for the user's venue
   */
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('admin'),
      async () => {
        try {
          // Get user's venue ID from auth context
          const userDataResponse = await apiService.get<any>('/auth/user-data');
          
          if (!userDataResponse.success || !userDataResponse.data?.venue?.id) {
            throw new Error('No venue assigned to your account. Please contact your administrator.');
          }
          
          const venueId = userDataResponse.data.venue.id;
          console.log('🏢 Using venue ID for dashboard:', venueId);
          
          // Use venue-specific endpoint that returns all dashboard data
          const response = await apiService.get<AdminDashboardResponse>(`/dashboard/venue/${venueId}`);
          
          if (response.success && response.data) {
            console.log('✅ Dashboard data loaded successfully:', {
              venue: response.data.venue_name,
              todayOrders: response.data.stats.today.orders_count,
              todayRevenue: response.data.stats.today.revenue,
              recentOrdersCount: response.data.recent_orders.length
            });
            return response.data;
          }
          
          throw new Error('Invalid dashboard response format');
        } catch (error: any) {
          console.error('❌ Dashboard API failed:', error);
          
          // Check for specific error types
          if (error.response?.status === 404) {
            throw new Error('Dashboard endpoint not found. Please ensure the backend API is properly configured.');
          } else if (error.response?.status === 403) {
            throw new Error('Access denied. You may not have permission to view dashboard data.');
          } else if (error.response?.status === 400 && error.response?.data?.detail?.includes('venue')) {
            throw new Error('No venue assigned to your account. Please contact your administrator.');
          }
          
          throw new Error(error.message || 'Failed to load dashboard data. Please try again.');
        }
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getOperatorDashboard(): Promise<OperatorDashboardResponse> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('operator'),
      async () => {
        try {
          const response = await apiService.get<OperatorDashboardResponse>('/dashboard/operator/comprehensive');
          
          if (response.success && response.data) {
            console.log('✅ Operator dashboard data loaded:', {
              venue: response.data.venue_name,
              activeOrders: response.data.stats.active_orders,
              pendingOrders: response.data.stats.pending_orders,
              occupiedTables: response.data.stats.tables_occupied
            });
            return response.data;
          }
          
          throw new Error('Invalid Operator dashboard response format');
        } catch (error: any) {
          console.error('❌ Operator dashboard API failed:', error);
          throw new Error(error.message || 'Failed to load Operator dashboard data');
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
      return null;
    } catch (error) {
      console.error('Venue dashboard API failed:', error);
      // Return null to indicate failure - no mock data
      return null;
    }
  }

  async getLiveOrderStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live-orders/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return null if API fails - no mock data
      return null;
    } catch (error) {
      console.error('Live order status API failed:', error);
      return null;
    }
  }

  async getLiveTableStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live-tables/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return null if API fails - no mock data
      return null;
    } catch (error) {
      console.error('Live table status API failed:', error);
      return null;
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