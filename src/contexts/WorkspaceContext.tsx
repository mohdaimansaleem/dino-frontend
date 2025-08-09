import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Workspace, PricingPlan } from '../types/auth';
import { Venue } from '../types/api';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';

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

  const loadVenuesForWorkspace = useCallback(async (workspaceId: string) => {
    setVenuesLoading(true);
    try {
      const venueList = await workspaceService.getVenues(workspaceId);
      
      // Convert API venues to internal format with proper mapping
      const venues = venueList.map((venue: any) => {
        const mappedVenue = {
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
          // Store original API data for reference
          _apiData: venue
        };
        return mappedVenue;
      }) as any[];
      
      setVenues(venues);
      
      // If no current venue is set, set the first active venue
      if (!currentVenue && venues.length > 0) {
        const activeVenue = venues.find((venue: any) => venue.isActive) || venues[0];
        setCurrentVenue(activeVenue);
      }
    } catch (error) {
      console.error('Error loading venues for workspace:', error);
    } finally {
      setVenuesLoading(false);
    }
  }, [currentVenue]);

  const initializeWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      // Load pricing plans (static only, no API call)
      const plans = await workspaceService.getPricingPlans();
      setPricingPlans(plans);

      // Check if user is authenticated before loading workspaces
      if (!isAuthenticated || !user) {
  setLoading(false);
        return;
      }

      // Skip loading workspaces from API - use user data instead
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
        await loadVenuesForWorkspace(user.workspace_id);
      }

      // Set current venue from user data or first available
      const venueId = user?.venueId || user?.venue_id;
      console.log('User venue ID:', venueId);
      
      if (venueId) {
        try {
          console.log('Fetching venue details for ID:', venueId);
          const venue = await workspaceService.getVenue(venueId);
          console.log('Fetched venue from API:', venue);
          
          if (venue) {
            // Convert API venue to internal format with proper mapping
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
            console.log('Setting current venue from user data:', venueData);
            setCurrentVenue(venueData as any);
          } else {
      // Try to get all venues as fallback
            try {
              const allVenues = await workspaceService.getAllVenues();
              console.log('All venues fallback:', allVenues);
              
              if (allVenues.length > 0) {
                // Find venue by ID or use first available
                const foundVenue = allVenues.find(v => v.id === venueId) || allVenues[0];
                const venueData = {
                  id: foundVenue.id,
                  name: foundVenue.name,
                  description: foundVenue.description || '',
                  address: foundVenue.location?.address || '',
                  phone: foundVenue.phone || '',
                  email: foundVenue.email || '',
                  ownerId: user.id,
                  workspaceId: foundVenue.workspace_id,
                  logo: '',
                  isActive: foundVenue.is_active !== undefined ? foundVenue.is_active : true,
                  isOpen: foundVenue.is_open !== undefined ? foundVenue.is_open : foundVenue.is_active,
                  settings: {},
                  createdAt: new Date(foundVenue.created_at),
                  updatedAt: new Date(foundVenue.updated_at || foundVenue.created_at),
                  // Store original API data for reference
                  _apiData: foundVenue
                };
                console.log('Setting venue from fallback:', venueData);
                setCurrentVenue(venueData as any);
              }
            } catch (fallbackError) {
              console.error('Fallback venue loading failed:', fallbackError);
            }
          }
        } catch (error) {
          console.error('Error loading venue:', error);
        }
      } else {
  }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  }, [user, loadVenuesForWorkspace]);

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
      console.error('Error setting up workspace from user data:', error);
      setWorkspaces([]);
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const refreshVenues = async () => {
    if (!currentWorkspace) return;
    await loadVenuesForWorkspace(currentWorkspace.id);
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
      console.log('Updating venue:', venueId, venueData);
      const response = await workspaceService.updateVenue(venueId, venueData);
      console.log('Update venue response:', response);
      
      if (response.success) {
        await refreshVenues();
        // Update current venue if it's the one being updated
        if (currentVenue?.id === venueId && response.data) {
          const venue = response.data;
          const venueFormatted = {
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
            // Store original API data for reference
            _apiData: venue
          };
          console.log('Updated current venue:', venueFormatted);
          setCurrentVenue(venueFormatted as any);
        }
      } else {
        throw new Error(response.message || 'Failed to update venue');
      }
    } catch (error) {
      console.error('Error updating venue:', error);
      throw error;
    }
  };

  const deleteVenue = async (venueId: string) => {
    try {
      const response = await workspaceService.deleteVenue(venueId);
      if (response.success) {
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
        await refreshVenues();
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
        await refreshVenues();
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
        await refreshVenues();
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
      console.log('Initializing venue from user data, venue ID:', venueId);
      const venue = await workspaceService.getVenue(venueId);
      console.log('Fetched venue for initialization:', venue);
      
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
        console.log('Initialized venue data:', venueData);
        setCurrentVenue(venueData as any);
      } else {
        console.warn('Venue not found for ID:', venueId);
      }
    } catch (error) {
      console.error('Error initializing venue from user:', error);
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