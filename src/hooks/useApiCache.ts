import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache, userCache } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface UseApiCacheOptions {
  ttl?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheKey?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseApiCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  invalidate: () => void;
  isStale: boolean;
  lastFetched: Date | null;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Custom hook for intelligent API caching and data fetching
 * Reduces redundant API calls and provides optimized data management
 */
export function useApiCache<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiCacheOptions = {}
): UseApiCacheResult<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    staleTime = 30 * 1000, // 30 seconds
    cacheKey,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Generate cache key based on function name and dependencies
  const generatedCacheKey = cacheKey || `api_${fetchFunction.name}_${JSON.stringify(dependencies)}`;

  // Check if data is stale
  const checkStaleData = useCallback(() => {
    if (lastFetched) {
      const isDataStale = Date.now() - lastFetched.getTime() > staleTime;
      setIsStale(isDataStale);
      return isDataStale;
    }
    return true;
  }, [lastFetched, staleTime]);

  // Fetch data with caching and deduplication
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !mountedRef.current) return;

    // Check if there's already a pending request for this key
    if (pendingRequests.has(generatedCacheKey) && !forceRefresh) {
      try {
        const result = await pendingRequests.get(generatedCacheKey);
        if (mountedRef.current) {
          setData(result);
          setLastFetched(new Date());
          setIsStale(false);
        }
        return;
      } catch (err) {
        // Handle error from pending request
      }
    }

    // Try to get from cache first (if not forcing refresh)
    if (!forceRefresh) {
      const cachedData = apiCache.get<T>(generatedCacheKey);
      if (cachedData !== null && mountedRef.current) {
        setData(cachedData);
        setLastFetched(new Date());
        setIsStale(checkStaleData());
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Create the fetch promise
    const fetchPromise = (async () => {
      let lastError: any;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await fetchFunction();
          
          // Cache the result
          apiCache.set(generatedCacheKey, result, ttl);
          
          if (mountedRef.current) {
            setData(result);
            setLastFetched(new Date());
            setIsStale(false);
            setError(null);
            retryCountRef.current = 0;
            
            if (onSuccess) {
              onSuccess(result);
            }
          }
          
          return result;
        } catch (err: unknown) {
          lastError = err;
          
          // Don't retry on certain errors
          const error = err as any;
          if (error.response?.status === 401 || error.response?.status === 403) {
            break;
          }
          
          // Wait before retry (except on last attempt)
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }
      
      throw lastError;
    })();

    // Store the promise for deduplication
    pendingRequests.set(generatedCacheKey, fetchPromise);

    try {
      await fetchPromise;
    } catch (err: unknown) {
      if (mountedRef.current) {
        setError(err);
        if (onError) {
          onError(err);
        }
        
        // Log error for debugging
        logger.error('API Cache fetch error', {
          cacheKey: generatedCacheKey,
          error: err,
          retryCount: retryCountRef.current,
        });
      }
    } finally {
      // Clean up pending request
      pendingRequests.delete(generatedCacheKey);
      
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    generatedCacheKey,
    fetchFunction,
    ttl,
    retryCount,
    retryDelay,
    onSuccess,
    onError,
    checkStaleData,
  ]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    apiCache.delete(generatedCacheKey);
    setData(null);
    setLastFetched(null);
    setIsStale(true);
  }, [generatedCacheKey]);

  // Initial fetch on mount
  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchData();
    }
  }, [fetchData, refetchOnMount, enabled]);

  // Refetch when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetchData, ...dependencies]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (checkStaleData()) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData, checkStaleData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check for stale data periodically
  useEffect(() => {
    const interval = setInterval(checkStaleData, staleTime);
    return () => clearInterval(interval);
  }, [checkStaleData, staleTime]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale,
    lastFetched,
  };
}

/**
 * Hook for caching user-specific data
 */
export function useUserCache<T>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  dependencies: any[] = [],
  options: UseApiCacheOptions = {}
): UseApiCacheResult<T> {
  const { user } = useAuth();
  
  const userSpecificKey = user ? `${cacheKey}_${user.id}` : cacheKey;
  
  return useApiCache(
    fetchFunction,
    [user?.id, ...dependencies],
    {
      ...options,
      cacheKey: userSpecificKey,
      ttl: options.ttl || 10 * 60 * 1000, // 10 minutes for user data
    }
  );
}

/**
 * Hook for caching venue-specific data
 */
export function useVenueCache<T>(
  fetchFunction: () => Promise<T>,
  venueId: string | undefined,
  cacheKey: string,
  dependencies: any[] = [],
  options: UseApiCacheOptions = {}
): UseApiCacheResult<T> {
  const venueSpecificKey = venueId ? `${cacheKey}_${venueId}` : cacheKey;
  
  return useApiCache(
    fetchFunction,
    [venueId, ...dependencies],
    {
      ...options,
      cacheKey: venueSpecificKey,
      enabled: options.enabled !== false && !!venueId,
    }
  );
}

/**
 * Hook for workspace-specific data caching
 */
export function useWorkspaceCache<T>(
  fetchFunction: () => Promise<T>,
  workspaceId: string | undefined,
  cacheKey: string,
  dependencies: any[] = [],
  options: UseApiCacheOptions = {}
): UseApiCacheResult<T> {
  const workspaceSpecificKey = workspaceId ? `${cacheKey}_${workspaceId}` : cacheKey;
  
  return useApiCache(
    fetchFunction,
    [workspaceId, ...dependencies],
    {
      ...options,
      cacheKey: workspaceSpecificKey,
      enabled: options.enabled !== false && !!workspaceId,
    }
  );
}

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern: (pattern: string) => {
    apiCache.invalidatePattern(pattern);
    userCache.invalidatePattern(pattern);
  },

  /**
   * Clear all cache
   */
  clearAll: () => {
    apiCache.clear();
    userCache.clear();
  },

  /**
   * Get cache statistics
   */
  getStats: () => ({
    api: apiCache.getStats(),
    user: userCache.getStats(),
  }),

  /**
   * Preload critical data
   */
  preloadCriticalData: async (userId: string, venueId?: string) => {
    // Implementation would depend on your specific needs
    console.log('Preloading critical data for user:', userId, 'venue:', venueId);
  },
};

export default useApiCache;