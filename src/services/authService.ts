import { AuthToken, UserProfile, UserRegistration, WorkspaceRegistration, ApiResponse } from '../types/api';
import { apiService } from './api';
import { 
  loginWithHashedPassword, 
  isPasswordHashingSupported,
  changePasswordWithHashing,
  registerWithHashedPassword
} from '../utils/passwordHashing';
import { logger } from '../utils/logger';

class AuthService {
  private readonly TOKEN_KEY = 'dino_token';
  private readonly USER_KEY = 'dino_user';
  private readonly REFRESH_TOKEN_KEY = 'dino_refresh_token';

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthToken> {
    try {
      // MANDATORY: Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for login");
      
      // ALWAYS hash password - NO FALLBACKS
      const authToken = await loginWithHashedPassword(email, password);
      
      this.setTokens(authToken);
      return authToken;
    } catch (error: any) {
      logger.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async register(userData: UserRegistration): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiService.post<UserProfile>('/auth/register', userData);
      
      if (response.success && response.data) {
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  async registerWorkspace(workspaceData: WorkspaceRegistration): Promise<ApiResponse<any>> {
    try {
      // MANDATORY: Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for registration");
      
      // ALWAYS hash password - NO FALLBACKS
      const hashedResponse = await registerWithHashedPassword(workspaceData);
      return {
        success: true,
        data: hashedResponse,
        message: 'Registration successful'
      };
    } catch (error: any) {
      logger.error('Registration failed:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Workspace registration failed');
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/auth/me');
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: any) {
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        // Temporarily disable automatic logout to debug the issue
        // this.clearTokens();
      }
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get user profile');
    }
  }

  async getUserPermissions(): Promise<any> {
    try {
      const response = await apiService.get<any>('/auth/permissions');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to get user permissions');
    } catch (error: any) {
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        // Temporarily disable automatic logout to debug the issue
        // this.clearTokens();
      }
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get user permissions');
    }
  }

  async refreshUserPermissions(): Promise<any> {
    try {
      const response = await apiService.post<any>('/auth/refresh-permissions');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to refresh user permissions');
    } catch (error: any) {
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        // Temporarily disable automatic logout to debug the issue
        // this.clearTokens();
      }
      throw new Error(error.response?.data?.detail || error.message || 'Failed to refresh user permissions');
    }
  }

  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/auth/me', userData);
      
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
      // MANDATORY: Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for password change");
      
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // ALWAYS hash passwords - NO FALLBACKS
      await changePasswordWithHashing(currentPassword, newPassword, token);
    } catch (error: any) {
      logger.error('Password change failed:', error);
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
        console.warn('No refresh token available');
        this.clearTokens();
        return null;
      }

      console.log('Attempting to refresh token...');
      const response = await apiService.post<AuthToken>('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      if (response.success && response.data && response.data.access_token) {
        console.log('Token refreshed successfully');
        this.setTokens(response.data);
        return response.data;
      }
      
      console.warn('Token refresh failed: Invalid response');
      this.clearTokens();
      return null;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  private setTokens(tokenData: AuthToken): void {
    console.log('💾 Storing tokens:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      hasUser: !!tokenData.user,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    });
    
    localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(tokenData.user));
    
    if (tokenData.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
      console.log('✅ Refresh token stored successfully');
    } else {
      console.warn('⚠️ No refresh token provided in response');
    }
    
    // Store token expiry time for proactive refresh
    if (tokenData.expires_in) {
      const expiryTime = Date.now() + (tokenData.expires_in * 1000);
      localStorage.setItem('dino_token_expiry', expiryTime.toString());
    }
  }

  private clearTokens(): void {
    console.log('🗑️ Clearing all authentication tokens');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('dino_token_expiry');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    const expiryTime = localStorage.getItem('dino_token_expiry');
    if (expiryTime) {
      const expiry = parseInt(expiryTime);
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      
      // If token expires in less than 5 minutes, try to refresh
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('🔄 Token expires soon, attempting proactive refresh...');
        this.refreshToken().catch(error => {
          console.error('Proactive token refresh failed:', error);
        });
      }
      
      // If token is already expired, return false
      if (timeUntilExpiry <= 0) {
        console.warn('🚨 Token has expired');
        this.clearTokens();
        return false;
      }
    }
    
    return true;
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

  /**
   * Get token expiry information
   */
  getTokenExpiryInfo(): { isExpired: boolean; expiresIn: number; expiryTime: number | null } {
    const expiryTime = localStorage.getItem('dino_token_expiry');
    if (!expiryTime) {
      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
    
    const expiry = parseInt(expiryTime);
    const now = Date.now();
    const expiresIn = expiry - now;
    
    return {
      isExpired: expiresIn <= 0,
      expiresIn: Math.max(0, expiresIn),
      expiryTime: expiry
    };
  }

  /**
   * Check if token needs refresh (expires in less than 10 minutes)
   */
  shouldRefreshToken(): boolean {
    const { expiresIn } = this.getTokenExpiryInfo();
    return expiresIn > 0 && expiresIn < 10 * 60 * 1000; // Less than 10 minutes
  }
}

export const authService = new AuthService();