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
import { usePermissions } from '../../RoleBasedComponent';
import PermissionService from '../../../services/permissionService';

interface DashboardTabsProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { isSuperAdmin, isAdmin, user } = usePermissions();

  // Use the same role detection as control panel
  const backendRole = PermissionService.getBackendRole();
  const detectedRole = backendRole?.name || user?.role || 'unknown';
  
  // Only show tabs for SuperAdmin and Admin
  const shouldShowTabs = detectedRole === 'superadmin' || detectedRole === 'super_admin' || detectedRole === 'admin' || isSuperAdmin() || isAdmin();
  
  if (!shouldShowTabs) {
    return null;
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} data-tour="quick-actions">
      <Tabs 
        value={currentTab} 
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<Dashboard />} label="Overview" />
        <Tab icon={<Analytics />} label="Sales Analytics" />
        <Tab icon={<MenuBook />} label="Menu Performance" />
        <Tab icon={<TableRestaurant />} label="Tables & Orders" />
        <Tab icon={<Payment />} label="Payments" />
      </Tabs>
    </Box>
  );
};

export default DashboardTabs;