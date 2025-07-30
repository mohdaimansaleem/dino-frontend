/**
 * Enhanced API Services Index
 * 
 * This file exports all API services for the Dino Multi-Venue Platform
 * providing a centralized access point for all backend integrations.
 */

// Import services for default export
import { apiService } from './api';
import { authService } from './authService';
import { userService } from './userService';
import { workspaceService } from './workspaceService';
import { venueService } from './venueService';
import { menuService } from './menuService';
import { tableService } from './tableService';
import { orderService } from './orderService';
import { dashboardService } from './dashboardService';
import { validationService } from './validationService';

// Core API service
export { apiService } from './api';

// Authentication and user management
export { authService } from './authService';
export { userService } from './userService';

// Workspace and venue management
export { workspaceService } from './workspaceService';
export { venueService } from './venueService';

// Menu and table management
export { menuService } from './menuService';
export { tableService } from './tableService';

// Order management
export { orderService } from './orderService';

// Dashboard and analytics
export { dashboardService } from './dashboardService';

// Validation services
export { validationService } from './validationService';

// Legacy services (for backward compatibility)
export { analyticsService } from './analyticsService';
export { enhancedApiService } from './enhancedApiService';
export { notificationService } from './notificationService';
export { permissionService } from './permissionService';
export { promoService } from './promoService';
export { qrService } from './qrService';
export { storageService } from './storageService';
export { trackingService } from './trackingService';

// Service types
export type {
  // API types
  ApiResponse,
  PaginatedResponse,
  
  // Authentication types
  AuthToken,
  UserProfile,
  UserRegistration,
  WorkspaceRegistration,
  
  // Workspace types
  Workspace,
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceStatistics,
  
  // Venue types
  Venue,
  VenueCreate,
  VenueUpdate,
  VenueAnalytics,
  VenueStatus,
  VenueLocation,
  OperatingHours,
  
  // Menu types
  MenuCategory,
  MenuItem,
  MenuCategoryCreate,
  MenuItemCreate,
  MenuItemUpdate,
  
  // Table types
  Table,
  TableCreate,
  TableUpdate,
  TableQRCode,
  QRCodeVerification,
  TableStatus,
  
  // Order types
  Order,
  OrderCreate,
  OrderUpdate,
  OrderItem,
  OrderItemCreate,
  PublicOrderCreate,
  CustomerCreate,
  OrderValidation,
  OrderReceipt,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderType,
  
  // Dashboard types
  DashboardData,
  SuperAdminDashboard,
  AdminDashboard,
  OperatorDashboard,
  LiveOrderData,
  VenueAnalyticsData,
  
  // User types
  User,
  UserCreate,
  UserUpdate,
  UserRole,
  
  // Validation types
  ValidationResponse,
  WorkspaceValidation,
  
  // Filter types
  PaginationParams,
  VenueFilters,
  MenuFilters,
  OrderFilters,
  TableFilters,
  UserFilters,
  
  // Error types
  ApiError,
  ErrorCode
} from '../types/api';

/**
 * Service Registry
 * 
 * Provides a centralized registry of all services for dependency injection
 * and testing purposes.
 */
export const serviceRegistry = {
  // Core services
  api: () => import('./api').then(m => m.apiService),
  
  // Authentication and user management
  auth: () => import('./authService').then(m => m.authService),
  user: () => import('./userService').then(m => m.userService),
  
  // Workspace and venue management
  workspace: () => import('./workspaceService').then(m => m.workspaceService),
  venue: () => import('./venueService').then(m => m.venueService),
  
  // Menu and table management
  menu: () => import('./menuService').then(m => m.menuService),
  table: () => import('./tableService').then(m => m.tableService),
  
  // Order management
  order: () => import('./orderService').then(m => m.orderService),
  
  // Dashboard and analytics
  dashboard: () => import('./dashboardService').then(m => m.dashboardService),
  
  // Validation
  validation: () => import('./validationService').then(m => m.validationService),
  
  // Legacy services
  analytics: () => import('./analyticsService').then(m => m.analyticsService),
  notification: () => import('./notificationService').then(m => m.notificationService),
  permission: () => import('./permissionService').then(m => m.permissionService),
  promo: () => import('./promoService').then(m => m.promoService),
  qr: () => import('./qrService').then(m => m.qrService),
  storage: () => import('./storageService').then(m => m.storageService),
  tracking: () => import('./trackingService').then(m => m.trackingService)
} as const;

/**
 * Service Health Check
 * 
 * Checks the health of all critical services
 */
export const checkServiceHealth = async (): Promise<{
  healthy: boolean;
  services: Record<string, boolean>;
  errors: string[];
}> => {
  const results = {
    healthy: true,
    services: {} as Record<string, boolean>,
    errors: [] as string[]
  };

  try {
    // Check API service health
    const { apiService } = await import('./api');
    results.services.api = await apiService.healthCheck();
    
    if (!results.services.api) {
      results.healthy = false;
      results.errors.push('API service is not responding');
    }
  } catch (error) {
    results.healthy = false;
    results.services.api = false;
    results.errors.push('Failed to check API service health');
  }

  return results;
};

/**
 * Service Configuration
 * 
 * Provides configuration options for all services
 */
export const serviceConfig = {
  // API configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Authentication configuration
  auth: {
    tokenKey: 'dino_token',
    refreshTokenKey: 'dino_refresh_token',
    userKey: 'dino_user',
    sessionTimeout: 60 * 60 * 1000 // 1 hour
  },
  
  // Dashboard configuration
  dashboard: {
    refreshIntervals: {
      superadmin: 60000, // 1 minute
      admin: 30000,      // 30 seconds
      operator: 10000,   // 10 seconds
      customer: 30000    // 30 seconds
    }
  },
  
  // Validation configuration
  validation: {
    debounceDelay: 300,
    passwordMinLength: 8,
    phoneMinLength: 10
  }
} as const;

/**
 * Service Utilities
 * 
 * Common utilities used across services
 */
export const serviceUtils = {
  /**
   * Format currency for display
   */
  formatCurrency: (amount: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Format date for display
   */
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format time for display
   */
  formatTime: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Format relative time (e.g., "2 minutes ago")
   */
  formatRelativeTime: (date: string | Date): string => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return serviceUtils.formatDate(date);
  },

  /**
   * Generate unique ID
   */
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },

  /**
   * Debounce function
   */
  debounce: <T extends any[]>(
    func: (...args: T) => any,
    delay: number
  ): ((...args: T) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends any[]>(
    func: (...args: T) => any,
    delay: number
  ): ((...args: T) => void) => {
    let lastCall = 0;
    return (...args: T) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  /**
   * Retry function with exponential backoff
   */
  retry: async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
};

/**
 * Service Events
 * 
 * Event system for service communication
 */
class ServiceEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(listener);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    this.on(event, onceListener);
  }
}

export const serviceEvents = new ServiceEventEmitter();

// Common service events
export const SERVICE_EVENTS = {
  // Authentication events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Table events
  TABLE_STATUS_CHANGED: 'table:status_changed',
  
  // Menu events
  MENU_UPDATED: 'menu:updated',
  
  // Venue events
  VENUE_STATUS_CHANGED: 'venue:status_changed',
  
  // System events
  CONNECTION_LOST: 'system:connection_lost',
  CONNECTION_RESTORED: 'system:connection_restored',
  ERROR_OCCURRED: 'system:error'
} as const;

export default {
  // Services
  apiService,
  authService,
  userService,
  workspaceService,
  venueService,
  menuService,
  tableService,
  orderService,
  dashboardService,
  validationService,
  
  // Utilities
  serviceRegistry,
  serviceConfig,
  serviceUtils,
  serviceEvents,
  SERVICE_EVENTS,
  checkServiceHealth
};