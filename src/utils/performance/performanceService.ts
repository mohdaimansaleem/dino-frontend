/**
 * Performance Monitoring Service
 * Tracks and optimizes frontend performance metrics
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'navigation' | 'api' | 'render' | 'user' | 'resource';
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  api_response_time: number;
  component_render_time: number;
  page_load_time: number;
  memory_usage: number;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    total_metrics: number;
    avg_api_response: number;
    avg_render_time: number;
    memory_usage: number;
    performance_score: number;
  };
  issues: string[];
  recommendations: string[];
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    api_response_time: 2000, // 2 seconds
    component_render_time: 100, // 100ms
    page_load_time: 3000, // 3 seconds
    memory_usage: 50 * 1024 * 1024, // 50MB
  };

  private isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('dino_performance_monitoring') === 'true';

  constructor() {
    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
      this.startMemoryMonitoring();
      this.trackPageLoad();
    }
  }

  private initializeObservers(): void {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.recordResourceMetric(entry as PerformanceResourceTiming);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }

      // Measure observer for custom metrics
      try {
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordCustomMetric(entry);
            }
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);
      } catch (error) {
        console.warn('Measure observer not supported:', error);
      }
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'dns_lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        category: 'navigation' as const
      },
      {
        name: 'tcp_connection',
        value: entry.connectEnd - entry.connectStart,
        category: 'navigation' as const
      },
      {
        name: 'request_response',
        value: entry.responseEnd - entry.requestStart,
        category: 'navigation' as const
      },
      {
        name: 'dom_processing',
        value: entry.domComplete - entry.domContentLoadedEventStart,
        category: 'navigation' as const
      },
      {
        name: 'page_load_complete',
        value: entry.loadEventEnd - entry.fetchStart,
        category: 'navigation' as const
      }
    ];

    metrics.forEach(metric => this.addMetric(metric.name, metric.value, metric.category));
  }

  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    // Only track significant resources
    if (entry.transferSize > 10000 || entry.duration > 100) {
      this.addMetric(
        'resource_load',
        entry.duration,
        'resource',
        {
          name: entry.name,
          size: entry.transferSize,
          type: this.getResourceType(entry.name)
        }
      );
    }
  }

  private recordCustomMetric(entry: PerformanceEntry): void {
    this.addMetric(
      entry.name,
      entry.duration,
      'user',
      { entryType: entry.entryType }
    );
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.addMetric(
          'memory_usage',
          memory.usedJSHeapSize,
          'resource',
          {
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        );
      }, 30000); // Every 30 seconds
    }
  }

  private trackPageLoad(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.now();
        this.addMetric('initial_page_load', loadTime, 'navigation');
      }, 0);
    });
  }

  // Public API
  addMetric(
    name: string,
    value: number,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for performance issues
    this.checkThresholds(metric);
  }

  trackApiCall(url: string, duration: number, success: boolean): void {
    this.addMetric(
      'api_call',
      duration,
      'api',
      { url, success, method: 'unknown' }
    );
  }

  trackComponentRender(componentName: string, duration: number): void {
    this.addMetric(
      'component_render',
      duration,
      'render',
      { component: componentName }
    );
  }

  trackUserInteraction(action: string, duration?: number): void {
    this.addMetric(
      'user_interaction',
      duration || 0,
      'user',
      { action }
    );
  }

  // Performance measurement utilities
  startMeasure(name: string): void {
    if (!this.isEnabled) return;
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    if (!this.isEnabled) return 0;
    
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      return measure ? measure.duration : 0;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return 0;
    }
  }

  // Component performance decorator
  measureComponent<T extends React.ComponentType<any>>(
    Component: T,
    displayName?: string
  ): React.ComponentType<any> {
    if (!this.isEnabled) return Component;

    const componentName = displayName || Component.displayName || Component.name || 'Unknown';
    
    return React.memo(React.forwardRef<any, any>((props, ref) => {
      const measureName = `component-${componentName}`;
      
      React.useEffect(() => {
        this.startMeasure(measureName);
        return () => {
          const duration = this.endMeasure(measureName);
          this.trackComponentRender(componentName, duration);
        };
      });

      return React.createElement(Component, { ...props, ref });
    }));
  }

  // This method is now moved to the hook below

  private checkThresholds(metric: PerformanceMetric): void {
    let threshold: number | undefined;
    
    switch (metric.name) {
      case 'api_call':
        threshold = this.thresholds.api_response_time;
        break;
      case 'component_render':
        threshold = this.thresholds.component_render_time;
        break;
      case 'page_load_complete':
        threshold = this.thresholds.page_load_time;
        break;
      case 'memory_usage':
        threshold = this.thresholds.memory_usage;
        break;
    }

    if (threshold && metric.value > threshold) {
      console.warn(
        `Performance threshold exceeded: ${metric.name} took ${metric.value}ms (threshold: ${threshold}ms)`,
        metric
      );
    }
  }

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(m => m.category === category);
    }
    return [...this.metrics];
  }

  getReport(): PerformanceReport {
    const apiMetrics = this.getMetrics('api');
    const renderMetrics = this.getMetrics('render');
    const memoryMetrics = this.getMetrics('resource').filter(m => m.name === 'memory_usage');

    const avgApiResponse = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    const avgRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0;

    const currentMemory = memoryMetrics.length > 0 
      ? memoryMetrics[memoryMetrics.length - 1].value 
      : 0;

    // Calculate performance score (0-100)
    let score = 100;
    if (avgApiResponse > this.thresholds.api_response_time) score -= 20;
    if (avgRenderTime > this.thresholds.component_render_time) score -= 20;
    if (currentMemory > this.thresholds.memory_usage) score -= 30;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (avgApiResponse > this.thresholds.api_response_time) {
      issues.push(`Slow API responses (avg: ${avgApiResponse.toFixed(2)}ms)`);
      recommendations.push('Consider implementing request caching or optimizing API endpoints');
    }

    if (avgRenderTime > this.thresholds.component_render_time) {
      issues.push(`Slow component renders (avg: ${avgRenderTime.toFixed(2)}ms)`);
      recommendations.push('Consider using React.memo, useMemo, or useCallback for optimization');
    }

    if (currentMemory > this.thresholds.memory_usage) {
      issues.push(`High memory usage (${(currentMemory / 1024 / 1024).toFixed(2)}MB)`);
      recommendations.push('Check for memory leaks and consider lazy loading');
    }

    return {
      metrics: this.metrics,
      summary: {
        total_metrics: this.metrics.length,
        avg_api_response: avgApiResponse,
        avg_render_time: avgRenderTime,
        memory_usage: currentMemory,
        performance_score: Math.max(0, score)
      },
      issues,
      recommendations
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  setThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  enable(): void {
    this.isEnabled = true;
    localStorage.setItem('dino_performance_monitoring', 'true');
    if (typeof window !== 'undefined' && this.observers.length === 0) {
      this.initializeObservers();
      this.startMemoryMonitoring();
    }
  }

  disable(): void {
    this.isEnabled = false;
    localStorage.removeItem('dino_performance_monitoring');
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  destroy(): void {
    this.disable();
    this.clearMetrics();
  }
}

// Create global performance service instance
export const performanceService = new PerformanceService();

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  React.useEffect(() => {
    if (!performanceService['isEnabled']) return;

    const measureName = `render-${componentName}`;
    performanceService.startMeasure(measureName);
    
    return () => {
      const duration = performanceService.endMeasure(measureName);
      performanceService.trackComponentRender(componentName, duration);
    };
  }, [componentName]);

  return {
    trackInteraction: (action: string) => performanceService.trackUserInteraction(action),
    startMeasure: (name: string) => performanceService.startMeasure(name),
    endMeasure: (name: string) => performanceService.endMeasure(name)
  };
};

export default PerformanceService;