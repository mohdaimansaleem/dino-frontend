import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRegistration } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
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
              localStorage.removeItem('dino_demo_mode');
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

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user
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