import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';

interface WorkspaceErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const WorkspaceErrorBoundary = ({ 
  children, 
  fallback 
}: WorkspaceErrorBoundaryProps): React.ReactElement => {
  const { workspaces, workspacesLoading, currentWorkspace } = useWorkspace();
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, show authentication message
  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-yellow-800 font-medium">Authentication Required</h3>
            <p className="text-yellow-700 mt-1">Please log in to access workspace features.</p>
          </div>
        </div>
      </div>
    );
  }

  // If loading workspaces, show loading state
  if (workspacesLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="animate-spin w-6 h-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <h3 className="text-blue-800 font-medium">Loading Workspace</h3>
            <p className="text-blue-700 mt-1">Please wait while we load your workspace data...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no workspaces found, show appropriate message
  if (!workspaces || workspaces.length === 0) {
    return (fallback ? <>{fallback}</> : (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div>
            <h3 className="text-gray-800 font-medium">No Workspace Found</h3>
            <p className="text-gray-700 mt-1">
              You need to select a workspace first to manage users. Please select or create a workspace to continue.
            </p>
            {user?.role === 'superadmin' && (
              <button 
                onClick={() => window.location.href = '/register'}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  }

  // If no current workspace selected, show selection message
  if (!currentWorkspace) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-orange-800 font-medium">No Workspace Selected</h3>
            <p className="text-orange-700 mt-1">Please select a workspace to continue.</p>
            <div className="mt-3">
              <select 
                className="px-3 py-2 border border-orange-300 rounded"
                onChange={(e) => {
                  if (e.target.value) {
                    // This would trigger workspace selection
                    console.log('Selected workspace:', e.target.value);
                  }
                }}
              >
                <option value="">Select a workspace...</option>
                {workspaces.map(workspace => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All good, render children
  return <>{children}</>;
};

export default WorkspaceErrorBoundary;