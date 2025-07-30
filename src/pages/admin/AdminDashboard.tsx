import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  TableRestaurant,
  ShoppingCart,
  Schedule,
  Analytics,
  Add,
  Refresh,
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import CafeStatusManager from '../../components/CafeStatusManager';
import UserPermissions from '../../components/UserPermissions';
import { analyticsService, DashboardAnalytics, RecentOrder } from '../../services/analyticsService';

// Default analytics data structure for loading states
const defaultAnalytics: DashboardAnalytics = {
  venue_id: '',
  period: { start_date: '', end_date: '' },
  summary: {
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    active_orders: 0,
    customer_count: 0,
    table_turnover_rate: 0
  },
  revenue_trend: [],
  order_status_breakdown: [],
  popular_items: [],
  hourly_performance: [],
  cafe_performance_metrics: [],
  payment_method_breakdown: [],
  customer_satisfaction: {
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: []
  }
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCafe } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(defaultAnalytics);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentCafe?.id) {
        setError('No cafe selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load analytics data
        const analyticsData = await analyticsService.getDashboardAnalytics(
          currentCafe.id,
          analyticsService.getDefaultPeriod()
        );

        if (analyticsData) {
          setAnalytics(analyticsData);
        }

        // Load recent orders
        const recentOrdersData = await analyticsService.getRecentOrders(currentCafe.id, 5);
        setRecentOrders(recentOrdersData);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Auto-refresh data every 5 minutes
    const refreshTimer = setInterval(loadDashboardData, 5 * 60 * 1000);

    // Auto-refresh charts every 10 seconds for dynamic effect
    const chartRefreshTimer = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 10000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(chartRefreshTimer);
    };
  }, [currentCafe?.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': 
      case 'placed': return 'error';
      case 'preparing': 
      case 'confirmed': return 'info';
      case 'ready': return 'success';
      case 'served': 
      case 'delivered': return 'default';
      default: return 'default';
    }
  };

  const handleRefreshData = async () => {
    if (!currentCafe?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [analyticsData, recentOrdersData] = await Promise.all([
        analyticsService.getDashboardAnalytics(currentCafe.id, analyticsService.getDefaultPeriod()),
        analyticsService.getRecentOrders(currentCafe.id, 5)
      ]);

      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      setRecentOrders(recentOrdersData);
      setAnimationKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={48} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleRefreshData} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName || user?.email}! Here's what's happening at {currentCafe?.name || 'your restaurant'}.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Today's Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(analytics.summary.total_revenue)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.summary.total_orders}
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Average Order
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(analytics.summary.average_order_value)}
                  </Typography>
                </Box>
                <Analytics sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.summary.active_orders}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenue_trend} key={`revenue-${animationKey}`}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1976d2" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    strokeWidth={3}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={`pie-${animationKey}`}>
                  <Pie
                    data={analytics.order_status_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {analytics.order_status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Hourly Orders Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Hourly Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.hourly_performance} key={`hourly-${animationKey}`}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `${value}`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="orders" 
                    fill="#1976d2" 
                    name="Orders"
                    animationDuration={1500}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="revenue" 
                    fill="#42a5f5" 
                    name="Revenue"
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cafe Performance Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cafe Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={analytics.cafe_performance_metrics} 
                  layout="horizontal"
                  key={`performance-${animationKey}`}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="metric" type="category" width={80} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'value' ? (value <= 5 ? '/5' : '%') : ''}`,
                      'Score'
                    ]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#1976d2"
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <IconButton size="small" onClick={handleRefreshData}>
                  <Refresh />
                </IconButton>
              </Box>
              <List>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              Table {order.table_number}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status) as any}
                            />
                          </Box>
                        }
                        secondary={`${order.items_count} items • ${order.time_ago}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/admin/orders')}
                >
                  View All Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Items
              </Typography>
              <List>
                {analytics.popular_items.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.orders} orders`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatCurrency(item.revenue)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < analytics.popular_items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cafe Status Management */}
        <Grid item xs={12} md={8}>
          <CafeStatusManager />
        </Grid>

        {/* User Permissions */}
        <Grid item xs={12} md={4}>
          <UserPermissions />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    onClick={() => navigate('/admin/orders')}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.light',
                      },
                    }}
                  >
                    Manage Orders
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => navigate('/admin/menu')}
                  >
                    Add Menu Item
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TableRestaurant />}
                    onClick={() => navigate('/admin/tables')}
                  >
                    Manage Tables
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Restaurant />}
                    onClick={() => navigate('/admin/settings')}
                  >
                    Cafe Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;