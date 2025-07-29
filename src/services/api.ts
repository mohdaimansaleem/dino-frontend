import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Import mock data
import mockWorkspaces from '../data/mockWorkspaces.json';
import mockUsers from '../data/mockUsers.json';
import mockVenues from '../data/mockVenues.json';
import mockMenus from '../data/mockMenus.json';
import mockTables from '../data/mockTables.json';
import mockOrders from '../data/mockOrders.json';
import mockAnalytics from '../data/mockAnalytics.json';

class ApiService {
  private api: AxiosInstance;
  private refreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('dino_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = localStorage.getItem('dino_refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${this.api.defaults.baseURL}/auth/refresh`, {
                refresh_token: refreshToken
              });

              const { access_token, refresh_token: newRefreshToken } = response.data;
              
              localStorage.setItem('dino_token', access_token);
              if (newRefreshToken) {
                localStorage.setItem('dino_refresh_token', newRefreshToken);
              }

              // Process failed queue
              this.processQueue(null);

              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.refreshing = false;
          }
        }

        // Handle other error cases
        if (error.response?.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data);
        } else if (error.response?.status >= 500) {
          // Server error
          console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private clearTokens() {
    localStorage.removeItem('dino_token');
    localStorage.removeItem('dino_refresh_token');
    localStorage.removeItem('dino_user');
    localStorage.removeItem('dino_demo_mode');

  }

  // Check if in demo mode
  private isDemoMode(): boolean {
    return localStorage.getItem('dino_demo_mode') === 'true';
  }

  // Mock response for demo mode
  private createDemoResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: 'Demo mode response'
    };
  }

  // Handle demo mode requests with comprehensive mock data
  private async handleDemoRequest<T>(url: string, method: string, data?: any): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`🎭 Demo Mode: ${method} ${url}`, data ? { data } : '');

    try {
      // Authentication endpoints
      if (url.includes('/auth/login')) {
        const { email } = data || {};
        const user = mockUsers.users.find(u => u.email === email);
        if (user) {
          const authToken = {
            access_token: `demo_token_${Date.now()}`,
            refresh_token: `demo_refresh_${Date.now()}`,
            token_type: 'bearer',
            expires_in: 3600,
            user: user
          };
          // Store user in localStorage for demo
          localStorage.setItem('dino_user', JSON.stringify(user));
          return this.createDemoResponse(authToken as T);
        }
        throw new Error('Invalid credentials');
      }

      if (url.includes('/auth/me') || url.includes('/users/profile')) {
        const demoUser = JSON.parse(localStorage.getItem('dino_user') || '{}');
        if (demoUser.id) {
          return this.createDemoResponse(demoUser as T);
        }
        throw new Error('User not found');
      }

      // Workspace endpoints
      if (url.includes('/workspaces')) {
        if (method === 'GET') {
          const currentUser = JSON.parse(localStorage.getItem('dino_user') || '{}');
          let workspaces = mockWorkspaces.workspaces;
          
          // Filter by user's workspace if not superadmin
          if (currentUser.role !== 'superadmin' && currentUser.workspace_id) {
            workspaces = workspaces.filter(w => w.id === currentUser.workspace_id);
          }
          
          return this.createDemoResponse(workspaces as T);
        }
      }

      // Venue endpoints
      if (url.includes('/venues') || url.includes('/cafes')) {
        if (method === 'GET') {
          const currentUser = JSON.parse(localStorage.getItem('dino_user') || '{}');
          let venues = mockVenues.venues;
          
          // Filter by user's workspace if not superadmin
          if (currentUser.role !== 'superadmin' && currentUser.workspace_id) {
            venues = venues.filter(v => v.workspace_id === currentUser.workspace_id);
          }
          
          // Filter by user's venue if operator
          if (currentUser.role === 'operator' && currentUser.venue_id) {
            venues = venues.filter(v => v.id === currentUser.venue_id);
          }
          
          return this.createDemoResponse(venues as T);
        }
        
        if (method === 'POST' && url.includes('/activate')) {
          const venueId = url.split('/')[2];
          return this.createDemoResponse({ message: `Venue ${venueId} activated successfully` } as T);
        }
        
        if (method === 'POST' && url.includes('/deactivate')) {
          const venueId = url.split('/')[2];
          return this.createDemoResponse({ message: `Venue ${venueId} deactivated successfully` } as T);
        }
      }

      // Menu endpoints
      if (url.includes('/menu')) {
        if (url.includes('/categories')) {
          const venueId = this.extractVenueIdFromUrl(url);
          let categories = mockMenus.categories;
          if (venueId) {
            categories = categories.filter(c => c.venue_id === venueId);
          }
          return this.createDemoResponse(categories as T);
        }
        
        if (url.includes('/items')) {
          const venueId = this.extractVenueIdFromUrl(url);
          let items = mockMenus.items;
          if (venueId) {
            items = items.filter(i => i.venue_id === venueId);
          }
          return this.createDemoResponse(items as T);
        }
      }

      // Table endpoints
      if (url.includes('/tables')) {
        const venueId = this.extractVenueIdFromUrl(url);
        let tables = mockTables.tables;
        if (venueId) {
          tables = tables.filter(t => t.venue_id === venueId);
        }
        
        if (method === 'PUT' && url.includes('/status')) {
          const tableId = url.split('/')[2];
          return this.createDemoResponse({ message: `Table ${tableId} status updated` } as T);
        }
        
        return this.createDemoResponse(tables as T);
      }

      // Order endpoints
      if (url.includes('/orders')) {
        if (method === 'GET') {
          const venueId = this.extractVenueIdFromUrl(url);
          let orders = mockOrders.orders;
          
          if (venueId) {
            orders = orders.filter(o => o.venue_id === venueId);
          }
          
          // Handle specific order status filters
          if (url.includes('status=')) {
            const status = new URLSearchParams(url.split('?')[1]).get('status');
            if (status) {
              orders = orders.filter(o => o.status === status);
            }
          }
          
          return this.createDemoResponse(orders as T);
        }
        
        if (method === 'POST') {
          if (url.includes('/public/create-order')) {
            const newOrder = {
              id: `order_${Date.now()}`,
              order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              ...data,
              status: 'pending',
              payment_status: 'pending',
              created_at: new Date().toISOString()
            };
            return this.createDemoResponse(newOrder as T);
          }
          
          // Regular order creation
          const newOrder = {
            id: `order_${Date.now()}`,
            order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            ...data,
            status: 'pending',
            created_at: new Date().toISOString()
          };
          return this.createDemoResponse(newOrder as T);
        }
        
        if (method === 'PUT' && url.includes('/status')) {
          const orderId = url.split('/')[2];
          return this.createDemoResponse({ message: `Order ${orderId} status updated` } as T);
        }
      }

      // Dashboard endpoints
      if (url.includes('/dashboard')) {
        const currentUser = JSON.parse(localStorage.getItem('dino_user') || '{}');
        const userRole = currentUser.role || 'operator';
        
        if (url.includes('/analytics')) {
          const venueId = currentUser.venue_id || 'venue_demo_001';
          const analytics = mockAnalytics.dashboard_analytics[userRole as keyof typeof mockAnalytics.dashboard_analytics];
          return this.createDemoResponse(analytics as T);
        }
        
        if (url.includes('/live/orders')) {
          const venueId = currentUser.venue_id || 'venue_demo_001';
          const liveOrders = mockOrders.orders.filter(o => 
            o.venue_id === venueId && 
            ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
          );
          
          const liveData = {
            venue_id: venueId,
            timestamp: new Date().toISOString(),
            total_active: liveOrders.length,
            orders_by_status: {
              pending: liveOrders.filter(o => o.status === 'pending'),
              confirmed: liveOrders.filter(o => o.status === 'confirmed'),
              preparing: liveOrders.filter(o => o.status === 'preparing'),
              ready: liveOrders.filter(o => o.status === 'ready')
            }
          };
          
          return this.createDemoResponse(liveData as T);
        }
        
        if (url.includes('/live/tables')) {
          const venueId = currentUser.venue_id || 'venue_demo_001';
          const venueTables = mockTables.tables.filter(t => t.venue_id === venueId);
          
          const tableData = {
            venue_id: venueId,
            timestamp: new Date().toISOString(),
            total_tables: venueTables.length,
            tables_by_status: {
              available: venueTables.filter(t => t.table_status === 'available'),
              occupied: venueTables.filter(t => t.table_status === 'occupied'),
              reserved: venueTables.filter(t => t.table_status === 'reserved'),
              cleaning: venueTables.filter(t => t.table_status === 'cleaning')
            }
          };
          
          return this.createDemoResponse(tableData as T);
        }
        
        // Default dashboard data
        const dashboardData = mockAnalytics.dashboard_analytics[userRole as keyof typeof mockAnalytics.dashboard_analytics];
        return this.createDemoResponse(dashboardData as T);
      }

      // User management endpoints
      if (url.includes('/users')) {
        if (method === 'GET') {
          const currentUser = JSON.parse(localStorage.getItem('dino_user') || '{}');
          let users = mockUsers.users;
          
          // Filter by workspace if not superadmin
          if (currentUser.role !== 'superadmin' && currentUser.workspace_id) {
            users = users.filter(u => u.workspace_id === currentUser.workspace_id);
          }
          
          return this.createDemoResponse(users as T);
        }
      }

      // Analytics endpoints
      if (url.includes('/analytics')) {
        const venueId = this.extractVenueIdFromUrl(url) || 'venue_demo_001';
        
        if (url.includes('/revenue')) {
          const revenueData = mockAnalytics.revenue_analytics.find(r => r.venue_id === venueId);
          return this.createDemoResponse(revenueData as T);
        }
        
        if (url.includes('/customers')) {
          const customerData = mockAnalytics.customer_analytics.find(c => c.venue_id === venueId);
          return this.createDemoResponse(customerData as T);
        }
        
        // Default venue analytics
        const venueAnalytics = mockVenues.venue_analytics.find(v => v.venue_id === venueId);
        return this.createDemoResponse(venueAnalytics as T);
      }

      // QR Code endpoints
      if (url.includes('/qr/') || url.includes('/public/qr/')) {
        const qrCode = url.split('/').pop();
        const table = mockTables.tables.find(t => t.qr_code === qrCode);
        
        if (table) {
          const venue = mockVenues.venues.find(v => v.id === table.venue_id);
          const menuCategories = mockMenus.categories.filter(c => c.venue_id === table.venue_id);
          const menuItems = mockMenus.items.filter(i => i.venue_id === table.venue_id);
          
          const menuAccess = {
            venue: venue,
            table: table,
            categories: menuCategories,
            items: menuItems,
            is_open: venue?.is_active || false
          };
          
          return this.createDemoResponse(menuAccess as T);
        }
        
        throw new Error('Invalid QR code');
      }

      // Health check
      if (url.includes('/health')) {
        return this.createDemoResponse({ status: 'healthy', timestamp: new Date().toISOString() } as T);
      }

      // Default response for unhandled endpoints
      console.warn(`🎭 Demo Mode: Unhandled endpoint ${method} ${url}`);
      return this.createDemoResponse([] as T);
      
    } catch (error) {
      console.error(`🎭 Demo Mode Error: ${method} ${url}`, error);
      throw error;
    }
  }

  // Helper method to extract venue ID from URL
  private extractVenueIdFromUrl(url: string): string | null {
    const venueMatch = url.match(/\/venues\/([^\/\?]+)/);
    if (venueMatch) return venueMatch[1];
    
    const cafeMatch = url.match(/\/cafes\/([^\/\?]+)/);
    if (cafeMatch) return cafeMatch[1];
    
    // Check query parameters
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('venue_id');
  }

  // Generic GET request with automatic fallback
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Handle demo mode
    if (this.isDemoMode()) {
      return this.handleDemoRequest<T>(url, 'GET', params);
    }

    try {
      console.log(`🌐 API Call: GET ${url}`, params ? { params } : '');
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { 
        params, 
        ...config 
      });
      console.log(`✅ API Success: GET ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: GET ${url}`, error.response?.data || error.message);
      
      // Auto-fallback to demo mode on API failure
      if (this.shouldFallbackToDemo(error)) {
        console.log(`🎭 Auto-fallback to demo mode for: GET ${url}`);
        return this.handleDemoRequest<T>(url, 'GET', params);
      }
      
      return this.handleError<T>(error);
    }
  }

  // Generic POST request with automatic fallback
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Handle demo mode
    if (this.isDemoMode()) {
      return this.handleDemoRequest<T>(url, 'POST', data);
    }

    try {
      console.log(`🌐 API Call: POST ${url}`, data ? { data } : '');
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data, config);
      console.log(`✅ API Success: POST ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: POST ${url}`, error.response?.data || error.message);
      
      // Auto-fallback to demo mode on API failure
      if (this.shouldFallbackToDemo(error)) {
        console.log(`🎭 Auto-fallback to demo mode for: POST ${url}`);
        return this.handleDemoRequest<T>(url, 'POST', data);
      }
      
      return this.handleError<T>(error);
    }
  }

  // Generic PUT request with automatic fallback
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Handle demo mode
    if (this.isDemoMode()) {
      return this.handleDemoRequest<T>(url, 'PUT', data);
    }

    try {
      console.log(`🌐 API Call: PUT ${url}`, data ? { data } : '');
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data, config);
      console.log(`✅ API Success: PUT ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: PUT ${url}`, error.response?.data || error.message);
      
      // Auto-fallback to demo mode on API failure
      if (this.shouldFallbackToDemo(error)) {
        console.log(`🎭 Auto-fallback to demo mode for: PUT ${url}`);
        return this.handleDemoRequest<T>(url, 'PUT', data);
      }
      
      return this.handleError<T>(error);
    }
  }

  // Generic PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data, config);
      return response.data;
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Generic DELETE request with automatic fallback
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Handle demo mode
    if (this.isDemoMode()) {
      return this.handleDemoRequest<T>(url, 'DELETE');
    }

    try {
      console.log(`🌐 API Call: DELETE ${url}`);
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url, config);
      console.log(`✅ API Success: DELETE ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: DELETE ${url}`, error.response?.data || error.message);
      
      // Auto-fallback to demo mode on API failure
      if (this.shouldFallbackToDemo(error)) {
        console.log(`🎭 Auto-fallback to demo mode for: DELETE ${url}`);
        return this.handleDemoRequest<T>(url, 'DELETE');
      }
      
      return this.handleError<T>(error);
    }
  }

  // File upload with progress tracking
  async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional form data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Multiple file upload
  async uploadFiles<T>(
    url: string, 
    files: File[], 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add additional form data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Paginated GET request
  async getPaginated<T>(
    url: string, 
    page: number = 1, 
    pageSize: number = 20, 
    params?: any
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const response = await this.api.get(url, {
        params: {
          page,
          page_size: pageSize,
          ...params
        }
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Error handler
  private handleError<T>(error: any): ApiResponse<T> {
    const errorResponse: ApiResponse<T> = {
      success: false,
      message: 'An error occurred',
      error: error.message
    };

    if (error.response) {
      // Server responded with error status
      errorResponse.message = error.response.data?.detail || 
                              error.response.data?.message || 
                              `Server error: ${error.response.status}`;
      errorResponse.error = error.response.data?.error || error.message;
    } else if (error.request) {
      // Request was made but no response received
      errorResponse.message = 'Network error - please check your connection';
      errorResponse.error = 'Network error';
    }

    return errorResponse;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get API instance for custom requests
  getApiInstance(): AxiosInstance {
    return this.api;
  }

  // Set custom headers
  setHeader(key: string, value: string): void {
    this.api.defaults.headers.common[key] = value;
  }

  // Remove custom headers
  removeHeader(key: string): void {
    delete this.api.defaults.headers.common[key];
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.api.defaults.baseURL = baseURL;
  }

  // Update timeout
  setTimeout(timeout: number): void {
    this.api.defaults.timeout = timeout;
  }

  // Check if should fallback to demo mode
  private shouldFallbackToDemo(error: any): boolean {
    // Fallback conditions:
    // 1. Network error (no response)
    // 2. Server error (5xx)
    // 3. Connection timeout
    // 4. CORS error
    
    if (!error.response) {
      // Network error or timeout
      return true;
    }
    
    if (error.response.status >= 500) {
      // Server error
      return true;
    }
    
    if (error.code === 'ECONNABORTED') {
      // Timeout
      return true;
    }
    
    return false;
  }

  // Enable demo mode
  enableDemoMode(): void {
    localStorage.setItem('dino_demo_mode', 'true');
    console.log('🎭 Demo mode enabled');
  }

  // Disable demo mode
  disableDemoMode(): void {
    localStorage.removeItem('dino_demo_mode');
    console.log('🌐 Demo mode disabled');
  }

  // Toggle demo mode
  toggleDemoMode(): boolean {
    const isDemo = this.isDemoMode();
    if (isDemo) {
      this.disableDemoMode();
    } else {
      this.enableDemoMode();
    }
    return !isDemo;
  }

  // Get current mode
  getCurrentMode(): 'api' | 'demo' {
    return this.isDemoMode() ? 'demo' : 'api';
  }
}

export const apiService = new ApiService();