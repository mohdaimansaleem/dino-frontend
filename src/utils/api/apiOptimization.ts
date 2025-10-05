/**
 * API Optimization Utilities
 * Provides utilities for request deduplication, batching, and performance optimization
 */

import { apiCache } from '../storage';
import { logger } from '../logger';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Request batching queue
interface BatchRequest {
  key: string;
  resolver: (data: any) => void;
  rejecter: (error: any) => void;
  timestamp: number;
}

const batchQueue = new Map<string, BatchRequest[]>();
const BATCH_DELAY = 50; // 50ms batching window

/**
 * Deduplicate identical API requests
 */
export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request
  if (pendingRequests.has(key)) {
    logger.debug('Request deduplicated', { key });
    return pendingRequests.get(key) as Promise<T>;
  }

  // Create new request
  const request = requestFn()
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

/**
 * Batch multiple requests together
 */
export function batchRequest<T>(
  batchKey: string,
  requestKey: string,
  batchFn: (keys: string[]) => Promise<Record<string, T>>
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Add to batch queue
    if (!batchQueue.has(batchKey)) {
      batchQueue.set(batchKey, []);
    }

    const batch = batchQueue.get(batchKey)!;
    batch.push({
      key: requestKey,
      resolver: resolve,
      rejecter: reject,
      timestamp: Date.now(),
    });

    // Schedule batch execution
    setTimeout(() => {
      executeBatch(batchKey, batchFn);
    }, BATCH_DELAY);
  });
}

/**
 * Execute batched requests
 */
async function executeBatch<T>(
  batchKey: string,
  batchFn: (keys: string[]) => Promise<Record<string, T>>
) {
  const batch = batchQueue.get(batchKey);
  if (!batch || batch.length === 0) return;

  // Clear the batch
  batchQueue.delete(batchKey);

  try {
    const keys = batch.map(req => req.key);
    const results = await batchFn(keys);

    // Resolve individual requests
    batch.forEach(req => {
      if (results[req.key] !== undefined) {
        req.resolver(results[req.key]);
      } else {
        req.rejecter(new Error(`No result for key: ${req.key}`));
      }
    });

    logger.debug('Batch request executed', { 
      batchKey, 
      requestCount: batch.length,
      resultCount: Object.keys(results).length 
    });
  } catch (error) {
    // Reject all requests in batch
    batch.forEach(req => req.rejecter(error));
    logger.error('Batch request failed', { batchKey, error });
  }
}

/**
 * Optimized fetch with caching and deduplication
 */
export async function optimizedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    useCache?: boolean;
    deduplicate?: boolean;
  } = {}
): Promise<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    useCache = true,
    deduplicate = true,
  } = options;

  // Try cache first
  if (useCache) {
    const cached = apiCache.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }
  }

  // Create fetch function
  const actualFetch = async () => {
    logger.debug('Cache miss, fetching', { key });
    const result = await fetchFn();
    
    // Cache the result
    if (useCache) {
      apiCache.set(key, result, ttl);
    }
    
    return result;
  };

  // Use deduplication if enabled
  if (deduplicate) {
    return deduplicateRequest(key, actualFetch);
  }

  return actualFetch();
}

/**
 * Preload data in the background
 */
export function preloadData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): void {
  // Only preload if not already cached
  if (!apiCache.has(key)) {
    optimizedFetch(key, fetchFn, { ttl, useCache: true, deduplicate: true })
      .catch(error => {
        logger.warn('Preload failed', { key, error });
      });
  }
}

/**
 * Invalidate related cache entries
 */
export function invalidateRelatedCache(patterns: string[]): void {
  patterns.forEach(pattern => {
    apiCache.invalidatePattern(pattern);
    logger.debug('Cache invalidated', { pattern });
  });
}

/**
 * Smart cache warming for critical data
 */
export async function warmCache(
  warmingConfig: Array<{
    key: string;
    fetchFn: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
    ttl?: number;
  }>
): Promise<void> {
  // Sort by priority
  const sortedConfig = warmingConfig.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Execute high priority immediately
  const highPriority = sortedConfig.filter(config => config.priority === 'high');
  await Promise.allSettled(
    highPriority.map(config => 
      preloadData(config.key, config.fetchFn, config.ttl)
    )
  );

  // Execute medium priority with slight delay
  const mediumPriority = sortedConfig.filter(config => config.priority === 'medium');
  setTimeout(() => {
    mediumPriority.forEach(config => 
      preloadData(config.key, config.fetchFn, config.ttl)
    );
  }, 100);

  // Execute low priority with longer delay
  const lowPriority = sortedConfig.filter(config => config.priority === 'low');
  setTimeout(() => {
    lowPriority.forEach(config => 
      preloadData(config.key, config.fetchFn, config.ttl)
    );
  }, 500);

  logger.info('Cache warming initiated', {
    high: highPriority.length,
    medium: mediumPriority.length,
    low: lowPriority.length,
  });
}

/**
 * Request retry with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // Don't retry on client errors (4xx) except 429 (rate limit)
      const status = error?.response?.status;
      return !status || status >= 500 || status === 429;
    },
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry if we shouldn't or if it's the last attempt
      if (!shouldRetry(error) || attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      logger.warn('Request failed, retrying', {
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Monitor API performance
 */
export class ApiPerformanceMonitor {
  private static metrics = new Map<string, {
    totalRequests: number;
    totalTime: number;
    errors: number;
    cacheHits: number;
    lastRequest: number;
  }>();

  static startRequest(key: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.recordMetric(key, duration, false, false);
    };
  }

  static recordCacheHit(key: string): void {
    this.recordMetric(key, 0, false, true);
  }

  static recordError(key: string): void {
    this.recordMetric(key, 0, true, false);
  }

  private static recordMetric(
    key: string, 
    duration: number, 
    isError: boolean, 
    isCacheHit: boolean
  ): void {
    const existing = this.metrics.get(key) || {
      totalRequests: 0,
      totalTime: 0,
      errors: 0,
      cacheHits: 0,
      lastRequest: 0,
    };

    existing.totalRequests++;
    existing.totalTime += duration;
    existing.lastRequest = Date.now();

    if (isError) existing.errors++;
    if (isCacheHit) existing.cacheHits++;

    this.metrics.set(key, existing);
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((metrics, key) => {
      result[key] = {
        ...metrics,
        averageTime: metrics.totalRequests > 0 ? metrics.totalTime / metrics.totalRequests : 0,
        errorRate: metrics.totalRequests > 0 ? metrics.errors / metrics.totalRequests : 0,
        cacheHitRate: metrics.totalRequests > 0 ? metrics.cacheHits / metrics.totalRequests : 0,
      };
    });

    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}

/**
 * Utility to create optimized API hooks
 */
export function createOptimizedApiHook<T>(
  baseKey: string,
  fetchFn: (...args: any[]) => Promise<T>
) {
  return function useOptimizedApi(...args: any[]) {
    const key = `${baseKey}_${JSON.stringify(args)}`;
    
    return optimizedFetch(key, () => fetchFn(...args), {
      ttl: 5 * 60 * 1000,
      useCache: true,
      deduplicate: true,
    });
  };
}

export default {
  deduplicateRequest,
  batchRequest,
  optimizedFetch,
  preloadData,
  invalidateRelatedCache,
  warmCache,
  retryRequest,
  ApiPerformanceMonitor,
  createOptimizedApiHook,
};