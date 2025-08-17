import { useSidebar } from '../contexts/SidebarContext';

/**
 * Hook to access sidebar state
 * Now uses React Context instead of localStorage
 * @deprecated Use useSidebar() directly instead
 */
export const useSidebarState = () => {
  const { isCollapsed, getSidebarWidth } = useSidebar();

  return {
    isCollapsed,
    getSidebarWidth,
  };
};