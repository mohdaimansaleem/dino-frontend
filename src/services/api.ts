import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import { API_CONFIG } from '../config/api';

class ApiService {
  private api: AxiosInstance;
  private refreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
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
            // Only redirect if we're not already on login page
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.refreshing = false;
          }
        }

        // Handle other error cases
        if (error.response?.status === 403) {
          // Forbidden - user doesn't have permission
          console.warn('Access denied:', error.response.data?.message || 'Insufficient permissions');
        } else if (error.response?.status >= 500) {
          // Server error
          console.error('Server error:', error.response.status, error.response.data?.message || 'Internal server error');
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
  }

  // Retry logic for failed requests
  private async executeWithRetry<T>(
    operation: () => Promise<ApiResponse<T>>,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      return await operation();
    } catch (error: any) {
      const shouldRetry = this.shouldRetryRequest(error, retryCount);
      
      if (shouldRetry) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.sleep(delay);
        return this.executeWithRetry(operation, retryCount + 1);
      }
      
      return this.handleError<T>(error);
    }
  }

  // Determine if request should be retried
  private shouldRetryRequest(error: any, retryCount: number): boolean {
    if (retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
      return false;
    }

    // Don't retry authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }

    // Don't retry client errors (4xx except 429)
    if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
      return false;
    }

    // Retry network errors, timeouts, and server errors
    return (
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      error.response.status >= 500 || // Server error
      error.response.status === 429 // Rate limit
    );
  }

  // Calculate exponential backoff delay
  private calculateRetryDelay(retryCount: number): number {
    return API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic GET request with retry logic
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { 
        params, 
        ...config 
      });
      return response.data;
    });
  }

  // Generic POST request with retry logic
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<any> = await this.api.post(url, data, config);
      // Handle different response formats from backend
      if (response.data && typeof response.data === 'object') {
        // If response has success field, it's our ApiResponse format
        if ('success' in response.data) {
          return response.data as ApiResponse<T>;
        }
        // If response is direct data (like auth endpoints), wrap it
        return {
          success: true,
          data: response.data as T,
          message: 'Success'
        } as ApiResponse<T>;
      }
      
      return response.data;
    });
  }

  // Generic PUT request with retry logic
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data, config);
      return response.data;
    });
  }

  // Generic PATCH request with retry logic
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data, config);
      return response.data;
    });
  }

  // Generic DELETE request with retry logic
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url, config);
      return response.data;
    });
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

  // Error handler with improved error categorization
  private handleError<T>(error: any): ApiResponse<T> {
    const errorResponse: ApiResponse<T> = {
      success: false,
      message: 'An error occurred',
      error: error.message
    };

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorResponse.message = data?.detail || data?.message || 'Invalid request';
          break;
        case 401:
          errorResponse.message = 'Authentication required';
          break;
        case 403:
          errorResponse.message = 'Access denied - insufficient permissions';
          break;
        case 404:
          errorResponse.message = 'Resource not found';
          break;
        case 409:
          errorResponse.message = data?.detail || 'Conflict - resource already exists';
          break;
        case 422:
          errorResponse.message = data?.detail || 'Validation error';
          break;
        case 429:
          errorResponse.message = 'Too many requests - please try again later';
          break;
        case 500:
          errorResponse.message = 'Internal server error';
          break;
        case 502:
          errorResponse.message = 'Service temporarily unavailable';
          break;
        case 503:
          errorResponse.message = 'Service unavailable';
          break;
        default:
          errorResponse.message = data?.detail || data?.message || `Server error: ${status}`;
      }
      
      errorResponse.error = data?.error || error.message;
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        errorResponse.message = 'Request timeout - please try again';
        errorResponse.error = 'Timeout error';
      } else {
        errorResponse.message = 'Network error - please check your connection';
        errorResponse.error = 'Network error';
      }
    } else {
      // Something else happened
      errorResponse.message = error.message || 'An unexpected error occurred';
      errorResponse.error = error.name || 'Unknown error';
    }

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorResponse.message,
        error: errorResponse.error
      });
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
}

export const apiService = new ApiService();