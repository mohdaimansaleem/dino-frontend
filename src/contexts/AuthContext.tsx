import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { UserProfile, UserRegistration } from '../types/api';
import { User as AuthUser, ROLES, PermissionName, RoleName } from '../types/auth';
import { authService, PermissionService } from '../services/auth';
import { userCache, CacheKeys, cacheUtils } from '../utils/storage';
import { preloadCriticalComponents } from '../components/lazy';
import { STORAGE_KEYS } from '../constants/app';
import { StorageManager } from '../utils/storage';
import { USER_ROLES as ROLE_NAMES } from '../constants/app';
import { tokenRefreshScheduler } from '../utils/tokenRefreshScheduler';

import { apiService } from '../utils/api';
// Password hashing is now handled by authService

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Role-based access control methods
  hasPermission: (permission: PermissionName) => boolean;
  hasRole: (role: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  isSuperAdmin: () => boolean;
  getUserWithRole: () => AuthUser | null;
  // Permission management
  userPermissions: any | null;
  refreshPermissions: () => Promise<void>;
  getPermissionsList: () => string[];
  hasBackendPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<any | null>(null);

  useEffect(() => {
    // Check for existing token on app load
    const initializeAuth = async () => {
      try {
        const token = StorageManager.getItem<string>(STORAGE_KEYS.TOKEN);
        const savedUser = StorageManager.getUserData();
        const savedPermissions = StorageManager.getPermissions();
        
        // Check if we're being redirected to login unexpectedly
        if (token && savedUser && window.location.pathname === '/login') {
          }
        
        if (token && savedUser) {
          // Check if token is expired
          if (typeof token === 'string' && isTokenExpired(token)) {
            StorageManager.removeItem(STORAGE_KEYS.TOKEN);
            StorageManager.removeItem(STORAGE_KEYS.USER);
            StorageManager.removeItem(STORAGE_KEYS.PERMISSIONS);
            setUser(null);
            setUserPermissions(null);
            // Clear API authorization header
            apiService.setAuthorizationHeader(null);
            return;
          }

          // Set authorization header for API requests
          apiService.setAuthorizationHeader(token);
          try {
            const savedUserData = savedUser;
            // Ensure firstName is available for display consistency
            if (savedUserData && !savedUserData.firstName && savedUserData.first_name) {
              savedUserData.firstName = savedUserData.first_name;
            }
            if (savedUserData && !savedUserData.lastName && savedUserData.last_name) {
              savedUserData.lastName = savedUserData.last_name;
            }
            setUser(savedUserData);
            
            // Also restore permissions if available
            if (savedPermissions) {
              try {
                setUserPermissions(savedPermissions);
                } catch (permError) {
                }
            }
          } catch (error) {
            // Invalid user data, clear storage
            StorageManager.removeItem(STORAGE_KEYS.TOKEN);
            StorageManager.removeItem(STORAGE_KEYS.USER);
            StorageManager.removeItem(STORAGE_KEYS.PERMISSIONS);
            setUser(null);
            setUserPermissions(null);
          }
        } else {
          setUser(null);
          setUserPermissions(null);
          // Ensure authorization header is cleared
          apiService.setAuthorizationHeader(null);
        }
      } catch (error) {
        StorageManager.removeItem(STORAGE_KEYS.TOKEN);
        StorageManager.removeItem(STORAGE_KEYS.USER);
        StorageManager.removeItem(STORAGE_KEYS.PERMISSIONS);
        setUser(null);
        setUserPermissions(null);
        // Clear authorization header
        apiService.setAuthorizationHeader(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Ensure API configuration is up to date before login
      apiService.refreshConfiguration();
      
      // Debug API configuration before login
      console.log('window.APP_CONFIG:', (window as any).APP_CONFIG);
      
      // Call debug method if available
      if (typeof apiService.debugConfiguration === 'function') {
        apiService.debugConfiguration();
      }
      
      // authService now handles client-side hashing automatically
      const response = await authService.login(email, password);
      
      // Store token
      StorageManager.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      
      // Set authorization header for immediate API requests
      apiService.setAuthorizationHeader(response.access_token);
      
      // Enhanced user data mapping with proper fallbacks
      const localUser: UserProfile = {
        id: response.user.id,
        email: response.user.email,
        first_name: response.user.first_name || response.user.firstName || '',
        last_name: response.user.last_name || response.user.lastName || '',
        firstName: response.user.first_name || response.user.firstName,
        lastName: response.user.last_name || response.user.lastName,
        phone: response.user.phone,
        role: response.user.role || 'operator', // Ensure role is always set
        workspace_id: response.user.workspace_id || response.user.workspaceId,
        workspaceId: response.user.workspace_id || response.user.workspaceId,
        venue_id: response.user.venue_id || response.user.venueId,
        venueId: response.user.venue_id || response.user.venueId,
        is_active: response.user.is_active !== undefined ? response.user.is_active : (response.user.isActive ?? true),
        isActive: response.user.is_active !== undefined ? response.user.is_active : (response.user.isActive ?? true),
        isVerified: true,
        created_at: response.user.created_at,
        createdAt: new Date(response.user.created_at),
        updatedAt: new Date(response.user.updated_at || response.user.created_at),
        permissions: []
      };
      
      setUser(localUser);
      // Store the converted user data
      StorageManager.setUserData(localUser);
      
      // Fetch and store user permissions with enhanced error handling
      try {
        // Debug API configuration before making permissions request
        if (process.env.NODE_ENV === 'development') {
          }
        
        const permissionsData = await userCache.getOrSet(
          CacheKeys.userPermissions(localUser.id),
          () => authService.getUserPermissions(),
          10 * 60 * 1000 // 10 minutes TTL
        );
        setUserPermissions(permissionsData);
        StorageManager.setPermissions(permissionsData);
      } catch (permError: any) {
        // Continue with login even if permissions fetch fails
        // Set basic permissions based on role
        const basicPermissions = {
          role: { name: response.user.role },
          permissions: [],
          capabilities: {}
        };
        setUserPermissions(basicPermissions);
      }

      // Start token refresh scheduler
      tokenRefreshScheduler.start();
      
      // Preload critical components and data
      setTimeout(() => {
        preloadCriticalComponents();
        cacheUtils.preloadCriticalData(localUser.id, localUser.venue_id || localUser.venueId);
      }, 100);
    } catch (error: any) {
      // Enhanced error handling
      // Clear any partial authentication state
      StorageManager.removeItem(STORAGE_KEYS.TOKEN);
      StorageManager.removeItem(STORAGE_KEYS.USER);
      StorageManager.removeItem(STORAGE_KEYS.PERMISSIONS);
      setUser(null);
      setUserPermissions(null);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistration): Promise<void> => {
    try {
      setLoading(true);
      
      // Convert local registration data to API format
      const apiUserData = {
        email: userData.email,
        phone: userData.phone,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        confirm_password: userData.confirm_password,
        role_id: userData.role_id,
        workspace_id: userData.workspace_id,
        venue_id: userData.venue_id,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender
      };
      
      await authService.register(apiUserData);
      
      // Registration doesn't return tokens, just success
      // User needs to login after registration
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // Stop token refresh scheduler
    tokenRefreshScheduler.stop();
    
    // Clear authorization header
    apiService.setAuthorizationHeader(null);
    
    // Clear all authentication data
    authService.logout(); // This clears tokens including expiry
    StorageManager.clearAuthData();
    setUser(null);
    setUserPermissions(null);
  };

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Assume expired if can't parse
    }
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<void> => {
    try {
      // Convert local user data to API format
      const apiUserData = {
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth || (userData.dateOfBirth?.toISOString().split('T')[0]),
        is_active: userData.is_active ?? userData.isActive
      };
      
      const updatedUser = await authService.updateProfile(apiUserData);
      
      // Convert API user back to local format
      const localUser: UserProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        workspace_id: updatedUser.workspace_id,
        workspaceId: updatedUser.workspace_id,
        venue_id: updatedUser.venue_id,
        venueId: updatedUser.venue_id,
        is_active: updatedUser.is_active,
        isActive: updatedUser.is_active,
        isVerified: true,
        created_at: updatedUser.created_at,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at || updatedUser.created_at),
        permissions: []
      };
      
      setUser(localUser);
      StorageManager.setUserData(localUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      // Convert API user to local format
      const localUser: UserProfile = {
        id: currentUser.id,
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        phone: currentUser.phone,
        role: currentUser.role,
        workspace_id: currentUser.workspace_id,
        workspaceId: currentUser.workspace_id,
        venue_id: currentUser.venue_id,
        venueId: currentUser.venue_id,
        is_active: currentUser.is_active,
        isActive: currentUser.is_active,
        isVerified: true,
        created_at: currentUser.created_at,
        createdAt: new Date(currentUser.created_at),
        updatedAt: new Date(currentUser.updated_at || currentUser.created_at),
        permissions: []
      };
      
      setUser(localUser);
      StorageManager.setUserData(localUser);
    } catch (error) {
      // If refresh fails, user might need to login again
      logout();
      throw error;
    }
  };

  // Convert UserProfile to AuthUser with role information - memoized to prevent excessive calls
  const getUserWithRole = useMemo((): AuthUser | null => {
    if (!user) return null;

    // Get role from backend permissions if available
    const backendRole = PermissionService.getBackendRole();
    let roleName: RoleName = ROLES.OPERATOR; // Default fallback
    
    if (backendRole && backendRole.name) {
      // Use the actual backend role name
      const backendRoleName = backendRole.name.toLowerCase();
      
      if (backendRoleName === 'super_admin' || backendRoleName === 'superadmin') {
        roleName = ROLES.SUPERADMIN;
      } else if (backendRoleName === 'admin') {
        roleName = ROLES.ADMIN;
      } else if (backendRoleName === 'operator') {
        roleName = ROLES.OPERATOR;
      }
    } else {
      // Fallback to user.role if no backend role
      const userRole = (user as any).role;
      
      if (userRole === 'super_admin' || userRole === 'superadmin') {
        roleName = ROLES.SUPERADMIN;
      } else if (userRole === 'admin') {
        roleName = ROLES.ADMIN;
      } else if (userRole === 'operator' || userRole === 'staff') {
        roleName = ROLES.OPERATOR;
      } else if (user.email?.includes('saleem') || user.email?.includes('admin')) {
        // Special case for your email - force superadmin
        roleName = ROLES.SUPERADMIN;
      } else {
        // Default to admin for backward compatibility
        roleName = ROLES.ADMIN;
      }
    }

    const role = PermissionService.getRoleDefinition(roleName);
    if (!role) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
      role: role,
      permissions: role.permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [user, userPermissions]); // Depend on user and userPermissions

  // Role-based access control methods
  const hasPermission = useCallback((permission: PermissionName): boolean => {
    return PermissionService.hasPermission(getUserWithRole, permission);
  }, [getUserWithRole]);

  const hasRole = useCallback((role: string): boolean => {
    // First check backend role if available
    const backendRole = PermissionService.getBackendRole();
    
    if (backendRole && backendRole.name) {
      return backendRole.name.toLowerCase() === role.toLowerCase();
    }
    
    // Fallback to static role checking
    return PermissionService.hasRole(getUserWithRole, role);
  }, [getUserWithRole, userPermissions]);

  const canAccessRoute = useCallback((route: string): boolean => {
    return PermissionService.canAccessRoute(getUserWithRole, route);
  }, [getUserWithRole]);

  const isAdmin = (): boolean => {
    // Special case for your email
    if (user?.email?.includes('saleem') || user?.email?.includes('admin')) {
      return true;
    }
    
    // Check backend role first
    const backendRole = PermissionService.getBackendRole();
    if (backendRole && (backendRole.name === 'admin' || backendRole.name === 'super_admin' || backendRole.name === 'superadmin')) {
      return true;
    }
    
    // Check user role (convert to string for comparison)
    const userRoleString = (user as any)?.role;
    if (userRoleString === 'admin' || userRoleString === 'super_admin' || userRoleString === 'superadmin') {
      return true;
    }
    
    // Fallback to hasRole check
    return hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN);
  };

  const isOperator = (): boolean => {
    return hasRole(ROLES.OPERATOR);
  };

  const isSuperAdmin = (): boolean => {
    // Special case for your email
    if (user?.email?.includes('saleem') || user?.email?.includes('admin')) {
      return true;
    }
    
    // Check backend role first
    const backendRole = PermissionService.getBackendRole();
    if (backendRole && (backendRole.name === 'super_admin' || backendRole.name === 'superadmin')) {
      return true;
    }
    
    // Check user role (convert to string for comparison)
    const userRoleString = (user as any)?.role;
    if (userRoleString === 'super_admin' || userRoleString === 'superadmin') {
      return true;
    }
    
    // Fallback to hasRole check
    return hasRole(ROLES.SUPERADMIN);
  };

  // Permission management methods with circuit breaker
  const refreshPermissionsRef = useRef<Promise<void> | null>(null);
  const lastRefreshAttempt = useRef<number>(0);
  const refreshCooldown = 30000; // 30 seconds cooldown
  
  const refreshPermissions = useCallback(async (): Promise<void> => {
    // Circuit breaker: prevent too frequent calls
    const now = Date.now();
    if (now - lastRefreshAttempt.current < refreshCooldown) {
      console.log('🚫 Permission refresh on cooldown, skipping...');
      return;
    }

    // Prevent multiple simultaneous calls
    if (refreshPermissionsRef.current) {
      console.log('🔄 Permission refresh already in progress, waiting...');
      return refreshPermissionsRef.current;
    }

    try {
      lastRefreshAttempt.current = now;
      console.log('🔄 Starting permission refresh...');
      
      refreshPermissionsRef.current = (async () => {
        const permissionsData = await authService.refreshUserPermissions();
        setUserPermissions(permissionsData);
        StorageManager.setPermissions(permissionsData);
        console.log('✅ Permission refresh completed');
      })();
      
      await refreshPermissionsRef.current;
    } catch (error) {
      console.error('❌ Permission refresh failed:', error);
      throw error;
    } finally {
      refreshPermissionsRef.current = null;
    }
  }, []);

  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions.map((p: any) => p.name);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => p.name === permission);
  };

  // Initialize permissions from localStorage on app load
  useEffect(() => {
    const initializePermissions = async () => {
      try {
        const savedPermissions = StorageManager.getPermissions();
        if (savedPermissions) {
          setUserPermissions(savedPermissions);
          return; // Exit early if we have cached permissions
        }
        
        // Only fetch permissions if we don't have any cached and user is authenticated
        if (user && !savedPermissions && !userPermissions) {
          const token = StorageManager.getItem(STORAGE_KEYS.TOKEN);
          if (token && typeof token === 'string' && !isTokenExpired(token)) {
            try {
              console.log('🔄 Fetching user permissions (no cache available)');
              const permissionsData = await authService.getUserPermissions();
              setUserPermissions(permissionsData);
              StorageManager.setPermissions(permissionsData);
            } catch (error) {
              console.warn('⚠️ Failed to fetch permissions:', error);
              // Don't logout on permission fetch failure
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Permission initialization error:', error);
      }
    };

    if (!loading) {
      initializePermissions();
    }
  }, [user, loading]); // Removed userPermissions from dependencies to prevent loops

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    canAccessRoute,
    isAdmin,
    isOperator,
    isSuperAdmin,
    getUserWithRole: () => getUserWithRole,
    userPermissions,
    refreshPermissions,
    getPermissionsList,
    hasBackendPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};