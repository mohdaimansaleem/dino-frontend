import { apiService } from './api';
import { 
  Workspace, 
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceStatistics,
  Venue,
  User,
  PaginatedResponse,
  ApiResponse 
} from '../types/api';

class WorkspaceService {
  // Workspace Management
  async getWorkspaces(filters?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Workspace>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiService.get<PaginatedResponse<Workspace>>(`/workspaces?${params.toString()}`);
      
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
      console.error('Failed to get workspaces:', error);
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

  async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    try {
      const response = await apiService.get<Workspace>(`/workspaces/${workspaceId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get workspace:', error);
      return null;
    }
  }

  async createWorkspace(workspaceData: WorkspaceCreate): Promise<ApiResponse<Workspace>> {
    try {
      return await apiService.post<Workspace>('/workspaces', workspaceData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create workspace');
    }
  }

  async updateWorkspace(workspaceId: string, workspaceData: WorkspaceUpdate): Promise<ApiResponse<Workspace>> {
    try {
      return await apiService.put<Workspace>(`/workspaces/${workspaceId}`, workspaceData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update workspace');
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/workspaces/${workspaceId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete workspace');
    }
  }

  // Get workspace venues
  async getWorkspaceVenues(workspaceId: string): Promise<Venue[]> {
    try {
      const response = await apiService.get<Venue[]>(`/workspaces/${workspaceId}/venues`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get workspace venues:', error);
      return [];
    }
  }

  async getCafe(cafeId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/${cafeId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get venue:', error);
      return null;
    }
  }

  async createCafe(cafeData: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
    workspaceId: string;
  }): Promise<ApiResponse<Venue>> {
    const venueData = {
      name: cafeData.name,
      description: cafeData.description,
      location: {
        address: cafeData.address,
        city: '',
        state: '',
        country: 'India',
        postal_code: ''
      },
      phone: cafeData.phone,
      email: cafeData.email,
      workspace_id: cafeData.workspaceId
    };
    return await apiService.post<Venue>('/venues', venueData);
  }

  async updateCafe(cafeId: string, cafeData: Partial<Venue>): Promise<ApiResponse<Venue>> {
    return await apiService.put<Venue>(`/venues/${cafeId}`, cafeData);
  }

  async deleteCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/venues/${cafeId}`);
  }

  async activateCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${cafeId}/activate`);
  }

  async deactivateCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${cafeId}/deactivate`);
  }

  async toggleCafeStatus(cafeId: string, isOpen: boolean): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${cafeId}/toggle-status`, { isOpen });
  }

  // Add missing getCafes method for backward compatibility
  async getCafes(workspaceId: string): Promise<Venue[]> {
    return this.getWorkspaceVenues(workspaceId);
  }

  // Pricing Plans - Removed API call, using static plans only
  async getPricingPlans(): Promise<any[]> {
    return this.getDefaultPricingPlans();
  }

  private getDefaultPricingPlans(): any[] {
    return [
      {
        id: 'basic',
        name: 'basic',
        displayName: 'Basic',
        price: 999,
        maxCafes: 1,
        maxUsers: 5,
        features: [
          'QR Code Ordering',
          'Basic Analytics',
          'Menu Management',
          'Order Management',
          'Email Support'
        ]
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Premium',
        price: 2999,
        maxCafes: 5,
        maxUsers: 25,
        features: [
          'Everything in Basic',
          'Advanced Analytics',
          'Real-time Notifications',
          'Custom Branding',
          'Priority Support',
          'Multi-location Management'
        ]
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 9999,
        maxCafes: -1, // Unlimited
        maxUsers: -1, // Unlimited
        features: [
          'Everything in Premium',
          'White-label Solution',
          'API Access',
          'Custom Integrations',
          'Dedicated Support',
          'Advanced Security',
          'Custom Reports'
        ]
      }
    ];
  }

  // Get workspace statistics
  async getWorkspaceStatistics(workspaceId: string): Promise<WorkspaceStatistics | null> {
    try {
      const response = await apiService.get<WorkspaceStatistics>(`/workspaces/${workspaceId}/statistics`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get workspace statistics:', error);
      return null;
    }
  }

  // User Management within Workspace
  async getWorkspaceUsers(workspaceId: string): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(`/workspaces/${workspaceId}/users`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get workspace users:', error);
      return [];
    }
  }

  async inviteUser(workspaceId: string, userData: {
    email: string;
    role: string;
    cafeId?: string;
  }): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/workspaces/${workspaceId}/invite`, userData);
  }

  async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/workspaces/${workspaceId}/users/${userId}`);
  }

  // Analytics
  async getWorkspaceAnalytics(workspaceId: string, dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<any> {
    try {
      const params = dateRange ? `?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}` : '';
      const response = await apiService.get<any>(`/workspaces/${workspaceId}/analytics${params}`);
      return response.data || {};
    } catch (error) {
      console.error('Failed to get workspace analytics:', error);
      return {};
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  validateWorkspaceName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length < 2) {
      return { isValid: false, error: 'Workspace name must be at least 2 characters long' };
    }
    if (name.length > 50) {
      return { isValid: false, error: 'Workspace name must be less than 50 characters' };
    }
    return { isValid: true };
  }

  validateCafeData(cafeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cafeData.name || cafeData.name.trim().length < 2) {
      errors.push('Cafe name must be at least 2 characters long');
    }
    if (!cafeData.address || cafeData.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long');
    }
    if (!cafeData.phone || !/^[+]?[\d\s\-()]{10,}$/.test(cafeData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    if (!cafeData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cafeData.email)) {
      errors.push('Please enter a valid email address');
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const workspaceService = new WorkspaceService();