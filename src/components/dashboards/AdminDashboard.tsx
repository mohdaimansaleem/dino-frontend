import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { WeeklyRevenueChart, StatusPieChart, DonutChart } from '../charts/ChartComponents';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const loadDashboardData = async () => {
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
      setError(err.message || 'Failed to load dashboard data');
      // Don't set dummy data on error, keep it empty
      setStats(null);
      setRecentOrders([]);
    } finally {
      setLoading(false);
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

  // Chart data with light colorful scheme
  const tableStatusData = [
    { name: 'Occupied', value: displayStats.occupied_tables || 0, color: '#FFAB91' }, // Light Orange
    { name: 'Available', value: (displayStats.total_tables || 0) - (displayStats.occupied_tables || 0), color: '#A5D6A7' }, // Light Green
  ];

  const menuStatusData = [
    { name: 'Active', value: displayStats.active_menu_items || 0, color: '#A5D6A7' }, // Light Green
    { name: 'Inactive', value: (displayStats.total_menu_items || 0) - (displayStats.active_menu_items || 0), color: '#FFCC02' }, // Light Amber
  ];

  // Sample weekly data for demonstration (in real app, this would come from API)
  const weeklyRevenueData = [
    { day: 'Mon', revenue: Math.round((displayStats.today_revenue * 0.8) || 500), orders: Math.round((displayStats.today_orders * 0.7) || 8) },
    { day: 'Tue', revenue: Math.round((displayStats.today_revenue * 0.9) || 600), orders: Math.round((displayStats.today_orders * 0.8) || 10) },
    { day: 'Wed', revenue: Math.round((displayStats.today_revenue * 1.1) || 800), orders: Math.round((displayStats.today_orders * 1.2) || 15) },
    { day: 'Thu', revenue: Math.round((displayStats.today_revenue * 0.95) || 700), orders: Math.round((displayStats.today_orders * 0.9) || 11) },
    { day: 'Fri', revenue: Math.round((displayStats.today_revenue * 1.3) || 1000), orders: Math.round((displayStats.today_orders * 1.4) || 18) },
    { day: 'Sat', revenue: Math.round((displayStats.today_revenue * 1.5) || 1200), orders: Math.round((displayStats.today_orders * 1.6) || 20) },
    { day: 'Today', revenue: displayStats.today_revenue || 850, orders: displayStats.today_orders || 12 },
  ];

  const orderStatusData = recentOrders.length > 0 ? [
    { name: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length, color: '#FFF176' }, // Light Yellow
    { name: 'Preparing', value: recentOrders.filter(o => o.status === 'preparing').length, color: '#81D4FA' }, // Light Blue
    { name: 'Ready', value: recentOrders.filter(o => o.status === 'ready').length, color: '#C8E6C9' }, // Light Green
    { name: 'Served', value: recentOrders.filter(o => o.status === 'served').length, color: '#E1BEE7' }, // Light Purple
  ].filter(item => item.value > 0) : [
    { name: 'No Orders', value: 1, color: '#F5F5F5' } // Very light gray for empty state
  ];

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
          <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
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
      {/* Header */}
      <Box sx={{ mb: { xs: 2, lg: 1.5 }, flexShrink: 0, mt: 0 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, mt: 0 }}>
          <DashboardIcon color="primary" />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Welcome back, {user?.firstName}! Here's your venue overview for today.
        </Typography>
      </Box>

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
                <WeeklyRevenueChart data={weeklyRevenueData} height={280} />
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
                <DonutChart data={orderStatusData} height={280} />
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
                <StatusPieChart data={tableStatusData} height={220} />
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
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/admin/orders'}
                size="small"
              >
                View All Orders
              </Button>
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
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `/admin/orders/${order.id}`}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `/admin/orders/${order.id}/edit`}
                          >
                            <Edit />
                          </IconButton>
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
            </Grid>
          </CardContent>
        </Card>


      </Box>
    </Box>
  );
};

export default AdminDashboard;