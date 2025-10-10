// Import immediate cleanup to remove workspace venue cache entries FIRST
import './utils/immediateCleanup';
// Import debug utilities for authentication testing
import './utils/debugAuth';

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { VenueThemeProvider } from './contexts/VenueThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { DinoAvatarProvider } from './contexts/DinoAvatarContext';
import { TourProvider } from './contexts/TourContext';
import { FlagProvider } from './flags/FlagContext';
import { isPasswordHashingSupported } from './utils/security';

// Public Pages
import { HomePage } from './pages/public';

// Authentication Pages
import { LoginPage } from './pages/auth';

// Menu Pages
import { MenuPage, CheckoutPage, OrderTrackingPage, OrderSuccessPage, OrderStatusDemo } from './pages/menu';



// Lazy-loaded components for better performance
import { LazyComponents } from './components/lazy';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Components
import { ProtectedRoute, RoleProtectedRoute, UserProfile, PermissionSync } from './components/auth';
import { Layout, ErrorBoundary, AppInitializer } from './components/common';
import { NotFoundPage } from './pages/public';
import DashboardRouter from './components/dashboards/DashboardRouter';
import { PERMISSIONS } from './types/auth';

import { logger } from './utils/logger';
import { RUNTIME_CONFIG as config, isDevelopment } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/tokenRefreshScheduler';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

// Debug configuration in development
if (isDevelopment()) {
  logger.debug('Development mode enabled');
}

// Simple loading fallback for lazy components
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
  </Box>
);

function App() {
  // Validate password hashing setup and cleanup storage on app startup
  useEffect(() => {
    try {
      // Clean up legacy data from localStorage
      StorageCleanup.performCleanup();
      logger.info('Storage cleanup completed successfully');
      
      // Validate password hashing setup
      if (!isPasswordHashingSupported()) {
        logger.warn('Password hashing not supported - crypto.subtle not available');
      } else {
        logger.info('Password hashing setup validated successfully');
      }
      
      // Refresh API configuration from runtime config
      if (typeof window !== 'undefined') {
        // Wait a bit for config.js to load
        setTimeout(() => {
          apiService.refreshConfiguration();
          logger.info('API configuration refreshed from runtime config');
        }, 200);
        
        tokenRefreshScheduler.start();
        logger.info('Token refresh scheduler initialized');
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
        logger.info('Performance monitoring initialized');
      }
    } catch (error) {
      logger.error('CRITICAL: App initialization failed:', error);
      // In production, show a user-friendly error message
      if (config.APP_ENV === 'production') {
        alert('Application initialization failed. Please contact support.');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <FlagProvider>
        <ThemeProvider>
          <ToastProvider>
            <SidebarProvider defaultCollapsed={false}>
              <DinoAvatarProvider>
                <AuthProvider>
                  <TourProvider>
                    <PermissionSync autoRefreshInterval={0} showSyncStatus={false}>
                      <UserDataProvider>
                        <AppInitializer>
                          <WorkspaceProvider>
                            <NotificationProvider>
                            {/* Temporarily disabled WebSocket to prevent connection loops */}
                            {/* <WebSocketProvider> */}
                            <CartProvider>
              <Routes>
                {/* Routes with Layout */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/home" element={<Layout><HomePage /></Layout>} />

                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(LazyComponents.RegistrationPage.component)}
                    </Suspense>
                  } />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/menu/:venueId/:tableId"
                  element={<VenueThemeProvider><Layout><MenuPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/checkout/:venueId/:tableId"
                  element={<VenueThemeProvider><Layout><CheckoutPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order-tracking/:orderId"
                  element={<VenueThemeProvider><Layout><OrderTrackingPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order/:orderId"
                  element={<VenueThemeProvider><Layout><OrderTrackingPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order-success/:orderId"
                  element={<VenueThemeProvider><OrderSuccessPage /></VenueThemeProvider>} />
                <Route
                  path="/order-status-demo"
                  element={<VenueThemeProvider><OrderStatusDemo /></VenueThemeProvider>} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <Layout>
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  </Layout>
                } />
                
                {/* Admin Routes - Role-based access control */}
                <Route path="/admin" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                      <DashboardRouter />
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/orders" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.ORDERS_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.OrdersManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/menu" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.MENU_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.MenuManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/tables" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.TABLES_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.TableManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/settings" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.VenueSettings.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/users" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.UserManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/workspace" element={
                  <VenueThemeProvider>
                    <Layout>
                      <RoleProtectedRoute requiredPermissions={[PERMISSIONS.WORKSPACE_VIEW]}>
                        <Suspense fallback={<LoadingFallback />}>
                          {React.createElement(LazyComponents.WorkspaceManagement.component)}
                        </Suspense>
                      </RoleProtectedRoute>
                    </Layout>
                  </VenueThemeProvider>
                } />
                <Route path="/admin/permissions" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.UserPermissionsDashboard.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                <Route path="/admin/coupons" element={
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.COUPONS_MANAGE]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.CouponsManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
                } />
                
                {/* Standalone 404 Page - No Layout */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
                            </CartProvider>
                            {/* </WebSocketProvider> */}
                            </NotificationProvider>
                          </WorkspaceProvider>
                        </AppInitializer>
                      </UserDataProvider>
                    </PermissionSync>
                  </TourProvider>
                </AuthProvider>
              </DinoAvatarProvider>
            </SidebarProvider>
          </ToastProvider>
        </ThemeProvider>
      </FlagProvider>
    </ErrorBoundary>
  );
}

export default App;