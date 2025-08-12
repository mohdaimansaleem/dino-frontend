import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { validatePasswordHashingSetup } from './utils/passwordValidation';

// Public Pages
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';

// RegistrationPage now imported from LazyComponents
import LoginPage from './pages/LoginPage';

// Import customer pages directly to test
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Lazy-loaded components for better performance
import { LazyComponents } from './components/LazyLoadingComponents';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import UserProfile from './components/UserProfile';
import PermissionSync from './components/PermissionSync';
import { PERMISSIONS } from './types/auth';
import AppInitializer from './components/AppInitializer';
import { logger } from './utils/logger';
import { config, isDevelopment } from './config/environment';
import { StorageCleanup } from './utils/storageCleanup';
import { tokenRefreshScheduler } from './utils/tokenRefreshScheduler';
import { apiService } from './services/api';

// Debug configuration in development
if (isDevelopment()) {
  console.log('🔧 Development mode enabled');
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
      // Clean up demo and legacy data from localStorage
      StorageCleanup.performCompleteCleanup();
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
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PermissionSync autoRefreshInterval={0} showSyncStatus={false}>
            <UserDataProvider>
              <AppInitializer>
                <WorkspaceProvider>
                  <NotificationProvider>
                    <CartProvider>
                      <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/register" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyComponents.RegistrationPage.component />
                  </Suspense>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/menu/:venueId/:tableId" element={<MenuPage />} />
                <Route path="/checkout/:venueId/:tableId" element={<CheckoutPage />} />
                <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                <Route path="/order/:orderId" element={<OrderTrackingPage />} />
                
                {/* Development/Testing Routes - Only available in development */}
                {isDevelopment() && (
                  <Route path="/test-password-hashing" element={<div>Test route only available in development</div>} />
                )}
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes - Role-based access control */}
                <Route path="/admin" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminDashboard.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.ORDERS_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.OrdersManagement.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/menu" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.MENU_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.MenuManagement.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/tables" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.TABLES_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.TableManagement.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.VenueSettings.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.UserManagement.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/workspace" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.WORKSPACE_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.WorkspaceManagement.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/permissions" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.UserPermissionsDashboard.component />
                    </Suspense>
                  </RoleProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
                      </Layout>
                    </CartProvider>
                  </NotificationProvider>
                </WorkspaceProvider>
              </AppInitializer>
            </UserDataProvider>
          </PermissionSync>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;