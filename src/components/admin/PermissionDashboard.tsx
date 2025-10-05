import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionDashboardProps {
  className?: string;
  showRefreshButton?: boolean;
  showPermissionList?: boolean;
  showRoleInfo?: boolean;
}

/**
 * PermissionDashboard - Component to display and manage user permissions
 */
const PermissionDashboard: React.FC<PermissionDashboardProps> = ({
  className = '',
  showRefreshButton = true,
  showPermissionList = true,
  showRoleInfo = true
}) => {
  const { userPermissions, isAuthenticated } = useAuth();
  
  // Mock permission sync functionality
  const syncPermissions = () => {};
  const isSyncing = false;
  const lastSync: Date | null = null;
  const syncError = null;
  const permissionCount = userPermissions?.permissions?.length || 0;
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (!isAuthenticated) {
    return null;
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupPermissionsByResource = (permissions: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    permissions.forEach(permission => {
      const resource = permission.resource || 'other';
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(permission);
    });
    return grouped;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
      case 'view':
        return '#2196F3';
      case 'create':
        return '#4CAF50';
      case 'update':
        return '#FF9800';
      case 'delete':
        return '#F44336';
      case 'manage':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'own':
        return '👤';
      case 'venue':
        return '🏪';
      case 'workspace':
        return '🏢';
      case 'all':
        return '🌐';
      default:
        return '📋';
    }
  };

  return (
    <div className={`permission-dashboard ${className}`} style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          Permission Dashboard
        </h3>
        {showRefreshButton && (
          <button
            onClick={syncPermissions}
            disabled={isSyncing}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: isSyncing ? '#f5f5f5' : '#fff',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ 
              transform: isSyncing ? 'rotate(360deg)' : 'none',
              transition: 'transform 1s linear',
              display: 'inline-block'
            }}>
              🔄
            </span>
            {isSyncing ? 'Syncing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Sync Status */}
      {syncError && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          fontSize: '14px'
        }}>
          <div style={{ color: '#d32f2f' }}>
            ❌ Sync Error: {syncError}
          </div>
        </div>
      )}

      {/* Role Information */}
      {showRoleInfo && userPermissions?.role && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            Current Role
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              padding: '4px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {userPermissions.role.display_name || userPermissions.role.name}
            </span>
            <span style={{ color: '#6c757d', fontSize: '14px' }}>
              {permissionCount} permissions
            </span>
          </div>
          {userPermissions.role.description && (
            <p style={{ 
              margin: '10px 0 0 0', 
              color: '#6c757d', 
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              {userPermissions.role.description}
            </p>
          )}
        </div>
      )}

      {/* Permission List */}
      {showPermissionList && userPermissions?.permissions && (
        <div>
          <h4 style={{ marginBottom: '15px', color: '#495057' }}>
            Permissions ({permissionCount})
          </h4>
          
          {permissionCount === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px'
            }}>
              No permissions assigned
            </div>
          ) : (
            <div>
              {Object.entries(groupPermissionsByResource(userPermissions.permissions)).map(([resource, permissions]) => (
                <div key={resource} style={{ marginBottom: '15px' }}>
                  <button
                    onClick={() => toggleCategory(resource)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      {resource} ({permissions.length})
                    </span>
                    <span style={{ 
                      transform: expandedCategories.has(resource) ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}>
                      ▼
                    </span>
                  </button>
                  
                  {expandedCategories.has(resource) && (
                    <div style={{
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      backgroundColor: '#fff'
                    }}>
                      {permissions.map((permission, index) => (
                        <div
                          key={permission.id}
                          style={{
                            padding: '12px',
                            borderBottom: index < permissions.length - 1 ? '1px solid #f1f3f4' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: '#333',
                              marginBottom: '4px'
                            }}>
                              {permission.name}
                            </div>
                            {permission.description && (
                              <div style={{ 
                                fontSize: '14px', 
                                color: '#6c757d'
                              }}>
                                {permission.description}
                              </div>
                            )}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px',
                            alignItems: 'center'
                          }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                backgroundColor: getActionColor(permission.action),
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {permission.action}
                            </span>
                            <span
                              style={{
                                padding: '2px 6px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '12px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={`Scope: ${permission.scope}`}
                            >
                              {getScopeIcon(permission.scope)}
                              {permission.scope}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Permissions */}
      {userPermissions?.dashboard_permissions && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#495057' }}>
            Dashboard Access
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {Object.entries(userPermissions.dashboard_permissions.components || {}).map(([component, hasAccess]) => (
              <div
                key={component}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: hasAccess ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${hasAccess ? '#c3e6cb' : '#f5c6cb'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <span>{hasAccess ? '✅' : '❌'}</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {component.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionDashboard;