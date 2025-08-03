import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Workspace, Cafe, PricingPlan } from '../types/auth';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  // Current workspace and cafe
  currentWorkspace: Workspace | null;
  currentCafe: Cafe | null;
  
  // Available workspaces and cafes
  workspaces: Workspace[];
  cafes: Cafe[];
  pricingPlans: PricingPlan[];
  
  // Loading states
  loading: boolean;
  workspacesLoading: boolean;
  cafesLoading: boolean;
  
  // Actions
  switchWorkspace: (workspaceId: string) => Promise<void>;
  switchCafe: (cafeId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshCafes: () => Promise<void>;
  initializeVenueFromUser: () => Promise<void>;
  
  // Workspace management
  createWorkspace: (workspaceData: any) => Promise<void>;
  updateWorkspace: (workspaceId: string, workspaceData: any) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  
  // Cafe management
  createCafe: (cafeData: any) => Promise<void>;
  updateCafe: (cafeId: string, cafeData: any) => Promise<void>;
  deleteCafe: (cafeId: string) => Promise<void>;
  activateCafe: (cafeId: string) => Promise<void>;
  deactivateCafe: (cafeId: string) => Promise<void>;
  toggleCafeStatus: (cafeId: string, isOpen: boolean) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentCafe, setCurrentCafe] = useState<Cafe | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [cafesLoading, setCafesLoading] = useState(false);

  const loadCafesForWorkspace = useCallback(async (workspaceId: string) => {
    setCafesLoading(true);
    try {
      const venueList = await workspaceService.getCafes(workspaceId);
      // Convert venues to cafes
      const cafeList = venueList.map((venue: any) => ({
        id: venue.id,
        name: venue.name,
        description: venue.description || '',
        address: venue.location?.address || '',
        phone: venue.phone || '',
        email: venue.email || '',
        ownerId: (venue as any).owner_id || '',
        workspaceId: venue.workspace_id,
        logo: '',
        isActive: venue.is_active,
        isOpen: venue.is_active,
        settings: {},
        createdAt: new Date(venue.created_at),
        updatedAt: new Date(venue.updated_at || venue.created_at)
      })) as any[];
      setCafes(cafeList);
      
      // If no current cafe is set, set the first active cafe
      if (!currentCafe && cafeList.length > 0) {
        const activeCafe = cafeList.find((cafe: any) => cafe.isActive) || cafeList[0];
        setCurrentCafe(activeCafe);
      }
    } catch (error) {
      } finally {
      setCafesLoading(false);
    }
  }, [currentCafe]);

  const initializeWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      // Load pricing plans (static only, no API call)
      const plans = await workspaceService.getPricingPlans();
      setPricingPlans(plans);

      // Check if user is authenticated before loading workspaces
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, skipping workspace loading');
        setLoading(false);
        return;
      }

      // Load workspaces
      await refreshWorkspaces();

      // Set current workspace from user data or first available
      if (user?.workspaceId) {
        const workspace = await workspaceService.getWorkspace(user.workspaceId);
        if (workspace) {
          // Convert API workspace to local format
          const localWorkspace = {
            ...workspace,
            ownerId: workspace.owner_id || '',
            isActive: workspace.is_active,
            pricingPlan: { id: 'basic', name: 'basic', displayName: 'Basic', price: 0, features: [], maxCafes: 1, maxUsers: 5 },
            createdAt: workspace.created_at,
            updatedAt: workspace.updated_at || workspace.created_at
          };
          setCurrentWorkspace(localWorkspace as any);
          await loadCafesForWorkspace(workspace.id);
        }
      }

      // Set current cafe from user data or first available
      const venueId = user?.cafeId || user?.venue_id;
      if (venueId) {
        try {
          const venue = await workspaceService.getCafe(venueId);
          if (venue) {
            // Convert Venue to Cafe format
            const cafe = {
              id: venue.id,
              name: venue.name,
              description: venue.description || '',
              address: venue.location?.address || '',
              phone: venue.phone || '',
              email: venue.email || '',
              ownerId: user.id,
              workspaceId: venue.workspace_id,
              logo: '',
              isActive: venue.is_active,
              isOpen: venue.is_active,
              settings: {},
              createdAt: new Date(venue.created_at),
              updatedAt: new Date(venue.updated_at || venue.created_at)
            };
            setCurrentCafe(cafe as any);
          } else {
            // Try to get all venues as fallback
            try {
              const allVenues = await workspaceService.getAllVenues();
              if (allVenues.length > 0) {
                // Find venue by ID or use first available
                const foundVenue = allVenues.find(v => v.id === venueId) || allVenues[0];
                const cafe = {
                  id: foundVenue.id,
                  name: foundVenue.name,
                  description: foundVenue.description || '',
                  address: foundVenue.location?.address || '',
                  phone: foundVenue.phone || '',
                  email: foundVenue.email || '',
                  ownerId: user.id,
                  workspaceId: foundVenue.workspace_id,
                  logo: '',
                  isActive: foundVenue.is_active,
                  isOpen: foundVenue.is_active,
                  settings: {},
                  createdAt: new Date(foundVenue.created_at),
                  updatedAt: new Date(foundVenue.updated_at || foundVenue.created_at)
                };
                setCurrentCafe(cafe as any);
              }
            } catch (fallbackError) {
              }
          }
        } catch (error) {
          }
      } else {
        }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  }, [user, loadCafesForWorkspace]);

  // Initialize workspace data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeWorkspaceData();
    } else {
      // Clear data when user logs out
      setCurrentWorkspace(null);
      setCurrentCafe(null);
      setWorkspaces([]);
      setCafes([]);
    }
  }, [isAuthenticated, user, initializeWorkspaceData]);

  const refreshWorkspaces = async () => {
    setWorkspacesLoading(true);
    try {
      console.log('Refreshing workspaces...');
      const workspaceList = await workspaceService.getWorkspaces();
      console.log('Workspace list received:', workspaceList);
      
      // Extract data from paginated response and convert to local format
      const localWorkspaces = (workspaceList.data || []).map((workspace: any) => ({
        ...workspace,
        ownerId: workspace.owner_id || '',
        isActive: workspace.is_active,
        pricingPlan: { id: 'basic', name: 'basic', displayName: 'Basic', price: 0, features: [], maxCafes: 1, maxUsers: 5 },
        createdAt: new Date(workspace.created_at),
        updatedAt: new Date(workspace.updated_at || workspace.created_at)
      }));
      
      console.log('Local workspaces:', localWorkspaces);
      setWorkspaces(localWorkspaces);
    } catch (error: any) {
      console.error('Error refreshing workspaces:', error);
      
      // If authentication error, clear workspaces but don't logout automatically
      if (error.message?.includes('Authentication required')) {
        console.warn('Authentication required for workspaces');
        setWorkspaces([]);
      } else if (error.message?.includes('permission')) {
        console.warn('Permission denied for workspaces');
        setWorkspaces([]);
      } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.warn('Workspaces endpoint not found, using fallback');
        setWorkspaces([]);
      } else {
        console.error('Unexpected error:', error);
        setWorkspaces([]);
      }
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const refreshCafes = async () => {
    if (!currentWorkspace) return;
    await loadCafesForWorkspace(currentWorkspace.id);
  };



  const switchWorkspace = async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        setCurrentCafe(null); // Clear current cafe when switching workspace
        await loadCafesForWorkspace(workspaceId);
        
        // Store in localStorage for persistence
        localStorage.setItem('dino_current_workspace', workspaceId);
      }
    } catch (error) {
      throw error;
    }
  };

  const switchCafe = async (cafeId: string) => {
    try {
      const cafe = cafes.find(c => c.id === cafeId);
      if (cafe) {
        setCurrentCafe(cafe);
        
        // Store in localStorage for persistence
        localStorage.setItem('dino_current_cafe', cafeId);
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
            setCurrentCafe(null);
            setCafes([]);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to delete workspace');
      }
    } catch (error) {
      throw error;
    }
  };

  const createCafe = async (cafeData: any) => {
    try {
      const response = await workspaceService.createCafe({
        ...cafeData,
        workspaceId: currentWorkspace?.id || ''
      });
      if (response.success && response.data) {
        await refreshCafes();
        // Auto-switch to new cafe
        await switchCafe(response.data.id);
      } else {
        throw new Error(response.message || 'Failed to create cafe');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateCafe = async (cafeId: string, cafeData: any) => {
    try {
      const response = await workspaceService.updateCafe(cafeId, cafeData);
      if (response.success) {
        await refreshCafes();
        // Update current cafe if it's the one being updated
        if (currentCafe?.id === cafeId && response.data) {
          const venue = response.data;
          const cafe = {
            id: venue.id,
            name: venue.name,
            description: venue.description || '',
            address: venue.location?.address || '',
            phone: venue.phone || '',
            email: venue.email || '',
            ownerId: (venue as any).owner_id || '',
            workspaceId: venue.workspace_id,
            logo: '',
            isActive: venue.is_active,
            isOpen: venue.is_active,
            settings: {},
            createdAt: new Date(venue.created_at),
            updatedAt: new Date(venue.updated_at || venue.created_at)
          };
          setCurrentCafe(cafe as any);
        }
      } else {
        throw new Error(response.message || 'Failed to update cafe');
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteCafe = async (cafeId: string) => {
    try {
      const response = await workspaceService.deleteCafe(cafeId);
      if (response.success) {
        await refreshCafes();
        // If current cafe was deleted, switch to first available
        if (currentCafe?.id === cafeId) {
          const remainingCafes = cafes.filter(c => c.id !== cafeId);
          if (remainingCafes.length > 0) {
            await switchCafe(remainingCafes[0].id);
          } else {
            setCurrentCafe(null);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to delete cafe');
      }
    } catch (error) {
      throw error;
    }
  };

  const activateCafe = async (cafeId: string) => {
    try {
      const response = await workspaceService.activateCafe(cafeId);
      if (response.success) {
        await refreshCafes();
      } else {
        throw new Error(response.message || 'Failed to activate cafe');
      }
    } catch (error) {
      throw error;
    }
  };

  const deactivateCafe = async (cafeId: string) => {
    try {
      const response = await workspaceService.deactivateCafe(cafeId);
      if (response.success) {
        await refreshCafes();
      } else {
        throw new Error(response.message || 'Failed to deactivate cafe');
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleCafeStatus = async (cafeId: string, isOpen: boolean) => {
    try {
      const response = await workspaceService.toggleCafeStatus(cafeId, isOpen);
      if (response.success) {
        await refreshCafes();
      } else {
        throw new Error(response.message || 'Failed to toggle cafe status');
      }
    } catch (error) {
      throw error;
    }
  };

  const initializeVenueFromUser = async () => {
    if (!user) return;
    
    const venueId = user.cafeId || user.venue_id;
    if (!venueId) {
      return;
    }

    try {
      const venue = await workspaceService.getCafe(venueId);
      if (venue) {
        const cafe = {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
          address: venue.location?.address || '',
          phone: venue.phone || '',
          email: venue.email || '',
          ownerId: user.id,
          workspaceId: venue.workspace_id,
          logo: '',
          isActive: venue.is_active,
          isOpen: venue.is_active,
          settings: {},
          createdAt: new Date(venue.created_at),
          updatedAt: new Date(venue.updated_at || venue.created_at)
        };
        setCurrentCafe(cafe as any);
      } else {
        }
    } catch (error) {
      }
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    currentCafe,
    workspaces,
    cafes,
    pricingPlans,
    loading,
    workspacesLoading,
    cafesLoading,
    switchWorkspace,
    switchCafe,
    refreshWorkspaces,
    refreshCafes,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createCafe,
    updateCafe,
    deleteCafe,
    activateCafe,
    deactivateCafe,
    toggleCafeStatus,
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