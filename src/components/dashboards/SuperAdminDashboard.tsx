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
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Store,
  People,
  TrendingUp,
  Visibility,
  Edit,
  Add,
  Dashboard,
  Analytics,
  Assessment,
  Timeline,
  MonetizationOn,
  ShoppingCart,
  Restaurant,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  TrendingDown,
  ShowChart,
  PieChart,
  BarChart,
  TableRestaurant,
  MenuBook,
  Payment,
  Today,
  AccessTime,
  Cancel,
  Pending,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { dashboardService } from '../../services/dashboardService';
import { getUserFirstName } from '../../utils/userUtils';
import { WeeklyRevenueChart, StatusPieChart, DonutChart, SimpleBarChart } from '../charts/ChartComponents';

interface SuperAdminDashboardProps {
  className?: string;
}

interface VenueDashboardStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  total_tables: number;
  total_menu_items: number;
  todays_revenue: number;
  todays_orders: number;
  avg_order_value: number;
  table_occupancy_rate: number;
  popular_items_count: number;
}

interface MenuItemPerformance {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category: string;
  rating: number;
}

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  occupancy_time?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VenueDashboardStats | null>(null);
  const [menuPerformance, setMenuPerformance] = useState<MenuItemPerformance[]>([]);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [currentTab, setCurrentTab] = useState(0);

  // Get current venue info
  const currentVenue = userData?.venue;
  const venueName = currentVenue?.name || 'Current Venue';

  // Mock data for charts and analytics specific to the venue
  const [revenueData] = useState([
    { day: 'Mon', revenue: 8500, orders: 28 },
    { day: 'Tue', revenue: 12200, orders: 35 },
    { day: 'Wed', revenue: 15900, orders: 42 },
    { day: 'Thu', revenue: 18100, orders: 48 },
    { day: 'Fri', revenue: 22500, orders: 58 },
    { day: 'Sat', revenue: 28200, orders: 72 },
    { day: 'Sun', revenue: 25800, orders: 65 },
  ]);

  const [orderStatusData] = useState([
    { name: 'Completed', value: 156, color: '#4CAF50' },
    { name: 'In Progress', value: 12, color: '#FF9800' },
    { name: 'Pending', value: 8, color: '#2196F3' },
    { name: 'Cancelled', value: 3, color: '#F44336' },
  ]);

  const [menuCategoryData] = useState([
    { name: 'Main Course', value: 45, color: '#4CAF50' },
    { name: 'Appetizers', value: 28, color: '#FF9800' },
    { name: 'Desserts', value: 22, color: '#2196F3' },
    { name: 'Beverages', value: 35, color: '#9C27B0' },
    { name: 'Specials', value: 18, color: '#F44336' },
  ]);

  const [topMenuItemsData] = useState([
    { name: 'Dino Burger', value: 89, color: '#4CAF50' },
    { name: 'Pasta Primavera', value: 67, color: '#FF9800' },
    { name: 'Caesar Salad', value: 54, color: '#2196F3' },
    { name: 'Grilled Chicken', value: 48, color: '#9C27B0' },
    { name: 'Chocolate Cake', value: 42, color: '#F44336' },
  ]);

  const [paymentMethodData] = useState([
    { name: 'Card', value: 125, color: '#4CAF50' },
    { name: 'Cash', value: 45, color: '#FF9800' },
    { name: 'Digital Wallet', value: 38, color: '#2196F3' },
    { name: 'UPI', value: 67, color: '#9C27B0' },
  ]);

  useEffect(() => {
    loadVenueDashboardData();
  }, [currentVenue?.id]);

  const loadVenueDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentVenue?.id) {
        setError('No venue selected. Please ensure you have access to a venue.');
        return;
      }
      
      // Load venue-specific dashboard stats
      const dashboardData = await dashboardService.getVenueDashboard(currentVenue.id);
      
      // Set mock data for demonstration - replace with actual API data
      setStats({
        total_orders: 1247,
        total_revenue: 185600,
        active_orders: 12,
        total_tables: 24,
        total_menu_items: 148,
        todays_revenue: 28500,
        todays_orders: 72,
        avg_order_value: 485,
        table_occupancy_rate: 67,
        popular_items_count: 15,
      });

      // Mock menu performance data
      setMenuPerformance([
        { id: '1', name: 'Dino Burger', orders: 89, revenue: 12650, category: 'Main Course', rating: 4.8 },
        { id: '2', name: 'Pasta Primavera', orders: 67, revenue: 9380, category: 'Main Course', rating: 4.6 },
        { id: '3', name: 'Caesar Salad', orders: 54, revenue: 5940, category: 'Appetizers', rating: 4.5 },
        { id: '4', name: 'Grilled Chicken', orders: 48, revenue: 8640, category: 'Main Course', rating: 4.7 },
        { id: '5', name: 'Chocolate Cake', orders: 42, revenue: 3360, category: 'Desserts', rating: 4.9 },
      ]);

      // Mock table status data
      setTableStatuses([
        { id: '1', table_number: 'T01', status: 'occupied', current_order_id: 'ORD001', occupancy_time: 45 },
        { id: '2', table_number: 'T02', status: 'available' },
        { id: '3', table_number: 'T03', status: 'occupied', current_order_id: 'ORD002', occupancy_time: 23 },
        { id: '4', table_number: 'T04', status: 'reserved' },
        { id: '5', table_number: 'T05', status: 'cleaning' },
        { id: '6', table_number: 'T06', status: 'available' },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load venue dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#F44336';
      case 'available': return '#4CAF50';
      case 'reserved': return '#FF9800';
      case 'cleaning': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <People sx={{ fontSize: 16 }} />;
      case 'available': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'reserved': return <Schedule sx={{ fontSize: 16 }} />;
      case 'cleaning': return <Warning sx={{ fontSize: 16 }} />;
      default: return <Error sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Venue Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadVenueDashboardData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          <Store color="primary" sx={{ fontSize: 32 }} />
          {venueName} Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {getUserFirstName(user)}! Here's your venue performance overview and analytics.
        </Typography>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            border: '1px solid',
            borderColor: 'divider',
            height: 140
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Today />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="600" color="text.primary">
                    ₹{(stats?.todays_revenue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Today's Revenue
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight="600">
                    {stats?.todays_orders || 0} orders today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            border: '1px solid',
            borderColor: 'divider',
            height: 140
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <ShoppingCart />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="600" color="text.primary">
                    {stats?.active_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Active Orders
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" color="warning.main" fontWeight="600">
                      In progress
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            border: '1px solid',
            borderColor: 'divider',
            height: 140
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                  <TableRestaurant />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="600" color="text.primary">
                    {stats?.table_occupancy_rate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Table Occupancy
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.total_tables || 0} total tables
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            border: '1px solid',
            borderColor: 'divider',
            height: 140
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                  <MonetizationOn />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="600" color="text.primary">
                    ₹{stats?.avg_order_value || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Avg Order Value
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.total_orders || 0} total orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<Analytics />} label="Sales Analytics" />
          <Tab icon={<MenuBook />} label="Menu Performance" />
          <Tab icon={<TableRestaurant />} label="Tables & Orders" />
          <Tab icon={<Payment />} label="Payments" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Weekly Revenue & Orders
                </Typography>
                <WeeklyRevenueChart data={revenueData} height={350} />
              </CardContent>
            </Card>
          </Grid>

          {/* Order Status */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Status Today
                </Typography>
                <DonutChart data={orderStatusData} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Venue Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Total Menu Items</Typography>
                    <Typography variant="h6" color="primary.main">{stats?.total_menu_items || 0}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Popular Items</Typography>
                    <Typography variant="h6" color="success.main">{stats?.popular_items_count || 0}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Total Revenue</Typography>
                    <Typography variant="h6" color="info.main">₹{(stats?.total_revenue || 0).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Order #1247 completed"
                      secondary="Table T03 • 5 minutes ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ShoppingCart sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="New order received"
                      secondary="Table T07 • 12 minutes ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Payment sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment processed ₹1,250"
                      secondary="Order #1246 • 18 minutes ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sales Analytics Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {/* Menu Categories */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Sales by Category
                </Typography>
                <StatusPieChart data={menuCategoryData} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* Top Menu Items */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Top Selling Items
                </Typography>
                <SimpleBarChart data={topMenuItemsData} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Metrics */}
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Sales Performance Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="600">+15.2%</Typography>
                      <Typography variant="body2" color="text.secondary">Revenue Growth</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <ShowChart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="600">23 min</Typography>
                      <Typography variant="body2" color="text.secondary">Avg Order Time</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <PieChart sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="600">94.5%</Typography>
                      <Typography variant="body2" color="text.secondary">Customer Satisfaction</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <BarChart sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="600">2.1%</Typography>
                      <Typography variant="body2" color="text.secondary">Order Cancellation</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Menu Performance Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Menu Item Performance
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => window.location.href = '/admin/menu'}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[2]
                      }
                    }}
                  >
                    Manage Menu
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="center">Rating</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {menuPerformance.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Restaurant sx={{ color: 'text.secondary' }} />
                              <Typography variant="subtitle2" fontWeight="600">
                                {item.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={item.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">
                              {item.orders}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">
                              ₹{item.revenue.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${item.rating} ⭐`}
                              size="small"
                              color={item.rating >= 4.5 ? 'success' : item.rating >= 4.0 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tables & Orders Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Table Status & Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => window.location.href = '/admin/tables'}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[2]
                      }
                    }}
                  >
                    Manage Tables
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {tableStatuses.map((table) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                      <Card sx={{ 
                        border: '2px solid',
                        borderColor: getTableStatusColor(table.status),
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: theme.shadows[4]
                        }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="600">
                              {table.table_number}
                            </Typography>
                            <Chip
                              icon={getTableStatusIcon(table.status)}
                              label={table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                              size="small"
                              sx={{
                                backgroundColor: getTableStatusColor(table.status),
                                color: 'white',
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                  color: 'white'
                                }
                              }}
                            />
                          </Box>
                          {table.current_order_id && (
                            <Typography variant="body2" color="text.secondary">
                              Order: {table.current_order_id}
                            </Typography>
                          )}
                          {table.occupancy_time && (
                            <Typography variant="body2" color="text.secondary">
                              Occupied: {table.occupancy_time} min
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Payments Tab */}
      <TabPanel value={currentTab} index={4}>
        <Grid container spacing={3}>
          {/* Payment Methods */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Payment Methods Distribution
                </Typography>
                <StatusPieChart data={paymentMethodData} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Payment Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.50', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="600" color="success.main">
                      ₹{(stats?.todays_revenue || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Total Payments
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Successful Payments</Typography>
                    <Typography variant="h6" color="success.main">98.5%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Failed Payments</Typography>
                    <Typography variant="h6" color="error.main">1.5%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Average Transaction</Typography>
                    <Typography variant="h6" color="primary.main">₹{stats?.avg_order_value || 0}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default SuperAdminDashboard;