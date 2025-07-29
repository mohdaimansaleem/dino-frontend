import { API_CONFIG } from '../constants/app';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  source: 'api' | 'mock';
}

interface ApiError {
  message: string;
  status: number;
  source: 'api' | 'mock';
}

class ApiWithMockFallback {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    mockData: T
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    
    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, data);

      return {
        data,
        success: true,
        source: 'api',
      };
    } catch (error: any) {
      console.warn(`❌ API Failed: ${error.message}`);
      console.log(`🔄 Falling back to mock data...`);
      
      // Return mock data as fallback
      console.log(`✅ Mock Data:`, mockData);
      
      return {
        data: mockData,
        success: true,
        message: `API unavailable, using mock data. Error: ${error.message}`,
        source: 'mock',
      };
    }
  }

  // GET request with mock fallback
  async get<T>(endpoint: string, mockData: T): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'GET' }, mockData);
  }

  // POST request with mock fallback
  async post<T>(endpoint: string, body: any, mockData: T): Promise<ApiResponse<T>> {
    return this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      mockData
    );
  }

  // PUT request with mock fallback
  async put<T>(endpoint: string, body: any, mockData: T): Promise<ApiResponse<T>> {
    return this.makeRequest(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      mockData
    );
  }

  // DELETE request with mock fallback
  async delete<T>(endpoint: string, mockData: T): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'DELETE' }, mockData);
  }

  // Show API status in UI
  showApiStatus(response: ApiResponse<any>) {
    if (response.source === 'mock') {
      console.warn('🔄 Using Mock Data - API not available');
      // You can show a toast notification here
      return {
        type: 'warning',
        message: 'Using demo data - API not available',
      };
    } else {
      console.log('✅ Connected to API');
      return {
        type: 'success',
        message: 'Connected to live API',
      };
    }
  }
}

export const apiWithMockFallback = new ApiWithMockFallback();
export type { ApiResponse, ApiError };