import { apiService } from './api';
import { UserProfile, ApiResponse } from '../types';

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id?: string;
  workspace_id?: string;
  venue_id?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: string;
  workspace_id?: string;
  venue_id?: string;
  is_active?: boolean;
}

class UserService {
  async getUsers(workspaceId?: string, venueId?: string): Promise<UserProfile[]> {
    try {
      const params: any = {};
      if (workspaceId) params.workspace_id = workspaceId;
      if (venueId) params.venue_id = venueId;
      
      const response = await apiService.get<UserProfile[]>('/users', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Get users error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch users');
    }
  }

  async getUser(userId: string): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>(`/users/${userId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user');
    }
  }

  async createUser(userData: UserCreate): Promise<UserProfile> {
    try {
      const response = await apiService.post<UserProfile>('/users', userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create user');
    }
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>(`/users/${userId}`, userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/users/${userId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete user');
    }
  }

  async activateUser(userId: string): Promise<void> {
    try {
      const response = await apiService.post(`/users/${userId}/activate`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to activate user');
      }
    } catch (error: any) {
      console.error('Activate user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate user');
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      const response = await apiService.post(`/users/${userId}/deactivate`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to deactivate user');
      }
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate user');
    }
  }

  async resetUserPassword(userId: string): Promise<void> {
    try {
      const response = await apiService.post(`/users/${userId}/reset-password`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to reset password');
    }
  }

  async getUserRoles(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>('/users/roles');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user roles');
      }
    } catch (error: any) {
      console.error('Get user roles error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user roles');
    }
  }

  async getUserPermissions(userId: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/users/${userId}/permissions`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user permissions');
      }
    } catch (error: any) {
      console.error('Get user permissions error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user permissions');
    }
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const response = await apiService.put(`/users/${userId}/role`, { role_id: roleId });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update user role');
      }
    } catch (error: any) {
      console.error('Update user role error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user role');
    }
  }
}

export const userService = new UserService();