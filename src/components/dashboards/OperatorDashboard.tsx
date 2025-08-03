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

  Alert,
  CircularProgress,
  Badge,
  Fab,
} from '@mui/material';
import {
  ShoppingCart,
  Kitchen,
  CheckCircle,
  Pending,
  TableRestaurant,
  Refresh,
  Dashboard as DashboardIcon,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';

interface OperatorDashboardProps {
  className?: string;
}

interface DashboardStats {
  active_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  occupied_tables: number;
  total_tables: number;
}

interface ActiveOrder {
  id: string;
  order_number: string;
  table_number: number;
  total_amount: number;
  status: string;
  created_at: string;
  estimated_ready_time?: string;
  items_count: number;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats
      const dashboardData = await dashboardService.getOperatorDashboard();
      setStats(dashboardData.summary);
      setActiveOrders(dashboardData.active_orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Update order status
      // await orderService.updateOrderStatus(orderId, newStatus);
      
      // Refresh data
      await loadDashboardData();
    } catch (err: any) {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Pending />;
      case 'confirmed': return <ShoppingCart />;
      case 'preparing': return <Kitchen />;
      case 'ready': return <CheckCircle />;
      default: return <ShoppingCart />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'pending': return 'Confirm';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Served';
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Operator Dashboard...
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
    <Box className={className} sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          Operator Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Manage orders and table status here.
        </Typography>
      </Box>

      {/* Order Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={stats?.pending_orders || 0} color="warning">
                  <Pending color="warning" sx={{ fontSize: 40 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.dark">
                    {stats?.pending_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={stats?.preparing_orders || 0} color="primary">
                  <Kitchen color="primary" sx={{ fontSize: 40 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.dark">
                    {stats?.preparing_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preparing
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={stats?.ready_orders || 0} color="success">
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.dark">
                    {stats?.ready_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ready to Serve
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
                <TableRestaurant color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.occupied_tables || 0}/{stats?.total_tables || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tables Occupied
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Orders */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Active Orders ({activeOrders.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell align="center">Table</TableCell>
                  <TableCell align="center">Items</TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No active orders at the moment
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {order.order_number}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`Table ${order.table_number}`}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {order.items_count} items
                      </TableCell>
                      <TableCell align="center">
                        ₹{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </Typography>
                        {order.estimated_ready_time && (
                          <Typography variant="caption" color="text.secondary">
                            Est: {new Date(order.estimated_ready_time).toLocaleTimeString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {getNextStatus(order.status) && (
                          <Button
                            size="small"
                            variant="contained"
                            color={getStatusColor(getNextStatus(order.status)!) as any}
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                          >
                            {getNextStatusLabel(order.status)}
                          </Button>
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

      {/* Floating Action Button for Notifications */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          // Show notifications or alerts
        }}
      >
        <Badge badgeContent={stats?.pending_orders || 0} color="error">
          <Notifications />
        </Badge>
      </Fab>
    </Box>
  );
};

export default OperatorDashboard;