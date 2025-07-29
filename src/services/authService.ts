import { apiService } from './api';
import { UserProfile, AuthToken, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      const response = await apiService.post<AuthToken>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store tokens and user data
        localStorage.setItem('dino_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('dino_refresh_token', response.data.refresh_token);
        }
        localStorage.setItem('dino_user', JSON.stringify(response.data.user));
        
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<UserProfile> {
    try {
      const response = await apiService.post<UserProfile>('/auth/register', {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || '',
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/auth/me');
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem('dino_user', JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get user data');
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get user data');
    }
  }

  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/users/profile', userData);
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem('dino_user', JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Profile update failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Password change failed');
    }
  }

  async refreshToken(): Promise<AuthToken> {
    try {
      const refreshToken = localStorage.getItem('dino_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<AuthToken>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      if (response.success && response.data) {
        // Update tokens
        localStorage.setItem('dino_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('dino_refresh_token', response.data.refresh_token);
        }
        localStorage.setItem('dino_user', JSON.stringify(response.data.user));
        
        return response.data;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.logout(); // Clear invalid tokens
      throw new Error(error.response?.data?.detail || error.message || 'Token refresh failed');
    }
  }

  logout(): void {
    localStorage.removeItem('dino_token');
    localStorage.removeItem('dino_refresh_token');
    localStorage.removeItem('dino_user');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('dino_token');
    const user = localStorage.getItem('dino_user');
    return !!(token && user);
  }

  getStoredUser(): UserProfile | null {
    try {
      const userData = localStorage.getItem('dino_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('dino_token');
  }
}

export const authService = new AuthService();