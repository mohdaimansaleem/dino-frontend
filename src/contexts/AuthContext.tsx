import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRegistration } from '../types';
import { User as AuthUser, ROLES, PermissionName, RoleName } from '../types/auth';
import { authService } from '../services/authService';
import PermissionService from '../services/permissionService';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  // Role-based access control methods
  hasPermission: (permission: PermissionName) => boolean;
  hasRole: (role: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  isSuperAdmin: () => boolean;
  getUserWithRole: () => AuthUser | null;
  // Demo mode method
  setDemoUser: (demoUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('dino_token');
        const savedUser = localStorage.getItem('dino_user');
        const isDemoMode = localStorage.getItem('dino_demo_mode') === 'true';
        
        if (token && savedUser) {
          if (isDemoMode) {
            // Demo mode - use stored user without backend verification
            try {
              const demoUser = JSON.parse(savedUser);
              setUser(demoUser);
            } catch (error) {
              // Invalid demo user data, clear storage
              localStorage.removeItem('dino_token');
              localStorage.removeItem('dino_user');
              localStorage.removeItem('dino_demo_mode');
              setUser(null);
            }
          } else {
            // Normal mode - verify token with backend
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              // Update stored user data
              localStorage.setItem('dino_user', JSON.stringify(currentUser));
            } catch (error) {
              // Token is invalid, clear storage
              localStorage.removeItem('dino_token');
              localStorage.removeItem('dino_user');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('dino_token');
        localStorage.removeItem('dino_user');
        localStorage.removeItem('dino_demo_mode');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      // Store token and user
      localStorage.setItem('dino_token', response.access_token);
      localStorage.setItem('dino_user', JSON.stringify(response.user));
      
      // Set user
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistration): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Store token and user
      localStorage.setItem('dino_token', response.access_token);
      localStorage.setItem('dino_user', JSON.stringify(response.user));
      
      // Set user
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('dino_token');
    localStorage.removeItem('dino_user');
    localStorage.removeItem('dino_refresh_token');
    localStorage.removeItem('dino_demo_mode');
    setUser(null);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('dino_user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('dino_user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      logout();
      throw error;
    }
  };

  // Convert UserProfile to AuthUser with role information
  const getUserWithRole = (): AuthUser | null => {
    if (!user) return null;

    // Check if user already has an RBAC role property (from demo mode)
    let roleName: RoleName = ROLES.ADMIN;
    
    // If user has an rbacRole property (demo mode), use it
    if ((user as any).rbacRole) {
      roleName = (user as any).rbacRole as RoleName;
    } else if ((user as any).role === 'staff') {
      // Map staff role to operator for RBAC
      roleName = ROLES.OPERATOR;
    } else if ((user as any).role === 'admin') {
      // Map admin role to admin for RBAC
      roleName = ROLES.ADMIN;
    } else {
      // For regular users, assign roles based on email or default to admin
      if (user.email?.includes('operator')) {
        roleName = ROLES.OPERATOR;
      }
    }

    const role = PermissionService.getRoleDefinition(roleName);
    if (!role) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
    const authUser = getUserWithRole();
    return PermissionService.hasRole(authUser, role);
  };

  const canAccessRoute = (route: string): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.canAccessRoute(authUser, route);
  };

  const isAdmin = (): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.isAdmin(authUser);
  };

  const isOperator = (): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.isOperator(authUser);
  };

  const isSuperAdmin = (): boolean => {
    const authUser = getUserWithRole();
    return PermissionService.isSuperAdmin(authUser);
  };

  const setDemoUser = (demoUser: UserProfile): void => {
    // Store demo session data
    localStorage.setItem('dino_token', 'demo-token-bypass');
    localStorage.setItem('dino_user', JSON.stringify(demoUser));
    localStorage.setItem('dino_demo_mode', 'true');
    
    // Set user in state
    setUser(demoUser);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    canAccessRoute,
    isAdmin,
    isOperator,
    isSuperAdmin,
    getUserWithRole,
    setDemoUser,
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