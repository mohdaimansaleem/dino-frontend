import React from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  MenuBook,
  TableRestaurant,
  Payment,
} from '@mui/icons-material';
import { usePermissions } from '../../auth';
import PermissionService from '../../../services/auth';
import { useDashboardFlags } from '../../../flags/FlagContext';

interface DashboardTabsProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { isSuperAdmin, isAdmin, user } = usePermissions();
  const dashboardFlags = useDashboardFlags();

  // Use the same role detection as control panel
  const backendRole = PermissionService.getBackendRole();
  const detectedRole = backendRole?.name || user?.role || 'unknown';
  
  // Only show tabs for SuperAdmin and Admin
  const shouldShowTabs = detectedRole === 'superadmin' || detectedRole === 'super_admin' || detectedRole === 'admin' || isSuperAdmin() || isAdmin();
  
  if (!shouldShowTabs) {
    return null;
  }

  // Define all possible tabs with their flags
  const allTabs = [
    {
      flag: 'showOverviewTab',
      icon: <Dashboard />,
      label: 'Overview',
      originalIndex: 0
    },
    {
      flag: 'showSalesAnalyticsTab',
      icon: <Analytics />,
      label: 'Sales Analytics',
      originalIndex: 1
    },
    {
      flag: 'showMenuPerformanceTab',
      icon: <MenuBook />,
      label: 'Menu Performance',
      originalIndex: 2
    },
    {
      flag: 'showTablesOrdersTab',
      icon: <TableRestaurant />,
      label: 'Tables & Orders',
      originalIndex: 3
    },
    {
      flag: 'showPaymentsTab',
      icon: <Payment />,
      label: 'Payments',
      originalIndex: 4
    }
  ];

  // Filter tabs based on flags
  const visibleTabs = allTabs.filter(tab => 
    dashboardFlags[tab.flag as keyof typeof dashboardFlags]
  );

  // If no tabs are visible, don't render anything
  if (visibleTabs.length === 0) {
    return null;
  }

  // Find the current visible tab index based on the original currentTab
  const currentVisibleTabIndex = visibleTabs.findIndex(tab => tab.originalIndex === currentTab);
  const safeCurrentTab = currentVisibleTabIndex >= 0 ? currentVisibleTabIndex : 0;

  // Handle tab change - convert visible index back to original index
  const handleTabChange = (event: React.SyntheticEvent, newVisibleIndex: number) => {
    const selectedTab = visibleTabs[newVisibleIndex];
    if (selectedTab) {
      onTabChange(event, selectedTab.originalIndex);
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} data-tour="quick-actions">
      <Tabs 
        value={safeCurrentTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {visibleTabs.map((tab, index) => (
          <Tab 
            key={tab.originalIndex}
            icon={tab.icon} 
            label={tab.label} 
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default DashboardTabs;