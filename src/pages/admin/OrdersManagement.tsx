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
import { useWorkspace } from '../../contexts/WorkspaceContext';
import AuthDebug from '../../components/debug/AuthDebug';
import ApiDebug from '../../components/debug/ApiDebug';
import VenueDebug from '../../components/debug/VenueDebug';
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
  const { hasPermission, isOperator, isAdmin, user } = useAuth();
  const { currentCafe, refreshCafes, loading: workspaceLoading } = useWorkspace();
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

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      // Try to get venue ID from user data if currentCafe is not available
      const venueId = currentCafe?.id || user?.cafeId || user?.venue_id;
      
      if (!venueId) {
        // Try to refresh workspace data to get venue
        try {
          await refreshCafes();
          setError('No cafe selected. Please ensure you have a venue assigned to your account.');
        } catch (refreshError) {
          setError('Unable to load venue data. Please contact support.');
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ordersData = await orderService.getVenueOrders(venueId);
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
  }, [currentCafe?.id, user?.cafeId, user?.venue_id]);

  // Retry loading orders when currentCafe becomes available
  useEffect(() => {
    if (currentCafe?.id && orders.length === 0 && !loading) {
      const loadOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const ordersData = await orderService.getVenueOrders(currentCafe.id);
          setOrders(ordersData);
        } catch (error) {
          setError('Failed to load orders. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      loadOrders();
    }
  }, [currentCafe?.id]);

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
    const venueId = currentCafe?.id || user?.cafeId || user?.venue_id;
    if (!venueId) return;

    try {
      setLoading(true);
      const ordersData = await orderService.getVenueOrders(venueId);
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
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              {order.order_number || order.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <TableRestaurant fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Table {getTableNumber(order)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {formatTime(order.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {getTimeSinceOrder(order.created_at)}
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={getStatusIcon(order.status)}
            label={orderService.formatOrderStatus(order.status)}
            size="small"
            sx={{ 
              backgroundColor: getStatusColor(order.status),
              color: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
            Items ({order.items.length})
          </Typography>
          {order.items.slice(0, 2).map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50', // Default to veg, would need menu item data for actual veg/non-veg
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.quantity}x {item.menu_item_name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(item.total_price)}
              </Typography>
            </Box>
          ))}
          {order.items.length > 2 && (
            <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer' }}>
              +{order.items.length - 2} more items
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Total: {formatCurrency(order.total_amount)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={orderService.formatPaymentStatus(order.payment_status)} 
                  size="small" 
                  color={order.payment_status === 'paid' ? 'success' : 'warning'}
                  variant="outlined"
                />
                {order.payment_method && (
                  <Chip 
                    label={order.payment_method.toUpperCase()} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {/* View button only for admin */}
            {isAdmin() && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewOrder(order)}
                startIcon={<Visibility />}
                sx={{ flex: isOperator() ? 0 : 1 }}
              >
                View
              </Button>
            )}
            {order.status !== 'served' && order.status !== 'cancelled' && (
              <FormControl size="small" sx={{ flex: 1 }}>
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
          </Box>
        </Box>

        {order.estimated_ready_time && order.status !== 'served' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1, backgroundColor: 'info.50', borderRadius: 1 }}>
            <Timer fontSize="small" color="info" />
            <Typography variant="body2" color="info.main">
              Estimated ready time: {formatTime(order.estimated_ready_time)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
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
          <Button variant="contained" onClick={handleRefreshOrders} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Debug Info */}
      <AuthDebug />
      <ApiDebug />
      <VenueDebug />
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
              {isOperator() ? 'Kitchen Dashboard' : 'Orders Management'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isOperator() 
                ? `View and update order status for ${currentCafe?.name || 'your cafe'}` 
                : `Manage and track all orders for ${currentCafe?.name || 'your cafe'}`
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleRefreshOrders}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Kitchen Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
            <Paper elevation={1} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders by ID, table, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
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
      <Paper elevation={1} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab 
            icon={<Badge badgeContent={getActiveOrders().length} color="warning"><Restaurant /></Badge>} 
            label="Active Orders" 
          />
          <Tab 
            icon={<Badge badgeContent={getServedOrders().length} color="success"><CheckCircle /></Badge>} 
            label="Served Orders" 
          />
        </Tabs>

        {/* Active Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {getActiveOrders().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Active Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All orders have been served or there are no new orders.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
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
          <Box sx={{ p: 3 }}>
            {getServedOrders().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Served Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed orders will appear here.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
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
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Order Details - {selectedOrder?.order_number || selectedOrder?.id}</Typography>
            {selectedOrder && (
              <Chip 
                icon={getStatusIcon(selectedOrder.status)}
                label={orderService.formatOrderStatus(selectedOrder.status)}
                sx={{ 
                  backgroundColor: getStatusColor(selectedOrder.status),
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Order Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Order ID" secondary={selectedOrder.order_number || selectedOrder.id} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Table" secondary={getTableNumber(selectedOrder)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Order Time" secondary={formatTime(selectedOrder.created_at)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={orderService.formatOrderStatus(selectedOrder.status)} />
                  </ListItem>
                  {selectedOrder.estimated_ready_time && (
                    <ListItem>
                      <ListItemText primary="Estimated Ready Time" secondary={formatTime(selectedOrder.estimated_ready_time)} />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Payment Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Payment Status" secondary={orderService.formatPaymentStatus(selectedOrder.payment_status)} />
                  </ListItem>
                  {selectedOrder.payment_method && (
                    <ListItem>
                      <ListItemText primary="Payment Method" secondary={selectedOrder.payment_method.toUpperCase()} />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {selectedOrder.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${item.quantity}x ${item.menu_item_name}`}
                        secondary={`${formatCurrency(item.unit_price)} each - Total: ${formatCurrency(item.total_price)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
          {selectedOrder && selectedOrder.status !== 'served' && selectedOrder.status !== 'cancelled' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
    </Container>
  );
};

export default OrdersManagement;