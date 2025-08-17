import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  getSidebarWidth: (isTablet?: boolean) => number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ 
  children, 
  defaultCollapsed = false 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const getSidebarWidth = (isTablet: boolean = false) => {
    return isCollapsed ? 72 : (isTablet ? 200 : 280);
  };

  const value: SidebarContextType = {
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
    getSidebarWidth,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;