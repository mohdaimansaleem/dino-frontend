import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';
import { ROLE_NAMES, isAdminLevel } from '../../constants/roles';
import StorageManager from '../../utils/storage';

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
    theme?: string; // Venue theme (e.g., 'pet', 'default')
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
  private lastCallTime: number = 0;
  private debounceDelay: number = 1000; // 1 second debounce
  private currentRequest: Promise<UserData | null> | null = null;

  /**
   * Get comprehensive user data including venue, workspace, and related information
   * Includes debouncing to prevent duplicate rapid calls
   */
  async getUserData(): Promise<UserData | null> {
    const now = Date.now();
    
    // If there's already a request in progress, return it
    if (this.currentRequest) {
      console.log('🔄 UserDataService: Request already in progress, returning existing promise');
      return this.currentRequest;
    }
    
    // If called too soon after last call, debounce
    if (now - this.lastCallTime < this.debounceDelay) {
      console.log('🔄 UserDataService: Debouncing rapid call');
      await new Promise(resolve => setTimeout(resolve, this.debounceDelay - (now - this.lastCallTime)));
    }
    
    this.lastCallTime = Date.now();
    
    // Create and store the request promise
    this.currentRequest = this._fetchUserData();
    
    try {
      const result = await this.currentRequest;
      return result;
    } finally {
      // Clear the current request when done
      this.currentRequest = null;
    }
  }

  /**
   * Internal method to actually fetch user data
   */
  private async _fetchUserData(): Promise<UserData | null> {
    try {
      console.log('🔄 UserDataService: Fetching user data from /auth/user-data...');
      const response = await apiService.get<{data: UserData, timestamp: string}>('/auth/user-data');
      
      if (response.success && response.data) {
        // Extract the actual user data from the response
        const userData = response.data.data || response.data;
        console.log('✅ User data received:', {
          hasUser: !!userData.user,
          hasVenue: !!userData.venue,
          hasWorkspace: !!userData.workspace,
          venueId: userData.venue?.id,
          venueName: userData.venue?.name
        });
        
        // Map venue data properly with comprehensive field mapping
        if (userData.venue) {
          console.log('UserDataService: Raw venue data from API:', userData.venue);
          
          // Convert backend status field to frontend is_open boolean
          let isOpen = false;
          let statusField = (userData.venue as any).status;
          
          console.log('UserDataService: Status field analysis:', {
            raw_is_open: userData.venue.is_open,
            raw_status: statusField,
            raw_isOpen: (userData.venue as any).isOpen,
            venue_id: userData.venue.id
          });
          
          // Priority order for determining is_open:
          // 1. Use existing is_open if it's explicitly set
          // 2. Convert status field ("active"/"open" = true, "closed"/"inactive" = false)
          // 3. Fallback to camelCase isOpen
          // 4. Default to false
          
          if (userData.venue.is_open !== undefined && userData.venue.is_open !== null) {
            // Use existing is_open if available and not null/undefined
            isOpen = Boolean(userData.venue.is_open);
            console.log('UserDataService: Using existing is_open field:', isOpen);
          } else if (statusField !== undefined && statusField !== null) {
            // Convert status field: "active"/"open" = true, "closed"/"inactive" = false
            const statusStr = String(statusField).toLowerCase();
            isOpen = statusStr === 'active' || statusStr === 'open';
            console.log('UserDataService: Converting status to is_open:', {
              originalStatus: statusField,
              normalizedStatus: statusStr,
              convertedIsOpen: isOpen
            });
          } else if ((userData.venue as any).isOpen !== undefined) {
            // Fallback to camelCase version
            isOpen = Boolean((userData.venue as any).isOpen);
            console.log('UserDataService: Using camelCase isOpen field:', isOpen);
          } else {
            console.log('UserDataService: No status fields found, defaulting to false');
            isOpen = false;
          }
          
          // Ensure both is_open and status fields are properly synchronized
          const finalStatus = isOpen ? 'active' : 'closed';
          
          userData.venue = {
            ...userData.venue,
            // Ensure camelCase properties exist alongside snake_case
            isActive: userData.venue.is_active !== undefined ? userData.venue.is_active : (userData.venue as any).isActive,
            isOpen: isOpen,
            is_open: isOpen, // Ensure both snake_case and camelCase are set
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
            email: userData.venue.email || '',
            theme: userData.venue.theme || (userData.venue as any).theme || 'pet' // Default to pet theme
          };
          
          // Set status field separately to avoid TypeScript issues
          (userData.venue as any).status = finalStatus;
          
          console.log('UserDataService: Processed venue data:', {
            id: userData.venue.id,
            name: userData.venue.name,
            original_status: statusField,
            final_status: (userData.venue as any).status,
            is_active: userData.venue.is_active,
            is_open: userData.venue.is_open,
            isActive: userData.venue.isActive,
            isOpen: userData.venue.isOpen,
            fields_synchronized: userData.venue.is_open === isOpen && (userData.venue as any).status === finalStatus
          });
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
      console.error('❌ UserDataService: Error fetching user data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url
      });
      
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
   * Forces a fresh call by clearing debounce state and cache
   */
  async refreshUserData(): Promise<UserData | null> {
    // Clear debounce state to force fresh call
    this.lastCallTime = 0;
    this.currentRequest = null;
    
    // Clear cached user data to ensure fresh fetch
    StorageManager.clearVenueData();
    StorageManager.removeItem(StorageManager.KEYS.USER);
    
    return this.getUserData();
  }

  /**
   * Clear any pending requests and debounce state
   */
  clearPendingRequests(): void {
    this.currentRequest = null;
    this.lastCallTime = 0;
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