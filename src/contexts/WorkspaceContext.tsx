import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  }, [isAuthenticated, user]);

  const initializeWorkspaceData = async () => {
    setLoading(true);
    try {
      // Load pricing plans
      const plans = await workspaceService.getPricingPlans();
      setPricingPlans(plans);

      // Load workspaces
      await refreshWorkspaces();

      // Set current workspace from user data or first available
      if (user?.workspaceId) {
        const workspace = await workspaceService.getWorkspace(user.workspaceId);
        if (workspace) {
          setCurrentWorkspace(workspace);
          await loadCafesForWorkspace(workspace.id);
        }
      }

      // Set current cafe from user data or first available
      if (user?.cafeId) {
        const cafe = await workspaceService.getCafe(user.cafeId);
        if (cafe) {
          setCurrentCafe(cafe);
        }
      }
    } catch (error) {
      console.error('Failed to initialize workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    setWorkspacesLoading(true);
    try {
      const workspaceList = await workspaceService.getWorkspaces();
      setWorkspaces(workspaceList);
    } catch (error) {
      console.error('Failed to refresh workspaces:', error);
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const refreshCafes = async () => {
    if (!currentWorkspace) return;
    await loadCafesForWorkspace(currentWorkspace.id);
  };

  const loadCafesForWorkspace = async (workspaceId: string) => {
    setCafesLoading(true);
    try {
      const cafeList = await workspaceService.getCafes(workspaceId);
      setCafes(cafeList);
      
      // If no current cafe is set, set the first active cafe
      if (!currentCafe && cafeList.length > 0) {
        const activeCafe = cafeList.find(cafe => cafe.isActive) || cafeList[0];
        setCurrentCafe(activeCafe);
      }
    } catch (error) {
      console.error('Failed to load cafes:', error);
    } finally {
      setCafesLoading(false);
    }
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
      console.error('Failed to switch workspace:', error);
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
      console.error('Failed to switch cafe:', error);
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
      console.error('Failed to create workspace:', error);
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
          setCurrentWorkspace(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to update workspace');
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
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
      console.error('Failed to delete workspace:', error);
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
      console.error('Failed to create cafe:', error);
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
          setCurrentCafe(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to update cafe');
      }
    } catch (error) {
      console.error('Failed to update cafe:', error);
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
      console.error('Failed to delete cafe:', error);
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
      console.error('Failed to activate cafe:', error);
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
      console.error('Failed to deactivate cafe:', error);
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
      console.error('Failed to toggle cafe status:', error);
      throw error;
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