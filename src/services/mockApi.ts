import { UserProfile, AuthToken } from '../types';

// Mock API service for demo purposes
class MockApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async login(email: string, password: string): Promise<AuthToken> {
    await this.delay(500); // Simulate network delay
    
    const mockUser: UserProfile = {
      id: 'demo-user',
      email: email,
      phone: '',
      firstName: email.includes('admin') ? 'Demo' : 'Demo',
      lastName: email.includes('admin') ? 'Admin' : 'User',
      first_name: email.includes('admin') ? 'Demo' : 'Demo',
      last_name: email.includes('admin') ? 'Admin' : 'User',
      role: (email.includes('admin') ? 'admin' : 'customer') as any,
      permissions: [],
      isActive: true,
      isVerified: true,
      addresses: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteCuisines: [],
        spiceLevel: 'medium',
        notificationsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      loginCount: 1,
      totalOrders: 0,
      totalSpent: 0,
    };

    return {
      access_token: 'demo-token-' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      user: mockUser,
    };
  }

  async getCurrentUser(): Promise<UserProfile> {
    await this.delay(300);
    
    const savedUser = localStorage.getItem('dino_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    throw new Error('No user found');
  }

  async get<T>(url: string): Promise<T> {
    await this.delay(300);
    throw new Error('Mock API: GET not implemented for ' + url);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    await this.delay(300);
    throw new Error('Mock API: POST not implemented for ' + url);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    await this.delay(300);
    throw new Error('Mock API: PUT not implemented for ' + url);
  }

  async delete<T>(url: string): Promise<T> {
    await this.delay(300);
    throw new Error('Mock API: DELETE not implemented for ' + url);
  }
}

export const mockApiService = new MockApiService();