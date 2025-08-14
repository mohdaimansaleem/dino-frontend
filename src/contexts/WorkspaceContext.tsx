import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Workspace, PricingPlan } from '../types/auth';
import { Venue } from '../types/api';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';
import { useApiCache, useWorkspaceCache, useVenueCache } from '../hooks/useApiCache';
import { apiCache } from '../services/cacheService';

interface WorkspaceContextType {
  // Current workspace and venue
  currentWorkspace: Workspace | null;
  currentVenue: Venue | null;
  
  // Available workspaces and venues
  workspaces: Workspace[];
  venues: Venue[];
  pricingPlans: PricingPlan[];
  
  // Loading states
  loading: boolean;
  workspacesLoading: boolean;
  venuesLoading: boolean;
  
  // Actions
  switchWorkspace: (workspaceId: string) => Promise<void>;
  switchVenue: (venueId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshVenues: () => Promise<void>;
  initializeVenueFromUser: () => Promise<void>;
  
  // Workspace management
  createWorkspace: (workspaceData: any) => Promise<void>;
  updateWorkspace: (workspaceId: string, workspaceData: any) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  
  // Venue management
  createVenue: (venueData: any) => Promise<void>;
  updateVenue: (venueId: string, venueData: any) => Promise<void>;
  deleteVenue: (venueId: string) => Promise<void>;
  activateVenue: (venueId: string) => Promise<void>;
  deactivateVenue: (venueId: string) => Promise<void>;
  toggleVenueStatus: (venueId: string, isOpen: boolean) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);

  // Cached pricing plans (static data)
  const {
    data: cachedPricingPlans,
  } = useApiCache(
    () => workspaceService.getPricingPlans(),
    [],
    {
      cacheKey: 'pricing_plans',
      ttl: 30 * 60 * 1000, // 30 minutes for static data
      refetchOnMount: false,
    }
  );

  // Cached venues for current workspace
  const {
    data: cachedVenues,
    loading: venuesCacheLoading,
    refetch: refetchVenues,
    invalidate: invalidateVenues,
  } = useWorkspaceCache(
    () => user?.workspace_id ? workspaceService.getVenues(user.workspace_id) : Promise.resolve([]),
    user?.workspace_id,
    'workspace_venues',
    [user?.workspace_id],
    {
      enabled: !!user?.workspace_id && isAuthenticated,
      ttl: 5 * 60 * 1000, // 5 minutes
      onSuccess: (venueList) => {
        // Convert API venues to internal format
        const mappedVenues = venueList.map((venue: any) => ({
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          address: venue.location?.address || '',
          phone: venue.phone || '',
          email: venue.email || '',
          ownerId: venue.owner_id || '',
          workspaceId: venue.workspace_id,
          logo: '',
          isActive: venue.is_active !== undefined ? venue.is_active : true,
          isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          settings: {},
          createdAt: new Date(venue.created_at),
          updatedAt: new Date(venue.updated_at || venue.created_at),
          _apiData: venue
        }));
        setVenues(mappedVenues);
      },
    }
  );

  // Cached current venue data
  const {
    refetch: refetchCurrentVenue,
  } = useVenueCache(
    () => {
      const venueId = user?.venueId || user?.venue_id;
      return venueId ? workspaceService.getVenue(venueId) : Promise.resolve(null);
    },
    user?.venueId || user?.venue_id,
    'current_venue',
    [user?.venueId, user?.venue_id],
    {
      enabled: !!(user?.venueId || user?.venue_id) && isAuthenticated,
      onSuccess: (venue) => {
        if (venue) {
          const venueData = {
            id: venue.id,
            name: venue.name,
            description: venue.description || '',
            address: venue.location?.address || '',
            phone: venue.phone || '',
            email: venue.email || '',
            ownerId: user?.id || '',
            workspaceId: venue.workspace_id,
            logo: '',
            isActive: venue.is_active !== undefined ? venue.is_active : true,
            isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
            settings: {},
            createdAt: new Date(venue.created_at),
            updatedAt: new Date(venue.updated_at || venue.created_at),
            _apiData: venue
          };
          setCurrentVenue(venueData as any);
        }
      },
    }
  );

  // Optimized venue loading - now handled by cache hooks
  const loadVenuesForWorkspace = useCallback(async (workspaceId: string) => {
    // This function is now primarily for manual refresh
    // The actual loading is handled by the cached hooks above
    if (workspaceId) {
      await refetchVenues();
    }
  }, [refetchVenues]);

  // Optimized initialization - now uses cached data
  const initializeWorkspaceData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Set pricing plans from cache
      if (cachedPricingPlans) {
        setPricingPlans(cachedPricingPlans);
      }

      // Set current workspace from user data (no API call needed)
      if (user?.workspace_id) {
        const localWorkspace = {
          id: user.workspace_id,
          name: 'Default Workspace',
          description: '',
          ownerId: user.id,
          isActive: true,
          pricingPlan: { id: 'basic', name: 'basic', displayName: 'Basic', price: 0, features: [], maxVenues: 1, maxUsers: 5 },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentWorkspace(localWorkspace as any);
        setWorkspaces([localWorkspace as any]);
      }

      // Current venue will be set by the cached hook
      // No need for manual API calls here
    } catch (error) {
      console.error('Error initializing workspace data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, cachedPricingPlans]);

  // Initialize workspace data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeWorkspaceData();
    } else {
      // Clear data when user logs out
      setCurrentWorkspace(null);
      setCurrentVenue(null);
      setWorkspaces([]);
      setVenues([]);
      // Clear cache on logout
      apiCache.invalidatePattern('.*');
    }
  }, [isAuthenticated, user, initializeWorkspaceData]);

  // Update loading states based on cache loading
  useEffect(() => {
    setVenuesLoading(venuesCacheLoading);
  }, [venuesCacheLoading]);

  // Set venues when cache data is available
  useEffect(() => {
    if (cachedVenues) {
      setVenues(cachedVenues);
      
      // Auto-select first active venue if none selected
      if (!currentVenue && cachedVenues.length > 0) {
        const activeVenue = cachedVenues.find((venue: any) => venue.isActive) || cachedVenues[0];
        setCurrentVenue(activeVenue);
      }
    }
  }, [cachedVenues, currentVenue]);

  const refreshWorkspaces = async () => {
    setWorkspacesLoading(true);
    try {
      // Create workspace from user data if available
      if (user?.workspace_id) {
        const localWorkspace = {
          id: user.workspace_id,
          name: 'Default Workspace',
          description: '',
          ownerId: user.id,
          isActive: true,
          pricingPlan: { id: 'basic', name: 'basic', displayName: 'Basic', price: 0, features: [], maxVenues: 1, maxUsers: 5 },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setWorkspaces([localWorkspace as any]);
        setCurrentWorkspace(localWorkspace as any);
      } else {
        setWorkspaces([]);
      }
    } catch (error: any) {
      console.error('Error refreshing workspaces:', error);
      setWorkspaces([]);
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const refreshVenues = async () => {
    // Use cached refetch function for optimized refresh
    await refetchVenues();
  };



  const switchWorkspace = async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        setCurrentVenue(null); // Clear current venue when switching workspace
        await loadVenuesForWorkspace(workspaceId);
        
        // Store in localStorage for persistence
        localStorage.setItem('dino_current_workspace', workspaceId);
      }
    } catch (error) {
      throw error;
    }
  };

  const switchVenue = async (venueId: string) => {
    try {
      const venue = venues.find(v => v.id === venueId);
      if (venue) {
        setCurrentVenue(venue);
        
        // Store in localStorage for persistence
        localStorage.setItem('dino_current_venue', venueId);
      }
    } catch (error) {
      throw error;
    }
  };

  const createWorkspace = async (workspaceData: any) => {
    try {
      const response = await workspaceService.createWorkspace(workspaceData);
      if (response.success && response.data) {
        await refreshWorkspaces();
        // Auto-switch to new workspace
        await switchWorkspace(response.data.id);
      } else {
        throw new Error(response.message || 'Failed to create workspace');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId: string, workspaceData: any) => {
    try {
      const response = await workspaceService.updateWorkspace(workspaceId, workspaceData);
      if (response.success) {
        await refreshWorkspaces();
        // Update current workspace if it's the one being updated
        if (currentWorkspace?.id === workspaceId && response.data) {
          // Convert API workspace to local format
          const localWorkspace = {
            ...response.data,
            ownerId: response.data.owner_id || '',
            isActive: response.data.is_active,
            pricingPlan: currentWorkspace.pricingPlan, // Keep existing pricing plan
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at || response.data.created_at
          };
          setCurrentWorkspace(localWorkspace as any);
        }
      } else {
        throw new Error(response.message || 'Failed to update workspace');
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const response = await workspaceService.deleteWorkspace(workspaceId);
      if (response.success) {
        await refreshWorkspaces();
        // If current workspace was deleted, switch to first available
        if (currentWorkspace?.id === workspaceId) {
          const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
          if (remainingWorkspaces.length > 0) {
            await switchWorkspace(remainingWorkspaces[0].id);
          } else {
            setCurrentWorkspace(null);
            setCurrentVenue(null);
            setVenues([]);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to delete workspace');
      }
    } catch (error) {
      throw error;
    }
  };

  const createVenue = async (venueData: any) => {
    try {
      const response = await workspaceService.createVenue({
        ...venueData,
        workspaceId: currentWorkspace?.id || ''
      });
      if (response.success && response.data) {
        // Invalidate venue cache to force refresh
        invalidateVenues();
        await refreshVenues();
        // Auto-switch to new venue
        await switchVenue(response.data.id);
      } else {
        throw new Error(response.message || 'Failed to create venue');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateVenue = async (venueId: string, venueData: any) => {
    try {
      const response = await workspaceService.updateVenue(venueId, venueData);
      if (response.success) {
        // Invalidate both venue list and current venue cache
        invalidateVenues();
        apiCache.delete(`current_venue_${venueId}`);
        
        await refreshVenues();
        await refetchCurrentVenue();
      } else {
        throw new Error(response.message || 'Failed to update venue');
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteVenue = async (venueId: string) => {
    try {
      const response = await workspaceService.deleteVenue(venueId);
      if (response.success) {
        // Invalidate all venue-related cache
        invalidateVenues();
        apiCache.delete(`current_venue_${venueId}`);
        
        await refreshVenues();
        // If current venue was deleted, switch to first available
        if (currentVenue?.id === venueId) {
          const remainingVenues = venues.filter(v => v.id !== venueId);
          if (remainingVenues.length > 0) {
            await switchVenue(remainingVenues[0].id);
          } else {
            setCurrentVenue(null);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to delete venue');
      }
    } catch (error) {
      throw error;
    }
  };

  const activateVenue = async (venueId: string) => {
    try {
      const response = await workspaceService.activateVenue(venueId);
      if (response.success) {
        // Invalidate cache for immediate update
        invalidateVenues();
        apiCache.delete(`current_venue_${venueId}`);
        await refreshVenues();
        await refetchCurrentVenue();
      } else {
        throw new Error(response.message || 'Failed to activate venue');
      }
    } catch (error) {
      throw error;
    }
  };

  const deactivateVenue = async (venueId: string) => {
    try {
      const response = await workspaceService.deactivateVenue(venueId);
      if (response.success) {
        // Invalidate cache for immediate update
        invalidateVenues();
        apiCache.delete(`current_venue_${venueId}`);
        await refreshVenues();
        await refetchCurrentVenue();
      } else {
        throw new Error(response.message || 'Failed to deactivate venue');
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleVenueStatus = async (venueId: string, isOpen: boolean) => {
    try {
      const response = await workspaceService.toggleVenueStatus(venueId, isOpen);
      if (response.success) {
        // Invalidate cache for immediate update
        invalidateVenues();
        apiCache.delete(`current_venue_${venueId}`);
        await refreshVenues();
        await refetchCurrentVenue();
      } else {
        throw new Error(response.message || 'Failed to toggle venue status');
      }
    } catch (error) {
      throw error;
    }
  };

  const initializeVenueFromUser = async () => {
    if (!user) {
return;
    }
    
    const venueId = user.venueId || user.venue_id;
    if (!venueId) {
return;
    }

    try {
      const venue = await workspaceService.getVenue(venueId);
      if (venue) {
        const venueData = {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          address: venue.location?.address || '',
          phone: venue.phone || '',
          email: venue.email || '',
          ownerId: user.id,
          workspaceId: venue.workspace_id,
          logo: '',
          isActive: venue.is_active !== undefined ? venue.is_active : true,
          isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          settings: {},
          createdAt: new Date(venue.created_at),
          updatedAt: new Date(venue.updated_at || venue.created_at),
          // Store original API data for reference
          _apiData: venue
        };
        setCurrentVenue(venueData as any);
      } else {
        }
    } catch (error) {
      }
  };



  const value: WorkspaceContextType = {
    currentWorkspace,
    currentVenue,
    workspaces,
    venues,
    pricingPlans,
    loading,
    workspacesLoading,
    venuesLoading,
    switchWorkspace,
    switchVenue,
    refreshWorkspaces,
    refreshVenues,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createVenue,
    updateVenue,
    deleteVenue,
    activateVenue,
    deactivateVenue,
    toggleVenueStatus,
    initializeVenueFromUser,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};