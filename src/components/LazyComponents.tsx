/**
 * Lazy-loaded components for performance optimization
 * Using React.lazy and Suspense for code splitting
 */
import React, { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

// Loading component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
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

// Lazy-loaded dashboard components
export const LazyAdminDashboard = React.lazy(() => 
  import('./dashboards/AdminDashboard').then(module => ({
    default: module.default
  }))
);

export const LazySuperAdminDashboard = React.lazy(() => 
  import('./dashboards/SuperAdminDashboard').then(module => ({
    default: module.default
  }))
);

export const LazyOperatorDashboard = React.lazy(() => 
  import('./dashboards/OperatorDashboard').then(module => ({
    default: module.default
  }))
);

// Lazy-loaded admin pages
export const LazyOrdersManagement = React.lazy(() => 
  import('../pages/admin/OrdersManagement').then(module => ({
    default: module.default
  }))
);

export const LazyMenuManagement = React.lazy(() => 
  import('../pages/admin/MenuManagement').then(module => ({
    default: module.default
  }))
);

export const LazyTableManagement = React.lazy(() => 
  import('../pages/admin/TableManagement').then(module => ({
    default: module.default
  }))
);

export const LazyUserManagement = React.lazy(() => 
  import('../pages/admin/UserManagement').then(module => ({
    default: module.default
  }))
);

export const LazyWorkspaceManagement = React.lazy(() => 
  import('../pages/admin/WorkspaceManagement').then(module => ({
    default: module.default
  }))
);

export const LazyCafeSettings = React.lazy(() => 
  import('../pages/admin/CafeSettings').then(module => ({
    default: module.default
  }))
);

export const LazyUserPermissionsDashboard = React.lazy(() => 
  import('../pages/admin/UserPermissionsDashboard').then(module => ({
    default: module.default
  }))
);

// Lazy-loaded public pages
export const LazyMenuPage = React.lazy(() => 
  import('../pages/MenuPage').then(module => ({
    default: module.default
  }))
);

export const LazyCheckoutPage = React.lazy(() => 
  import('../pages/CheckoutPage').then(module => ({
    default: module.default
  }))
);

export const LazyOrderTrackingPage = React.lazy(() => 
  import('../pages/OrderTrackingPage').then(module => ({
    default: module.default
  }))
);

export const LazyRegistrationPage = React.lazy(() => 
  import('../pages/RegistrationPage').then(module => ({
    default: module.default
  }))
);

// HOC for wrapping lazy components with Suspense
export const withLazyLoading = <P extends Record<string, any>>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallbackMessage?: string
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Pre-configured lazy components with Suspense
export const AdminDashboard = withLazyLoading(LazyAdminDashboard, 'Loading Admin Dashboard...');
export const SuperAdminDashboard = withLazyLoading(LazySuperAdminDashboard, 'Loading Super Admin Dashboard...');
export const OperatorDashboard = withLazyLoading(LazyOperatorDashboard, 'Loading Operator Dashboard...');

export const OrdersManagement = withLazyLoading(LazyOrdersManagement, 'Loading Orders Management...');
export const MenuManagement = withLazyLoading(LazyMenuManagement, 'Loading Menu Management...');
export const TableManagement = withLazyLoading(LazyTableManagement, 'Loading Table Management...');
export const UserManagement = withLazyLoading(LazyUserManagement, 'Loading User Management...');
export const WorkspaceManagement = withLazyLoading(LazyWorkspaceManagement, 'Loading Workspace Management...');
export const CafeSettings = withLazyLoading(LazyCafeSettings, 'Loading Cafe Settings...');
export const UserPermissionsDashboard = withLazyLoading(LazyUserPermissionsDashboard, 'Loading Permissions Dashboard...');

export const MenuPage = withLazyLoading(LazyMenuPage, 'Loading Menu...');
export const CheckoutPage = withLazyLoading(LazyCheckoutPage, 'Loading Checkout...');
export const OrderTrackingPage = withLazyLoading(LazyOrderTrackingPage, 'Loading Order Tracking...');
export const RegistrationPage = withLazyLoading(LazyRegistrationPage, 'Loading Registration...');

// Preload functions for critical routes
export const preloadCriticalComponents = () => {
  // Preload dashboard components as they're likely to be accessed first
  import('./dashboards/AdminDashboard');
  import('./dashboards/SuperAdminDashboard');
  import('./dashboards/OperatorDashboard');
};

export const preloadAdminComponents = () => {
  // Preload admin components when user is identified as admin
  import('../pages/admin/OrdersManagement');
  import('../pages/admin/MenuManagement');
  import('../pages/admin/TableManagement');
};

export const preloadPublicComponents = () => {
  // Preload public components for better UX
  import('../pages/MenuPage');
  import('../pages/CheckoutPage');
};