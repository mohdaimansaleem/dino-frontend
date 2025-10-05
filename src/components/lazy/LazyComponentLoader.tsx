/**
 * Enhanced Lazy Component Loader
 * 
 * Provides optimized lazy loading with preloading, error boundaries, 
 * performance monitoring, and intelligent caching.
 */

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Box, CircularProgress, Typography, Button, Skeleton } from '@mui/material';

// ===================================================================
// TYPES & INTERFACES
// ===================================================================

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

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// ===================================================================
// ERROR BOUNDARY
// ===================================================================

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
    console.error('Lazy component error:', error, errorInfo);
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

// ===================================================================
// FALLBACK COMPONENTS
// ===================================================================

const DefaultLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="200px"
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => {
  return (
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
};

// ===================================================================
// SKELETON COMPONENTS
// ===================================================================

export const PageSkeleton: React.FC = () => (
  <Box p={0}>
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

export const DashboardSkeleton: React.FC = () => (
  <Box p={3}>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={4}>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i} p={2} border="1px solid #eee" borderRadius={2}>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={32} />
        </Box>
      ))}
    </Box>
    <Skeleton variant="rectangular" width="100%" height={400} />
  </Box>
);

// ===================================================================
// LAZY COMPONENT MANAGER
// ===================================================================

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
      timeout = 10000
    } = config;

    const lazyComponent = lazy(() => {
      const startTime = Date.now();
      
      return Promise.race([
        importFn().then(module => {
          const loadTime = Date.now() - startTime;
          try {
            // Try to use performance service if available
            if (typeof window !== 'undefined' && (window as any).performanceService) {
              (window as any).performanceService.addMetric(
                'component_lazy_load',
                loadTime,
                'render',
                { component: name }
              );
            }
          } catch (error) {
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

    if (preload) {
      setTimeout(() => {
        preloadFn().catch(() => {});
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

// ===================================================================
// GLOBAL MANAGER & WRAPPER
// ===================================================================

export const lazyManager = new LazyComponentManager();

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

// ===================================================================
// LAZY COMPONENTS REGISTRY
// ===================================================================

export const LazyComponents = {
  // Admin Dashboard Components
  AdminDashboard: lazyManager.createLazyComponent(
    () => import('../../pages/admin/AdminDashboard'),
    'AdminDashboard',
    { preload: true, skeleton: DashboardSkeleton }
  ),
  
  // Legacy dashboard components removed - now using UnifiedDashboard for all roles

  // Admin Management Pages
  WorkspaceManagement: lazyManager.createLazyComponent(
    () => import('../../pages/admin/WorkspaceManagement'),
    'WorkspaceManagement',
    { skeleton: PageSkeleton }
  ),
  
  MenuManagement: lazyManager.createLazyComponent(
    () => import('../../pages/admin/MenuManagement'),
    'MenuManagement',
    { skeleton: PageSkeleton }
  ),
  
  UserManagement: lazyManager.createLazyComponent(
    () => import('../../pages/admin/UserManagement'),
    'UserManagement',
    { skeleton: PageSkeleton }
  ),
  
  OrdersManagement: lazyManager.createLazyComponent(
    () => import('../../pages/admin/OrdersManagement'),
    'OrdersManagement',
    { skeleton: PageSkeleton }
  ),
  
  TableManagement: lazyManager.createLazyComponent(
    () => import('../../pages/admin/TableManagement'),
    'TableManagement',
    { skeleton: PageSkeleton }
  ),
  
  VenueSettings: lazyManager.createLazyComponent(
    () => import('../../pages/admin/VenueSettings'),
    'VenueSettings',
    { skeleton: PageSkeleton }
  ),
  
  UserPermissionsDashboard: lazyManager.createLazyComponent(
    () => import('../../pages/admin/UserPermissionsDashboard'),
    'UserPermissionsDashboard',
    { skeleton: PageSkeleton }
  ),
  
  CouponsManagement: lazyManager.createLazyComponent(
    () => import('../../features/coupons/pages/CouponsManagement'),
    'CouponsManagement',
    { skeleton: PageSkeleton }
  ),

  // Customer Pages
  MenuPage: lazyManager.createLazyComponent(
    () => import('../../pages/menu/MenuPage'),
    'MenuPage',
    { preload: true, skeleton: PageSkeleton }
  ),
  
  CheckoutPage: lazyManager.createLazyComponent(
    () => import('../../pages/menu/CheckoutPage'),
    'CheckoutPage',
    { skeleton: PageSkeleton }
  ),
  
  OrderTrackingPage: lazyManager.createLazyComponent(
    () => import('../../pages/menu/OrderTrackingPage'),
    'OrderTrackingPage',
    { skeleton: PageSkeleton }
  ),

  RegistrationPage: lazyManager.createLazyComponent(
    () => import('../../pages/auth/RegistrationPage'),
    'RegistrationPage',
    { skeleton: PageSkeleton }
  ),

  // Dashboard Components
  RealTimeDashboard: lazyManager.createLazyComponent(
    () => import('../dashboards/RealTimeDashboard'),
    'RealTimeDashboard',
    { skeleton: CardSkeleton }
  ),
};

// ===================================================================
// UTILITY FUNCTIONS & HOOKS
// ===================================================================

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

export const preloadAdminComponents = async (): Promise<void> => {
  const adminComponents = [
    'OrdersManagement',
    'MenuManagement',
    'TableManagement',
    'UserManagement',
    'CouponsManagement'
  ];

  try {
    await lazyManager.preloadComponents(adminComponents);
    console.log('Admin components preloaded successfully');
  } catch (error) {
    console.warn('Some admin components failed to preload:', error);
  }
};

export const preloadPublicComponents = async (): Promise<void> => {
  const publicComponents = [
    'MenuPage',
    'CheckoutPage'
  ];

  try {
    await lazyManager.preloadComponents(publicComponents);
    console.log('Public components preloaded successfully');
  } catch (error) {
    console.warn('Some public components failed to preload:', error);
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

// HOC for wrapping lazy components with Suspense
export const withLazyLoading = <P extends Record<string, any>>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallbackMessage?: string
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={<DefaultLoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

export default LazyComponents;