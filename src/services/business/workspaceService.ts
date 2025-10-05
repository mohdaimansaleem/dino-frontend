import { apiService } from '../../utils/api';
import { 
  Workspace, 
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceStatistics,
  Venue,
  User,
  PaginatedResponse,
  ApiResponse 
} from '../../types/api';

class WorkspaceService {
  // Workspace Management
  // NOTE: This method is deprecated - workspace data now comes from user-data API
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

      const queryString = params.toString();
      const url = queryString ? `/workspaces?${queryString}` : '/workspaces';
      
      console.log('Fetching workspaces from:', url);
      const response = await apiService.get<PaginatedResponse<Workspace>>(url);
      
      if (response.success && response.data) {
        console.log('Workspaces fetched successfully:', response.data);
        return response.data;
      }
      
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
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      
      // If it's an authentication error, don't return empty data
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access workspaces.');
      }
      
      if (error.response?.status === 404) {
        console.warn('Workspaces endpoint not found, returning empty data');
      }
      
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

  // Get workspace venues - DEPRECATED: Use venueService.getVenuesByWorkspace() instead
  async getWorkspaceVenues(workspaceId: string): Promise<Venue[]> {
    console.warn('⚠️ WorkspaceService.getWorkspaceVenues() is deprecated. Use venueService.getVenuesByWorkspace() instead.');
    try {
      const response = await apiService.get<Venue[]>(`/workspaces/${workspaceId}/venues`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getVenue(venueId: string): Promise<Venue | null> {
    try {
      const response = await apiService.get<Venue>(`/venues/${venueId}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }

  // Get all venues (for debugging and fallback)
  async getAllVenues(): Promise<Venue[]> {
    try {
      const response = await apiService.get<Venue[]>('/venues');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      return [];
    }
  }

  async createVenue(venueData: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
    workspaceId: string;
  }): Promise<ApiResponse<Venue>> {
    const apiVenueData = {
      name: venueData.name,
      description: venueData.description,
      location: {
        address: venueData.address,
        city: '',
        state: '',
        country: 'India',
        postal_code: ''
      },
      phone: venueData.phone,
      email: venueData.email,
      workspace_id: venueData.workspaceId
    };
    return await apiService.post<Venue>('/venues', apiVenueData);
  }

  async updateVenue(venueId: string, venueData: Partial<Venue>): Promise<ApiResponse<Venue>> {
    return await apiService.put<Venue>(`/venues/${venueId}`, venueData);
  }

  async deleteVenue(venueId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/venues/${venueId}`);
  }

  async activateVenue(venueId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${venueId}/activate`);
  }

  async deactivateVenue(venueId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${venueId}/deactivate`);
  }

  async toggleVenueStatus(venueId: string, isOpen: boolean): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/venues/${venueId}/toggle-status`, { is_open: isOpen });
  }

  // Venue methods (primary interface)
  async getVenues(workspaceId: string): Promise<Venue[]> {
    return this.getWorkspaceVenues(workspaceId);
  }



  // Get workspace statistics
  async getWorkspaceStatistics(workspaceId: string): Promise<WorkspaceStatistics | null> {
    try {
      const response = await apiService.get<WorkspaceStatistics>(`/workspaces/${workspaceId}/statistics`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // User Management within Workspace
  async getWorkspaceUsers(workspaceId: string): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(`/workspaces/${workspaceId}/users`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async inviteUser(workspaceId: string, userData: {
    email: string;
    role: string;
    venueId?: string;
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

  validateVenueData(venueData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!venueData.name || venueData.name.trim().length < 2) {
      errors.push('Venue name must be at least 2 characters long');
    }
    if (!venueData.address || venueData.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long');
    }
    if (!venueData.phone || !/^[+]?[\d\s\-()]{10,}$/.test(venueData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    if (!venueData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(venueData.email)) {
      errors.push('Please enter a valid email address');
    }

    return { isValid: errors.length === 0, errors };
  }



  // Debug methods
  async debugWorkspaces(): Promise<any> {
    try {
      const response = await apiService.get<any>('/workspaces/debug');
      return response.data || response;
    } catch (error: any) {
      console.error('Debug workspaces error:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async testPublicWorkspaces(): Promise<any> {
    try {
      const response = await apiService.get<any>('/workspaces/public-debug');
      return response.data || response;
    } catch (error: any) {
      console.error('Public debug workspaces error:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }
}

export const workspaceService = new WorkspaceService();