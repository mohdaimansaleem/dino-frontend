import { apiService } from './api';
import { ApiResponse } from '../types/api';
import { ROLE_NAMES, isAdminLevel } from '../constants/roles';

export interface UserData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    venue_ids: string[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    // Compatibility fields
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    createdAt?: string;
  };
  venue: {
    id: string;
    name: string;
    description?: string;
    location: {
      landmark?: string;
      address: string;
      state: string;
      city: string;
      postal_code: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    is_active: boolean;
    is_open: boolean;
    created_at: string;
    updated_at?: string;
    // Compatibility fields
    workspaceId?: string;
    ownerId?: string;
    isActive?: boolean;
    isOpen?: boolean;
    createdAt?: string;
    updatedAt?: string;
    address?: string; // For backward compatibility
  } | null;
  workspace: {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
  } | null;
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

// REMOVED: AvailableVenues interface - no longer needed for security reasons

class UserDataService {
  /**
   * Get comprehensive user data including venue, workspace, and related information
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const response = await apiService.get<{data: UserData, timestamp: string}>('/auth/user-data');
      
      if (response.success && response.data) {
        // Extract the actual user data from the response
        const userData = response.data.data || response.data;
        
        // Map venue data properly with comprehensive field mapping
        if (userData.venue) {
          userData.venue = {
            ...userData.venue,
            // Ensure camelCase properties exist alongside snake_case
            isActive: userData.venue.is_active !== undefined ? userData.venue.is_active : (userData.venue as any).isActive,
            isOpen: userData.venue.is_open !== undefined ? userData.venue.is_open : (userData.venue as any).isOpen || false,
            createdAt: userData.venue.created_at || (userData.venue as any).createdAt,
            updatedAt: userData.venue.updated_at || (userData.venue as any).updatedAt,
            
            // Ensure location data is properly mapped
            location: userData.venue.location || {
              landmark: '',
              address: '',
              state: '',
              city: '',
              postal_code: '',
              country: ''
            },
            
            // Ensure all required fields have defaults
            name: userData.venue.name || 'Unknown Venue',
            description: userData.venue.description || '',
            phone: userData.venue.phone || '',
            email: userData.venue.email || ''
          };
        }
        
        // Map user data properly
        if (userData.user) {
          userData.user = {
            ...userData.user,
            firstName: userData.user.first_name || (userData.user as any).firstName,
            lastName: userData.user.last_name || (userData.user as any).lastName,
            isActive: userData.user.is_active !== undefined ? userData.user.is_active : (userData.user as any).isActive,
            createdAt: userData.user.created_at || (userData.user as any).createdAt
          };
        }
        
        return userData;
      }
      
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
      const response = await apiService.get<VenueData>(`/auth/venue-data/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
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
   * SECURITY FIX: This method has been completely removed
   * Reason: It was exposing all venue data to superadmin users, violating the principle of least privilege
   * Solution: Users should only access venues they are explicitly assigned to
   */

  /**
   * Refresh user data (useful after venue switching or data updates)
   */
  async refreshUserData(): Promise<UserData | null> {
    return this.getUserData();
  }

  /**
   * Check if user has specific permission (simplified - based on role)
   */
  hasPermission(userData: UserData | null, permission: string): boolean {
    if (!userData?.user?.role) return false;
    
    const role = userData.user.role;
    
    // Simple role-based permission checking
    const rolePermissions: Record<string, string[]> = {
      'superadmin': [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders', 
        'can_manage_users', 'can_view_analytics', 'can_manage_venue',
        'can_manage_workspace', 'can_switch_venues'
      ],
      'admin': [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders', 
        'can_manage_users', 'can_view_analytics', 'can_manage_venue'
      ],
      'operator': [
        'can_manage_orders', 'can_manage_tables'
      ]
    };
    
    const allowedPermissions = rolePermissions[role] || [];
    return allowedPermissions.includes(permission);
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
    return this.getUserRole(userData) === ROLE_NAMES.SUPERADMIN;
  }

  /**
   * Check if user is admin
   */
  isAdmin(userData: UserData | null): boolean {
    const role = this.getUserRole(userData);
    return isAdminLevel(role);
  }

  /**
   * Check if user is operator
   */
  isOperator(userData: UserData | null): boolean {
    return this.getUserRole(userData) === ROLE_NAMES.OPERATOR;
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
    return userData?.venue?.name || 'No Venue Assigned';
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
    if (!userData?.venue) return 'No venue assigned';
    return `Venue: ${userData.venue.name}`;
  }
}

export const userDataService = new UserDataService();