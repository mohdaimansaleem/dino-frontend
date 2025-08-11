import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Badge,
  Skeleton,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  CheckCircle,
  LocalShipping,
  Assignment,
  Refresh,
  Edit,
  Visibility,
  Print,
  Search,
  Timer,
  TableRestaurant,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { orderService, Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../services/orderService';
import {
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAGE_TITLES,
  PLACEHOLDERS,
} from '../../constants';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const OrdersManagement: React.FC = () => {
  const { hasPermission, isOperator, isAdmin } = useAuth();
  const { 
    userData, 
    loading: userDataLoading, 
    getVenue, 
    getVenueDisplayName,
    refreshUserData 
  } = useUserData();
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      const venue = getVenue();
      
      if (!venue?.id) {
        // Try to refresh user data to get venue
        try {
          await refreshUserData();
          setError('No venue assigned to your account. Please contact support.');
        } catch (refreshError) {
          setError('Unable to load venue data. Please contact support.');
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ordersData = await orderService.getVenueOrders(venue.id);
        setOrders(ordersData);
      } catch (error) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Auto-refresh orders every 30 seconds
    const refreshTimer = setInterval(loadOrders, 30000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [userData?.venue?.id]);

  // Retry loading orders when venue becomes available
  useEffect(() => {
    const venue = getVenue();
    if (venue?.id && orders.length === 0 && !loading) {
      const loadOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const ordersData = await orderService.getVenueOrders(venue.id);
          setOrders(ordersData);
        } catch (error) {
          setError('Failed to load orders. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      loadOrders();
    }
  }, [userData?.venue?.id]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table_id && order.table_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.items.some(item => 
          item.menu_item_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getActiveOrders = () => {
    return filteredOrders.filter(order => 
      order.status === 'pending' || 
      order.status === 'confirmed' || 
      order.status === 'preparing' || 
      order.status === 'ready'
    );
  };

  const getServedOrders = () => {
    return filteredOrders.filter(order => order.status === 'served' || order.status === 'delivered');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#f97316',
      'ready': '#10b981',
      'out_for_delivery': '#8b5cf6',
      'delivered': '#059669',
      'served': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Assignment />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <Restaurant />;
      case 'ready': return <CheckCircle />;
      case 'served': return <LocalShipping />;
      case 'delivered': return <LocalShipping />;
      case 'cancelled': return <Visibility />;
      default: return <Schedule />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTableNumber = (order: Order) => {
    if (order.table_id) {
      return order.table_id.replace(/^table-/, 'T-').replace(/^dt-/, 'DT-');
    }
    return order.order_number || order.id;
  };

  const getTimeSinceOrder = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSnackbar({ 
        open: true, 
        message: `Order ${orderId} status updated to ${orderService.formatOrderStatus(newStatus)}`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update order status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleRefreshOrders = async () => {
    const venue = getVenue();
    if (!venue?.id) return;

    try {
      setLoading(true);
      const ordersData = await orderService.getVenueOrders(venue.id);
      setOrders(ordersData);
      setSnackbar({ 
        open: true, 
        message: 'Orders refreshed successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh orders. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const renderOrderCard = (order: Order) => (
    <Card 
      key={order.id}
      className="card-responsive"
      sx={{ 
        mb: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid', 
        borderColor: 'divider',
        borderLeft: `4px solid ${getStatusColor(order.status)}`,
        '&:hover': { boxShadow: 2 }
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 3 }, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: { xs: 320, sm: 400 }
      }}>
        <Stack 
          direction="row"
          justifyContent="space-between" 
          alignItems="flex-start" 
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight="600" 
              color="text.primary"
              noWrap
            >
              {order.order_number || order.id}
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 0.5, sm: 1 }}
              sx={{ mt: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TableRestaurant fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Table {getTableNumber(order)}
                </Typography>
              </Stack>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                • {formatTime(order.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isMobile ? formatTime(order.created_at) : `• ${getTimeSinceOrder(order.created_at)}`}
              </Typography>
            </Stack>
          </Box>
          <Chip 
            icon={getStatusIcon(order.status)}
            label={orderService.formatOrderStatus(order.status)}
            size="small"
            sx={{ 
              backgroundColor: getStatusColor(order.status),
              color: 'white',
              '& .MuiChip-icon': { color: 'white' },
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          />
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Typography 
            variant={isMobile ? "body2" : "subtitle2"} 
            fontWeight="600" 
            color="text.primary" 
            sx={{ mb: 1 }}
          >
            Items ({order.items.length})
          </Typography>
          {order.items.slice(0, isMobile ? 1 : 2).map((item, index) => (
            <Stack 
              key={index}
              direction="row"
              justifyContent="space-between" 
              alignItems="center" 
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50', // Default to veg, would need menu item data for actual veg/non-veg
                    flexShrink: 0
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.quantity}x {item.menu_item_name}
                </Typography>
              </Stack>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  flexShrink: 0
                }}
              >
                {formatCurrency(item.total_price)}
              </Typography>
            </Stack>
          ))}
          {order.items.length > (isMobile ? 1 : 2) && (
            <Typography 
              variant="body2" 
              color="primary.main" 
              sx={{ 
                cursor: 'pointer',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              +{order.items.length - (isMobile ? 1 : 2)} more items
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight="600" 
              color="text.primary"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Total: {formatCurrency(order.total_amount)}
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1} 
              sx={{ mt: 0.5 }}
            >
              <Chip 
                label={orderService.formatPaymentStatus(order.payment_status)} 
                size="small" 
                color={order.payment_status === 'paid' ? 'success' : 'warning'}
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
              {order.payment_method && (
                <Chip 
                  label={order.payment_method.toUpperCase()} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
            </Stack>
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1} 
            justifyContent="center"
          >
            {/* View button only for admin */}
            {isAdmin() && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewOrder(order)}
                startIcon={<Visibility />}
                className="btn-responsive"
                fullWidth={isMobile}
                sx={{ flex: { xs: 'none', sm: isOperator() ? 0 : 1 } }}
              >
                View
              </Button>
            )}
            {order.status !== 'served' && order.status !== 'cancelled' && (
              <FormControl 
                size="small" 
                className="input-responsive"
                sx={{ flex: { xs: 'none', sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                  size="small"
                  disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="served">Served</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </Box>

        {order.estimated_ready_time && order.status !== 'served' && (
          <Stack 
            direction="row"
            alignItems="center" 
            spacing={1} 
            sx={{ 
              mt: 2, 
              p: { xs: 1, sm: 1.5 }, 
              backgroundColor: 'info.50', 
              borderRadius: 1 
            }}
          >
            <Timer fontSize="small" color="info" />
            <Typography 
              variant="body2" 
              color="info.main"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Estimated ready time: {formatTime(order.estimated_ready_time)}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" className="container-responsive">
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card className="card-responsive">
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Skeleton variant="text" height={isMobile ? 28 : 32} />
                    <Skeleton variant="text" height={isMobile ? 20 : 24} />
                    <Skeleton variant="rectangular" height={isMobile ? 100 : 120} sx={{ mt: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="container-responsive">
        <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            color="error" 
            gutterBottom
            fontWeight="600"
          >
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleRefreshOrders} 
            className="btn-responsive"
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="container-responsive">
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
            spacing={{ xs: 2, sm: 0 }}
            sx={{ mb: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1"
                gutterBottom 
                fontWeight="600" 
                color="text.primary"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
              >
                {isOperator() ? 'Kitchen Dashboard' : 'Orders Management'}
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary"
              >
                {isOperator() 
                  ? `View and update order status for ${getVenueDisplayName()}` 
                  : `Manage and track all orders for ${getVenueDisplayName()}`
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={handleRefreshOrders}
                className="btn-responsive"
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Stack>
        </Box>

        {/* Kitchen Statistics */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {[
            { label: 'Total Orders Today', value: orders.length, color: '#2196F3', icon: <Assignment /> },
            { label: 'Active Orders', value: getActiveOrders().length, color: '#FF9800', icon: <Restaurant /> },
            { label: 'Ready to Serve', value: orders.filter(o => o.status === 'ready').length, color: '#4CAF50', icon: <CheckCircle /> },
            { 
              label: 'Avg Prep Time', 
              value: orders.length > 0 ? '25 min' : '0 min', // Would calculate from actual data
              color: '#9C27B0', 
              icon: <Timer /> 
            },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={1} 
                className="card-responsive"
                sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                  spacing={{ xs: 1, sm: 2 }}
                  textAlign={{ xs: 'center', sm: 'left' }}
                >
                  <Avatar sx={{ 
                    backgroundColor: stat.color, 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 } 
                  }}>
                    {React.cloneElement(stat.icon, { 
                      fontSize: isMobile ? 'medium' : 'large' 
                    })}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      fontWeight="bold" 
                      color="text.primary"
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                      {typeof stat.value === 'string' ? stat.value : stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Controls */}
        <Paper 
          elevation={1} 
          className="card-responsive"
          sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                className="input-responsive"
                placeholder={isMobile ? "Search orders..." : "Search orders by ID, table, or items..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "medium" : "medium"}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                  size={isMobile ? "medium" : "medium"}
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="served">Served</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper elevation={1} className="card-responsive" sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab 
              icon={
                <Badge badgeContent={getActiveOrders().length} color="warning">
                  <Restaurant fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Active" : "Active Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={
                <Badge badgeContent={getServedOrders().length} color="success">
                  <CheckCircle fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Served" : "Served Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>

          {/* Active Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getActiveOrders().length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <Restaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    color="text.secondary" 
                    fontWeight="600"
                    gutterBottom
                  >
                    No Active Orders
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ maxWidth: 400, mx: 'auto' }}
                  >
                    All orders have been served or there are no new orders.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getActiveOrders().map(order => (
                    <Grid item xs={12} md={6} lg={4} key={order.id}>
                      {renderOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Served Orders Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getServedOrders().length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <CheckCircle sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    color="text.secondary" 
                    fontWeight="600"
                    gutterBottom
                  >
                    No Served Orders
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ maxWidth: 400, mx: 'auto' }}
                  >
                    Completed orders will appear here.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getServedOrders().map(order => (
                    <Grid item xs={12} md={6} lg={4} key={order.id}>
                      {renderOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>
        </Paper>

        {/* Order Details Dialog */}
        <Dialog 
          open={openOrderDialog} 
          onClose={() => setOpenOrderDialog(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              m: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1, sm: 0 }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight="600"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                Order Details - {selectedOrder?.order_number || selectedOrder?.id}
              </Typography>
              {selectedOrder && (
                <Chip 
                  icon={getStatusIcon(selectedOrder.status)}
                  label={orderService.formatOrderStatus(selectedOrder.status)}
                  sx={{ 
                    backgroundColor: getStatusColor(selectedOrder.status),
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
            {selectedOrder && (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Order Information
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Order ID" 
                        secondary={selectedOrder.order_number || selectedOrder.id}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Table" 
                        secondary={getTableNumber(selectedOrder)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Order Time" 
                        secondary={formatTime(selectedOrder.created_at)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Status" 
                        secondary={orderService.formatOrderStatus(selectedOrder.status)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    {selectedOrder.estimated_ready_time && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Estimated Ready Time" 
                          secondary={formatTime(selectedOrder.estimated_ready_time)}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Payment Information
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Payment Status" 
                        secondary={orderService.formatPaymentStatus(selectedOrder.payment_status)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    {selectedOrder.payment_method && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Payment Method" 
                          secondary={selectedOrder.payment_method.toUpperCase()}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Order Items
                  </Typography>
                  <List dense={isMobile}>
                    {selectedOrder.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={`${item.quantity}x ${item.menu_item_name}`}
                          secondary={`${formatCurrency(item.unit_price)} each - Total: ${formatCurrency(item.total_price)}`}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              width={{ xs: '100%', sm: 'auto' }}
              alignItems="center"
            >
              <Button 
                onClick={() => setOpenOrderDialog(false)}
                className="btn-responsive"
                fullWidth={isMobile}
              >
                Close
              </Button>
              {selectedOrder && selectedOrder.status !== 'served' && selectedOrder.status !== 'cancelled' && (
                <FormControl 
                  size="small" 
                  className="input-responsive"
                  sx={{ minWidth: { xs: '100%', sm: 120 } }}
                >
                  <Select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                    size="small"
                    disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="served">Served</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default OrdersManagement;