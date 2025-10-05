import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionSyncProps {
  children: React.ReactNode;
  autoRefreshInterval?: number; // in milliseconds
  showSyncStatus?: boolean;
}

/**
 * PermissionSync - Component that handles real-time permission synchronization
 * Wraps children and ensures permissions are kept in sync with backend
 */
const PermissionSync: React.FC<PermissionSyncProps> = ({
  children,
  autoRefreshInterval = 15 * 60 * 1000, // 15 minutes default (increased to reduce API calls)
  showSyncStatus = false
}) => {
  const { isAuthenticated, refreshPermissions, userPermissions } = useAuth();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-refresh permissions at specified interval
  useEffect(() => {
    if (!isAuthenticated || !autoRefreshInterval) return;

    const interval = setInterval(async () => {
      // Skip refresh if already syncing or recently synced (within 5 minutes)
      if (isSyncing || (lastSync && Date.now() - lastSync.getTime() < 5 * 60 * 1000)) {
        return;
      }

      try {
        setIsSyncing(true);
        setSyncError(null);
        await refreshPermissions();
        setLastSync(new Date());
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
      } finally {
        setIsSyncing(false);
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefreshInterval, refreshPermissions, isSyncing, lastSync]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await refreshPermissions();
      setLastSync(new Date());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPermissions]);

  // Listen for permission changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dino_permissions' && e.newValue) {
        try {
          // Permissions updated in another tab, refresh local state
          handleManualRefresh();
        } catch (error) {
          }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleManualRefresh]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {showSyncStatus && (
        <div className="permission-sync-status" style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: syncError ? '#fee' : '#efe',
          border: `1px solid ${syncError ? '#fcc' : '#cfc'}`,
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: 300
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              {isSyncing ? '🔄' : syncError ? '❌' : '✅'}
            </span>
            <div>
              <div>
                {isSyncing ? 'Syncing permissions...' : 
                 syncError ? `Sync error: ${syncError}` : 
                 'Permissions synced'}
              </div>
              {lastSync && (
                <div style={{ color: '#666', fontSize: '10px' }}>
                  Last sync: {lastSync.toLocaleTimeString()}
                </div>
              )}
              {userPermissions && (
                <div style={{ color: '#666', fontSize: '10px' }}>
                  {userPermissions.permission_count || 0} permissions loaded
                </div>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isSyncing}
              style={{
                background: 'none',
                border: 'none',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: isSyncing ? 0.5 : 1
              }}
              title="Refresh permissions"
            >
              🔄
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default PermissionSync;

// Hook for manual permission refresh
export const usePermissionSync = () => {
  const { refreshPermissions, userPermissions } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncPermissions = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await refreshPermissions();
      setLastSync(new Date());
      return true;
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncPermissions,
    isSyncing,
    lastSync,
    syncError,
    permissionCount: userPermissions?.permission_count || 0,
    hasPermissions: !!userPermissions?.permissions?.length
  };
};