/**
 * Utility to clear workspace venue cache entries
 * This is a one-time cleanup utility to remove any remaining workspace venue cache entries
 */

export function clearWorkspaceVenueCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find all localStorage keys that match the workspace_venues pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('workspace_venues_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all matching keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Removed workspace venue cache entry: ${key}`);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`✅ Cleared ${keysToRemove.length} workspace venue cache entries`);
    } else {
      console.log('ℹ️ No workspace venue cache entries found to clear');
    }
  } catch (error) {
    console.error('❌ Error clearing workspace venue cache:', error);
  }
}

export default clearWorkspaceVenueCache;