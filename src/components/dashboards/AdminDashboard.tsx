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
} from '@mui/icons-material';
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
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats
      const dashboardData = await dashboardService.getAdminDashboard();
      setStats(dashboardData.summary);
      setRecentOrders(dashboardData.recent_orders || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  const tableOccupancyPercentage = stats ? 
    Math.round((stats.occupied_tables / stats.total_tables) * 100) : 0;

  const menuActivePercentage = stats ? 
    Math.round((stats.active_menu_items / stats.total_menu_items) * 100) : 0;

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
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Here's your venue overview for today.
        </Typography>
      </Box>

      {/* Today's Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Today color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.today_orders || 0}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{stats?.today_revenue?.toLocaleString() || 0}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TableRestaurant color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.occupied_tables || 0}/{stats?.total_tables || 0}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Restaurant color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.active_menu_items || 0}/{stats?.total_menu_items || 0}
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

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingCart />}
                    onClick={() => window.location.href = '/admin/orders'}
                  >
                    View Orders
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Restaurant />}
                    onClick={() => window.location.href = '/admin/menu'}
                  >
                    Manage Menu
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TableRestaurant />}
                    onClick={() => window.location.href = '/admin/tables'}
                  >
                    Manage Tables
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => window.location.href = '/admin/users'}
                  >
                    Manage Staff
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Venue Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Table Occupancy</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {tableOccupancyPercentage}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={tableOccupancyPercentage} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Menu Availability</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {menuActivePercentage}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={menuActivePercentage} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Staff Count</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats?.total_staff || 0} Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Recent Orders
            </Typography>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/admin/orders'}
            >
              View All Orders
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
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
                  recentOrders.map((order) => (
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
    </Box>
  );
};

export default AdminDashboard;