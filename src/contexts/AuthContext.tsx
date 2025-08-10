import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { UserProfile, UserRegistration } from '../types/api';

import { User as AuthUser, ROLES, PermissionName, RoleName } from '../types/auth';

import { authService } from '../services/authService';

import PermissionService from '../services/permissionService';

import { userCache, CacheKeys, cacheUtils } from '../services/cacheService';

import { preloadCriticalComponents } from '../components/LazyComponents';

import { STORAGE_KEYS } from '../constants/storage';

import { ROLE_NAMES } from '../constants/roles';

import { tokenRefreshScheduler } from '../utils/tokenRefreshScheduler';

import { API_CONFIG } from '../config/api';

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

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

    const savedPermissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);

     



     

    // Check if we're being redirected to login unexpectedly

    if (token && savedUser && window.location.pathname === '/login') {

     }

     

    if (token && savedUser) {

     // Check if token is expired

     if (isTokenExpired(token)) {

      localStorage.removeItem(STORAGE_KEYS.TOKEN);

      localStorage.removeItem(STORAGE_KEYS.USER);

      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

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

      localStorage.removeItem(STORAGE_KEYS.TOKEN);

      localStorage.removeItem(STORAGE_KEYS.USER);

      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

      setUser(null);

      setUserPermissions(null);

     }

    } else {

     setUser(null);

     setUserPermissions(null);

    }

   } catch (error) {

    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    localStorage.removeItem(STORAGE_KEYS.USER);

    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

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

    

   // authService now handles client-side hashing automatically

   const response = await authService.login(email, password);

    

   // Store token

   localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);

    

   // Enhanced user data mapping with proper fallbacks

   const localUser: UserProfile = {

    id: response.user.id,

    email: response.user.email,

    first_name: response.user.first_name || response.user.firstName || '',

    last_name: response.user.last_name || response.user.lastName || '',

    firstName: response.user.first_name || response.user.firstName,

    lastName: response.user.last_name || response.user.lastName,

    phone: response.user.phone,

    role: response.user.role,

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

   localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUser));

    

   // Fetch and store user permissions with enhanced error handling

   try {

    // Debug API configuration before making permissions request

    if (process.env.NODE_ENV === 'development') {

     console.log('🔧 About to fetch permissions - debugging API config...');

     console.log('API Base URL from config:', API_CONFIG.BASE_URL);

     console.log('Current location:', window.location.href);

    }

     

    const permissionsData = await userCache.getOrSet(

     CacheKeys.userPermissions(localUser.id),

     () => authService.getUserPermissions(),

     10 * 60 * 1000 // 10 minutes TTL

    );

    setUserPermissions(permissionsData);

    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissionsData));

   } catch (permError: any) {

    console.warn('Failed to fetch user permissions:', permError);

    console.error('Permissions error details:', {

     message: permError?.message,

     status: permError?.response?.status,

     data: permError?.response?.data

    });

     

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

   console.error('Login error:', error);

    

   // Clear any partial authentication state

   localStorage.removeItem(STORAGE_KEYS.TOKEN);

   localStorage.removeItem(STORAGE_KEYS.USER);

   localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

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

   

  // Clear all authentication data

  authService.logout(); // This clears tokens including expiry

  localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

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

   localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUser));

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

   localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUser));

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

   if (backendRoleName === ROLE_NAMES.SUPERADMIN) {

    roleName = ROLES.SUPERADMIN;

   } else if (backendRoleName === ROLE_NAMES.ADMIN) {

    roleName = ROLES.ADMIN;

   } else if (backendRoleName === ROLE_NAMES.OPERATOR) {

    roleName = ROLES.OPERATOR;

   }

  } else {

   // Fallback to user.role if no backend role

   const userRole = (user as any).role;

   if (userRole === ROLE_NAMES.SUPERADMIN) {

    roleName = ROLES.SUPERADMIN;

   } else if (userRole === ROLE_NAMES.ADMIN) {

    roleName = ROLES.ADMIN;

   } else if (userRole === ROLE_NAMES.OPERATOR || userRole === ROLE_NAMES.STAFF) {

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

   firstName: user.first_name || user.firstName,

   lastName: user.last_name || user.lastName,

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

  // Check backend role first

  const backendRole = PermissionService.getBackendRole();

  if (backendRole && (backendRole.name === ROLE_NAMES.ADMIN || backendRole.name === ROLE_NAMES.SUPERADMIN)) {

   return true;

  }

   

  // Check user role

  if (user?.role === ROLE_NAMES.ADMIN || (user as any)?.role === ROLE_NAMES.ADMIN || 

    user?.role === ROLE_NAMES.SUPERADMIN || (user as any)?.role === ROLE_NAMES.SUPERADMIN) {

   return true;

  }

   

  // Fallback to hasRole check

  return hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN);

 };



 const isOperator = (): boolean => {

  return hasRole(ROLES.OPERATOR);

 };



 const isSuperAdmin = (): boolean => {

  // Check backend role first

  const backendRole = PermissionService.getBackendRole();

  if (backendRole && backendRole.name === ROLE_NAMES.SUPERADMIN) {

   return true;

  }

   

  // Check user role

  if (user?.role === ROLE_NAMES.SUPERADMIN || (user as any)?.role === ROLE_NAMES.SUPERADMIN) {

   return true;

  }

   



   

  // Fallback to hasRole check

  return hasRole(ROLES.SUPERADMIN);

 };



 // Permission management methods

 const refreshPermissions = async (): Promise<void> => {

  try {

   const permissionsData = await authService.refreshUserPermissions();

   setUserPermissions(permissionsData);

   localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissionsData));

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

    const savedPermissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);

    if (savedPermissions) {

     const parsed = JSON.parse(savedPermissions);

     setUserPermissions(parsed);

    }

     

    // If user is logged in but no permissions cached, fetch them (but only if token is valid)

    if (user && !savedPermissions) {

     const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

     if (token && !isTokenExpired(token)) {

      try {

       const permissionsData = await authService.getUserPermissions();

       setUserPermissions(permissionsData);

       localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissionsData));

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