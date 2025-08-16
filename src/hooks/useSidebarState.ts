import { useState, useEffect } from 'react';

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Listen for storage changes to sync across components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('sidebarStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarStateChanged', handleStorageChange);
    };
  }, []);

  const getSidebarWidth = (isTablet: boolean = false) => {
    return isCollapsed ? 72 : (isTablet ? 200 : 280);
  };

  return {
    isCollapsed,
    getSidebarWidth,
  };
};