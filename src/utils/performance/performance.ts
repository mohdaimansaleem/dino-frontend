/**
 * Performance monitoring and optimization utilities
 */

import { logger } from '../logger';

// Performance metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this.recordPaintMetrics(entry);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.recordMetric('lcp', entry.startTime);
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            this.recordMetric('fid', (entry as any).processingStart - entry.startTime);
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

    } catch (error) {
      logger.warn('Failed to initialize performance observers:', error);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connect': entry.connectEnd - entry.connectStart,
      'ssl-handshake': entry.connectEnd - entry.secureConnectionStart,
      'ttfb': entry.responseStart - entry.requestStart,
      'download': entry.responseEnd - entry.responseStart,
      'dom-parse': entry.domContentLoadedEventStart - entry.responseEnd,
      'resource-load': entry.loadEventStart - entry.domContentLoadedEventEnd,
      'total-load': entry.loadEventEnd - entry.fetchStart,
    };

    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        this.recordMetric(key, value);
      }
    });
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric(`resource-${resourceType}`, duration);
    
    // Track slow resources
    if (duration > 1000) {
      logger.warn(`Slow resource loading: ${entry.name} (${duration}ms)`);
    }
  }

  private recordPaintMetrics(entry: PerformanceEntry): void {
    this.recordMetric(entry.name.replace('-', '_'), entry.startTime);
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

// Bundle size analysis
export const analyzeBundleSize = (): void => {
  if (typeof window === 'undefined') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const resources = [...scripts, ...styles].map(element => {
    const src = element.getAttribute('src') || element.getAttribute('href');
    return src ? new URL(src, window.location.href).href : null;
  }).filter(Boolean);

  resources.forEach(async (url) => {
    try {
      const response = await fetch(url!, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      if (size) {
        const sizeKB = parseInt(size) / 1024;
        logger.info(`Resource size: ${url} (${sizeKB.toFixed(2)}KB)`);
        
        if (sizeKB > 500) {
          logger.warn(`Large resource detected: ${url} (${sizeKB.toFixed(2)}KB)`);
        }
      }
    } catch (error) {
      // Silently ignore CORS errors
    }
  });
};

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return;
  }

  const memory = (performance as any).memory;
  const memoryInfo = {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };

  logger.info('Memory usage:', memoryInfo);

  // Warn if memory usage is high
  if (memoryInfo.used > memoryInfo.limit * 0.8) {
    logger.warn('High memory usage detected:', memoryInfo);
  }
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const monitor = PerformanceMonitor.getInstance();
    
    // Log performance metrics every 30 seconds
    setInterval(() => {
      const metrics = monitor.getMetrics();
      if (Object.keys(metrics).length > 0) {
        logger.info('Performance metrics:', metrics);
      }
    }, 30000);

    // Monitor memory usage every minute
    setInterval(monitorMemoryUsage, 60000);
    
    // Analyze bundle size on load
    if (document.readyState === 'complete') {
      analyzeBundleSize();
    } else {
      window.addEventListener('load', analyzeBundleSize);
    }
  }
};

const performanceUtils = {
  PerformanceMonitor,
  analyzeBundleSize,
  monitorMemoryUsage,
  debounce,
  throttle,
  initializePerformanceMonitoring,
};

export default performanceUtils;