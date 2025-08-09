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
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import TestimonialsPage from './pages/TestimonialsPage';

// RegistrationPage now imported from LazyComponents
import LoginPage from './pages/LoginPage';

// MenuPage, CheckoutPage, OrderTrackingPage now imported from LazyComponents

// Lazy-loaded components for better performance
import {
  AdminDashboard,
  OrdersManagement,
  MenuManagement,
  TableManagement,
  VenueSettings,
  UserManagement,
  WorkspaceManagement,
  UserPermissionsDashboard,
  MenuPage,
  CheckoutPage,
  OrderTrackingPage,
  RegistrationPage,

} from './components/LazyComponents';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import UserProfile from './components/UserProfile';
import PermissionSync from './components/PermissionSync';
import { PERMISSIONS } from './types/auth';
import AppInitializer from './components/AppInitializer';
import PasswordHashingTest from './components/PasswordHashingTest';

function App() {
  // Validate password hashing setup on app startup
  useEffect(() => {
    try {
      validatePasswordHashingSetup();
    } catch (error) {
      console.error('❌ CRITICAL: Password hashing setup failed:', error);
      // You could show a user-friendly error message here
      alert('Application security setup failed. Please contact support.');
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
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/menu/:venueId/:tableId" element={<MenuPage />} />
                <Route path="/checkout/:venueId/:tableId" element={<CheckoutPage />} />
                <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                <Route path="/order/:orderId" element={<OrderTrackingPage />} />
                
                {/* Development/Testing Routes */}
                <Route path="/test-password-hashing" element={<PasswordHashingTest />} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes - Role-based access control */}
                <Route path="/admin" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.ORDERS_VIEW]}>
                    <OrdersManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/menu" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.MENU_VIEW]}>
                    <MenuManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/tables" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.TABLES_VIEW]}>
                    <TableManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                    <VenueSettings />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                    <UserManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/workspace" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.WORKSPACE_VIEW]}>
                    <WorkspaceManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/permissions" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                    <UserPermissionsDashboard />
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