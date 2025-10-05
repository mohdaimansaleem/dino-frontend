/**
 * Optimized API Service
 * Enhanced API client with intelligent caching, retry logic, and performance optimization
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../../config/api';
import StorageManager from '../storage';

interface RequestCache {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  enableCache: boolean;
  defaultCacheTTL: number;
  enableRetry: boolean;
  retryConfig: RetryConfig;
  enableCompression: boolean;
  enablePerformanceLogging: boolean;
}

class OptimizedApiService {
  private client: AxiosInstance;
  private cache: Map<string, RequestCache> = new Map();
  private config: ApiServiceConfig;
  private requestInterceptorId?: number;
  private responseInterceptorId?: number;

  constructor(config?: Partial<ApiServiceConfig>) {
    this.config = {
      baseURL: API_CONFIG.BASE_URL,
      timeout: 30000,
      enableCache: true,
      defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
      enableRetry: true,
      retryConfig: {
        retries: 3,
        retryDelay: 1000,
        retryCondition: (error: AxiosError) => {
          return !error.response || error.response.status >= 500;
        }
      },
      enableCompression: true,
      enablePerformanceLogging: true,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.enableCompression && { 'Accept-Encoding': 'gzip, deflate' })
      }
    });

    this.setupInterceptors();
    this.startCacheCleanup();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.requestInterceptorId = this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = StorageManager.getItem(StorageManager.KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for performance logging
        if (this.config.enablePerformanceLogging) {
          (config as any).metadata = { startTime: Date.now() };
        }

        // Add cache headers for GET requests
        if (config.method === 'get' && this.config.enableCache) {
          config.headers['Cache-Control'] = 'max-age=300';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.responseInterceptorId = this.client.interceptors.response.use(
      (response) => {
        // Log performance metrics
        if (this.config.enablePerformanceLogging && (response.config as any).metadata) {
          const duration = Date.now() - (response.config as any).metadata.startTime;
          console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        return response;
      },
      async (error: AxiosError) => {
        // Handle token refresh
        if (error.response?.status === 401) {
          await this.handleTokenRefresh();
          return this.client.request(error.config!);
        }

        // Retry logic
        if (this.config.enableRetry && this.shouldRetry(error)) {
          return this.retryRequest(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh(): Promise<void> {
    try {
      // Clear expired token
      StorageManager.removeItem(StorageManager.KEYS.TOKEN);
      StorageManager.clearAuthData();
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!this.config.retryConfig.retryCondition) {
      return false;
    }
    
    const config = error.config as any;
    const currentRetries = config.__retryCount || 0;
    
    return currentRetries < this.config.retryConfig.retries && 
           this.config.retryConfig.retryCondition(error);
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as any;
    config.__retryCount = (config.__retryCount || 0) + 1;
    
    const delay = this.config.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.client.request(config);
  }

  private generateCacheKey(method: string, url: string, params?: any, data?: any): string {
    let key = `${method}:${url}`;
    if (params) {
      key += `:${JSON.stringify(params)}`;
    }
    if (data) {
      key += `:${JSON.stringify(data)}`;
    }
    return btoa(key); // Base64 encode for safe storage
  }

  private getCachedResponse(cacheKey: string): any | null {
    if (!this.config.enableCache) {
      return null;
    }

    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCachedResponse(cacheKey: string, data: any, ttl?: number): void {
    if (!this.config.enableCache) {
      return;
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultCacheTTL
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  // Public API methods
  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig & { cacheTTL?: number; skipCache?: boolean }
  ): Promise<{ data: T; success: boolean; message?: string }> {
    const cacheKey = this.generateCacheKey('GET', url, config?.params);
    
    // Check cache first
    if (!config?.skipCache) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      const response = await this.client.get<T>(url, config);
      const result = {
        data: response.data,
        success: true,
        message: 'Success'
      };

      // Cache successful GET requests
      if (response.status === 200 && !config?.skipCache) {
        this.setCachedResponse(cacheKey, result, config?.cacheTTL);
      }

      return result;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<{ data: T; success: boolean; message?: string }> {
    try {
      const response = await this.client.post<T>(url, data, config);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<{ data: T; success: boolean; message?: string }> {
    try {
      const response = await this.client.put<T>(url, data, config);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<{ data: T; success: boolean; message?: string }> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<{ data: T; success: boolean; message?: string }> {
    try {
      const response = await this.client.delete<T>(url, config);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private invalidateCache(url: string): void {
    // Remove cache entries that might be affected by this change
    const urlParts = url.split('/');
    const baseResource = urlParts[1]; // e.g., 'venues', 'users', etc.
    
    for (const [key] of this.cache.entries()) {
      try {
        const decodedKey = atob(key);
        if (decodedKey.includes(baseResource)) {
          this.cache.delete(key);
        }
      } catch (error) {
        // Invalid base64, skip
      }
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as any)?.message || 
                     (error.response.data as any)?.error || 
                     error.response.statusText || 
                     'An error occurred';
      
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  updateConfig(newConfig: Partial<ApiServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update axios instance if needed
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }
  }

  // Batch request support
  async batch<T = any>(requests: Array<{
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url: string;
    data?: any;
    config?: AxiosRequestConfig;
  }>): Promise<Array<{ data: T; success: boolean; message?: string; error?: string }>> {
    const promises = requests.map(async (request) => {
      try {
        switch (request.method) {
          case 'get':
            return await this.get<T>(request.url, request.config);
          case 'post':
            return await this.post<T>(request.url, request.data, request.config);
          case 'put':
            return await this.put<T>(request.url, request.data, request.config);
          case 'patch':
            return await this.patch<T>(request.url, request.data, request.config);
          case 'delete':
            return await this.delete<T>(request.url, request.config);
          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }
      } catch (error) {
        return {
          data: null as T,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    return Promise.all(promises);
  }

  // Prefetch data for performance
  async prefetch(urls: string[]): Promise<void> {
    const prefetchPromises = urls.map(url => 
      this.get(url, { cacheTTL: 10 * 60 * 1000 }) // Cache for 10 minutes
        .catch(error => console.warn(`Prefetch failed for ${url}:`, error))
    );

    await Promise.allSettled(prefetchPromises);
  }

  destroy(): void {
    // Clean up interceptors
    if (this.requestInterceptorId !== undefined) {
      this.client.interceptors.request.eject(this.requestInterceptorId);
    }
    if (this.responseInterceptorId !== undefined) {
      this.client.interceptors.response.eject(this.responseInterceptorId);
    }
    
    // Clear cache
    this.clearCache();
  }
}

// Create optimized API service instance
export const optimizedApiService = new OptimizedApiService();

export default OptimizedApiService;