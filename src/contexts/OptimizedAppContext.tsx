/**
 * Optimized App Context
 * Centralized state management with performance optimization and intelligent caching
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { optimizedApiService } from '../utils/api';
import { performanceService } from '../utils/performance';
import StorageManager from '../utils/storage';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  workspace_id?: string;
  venue_id?: string;
  isActive: boolean;
}

interface Venue {
  id: string;
  name: string;
  description?: string;
  location?: any;
  is_active: boolean;
  is_open: boolean;
}

interface Workspace {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  permissions: any | null;
  
  // App data
  currentVenue: Venue | null;
  currentWorkspace: Workspace | null;
  venues: Venue[];
  
  // UI state
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Performance state
  performanceMode: 'normal' | 'optimized' | 'minimal';
  cacheEnabled: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PERMISSIONS'; payload: any }
  | { type: 'SET_VENUE'; payload: Venue | null }
  | { type: 'SET_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_VENUES'; payload: Venue[] }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_PERFORMANCE_MODE'; payload: 'normal' | 'optimized' | 'minimal' }
  | { type: 'SET_CACHE_ENABLED'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  permissions: null,
  currentVenue: null,
  currentWorkspace: null,
  venues: [],
  loading: false,
  error: null,
  theme: 'light',
  sidebarOpen: true,
  performanceMode: 'normal',
  cacheEnabled: true,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    
    case 'SET_VENUE':
      return { ...state, currentVenue: action.payload };
    
    case 'SET_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    
    case 'SET_VENUES':
      return { ...state, venues: action.payload };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    
    case 'SET_PERFORMANCE_MODE':
      return { ...state, performanceMode: action.payload };
    
    case 'SET_CACHE_ENABLED':
      return { ...state, cacheEnabled: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  
  // Data actions
  loadVenues: () => Promise<void>;
  loadWorkspace: () => Promise<void>;
  switchVenue: (venueId: string) => Promise<void>;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  
  // Performance actions
  setPerformanceMode: (mode: 'normal' | 'optimized' | 'minimal') => void;
  setCacheEnabled: (enabled: boolean) => void;
  clearCache: () => void;
  
  // Utility functions
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const OptimizedAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state from storage
  useEffect(() => {
    const initializeApp = async () => {
      performanceService.startMeasure('app_initialization');
      
      try {
        // Load user data
        const userData = StorageManager.getUserData();
        if (userData) {
          dispatch({ type: 'SET_USER', payload: userData });
        }

        // Load permissions
        const permissions = StorageManager.getPermissions();
        if (permissions) {
          dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
        }

        // Load workspace data
        const workspaceData = StorageManager.getWorkspaceData();
        if (workspaceData) {
          dispatch({ type: 'SET_WORKSPACE', payload: workspaceData });
        }

        // Load venue data
        const venueData = StorageManager.getVenueData();
        if (venueData) {
          dispatch({ type: 'SET_VENUE', payload: venueData });
        }

        // Load UI preferences
        const theme = StorageManager.getTheme() as 'light' | 'dark' || 'light';
        dispatch({ type: 'SET_THEME', payload: theme });

        const settings = StorageManager.getSettings();
        if (settings) {
          if (settings.performanceMode) {
            dispatch({ type: 'SET_PERFORMANCE_MODE', payload: settings.performanceMode });
          }
          if (settings.cacheEnabled !== undefined) {
            dispatch({ type: 'SET_CACHE_ENABLED', payload: settings.cacheEnabled });
          }
          if (settings.sidebarOpen !== undefined) {
            dispatch({ type: 'SET_SIDEBAR', payload: settings.sidebarOpen });
          }
        }

      } catch (error) {
        console.error('App initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize application' });
      } finally {
        const initTime = performanceService.endMeasure('app_initialization');
        console.log(`App initialized in ${initTime.toFixed(2)}ms`);
      }
    };

    initializeApp();
  }, []);

  // Auth actions
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const startTime = Date.now();
      
      const response = await optimizedApiService.post('/auth/login', {
        email,
        password
      });

      const loginTime = Date.now() - startTime;
      performanceService.trackApiCall('/auth/login', loginTime, true);

      if (response.success && response.data) {
        // Store token
        StorageManager.setItem(StorageManager.KEYS.TOKEN, response.data.access_token);
        
        // Store user data
        const userData = response.data.user;
        StorageManager.setUserData(userData);
        dispatch({ type: 'SET_USER', payload: userData });

        // Load additional data
        await Promise.all([
          loadUserPermissions(),
          loadWorkspaceData(),
          loadVenueData()
        ]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      performanceService.trackApiCall('/auth/login', 0, false);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    // Clear all data
    StorageManager.clearAuthData();
    optimizedApiService.clearCache();
    
    // Reset state
    dispatch({ type: 'RESET_STATE' });
    
    // Track logout
    performanceService.trackUserInteraction('logout');
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const response = await optimizedApiService.get('/auth/me');
      if (response.success && response.data) {
        StorageManager.setUserData(response.data);
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't logout on refresh failure, just log the error
    }
  }, [state.isAuthenticated]);

  // Data loading functions
  const loadUserPermissions = useCallback(async () => {
    try {
      const response = await optimizedApiService.get('/auth/permissions');
      if (response.success && response.data) {
        StorageManager.setPermissions(response.data);
        dispatch({ type: 'SET_PERMISSIONS', payload: response.data });
      }
    } catch (error) {
      console.warn('Failed to load permissions:', error);
    }
  }, []);

  const loadWorkspaceData = useCallback(async () => {
    if (!state.user?.workspace_id) return;

    try {
      const response = await optimizedApiService.get(`/workspaces/${state.user.workspace_id}`);
      if (response.success && response.data) {
        StorageManager.setWorkspaceData(response.data);
        dispatch({ type: 'SET_WORKSPACE', payload: response.data });
      }
    } catch (error) {
      console.warn('Failed to load workspace:', error);
    }
  }, [state.user?.workspace_id]);

  const loadVenueData = useCallback(async () => {
    if (!state.user?.venue_id) return;

    try {
      const response = await optimizedApiService.get(`/venues/${state.user.venue_id}`);
      if (response.success && response.data) {
        StorageManager.setVenueData(response.data);
        dispatch({ type: 'SET_VENUE', payload: response.data });
      }
    } catch (error) {
      console.warn('Failed to load venue:', error);
    }
  }, [state.user?.venue_id]);

  const loadVenues = useCallback(async (): Promise<void> => {
    if (!state.user?.workspace_id) return;

    try {
      const response = await optimizedApiService.get(
        `/venues/workspace/${state.user.workspace_id}/venues`
      );
      if (response.success && response.data) {
        dispatch({ type: 'SET_VENUES', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load venues:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load venues' });
    }
  }, [state.user?.workspace_id]);

  const loadWorkspace = useCallback(async (): Promise<void> => {
    await loadWorkspaceData();
  }, [loadWorkspaceData]);

  const switchVenue = useCallback(async (venueId: string): Promise<void> => {
    try {
      const venue = state.venues.find(v => v.id === venueId);
      if (venue) {
        StorageManager.setVenueData(venue);
        dispatch({ type: 'SET_VENUE', payload: venue });
        performanceService.trackUserInteraction('venue_switch');
      }
    } catch (error) {
      console.error('Failed to switch venue:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to switch venue' });
    }
  }, [state.venues]);

  // UI actions
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    StorageManager.setTheme(theme);
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    const settings = StorageManager.getSettings() || {};
    StorageManager.setSettings({ ...settings, sidebarOpen: open });
    dispatch({ type: 'SET_SIDEBAR', payload: open });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Performance actions
  const setPerformanceMode = useCallback((mode: 'normal' | 'optimized' | 'minimal') => {
    const settings = StorageManager.getSettings() || {};
    StorageManager.setSettings({ ...settings, performanceMode: mode });
    dispatch({ type: 'SET_PERFORMANCE_MODE', payload: mode });

    // Adjust API service based on performance mode
    if (mode === 'minimal') {
      optimizedApiService.updateConfig({ enableCache: false, enableRetry: false });
    } else if (mode === 'optimized') {
      optimizedApiService.updateConfig({ enableCache: true, enableRetry: true });
    }
  }, []);

  const setCacheEnabled = useCallback((enabled: boolean) => {
    const settings = StorageManager.getSettings() || {};
    StorageManager.setSettings({ ...settings, cacheEnabled: enabled });
    dispatch({ type: 'SET_CACHE_ENABLED', payload: enabled });
    
    optimizedApiService.updateConfig({ enableCache: enabled });
  }, []);

  const clearCache = useCallback(() => {
    optimizedApiService.clearCache();
    StorageManager.clearCache();
    performanceService.clearMetrics();
  }, []);

  // Utility functions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.permissions) return false;
    return state.permissions.permissions?.some((p: any) => p.name === permission) || false;
  }, [state.permissions]);

  const isAdmin = useCallback((): boolean => {
    return state.user?.role === 'admin' || state.user?.role === 'superadmin';
  }, [state.user?.role]);

  const isSuperAdmin = useCallback((): boolean => {
    return state.user?.role === 'superadmin';
  }, [state.user?.role]);

  // Memoized context value
  const contextValue = useMemo<AppContextType>(() => ({
    state,
    login,
    logout,
    refreshUser,
    loadVenues,
    loadWorkspace,
    switchVenue,
    setTheme,
    setSidebarOpen,
    setError,
    setPerformanceMode,
    setCacheEnabled,
    clearCache,
    hasPermission,
    isAdmin,
    isSuperAdmin,
  }), [
    state,
    login,
    logout,
    refreshUser,
    loadVenues,
    loadWorkspace,
    switchVenue,
    setTheme,
    setSidebarOpen,
    setError,
    setPerformanceMode,
    setCacheEnabled,
    clearCache,
    hasPermission,
    isAdmin,
    isSuperAdmin,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useOptimizedApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useOptimizedApp must be used within an OptimizedAppProvider');
  }
  return context;
};

// Selector hooks for performance optimization
export const useAppUser = () => {
  const { state } = useOptimizedApp();
  return state.user;
};

export const useAppAuth = () => {
  const { state, login, logout } = useOptimizedApp();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout
  };
};

export const useAppVenue = () => {
  const { state, switchVenue } = useOptimizedApp();
  return {
    currentVenue: state.currentVenue,
    venues: state.venues,
    switchVenue
  };
};

export const useAppTheme = () => {
  const { state, setTheme } = useOptimizedApp();
  return {
    theme: state.theme,
    setTheme
  };
};

export const useAppPerformance = () => {
  const { state, setPerformanceMode, setCacheEnabled, clearCache } = useOptimizedApp();
  return {
    performanceMode: state.performanceMode,
    cacheEnabled: state.cacheEnabled,
    setPerformanceMode,
    setCacheEnabled,
    clearCache
  };
};

export default OptimizedAppProvider;