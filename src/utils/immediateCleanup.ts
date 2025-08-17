/**
 * Immediate cleanup utility to remove workspace venue cache entries
 * This runs as soon as the module is imported to ensure cleanup happens before any cache operations
 */

// Immediate cleanup function
function immediateCleanup() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    console.log('🧹 Starting immediate workspace venue cache cleanup...');
    
    const keysToRemove: string[] = [];
    
    // Find all localStorage keys that match problematic patterns
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Remove workspace venue cache entries
        if (key.startsWith('workspace_venues_')) {
          keysToRemove.push(key);
        }
        // Remove any other cache entries that might be causing issues
        if (key.startsWith('dino_cache_')) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove all problematic keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Immediately removed: ${key}`);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`✅ Immediate cleanup completed: removed ${keysToRemove.length} cache entries`);
    } else {
      console.log('ℹ️ No cache entries found to clean up');
    }
  } catch (error) {
    console.error('❌ Error during immediate cleanup:', error);
  }
}

// Run cleanup immediately when this module is imported
immediateCleanup();

// Also export the function for manual use
export { immediateCleanup };

// Make cleanup available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).forceWorkspaceVenueCleanup = () => {
    immediateCleanup();
    console.log('🧹 Manual workspace venue cleanup completed');
  };
  
  (window as any).debugLocalStorage = () => {
    const allKeys = Object.keys(localStorage);
    const workspaceVenueKeys = allKeys.filter(key => key.startsWith('workspace_venues_'));
    const cacheKeys = allKeys.filter(key => key.startsWith('dino_cache_'));
    
    console.group('🔍 localStorage Debug');
    console.log('Total keys:', allKeys.length);
    console.log('All keys:', allKeys);
    console.log('Workspace venue keys:', workspaceVenueKeys);
    console.log('Cache keys:', cacheKeys);
    console.groupEnd();
    
    return { allKeys, workspaceVenueKeys, cacheKeys };
  };
}

// Set up aggressive cleanup for the first minute
if (typeof window !== 'undefined') {
  // Aggressive cleanup every second for the first minute
  const aggressiveIntervalId = setInterval(() => {
    const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
    const allProblematicKeys = [...workspaceVenueKeys, ...cacheKeys];
    
    if (allProblematicKeys.length > 0) {
      console.log('🚨 AGGRESSIVE CLEANUP: Found cache entries, removing immediately...');
      allProblematicKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ AGGRESSIVE: Removed ${key}`);
      });
    }
  }, 1000); // Check every second

  // Stop aggressive cleanup after 1 minute
  setTimeout(() => {
    clearInterval(aggressiveIntervalId);
    console.log('🛑 Stopped aggressive cache cleanup');
  }, 60000);

  // Regular cleanup every 5 seconds for 5 minutes
  const intervalId = setInterval(() => {
    const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
    if (workspaceVenueKeys.length > 0) {
      console.log('🚨 Found new workspace venue cache entries, cleaning up...');
      workspaceVenueKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      });
    }
  }, 5000); // Check every 5 seconds

  // Clear the interval after 5 minutes to avoid running forever
  setTimeout(() => {
    clearInterval(intervalId);
    console.log('🛑 Stopped periodic cache cleanup');
  }, 300000);
}

export default immediateCleanup;