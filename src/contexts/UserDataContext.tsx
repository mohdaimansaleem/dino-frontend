import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userDataService, UserData, VenueData, AvailableVenues } from '../services/userDataService';
import { useAuth } from './AuthContext';

interface UserDataContextType {
  // Current data
  userData: UserData | null;
  availableVenues: AvailableVenues | null;
  
  // Loading states
  loading: boolean;
  venueLoading: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  switchVenue: (venueId: string) => Promise<void>;
  loadAvailableVenues: () => Promise<void>;
  
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
  const [availableVenues, setAvailableVenues] = useState<AvailableVenues | null>(null);
  const [loading, setLoading] = useState(false);
  const [venueLoading, setVenueLoading] = useState(false);

  // Load user data when authenticated
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping user data loading');
      setUserData(null);
      setAvailableVenues(null);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading user data...');
      const data = await userDataService.getUserData();
      setUserData(data);
      
      // If user is superadmin, also load available venues
      if (data && userDataService.isSuperAdmin(data)) {
        try {
          const venues = await userDataService.getAvailableVenues();
          setAvailableVenues(venues);
        } catch (error) {
          console.warn('Failed to load available venues:', error);
        }
      }
      
      console.log('User data loaded successfully');
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setUserData(null);
      setAvailableVenues(null);
      
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

  // Switch venue (for superadmin)
  const switchVenue = async (venueId: string) => {
    if (!userData || !userDataService.isSuperAdmin(userData)) {
      throw new Error('Only superadmin can switch venues');
    }

    setVenueLoading(true);
    try {
      console.log('Switching to venue:', venueId);
      const venueData = await userDataService.getVenueData(venueId);
      
      if (venueData && userData) {
        // Update current user data with new venue data
        const updatedUserData: UserData = {
          ...userData,
          venue: venueData.venue,
          statistics: venueData.statistics,
          menu_items: venueData.menu_items,
          tables: venueData.tables,
          recent_orders: venueData.recent_orders,
          users: venueData.users,
          user: {
            ...userData.user,
            venue_id: venueData.venue.id
          }
        };
        
        setUserData(updatedUserData);
        console.log('Venue switched successfully');
      }
    } catch (error: any) {
      console.error('Error switching venue:', error);
      throw error;
    } finally {
      setVenueLoading(false);
    }
  };

  // Load available venues
  const loadAvailableVenues = async () => {
    if (!userData || !userDataService.isSuperAdmin(userData)) {
      return;
    }

    try {
      const venues = await userDataService.getAvailableVenues();
      setAvailableVenues(venues);
    } catch (error) {
      console.error('Error loading available venues:', error);
    }
  };

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
    availableVenues,
    loading,
    venueLoading,
    refreshUserData,
    switchVenue,
    loadAvailableVenues,
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