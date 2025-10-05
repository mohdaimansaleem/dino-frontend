import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { usePermissions } from '../auth';
import UnifiedDashboard from './UnifiedDashboard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface DashboardRouterProps {
  className?: string;
}

/**
 * DashboardRouter - Automatically renders the appropriate dashboard
 * based on the user's role and permissions
 */
const DashboardRouter: React.FC<DashboardRouterProps> = ({ className }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const { isSuperAdmin, isAdmin, isOperator } = usePermissions();

  // Show loading state while authentication is being determined
  if (isLoading || userDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-yellow-800 font-medium">Authentication Required</h3>
            <p className="text-yellow-700 mt-1">Please log in to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }



  // For now, let's allow all authenticated users to access the dashboard
  // The UnifiedDashboard will handle role-based content rendering
  return <UnifiedDashboard className={className} />;
};

export default DashboardRouter;