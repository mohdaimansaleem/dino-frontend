import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Hook to ensure UserData is properly initialized
 * This hook provides a more reliable way to ensure user data is loaded
 */
export const useUserDataInitializer = () => {
  const { isAuthenticated, user } = useAuth();
  const { userData, loading, refreshUserData } = useUserData();
  const initAttempted = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const initializeUserData = async () => {
      // Only attempt if user is authenticated and we haven't tried yet
      if (!isAuthenticated || !user) {
        console.log('🔄 UserDataInitializer: User not authenticated, skipping');
        initAttempted.current = false;
        retryCount.current = 0;
        return;
      }

      // If we already have data, no need to retry
      if (userData) {
        console.log('✅ UserDataInitializer: User data already available');
        initAttempted.current = true;
        retryCount.current = 0;
        return;
      }

      // If currently loading, wait
      if (loading) {
        console.log('🔄 UserDataInitializer: Data is loading, waiting...');
        return;
      }

      // If we haven't attempted or need to retry
      if (!initAttempted.current || retryCount.current < maxRetries) {
        console.log(`🔄 UserDataInitializer: Attempting to load user data (attempt ${retryCount.current + 1})`);
        
        try {
          await refreshUserData();
          initAttempted.current = true;
          console.log('✅ UserDataInitializer: User data refresh completed');
        } catch (error) {
          console.error('❌ UserDataInitializer: Failed to load user data:', error);
          retryCount.current++;
          
          if (retryCount.current < maxRetries) {
            console.log(`🔄 UserDataInitializer: Retrying in 2 seconds (${retryCount.current}/${maxRetries})`);
            setTimeout(() => {
              initializeUserData();
            }, 2000);
          } else {
            console.error('❌ UserDataInitializer: Max retries reached, giving up');
          }
        }
      }
    };

    // Small delay to ensure contexts are properly initialized
    const timer = setTimeout(initializeUserData, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, userData, loading, refreshUserData]);

  // Return status for debugging
  return {
    isInitialized: !!userData,
    isLoading: loading,
    retryCount: retryCount.current,
    hasUser: !!user,
    isAuthenticated
  };
};