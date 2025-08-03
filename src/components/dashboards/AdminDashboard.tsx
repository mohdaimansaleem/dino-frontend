import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  People,
  TrendingUp,
  TableRestaurant,
  Visibility,
  Edit,
  Dashboard as DashboardIcon,
  Today,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CheckCircle,
  Cancel,
  Settings,
} from '@mui/icons-material';
import { WeeklyRevenueChart, StatusPieChart, DonutChart } from '../charts/ChartComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { dashboardService } from '../../services/dashboardService';
import { analyticsService } from '../../services/analyticsService';
import { venueService } from '../../services/venueService';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import UserDebugInfo from '../debug/UserDebugInfo';

/**
 * AdminDashboard Component
 * 
 * A comprehensive dashboard for administrators with:
 * - Dynamic data loading from APIs
 * - Permission-based access control
 * - Real-time chart updates
 * - Venue management controls
 * - Quick action buttons
 * 
 * Features:
 * - Removes hardcoded chart metadata
 * - Uses analytics service for chart data
 * - Dynamic role and permission checking
 * - Clean, maintainable code structure
 */

interface AdminDashboardProps {
  className?: string;
}

interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  total_tables: number;
  occupied_tables: number;
  total_menu_items: number;
  active_menu_items: number;
  total_staff: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  table_number: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface ChartData {
  weeklyRevenue: Array<{ day: string; revenue: number; orders: number }>;
  tableStatus: Array<{ name: string; value: number; color: string }>;
  menuStatus: Array<{ name: string; value: number; color: string }>;
  orderStatus: Array<{ name: string; value: number; color: string }>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const { user, hasPermission, hasBackendPermission } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const currentCafe = userData?.venue;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [cafeActive, setCafeActive] = useState(true);
  const [cafeOpen, setCafeOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats from API
      const dashboardData = await dashboardService.getAdminDashboard();
      
      if (dashboardData && dashboardData.summary) {
        setStats(dashboardData.summary);
        setRecentOrders(dashboardData.recent_orders || []);
      } else {
        setStats(null);
        setRecentOrders([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      
      // Check if it's a venue assignment error
      if (errorMessage.includes('No venue assigned')) {
        // Don't set this as a general error, let the venue check handle it
        setError(null);
        setStats(null);
        setRecentOrders([]);
      } else {
        setError(errorMessage);
        setStats(null);
        setRecentOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentCafe?.id]);

  const loadChartData = useCallback(async () => {
    if (!currentCafe?.id) return;

    try {
      setChartLoading(true);
      // Get analytics data for charts with proper error handling
      const [dashboardAnalytics, revenueTrend] = await Promise.allSettled([
        analyticsService.getDashboardAnalytics(currentCafe.id),
        analyticsService.getRevenueTrend(currentCafe.id, analyticsService.generateDateRange(7))
      ]);

      // Extract successful results and log any failures
      const analyticsData = dashboardAnalytics.status === 'fulfilled' ? dashboardAnalytics.value : null;
      const trendData = revenueTrend.status === 'fulfilled' ? revenueTrend.value : null;

      // Log specific API failures for debugging
      if (dashboardAnalytics.status === 'rejected') {
        console.warn('Dashboard analytics API failed:', dashboardAnalytics.reason);
      }
      if (revenueTrend.status === 'rejected') {
        console.warn('Revenue trend API failed:', revenueTrend.reason);
      }

      // Process revenue trend data - only use real data
      const weeklyRevenue = trendData && trendData.length > 0 
        ? trendData.map(item => ({
            day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: item.revenue,
            orders: item.orders
          }))
        : [];

      // Process order status data from dashboard analytics - only use real data
      const orderStatus = analyticsData?.order_status_breakdown && 
                         analyticsData.order_status_breakdown.length > 0
        ? analyticsData.order_status_breakdown.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: item.count,
            color: item.color || getDefaultStatusColor(item.status)
          }))
        : [];

      setChartData({
        weeklyRevenue,
        tableStatus: [], // Will be generated from stats
        menuStatus: [], // Will be generated from stats
        orderStatus
      });
    } catch (error) {
      console.warn('Failed to load chart data:', error);
      
      setChartData({
        weeklyRevenue: [],
        tableStatus: [],
        menuStatus: [],
        orderStatus: []
      });
    } finally {
      setChartLoading(false);
    }
  }, []);



  const getDefaultStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#FFF176',
      preparing: '#81D4FA',
      ready: '#C8E6C9',
      served: '#E1BEE7',
      confirmed: '#FFCC02',
      cancelled: '#FFAB91'
    };
    return colors[status.toLowerCase()] || '#F5F5F5';
  };

  const refreshDashboard = async () => {
    await Promise.all([
      loadDashboardData(),
      loadCafeStatus(),
      loadChartData()
    ]);
  };

  const loadCafeStatus = useCallback(async () => {
    if (!currentCafe?.id) return;
    
    try {
      const venue = await venueService.getVenue(currentCafe.id);
      if (venue) {
        setCafeActive(venue.is_active || false);
        // Check venue status or fall back to currentCafe isOpen
        setCafeOpen(venue.status === 'active' || currentCafe?.is_open || false);
      }
    } catch (error) {
      console.error('Error loading cafe status:', error);
    }
  }, [currentCafe?.id, currentCafe?.is_open]);

  useEffect(() => {
    loadDashboardData();
    loadCafeStatus();
    loadChartData();
    
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [currentCafe?.id, user, loadDashboardData, loadCafeStatus, loadChartData]);

  const handleToggleCafeActive = async () => {
    if (!currentCafe?.id || statusLoading) return;

    try {
      setStatusLoading(true);
      const newStatus = !cafeActive;
      
      if (newStatus) {
        await venueService.activateVenue(currentCafe.id);
      } else {
        await venueService.updateVenue(currentCafe.id, { is_active: false });
      }

      setCafeActive(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Cafe ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error toggling cafe status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update cafe status', 
        severity: 'error' 
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleToggleCafeOpen = async () => {
    if (!currentCafe?.id || statusLoading) return;

    try {
      setStatusLoading(true);
      const newStatus = !cafeOpen;
      
      await venueService.updateVenue(currentCafe.id, { 
        status: newStatus ? 'active' : 'closed' 
      });

      setCafeOpen(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Cafe ${newStatus ? 'opened' : 'closed'} for orders`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error toggling cafe open status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update cafe open status', 
        severity: 'error' 
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'served': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Dynamic permission checks
  const canManageVenue = () => {
    return hasPermission(PERMISSIONS.VENUE_ACTIVATE) || 
           hasBackendPermission('venue.update') ||
           hasBackendPermission('venue.manage');
  };

  const canViewDashboard = () => {
    return hasPermission(PERMISSIONS.DASHBOARD_VIEW) || 
           hasBackendPermission('dashboard.read') ||
           hasBackendPermission('dashboard.view');
  };

  const canManageOrders = () => {
    return hasPermission(PERMISSIONS.ORDERS_VIEW) || 
           hasBackendPermission('order.read') ||
           hasBackendPermission('order.manage');
  };

  // Set default zero values when no data is available
  const displayStats = stats || {
    today_orders: 0,
    today_revenue: 0,
    total_tables: 0,
    occupied_tables: 0,
    total_menu_items: 0,
    active_menu_items: 0,
    total_staff: 0,
  };

  const tableOccupancyPercentage = displayStats.total_tables > 0 ? 
    Math.round((displayStats.occupied_tables / displayStats.total_tables) * 100) : 0;

  const menuActivePercentage = displayStats.total_menu_items > 0 ? 
    Math.round((displayStats.active_menu_items / displayStats.total_menu_items) * 100) : 0;

  // Generate dynamic chart data based on current stats and API data
  const getTableStatusData = () => [
    { name: 'Occupied', value: displayStats.occupied_tables || 0, color: '#FFAB91' },
    { name: 'Available', value: (displayStats.total_tables || 0) - (displayStats.occupied_tables || 0), color: '#A5D6A7' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMenuStatusData = () => [
    { name: 'Active', value: displayStats.active_menu_items || 0, color: '#A5D6A7' },
    { name: 'Inactive', value: (displayStats.total_menu_items || 0) - (displayStats.active_menu_items || 0), color: '#FFCC02' },
  ];

  const getWeeklyRevenueData = () => {
    return chartData?.weeklyRevenue || [];
  };

  const getOrderStatusData = () => {
    if (chartData?.orderStatus && chartData.orderStatus.length > 0) {
      return chartData.orderStatus;
    }
    
    // Use recent orders analysis only if we have real data
    if (recentOrders.length > 0) {
      const statusData = [
        { name: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length, color: '#FFF176' },
        { name: 'Preparing', value: recentOrders.filter(o => o.status === 'preparing').length, color: '#81D4FA' },
        { name: 'Ready', value: recentOrders.filter(o => o.status === 'ready').length, color: '#C8E6C9' },
        { name: 'Served', value: recentOrders.filter(o => o.status === 'served').length, color: '#E1BEE7' },
      ].filter(item => item.value > 0);
      
      return statusData.length > 0 ? statusData : [];
    }
    
    return [];
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading Admin Dashboard...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className={className} sx={{ p: 2, pt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon color="primary" />
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.firstName}! Here's your venue overview for today.
            </Typography>
          </Box>
          
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={refreshDashboard} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        </Box>
      );
    }

    return (
      <Box 
        className={className} 
        sx={{ 
          p: { xs: 2, lg: 1 }, 
          pt: { xs: 2, lg: 1 }, // Add some top padding but less than before
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Debug Info - Only in development */}
        {process.env.NODE_ENV === 'development' && <UserDebugInfo />}
        
        {/* Debug: Show current state */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Debug Info:</strong><br/>
              Current Cafe: {currentCafe ? `${currentCafe.name} (${currentCafe.id})` : 'None'}<br/>
              User Role: {user?.role || 'Unknown'}<br/>
              Can Manage Venue: {canManageVenue() ? 'Yes' : 'No'}<br/>
              Can View Dashboard: {canViewDashboard() ? 'Yes' : 'No'}<br/>
              Should Show Toggle: {(currentCafe && canManageVenue()) ? 'Yes' : 'No'}
            </Typography>
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: { xs: 2, lg: 1.5 }, flexShrink: 0, mt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, mt: 0 }}>
                <DashboardIcon color="primary" />
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {user?.firstName}! Here's your venue overview for today.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={refreshDashboard}
              disabled={loading || chartLoading}
              size="small"
              sx={{ mt: 1 }}
            >
              {loading || chartLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        {/* Cafe Status Control Panel - Only for users with venue management permissions */}
        {currentCafe && canManageVenue() && (
          <Card sx={{ mb: { xs: 3, lg: 2 }, border: '2px solid', borderColor: cafeActive ? 'success.main' : 'error.main' }}>
            <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: cafeActive ? 'success.main' : 'error.main',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {cafeActive ? <CheckCircle /> : <Cancel />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {currentCafe.name || 'Current Cafe'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {cafeActive ? (cafeOpen ? 'Open for Orders' : 'Closed for Orders') : 'Inactive'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  {/* Cafe Active/Inactive Toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings sx={{ color: 'text.secondary' }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cafeActive}
                          onChange={handleToggleCafeActive}
                          disabled={statusLoading}
                          color="primary"
                          size="medium"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {cafeActive ? 'Active' : 'Inactive'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cafeActive ? 'Cafe is operational' : 'Cafe is disabled'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Cafe Open/Closed Toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant sx={{ color: 'text.secondary' }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cafeOpen}
                          onChange={handleToggleCafeOpen}
                          disabled={statusLoading || !cafeActive}
                          color="success"
                          size="medium"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {cafeOpen ? 'Open' : 'Closed'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cafeOpen ? 'Accepting orders' : 'Orders disabled'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  {/* Quick Settings Button */}
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => window.location.href = '/admin/cafe-settings'}
                    size="small"
                  >
                    Settings
                  </Button>
                </Box>
              </Box>

              {statusLoading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Fallback Toggle for Testing - Always Visible */}
        {!currentCafe && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>No Cafe Available:</strong> Please ensure you have a cafe assigned to your account to see the status toggle controls.
            </Typography>
          </Alert>
        )}

        {/* Show message if user lacks venue management permissions */}
        {currentCafe && !canManageVenue() && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Permission Required:</strong> Cafe status controls require venue management permissions.
              <br/>Your current role: {user?.role || 'Unknown'}
            </Typography>
          </Alert>
        )}

        {/* Dashboard Content Container */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: { xs: 3, lg: 2 } }}>
          {/* Row 1: Quick Stats */}
          <Grid container spacing={{ xs: 3, lg: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Today color="primary" sx={{ fontSize: { xs: 40, lg: 35 } }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', lg: '1.8rem' } }}>
                        {displayStats.today_orders || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today's Orders
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp color="success" sx={{ fontSize: { xs: 40, lg: 35 } }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', lg: '1.8rem' } }}>
                        ₹{displayStats.today_revenue?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today's Revenue
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TableRestaurant color="warning" sx={{ fontSize: { xs: 40, lg: 35 } }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', lg: '1.8rem' } }}>
                        {displayStats.occupied_tables || 0}/{displayStats.total_tables || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tables Occupied
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={tableOccupancyPercentage} 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Restaurant color="info" sx={{ fontSize: { xs: 40, lg: 35 } }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', lg: '1.8rem' } }}>
                        {displayStats.active_menu_items || 0}/{displayStats.total_menu_items || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Menu Items Active
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={menuActivePercentage} 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: Weekly Revenue Chart & Recent Orders Status */}
          <Grid container spacing={{ xs: 3, lg: 2 }}>
            {/* Weekly Revenue Trend */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, lg: 2 } }}>
                    <BarChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Weekly Revenue & Orders Trend
                    </Typography>
                  </Box>
                  {chartLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={280}>
                      <CircularProgress />
                    </Box>
                  ) : getWeeklyRevenueData().length > 0 ? (
                    <WeeklyRevenueChart data={getWeeklyRevenueData()} height={280} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={280}>
                      <Typography variant="body2" color="text.secondary">
                        No revenue data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Orders Status */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders Status
                  </Typography>
                  {chartLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={280}>
                      <CircularProgress />
                    </Box>
                  ) : getOrderStatusData().length > 0 ? (
                    <DonutChart data={getOrderStatusData()} height={280} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={280}>
                      <Typography variant="body2" color="text.secondary">
                        No order status data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Table Status & Venue Status */}
          <Grid container spacing={{ xs: 3, lg: 2 }}>
            {/* Table Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, lg: 1.5 } }}>
                    <PieChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Table Status
                    </Typography>
                  </Box>
                  {chartLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={220}>
                      <CircularProgress />
                    </Box>
                  ) : getTableStatusData().some(item => item.value > 0) ? (
                    <StatusPieChart data={getTableStatusData()} height={220} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={220}>
                      <Typography variant="body2" color="text.secondary">
                        No table data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Venue Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
                  <Typography variant="h6" gutterBottom>
                    Venue Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, lg: 2 }, mt: { xs: 4, lg: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Table Occupancy</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {tableOccupancyPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={tableOccupancyPercentage} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Menu Availability</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {menuActivePercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={menuActivePercentage} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Staff Count</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {displayStats.total_staff || 0} Active
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Total Tables</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {displayStats.total_tables || 0}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Total Menu Items</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {displayStats.total_menu_items || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders */}
          <Card sx={{ mt: { xs: 0, lg: 1 } }}>
            <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, lg: 2 } }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                {canManageOrders() && (
                  <Button
                    variant="outlined"
                    onClick={() => window.location.href = '/admin/orders'}
                    size="small"
                  >
                    View All Orders
                  </Button>
                )}
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell align="center">Table</TableCell>
                      <TableCell align="center">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Time</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No recent orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.slice(0, 4).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {order.order_number}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            Table {order.table_number}
                          </TableCell>
                          <TableCell align="center">
                            ₹{order.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </TableCell>
                          <TableCell align="center">
                            {canManageOrders() && (
                              <IconButton
                                size="small"
                                onClick={() => window.location.href = `/admin/orders/${order.id}`}
                              >
                                <Visibility />
                              </IconButton>
                            )}
                            {(hasPermission(PERMISSIONS.ORDERS_UPDATE) || hasBackendPermission('order.update')) && (
                              <IconButton
                                size="small"
                                onClick={() => window.location.href = `/admin/orders/${order.id}/edit`}
                              >
                                <Edit />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Quick Actions - Full Width */}
          <Card sx={{ flexShrink: 0, mb: { xs: 4, lg: 3 } }}>
            <CardContent sx={{ p: { xs: 2, lg: 1.5 } }}>
              <Typography variant="h6" gutterBottom sx={{ mb: { xs: 3, lg: 2 } }}>
                Quick Actions
              </Typography>
              <Grid container spacing={{ xs: 3, lg: 2 }}>
                {canManageOrders() && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={() => window.location.href = '/admin/orders'}
                      sx={{ py: { xs: 2, lg: 1.5 } }}
                    >
                      View Orders
                    </Button>
                  </Grid>
                )}
                {(hasPermission(PERMISSIONS.MENU_VIEW) || hasBackendPermission('menu.read')) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Restaurant />}
                      onClick={() => window.location.href = '/admin/menu'}
                      sx={{ py: { xs: 2, lg: 1.5 } }}
                    >
                      Manage Menu
                    </Button>
                  </Grid>
                )}
                {(hasPermission(PERMISSIONS.TABLES_VIEW) || hasBackendPermission('table.read')) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<TableRestaurant />}
                      onClick={() => window.location.href = '/admin/tables'}
                      sx={{ py: { xs: 2, lg: 1.5 } }}
                    >
                      Manage Tables
                    </Button>
                  </Grid>
                )}
                {(hasPermission(PERMISSIONS.USERS_VIEW) || hasBackendPermission('user.read')) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<People />}
                      onClick={() => window.location.href = '/admin/users'}
                      sx={{ py: { xs: 2, lg: 1.5 } }}
                    >
                      Manage Staff
                    </Button>
                  </Grid>
                )}
                
                {/* Show message if no quick actions are available */}
                {!canManageOrders() && 
                 !hasPermission(PERMISSIONS.MENU_VIEW) && !hasBackendPermission('menu.read') &&
                 !hasPermission(PERMISSIONS.TABLES_VIEW) && !hasBackendPermission('table.read') &&
                 !hasPermission(PERMISSIONS.USERS_VIEW) && !hasBackendPermission('user.read') && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        No quick actions available. Contact your administrator to request additional permissions.
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return (
    <VenueAssignmentCheck showFullPage={true}>
      {renderDashboardContent()}
      
      {/* Status Update Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </VenueAssignmentCheck>
  );
};

export default AdminDashboard;