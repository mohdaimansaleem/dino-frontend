import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Workspace } from '../types/auth';
import { Venue, PriceRange } from '../types/api';
import { workspaceService } from '../services/business';
import { useAuth } from './AuthContext';


interface WorkspaceContextType {
  // Current workspace and venue
  currentWorkspace: Workspace | null;
  currentVenue: Venue | null;
  
  // Available workspaces and venues
  workspaces: Workspace[];
  venues: Venue[];
  
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

  
  const [loading, setLoading] = useState(false);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);



  // Load venues directly when needed (no caching)
  const [venuesLoading, setVenuesLoadingState] = useState(false);

  const loadVenues = useCallback(async () => {
    if (!user?.workspace_id || !isAuthenticated || venuesLoading) return;
    
    setVenuesLoadingState(true);
    try {
      const venueList = await workspaceService.getVenues(user.workspace_id);
      // Convert API venues to Venue format
      const mappedVenues: Venue[] = venueList.map((venue: any) => {
        // Handle location mapping properly
        const location = venue.location ? venue.location : {
          address: venue.address || '',
          city: '',
          state: '',
          country: '',
          postal_code: undefined,
          landmark: undefined,
          latitude: undefined,
          longitude: undefined
        };

        return {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          location: location,
          phone: venue.phone || '',
          email: venue.email || '',
          cuisine_types: venue.cuisine_types || [],
          price_range: venue.price_range || 'mid_range',
          rating: venue.rating,
          total_reviews: venue.total_reviews,
          is_active: venue.is_active !== undefined ? venue.is_active : true,
          is_open: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          status: venue.status,
          workspace_id: venue.workspace_id,
          owner_id: venue.owner_id || '',
          operating_hours: venue.operating_hours,
          subscription_status: venue.subscription_status,
          created_at: venue.created_at,
          updated_at: venue.updated_at,
          // Legacy compatibility fields
          address: location.address,
          ownerId: venue.owner_id || '',
          workspaceId: venue.workspace_id,
          isActive: venue.is_active !== undefined ? venue.is_active : true,
          isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          createdAt: venue.created_at,
          updatedAt: venue.updated_at
        } as Venue;
      });
      setVenues(mappedVenues);
      
      // Auto-select first active venue if none selected
      if (!currentVenue && mappedVenues.length > 0) {
        const activeVenue = mappedVenues.find((venue: any) => venue.isActive) || mappedVenues[0];
        setCurrentVenue(activeVenue);
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      setVenues([]);
    } finally {
      setVenuesLoadingState(false);
    }
  }, [user?.workspace_id, isAuthenticated, venuesLoading, currentVenue]);

  // Load current venue directly when needed (no caching)
  const loadCurrentVenue = useCallback(async () => {
    const venueId = user?.venueId || user?.venue_id;
    if (!venueId || !isAuthenticated) return;
    
    try {
      const venue = await workspaceService.getVenue(venueId);
      if (venue) {
        // Handle location mapping properly
        const location = venue.location ? venue.location : {
          address: venue.address || '',
          city: '',
          state: '',
          country: '',
          postal_code: undefined,
          landmark: undefined,
          latitude: undefined,
          longitude: undefined
        };

        const venueData: Venue = {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          location: location,
          phone: venue.phone || '',
          email: venue.email || '',
          cuisine_types: venue.cuisine_types || [],
          price_range: venue.price_range || 'mid_range' as PriceRange,
          rating: venue.rating,
          total_reviews: venue.total_reviews,
          is_active: venue.is_active !== undefined ? venue.is_active : true,
          is_open: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          status: venue.status,
          workspace_id: venue.workspace_id,
          owner_id: user?.id || '',
          operating_hours: venue.operating_hours,
          subscription_status: venue.subscription_status,
          created_at: venue.created_at,
          updated_at: venue.updated_at,
          // Legacy compatibility fields
          address: location.address,
          ownerId: user?.id || '',
          workspaceId: venue.workspace_id,
          isActive: venue.is_active !== undefined ? venue.is_active : true,
          isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          createdAt: venue.created_at,
          updatedAt: venue.updated_at
        };
        setCurrentVenue(venueData);
      }
    } catch (error) {
      console.error('Error loading current venue:', error);
    }
  }, [user?.venueId, user?.venue_id, user?.id, isAuthenticated]);

  // Load venues for workspace directly (no caching)
  const loadVenuesForWorkspace = useCallback(async (workspaceId: string) => {
    if (workspaceId) {
      await loadVenues();
    }
  }, [loadVenues]);

  // Optimized initialization - now uses cached data
  const initializeWorkspaceData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Set current workspace from user data (no API call needed)
      if (user?.workspace_id) {
        const localWorkspace = {
          id: user.workspace_id,
          name: 'Default Workspace',
          description: '',
          ownerId: user.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentWorkspace(localWorkspace as any);
        setWorkspaces([localWorkspace as any]);
      }

      // Load venues and current venue
      if (user?.workspace_id) {
        await loadVenues();
      }
      await loadCurrentVenue();
    } catch (error) {
      console.error('Error initializing workspace data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, loadVenues, loadCurrentVenue]);

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
    }
  }, [isAuthenticated, user, initializeWorkspaceData]);

  // Load venues when user changes
  useEffect(() => {
    if (isAuthenticated && user?.workspace_id) {
      loadVenues();
    }
  }, [isAuthenticated, user?.workspace_id, loadVenues]);

  // Load current venue when user changes
  useEffect(() => {
    if (isAuthenticated && (user?.venueId || user?.venue_id)) {
      loadCurrentVenue();
    }
  }, [isAuthenticated, user?.venueId, user?.venue_id, loadCurrentVenue]);

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
    // Refresh venues directly
    await loadVenues();
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
        // Refresh venues directly
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
        // Refresh venues and current venue directly
        await refreshVenues();
        await loadCurrentVenue();
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
        // Refresh venues directly
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
        // Refresh venues and current venue directly
        await refreshVenues();
        await loadCurrentVenue();
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
        // Refresh venues and current venue directly
        await refreshVenues();
        await loadCurrentVenue();
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
        // Refresh venues and current venue directly
        await refreshVenues();
        await loadCurrentVenue();
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
        // Handle location mapping properly
        const location = venue.location ? venue.location : {
          address: venue.address || '',
          city: '',
          state: '',
          country: '',
          postal_code: undefined,
          landmark: undefined,
          latitude: undefined,
          longitude: undefined
        };

        const venueData: Venue = {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          location: location,
          phone: venue.phone || '',
          email: venue.email || '',
          cuisine_types: venue.cuisine_types || [],
          price_range: venue.price_range || 'mid_range' as PriceRange,
          rating: venue.rating,
          total_reviews: venue.total_reviews,
          is_active: venue.is_active !== undefined ? venue.is_active : true,
          is_open: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          status: venue.status,
          workspace_id: venue.workspace_id,
          owner_id: user.id,
          operating_hours: venue.operating_hours,
          subscription_status: venue.subscription_status,
          created_at: venue.created_at,
          updated_at: venue.updated_at,
          // Legacy compatibility fields
          address: location.address,
          ownerId: user.id,
          workspaceId: venue.workspace_id,
          isActive: venue.is_active !== undefined ? venue.is_active : true,
          isOpen: venue.is_open !== undefined ? venue.is_open : venue.is_active,
          createdAt: venue.created_at,
          updatedAt: venue.updated_at
        };
        setCurrentVenue(venueData);
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
    loading,
    workspacesLoading,
    venuesLoading: venuesLoading,
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