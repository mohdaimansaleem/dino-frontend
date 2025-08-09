import React, { ReactNode } from 'react';
import { useUserDataInitializer } from '../hooks/useUserDataInitializer';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Component that ensures user data is properly initialized
 * This wraps the app content and ensures UserData is loaded when needed
 */
const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const initStatus = useUserDataInitializer();

  // Log initialization status for debugging
  React.useEffect(() => {
    console.log('🔄 AppInitializer: Status update', initStatus);
  }, [initStatus]);

  return <>{children}</>;
};

export default AppInitializer;