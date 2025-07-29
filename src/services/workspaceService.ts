import { apiService } from './api';
import { ApiResponse } from '../types';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  settings: {
    timezone: string;
    currency: string;
    language: string;
    date_format: string;
    max_venues: number;
    max_users: number;
  };
  billing_info?: {
    billing_email: string;
    billing_address: any;
    payment_method?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceCreate {
  name: string;
  description: string;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  settings?: {
    timezone?: string;
    currency?: string;
    language?: string;
    date_format?: string;
  };
}

class WorkspaceService {
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await apiService.get<Workspace[]>('/workspaces');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch workspaces');
      }
    } catch (error: any) {
      console.error('Get workspaces error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch workspaces');
    }
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    try {
      const response = await apiService.get<Workspace>(`/workspaces/${workspaceId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch workspace');
      }
    } catch (error: any) {
      console.error('Get workspace error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch workspace');
    }
  }

  async createWorkspace(workspaceData: WorkspaceCreate): Promise<Workspace> {
    try {
      const response = await apiService.post<Workspace>('/workspaces', workspaceData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create workspace');
      }
    } catch (error: any) {
      console.error('Create workspace error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create workspace');
    }
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<WorkspaceCreate>): Promise<Workspace> {
    try {
      const response = await apiService.put<Workspace>(`/workspaces/${workspaceId}`, workspaceData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update workspace');
      }
    } catch (error: any) {
      console.error('Update workspace error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update workspace');
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/workspaces/${workspaceId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete workspace');
      }
    } catch (error: any) {
      console.error('Delete workspace error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete workspace');
    }
  }

  async getWorkspaceUsers(workspaceId: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/workspaces/${workspaceId}/users`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch workspace users');
      }
    } catch (error: any) {
      console.error('Get workspace users error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch workspace users');
    }
  }

  async inviteUser(workspaceId: string, email: string, roleId: string): Promise<void> {
    try {
      const response = await apiService.post(`/workspaces/${workspaceId}/invite`, {
        email,
        role_id: roleId
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to invite user');
      }
    } catch (error: any) {
      console.error('Invite user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to invite user');
    }
  }

  async removeUser(workspaceId: string, userId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/workspaces/${workspaceId}/users/${userId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to remove user');
      }
    } catch (error: any) {
      console.error('Remove user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to remove user');
    }
  }

  async getWorkspaceAnalytics(workspaceId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get(`/workspaces/${workspaceId}/analytics`, params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch workspace analytics');
      }
    } catch (error: any) {
      console.error('Get workspace analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch workspace analytics');
    }
  }
}

export const workspaceService = new WorkspaceService();