import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userDataService, UserData } from '../services/auth';
import { useAuth } from './AuthContext';
import { validateVenueAccess, getVenueDisplayName as getVenueDisplayNameUtil } from '../utils/venueUtils';
import StorageManager from '../utils/storage';

interface UserDataContextType {
  // Current data
  userData: UserData | null;
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  
  // Convenience methods
  hasPermission: (permission: string) => boolean;
  getUserRole: () => string;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  getVenueDisplayName: () => string;
  hasVenue: () => boolean;
  getWorkspaceDisplayName: () => string;
  getUserDisplayName: () => string;
  getVenueStatsSummary: () => string;
  
  // Data getters
  getUser: () => UserData['user'] | null;
  getVenue: () => UserData['venue'] | null;
  getWorkspace: () => UserData['workspace'] | null;
  getStatistics: () => any | null;
  getMenuItems: () => any[];
  getTables: () => any[];
  getRecentOrders: () => any[];
  getUsers: () => any[];
  getPermissions: () => any | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load user data when authenticated
  const loadUserData = useCallback(async (force: boolean = false) => {
    if (!isAuthenticated) {
      setUserData(null);
      setInitialized(true);
      return;
    }

    // Check if we have a token
    const token = StorageManager.getItem<string>(StorageManager.KEYS.TOKEN);
    if (!token) {
      setUserData(null);
      setInitialized(true);
      return;
    }

    // Prevent duplicate calls - only load if forced or not already loading/loaded
    if (!force && (loading || (userData && initialized))) {
      return;
    }

    setLoading(true);
    try {
      const data = await userDataService.getUserData();
      setUserData(data);
      setInitialized(true);
      } catch (error: any) {
      setUserData(null);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loading, userData, initialized]);

  // Initialize user data when authentication changes
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      loadUserData(true);
    } else if (!isAuthenticated && initialized) {
      setUserData(null);
      setInitialized(false);
    }
  }, [isAuthenticated, initialized, loadUserData]);

  // Additional effect to ensure data is loaded after login - with better conditions
  useEffect(() => {
    if (isAuthenticated && user && !userData && !loading && initialized) {
      loadUserData(true);
    }
  }, [isAuthenticated, user, userData, loading, initialized, loadUserData]);

  // Refresh user data
  const refreshUserData = async () => {
    await loadUserData(true);
  };

  // SECURITY FIX: Venue switching functionality removed
  // Reason: It allowed superadmin to access all venue data, violating security principles
  // Users should only access their assigned venue

  // Convenience methods
  const hasPermission = (permission: string): boolean => {
    return userDataService.hasPermission(userData, permission);
  };

  const getUserRole = (): string => {
    return userDataService.getUserRole(userData);
  };

  const isSuperAdmin = (): boolean => {
    return userDataService.isSuperAdmin(userData);
  };

  const isAdmin = (): boolean => {
    return userDataService.isAdmin(userData);
  };

  const isOperator = (): boolean => {
    return userDataService.isOperator(userData);
  };

  const getVenueDisplayName = (): string => {
    return getVenueDisplayNameUtil(userData, user);
  };

  const hasVenue = (): boolean => {
    const validation = validateVenueAccess(userData, user);
    return validation.hasVenue;
  };

  const getWorkspaceDisplayName = (): string => {
    return userDataService.getWorkspaceDisplayName(userData);
  };

  const getUserDisplayName = (): string => {
    return userDataService.getUserDisplayName(userData);
  };

  const getVenueStatsSummary = (): string => {
    return userDataService.getVenueStatsSummary(userData);
  };

  // Data getters
  const getUser = () => userData?.user || null;
  const getVenue = () => userData?.venue || null;
  const getWorkspace = () => userData?.workspace || null;
  const getStatistics = () => null; // Simplified - no statistics in new structure
  const getMenuItems = () => []; // Simplified - no menu items in new structure
  const getTables = () => []; // Simplified - no tables in new structure
  const getRecentOrders = () => []; // Simplified - no recent orders in new structure
  const getUsers = () => []; // Simplified - no users in new structure
  const getPermissions = () => null; // Simplified - no permissions in new structure

  const value: UserDataContextType = {
    userData,
    loading,
    refreshUserData,
    hasPermission,
    getUserRole,
    isSuperAdmin,
    isAdmin,
    isOperator,
    getVenueDisplayName,
    getWorkspaceDisplayName,
    getUserDisplayName,
    getVenueStatsSummary,
    hasVenue,
    getUser,
    getVenue,
    getWorkspace,
    getStatistics,
    getMenuItems,
    getTables,
    getRecentOrders,
    getUsers,
    getPermissions,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};