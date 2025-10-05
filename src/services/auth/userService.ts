import { apiService } from '../../utils/api';
import { 
  User, 
  UserCreate, 
  UserUpdate,
  VenueUser,
  PaginatedResponse,
  ApiResponse,
  UserFilters
} from '../../types/api';
// Role constants are now defined inline to match API types

// Helper function to check if role is admin level (using API role names)
const isAdminLevel = (role: string): boolean => {
  return role === 'admin' || role === 'superadmin';
};

class UserService {
  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  /**
   * Get users with pagination and filtering (Admin only)
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiService.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
      
      return response.data || {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    } catch (error) {
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiService.get<User>(`/users/${userId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get users by venue ID with name, role, last login, and status
   * This API is specifically designed for the Users module in admin dashboard
   */
  async getUsersByVenueId(venueId: string): Promise<ApiResponse<VenueUser[]>> {
    try {
      console.log('📡 Making API call to get users by venue ID:', venueId);
      
      const response = await apiService.get<VenueUser[]>(`/venues/${venueId}/users`);
      
      console.log('✅ Users by venue ID API response:', response);
      
      return {
        success: true,
        data: response.data || [],
        message: 'Users loaded successfully'
      };
    } catch (error: any) {
      console.error('❌ Error fetching users by venue ID:', error);
      
      return {
        success: false,
        data: [],
        error: error.response?.data?.detail || error.message || 'Failed to load users',
        message: 'Failed to load users for venue'
      };
    }
  }

  /**
   * Create a new user (Admin only)
   */
  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>('/users', userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create user');
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>(`/users/${userId}`, userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user');
    }
  }

  /**
   * Deactivate user
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete user');
    }
  }

  /**
   * Activate deactivated user
   */
  async activateUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/users/${userId}/activate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate user');
    }
  }

  // =============================================================================
  // USER ROLE AND PERMISSION MANAGEMENT
  // =============================================================================

  /**
   * Get available roles
   */
  getRoles(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'superadmin',
        label: 'Super Admin',
        description: 'Full system access across all workspaces'
      },
      {
        value: 'admin',
        label: 'Admin',
        description: 'Full access to venue management and operations'
      },
      {
        value: 'operator',
        label: 'Operator',
        description: 'Order management and basic venue operations'
      }
    ];
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: string): string[] {
    const permissions = {
      superadmin: [
        'workspace.*',
        'venue.*',
        'user.*',
        'order.*',
        'menu.*',
        'table.*',
        'analytics.*'
      ],
      admin: [
        'venue.read',
        'venue.update',
        'user.read',
        'user.create',
        'user.update',
        'order.*',
        'menu.*',
        'table.*',
        'analytics.read'
      ],
      operator: [
        'venue.read',
        'order.read',
        'order.update',
        'menu.read',
        'table.read',
        'table.update'
      ],
      customer: [
        'order.create',
        'order.read',
        'menu.read'
      ]
    };

    return permissions[role as keyof typeof permissions] || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: string): boolean {
    const userPermissions = this.getRolePermissions(user.role);
    
    // Check for exact match
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check for wildcard permissions (both : and . notation)
    const [resource, action] = permission.split(/[:.]/);
    const wildcardPermissionDot = `${resource}.*`;
    const wildcardPermissionColon = `${resource}:*`;
    
    return userPermissions.includes(wildcardPermissionDot) || 
           userPermissions.includes(wildcardPermissionColon) || 
           userPermissions.includes('*.*') ||
           userPermissions.includes('*:*');
  }

  /**
   * Check if user can access venue
   */
  canAccessVenue(user: User, venueId: string): boolean {
    // SuperAdmin can access all venues
    if (user.role === 'superadmin') {
      return true;
    }

    // Admin and Operator can access their assigned venue
    if (isAdminLevel(user.role) || user.role === 'operator') {
      return user.venue_id === venueId;
    }

    // Customers can access any venue for ordering
    if (user.role === 'customer') {
      return true;
    }

    return false;
  }

  /**
   * Check if user can access workspace
   */
  canAccessWorkspace(user: User, workspaceId: string): boolean {
    // SuperAdmin can access all workspaces
    if (user.role === 'superadmin') {
      return true;
    }

    // Other roles can only access their assigned workspace
    return user.workspace_id === workspaceId;
  }

  // =============================================================================
  // USER STATISTICS AND ANALYTICS
  // =============================================================================

  /**
   * Get user statistics for workspace
   */
  async getUserStatistics(workspaceId?: string, venueId?: string): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    recent_logins: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspace_id', workspaceId);
      if (venueId) params.append('venue_id', venueId);

      const response = await apiService.get<any>(`/users/statistics?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        total_users: 0,
        active_users: 0,
        users_by_role: {},
        recent_logins: 0
      };
    } catch (error) {
      return {
        total_users: 0,
        active_users: 0,
        users_by_role: {},
        recent_logins: 0
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Format user display name
   */
  formatUserName(user: User): string {
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(user: User): string {
    const firstName = user.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = user.last_name?.charAt(0)?.toUpperCase() || '';
    
    if (firstName && lastName) {
      return firstName + lastName;
    }
    
    if (firstName) {
      return firstName;
    }
    
    return user.email?.charAt(0)?.toUpperCase() || '?';
  }

  /**
   * Get user status color
   */
  getUserStatusColor(user: User): string {
    return user.is_active ? '#10b981' : '#6b7280';
  }

  /**
   * Get role color
   */
  getRoleColor(role: string): string {
    const colors = {
      superadmin: '#7c3aed',
      admin: '#dc2626',
      operator: '#2563eb',
      customer: '#059669'
    };
    return colors[role as keyof typeof colors] || '#6b7280';
  }

  /**
   * Get role badge variant
   */
  getRoleBadgeVariant(role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
    const variants = {
      superadmin: 'primary' as const,
      admin: 'danger' as const,
      operator: 'warning' as const,
      customer: 'success' as const
    };
    return variants[role as keyof typeof variants] || 'secondary';
  }

  /**
   * Validate user data before creation/update
   */
  validateUserData(userData: UserCreate | UserUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('email' in userData && userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if ('phone' in userData && userData.phone) {
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(userData.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    if ('first_name' in userData) {
      if (!userData.first_name || userData.first_name.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if ('last_name' in userData) {
      if (!userData.last_name || userData.last_name.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if ('password' in userData && userData.password) {
      if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Sort users by various criteria
   */
  sortUsers(users: User[], sortBy: 'name' | 'email' | 'role' | 'created_at' | 'last_login', order: 'asc' | 'desc' = 'asc'): User[] {
    return [...users].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = this.formatUserName(a).toLowerCase();
          bValue = this.formatUserName(b).toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter users by search query
   */
  filterUsers(users: User[], searchQuery: string): User[] {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      this.formatUserName(user).toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }

  /**
   * Group users by role
   */
  groupUsersByRole(users: User[]): Record<string, User[]> {
    return users.reduce((groups, user) => {
      const role = user.role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(user);
      return groups;
    }, {} as Record<string, User[]>);
  }

  /**
   * Get user activity status
   */
  getUserActivityStatus(user: User): 'active' | 'inactive' | 'new' {
    if (!user.is_active) return 'inactive';
    
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation <= 7) return 'new';
    
    return 'active';
  }

  /**
   * Format user creation date
   */
  formatUserCreationDate(user: User): string {
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Check if user can be deleted
   */
  canDeleteUser(currentUser: User, targetUser: User): boolean {
    // Can't delete yourself
    if (currentUser.id === targetUser.id) return false;
    
    // SuperAdmin can delete anyone except other SuperAdmins
    if (currentUser.role === 'superadmin') {
      return targetUser.role !== 'superadmin';
    }
    
    // Admin can delete operators and customers in their workspace
    if (isAdminLevel(currentUser.role)) {
      return (targetUser.role === 'operator' || targetUser.role === 'customer') && 
             currentUser.workspace_id === targetUser.workspace_id;
    }
    
    return false;
  }

  /**
   * Check if user can be edited
   */
  canEditUser(currentUser: User, targetUser: User): boolean {
    // Can edit yourself (limited fields)
    if (currentUser.id === targetUser.id) return true;
    
    // SuperAdmin can edit anyone
    if (currentUser.role === 'superadmin') return true;
    
    // Admin can edit users in their workspace (except other admins)
    if (isAdminLevel(currentUser.role)) {
      return (targetUser.role === 'operator' || targetUser.role === 'customer') && 
             currentUser.workspace_id === targetUser.workspace_id;
    }
    
    return false;
  }

  /**
   * Toggle user status (for backward compatibility)
   */
  async toggleUserStatus(userId: string, newStatus: boolean): Promise<ApiResponse<void>> {
    try {
      if (newStatus) {
        return await this.activateUser(userId);
      } else {
        return await this.deleteUser(userId);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle user status');
    }
  }

  /**
   * Format last login time (for backward compatibility)
   */
  formatLastLogin(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export const userService = new UserService();

// Export types for components
export type { User, UserCreate, UserUpdate, VenueUser } from '../../types/api';