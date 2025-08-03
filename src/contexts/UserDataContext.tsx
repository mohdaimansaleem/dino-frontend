import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userDataService, UserData, VenueData } from '../services/userDataService';
import { useAuth } from './AuthContext';

interface UserDataContextType {
  // Current data
  userData: UserData | null;
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  
  // Convenience methods
  hasPermission: (permission: keyof UserData['permissions']) => boolean;
  getUserRole: () => string;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  getVenueDisplayName: () => string;
  getWorkspaceDisplayName: () => string;
  getUserDisplayName: () => string;
  getVenueStatsSummary: () => string;
  
  // Data getters
  getUser: () => UserData['user'] | null;
  getVenue: () => UserData['venue'] | null;
  getWorkspace: () => UserData['workspace'] | null;
  getStatistics: () => UserData['statistics'] | null;
  getMenuItems: () => UserData['menu_items'];
  getTables: () => UserData['tables'];
  getRecentOrders: () => UserData['recent_orders'];
  getUsers: () => UserData['users'];
  getPermissions: () => UserData['permissions'] | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user data when authenticated
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping user data loading');
      setUserData(null);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading user data...');
      const data = await userDataService.getUserData();
      setUserData(data);
      console.log('User data loaded successfully');
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setUserData(null);
      
      // Don't throw error here, let components handle the null state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initialize user data when authentication changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Refresh user data
  const refreshUserData = async () => {
    await loadUserData();
  };

  // SECURITY FIX: Venue switching functionality removed
  // Reason: It allowed superadmin to access all venue data, violating security principles
  // Users should only access their assigned venue

  // Convenience methods
  const hasPermission = (permission: keyof UserData['permissions']): boolean => {
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
    return userDataService.getVenueDisplayName(userData);
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
  const getStatistics = () => userData?.statistics || null;
  const getMenuItems = () => userData?.menu_items || [];
  const getTables = () => userData?.tables || [];
  const getRecentOrders = () => userData?.recent_orders || [];
  const getUsers = () => userData?.users || [];
  const getPermissions = () => userData?.permissions || null;

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