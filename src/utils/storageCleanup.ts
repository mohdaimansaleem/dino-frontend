/**
 * Storage Cleanup Utility
 * Removes demo-related and legacy data from localStorage
 */

export class StorageCleanup {
  private static readonly DEMO_KEYS = [
    'demo_',
    'dino_demo_',
    'sample_',
    'test_',
    'mock_',
    'fake_',
    'example_',
  ];

  private static readonly LEGACY_KEYS = [
    'dino_demo_user',
    'dino_demo_venue',
    'dino_demo_workspace',
    'dino_demo_menu',
    'dino_demo_orders',
    'dino_demo_tables',
    'dino_sample_data',
    'dino_test_data',
    'demo_mode',
    'demo_enabled',
    'sample_venue',
    'test_venue',
    'mock_data',
  ];

  /**
   * Remove all demo-related data from localStorage
   */
  static cleanupDemoData(): void {
    try {
      const keysToRemove: string[] = [];
      
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Check if key matches demo patterns
          const isDemoKey = this.DEMO_KEYS.some(pattern => key.includes(pattern));
          const isLegacyKey = this.LEGACY_KEYS.includes(key);
          
          if (isDemoKey || isLegacyKey) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed demo/legacy key: ${key}`);
      });

      if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} demo/legacy storage items`);
      }
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  }

  /**
   * Remove all cache data (useful for fresh start)
   */
  static cleanupCacheData(): void {
    try {
      const cacheKeysToRemove: string[] = [];
      
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dino_cache_')) {
          cacheKeysToRemove.push(key);
        }
      }

      // Remove cache keys
      cacheKeysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      if (cacheKeysToRemove.length > 0) {
        console.log(`Cleaned up ${cacheKeysToRemove.length} cache items`);
      }
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  /**
   * Validate and clean up corrupted storage data
   */
  static validateAndCleanStorage(): void {
    try {
      const corruptedKeys: string[] = [];
      
      // Check each localStorage item for corruption
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dino_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse JSON values
              if (value.startsWith('{') || value.startsWith('[')) {
                JSON.parse(value);
              }
            }
          } catch (parseError) {
            corruptedKeys.push(key);
          }
        }
      }

      // Remove corrupted keys
      corruptedKeys.forEach(key => {
        localStorage.removeItem(key);
        console.warn(`Removed corrupted storage key: ${key}`);
      });

      if (corruptedKeys.length > 0) {
        console.log(`Cleaned up ${corruptedKeys.length} corrupted storage items`);
      }
    } catch (error) {
      console.error('Error during storage validation:', error);
    }
  }

  /**
   * Complete storage cleanup - removes demo data, cache, and validates remaining data
   */
  static performCompleteCleanup(): void {
    console.log('Starting complete storage cleanup...');
    
    this.cleanupDemoData();
    this.cleanupCacheData();
    this.validateAndCleanStorage();
    
    console.log('Storage cleanup completed');
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    totalKeys: number;
    dinoKeys: number;
    cacheKeys: number;
    estimatedSize: number;
  } {
    let totalKeys = 0;
    let dinoKeys = 0;
    let cacheKeys = 0;
    let estimatedSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalKeys++;
          const value = localStorage.getItem(key) || '';
          estimatedSize += key.length + value.length;

          if (key.startsWith('dino_')) {
            dinoKeys++;
            if (key.startsWith('dino_cache_')) {
              cacheKeys++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting storage stats:', error);
    }

    return {
      totalKeys,
      dinoKeys,
      cacheKeys,
      estimatedSize,
    };
  }
}

// Auto-cleanup on module load (runs once when app starts)
if (typeof window !== 'undefined') {
  // Run cleanup on app initialization
  StorageCleanup.performCompleteCleanup();
}

export default StorageCleanup;