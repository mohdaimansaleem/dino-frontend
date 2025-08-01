import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

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
  CafeSettings,
  UserManagement,
  WorkspaceManagement,
  UserPermissionsDashboard,
  MenuPage,
  CheckoutPage,
  OrderTrackingPage,
  RegistrationPage,
  preloadCriticalComponents,
} from './components/LazyComponents';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import UserProfile from './components/UserProfile';
import PermissionSync from './components/PermissionSync';
import { PERMISSIONS } from './types/auth';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
          <AuthProvider>
            <PermissionSync autoRefreshInterval={5 * 60 * 1000} showSyncStatus={process.env.NODE_ENV === 'development'}>
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
                <Route path="/menu/:cafeId/:tableId" element={<MenuPage />} />
                <Route path="/checkout/:cafeId/:tableId" element={<CheckoutPage />} />
                <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                <Route path="/order/:orderId" element={<OrderTrackingPage />} />
                
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
                    <CafeSettings />
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
            </PermissionSync>
          </AuthProvider>
        {/* </LocalizationProvider> */}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;