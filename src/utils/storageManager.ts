/**
 * Enhanced Storage Manager
 * Centralized storage management with improved caching, validation, and cleanup
 */

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
  version?: string;
}

export class StorageManager {
  private static readonly PREFIX = 'dino_';
  private static readonly VERSION = '2.0.0';
  
  // Storage keys - aligned with STORAGE_KEYS constants
  static readonly KEYS = {
    TOKEN: 'dino_token',
    REFRESH_TOKEN: 'dino_refresh_token',
    USER: 'dino_user',
    PERMISSIONS: 'dino_permissions',
    WORKSPACE: 'dino_workspace_data',
    VENUE: 'dino_venue_data',
    MENU_CACHE: 'dino_menu_cache',
    SETTINGS: 'dino_user_settings',
    THEME: 'dino_theme',
  } as const;

  // Cache TTL configurations (in milliseconds)
  private static readonly TTL_CONFIG = {
    USER_DATA: 30 * 60 * 1000, // 30 minutes
    PERMISSIONS: 15 * 60 * 1000, // 15 minutes
    WORKSPACE: 20 * 60 * 1000, // 20 minutes
    VENUE: 20 * 60 * 1000, // 20 minutes
    MENU: 10 * 60 * 1000, // 10 minutes
    SETTINGS: 24 * 60 * 60 * 1000, // 24 hours
    THEME: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  /**
   * Set item with automatic expiration and versioning
   */
  static setItem<T>(key: string, data: T, ttl?: number): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: this.VERSION,
      };
      
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set storage item:', error);
      // If storage is full, try to clean up and retry
      this.performEmergencyCleanup();
      try {
        const item: StorageItem<T> = { data, timestamp: Date.now(), ttl, version: this.VERSION };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (retryError) {
        console.error('Failed to set storage item after cleanup:', retryError);
      }
    }
  }

  /**
   * Get item with automatic expiration check
   */
  static getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check version compatibility
      if (item.version && item.version !== this.VERSION) {
        console.warn(`Storage version mismatch for ${key}. Removing outdated item.`);
        this.removeItem(key);
        return null;
      }

      // Check expiration
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        console.log(`Storage item ${key} expired. Removing.`);
        this.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      // Remove corrupted item
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove storage item ${key}:`, error);
    }
  }

  /**
   * Check if item exists and is valid
   */
  static hasValidItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Set user data with appropriate TTL
   */
  static setUserData(userData: any): void {
    this.setItem(this.KEYS.USER, userData, this.TTL_CONFIG.USER_DATA);
  }

  /**
   * Get user data
   */
  static getUserData(): any | null {
    return this.getItem(this.KEYS.USER);
  }

  /**
   * Set user permissions with TTL
   */
  static setPermissions(permissions: any): void {
    this.setItem(this.KEYS.PERMISSIONS, permissions, this.TTL_CONFIG.PERMISSIONS);
  }

  /**
   * Get user permissions
   */
  static getPermissions(): any | null {
    return this.getItem(this.KEYS.PERMISSIONS);
  }

  /**
   * Set workspace data with TTL
   */
  static setWorkspaceData(workspaceData: any): void {
    this.setItem(this.KEYS.WORKSPACE, workspaceData, this.TTL_CONFIG.WORKSPACE);
  }

  /**
   * Get workspace data
   */
  static getWorkspaceData(): any | null {
    return this.getItem(this.KEYS.WORKSPACE);
  }

  /**
   * Set venue data with TTL
   */
  static setVenueData(venueData: any): void {
    this.setItem(this.KEYS.VENUE, venueData, this.TTL_CONFIG.VENUE);
  }

  /**
   * Get venue data
   */
  static getVenueData(): any | null {
    return this.getItem(this.KEYS.VENUE);
  }

  /**
   * Clear venue data cache
   */
  static clearVenueData(): void {
    this.removeItem(this.KEYS.VENUE);
  }

  /**
   * Cache menu data with TTL
   */
  static setCachedMenu(venueId: string, menuData: any): void {
    const cacheKey = `${this.KEYS.MENU_CACHE}_${venueId}`;
    this.setItem(cacheKey, menuData, this.TTL_CONFIG.MENU);
  }

  /**
   * Get cached menu data
   */
  static getCachedMenu(venueId: string): any | null {
    const cacheKey = `${this.KEYS.MENU_CACHE}_${venueId}`;
    return this.getItem(cacheKey);
  }

  /**
   * Set user settings
   */
  static setSettings(settings: any): void {
    this.setItem(this.KEYS.SETTINGS, settings, this.TTL_CONFIG.SETTINGS);
  }

  /**
   * Get user settings
   */
  static getSettings(): any | null {
    return this.getItem(this.KEYS.SETTINGS);
  }

  /**
   * Set theme preference
   */
  static setTheme(theme: string): void {
    this.setItem(this.KEYS.THEME, theme, this.TTL_CONFIG.THEME);
  }

  /**
   * Get theme preference
   */
  static getTheme(): string | null {
    return this.getItem(this.KEYS.THEME);
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    this.removeItem(this.KEYS.TOKEN);
    this.removeItem(this.KEYS.REFRESH_TOKEN);
    this.removeItem(this.KEYS.USER);
    this.removeItem(this.KEYS.PERMISSIONS);
    this.removeItem(this.KEYS.WORKSPACE);
    this.removeItem(this.KEYS.VENUE);
    this.removeItem('dino_token_expiry');
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('cache') || key.includes('temp'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cache items`);
  }

  /**
   * Perform comprehensive cleanup
   */
  static performCleanup(): void {
    const keysToRemove: string[] = [];
    let expiredCount = 0;
    let corruptedCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.PREFIX)) continue;

      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) continue;

        const item: StorageItem = JSON.parse(itemStr);
        
        // Check for version mismatch
        if (item.version && item.version !== this.VERSION) {
          keysToRemove.push(key);
          continue;
        }

        // Check for expiration
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          keysToRemove.push(key);
          expiredCount++;
        }
      } catch (error) {
        // Corrupted item
        keysToRemove.push(key);
        corruptedCount++;
      }
    }

    keysToRemove.forEach(key => this.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Storage cleanup completed: ${keysToRemove.length} items removed (${expiredCount} expired, ${corruptedCount} corrupted)`);
    }
  }

  /**
   * Emergency cleanup when storage is full
   */
  private static performEmergencyCleanup(): void {
    console.warn('Storage full, performing emergency cleanup...');
    
    // Remove all cache items first
    this.clearCache();
    
    // Remove expired items
    this.performCleanup();
    
    // If still full, remove oldest items
    const allItems: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.PREFIX)) continue;
      
      try {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          const item: StorageItem = JSON.parse(itemStr);
          allItems.push({ key, timestamp: item.timestamp });
        }
      } catch (error) {
        // Remove corrupted items immediately
        this.removeItem(key);
      }
    }
    
    // Sort by timestamp and remove oldest 25%
    allItems.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = allItems.slice(0, Math.floor(allItems.length * 0.25));
    
    itemsToRemove.forEach(item => {
      // Don't remove critical auth data
      if (!item.key.includes('token') && !item.key.includes('user')) {
        this.removeItem(item.key);
      }
    });
    
    console.log(`Emergency cleanup: removed ${itemsToRemove.length} oldest items`);
  }



  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    totalItems: number;
    dinoItems: number;
    estimatedSize: number;
  } {
    let totalItems = 0;
    let dinoItems = 0;
    let estimatedSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalItems++;
        const value = localStorage.getItem(key) || '';
        estimatedSize += key.length + value.length;

        if (key.startsWith(this.PREFIX)) {
          dinoItems++;
        }
      }
    }

    return {
      totalItems,
      dinoItems,
      estimatedSize,
    };
  }

  /**
   * Migrate data from old storage keys to new ones
   */
  private static migrateOldStorageKeys(): void {
    try {
      // Migration mapping: old key -> new key
      const migrations = [
        { old: 'dino_auth_token', new: this.KEYS.TOKEN },
        { old: 'dino_user_profile', new: this.KEYS.USER },
        { old: 'dino_user_permissions', new: this.KEYS.PERMISSIONS },
        { old: 'dino_theme_preference', new: this.KEYS.THEME },
      ];

      let migrated = 0;
      
      migrations.forEach(({ old, new: newKey }) => {
        const oldData = localStorage.getItem(old);
        if (oldData && !localStorage.getItem(newKey)) {
          // Only migrate if new key doesn't exist
          localStorage.setItem(newKey, oldData);
          localStorage.removeItem(old);
          migrated++;
          console.log(`✅ Migrated storage key: ${old} -> ${newKey}`);
        }
      });

      if (migrated > 0) {
        console.log(`🔄 Storage migration completed: ${migrated} keys migrated`);
      }
    } catch (error) {
      console.warn('⚠️ Storage migration failed:', error);
    }
  }

  /**
   * Initialize storage manager
   */
  static initialize(): void {
    // Migrate old storage keys first
    this.migrateOldStorageKeys();
    
    // Perform initial cleanup
    this.performCleanup();
    
    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);

    console.log('StorageManager initialized');
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  StorageManager.initialize();
}

export default StorageManager;