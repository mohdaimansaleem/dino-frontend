import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { usePermissions } from '../auth';
import { PERMISSIONS } from '../../types/auth';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  roles?: string[];
  children?: NavigationItem[];
  badge?: string | number;
  external?: boolean;
}

interface PermissionBasedNavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  compact?: boolean;
}

const PermissionBasedNavigation: React.FC<PermissionBasedNavigationProps> = ({
  className = '',
  orientation = 'vertical',
  showLabels = true,
  compact = false
}) => {
  const location = useLocation();
  const { hasPermission, hasRole } = usePermissions();

  // Define navigation structure based on roles and permissions
  // Reordered according to user request: Dashboard, Orders, Menu, Tables, Users, Permissions, Settings, Workspace
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin',
      permission: PERMISSIONS.DASHBOARD_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/admin/orders',
      permission: PERMISSIONS.ORDERS_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      children: [
        {
          id: 'orders-active',
          label: 'Active Orders',
          path: '/admin/orders/active',
          permission: PERMISSIONS.ORDERS_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'orders-history',
          label: 'Order History',
          path: '/admin/orders/history',
          permission: PERMISSIONS.ORDERS_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        },
        {
          id: 'orders-create',
          label: 'New Order',
          path: '/admin/orders/create',
          permission: PERMISSIONS.ORDERS_CREATE,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'menu',
      label: 'Menu',
      path: '/admin/menu',
      permission: PERMISSIONS.MENU_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      children: [
        {
          id: 'menu-items',
          label: 'Menu Items',
          path: '/admin/menu/items',
          permission: PERMISSIONS.MENU_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        },
        {
          id: 'menu-categories',
          label: 'Categories',
          path: '/admin/menu/categories',
          permission: PERMISSIONS.MENU_UPDATE,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'tables',
      label: 'Tables',
      path: '/admin/tables',
      permission: PERMISSIONS.TABLES_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      children: [
        {
          id: 'tables-management',
          label: 'Table Management',
          path: '/admin/tables/management',
          permission: PERMISSIONS.TABLES_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )
        },
        {
          id: 'tables-qr',
          label: 'QR Codes',
          path: '/admin/tables/qr',
          permission: PERMISSIONS.TABLES_UPDATE,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      path: '/admin/users',
      permission: PERMISSIONS.USERS_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      children: [
        {
          id: 'users-management',
          label: 'User Management',
          path: '/admin/users/management',
          permission: PERMISSIONS.USERS_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          )
        },
        {
          id: 'users-permissions',
          label: 'Permissions',
          path: '/admin/users/permissions',
          permission: PERMISSIONS.USERS_UPDATE,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/admin/settings',
      permission: PERMISSIONS.SETTINGS_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        {
          id: 'settings-general',
          label: 'General',
          path: '/admin/settings/general',
          permission: PERMISSIONS.SETTINGS_VIEW,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          )
        },
        {
          id: 'settings-cafe',
          label: 'Restaurant Settings',
          path: '/admin/settings/cafe',
          permission: PERMISSIONS.SETTINGS_UPDATE,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      path: '/admin/workspaces',
      permission: PERMISSIONS.WORKSPACE_VIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  // Filter navigation items based on user permissions
  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check role-based access
      if (item.roles && item.roles.length > 0) {
        const hasRequiredRole = item.roles.some(role => hasRole(role as any));
        if (!hasRequiredRole) return false;
      }

      // Check permission-based access
      if (item.permission) {
        if (!hasPermission(item.permission as any)) return false;
      }

      // Filter children recursively
      if (item.children) {
        item.children = filterNavigationItems(item.children);
      }

      return true;
    });
  };

  const filteredNavigation = filterNavigationItems(navigationItems);

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isActiveRoute(item.path);
    const hasChildren = item.children && item.children.length > 0;

    const baseClasses = `
      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
      ${compact ? 'justify-center' : 'justify-start'}
      ${level > 0 ? 'ml-6' : ''}
    `;

    const activeClasses = isActive
      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';

    const content = (
      <>
        <span className={`${compact ? '' : 'mr-3'} flex-shrink-0`}>
          {item.icon}
        </span>
        {showLabels && !compact && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {item.badge}
              </span>
            )}
          </>
        )}
      </>
    );

    return (
      <div key={item.id}>
        {item.external ? (
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${activeClasses}`}
          >
            {content}
          </a>
        ) : (
          <Link
            to={item.path}
            className={`${baseClasses} ${activeClasses}`}
          >
            {content}
          </Link>
        )}
        
        {hasChildren && showLabels && !compact && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (orientation === 'horizontal') {
    return (
      <nav className={`flex space-x-4 ${className}`}>
        {filteredNavigation.map(item => renderNavigationItem(item))}
      </nav>
    );
  }

  return (
    <nav className={`space-y-1 ${className}`}>
      {filteredNavigation.map(item => renderNavigationItem(item))}
    </nav>
  );
};

export default PermissionBasedNavigation;

// Breadcrumb component with permission checking
export const PermissionBasedBreadcrumb: React.FC<{
  items: Array<{ label: string; path?: string; permission?: string }>;
  className?: string;
}> = ({ items, className = '' }) => {
  const { hasPermission } = usePermissions();

  const filteredItems = items.filter(item => 
    !item.permission || hasPermission(item.permission as any)
  );

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {filteredItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.path ? (
              <Link
                to={item.path}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};