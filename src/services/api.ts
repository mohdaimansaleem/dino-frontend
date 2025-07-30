import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private refreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
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
  }

  // Generic GET request
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
      return this.handleError<T>(error);
    }
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Call: POST ${url}`, data ? { data } : '');
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data, config);
      console.log(`✅ API Success: POST ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: POST ${url}`, error.response?.data || error.message);
      return this.handleError<T>(error);
    }
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Call: PUT ${url}`, data ? { data } : '');
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data, config);
      console.log(`✅ API Success: PUT ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: PUT ${url}`, error.response?.data || error.message);
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

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Call: DELETE ${url}`);
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url, config);
      console.log(`✅ API Success: DELETE ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error: DELETE ${url}`, error.response?.data || error.message);
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
}

export const apiService = new ApiService();