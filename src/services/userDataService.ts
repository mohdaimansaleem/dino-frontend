import { apiService } from './api';
import { ApiResponse } from '../types/api';

export interface UserData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    is_active: boolean;
    venue_id: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
  };
  venue: {
    id: string;
    name: string;
    description: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    phone: string;
    email: string;
    is_active: boolean;
    is_open: boolean;
    workspace_id: string;
    created_at: string;
    updated_at: string;
  };
  workspace: {
    id: string;
    name: string;
    display_name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  statistics: {
    total_orders: number;
    total_revenue: number;
    active_tables: number;
    total_tables: number;
    total_menu_items: number;
    total_users: number;
  };
  menu_items: any[];
  tables: any[];
  recent_orders: any[];
  users: any[];
  permissions: {
    can_manage_menu: boolean;
    can_manage_tables: boolean;
    can_manage_orders: boolean;
    can_manage_users: boolean;
    can_view_analytics: boolean;
    can_manage_venue: boolean;
  };
}

export interface VenueData {
  venue: any;
  statistics: {
    total_orders: number;
    total_revenue: number;
    active_tables: number;
    total_tables: number;
    total_menu_items: number;
    total_users: number;
  };
  menu_items: any[];
  tables: any[];
  recent_orders: any[];
  users: any[];
}

export interface AvailableVenues {
  venues: Array<{
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    is_open: boolean;
    location: any;
  }>;
}

class UserDataService {
  /**
   * Get comprehensive user data including venue, workspace, and related information
   */
  async getUserData(): Promise<UserData | null> {
    try {
      console.log('Fetching user data...');
      const response = await apiService.get<UserData>('/auth/user-data');
      
      if (response.success && response.data) {
        console.log('User data fetched successfully:', response.data);
        return response.data;
      }
      
      console.warn('User data fetch failed:', response.message);
      return null;
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this data.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('No venue assigned to your account. Please contact support.');
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user data');
    }
  }

  /**
   * Get venue-specific data (for superadmin switching venues)
   */
  async getVenueData(venueId: string): Promise<VenueData | null> {
    try {
      console.log('Fetching venue data for:', venueId);
      const response = await apiService.get<VenueData>(`/auth/venue-data/${venueId}`);
      
      if (response.success && response.data) {
        console.log('Venue data fetched successfully:', response.data);
        return response.data;
      }
      
      console.warn('Venue data fetch failed:', response.message);
      return null;
    } catch (error: any) {
      console.error('Error fetching venue data:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Only superadmin can switch venues.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Venue not found.');
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue data');
    }
  }

  /**
   * Get available venues for superadmin
   */
  async getAvailableVenues(): Promise<AvailableVenues | null> {
    try {
      console.log('Fetching available venues...');
      const response = await apiService.get<AvailableVenues>('/auth/available-venues');
      
      if (response.success && response.data) {
        console.log('Available venues fetched successfully:', response.data);
        return response.data;
      }
      
      console.warn('Available venues fetch failed:', response.message);
      return null;
    } catch (error: any) {
      console.error('Error fetching available venues:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Only superadmin can view all venues.');
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch available venues');
    }
  }

  /**
   * Refresh user data (useful after venue switching or data updates)
   */
  async refreshUserData(): Promise<UserData | null> {
    return this.getUserData();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(userData: UserData | null, permission: keyof UserData['permissions']): boolean {
    if (!userData?.permissions) return false;
    return userData.permissions[permission];
  }

  /**
   * Get user role
   */
  getUserRole(userData: UserData | null): string {
    return userData?.user?.role || 'operator';
  }

  /**
   * Check if user is superadmin
   */
  isSuperAdmin(userData: UserData | null): boolean {
    return this.getUserRole(userData) === 'superadmin';
  }

  /**
   * Check if user is admin
   */
  isAdmin(userData: UserData | null): boolean {
    const role = this.getUserRole(userData);
    return role === 'admin' || role === 'superadmin';
  }

  /**
   * Check if user is operator
   */
  isOperator(userData: UserData | null): boolean {
    return this.getUserRole(userData) === 'operator';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN');
  }

  /**
   * Format datetime
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN');
  }

  /**
   * Get venue display name
   */
  getVenueDisplayName(userData: UserData | null): string {
    return userData?.venue?.name || 'Unknown Venue';
  }

  /**
   * Get workspace display name
   */
  getWorkspaceDisplayName(userData: UserData | null): string {
    return userData?.workspace?.display_name || userData?.workspace?.name || 'Unknown Workspace';
  }

  /**
   * Get user display name
   */
  getUserDisplayName(userData: UserData | null): string {
    if (!userData?.user) return 'Unknown User';
    return `${userData.user.first_name} ${userData.user.last_name}`.trim();
  }

  /**
   * Get venue statistics summary
   */
  getVenueStatsSummary(userData: UserData | null): string {
    if (!userData?.statistics) return 'No statistics available';
    
    const stats = userData.statistics;
    return `${stats.total_orders} orders, ${this.formatCurrency(stats.total_revenue)} revenue, ${stats.active_tables}/${stats.total_tables} tables active`;
  }
}

export const userDataService = new UserDataService();