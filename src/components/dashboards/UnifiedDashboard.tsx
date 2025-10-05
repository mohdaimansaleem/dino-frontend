import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS, UserRole } from '../../types/auth';
import { dashboardService } from '../../services/business';
import { AdminDashboardResponse, SuperAdminDashboardResponse, OperatorDashboardResponse } from '../../types/dashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import DashboardTour from '../tour/DashboardTour';
import { usePermissions } from '../auth';
import PermissionService from '../../services/auth';
import { useDashboardFlags } from '../../flags/FlagContext';

// Import modular components
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardTabs from './components/DashboardTabs';
import TabPanel from './components/TabPanel';
import OverviewTab from './components/tabs/OverviewTab';
import SalesAnalyticsTab from './components/tabs/SalesAnalyticsTab';
import MenuPerformanceTab from './components/tabs/MenuPerformanceTab';
import TablesOrdersTab from './components/tabs/TablesOrdersTab';
import PaymentsTab from './components/tabs/PaymentsTab';

interface UnifiedDashboardProps {
  className?: string;
}

interface VenueDashboardStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  total_tables: number;
  total_menu_items: number;
  todays_revenue: number;
  todays_orders: number;
  avg_order_value: number;
  table_occupancy_rate: number;
  popular_items_count: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  occupied_tables: number;
  active_menu_items: number;
}

interface MenuItemPerformance {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category: string;
  rating: number;
}

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  occupancy_time?: number;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ className }) => {
  const { user, hasPermission, hasBackendPermission, userPermissions } = useAuth();
  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  const dashboardFlags = useDashboardFlags();
  
  // Permission hooks
  const {
    isSuperAdmin,
    isAdmin,
    isOperator,
    canViewDashboard,
    canManageUsers,
    canManageOrders,
    canManageMenu,
    canManageTables,
  } = usePermissions();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VenueDashboardStats | null>(null);
  const [menuPerformance, setMenuPerformance] = useState<MenuItemPerformance[]>([]);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | SuperAdminDashboardResponse | OperatorDashboardResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data based on user role
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get role using the same approach as control panel
      const backendRole = PermissionService.getBackendRole();
      const detectedRole = backendRole?.name || user?.role || 'unknown';
      
      let data;
      
      // Use backend role for dashboard selection
      if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
        data = await dashboardService.getSuperAdminDashboard();
      } else if (detectedRole === 'admin') {
        data = await dashboardService.getAdminDashboard();
      } else if (detectedRole === 'operator') {
        data = await dashboardService.getOperatorDashboard();
      } else {
        // Fallback based on permission hooks
        if (isSuperAdmin()) {
          data = await dashboardService.getSuperAdminDashboard();
        } else if (isAdmin()) {
          data = await dashboardService.getAdminDashboard();
        } else if (isOperator()) {
          data = await dashboardService.getOperatorDashboard();
        } else {
          data = await dashboardService.getAdminDashboard();
        }
      }
      
      if (data) {
        setDashboardData(data);
        
        // Process stats based on role and data format
        if ('system_stats' in data) {
          // SuperAdmin format
          const superAdminData = data as SuperAdminDashboardResponse;
          setStats({
            total_orders: superAdminData.system_stats?.total_orders || 0,
            total_revenue: superAdminData.system_stats?.total_revenue || 0,
            active_orders: superAdminData.system_stats?.active_orders || 0,
            total_tables: superAdminData.system_stats?.total_tables || 0,
            total_menu_items: superAdminData.system_stats?.total_menu_items || 0,
            todays_revenue: superAdminData.system_stats?.total_revenue_today || 0,
            todays_orders: superAdminData.system_stats?.total_orders_today || 0,
            avg_order_value: superAdminData.system_stats?.avg_order_value || 0,
            table_occupancy_rate: superAdminData.system_stats?.table_occupancy_rate || 0,
            popular_items_count: superAdminData.top_menu_items?.length || 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: superAdminData.system_stats?.occupied_tables || 0,
            active_menu_items: superAdminData.system_stats?.active_menu_items || 0,
          });
        } else if ('stats' in data && 'venue_name' in data) {
          // Admin format
          const adminData = data as AdminDashboardResponse;
          const adminStats = adminData.stats;
          setStats({
            total_orders: adminStats?.today.orders_count || 0,
            total_revenue: adminStats?.today.revenue || 0,
            active_orders: 0,
            total_tables: adminStats?.current.tables_total || 0,
            total_menu_items: adminStats?.current.menu_items_total || 0,
            todays_revenue: adminStats?.today.revenue || 0,
            todays_orders: adminStats?.today.orders_count || 0,
            avg_order_value: adminStats?.today.average_order_value || 0,
            table_occupancy_rate: Math.round((adminStats?.current.tables_occupied / Math.max(adminStats?.current.tables_total, 1)) * 100) || 0,
            popular_items_count: 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: adminStats?.current.tables_occupied || 0,
            active_menu_items: adminStats?.current.menu_items_active || 0,
          });
        } else {
          // Operator format
          const operatorData = data as OperatorDashboardResponse;
          setStats({
            total_orders: 0,
            total_revenue: 0,
            active_orders: operatorData.stats?.active_orders || 0,
            total_tables: (operatorData.stats?.tables_occupied || 0) + (operatorData.stats?.tables_available || 0),
            total_menu_items: 0,
            todays_revenue: 0,
            todays_orders: 0,
            avg_order_value: 0,
            table_occupancy_rate: Math.round(((operatorData.stats?.tables_occupied || 0) / Math.max((operatorData.stats?.tables_occupied || 0) + (operatorData.stats?.tables_available || 0), 1)) * 100),
            popular_items_count: 0,
            pending_orders: operatorData.stats?.pending_orders || 0,
            preparing_orders: operatorData.stats?.preparing_orders || 0,
            ready_orders: operatorData.stats?.ready_orders || 0,
            occupied_tables: operatorData.stats?.tables_occupied || 0,
            active_menu_items: 0,
          });
        }
        
        // Set menu performance data
        if ('top_menu_items' in data && data.top_menu_items && data.top_menu_items.length > 0) {
          const formattedMenuItems = data.top_menu_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            orders: item.orders,
            revenue: item.revenue,
            category: item.category,
            rating: item.rating || 4.0,
          }));
          setMenuPerformance(formattedMenuItems);
        } else {
          setMenuPerformance([]);
        }
        
        // Set table status data
        if ('venue_performance' in data && data.venue_performance && data.venue_performance.length > 0) {
          const formattedTables: TableStatus[] = [];
          data.venue_performance.forEach((venue: any, index: number) => {
            for (let i = 1; i <= Math.min(venue.total_tables, 5); i++) {
              formattedTables.push({
                id: `${venue.id}-table-${i}`,
                table_number: `${venue.name.substring(0, 3).toUpperCase()}-${i}`,
                status: i <= venue.occupied_tables ? 'occupied' : 'available',
                current_order_id: i <= venue.occupied_tables ? `order-${venue.id}-${i}` : undefined,
                occupancy_time: i <= venue.occupied_tables ? Math.floor(Math.random() * 120) + 15 : undefined,
              });
            }
          });
          setTableStatuses(formattedTables);
        } else {
          setTableStatuses([]);
        }
      } else {
        // No data available - set everything to zero
        setStats({
          total_orders: 0,
          total_revenue: 0,
          active_orders: 0,
          total_tables: 0,
          total_menu_items: 0,
          todays_revenue: 0,
          todays_orders: 0,
          avg_order_value: 0,
          table_occupancy_rate: 0,
          popular_items_count: 0,
          pending_orders: 0,
          preparing_orders: 0,
          ready_orders: 0,
          occupied_tables: 0,
          active_menu_items: 0,
        });
        setMenuPerformance([]);
        setTableStatuses([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      
      if (errorMessage.includes('No venue assigned')) {
        setError(null);
        setDashboardData(null);
      } else {
        setError(errorMessage);
        setDashboardData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, isAdmin, isOperator, user]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    // Only proceed if we have a user
    if (!user) {
      setLoading(true);
      return;
    }

    // Load dashboard data for authenticated users
    if (currentVenue?.id || isSuperAdmin()) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [currentVenue?.id, user, loadDashboardData, isSuperAdmin]);

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={refreshDashboard} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  // Check if user has permission to view dashboard
  if (!canViewDashboard()) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        You don't have permission to view the dashboard. Contact your administrator for access.
      </Alert>
    );
  }



  return (
    <VenueAssignmentCheck showFullPage={!isSuperAdmin()}>

      <Box
        className={className}
        sx={{
          minHeight: 'auto',
          height: 'auto',
          backgroundColor: '#f8f9fa',
          padding: 0,
          margin: 0,
          width: '100%',
          overflow: 'visible',
          '& .MuiContainer-root': {
            padding: '0 !important',
            margin: '0 !important',
            maxWidth: 'none !important',
          },
        }}
      >
        {/* Dashboard Header */}
        <DashboardHeader 
          loading={loading}
          refreshing={refreshing}
          onRefresh={refreshDashboard}
        />

        {/* Main Content */}
        <Box
          sx={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
        >
          {/* Dashboard Content Container */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2, pb: { xs: 6, sm: 8 } }}>
            
            {/* Dashboard Tour */}
            <DashboardTour />

            {/* Dashboard Statistics */}
            <DashboardStats stats={stats} />

            {/* Dashboard Tabs (only for SuperAdmin and Admin) */}
            <DashboardTabs 
              currentTab={currentTab}
              onTabChange={(e, newValue) => setCurrentTab(newValue)}
            />

            {/* Tab Content (only for SuperAdmin and Admin) */}
            {(() => {
              const backendRole = PermissionService.getBackendRole();
              const detectedRole = backendRole?.name || user?.role || 'unknown';
              return detectedRole === 'superadmin' || detectedRole === 'super_admin' || detectedRole === 'admin' || isSuperAdmin() || isAdmin();
            })() && (
              <>
                {/* Overview Tab */}
                <TabPanel value={currentTab} index={0}>
                  <OverviewTab dashboardData={dashboardData} stats={stats} />
                </TabPanel>

                {/* Sales Analytics Tab */}
                <TabPanel value={currentTab} index={1}>
                  <SalesAnalyticsTab dashboardData={dashboardData} stats={stats} />
                </TabPanel>

                {/* Menu Performance Tab */}
                <TabPanel value={currentTab} index={2}>
                  <MenuPerformanceTab menuPerformance={menuPerformance} />
                </TabPanel>

                {/* Tables & Orders Tab */}
                <TabPanel value={currentTab} index={3}>
                  <TablesOrdersTab tableStatuses={tableStatuses} />
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel value={currentTab} index={4}>
                  <PaymentsTab stats={stats} />
                </TabPanel>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;