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
  Visibility,
  Schedule,
  Analytics,
  Add,
  Refresh,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Mock data - in real app, this would come from API
const mockAnalytics = {
  totalRevenue: 12450.50,
  totalOrders: 156,
  averageOrderValue: 79.81,
  activeOrders: 8,
  popularItems: [
    { name: 'Margherita Pizza', orders: 45, revenue: 675 },
    { name: 'Caesar Salad', orders: 32, revenue: 384 },
    { name: 'Pasta Carbonara', orders: 28, revenue: 420 },
    { name: 'Grilled Chicken', orders: 25, revenue: 500 },
  ],
  revenueByDay: [
    { date: '2024-01-15', revenue: 1200, orders: 15 },
    { date: '2024-01-16', revenue: 1450, orders: 18 },
    { date: '2024-01-17', revenue: 1100, orders: 14 },
    { date: '2024-01-18', revenue: 1650, orders: 21 },
    { date: '2024-01-19', revenue: 1800, orders: 23 },
    { date: '2024-01-20', revenue: 2100, orders: 26 },
    { date: '2024-01-21', revenue: 1950, orders: 24 },
  ],
  ordersByStatus: [
    { status: 'Pending', count: 3, color: '#ff9800' },
    { status: 'Preparing', count: 4, color: '#2196f3' },
    { status: 'Ready', count: 1, color: '#4caf50' },
    { status: 'Served', count: 148, color: '#9e9e9e' },
  ],
};

const mockRecentOrders = [
  { id: '1', tableNumber: 5, items: 3, total: 45.50, status: 'preparing', time: '2 min ago' },
  { id: '2', tableNumber: 2, items: 2, total: 32.00, status: 'ready', time: '5 min ago' },
  { id: '3', tableNumber: 8, items: 4, total: 67.25, status: 'pending', time: '8 min ago' },
  { id: '4', tableNumber: 1, items: 1, total: 15.00, status: 'served', time: '12 min ago' },
  { id: '5', tableNumber: 6, items: 5, total: 89.75, status: 'preparing', time: '15 min ago' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics] = useState(mockAnalytics);
  const [recentOrders] = useState(mockRecentOrders);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'served': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {analytics.activeOrders}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={3} />
                </LineChart>
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
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
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
                <Button variant="outlined" fullWidth>
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
                    startIcon={<Visibility />}
                  >
                    View Reports
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