/**
 * Cache Service for Performance Optimization
 * Implements in-memory caching with TTL and localStorage persistence
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  persistent?: boolean; // Whether to persist to localStorage
  maxSize?: number; // Maximum number of items in cache
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private persistent = false;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
    this.persistent = options.persistent !== false;

    // Load cache from localStorage on initialization
    if (this.persistent) {
      this.loadFromStorage();
    }

    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      key,
    };

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    this.cache.set(key, item);

    // Persist to localStorage if enabled
    if (this.persistent) {
      this.saveToStorage(key, item);
    }

  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if an item exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.persistent) {
      this.removeFromStorage(key);
    }

    if (deleted) {
      }

    return deleted;
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
    
    if (this.persistent) {
      this.clearStorage();
    }

    }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data and cache it
    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get multiple items from cache
   */
  getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  /**
   * Set multiple items in cache
   */
  setMultiple<T>(items: Record<string, T>, ttl?: number): void {
    Object.entries(items).forEach(([key, data]) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * Check if cache is getting full
   */
  isNearCapacity(threshold = 0.8): boolean {
    return this.cache.size >= this.maxSize * threshold;
  }

  /**
   * Get cache health metrics
   */
  getHealthMetrics(): {
    size: number;
    maxSize: number;
    utilizationRate: number;
    oldestItemAge: number;
    expiredItemsCount: number;
  } {
    let oldestTimestamp = Date.now();
    let expiredCount = 0;

    Array.from(this.cache.values()).forEach(item => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
      }
      if (this.isExpired(item)) {
        expiredCount++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationRate: this.cache.size / this.maxSize,
      oldestItemAge: Date.now() - oldestTimestamp,
      expiredItemsCount: expiredCount,
    };
  }

  /**
   * Invalidate cache items by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    Array.from(this.cache.keys()).forEach(key => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    items: Array<{ key: string; age: number; ttl: number }>;
  } {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      age: Date.now() - item.timestamp,
      ttl: item.ttl,
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      items,
    };
  }

  /**
   * Preload data into cache
   */
  async preload<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<void> {
    if (!this.has(key)) {
      try {
        const data = await fetchFunction();
        this.set(key, data, ttl);
        } catch (error) {
        }
    }
  }

  /**
   * Refresh cache item
   */
  async refresh<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Private methods

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0) {
      }
  }

  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      
      for (const storageKey of keys) {
        const cacheKey = storageKey.replace('dino_cache_', '');
        const itemJson = localStorage.getItem(storageKey);
        
        if (itemJson) {
          const item: CacheItem<any> = JSON.parse(itemJson);
          
          // Only load if not expired
          if (!this.isExpired(item)) {
            this.cache.set(cacheKey, item);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }

      } catch (error) {
      }
  }

  private saveToStorage(key: string, item: CacheItem<any>): void {
    try {
      const storageKey = `dino_cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      }
  }

  private removeFromStorage(key: string): void {
    try {
      const storageKey = `dino_cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      }
  }

  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      }
  }
}

// Create cache instances for different types of data
export const apiCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes for API responses
  persistent: false, // Disable localStorage persistence
  maxSize: 50,
});

export const dashboardCache = new CacheService({
  ttl: 2 * 60 * 1000, // 2 minutes for dashboard data
  persistent: false, // Don't persist dashboard data
  maxSize: 20,
});

export const staticCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes for static data
  persistent: false, // Disable localStorage persistence
  maxSize: 100,
});

export const userCache = new CacheService({
  ttl: 10 * 60 * 1000, // 10 minutes for user data
  persistent: false, // Disable localStorage persistence
  maxSize: 10,
});

// Cache key generators
export const CacheKeys = {
  // Dashboard keys
  dashboardData: (role: string, venueId?: string) => 
    `dashboard_${role}${venueId ? `_${venueId}` : ''}`,
  
  // User keys
  userProfile: (userId: string) => `user_profile_${userId}`,
  userPermissions: (userId: string) => `user_permissions_${userId}`,
  
  // Menu keys
  menuItems: (venueId: string) => `menu_items_${venueId}`,
  menuCategories: (venueId: string) => `menu_categories_${venueId}`,
  
  // Order keys
  orders: (venueId: string, status?: string) => 
    `orders_${venueId}${status ? `_${status}` : ''}`,
  
  // Table keys
  tables: (venueId: string) => `tables_${venueId}`,
  
  // Venue keys
  venueDetails: (venueId: string) => `venue_${venueId}`,
  
  // Workspace keys
  workspaceDetails: (workspaceId: string) => `workspace_${workspaceId}`,
};

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache API response with automatic key generation
   */
  cacheApiResponse: async <T>(
    endpoint: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const key = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return apiCache.getOrSet(key, fetchFunction, ttl);
  },

  /**
   * Invalidate all cache related to a venue
   */
  invalidateVenueCache: (venueId: string): void => {
    apiCache.invalidatePattern(`.*${venueId}.*`);
    dashboardCache.invalidatePattern(`.*${venueId}.*`);
  },

  /**
   * Invalidate all cache related to a user
   */
  invalidateUserCache: (userId: string): void => {
    userCache.invalidatePattern(`.*${userId}.*`);
    apiCache.invalidatePattern(`.*user.*${userId}.*`);
  },

  /**
   * Preload critical data
   */
  preloadCriticalData: async (userId: string, venueId?: string): Promise<void> => {
    const preloadTasks: Promise<void>[] = [];

    // Preload dashboard data if venue is available (no user permissions caching)
    if (venueId) {
      preloadTasks.push(
        dashboardCache.preload(
          CacheKeys.dashboardData('admin', venueId),
          () => import('../../services/business').then(({ dashboardService }) => 
            dashboardService.getAdminDashboard()
          )
        )
      );
    }

    await Promise.allSettled(preloadTasks);
  },
};

// Export the default cache service instance
export const cacheService = new CacheService();

export default CacheService;