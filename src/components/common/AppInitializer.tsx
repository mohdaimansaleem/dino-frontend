import React, { ReactNode } from 'react';
import { useUserDataInitializer } from '../../hooks/useUserDataInitializer';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Component that ensures user data is properly initialized
 * This wraps the app content and ensures UserData is loaded when needed
 */
const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const initStatus = useUserDataInitializer();

  // Log initialization status for debugging (reduced frequency)
  React.useEffect(() => {
    if (initStatus.retryCount === 0) {
      console.log('🔄 AppInitializer: Status update', initStatus);
    }
  }, [initStatus]); // Only log on meaningful changes

  return <>{children}</>;
};

export default AppInitializer;