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
  Stack,
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
  PieChart as PieChartIcon,
  Business,
  Settings,
  Refresh,
} from '@mui/icons-material';
import { StatusPieChart, DonutChart } from '../charts/ChartComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '../../types/auth';
import { dashboardService } from '../../services/dashboardService';
import { AdminDashboardResponse, SuperAdminDashboardResponse } from '../../types/dashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import { getUserFirstName } from '../../utils/userUtils';
import DashboardTour from '../tour/DashboardTour';
import VenueStatusDebug from '../VenueStatusDebug';
import AnimatedBackground from '../ui/AnimatedBackground';

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
 * - Uses real database data only
 * - Dynamic role and permission checking
 * - Clean, maintainable code structure
 * - No mock or sample data
 */

interface AdminDashboardProps {
  className?: string;
}

interface ChartData {
  tableStatus: Array<{ name: string; value: number; color: string }>;
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
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | SuperAdminDashboardResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading comprehensive dashboard data...');
      
      // Load comprehensive dashboard data from single API endpoint
      const data = await dashboardService.getAdminDashboard();
      
      if (data) {
        // Check if this is SuperAdmin format or Admin format
        if ('system_stats' in data) {
          // SuperAdmin format
          const superAdminData = data as SuperAdminDashboardResponse;
          console.log('✅ Dashboard data loaded successfully (SuperAdmin format):', {
            todayOrders: superAdminData.system_stats?.total_orders_today,
            todayRevenue: superAdminData.system_stats?.total_revenue_today,
            recentActivityCount: superAdminData.recent_activity?.length
          });
          
          setDashboardData(superAdminData);
          
          // Process chart data from SuperAdmin response
          const processedChartData: ChartData = {
            tableStatus: Object.entries(superAdminData.analytics?.table_status_breakdown || {}).map(([status, count]) => ({
              name: status.charAt(0).toUpperCase() + status.slice(1),
              value: count as number,
              color: getTableStatusColor(status)
            })),
            orderStatus: Object.entries(superAdminData.analytics?.order_status_breakdown || {}).map(([status, count]) => ({
              name: status.charAt(0).toUpperCase() + status.slice(1),
              value: count as number,
              color: getOrderStatusColor(status)
            }))
          };
          
          setChartData(processedChartData);
        } else {
          // Standard Admin format
          const adminData = data as AdminDashboardResponse;
          console.log('✅ Dashboard data loaded successfully (Admin format):', {
            venue: adminData.venue_name,
            todayOrders: adminData.stats.today.orders_count,
            todayRevenue: adminData.stats.today.revenue,
            recentOrdersCount: adminData.recent_orders.length
          });
          
          setDashboardData(adminData);
          
          // Process chart data from Admin response
          const processedChartData: ChartData = {
            tableStatus: adminData.table_status_breakdown.map(item => ({
              name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
              value: item.count,
              color: item.color
            })),
            orderStatus: adminData.order_status_breakdown.map(item => ({
              name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
              value: item.count,
              color: item.color
            }))
          };
          
          setChartData(processedChartData);
        }
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





  const refreshDashboard = async () => {
    await Promise.all([
      loadDashboardData(),
      loadChartData()
    ]);
  };

  useEffect(() => {
    if (currentVenue?.id) {
      loadDashboardData();
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
  }, [currentVenue?.id, user, loadDashboardData, loadChartData]);

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

  const getTableStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#4CAF50';
      case 'occupied': return '#F44336';
      case 'reserved': return '#FF9800';
      case 'maintenance': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFF176';
      case 'confirmed': return '#FFCC02';
      case 'preparing': return '#81D4FA';
      case 'ready': return '#C8E6C9';
      case 'served': return '#E1BEE7';
      case 'delivered': return '#A5D6A7';
      case 'cancelled': return '#FFAB91';
      default: return '#F5F5F5';
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

  // Extract stats from dashboard data (handle both Admin and SuperAdmin formats)
  const displayStats = (() => {
    if (!dashboardData) {
      return {
        today_orders: 0,
        today_revenue: 0,
        total_tables: 0,
        occupied_tables: 0,
        total_menu_items: 0,
        active_menu_items: 0,
        total_staff: 0,
      };
    }

    if ('system_stats' in dashboardData) {
      // SuperAdmin format
      const superAdminData = dashboardData as SuperAdminDashboardResponse;
      return {
        today_orders: superAdminData.system_stats?.total_orders_today || 0,
        today_revenue: superAdminData.system_stats?.total_revenue_today || 0,
        total_tables: superAdminData.system_stats?.total_tables || 0,
        occupied_tables: superAdminData.system_stats?.occupied_tables || 0,
        total_menu_items: superAdminData.system_stats?.total_menu_items || 0,
        active_menu_items: superAdminData.system_stats?.active_menu_items || 0,
        total_staff: 0, // Not available in SuperAdmin format
      };
    } else {
      // Admin format
      const adminData = dashboardData as AdminDashboardResponse;
      const stats = adminData.stats;
      return {
        today_orders: stats?.today.orders_count || 0,
        today_revenue: stats?.today.revenue || 0,
        total_tables: stats?.current.tables_total || 0,
        occupied_tables: stats?.current.tables_occupied || 0,
        total_menu_items: stats?.current.menu_items_total || 0,
        active_menu_items: stats?.current.menu_items_active || 0,
        total_staff: stats?.current.staff_total || 0,
      };
    }
  })();

  // Extract recent orders (handle both formats)
  const recentOrders = (() => {
    if (!dashboardData) return [];
    
    if ('system_stats' in dashboardData) {
      // SuperAdmin format - use recent_activity and convert to order format
      const superAdminData = dashboardData as SuperAdminDashboardResponse;
      return (superAdminData.recent_activity || []).map(activity => ({
        id: activity.id,
        order_number: activity.order_number,
        table_number: activity.table_number || 'N/A',
        customer_name: undefined,
        total_amount: activity.total_amount,
        status: activity.status as any,
        items_count: 0, // Not available in activity format
        created_at: activity.created_at,
        estimated_ready_time: undefined
      }));
    } else {
      // Admin format
      const adminData = dashboardData as AdminDashboardResponse;
      return adminData.recent_orders || [];
    }
  })();

  const tableOccupancyPercentage = displayStats.total_tables > 0 ? 
    Math.round((displayStats.occupied_tables / displayStats.total_tables) * 100) : 0;

  const menuActivePercentage = displayStats.total_menu_items > 0 ? 
    Math.round((displayStats.active_menu_items / displayStats.total_menu_items) * 100) : 0;

  // Get table status data from API response only
  const getTableStatusData = () => {
    if (chartData?.tableStatus && chartData.tableStatus.length > 0) {
      return chartData.tableStatus;
    }
    return [];
  };

  const getOrderStatusData = () => {
    if (chartData?.orderStatus && chartData.orderStatus.length > 0) {
      return chartData.orderStatus;
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
          minHeight: 'auto',
          height: 'auto',
          backgroundColor: '#f8f9fa',
          padding: 0,
          margin: 0,
          width: '100%',
          overflow: 'visible',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            backgroundColor: 'grey.100',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            color: 'text.primary',
            padding: 0,
            margin: 0,
            width: '100%',
          }}
        >
          <AnimatedBackground />
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: 2, md: 3 },
                py: { xs: 3, sm: 4 },
                px: { xs: 3, sm: 4 },
              }}
            >
              {/* Header Content */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DashboardIcon sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="600"
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    Admin Dashboard
                  </Typography>
                </Box>
                
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 400,
                    mb: 1,
                    maxWidth: '500px',
                    color: 'text.secondary',
                  }}
                >
                  Welcome back, {getUserFirstName(user)}! Here's your comprehensive venue overview and analytics.
                </Typography>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Business sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                  <Typography variant="body2" fontWeight="500" color="text.primary">
                    Real-time Analytics & Management
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: { xs: 'row', sm: 'row' },
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  onClick={refreshDashboard}
                  disabled={loading || chartLoading}
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: 'text.secondary',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      color: 'primary.main',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      opacity: 0.5,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  title={loading || chartLoading ? 'Refreshing...' : 'Refresh dashboard'}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
        >

        






          {/* Dashboard Content Container */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            {/* Show message if user lacks venue management permissions */}
            {currentVenue && !canManageVenue() && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Permission Required:</strong> Venue status controls require venue management permissions.
                  <br/>Your current role: {user?.role || 'Unknown'}
                </Typography>
              </Alert>
            )}

            {/* Dashboard Statistics */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {[
                  { 
                    label: 'Today\'s Orders', 
                    value: displayStats.today_orders || 0, 
                    color: '#2196F3', 
                    icon: <Today />,
                    description: 'Total orders received today'
                  },
                  { 
                    label: 'Today\'s Revenue', 
                    value: `₹${(displayStats.today_revenue || 0).toLocaleString()}`, 
                    color: '#4CAF50', 
                    icon: <TrendingUp />,
                    description: 'Revenue generated today'
                  },
                  { 
                    label: 'Tables Occupied', 
                    value: `${displayStats.occupied_tables || 0}/${displayStats.total_tables || 0}`, 
                    color: '#FF9800', 
                    icon: <TableRestaurant />,
                    description: 'Current table occupancy',
                    progress: tableOccupancyPercentage
                  },
                  { 
                    label: 'Menu Items Active', 
                    value: `${displayStats.active_menu_items || 0}/${displayStats.total_menu_items || 0}`, 
                    color: '#9C27B0', 
                    icon: <Restaurant />,
                    description: 'Available menu items',
                    progress: menuActivePercentage
                  },
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: 2,
                        backgroundColor: `${stat.color}08`,
                        border: `1px solid ${stat.color}33`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${stat.color}33`,
                          backgroundColor: `${stat.color}12`,
                        },
                      }}
                      data-tour="stats-cards"
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {/* Icon on the left */}
                        <Box
                          sx={{
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            borderRadius: 2,
                            backgroundColor: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          {React.cloneElement(stat.icon, { 
                            fontSize: isSmallScreen ? 'medium' : 'large' 
                          })}
                        </Box>
                        
                        {/* Text content on the right */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant={isSmallScreen ? "h6" : "h4"} 
                            fontWeight="700" 
                            color="text.primary"
                            sx={{ 
                              fontSize: { xs: '1.25rem', sm: '2rem' },
                              lineHeight: 1.2,
                              mb: 0.5
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            fontWeight="600"
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {stat.label}
                          </Typography>
                          {stat.progress !== undefined && (
                            <LinearProgress 
                              variant="determinate" 
                              value={stat.progress} 
                              sx={{ 
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                mt: 1,
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  backgroundColor: stat.color
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

          {/* Charts Section */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
            {/* Order Status Chart */}
            <Grid item xs={12} md={6}>
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

            {/* Table Status Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '400px',
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
                      <StatusPieChart data={getTableStatusData()} height={280} />
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
            </Grid>
          </Box>

          {/* Recent Orders Section */}
          <Box sx={{ mb: 4 }}>
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
          </Box>

          {/* Quick Actions Section */}
          <Box sx={{ mb: 4 }}>
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
        </Box>
      </Box>
    );
  };

  return (
    <VenueAssignmentCheck showFullPage={true}>
      <VenueStatusDebug />
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