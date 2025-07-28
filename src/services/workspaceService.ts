import { apiService } from './api';
import { Workspace, Cafe, PricingPlan } from '../types/auth';
import { ApiResponse } from '../types';

class WorkspaceService {
  // Workspace Management
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await apiService.get<Workspace[]>('/workspaces');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get workspaces:', error);
      return [];
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

  async createWorkspace(workspaceData: {
    name: string;
    description?: string;
    pricingPlan: string;
  }): Promise<ApiResponse<Workspace>> {
    return await apiService.post<Workspace>('/workspaces', workspaceData);
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return await apiService.put<Workspace>(`/workspaces/${workspaceId}`, workspaceData);
  }

  async deleteWorkspace(workspaceId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/workspaces/${workspaceId}`);
  }

  // Cafe Management
  async getCafes(workspaceId?: string): Promise<Cafe[]> {
    try {
      const url = workspaceId ? `/cafes?workspace_id=${workspaceId}` : '/cafes';
      const response = await apiService.get<Cafe[]>(url);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get cafes:', error);
      return [];
    }
  }

  async getCafe(cafeId: string): Promise<Cafe | null> {
    try {
      const response = await apiService.get<Cafe>(`/cafes/${cafeId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get cafe:', error);
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
  }): Promise<ApiResponse<Cafe>> {
    return await apiService.post<Cafe>('/cafes', cafeData);
  }

  async updateCafe(cafeId: string, cafeData: Partial<Cafe>): Promise<ApiResponse<Cafe>> {
    return await apiService.put<Cafe>(`/cafes/${cafeId}`, cafeData);
  }

  async deleteCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/cafes/${cafeId}`);
  }

  async activateCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/cafes/${cafeId}/activate`);
  }

  async deactivateCafe(cafeId: string): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/cafes/${cafeId}/deactivate`);
  }

  async toggleCafeStatus(cafeId: string, isOpen: boolean): Promise<ApiResponse<void>> {
    return await apiService.post<void>(`/cafes/${cafeId}/toggle-status`, { isOpen });
  }

  // Pricing Plans
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const response = await apiService.get<PricingPlan[]>('/pricing-plans');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get pricing plans:', error);
      return this.getDefaultPricingPlans();
    }
  }

  private getDefaultPricingPlans(): PricingPlan[] {
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

  // User Management within Workspace
  async getWorkspaceUsers(workspaceId: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/workspaces/${workspaceId}/users`);
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