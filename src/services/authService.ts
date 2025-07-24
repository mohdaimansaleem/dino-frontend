import { AuthToken, UserProfile, UserRegistration } from '../types';
import { apiService } from './api';

class AuthService {
  private readonly TOKEN_KEY = 'dino_token';
  private readonly USER_KEY = 'dino_user';
  private readonly REFRESH_TOKEN_KEY = 'dino_refresh_token';

  async login(email: string, password: string): Promise<AuthToken> {
    try {
      const response = await apiService.post<AuthToken>('/auth/login', {
        email,
        password
      });
      
      if (response.success && response.data) {
        this.setTokens(response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async register(userData: UserRegistration): Promise<AuthToken> {
    try {
      const response = await apiService.post<AuthToken>('/users/register', userData);
      
      if (response.success && response.data) {
        this.setTokens(response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/users/profile');
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: any) {
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        this.clearTokens();
      }
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get user profile');
    }
  }

  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/users/profile', userData);
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update profile');
    }
  }

  async uploadProfileImage(file: File): Promise<{ fileUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.post<{ fileUrl: string }>('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to upload image');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload image');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to change password');
    }
  }

  async addAddress(address: any): Promise<void> {
    try {
      const response = await apiService.post('/users/addresses', address);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add address');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to add address');
    }
  }

  async updateAddress(addressId: string, address: any): Promise<void> {
    try {
      const response = await apiService.put(`/users/addresses/${addressId}`, address);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update address');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update address');
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/users/addresses/${addressId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete address');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete address');
    }
  }

  async getAddresses(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>('/users/addresses');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to get addresses:', error);
      return [];
    }
  }

  async updatePreferences(preferences: any): Promise<void> {
    try {
      const response = await apiService.put('/users/preferences', preferences);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update preferences');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update preferences');
    }
  }

  async getPreferences(): Promise<any> {
    try {
      const response = await apiService.get('/users/preferences');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {};
    } catch (error: any) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }

  async deactivateAccount(): Promise<void> {
    try {
      const response = await apiService.post('/users/deactivate');
      
      if (response.success) {
        this.clearTokens();
      } else {
        throw new Error(response.message || 'Failed to deactivate account');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate account');
    }
  }

  async refreshToken(): Promise<AuthToken | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await apiService.post<AuthToken>('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      if (response.success && response.data) {
        this.setTokens(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  private setTokens(tokenData: AuthToken): void {
    localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(tokenData.user));
    
    if (tokenData.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getStoredUser(): UserProfile | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    this.clearTokens();
  }
}

export const authService = new AuthService();