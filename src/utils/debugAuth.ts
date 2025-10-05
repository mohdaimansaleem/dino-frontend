/**
 * Debug utility to check authentication state and token handling
 */

import { authService } from '../services/auth';
import { apiService } from './api';

export function debugAuthenticationState(): void {
  console.group('🔍 Authentication Debug');
  
  // Check token storage
  const token = authService.getToken();
  const refreshToken = authService.getRefreshToken();
  const user = authService.getStoredUser();
  
  console.log('Token exists:', !!token);
  console.log('Refresh token exists:', !!refreshToken);
  console.log('User data exists:', !!user);
  
  if (token) {
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Parse JWT to check expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = new Date(payload.exp * 1000);
      const now = new Date();
      console.log('Token expires at:', expiryTime.toISOString());
      console.log('Token is expired:', now > expiryTime);
      console.log('Time until expiry:', Math.round((expiryTime.getTime() - now.getTime()) / 1000 / 60), 'minutes');
    } catch (error) {
      console.error('Failed to parse JWT:', error);
    }
  }
  
  if (user) {
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('User role:', user.role);
  }
  
  // Check API service configuration
  console.log('API Base URL:', (apiService as any).axiosInstance.defaults.baseURL);
  console.log('API Default Headers:', (apiService as any).axiosInstance.defaults.headers.common);
  
  console.groupEnd();
}

export function testApiAuthentication(): Promise<void> {
  return new Promise(async (resolve) => {
    console.group('🧪 Testing API Authentication');
    
    try {
      // Test a simple authenticated endpoint
      const response = await apiService.get('/auth/me');
      console.log('✅ Auth test successful:', response.success);
      console.log('Response data:', response.data);
    } catch (error) {
      console.error('❌ Auth test failed:', error);
    }
    
    console.groupEnd();
    resolve();
  });
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthenticationState;
  (window as any).testApiAuth = testApiAuthentication;
  
  // Add dashboard testing function
  (window as any).testDashboard = async () => {
    console.group('🧪 Testing Dashboard Service');
    try {
      const { dashboardService } = await import('../services/business/dashboardService');
      console.log('📞 Calling dashboardService.getSuperAdminDashboard()...');
      const result = await dashboardService.getSuperAdminDashboard();
      console.log('✅ Dashboard service successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Dashboard service failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };
}

export default {
  debugAuthenticationState,
  testApiAuthentication
};