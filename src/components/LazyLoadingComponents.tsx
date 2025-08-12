/**
 * Enhanced Lazy Loading Components
 * Optimized lazy loading with preloading, error boundaries, and performance monitoring
 */

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Box, CircularProgress, Typography, Button, Skeleton } from '@mui/material';
import { performanceService } from '../services/performanceService';

// Simple Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error, retry: () => void) => React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, () => {
        this.setState({ hasError: false, error: undefined });
      });
    }

    return this.props.children;
  }
}

interface LazyComponentConfig {
  preload?: boolean;
  retryable?: boolean;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  skeleton?: React.ComponentType;
  timeout?: number;
}

interface LazyLoadedComponent<T = {}> {
  component: LazyExoticComponent<ComponentType<T>>;
  preload: () => Promise<void>;
  isLoaded: () => boolean;
}

// Default loading component
const DefaultLoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Default error fallback
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
    p={3}
  >
    <Typography variant="h6" color="error" gutterBottom>
      Failed to load component
    </Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      {error.message}
    </Typography>
    <Button variant="outlined" onClick={retry} size="small">
      Retry
    </Button>
  </Box>
);

// Skeleton components for different layouts
export const PageSkeleton: React.FC = () => (
  <Box p={3}>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
    <Box display="flex" gap={2} mb={3}>
      <Skeleton variant="rectangular" width={120} height={36} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </Box>
    <Skeleton variant="rectangular" width="100%" height={300} />
  </Box>
);

export const CardSkeleton: React.FC = () => (
  <Box p={2}>
    <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
    <Box display="flex" gap={1}>
      <Skeleton variant="rectangular" width={60} height={24} />
      <Skeleton variant="rectangular" width={80} height={24} />
    </Box>
  </Box>
);

export const ListSkeleton: React.FC = () => (
  <Box>
    {[1, 2, 3, 4, 5].map((i) => (
      <Box key={i} display="flex" alignItems="center" gap={2} p={2} borderBottom="1px solid #eee">
        <Skeleton variant="circular" width={40} height={40} />
        <Box flex={1}>
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Skeleton variant="rectangular" width={80} height={32} />
      </Box>
    ))}
  </Box>
);

class LazyComponentManager {
  private loadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  createLazyComponent<T = {}>(
    importFn: () => Promise<{ default: ComponentType<T> }>,
    name: string,
    config: LazyComponentConfig = {}
  ): LazyLoadedComponent<T> {
    const {
      preload = false,
      retryable = true,
      fallback = DefaultLoadingFallback,
      errorFallback = DefaultErrorFallback,
      skeleton,
      timeout = 10000
    } = config;

    // Create lazy component with timeout
    const lazyComponent = lazy(() => {
      const startTime = Date.now();
      
      return Promise.race([
        importFn().then(module => {
          const loadTime = Date.now() - startTime;
          try {
            performanceService.addMetric(
              'component_lazy_load',
              loadTime,
              'render',
              { component: name }
            );
          } catch (error) {
            // Ignore performance service errors
            console.warn('Performance service error:', error);
          }
          this.loadedComponents.add(name);
          return module;
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Component ${name} load timeout`)), timeout)
        )
      ]);
    });

    // Preload function
    const preloadFn = async (): Promise<void> => {
      if (this.loadedComponents.has(name)) {
        return;
      }

      if (this.preloadPromises.has(name)) {
        return this.preloadPromises.get(name);
      }

      const preloadPromise = importFn()
        .then(() => {
          this.loadedComponents.add(name);
          console.log(`Preloaded component: ${name}`);
        })
        .catch(error => {
          console.warn(`Failed to preload component ${name}:`, error);
          throw error;
        });

      this.preloadPromises.set(name, preloadPromise);
      return preloadPromise;
    };

    // Auto-preload if configured
    if (preload) {
      // Delay preloading to not block initial render
      setTimeout(() => {
        preloadFn().catch(() => {
          // Ignore preload errors
        });
      }, 100);
    }

    return {
      component: lazyComponent,
      preload: preloadFn,
      isLoaded: () => this.loadedComponents.has(name)
    };
  }

  preloadComponents(names: string[]): Promise<void[]> {
    const preloadPromises = names.map(name => {
      const promise = this.preloadPromises.get(name);
      return promise || Promise.resolve();
    });

    return Promise.allSettled(preloadPromises).then(() => []);
  }

  getLoadedComponents(): string[] {
    return Array.from(this.loadedComponents);
  }

  clearCache(): void {
    this.loadedComponents.clear();
    this.preloadPromises.clear();
  }
}

// Global lazy component manager
export const lazyManager = new LazyComponentManager();

// Enhanced lazy wrapper with error boundary and performance monitoring
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  name?: string;
}> = ({ 
  children, 
  fallback: Fallback = DefaultLoadingFallback, 
  errorFallback: ErrorFallback = DefaultErrorFallback,
  name = 'unknown'
}) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    try {
      performanceService.trackUserInteraction('component_retry', 0);
    } catch (error) {
      // Ignore performance service errors
    }
    setRetryKey(prev => prev + 1);
  }, []);

  return (
    <SimpleErrorBoundary
      key={retryKey}
      fallback={(error: Error, retry: () => void) => (
        <ErrorFallback error={error} retry={handleRetry} />
      )}
    >
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </SimpleErrorBoundary>
  );
};

// Create lazy components for the application
export const LazyComponents = {
  // Admin pages
  AdminDashboard: lazyManager.createLazyComponent(
    () => import('../pages/admin/AdminDashboard'),
    'AdminDashboard',
    { preload: true, skeleton: PageSkeleton }
  ),
  
  WorkspaceManagement: lazyManager.createLazyComponent(
    () => import('../pages/admin/WorkspaceManagement'),
    'WorkspaceManagement',
    { skeleton: PageSkeleton }
  ),
  
  MenuManagement: lazyManager.createLazyComponent(
    () => import('../pages/admin/MenuManagement'),
    'MenuManagement',
    { skeleton: PageSkeleton }
  ),
  
  UserManagement: lazyManager.createLazyComponent(
    () => import('../pages/admin/UserManagement'),
    'UserManagement',
    { skeleton: PageSkeleton }
  ),
  
  OrdersManagement: lazyManager.createLazyComponent(
    () => import('../pages/admin/OrdersManagement'),
    'OrdersManagement',
    { skeleton: PageSkeleton }
  ),
  
  TableManagement: lazyManager.createLazyComponent(
    () => import('../pages/admin/TableManagement'),
    'TableManagement',
    { skeleton: PageSkeleton }
  ),
  
  VenueSettings: lazyManager.createLazyComponent(
    () => import('../pages/admin/VenueSettings'),
    'VenueSettings',
    { skeleton: PageSkeleton }
  ),
  
  UserPermissionsDashboard: lazyManager.createLazyComponent(
    () => import('../pages/admin/UserPermissionsDashboard'),
    'UserPermissionsDashboard',
    { skeleton: PageSkeleton }
  ),

  // Customer pages
  MenuPage: lazyManager.createLazyComponent(
    () => import('../pages/MenuPage'),
    'MenuPage',
    { preload: true, skeleton: PageSkeleton }
  ),
  
  CheckoutPage: lazyManager.createLazyComponent(
    () => import('../pages/CheckoutPage'),
    'CheckoutPage',
    { skeleton: PageSkeleton }
  ),
  
  OrderTrackingPage: lazyManager.createLazyComponent(
    () => import('../pages/OrderTrackingPage'),
    'OrderTrackingPage',
    { skeleton: PageSkeleton }
  ),

  RegistrationPage: lazyManager.createLazyComponent(
    () => import('../pages/RegistrationPage'),
    'RegistrationPage',
    { skeleton: PageSkeleton }
  ),

  // Dashboard components
  RealTimeDashboard: lazyManager.createLazyComponent(
    () => import('../components/dashboards/RealTimeDashboard'),
    'RealTimeDashboard',
    { skeleton: CardSkeleton }
  ),
  
  SuperAdminDashboard: lazyManager.createLazyComponent(
    () => import('../components/dashboards/SuperAdminDashboard'),
    'SuperAdminDashboard',
    { skeleton: PageSkeleton }
  ),
  
  OperatorDashboard: lazyManager.createLazyComponent(
    () => import('../components/dashboards/OperatorDashboard'),
    'OperatorDashboard',
    { skeleton: PageSkeleton }
  ),

  // Individual chart components can be imported directly
  // Example: import { WeeklyRevenueChart } from '../components/charts/ChartComponents'
};

// Preload critical components
export const preloadCriticalComponents = async (): Promise<void> => {
  const criticalComponents = [
    'AdminDashboard',
    'MenuPage'
  ];

  try {
    await lazyManager.preloadComponents(criticalComponents);
    console.log('Critical components preloaded successfully');
  } catch (error) {
    console.warn('Some critical components failed to preload:', error);
  }
};

// Hook for component preloading
export const usePreloadComponents = (componentNames: string[]) => {
  React.useEffect(() => {
    const preload = async () => {
      try {
        await lazyManager.preloadComponents(componentNames);
      } catch (error) {
        console.warn('Component preloading failed:', error);
      }
    };

    // Preload after a short delay to not block initial render
    const timer = setTimeout(preload, 500);
    return () => clearTimeout(timer);
  }, [componentNames]);
};

// Hook for intersection-based preloading
export const useIntersectionPreload = (
  componentNames: string[],
  options: IntersectionObserverInit = {}
) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lazyManager.preloadComponents(componentNames).catch(console.warn);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [componentNames, options]);

  return ref;
};

export default LazyComponents;