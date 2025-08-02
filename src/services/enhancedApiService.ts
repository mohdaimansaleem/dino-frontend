import { config } from '../config/env';

interface ApiRequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
}

interface ApiResponseLog {
  status: number;
  statusText: string;
  data?: any;
  error?: string;
  timestamp: Date;
  duration: number;
}

interface ApiCall {
  request: ApiRequestLog;
  response?: ApiResponseLog;
  id: string;
}

class EnhancedApiService {
  private baseUrl: string;
  private timeout: number;
  private apiCalls: ApiCall[] = [];

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    
    // Log API service initialization
    }

  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logRequest(method: string, url: string, headers: Record<string, string>, body?: any): string {
    const id = this.generateId();
    const request: ApiRequestLog = {
      method,
      url,
      headers,
      body,
      timestamp: new Date(),
    };

    this.apiCalls.push({ id, request });

    // Console logging with emojis and formatting
    if (body) {
      }
    return id;
  }

  private logResponse(id: string, status: number, statusText: string, data?: any, error?: string): void {
    const callIndex = this.apiCalls.findIndex(call => call.id === id);
    if (callIndex === -1) return;

    const call = this.apiCalls[callIndex];
    const duration = Date.now() - call.request.timestamp.getTime();
    
    const response: ApiResponseLog = {
      status,
      statusText,
      data,
      error,
      timestamp: new Date(),
      duration,
    };

    this.apiCalls[callIndex].response = response;

    // Console logging with status-based emojis
    const statusEmoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    
    if (data) {
      }
    if (error) {
      }
    
    // Show summary
    }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    const token = localStorage.getItem('dino_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestId = this.logRequest(method, url, headers, options.body);

    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        this.logResponse(requestId, response.status, response.statusText, undefined, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logResponse(requestId, response.status, response.statusText, responseData);

      return {
        data: responseData,
        status: response.status,
      };

    } catch (error: any) {
      // Log the API failure
      this.logResponse(requestId, 0, 'Network Error', undefined, error.message);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<{ data: T; status: number }> {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body: any): Promise<{ data: T; status: number }> {
    return this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  // PUT request
  async put<T>(endpoint: string, body: any): Promise<{ data: T; status: number }> {
    return this.makeRequest(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<{ data: T; status: number }> {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // Get API call history
  getApiCallHistory(): ApiCall[] {
    return [...this.apiCalls];
  }

  // Clear API call history
  clearApiCallHistory(): void {
    this.apiCalls = [];
    }

  // Get API statistics
  getApiStats(): {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageResponseTime: number;
  } {
    const completedCalls = this.apiCalls.filter(call => call.response);
    const successfulCalls = completedCalls.filter(call => call.response!.status >= 200 && call.response!.status < 300);
    const failedCalls = completedCalls.filter(call => call.response!.status >= 400);
    
    const totalResponseTime = completedCalls.reduce((sum, call) => sum + call.response!.duration, 0);
    const averageResponseTime = completedCalls.length > 0 ? totalResponseTime / completedCalls.length : 0;

    return {
      totalCalls: this.apiCalls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      averageResponseTime: Math.round(averageResponseTime),
    };
  }

  // Show API status in console
  showApiStatus(): void {
    const stats = this.getApiStats();
    
    }
}

export const enhancedApiService = new EnhancedApiService();
export type { ApiCall, ApiRequestLog, ApiResponseLog };