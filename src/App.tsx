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
import { SidebarProvider } from './contexts/SidebarContext';
import { DinoAvatarProvider } from './contexts/DinoAvatarContext';
import { TourProvider } from './contexts/TourContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { validatePasswordHashingSetup } from './utils/passwordValidation';

// Public Pages
import HomePage from './pages/HomePage';

// RegistrationPage now imported from LazyComponents
import LoginPage from './pages/LoginPage';

// Import customer pages directly to test
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderStatusDemo from './pages/OrderStatusDemo';



// Lazy-loaded components for better performance
import { LazyComponents } from './components/lazy';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import UserProfile from './components/UserProfile';
import PermissionSync from './components/PermissionSync';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import { PERMISSIONS } from './types/auth';
import AppInitializer from './components/AppInitializer';
import { logger } from './utils/logger';
import { RUNTIME_CONFIG as config, isDevelopment } from './config/runtime';
import StorageCleanup from './utils/storageCleanup';
import { tokenRefreshScheduler } from './utils/tokenRefreshScheduler';
import { apiService } from './services/api';
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
      validatePasswordHashingSetup();
      logger.info('Password hashing setup validated successfully');
      
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

                <Route path="/register" element={
                  <Suspense fallback={<LoadingFallback />}>
                    {React.createElement(LazyComponents.RegistrationPage.component)}
                  </Suspense>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/menu/:venueId/:tableId" element={<Layout><MenuPage /></Layout>} />
                <Route path="/checkout/:venueId/:tableId" element={<Layout><CheckoutPage /></Layout>} />
                <Route path="/order-tracking/:orderId" element={<Layout><OrderTrackingPage /></Layout>} />
                <Route path="/order/:orderId" element={<Layout><OrderTrackingPage /></Layout>} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/order-status-demo" element={<OrderStatusDemo />} />
                


                
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
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.AdminDashboard.component)}
                      </Suspense>
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
                  <Layout>
                    <RoleProtectedRoute requiredPermissions={[PERMISSIONS.WORKSPACE_VIEW]}>
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.WorkspaceManagement.component)}
                      </Suspense>
                    </RoleProtectedRoute>
                  </Layout>
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
    </ErrorBoundary>
  );
}

export default App;