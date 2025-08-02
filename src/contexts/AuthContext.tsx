import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRegistration } from '../types';
import { User as AuthUser, ROLES, PermissionName, RoleName } from '../types/auth';
import { authService } from '../services/authService';
import PermissionService from '../services/permissionService';
import { userCache, CacheKeys, cacheUtils } from '../services/cacheService';
import { preloadCriticalComponents } from '../components/LazyComponents';

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
        const token = localStorage.getItem('dino_token');
        const savedUser = localStorage.getItem('dino_user');
        const savedPermissions = localStorage.getItem('dino_permissions');
        

        
        // Check if we're being redirected to login unexpectedly
        if (token && savedUser && window.location.pathname === '/login') {
          }
        
        if (token && savedUser) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            localStorage.removeItem('dino_token');
            localStorage.removeItem('dino_user');
            localStorage.removeItem('dino_permissions');
            setUser(null);
            setUserPermissions(null);
            return;
          }

          try {
            const savedUserData = JSON.parse(savedUser);
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
                const permissionsData = JSON.parse(savedPermissions);
                setUserPermissions(permissionsData);
                } catch (permError) {
                }
            }
          } catch (error) {
            // Invalid user data, clear storage
            localStorage.removeItem('dino_token');
            localStorage.removeItem('dino_user');
            localStorage.removeItem('dino_permissions');
            setUser(null);
            setUserPermissions(null);
          }
        } else {
          setUser(null);
          setUserPermissions(null);
        }
      } catch (error) {
        localStorage.removeItem('dino_token');
        localStorage.removeItem('dino_user');
        localStorage.removeItem('dino_permissions');
        setUser(null);
        setUserPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      // Store token
      localStorage.setItem('dino_token', response.access_token);
      
      // Convert API user to local user format
      const localUser: UserProfile = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        phone: response.user.phone,
        role: response.user.role as any,
        permissions: [],
        workspaceId: response.user.workspace_id,
        workspace_id: response.user.workspace_id,
        cafeId: response.user.venue_id,
        venue_id: response.user.venue_id,
        isActive: response.user.is_active,
        isVerified: true,
        createdAt: new Date(response.user.created_at),
        updatedAt: new Date(response.user.updated_at || response.user.created_at)
      } as UserProfile;
      
      setUser(localUser);
      // Store the converted user data
      localStorage.setItem('dino_user', JSON.stringify(localUser));
      
      // Fetch and store user permissions with caching
      try {
        const permissionsData = await userCache.getOrSet(
          CacheKeys.userPermissions(localUser.id),
          () => authService.getUserPermissions(),
          10 * 60 * 1000 // 10 minutes TTL
        );
        setUserPermissions(permissionsData);
        localStorage.setItem('dino_permissions', JSON.stringify(permissionsData));
      } catch (error) {
        // Continue with login even if permissions fetch fails
      }

      // Preload critical components and data
      setTimeout(() => {
        preloadCriticalComponents();
        cacheUtils.preloadCriticalData(localUser.id, localUser.venue_id || localUser.cafeId);
      }, 100);
    } catch (error) {
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
        first_name: userData.firstName,
        last_name: userData.lastName,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role_id: userData.role,
        workspace_id: (userData as any).workspaceId || '',
        venue_id: (userData as any).cafeId,
        date_of_birth: userData.dateOfBirth?.toISOString().split('T')[0],
        gender: userData.gender
      };
      
      const response = await authService.register(apiUserData);
      
      // Registration doesn't return tokens, just success
      // User needs to login after registration
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // This will show us where logout is being called from
    localStorage.removeItem('dino_token');
    localStorage.removeItem('dino_user');
    localStorage.removeItem('dino_refresh_token');
    localStorage.removeItem('dino_permissions');
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
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        date_of_birth: userData.dateOfBirth?.toISOString().split('T')[0],
        is_active: userData.isActive
      };
      
      const updatedUser = await authService.updateProfile(apiUserData);
      
      // Convert API user back to local format
      const localUser: UserProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        role: updatedUser.role as any,
        permissions: [],
        workspaceId: updatedUser.workspace_id,
        workspace_id: updatedUser.workspace_id,
        cafeId: updatedUser.venue_id,
        venue_id: updatedUser.venue_id,
        isActive: updatedUser.is_active,
        isVerified: true,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at || updatedUser.created_at)
      } as UserProfile;
      
      setUser(localUser);
      localStorage.setItem('dino_user', JSON.stringify(localUser));
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
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        phone: currentUser.phone,
        role: currentUser.role as any,
        permissions: [],
        workspaceId: currentUser.workspace_id,
        workspace_id: currentUser.workspace_id,
        cafeId: currentUser.venue_id,
        venue_id: currentUser.venue_id,
        isActive: currentUser.is_active,
        isVerified: true,
        createdAt: new Date(currentUser.created_at),
        updatedAt: new Date(currentUser.updated_at || currentUser.created_at)
      } as UserProfile;
      
      setUser(localUser);
      localStorage.setItem('dino_user', JSON.stringify(localUser));
    } catch (error) {
      // If refresh fails, user might need to login again
      logout();
      throw error;
    }
  };

  // Convert UserProfile to AuthUser with role information
  const getUserWithRole = (): AuthUser | null => {
    if (!user) return null;

    // Get role from backend permissions if available
    const backendRole = PermissionService.getBackendRole();
    let roleName: RoleName = ROLES.OPERATOR; // Default fallback
    
    if (backendRole && backendRole.name) {
      // Use the actual backend role name
      const backendRoleName = backendRole.name.toLowerCase();
      if (backendRoleName === 'superadmin') {
        roleName = ROLES.SUPERADMIN;
      } else if (backendRoleName === 'admin') {
        roleName = ROLES.ADMIN;
      } else if (backendRoleName === 'operator') {
        roleName = ROLES.OPERATOR;
      }
    } else {
      // Fallback to user.role if no backend role
      const userRole = (user as any).role;
      if (userRole === 'superadmin') {
        roleName = ROLES.SUPERADMIN;
      } else if (userRole === 'admin') {
        roleName = ROLES.ADMIN;
      } else if (userRole === 'operator' || userRole === 'staff') {
        roleName = ROLES.OPERATOR;
      } else if (user.email?.includes('operator')) {
        roleName = ROLES.OPERATOR;
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
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
      permissions: role.permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Role-based access control methods
  const hasPermission = (permission: PermissionName): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.hasPermission(authUser, permission);
  };

  const hasRole = (role: string): boolean => {
    // First check backend role if available
    const backendRole = PermissionService.getBackendRole();
    
    if (backendRole && backendRole.name) {
      const hasRoleResult = backendRole.name.toLowerCase() === role.toLowerCase();
      return hasRoleResult;
    }
    
    // Fallback to static role checking
    const authUser = getUserWithRole();
    const staticResult = PermissionService.hasRole(authUser, role);
    return staticResult;
  };

  const canAccessRoute = (route: string): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.canAccessRoute(authUser, route);
  };

  const isAdmin = (): boolean => {
    return hasRole(ROLES.ADMIN);
  };

  const isOperator = (): boolean => {
    return hasRole(ROLES.OPERATOR);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(ROLES.SUPERADMIN);
  };

  // Permission management methods
  const refreshPermissions = async (): Promise<void> => {
    try {
      const permissionsData = await authService.refreshUserPermissions();
      setUserPermissions(permissionsData);
      localStorage.setItem('dino_permissions', JSON.stringify(permissionsData));
    } catch (error) {
      throw error;
    }
  };

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
        const savedPermissions = localStorage.getItem('dino_permissions');
        if (savedPermissions) {
          const parsed = JSON.parse(savedPermissions);
          setUserPermissions(parsed);
        }
        
        // If user is logged in but no permissions cached, fetch them (but only if token is valid)
        if (user && !savedPermissions) {
          const token = localStorage.getItem('dino_token');
          if (token && !isTokenExpired(token)) {
            try {
              const permissionsData = await authService.getUserPermissions();
              setUserPermissions(permissionsData);
              localStorage.setItem('dino_permissions', JSON.stringify(permissionsData));
              } catch (error) {
              // Don't logout on permission fetch failure
            }
          }
        }
      } catch (error) {
        }
    };

    if (!loading) {
      initializePermissions();
    }
  }, [user, loading]);

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
    getUserWithRole,
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