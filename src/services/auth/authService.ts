import { AuthToken, UserProfile, UserRegistration, WorkspaceRegistration, ApiResponse } from '../../types/api';
import { apiService } from '../../utils/api';
import { 
  loginWithHashedPassword, 
  isPasswordHashingSupported,
  changePasswordWithHashing,
  registerWithHashedPassword
} from '../../utils/security';
import { logger } from '../../utils/logger';
import StorageManager from '../../utils/storage';

class AuthService {
  // Use StorageManager keys for consistency
  private readonly TOKEN_KEY = StorageManager.KEYS.TOKEN;
  private readonly USER_KEY = StorageManager.KEYS.USER;
  private readonly REFRESH_TOKEN_KEY = StorageManager.KEYS.REFRESH_TOKEN;

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthToken> {
    try {
      // Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for login");
      
      // Hash password before sending
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
      // Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for registration");
      
      // Hash password before sending
      const hashedResponse = await registerWithHashedPassword(workspaceData);
      return {
        success: true,
        data: hashedResponse,
        message: 'Registration successful'
      };
    } catch (error: any) {
      logger.error('Registration failed:', error);
      
      // Re-throw the original error to preserve the response structure
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/auth/me');
      
      if (response.success && response.data) {
        // Update stored user data
        StorageManager.setUserData(response.data);
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
        StorageManager.setUserData(response.data);
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
      // Check if password hashing is supported
      if (!isPasswordHashingSupported()) {
        throw new Error('Password hashing is not supported in this browser. Please use a modern browser with crypto.subtle support.');
      }

      logger.authEvent("Starting client-side password hashing for password change");
      
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Hash passwords before sending
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

  private refreshPromise: Promise<AuthToken | null> | null = null;
  private lastRefreshAttempt: number = 0;
  private readonly REFRESH_COOLDOWN = 30000; // 30 seconds cooldown between refresh attempts

  async refreshToken(): Promise<AuthToken | null> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      console.log('🔄 Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Check cooldown period to prevent too frequent refresh attempts
    const now = Date.now();
    if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
      console.log('🚫 Token refresh on cooldown, skipping...');
      return null;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token available');
        this.clearTokens();
        return null;
      }

      this.lastRefreshAttempt = now;
      console.log('🔄 Starting token refresh...');
      
      // Create the refresh promise using direct axios to avoid interceptor loops
      this.refreshPromise = (async () => {
        try {
          // Import axios directly to bypass interceptors
          const axios = (await import('axios')).default;
          const response = await axios.post(`${(apiService as any).axiosInstance.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data && response.data.access_token) {
            console.log('✅ Token refreshed successfully');
            const tokenData = response.data;
            this.setTokens(tokenData);
            return tokenData;
          }
          
          console.warn('❌ Token refresh failed: Invalid response');
          this.clearTokens();
          return null;
        } catch (error: any) {
          console.error('❌ Token refresh error:', error);
          this.clearTokens();
          return null;
        }
      })();

      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
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
    
    // Use StorageManager for consistent storage
    StorageManager.setItem(this.TOKEN_KEY, tokenData.access_token);
    StorageManager.setUserData(tokenData.user);
    
    if (tokenData.refresh_token) {
      StorageManager.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
      console.log('✅ Refresh token stored successfully');
    } else {
      console.warn('⚠️ No refresh token provided in response');
    }
    
    // No need to store separate expiry - JWT contains expiry in payload
  }

  private clearTokens(): void {
    console.log('🗑️ Clearing all authentication tokens');
    StorageManager.removeItem(this.TOKEN_KEY);
    StorageManager.removeItem(this.USER_KEY);
    StorageManager.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired by parsing JWT
    const { isExpired } = this.getTokenExpiryInfo();
    if (isExpired) {
      console.warn('🚨 Token has expired');
      this.clearTokens();
      return false;
    }
    
    return true;
  }

  getToken(): string | null {
    return StorageManager.getItem<string>(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return StorageManager.getItem<string>(this.REFRESH_TOKEN_KEY);
  }

  getStoredUser(): UserProfile | null {
    return StorageManager.getUserData();
  }

  logout(): void {
    this.clearTokens();
  }

  /**
   * Get token expiry information by parsing JWT
   */
  getTokenExpiryInfo(): { isExpired: boolean; expiresIn: number; expiryTime: number | null } {
    const token = this.getToken();
    if (!token) {
      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
    
    try {
      // Parse JWT payload to get expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const expiresIn = expiryTime - now;
      
      return {
        isExpired: expiresIn <= 0,
        expiresIn: Math.max(0, expiresIn),
        expiryTime: expiryTime
      };
    } catch (error) {
      console.error('❌ Failed to parse JWT token:', error);
      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
  }

  /**
   * Check if token needs refresh (expires in less than 5 minutes)
   */
  shouldRefreshToken(): boolean {
    const { expiresIn } = this.getTokenExpiryInfo();
    // Only refresh if token expires in less than 5 minutes but more than 1 minute
    // This prevents constant refreshing while ensuring we refresh before expiry
    return expiresIn > 60 * 1000 && expiresIn < 5 * 60 * 1000; // Between 1-5 minutes
  }

  /**
   * Debug method to check authentication state
   */
  debugAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    const refreshToken = this.getRefreshToken();
    const expiryInfo = this.getTokenExpiryInfo();
    
    console.group('🔍 Authentication State Debug');
    console.log('Has Token:', !!token);
    console.log('Has User:', !!user);
    console.log('Has Refresh Token:', !!refreshToken);
    console.log('Token Expiry Info (from JWT):', expiryInfo);
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('Should Refresh Token:', this.shouldRefreshToken());
    console.log('Refresh In Progress:', !!this.refreshPromise);
    console.log('Last Refresh Attempt:', new Date(this.lastRefreshAttempt).toISOString());
    console.log('Cooldown Remaining:', Math.max(0, this.REFRESH_COOLDOWN - (Date.now() - this.lastRefreshAttempt)));
    if (user) {
      console.log('User Role:', user.role);
      console.log('User Email:', user.email);
    }
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', {
          exp: payload.exp,
          iat: payload.iat,
          sub: payload.sub,
          expiryDate: new Date(payload.exp * 1000).toISOString()
        });
      } catch (e) {
        console.log('Failed to parse JWT payload');
      }
    }
    console.groupEnd();
  }

  /**
   * Force clear refresh state (for debugging)
   */
  clearRefreshState(): void {
    this.refreshPromise = null;
    this.lastRefreshAttempt = 0;
    console.log('🧹 Refresh state cleared');
  }
}

export const authService = new AuthService();

// Make authService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authService = authService;
}