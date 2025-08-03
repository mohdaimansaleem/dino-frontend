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
  // Default data methods
  private getDefaultAdminData(): AdminDashboard {
    return {
      summary: {
        today_orders: 12,
        today_revenue: 8500,
        total_tables: 15,
        occupied_tables: 8,
        total_menu_items: 35,
        active_menu_items: 32,
        total_staff: 6,
      },
      recent_orders: [
        {
          id: '1',
          order_number: 'ORD-001',
          table_number: 5,
          total_amount: 850,
          status: 'preparing',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        },
        {
          id: '2',
          order_number: 'ORD-002',
          table_number: 3,
          total_amount: 1200,
          status: 'ready',
          created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
        },
        {
          id: '3',
          order_number: 'ORD-003',
          table_number: 8,
          total_amount: 650,
          status: 'pending',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        },
        {
          id: '4',
          order_number: 'ORD-004',
          table_number: 12,
          total_amount: 950,
          status: 'served',
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        },
      ],
    };
  }

  async getSuperAdminDashboard(): Promise<SuperAdminDashboard> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('superadmin'),
      async () => {
        try {
          const response = await apiService.get<SuperAdminDashboard>('/dashboard/superadmin');
          
          if (response.success && response.data) {
            return response.data;
          }
          
          // Return mock data if API fails
          return this.getMockSuperAdminData();
        } catch (error) {
          return this.getMockSuperAdminData();
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
      
      // For other errors, log and return default data
      console.warn('Dashboard API failed, using default data:', lastError?.message);
      return this.getDefaultAdminData();
    } catch (error: any) {
      // Re-throw specific errors so the component can handle them appropriately
      if (error.message.includes('venue') || error.message.includes('Dashboard endpoints')) {
        throw error;
      }
      
      // For unexpected errors, log and return default data
      console.error('Unexpected dashboard error:', error);
      return this.getDefaultAdminData();
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
          
          // Return mock data if API fails
          return this.getMockOperatorData();
        } catch (error) {
          return this.getMockOperatorData();
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

  async getLiveOrderStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live-orders/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return mock data if API fails
      return {
        summary: {
          total_active_orders: 5,
          pending_orders: 2,
          preparing_orders: 2,
          ready_orders: 1,
        },
        orders_by_status: {
          pending: [
            { id: '1', order_number: 'ORD-001', table_number: 5, total_amount: 850, status: 'pending' },
            { id: '2', order_number: 'ORD-002', table_number: 3, total_amount: 1200, status: 'pending' }
          ],
          preparing: [
            { id: '3', order_number: 'ORD-003', table_number: 8, total_amount: 650, status: 'preparing' },
            { id: '4', order_number: 'ORD-004', table_number: 12, total_amount: 950, status: 'preparing' }
          ],
          ready: [
            { id: '5', order_number: 'ORD-005', table_number: 7, total_amount: 750, status: 'ready' }
          ]
        }
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
      
      // Return mock data if API fails
      return {
        tables: [
          { id: '1', table_number: 1, capacity: 4, status: 'available' },
          { id: '2', table_number: 2, capacity: 2, status: 'occupied' },
          { id: '3', table_number: 3, capacity: 6, status: 'occupied' },
          { id: '4', table_number: 4, capacity: 4, status: 'available' },
          { id: '5', table_number: 5, capacity: 2, status: 'reserved' },
        ],
        summary: {
          total_tables: 5,
          available: 2,
          occupied: 2,
          reserved: 1,
          maintenance: 0
        }
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

  // Mock data methods for development/fallback
  private getMockSuperAdminData(): SuperAdminDashboard {
    return {
      summary: {
        total_workspaces: 5,
        total_venues: 12,
        total_users: 45,
        total_orders: 1250,
        total_revenue: 125000,
        active_venues: 10,
      },
      workspaces: [
        {
          id: '1',
          name: 'Pizza Palace Group',
          venue_count: 3,
          user_count: 12,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Burger Barn Chain',
          venue_count: 2,
          user_count: 8,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Coffee Corner',
          venue_count: 1,
          user_count: 5,
          is_active: false,
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  private getMockAdminData(): AdminDashboard {
    return {
      summary: {
        today_orders: 25,
        today_revenue: 12500,
        total_tables: 20,
        occupied_tables: 12,
        total_menu_items: 45,
        active_menu_items: 40,
        total_staff: 8,
      },
      recent_orders: [
        {
          id: '1',
          order_number: 'ORD-001',
          table_number: 5,
          total_amount: 850,
          status: 'preparing',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          order_number: 'ORD-002',
          table_number: 3,
          total_amount: 1200,
          status: 'ready',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          order_number: 'ORD-003',
          table_number: 8,
          total_amount: 650,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  private getMockOperatorData(): OperatorDashboard {
    return {
      summary: {
        active_orders: 8,
        pending_orders: 3,
        preparing_orders: 4,
        ready_orders: 1,
        occupied_tables: 12,
        total_tables: 20,
      },
      active_orders: [
        {
          id: '1',
          order_number: 'ORD-001',
          table_number: 5,
          total_amount: 850,
          status: 'preparing',
          created_at: new Date().toISOString(),
          items_count: 3,
        },
        {
          id: '2',
          order_number: 'ORD-002',
          table_number: 3,
          total_amount: 1200,
          status: 'ready',
          created_at: new Date().toISOString(),
          items_count: 5,
        },
        {
          id: '3',
          order_number: 'ORD-003',
          table_number: 8,
          total_amount: 650,
          status: 'pending',
          created_at: new Date().toISOString(),
          items_count: 2,
        },
        {
          id: '4',
          order_number: 'ORD-004',
          table_number: 12,
          total_amount: 950,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          items_count: 4,
        },
      ],
    };
  }
}

export const dashboardService = new DashboardService();