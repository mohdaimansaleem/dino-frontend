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

  Snackbar,
  useTheme,
  useMediaQuery,
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

  Settings,
  Refresh,
} from '@mui/icons-material';
import { WeeklyRevenueChart, StatusPieChart, DonutChart } from '../charts/ChartComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '../../types/auth';
import { dashboardService } from '../../services/dashboardService';
import { analyticsService } from '../../services/analyticsService';
import { venueService } from '../../services/venueService';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import { getUserFirstName } from '../../utils/userUtils';

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

interface TopMenuItem {
  id: string;
  name: string;
  category: string;
  order_count: number;
  total_revenue: number;
  price: number;
}

interface ChartData {
  weeklyRevenue: Array<{ day: string; revenue: number; orders: number }>;
  tableStatus: Array<{ name: string; value: number; color: string }>;
  menuStatus: Array<{ name: string; value: number; color: string }>;
  orderStatus: Array<{ name: string; value: number; color: string }>;
}

interface AdminDashboardResponse {
  summary: DashboardStats;
  recent_orders: RecentOrder[];
  top_menu_items: TopMenuItem[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const { user, hasPermission, hasBackendPermission } = useAuth();
  const { userData } = useUserData();
  const navigate = useNavigate();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const currentVenue = userData?.venue;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItem[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [venueActive, setVenueActive] = useState(true);
  const [venueOpen, setVenueOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats from API
      const dashboardData = await dashboardService.getAdminDashboard() as AdminDashboardResponse;
      
      if (dashboardData && dashboardData.summary) {
        setStats(dashboardData.summary);
        setRecentOrders(dashboardData.recent_orders || []);
        setTopMenuItems(dashboardData.top_menu_items || []);
      } else {
        setStats(null);
        setRecentOrders([]);
        setTopMenuItems([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      
      // Check if it's a venue assignment error
      if (errorMessage.includes('No venue assigned')) {
        // Don't set this as a general error, let the venue check handle it
        setError(null);
        setStats(null);
        setRecentOrders([]);
        setTopMenuItems([]);
      } else {
        setError(errorMessage);
        setStats(null);
        setRecentOrders([]);
        setTopMenuItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChartData = useCallback(async () => {
    if (!currentVenue?.id) return;

    try {
      setChartLoading(true);
      // Get analytics data for charts with proper error handling
      const [dashboardAnalytics, revenueTrend] = await Promise.allSettled([
        analyticsService.getDashboardAnalytics(currentVenue.id),
        analyticsService.getRevenueTrend(currentVenue.id, analyticsService.generateDateRange(7))
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
      loadVenueStatus(),
      loadChartData()
    ]);
  };

  const loadVenueStatus = useCallback(async () => {
    if (!currentVenue?.id) return;
    
    try {
      const venue = await venueService.getVenue(currentVenue.id);
      if (venue) {
        setVenueActive(venue.is_active || false);
        // Check venue status or fall back to currentVenue isOpen
        setVenueOpen(venue.status === 'active' || venue.is_open || false);
      }
    } catch (error) {
      console.error('Error loading venue status:', error);
    }
  }, []);

  useEffect(() => {
    if (currentVenue?.id) {
      loadDashboardData();
      loadVenueStatus();
      loadChartData();
    } else {
      // If no venue, set loading to false to show the venue assignment check
      setLoading(false);
    }
    
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [currentVenue?.id, user, loadDashboardData, loadVenueStatus, loadChartData]);

  // const handleToggleVenueActive = async () => {
  //   if (!currentVenue?.id || statusLoading) return;

  //   try {
  //     setStatusLoading(true);
  //     const newStatus = !venueActive;
      
  //     if (newStatus) {
  //       await venueService.activateVenue(currentVenue.id);
  //     } else {
  //       await venueService.updateVenue(currentVenue.id, { is_active: false });
  //     }

  //     setVenueActive(newStatus);
  //     setSnackbar({ 
  //       open: true, 
  //       message: `Venue ${newStatus ? 'activated' : 'deactivated'} successfully`, 
  //       severity: 'success' 
  //     });
  //   } catch (error) {
  //     console.error('Error toggling venue status:', error);
  //     setSnackbar({ 
  //       open: true, 
  //       message: 'Failed to update venue status', 
  //       severity: 'error' 
  //     });
  //   } finally {
  //     setStatusLoading(false);
  //   }
  // };

  // const handleToggleVenueOpen = async () => {
  //   if (!currentVenue?.id || statusLoading) return;

  //   try {
  //     setStatusLoading(true);
  //     const newStatus = !venueOpen;
      
  //     await venueService.updateVenue(currentVenue.id, { 
  //       status: newStatus ? 'active' : 'closed' 
  //     });

  //     setVenueOpen(newStatus);
  //     setSnackbar({ 
  //       open: true, 
  //       message: `Venue ${newStatus ? 'opened' : 'closed'} for orders`, 
  //       severity: 'success' 
  //     });
  //   } catch (error) {
  //     console.error('Error toggling venue open status:', error);
  //     setSnackbar({ 
  //       open: true, 
  //       message: 'Failed to update venue open status', 
  //       severity: 'error' 
  //     });
  //   } finally {
  //     setStatusLoading(false);
  //   }
  // };

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

  // const canViewDashboard = () => {
  //   return hasPermission(PERMISSIONS.DASHBOARD_VIEW) || 
  //          hasBackendPermission('dashboard.read') ||
  //          hasBackendPermission('dashboard.view');
  // };

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
    if (loading && currentVenue?.id) {
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
              Welcome back, {getUserFirstName(user)}! Here's your venue overview for today.
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
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >

        


        {/* Header */}
        <Box sx={{ mb: 4, flexShrink: 0, pt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '-0.025em'
                }}
              >
                <DashboardIcon 
                  color="primary" 
                  sx={{ 
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} 
                />
                Admin Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 500,
                  lineHeight: 1.4,
                  maxWidth: { xs: '100%', md: '600px' }
                }}
              >
                Welcome back, {getUserFirstName(user)}! Here's your venue overview for today.
              </Typography>
            </Box>
            <IconButton
              onClick={refreshDashboard}
              disabled={loading || chartLoading}
              size="large"
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { 
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled'
                },
                transition: 'all 0.2s ease-in-out',
                ml: 2
              }}
              title={loading || chartLoading ? 'Refreshing...' : 'Refresh Dashboard'}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>



        {/* Show message if user lacks venue management permissions */}
        {currentVenue && !canManageVenue() && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Permission Required:</strong> Venue status controls require venue management permissions.
              <br/>Your current role: {user?.role || 'Unknown'}
            </Typography>
          </Alert>
        )}

        {/* Dashboard Content Container */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: { xs: 3, lg: 2 } }}>
          {/* Row 1: Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '160px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.light'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Today 
                    color="primary" 
                    sx={{ 
                      fontSize: 40, 
                      mb: 2,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      fontSize: '2rem',
                      mb: 1,
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {displayStats.today_orders || 0}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    Today's Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '160px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'success.light'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <TrendingUp 
                    color="success" 
                    sx={{ 
                      fontSize: 40, 
                      mb: 2,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      fontSize: { xs: '1.5rem', sm: '1.75rem' },
                      mb: 1,
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    ₹{displayStats.today_revenue?.toLocaleString() || 0}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    Today's Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '160px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'warning.light'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <TableRestaurant 
                    color="warning" 
                    sx={{ 
                      fontSize: 40, 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      fontSize: '1.75rem',
                      mb: 0.5,
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {displayStats.occupied_tables || 0}/{displayStats.total_tables || 0}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      mb: 1.5
                    }}
                  >
                    Tables Occupied
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={tableOccupancyPercentage} 
                    sx={{ 
                      width: '100%',
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '160px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'info.light'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Restaurant 
                    color="info" 
                    sx={{ 
                      fontSize: 40, 
                      mb: 1.5,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      fontSize: '1.75rem',
                      mb: 0.5,
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {displayStats.active_menu_items || 0}/{displayStats.total_menu_items || 0}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      mb: 1.5
                    }}
                  >
                    Menu Items Active
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={menuActivePercentage} 
                    sx={{ 
                      width: '100%',
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: Weekly Revenue Chart & Recent Orders Status */}
          <Grid container spacing={3}>
            {/* Weekly Revenue Trend */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                height: '420px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    gap: 2
                  }}>
                    <BarChartIcon 
                      color="primary" 
                      sx={{ 
                        fontSize: '1.75rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography 
                      variant="h5"
                      sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Weekly Revenue & Orders Trend
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {chartLoading ? (
                      <CircularProgress size={40} />
                    ) : getWeeklyRevenueData().length > 0 ? (
                      <WeeklyRevenueChart data={getWeeklyRevenueData()} height={300} />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2
                      }}>
                        <BarChartIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                          No Revenue Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Revenue trends will appear here once orders are placed.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Orders Status */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '420px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    gap: 2
                  }}>
                    <PieChartIcon 
                      color="primary" 
                      sx={{ 
                        fontSize: '1.75rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Recent Orders Status
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {chartLoading ? (
                      <CircularProgress size={40} />
                    ) : getOrderStatusData().length > 0 ? (
                      <DonutChart data={getOrderStatusData()} height={300} />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2
                      }}>
                        <PieChartIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                          No Order Status Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Order status breakdown will appear here once orders are placed.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Table Status & Venue Status */}
          <Grid container spacing={3}>
            {/* Table Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '380px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <PieChartIcon 
                      color="primary" 
                      sx={{ 
                        fontSize: '1.75rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography 
                      variant="h5"
                      sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.01em'
                      }}
                    >
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
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: 220,
                      gap: 2
                    }}>
                      <TableRestaurant sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary" textAlign="center">
                        No Table Data Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Table occupancy status will appear here once tables are configured.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Menu Items */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '380px',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Restaurant 
                      color="primary" 
                      sx={{ 
                        fontSize: '1.75rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography 
                      variant="h5"
                      sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Top 5 Most Ordered Items
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}>
                    {topMenuItems.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2
                      }}>
                        <Restaurant sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                          No Order Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Popular menu items will appear here once orders are placed.
                        </Typography>
                      </Box>
                    ) : (
                      topMenuItems.slice(0, 5).map((item, index) => (
                        <Box 
                          key={item.id}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: index === 0 ? 'primary.light' : 'action.hover',
                            border: index === 0 ? '2px solid' : '1px solid',
                            borderColor: index === 0 ? 'primary.main' : 'divider',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 800,
                                  color: index === 0 ? 'primary.main' : 'text.primary',
                                  minWidth: '20px'
                                }}
                              >
                                #{index + 1}
                              </Typography>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: index === 0 ? 'primary.main' : 'text.primary',
                                  fontSize: '0.95rem'
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              {item.category} • ₹{item.price}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 800,
                                color: index === 0 ? 'primary.main' : 'success.main',
                                fontSize: '1rem'
                              }}
                            >
                              {item.order_count}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.7rem'
                              }}
                            >
                              orders
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShoppingCart 
                    color="primary" 
                    sx={{ 
                      fontSize: '1.75rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography 
                    variant="h5"
                    sx={{ 
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Recent Orders
                  </Typography>
                </Box>
                {canManageOrders() && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/orders')}
                    size="medium"
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    View All Orders
                  </Button>
                )}
              </Box>

              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 650 }
                  }
                }}
              >
                <Table size={isSmallScreen ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 700,
                        color: 'text.primary'
                      }}>
                        Order #
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 700,
                          color: 'text.primary',
                          display: { xs: 'none', sm: 'table-cell' }
                        }}
                      >
                        Table
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        Amount
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 700,
                          color: 'text.primary',
                          display: { xs: 'none', md: 'table-cell' }
                        }}
                      >
                        Time
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No Recent Orders Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                              Orders will appear here once customers start placing them. Check back soon or refresh the dashboard.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.slice(0, 4).map((order, index) => (
                        <TableRow 
                          key={order.id}
                          sx={{
                            backgroundColor: index % 2 === 0 ? 'background.default' : 'action.hover',
                            '&:hover': {
                              backgroundColor: 'action.selected',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="700"
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                color: 'primary.main'
                              }}
                            >
                              {order.order_number}
                            </Typography>
                            {/* Show table on mobile in the order cell */}
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: { xs: 'block', sm: 'none' },
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              Table {order.table_number}
                            </Typography>
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              display: { xs: 'none', sm: 'table-cell' },
                              py: 2.5,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              fontWeight: 600
                            }}
                          >
                            Table {order.table_number}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              py: 2.5,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              fontWeight: 700,
                              color: 'success.main'
                            }}
                          >
                            ₹{order.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ py: 2.5 }}
                          >
                            <Chip
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={getStatusColor(order.status) as any}
                              size="medium"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                height: { xs: 24, sm: 28 },
                                borderRadius: 2
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              display: { xs: 'none', md: 'table-cell' },
                              py: 2.5,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              fontWeight: 500,
                              color: 'text.secondary'
                            }}
                          >
                            {new Date(order.created_at).toLocaleTimeString()}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ py: 2.5 }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1,
                              justifyContent: 'center',
                              flexDirection: { xs: 'column', sm: 'row' }
                            }}>
                              {canManageOrders() && (
                                <IconButton
                                  size="medium"
                                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                                  sx={{ 
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'primary.dark',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <Visibility sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                              {(hasPermission(PERMISSIONS.ORDERS_UPDATE) || hasBackendPermission('order.update')) && (
                                <IconButton
                                  size="medium"
                                  onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                                  sx={{ 
                                    backgroundColor: 'warning.main',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'warning.dark',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <Edit sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </Box>
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
          <Card sx={{ 
            flexShrink: 0, 
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Settings 
                  color="primary" 
                  sx={{ 
                    fontSize: '1.75rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Quick Actions
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {canManageOrders() && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={() => navigate('/admin/orders')}
                      sx={{ 
                        py: 2.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                      }}
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
                      onClick={() => navigate('/admin/menu')}
                      sx={{ 
                        py: 2.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                      }}
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
                      onClick={() => navigate('/admin/tables')}
                      sx={{ 
                        py: 2.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                      }}
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
                      onClick={() => navigate('/admin/users')}
                      sx={{ 
                        py: 2.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease-in-out'
                      }}
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