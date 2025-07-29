import { apiService } from './api';
import { ApiResponse } from '../types';

// User-related types
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  role: UserRole;
  permissions: Permission[];
  workspace_id: string;
  venue_id?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  preferences?: UserPreferences;
  addresses?: UserAddress[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_name: string;
  workspace_id: string;
  venue_id?: string;
  send_invitation?: boolean;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  role_name?: string;
  venue_id?: string;
  is_active?: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    order_updates: boolean;
    marketing_emails: boolean;
  };
  dashboard: {
    default_view: string;
    refresh_interval: number;
    show_analytics: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    compact_mode: boolean;
    sidebar_collapsed: boolean;
  };
}

export interface UserAddress {
  id: string;
  user_id: string;
  type: 'home' | 'work' | 'other';
  label?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role_name: string;
  workspace_id: string;
  venue_id?: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserAnalytics {
  user_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  login_count: number;
  last_login: string;
  total_orders_processed?: number;
  total_revenue_handled?: number;
  performance_metrics?: {
    average_order_processing_time: number;
    customer_satisfaction_score: number;
    efficiency_rating: number;
  };
  activity_summary: {
    orders_created: number;
    orders_updated: number;
    menu_items_modified: number;
    tables_managed: number;
  };
}

class UserService {
  // User Management

  // Get users with filtering
  async getUsers(filters?: {
    workspace_id?: string;
    venue_id?: string;
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<any>(`/users?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          users: response.data.data || response.data,
          total: response.data.total || 0,
          page: response.data.page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return { users: [], total: 0, page: 1, total_pages: 1 };
    } catch (error) {
      console.error('Failed to get users:', error);
      return { users: [], total: 0, page: 1, total_pages: 1 };
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiService.get<User>(`/users/${userId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<User>('/users/profile');
      return response.data || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Create new user
  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>('/users', userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create user');
    }
  }

  // Update user
  async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>(`/users/${userId}`, userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user');
    }
  }

  // Update current user profile
  async updateProfile(userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>('/users/profile', userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update profile');
    }
  }

  // Delete user (soft delete)
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete user');
    }
  }

  // Activate/Deactivate user
  async toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/users/${userId}/status`, { is_active: isActive });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user status');
    }
  }

  // Role and Permission Management

  // Get available roles
  async getRoles(): Promise<UserRole[]> {
    try {
      const response = await apiService.get<UserRole[]>('/users/roles');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get roles:', error);
      return [];
    }
  }

  // Get role by name
  async getRole(roleName: string): Promise<UserRole | null> {
    try {
      const response = await apiService.get<UserRole>(`/users/roles/${roleName}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get role:', error);
      return null;
    }
  }

  // Get available permissions
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await apiService.get<Permission[]>('/users/permissions');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get permissions:', error);
      return [];
    }
  }

  // Update user role
  async updateUserRole(userId: string, roleName: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/users/${userId}/role`, { role_name: roleName });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user role');
    }
  }

  // User Invitations

  // Send user invitation
  async inviteUser(invitationData: {
    email: string;
    role_name: string;
    workspace_id: string;
    venue_id?: string;
    message?: string;
  }): Promise<ApiResponse<UserInvitation>> {
    try {
      return await apiService.post<UserInvitation>('/users/invitations', invitationData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to send invitation');
    }
  }

  // Get user invitations
  async getInvitations(filters?: {
    workspace_id?: string;
    status?: string;
  }): Promise<UserInvitation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters?.status) params.append('status', filters.status);

      const response = await apiService.get<UserInvitation[]>(`/users/invitations?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get invitations:', error);
      return [];
    }
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/users/invitations/${invitationId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to cancel invitation');
    }
  }

  // Resend invitation
  async resendInvitation(invitationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/users/invitations/${invitationId}/resend`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to resend invitation');
    }
  }

  // Accept invitation (public endpoint)
  async acceptInvitation(token: string, userData: {
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>(`/users/invitations/accept/${token}`, userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to accept invitation');
    }
  }

  // User Preferences

  // Get user preferences
  async getUserPreferences(userId?: string): Promise<UserPreferences | null> {
    try {
      const endpoint = userId ? `/users/${userId}/preferences` : '/users/preferences';
      const response = await apiService.get<UserPreferences>(endpoint);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserPreferences>, userId?: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const endpoint = userId ? `/users/${userId}/preferences` : '/users/preferences';
      return await apiService.put<UserPreferences>(endpoint, preferences);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update preferences');
    }
  }

  // User Addresses

  // Get user addresses
  async getUserAddresses(userId?: string): Promise<UserAddress[]> {
    try {
      const endpoint = userId ? `/users/${userId}/addresses` : '/users/addresses';
      const response = await apiService.get<UserAddress[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get user addresses:', error);
      return [];
    }
  }

  // Add user address
  async addUserAddress(addressData: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserAddress>> {
    try {
      return await apiService.post<UserAddress>('/users/addresses', addressData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to add address');
    }
  }

  // Update user address
  async updateUserAddress(addressId: string, addressData: Partial<UserAddress>): Promise<ApiResponse<UserAddress>> {
    try {
      return await apiService.put<UserAddress>(`/users/addresses/${addressId}`, addressData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update address');
    }
  }

  // Delete user address
  async deleteUserAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/users/addresses/${addressId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete address');
    }
  }

  // Set default address
  async setDefaultAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/users/addresses/${addressId}/set-default`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to set default address');
    }
  }

  // User Activity and Analytics

  // Get user activity
  async getUserActivity(userId: string, filters?: {
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<UserActivity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.resource_type) params.append('resource_type', filters.resource_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get<UserActivity[]>(`/users/${userId}/activity?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return [];
    }
  }

  // Get user analytics
  async getUserAnalytics(userId: string, startDate?: string, endDate?: string): Promise<UserAnalytics | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<UserAnalytics>(`/users/${userId}/analytics?${params.toString()}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }

  // Password Management

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to change password');
    }
  }

  // Reset password request
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>('/users/password-reset-request', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to request password reset');
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>('/users/password-reset', {
        token,
        new_password: newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to reset password');
    }
  }

  // Profile Image Management

  // Upload profile image
  async uploadProfileImage(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ profile_image_url: string }>> {
    try {
      return await apiService.uploadFile<{ profile_image_url: string }>('/users/profile/image', file, onProgress);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload profile image');
    }
  }

  // Delete profile image
  async deleteProfileImage(): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>('/users/profile/image');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete profile image');
    }
  }

  // Utility Methods

  // Get user display name
  getUserDisplayName(user: User): string {
    if (user.full_name) {
      return user.full_name;
    }
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }

  // Get user initials
  getUserInitials(user: User): string {
    const firstName = user.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = user.last_name?.charAt(0)?.toUpperCase() || '';
    return firstName + lastName || user.email.charAt(0).toUpperCase();
  }

  // Format user role for display
  formatUserRole(role: UserRole): string {
    return role.display_name || role.name;
  }

  // Check if user has permission
  hasPermission(user: User, permissionName: string): boolean {
    return user.permissions.some(permission => permission.name === permissionName);
  }

  // Check if user has any of the permissions
  hasAnyPermission(user: User, permissionNames: string[]): boolean {
    return permissionNames.some(permissionName => this.hasPermission(user, permissionName));
  }

  // Check if user has all permissions
  hasAllPermissions(user: User, permissionNames: string[]): boolean {
    return permissionNames.every(permissionName => this.hasPermission(user, permissionName));
  }

  // Get user permissions by resource
  getUserPermissionsByResource(user: User, resource: string): Permission[] {
    return user.permissions.filter(permission => permission.resource === resource);
  }

  // Validate user data
  validateUserData(userData: UserCreate | UserUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('email' in userData && userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if ('first_name' in userData && userData.first_name !== undefined) {
      if (!userData.first_name || userData.first_name.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if ('last_name' in userData && userData.last_name !== undefined) {
      if (!userData.last_name || userData.last_name.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if ('phone' in userData && userData.phone) {
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(userData.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    if ('password' in userData && userData.password) {
      if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Format last login time
  formatLastLogin(lastLogin?: string): string {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
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

  // Get user status badge info
  getUserStatusBadge(user: User): { label: string; color: string; variant: 'success' | 'warning' | 'error' | 'info' } {
    if (!user.is_active) {
      return { label: 'Inactive', color: '#6b7280', variant: 'error' };
    }
    if (!user.is_verified) {
      return { label: 'Unverified', color: '#f59e0b', variant: 'warning' };
    }
    return { label: 'Active', color: '#10b981', variant: 'success' };
  }
}

export const userService = new UserService();