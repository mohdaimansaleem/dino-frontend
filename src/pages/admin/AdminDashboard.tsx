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

// Demo data for Dino Cafe - Hyderabad
const mockAnalytics = {
  totalRevenue: 45680,
  totalOrders: 156,
  averageOrderValue: 293,
  activeOrders: 8,
  popularItems: [
    { name: 'Butter Chicken', orders: 45, revenue: 14400 },
    { name: 'Paneer Tikka', orders: 32, revenue: 8960 },
    { name: 'Chicken Biryani', orders: 28, revenue: 9800 },
    { name: 'Dal Makhani', orders: 25, revenue: 5500 },
  ],
  revenueByDay: [
    { date: '2024-01-15', revenue: 4200, orders: 15 },
    { date: '2024-01-16', revenue: 5450, orders: 18 },
    { date: '2024-01-17', revenue: 3800, orders: 14 },
    { date: '2024-01-18', revenue: 6250, orders: 21 },
    { date: '2024-01-19', revenue: 7100, orders: 23 },
    { date: '2024-01-20', revenue: 8900, orders: 26 },
    { date: '2024-01-21', revenue: 6980, orders: 24 },
  ],
  ordersByStatus: [
    { status: 'Pending', count: 3, color: '#1976d2' },
    { status: 'Preparing', count: 4, color: '#42a5f5' },
    { status: 'Ready', count: 1, color: '#64b5f6' },
    { status: 'Served', count: 148, color: '#90caf9' },
  ],
  cafePerformance: [
    { metric: 'Customer Satisfaction', value: 4.5, max: 5 },
    { metric: 'Order Accuracy', value: 96, max: 100 },
    { metric: 'Service Speed', value: 88, max: 100 },
    { metric: 'Food Quality', value: 92, max: 100 },
  ],
  hourlyOrders: [
    { hour: '9 AM', orders: 5, revenue: 1200 },
    { hour: '10 AM', orders: 8, revenue: 2100 },
    { hour: '11 AM', orders: 12, revenue: 3200 },
    { hour: '12 PM', orders: 18, revenue: 4800 },
    { hour: '1 PM', orders: 25, revenue: 6500 },
    { hour: '2 PM', orders: 22, revenue: 5800 },
    { hour: '3 PM', orders: 15, revenue: 3900 },
    { hour: '4 PM', orders: 10, revenue: 2600 },
    { hour: '5 PM', orders: 14, revenue: 3700 },
    { hour: '6 PM', orders: 20, revenue: 5200 },
    { hour: '7 PM', orders: 28, revenue: 7300 },
    { hour: '8 PM', orders: 24, revenue: 6200 },
  ],
};

const mockRecentOrders = [
  { id: 'ORD-001', tableNumber: 'dt-001', items: 3, total: 800, status: 'preparing', time: '2 min ago' },
  { id: 'ORD-002', tableNumber: 'T-005', items: 2, total: 620, status: 'ready', time: '5 min ago' },
  { id: 'ORD-003', tableNumber: 'T-008', items: 4, total: 490, status: 'pending', time: '8 min ago' },
  { id: 'ORD-004', tableNumber: 'T-012', items: 1, total: 350, status: 'served', time: '12 min ago' },
  { id: 'ORD-005', tableNumber: 'T-003', items: 5, total: 1250, status: 'preparing', time: '15 min ago' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics] = useState(mockAnalytics);
  const [recentOrders] = useState(mockRecentOrders);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Auto-refresh charts every 10 seconds for dynamic effect
    const chartRefreshTimer = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(chartRefreshTimer);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'error';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'served': return 'default';
      default: return 'default';
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName || user?.email}! Here's what's happening at your restaurant.
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
                    {formatCurrency(analytics.totalRevenue)}
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
                    {analytics.totalOrders}
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
                    {formatCurrency(analytics.averageOrderValue)}
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
                    {analytics.activeOrders}
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
                <AreaChart data={analytics.revenueByDay} key={`revenue-${animationKey}`}>
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
                    data={analytics.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {analytics.ordersByStatus.map((entry, index) => (
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
                <BarChart data={analytics.hourlyOrders} key={`hourly-${animationKey}`}>
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
                  data={analytics.cafePerformance} 
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
                <IconButton size="small">
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
                              Table {order.tableNumber}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status) as any}
                            />
                          </Box>
                        }
                        secondary={`${order.items} items • ${order.time}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatCurrency(order.total)}
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
                {analytics.popularItems.map((item, index) => (
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
                    {index < analytics.popularItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
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