import { authService } from '../authService';

// Mock the apiService
jest.mock('../api', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AuthService', () => {
  const mockApiService = require('../api').apiService;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'admin',
          workspace_id: 'workspace-1',
          venue_id: 'venue-1',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockResponse,
      });

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
        remember_me: false,
      });
    });

    it('should handle login failure', async () => {
      mockApiService.post.mockRejectedValueOnce({
        response: {
          data: { detail: 'Invalid credentials' }
        }
      });

      await expect(authService.login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockApiService.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login('test@example.com', 'password'))
        .rejects.toThrow('Network error');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        workspace_id: 'workspace-1',
        venue_id: 'venue-1',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockApiService.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should handle unauthorized error', async () => {
      mockApiService.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Unauthorized' }
        }
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserPermissions', () => {
    it('should get user permissions successfully', async () => {
      const mockPermissions = {
        permissions: [
          { name: 'dashboard:view', resource: 'dashboard', action: 'view' },
          { name: 'orders:view', resource: 'orders', action: 'view' },
        ]
      };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockPermissions,
      });

      const result = await authService.getUserPermissions();

      expect(result).toEqual(mockPermissions);
      expect(mockApiService.get).toHaveBeenCalledWith('/auth/permissions');
    });

    it('should handle permissions error', async () => {
      mockApiService.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Unauthorized' }
        }
      });

      await expect(authService.getUserPermissions()).rejects.toThrow('Unauthorized');
    });
  });

  describe('utility methods', () => {
    it('should check if user is authenticated', () => {
      localStorage.getItem = jest.fn().mockReturnValue('token');
      expect(authService.isAuthenticated()).toBe(true);

      localStorage.getItem = jest.fn().mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should get stored token', () => {
      localStorage.getItem = jest.fn().mockReturnValue('stored-token');
      expect(authService.getToken()).toBe('stored-token');
    });

    it('should get stored user', () => {
      const userData = { id: '1', email: 'test@example.com' };
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(userData));
      
      expect(authService.getStoredUser()).toEqual(userData);
    });

    it('should handle invalid stored user data', () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid-json');
      
      expect(authService.getStoredUser()).toBeNull();
    });

    it('should logout and clear tokens', () => {
      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('dino_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('dino_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('dino_refresh_token');
    });
  });
});