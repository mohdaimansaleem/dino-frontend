import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import cleanTheme from './theme/cleanTheme';

// Public Pages
import CleanHomePage from './pages/CleanHomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import TestimonialsPage from './pages/TestimonialsPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersManagement from './pages/admin/OrdersManagement';
import MenuManagement from './pages/admin/MenuManagement';
import EnhancedTableManagement from './pages/admin/EnhancedTableManagement';
import EnhancedCafeSettings from './pages/admin/EnhancedCafeSettings';
import UserManagement from './pages/admin/UserManagement';
import WorkspaceManagement from './pages/admin/WorkspaceManagement';
import UserPermissionsDashboard from './pages/admin/UserPermissionsDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import CleanLayout from './components/CleanLayout';
import UserProfile from './components/UserProfile';
import { PERMISSIONS } from './types/auth';

function App() {
  return (
    <ThemeProvider theme={cleanTheme}>
      <CssBaseline />
      {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
        <AuthProvider>
          <WorkspaceProvider>
            <NotificationProvider>
              <CartProvider>
                <CleanLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<CleanHomePage />} />
                <Route path="/home" element={<CleanHomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/menu/:cafeId/:tableId" element={<CustomerMenuPage />} />
                <Route path="/checkout/:cafeId/:tableId" element={<CheckoutPage />} />
                <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                <Route path="/order/:orderId" element={<OrderTrackingPage />} />
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
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
                    <EnhancedTableManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <RoleProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                    <EnhancedCafeSettings />
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
                </CleanLayout>
              </CartProvider>
            </NotificationProvider>
          </WorkspaceProvider>
        </AuthProvider>
      {/* </LocalizationProvider> */}
    </ThemeProvider>
  );
}

export default App;