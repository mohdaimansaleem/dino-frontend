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
import { AdminDashboardResponse } from '../../types/dashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import { getUserFirstName } from '../../utils/userUtils';
import DashboardTour from '../tour/DashboardTour';

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

interface ChartData {
  weeklyRevenue: Array<{ day: string; revenue: number; orders: number }>;
  tableStatus: Array<{ name: string; value: number; color: string }>;
  menuStatus: Array<{ name: string; value: number; color: string }>;
  orderStatus: Array<{ name: string; value: number; color: string }>;
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
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [venueActive, setVenueActive] = useState(true);
  const [venueOpen, setVenueOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading comprehensive dashboard data...');
      
      // Load comprehensive dashboard data from single API endpoint
      const data = await dashboardService.getAdminDashboard();
      
      if (data) {
        console.log('✅ Dashboard data loaded successfully:', {
          venue: data.venue_name,
          todayOrders: data.stats.today.orders_count,
          todayRevenue: data.stats.today.revenue,
          recentOrdersCount: data.recent_orders.length,
          topMenuItemsCount: data.top_menu_items.length
        });
        
        setDashboardData(data);
        
        // Process chart data from the comprehensive response
        const processedChartData: ChartData = {
          weeklyRevenue: data.revenue_trend.map(item => ({
            day: item.day_name.substring(0, 3), // Mon, Tue, etc.
            revenue: item.revenue,
            orders: item.orders_count
          })),
          tableStatus: data.table_status_breakdown.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: item.count,
            color: item.color
          })),
          menuStatus: [], // Will be calculated from current stats
          orderStatus: data.order_status_breakdown.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: item.count,
            color: item.color
          }))
        };
        
        setChartData(processedChartData);
      } else {
        setDashboardData(null);
        setChartData(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      console.error('❌ Dashboard loading failed:', errorMessage);
      
      // Check if it's a venue assignment error
      if (errorMessage.includes('No venue assigned')) {
        // Don't set this as a general error, let the venue check handle it
        setError(null);
        setDashboardData(null);
      } else {
        setError(errorMessage);
        setDashboardData(null);
      }
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chart data is now loaded as part of the comprehensive dashboard data
  // This function is kept for compatibility but no longer makes separate API calls
  const loadChartData = useCallback(async () => {
    // Chart data is now included in the main dashboard response
    // No separate API calls needed
    console.log('📊 Chart data loaded from comprehensive dashboard response');
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

  // REMOVED: Unnecessary API call to load venue status
  // The venue status is already available in UserDataContext from /auth/user-data
  const loadVenueStatus = useCallback(() => {
    if (currentVenue) {
      setVenueActive(currentVenue.is_active || false);
      setVenueOpen(currentVenue.is_open || false);
      console.log('Using venue status from UserDataContext:', {
        isActive: currentVenue.is_active,
        isOpen: currentVenue.is_open
      });
    }
  }, [currentVenue]);

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

  // Extract stats from comprehensive dashboard data
  const stats = dashboardData?.stats;
  const recentOrders = dashboardData?.recent_orders || [];
  const topMenuItems = dashboardData?.top_menu_items || [];
  
  // Set default zero values when no data is available
  const displayStats = {
    today_orders: stats?.today.orders_count || 0,
    today_revenue: stats?.today.revenue || 0,
    total_tables: stats?.current.tables_total || 0,
    occupied_tables: stats?.current.tables_occupied || 0,
    total_menu_items: stats?.current.menu_items_total || 0,
    active_menu_items: stats?.current.menu_items_active || 0,
    total_staff: stats?.current.staff_total || 0,
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
        <Box sx={{ mb: 4, flexShrink: 0 }} data-tour="dashboard-header">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 3
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                  letterSpacing: '-0.01em'
                }}
              >
                <DashboardIcon 
                  color="primary" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }} 
                />
                Admin Dashboard
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  lineHeight: 1.5
                }}
              >
                Welcome back, {getUserFirstName(user)}! Here's your venue overview for today.
              </Typography>
            </Box>
            <Button
              onClick={refreshDashboard}
              disabled={loading || chartLoading}
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ 
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { 
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                },
                '&:disabled': {
                  borderColor: 'divider',
                  color: 'text.disabled'
                }
              }}
            >
              Refresh
            </Button>
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
          <Grid container spacing={3} data-tour="stats-cards">
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Today's Orders
                    </Typography>
                    <Today 
                      sx={{ 
                        fontSize: 24, 
                        color: 'primary.main'
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="700" 
                    sx={{ 
                      fontSize: '2rem',
                      color: 'text.primary',
                      lineHeight: 1
                    }}
                  >
                    {displayStats.today_orders || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'success.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Today's Revenue
                    </Typography>
                    <TrendingUp 
                      sx={{ 
                        fontSize: 24, 
                        color: 'success.main'
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="700" 
                    sx={{ 
                      fontSize: { xs: '1.5rem', sm: '1.75rem' },
                      color: 'text.primary',
                      lineHeight: 1
                    }}
                  >
                    ₹{displayStats.today_revenue?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'warning.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Tables Occupied
                    </Typography>
                    <TableRestaurant 
                      sx={{ 
                        fontSize: 24, 
                        color: 'warning.main'
                      }} 
                    />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h3" 
                      fontWeight="700" 
                      sx={{ 
                        fontSize: '1.75rem',
                        color: 'text.primary',
                        lineHeight: 1,
                        mb: 1
                      }}
                    >
                      {displayStats.occupied_tables || 0}/{displayStats.total_tables || 0}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={tableOccupancyPercentage} 
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: 'warning.main'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'info.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Menu Items Active
                    </Typography>
                    <Restaurant 
                      sx={{ 
                        fontSize: 24, 
                        color: 'info.main'
                      }} 
                    />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h3" 
                      fontWeight="700" 
                      sx={{ 
                        fontSize: '1.75rem',
                        color: 'text.primary',
                        lineHeight: 1,
                        mb: 1
                      }}
                    >
                      {displayStats.active_menu_items || 0}/{displayStats.total_menu_items || 0}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={menuActivePercentage} 
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: 'info.main'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: Weekly Revenue Chart & Recent Orders Status */}
          <Grid container spacing={3}>
            {/* Weekly Revenue Trend */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                height: '400px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }} data-tour="revenue-chart">
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <BarChartIcon 
                        sx={{ 
                          fontSize: '1.5rem',
                          color: 'primary.main'
                        }} 
                      />
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        Weekly Revenue & Orders
                      </Typography>
                    </Box>
                    {chartLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!chartLoading && getWeeklyRevenueData().length > 0 ? (
                      <WeeklyRevenueChart data={getWeeklyRevenueData()} height={280} />
                    ) : !chartLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        py: 4
                      }}>
                        <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary" textAlign="center" fontWeight={500}>
                          No Revenue Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Revenue trends will appear here once orders are placed.
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Orders Status */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '400px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }} data-tour="order-status-chart">
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PieChartIcon 
                        sx={{ 
                          fontSize: '1.5rem',
                          color: 'primary.main'
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        Order Status
                      </Typography>
                    </Box>
                    {chartLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!chartLoading && getOrderStatusData().length > 0 ? (
                      <DonutChart data={getOrderStatusData()} height={280} />
                    ) : !chartLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        py: 4
                      }}>
                        <PieChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary" textAlign="center" fontWeight={500}>
                          No Order Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Order status breakdown will appear here once orders are placed.
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Table Status & Top Menu Items */}
          <Grid container spacing={3}>
            {/* Table Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '360px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }} data-tour="table-status-chart">
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TableRestaurant 
                        sx={{ 
                          fontSize: '1.5rem',
                          color: 'primary.main'
                        }} 
                      />
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        Table Status
                      </Typography>
                    </Box>
                    {chartLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!chartLoading && getTableStatusData().some(item => item.value > 0) ? (
                      <StatusPieChart data={getTableStatusData()} height={240} />
                    ) : !chartLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        py: 4
                      }}>
                        <TableRestaurant sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary" textAlign="center" fontWeight={500}>
                          No Table Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Table occupancy status will appear here once tables are configured.
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Menu Items */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '360px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Restaurant 
                        sx={{ 
                          fontSize: '1.5rem',
                          color: 'primary.main'
                        }} 
                      />
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        Top Menu Items
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflow: 'auto' }}>
                    {topMenuItems.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2,
                        py: 4
                      }}>
                        <Restaurant sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary" textAlign="center" fontWeight={500}>
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
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: index === 0 ? 'primary.50' : 'background.paper',
                            borderLeftWidth: 4,
                            borderLeftColor: index === 0 ? 'primary.main' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'primary.50'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'text.secondary',
                                  minWidth: '20px'
                                }}
                              >
                                #{index + 1}
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  fontSize: '0.875rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {item.category_name} • ₹{item.price}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', ml: 2 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                color: 'primary.main',
                                fontSize: '1rem',
                                lineHeight: 1
                              }}
                            >
                              {item.orders_count}
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
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }} data-tour="recent-orders">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ShoppingCart 
                    sx={{ 
                      fontSize: '1.5rem',
                      color: 'primary.main'
                    }} 
                  />
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Recent Orders
                  </Typography>
                </Box>
                {canManageOrders() && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/orders')}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500
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
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 650 }
                  }
                }}
              >
                <Table size={isSmallScreen ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        py: 2
                      }}>
                        Order #
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          display: { xs: 'none', sm: 'table-cell' },
                          py: 2
                        }}
                      >
                        Table
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          py: 2
                        }}
                      >
                        Amount
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          py: 2
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          display: { xs: 'none', md: 'table-cell' },
                          py: 2
                        }}
                      >
                        Time
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          py: 2
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
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }} data-tour="quick-actions">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Settings 
                  sx={{ 
                    fontSize: '1.5rem',
                    color: 'primary.main'
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Quick Actions
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {canManageOrders() && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      startIcon={<ShoppingCart />}
                      onClick={() => navigate('/admin/orders')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
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
                      size="medium"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/admin/menu')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
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
                      size="medium"
                      startIcon={<TableRestaurant />}
                      onClick={() => navigate('/admin/tables')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
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
                      size="medium"
                      startIcon={<People />}
                      onClick={() => navigate('/admin/users')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
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
      
      {/* Dashboard Tour */}
      <DashboardTour />
      
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