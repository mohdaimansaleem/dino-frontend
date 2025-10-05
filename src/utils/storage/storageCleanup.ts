/**
 * Storage Cleanup Utility
 * Removes redundant storage items and migrates to new format
 */

import StorageManager from './storageManager';

class StorageCleanup {
  /**
   * Remove redundant token expiry storage
   * JWT tokens already contain expiry information in their payload
   */
  static removeRedundantTokenExpiry(): void {
    try {
      // Remove the redundant dino_token_expiry item
      StorageManager.removeItem('dino_token_expiry');
      console.log('✅ Removed redundant dino_token_expiry from storage');
    } catch (error) {
      console.warn('⚠️ Failed to remove dino_token_expiry:', error);
    }
  }

  /**
   * Remove activity tracking storage
   * Activity tracking has been removed from the app
   */
  static removeActivityTracking(): void {
    try {
      // Remove the dino_last_activity item
      if (localStorage.getItem('dino_last_activity')) {
        localStorage.removeItem('dino_last_activity');
        console.log('✅ Removed dino_last_activity from storage');
      }
    } catch (error) {
      console.warn('⚠️ Failed to remove dino_last_activity:', error);
    }
  }

  /**
   * Remove all cache storage entries
   * Caching has been disabled to prevent localStorage usage
   */
  static removeCacheStorage(): void {
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removed cache storage: ${key}`);
      });
      if (cacheKeys.length > 0) {
        console.log(`✅ Removed ${cacheKeys.length} cache entries from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to remove cache storage:', error);
    }
  }

  /**
   * Clean up any other legacy storage items
   */
  static cleanupLegacyItems(): void {
    const legacyKeys = [
      'dino_token_expiry', // Redundant - JWT contains expiry
      'dino_last_activity', // Removed - unnecessary activity tracking
      'sidebarCollapsed', // Moved to React state
      'dino_sidebar_collapsed', // Moved to React state
      'dinoAvatar', // Moved to React Context (session-based)
      'dinoName', // Moved to React Context (session-based)
      'auth_token_expiry', // Old naming convention
      'token_expiry', // Generic naming
    ];

    legacyKeys.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`✅ Removed legacy storage item: ${key}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to remove legacy item ${key}:`, error);
      }
    });

    // Remove all cache entries with dino_cache_ prefix
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removed cache storage item: ${key}`);
      });
    } catch (error) {
      console.warn('⚠️ Failed to remove cache items:', error);
    }

    // Remove workspace venue cache entries
    try {
      const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
      workspaceVenueKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removed workspace venue cache: ${key}`);
      });
    } catch (error) {
      console.warn('⚠️ Failed to remove workspace venue cache:', error);
    }
  }

  /**
   * Perform complete storage cleanup
   */
  static performCleanup(): void {
    console.log('🧹 Starting storage cleanup...');
    this.removeRedundantTokenExpiry();
    this.removeActivityTracking();
    this.removeCacheStorage();
    this.cleanupLegacyItems();
    console.log('✅ Storage cleanup completed');
  }

  /**
   * Get current storage usage info
   */
  static getStorageInfo(): {
    totalItems: number;
    dinoItems: number;
    storageSize: number;
    items: string[];
  } {
    const items: string[] = [];
    let dinoItems = 0;
    let storageSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items.push(key);
        if (key.startsWith('dino_')) {
          dinoItems++;
        }
        const value = localStorage.getItem(key);
        if (value) {
          storageSize += key.length + value.length;
        }
      }
    }

    return {
      totalItems: items.length,
      dinoItems,
      storageSize,
      items: items.sort()
    };
  }

  /**
   * Debug storage contents
   */
  static debugStorage(): void {
    const info = this.getStorageInfo();
    
    console.group('🔍 Storage Debug Info');
    console.log('Total Items:', info.totalItems);
    console.log('Dino Items:', info.dinoItems);
    console.log('Storage Size (chars):', info.storageSize);
    console.log('All Items:', info.items);
    
    // Show dino-specific items
    const dinoItems = info.items.filter(key => key.startsWith('dino_'));
    if (dinoItems.length > 0) {
      console.log('Dino Storage Items:');
      dinoItems.forEach(key => {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        console.log(`  ${key}: ${size} chars`);
      });
    }
    console.groupEnd();
  }
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  // Force immediate removal of activity tracking, avatar storage, and all cache entries
  try {
    if (localStorage.getItem('dino_last_activity')) {
      localStorage.removeItem('dino_last_activity');
      console.log('🗑️ Immediately removed dino_last_activity');
    }
    if (localStorage.getItem('dinoAvatar')) {
      localStorage.removeItem('dinoAvatar');
      console.log('🗑️ Immediately removed dinoAvatar');
    }
    if (localStorage.getItem('dinoName')) {
      localStorage.removeItem('dinoName');
      console.log('🗑️ Immediately removed dinoName');
    }
    
    // Remove all dino_cache_ entries
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Immediately removed cache entry: ${key}`);
    });
    
    // Remove workspace venue cache entries
    const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
    workspaceVenueKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Immediately removed workspace venue cache: ${key}`);
    });
  } catch (error) {
    console.warn('⚠️ Failed immediate cleanup:', error);
  }
  
  // Run full cleanup immediately and after a short delay
  StorageCleanup.performCleanup();
  setTimeout(() => {
    StorageCleanup.performCleanup();
  }, 1000);
}

export default StorageCleanup;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).StorageCleanup = StorageCleanup;
  
  // Add a global function to force cleanup
  (window as any).forceStorageCleanup = () => {
    StorageCleanup.performCleanup();
    console.log('🧹 Manual storage cleanup completed');
  };
  
  // Add a function to specifically remove activity tracking
  (window as any).removeActivityTracking = () => {
    StorageCleanup.removeActivityTracking();
    console.log('🗑️ Activity tracking removed');
  };
}