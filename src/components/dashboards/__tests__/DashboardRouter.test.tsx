import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardRouter from '../DashboardRouter';

// Mock the dashboard components
jest.mock('../SuperAdminDashboard', () => {
  return function MockSuperAdminDashboard() {
    return <div data-testid="superadmin-dashboard">Super Admin Dashboard</div>;
  };
});

jest.mock('../AdminDashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

jest.mock('../OperatorDashboard', () => {
  return function MockOperatorDashboard() {
    return <div data-testid="operator-dashboard">Operator Dashboard</div>;
  };
});

// Mock the LoadingSpinner
jest.mock('../../ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

// Mock the RoleBasedComponent
jest.mock('../../RoleBasedComponent', () => ({
  usePermissions: jest.fn(),
}));

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DashboardRouter', () => {
  const mockUseAuth = require('../../../contexts/AuthContext').useAuth;
  const mockUsePermissions = require('../../RoleBasedComponent').usePermissions;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => false,
      isOperator: () => false,
    });

    renderWithProviders(<DashboardRouter />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should show authentication required when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => false,
      isOperator: () => false,
    });

    renderWithProviders(<DashboardRouter />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please log in to access the dashboard.')).toBeInTheDocument();
  });

  it('should render SuperAdmin dashboard for superadmin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@test.com', role: 'superadmin' },
      isAuthenticated: true,
      isLoading: false,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => true,
      isAdmin: () => false,
      isOperator: () => false,
    });

    renderWithProviders(<DashboardRouter />);

    await waitFor(() => {
      expect(screen.getByTestId('superadmin-dashboard')).toBeInTheDocument();
    });
  });

  it('should render Admin dashboard for admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@test.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => true,
      isOperator: () => false,
    });

    renderWithProviders(<DashboardRouter />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
  });

  it('should render Operator dashboard for operator users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'operator@test.com', role: 'operator' },
      isAuthenticated: true,
      isLoading: false,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => false,
      isOperator: () => true,
    });

    renderWithProviders(<DashboardRouter />);

    await waitFor(() => {
      expect(screen.getByTestId('operator-dashboard')).toBeInTheDocument();
    });
  });

  it('should show access denied for users without recognized roles', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'user@test.com', role: 'unknown' },
      isAuthenticated: true,
      isLoading: false,
    });

    mockUsePermissions.mockReturnValue({
      isSuperAdmin: () => false,
      isAdmin: () => false,
      isOperator: () => false,
    });

    renderWithProviders(<DashboardRouter />);

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/Your account doesn't have the necessary permissions/)).toBeInTheDocument();
    });
  });
});