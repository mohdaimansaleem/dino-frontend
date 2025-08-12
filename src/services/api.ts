/**
 * Enhanced API Service with Consistent Data Mapping
 * Handles snake_case to camelCase conversion and proper error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';
import { authService } from './authService';
import { logger } from '../utils/logger';

// Data transformation utilities
class DataTransformer {
  /**
   * Convert snake_case to camelCase recursively
   */
  static toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => DataTransformer.toCamelCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const camelCaseObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const camelKey = DataTransformer.snakeToCamel(key);
        camelCaseObj[camelKey] = DataTransformer.toCamelCase(value);
        
        // Keep original snake_case for API compatibility
        if (key !== camelKey) {
          camelCaseObj[key] = value;
        }
      }
      
      return camelCaseObj;
    }

    return obj;
  }

  /**
   * Convert camelCase to snake_case recursively
   */
  static toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => DataTransformer.toSnakeCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const snakeCaseObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = DataTransformer.camelToSnake(key);
        snakeCaseObj[snakeKey] = DataTransformer.toSnakeCase(value);
      }
      
      return snakeCaseObj;
    }

    return obj;
  }

  private static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Enhanced API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();
  
  // Add debugConfiguration method signature
  debugConfiguration?: () => void;

  constructor() {
    // Log configuration during initialization
    console.log('🔧 ApiService constructor - API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    console.log('🔧 ApiService constructor - window.APP_CONFIG:', (window as any).APP_CONFIG);
    
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if token needs refresh before making request
        if (authService.shouldRefreshToken()) {
          console.log('🔄 Token needs refresh, attempting before request...');
          try {
            await authService.refreshToken();
          } catch (error) {
            console.error('Pre-request token refresh failed:', error);
          }
        }
        
        // Add authentication token
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Added auth token to request:', config.url);
        } else {
          console.warn('⚠️ No auth token available for request:', config.url);
        }

        // Convert request data to snake_case
        if (config.data && typeof config.data === 'object') {
          config.data = DataTransformer.toSnakeCase(config.data);
        }

        // Log request with detailed URL info for debugging
        logger.apiRequest(config.method || 'GET', config.url || '', {
          data: config.data,
          params: config.params,
          baseURL: config.baseURL,
          fullUrl: `${config.baseURL}${config.url}`,
          userAgent: navigator.userAgent,
          isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
        });

        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Convert response data to camelCase
        if (response.data) {
          response.data = DataTransformer.toCamelCase(response.data);
        }

        // Log response
        logger.apiResponse(
          response.config.method || 'GET',
          response.config.url || '',
          response.status,
          response.data
        );

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token refresh)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await authService.refreshToken();
            if (newToken && newToken.access_token) {
              // Update the authorization header with new token
              originalRequest.headers.Authorization = `Bearer ${newToken.access_token}`;
              // Also update the default headers for future requests
              this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken.access_token}`;
              // Retry the original request
              return this.axiosInstance(originalRequest);
            } else {
              // No valid token received, logout
              authService.logout();
              window.location.href = '/login';
              return Promise.reject(new Error('Token refresh failed'));
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            console.error('Token refresh failed:', refreshError);
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Log error
        logger.apiError(
          error.config?.method || 'UNKNOWN',
          error.config?.url || '',
          {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          }
        );

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request with caching
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;
      
      // Check if request is already in progress
      if (this.requestQueue.has(cacheKey)) {
        return await this.requestQueue.get(cacheKey);
      }

      // Make request
      const requestPromise = this.axiosInstance.get<ApiResponse<T>>(url, config);
      this.requestQueue.set(cacheKey, requestPromise);

      const response = await requestPromise;
      this.requestQueue.delete(cacheKey);

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * File upload with progress tracking
   */
  async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
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

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle successful responses
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    const data = response.data;

    // Handle different response formats
    if (data && typeof data === 'object') {
      // Standard API response format
      if ('success' in data) {
        return data;
      }

      // Direct data response (for some endpoints)
      return {
        success: true,
        data: data as T,
        message: 'Request successful'
      };
    }

    // Fallback for unexpected response format
    return {
      success: true,
      data: data as T,
      message: 'Request successful'
    };
  }

  /**
   * Handle errors with consistent format and proper Pydantic error parsing
   */
  private handleError(error: any): Error {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data;
      
      if (responseData) {
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.detail) {
          // Handle Pydantic validation errors
          if (Array.isArray(responseData.detail)) {
            // Pydantic validation error format
            const validationErrors = responseData.detail.map((err: any) => {
              const field = err.loc ? err.loc.join('.') : 'field';
              const message = err.msg || 'Invalid value';
              return `${field}: ${message}`;
            }).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else if (typeof responseData.detail === 'object') {
            // Handle object detail (convert [object Object] to readable format)
            try {
              errorMessage = JSON.stringify(responseData.detail);
            } catch {
              errorMessage = 'Validation error occurred';
            }
          } else {
            errorMessage = responseData.detail;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === 'object') {
          // Handle cases where the entire response is an error object
          try {
            errorMessage = JSON.stringify(responseData);
          } catch {
            errorMessage = 'Server error occurred';
          }
        }

        errorCode = responseData.error_code || `HTTP_${error.response.status}`;
      } else {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        errorCode = `HTTP_${error.response.status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
      errorCode = 'NETWORK_ERROR';
    } else {
      // Other error
      errorMessage = error.message || errorMessage;
      errorCode = 'CLIENT_ERROR';
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).code = errorCode;
    (enhancedError as any).response = error.response;

    return enhancedError;
  }

  /**
   * Clear request queue (useful for cleanup)
   */
  clearRequestQueue(): void {
    this.requestQueue.clear();
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || '';
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    console.log('🔧 Updating API base URL from', this.axiosInstance.defaults.baseURL, 'to', baseURL);
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Refresh configuration from runtime config
   */
  refreshConfiguration(): void {
    const runtimeConfig = (window as any).APP_CONFIG;
    if (runtimeConfig && runtimeConfig.API_BASE_URL) {
      console.log('🔧 Refreshing API configuration from runtime config');
      console.log('   Current base URL:', this.axiosInstance.defaults.baseURL);
      console.log('   Runtime config API_BASE_URL:', runtimeConfig.API_BASE_URL);
      
      if (this.axiosInstance.defaults.baseURL !== runtimeConfig.API_BASE_URL) {
        this.setBaseURL(runtimeConfig.API_BASE_URL);
        console.log('✅ API base URL updated to:', runtimeConfig.API_BASE_URL);
      } else {
        console.log('✅ API base URL already correct');
      }
    } else {
      console.warn('⚠️ No runtime config found or API_BASE_URL not set');
    }
  }

  /**
   * Set authorization header manually (useful for app initialization)
   */
  setAuthorizationHeader(token: string | null): void {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header set for all future requests');
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
      console.log('🗑️ Authorization header removed');
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      logger.warn('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Make apiService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).apiService = apiService;
}

// Add debug method to the instance
apiService.debugConfiguration = function() {
  console.group('🔧 API Service Configuration Debug');
  console.log('Base URL:', (apiService as any).axiosInstance.defaults.baseURL);
  console.log('Timeout:', (apiService as any).axiosInstance.defaults.timeout);
  console.log('Headers:', (apiService as any).axiosInstance.defaults.headers);
  console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
  console.log('Window Location:', window.location.href);
  console.log('User Agent:', navigator.userAgent);
  console.log('Is Mobile:', /Mobile|Android|iPhone|iPad/.test(navigator.userAgent));
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
  console.log('Runtime Config API_BASE_URL:', API_CONFIG.BASE_URL);
  console.groupEnd();
};

export default apiService;