import React, { useState, useEffect } from 'react';
import { workspaceService } from '../../services/workspaceService';
import { authService } from '../../services/authService';
import { userDataService } from '../../services/userDataService';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { getUserWorkspaceId, getUserVenueId } from '../../utils/userUtils';

const WorkspaceDebug: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [publicDebugInfo, setPublicDebugInfo] = useState<any>(null);
  const [workspacesInfo, setWorkspacesInfo] = useState<any>(null);
  const [authTestInfo, setAuthTestInfo] = useState<any>(null);
  const [userDataInfo, setUserDataInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  const testPublicDebug = async () => {
    setLoading(true);
    try {
      const result = await workspaceService.testPublicWorkspaces();
      setPublicDebugInfo(result);
    } catch (error: any) {
      setPublicDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAuthenticatedDebug = async () => {
    setLoading(true);
    try {
      const result = await workspaceService.debugWorkspaces();
      setDebugInfo(result);
    } catch (error: any) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testWorkspacesFetch = async () => {
    setLoading(true);
    try {
      // No longer calling workspace API - using user data instead
      setWorkspacesInfo({ 
        message: 'Workspace API call removed - workspace data comes from user-data API',
        userData: userData?.workspace || null
      });
    } catch (error: any) {
      setWorkspacesInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    setLoading(true);
    try {
      const result = await authService.login(testEmail, testPassword);
      setAuthTestInfo({ success: true, result });
    } catch (error: any) {
      setAuthTestInfo({ 
        success: false, 
        error: error.message,
        details: error.response?.data 
      });
    } finally {
      setLoading(false);
    }
  };

  const testTokenValidation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dino_token');
      if (!token) {
        setAuthTestInfo({ success: false, error: 'No token found' });
        return;
      }

      const result = await authService.getCurrentUser();
      setAuthTestInfo({ 
        success: true, 
        message: 'Token is valid',
        user: result 
      });
    } catch (error: any) {
      setAuthTestInfo({ 
        success: false, 
        error: 'Token validation failed',
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserDataFetch = async () => {
    setLoading(true);
    try {
      const result = await userDataService.getUserData();
      setUserDataInfo({ success: true, data: result });
    } catch (error: any) {
      setUserDataInfo({ 
        success: false, 
        error: error.message,
        details: error.response?.data 
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserDataRefresh = async () => {
    setLoading(true);
    try {
      await refreshUserData();
      setUserDataInfo({ 
        success: true, 
        message: 'User data refreshed successfully',
        data: userData 
      });
    } catch (error: any) {
      setUserDataInfo({ 
        success: false, 
        error: 'Failed to refresh user data',
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test public debug on component mount
    testPublicDebug();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Workspace Debug Panel</h2>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>User Role:</strong> {user?.role || 'N/A'}</p>
        <p><strong>Workspace ID:</strong> {getUserWorkspaceId(user) || 'N/A'}</p>
        <p><strong>Venue ID:</strong> {getUserVenueId(user) || 'N/A'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('dino_token') ? 'Present' : 'Missing'}</p>
        <p><strong>UserData Loaded:</strong> {userData ? 'Yes' : 'No'}</p>
        {userData && (
          <>
            <p><strong>Current Venue:</strong> {userData.venue?.name || 'N/A'}</p>
            <p><strong>Current Workspace:</strong> {userData.workspace?.display_name || 'N/A'}</p>
          </>
        )}
      </div>

      {/* Authentication Test */}
      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Authentication Test</h3>
        <div className="flex space-x-2 mb-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Test email"
            className="px-3 py-1 border rounded"
          />
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Test password"
            className="px-3 py-1 border rounded"
          />
          <button
            onClick={testAuthentication}
            disabled={loading}
            className="px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test Login
          </button>
          <button
            onClick={testTokenValidation}
            disabled={loading}
            className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Validate Token
          </button>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={testPublicDebug}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Public Debug
        </button>
        <button
          onClick={testAuthenticatedDebug}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Authenticated Debug
        </button>
        <button
          onClick={testWorkspacesFetch}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Workspaces Fetch
        </button>
        <button
          onClick={testUserDataFetch}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          Test User Data Fetch
        </button>
        <button
          onClick={testUserDataRefresh}
          disabled={loading}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          Refresh User Data
        </button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Authentication Test Results */}
        {authTestInfo && (
          <div className="p-4 bg-orange-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Authentication Test Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(authTestInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Public Debug Results */}
        {publicDebugInfo && (
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Public Debug Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(publicDebugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Authenticated Debug Results */}
        {debugInfo && (
          <div className="p-4 bg-green-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Authenticated Debug Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Workspaces Fetch Results */}
        {workspacesInfo && (
          <div className="p-4 bg-purple-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Workspaces Fetch Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(workspacesInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* User Data Results */}
        {userDataInfo && (
          <div className="p-4 bg-indigo-50 rounded">
            <h3 className="text-lg font-semibold mb-2">User Data Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(userDataInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Current UserData Context */}
        {userData && (
          <div className="p-4 bg-pink-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Current UserData Context</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                user: userData.user,
                venue: userData.venue,
                workspace: userData.workspace,
                statistics: userData.statistics,
                permissions: userData.permissions
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDebug;