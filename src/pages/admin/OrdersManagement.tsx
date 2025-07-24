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
import { PERMISSIONS } from '../../types/auth';
import {
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAGE_TITLES,
  PLACEHOLDERS,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../constants';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  isVeg: boolean;
}

interface Order {
  id: string;
  tableNumber: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  orderTime: string;
  estimatedTime?: number;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

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
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  // Demo data for orders
  useEffect(() => {
    const demoOrders: Order[] = [
      {
        id: 'ORD-001',
        tableNumber: 'dt-001',
        tableId: 'dt-001',
        items: [
          { id: '1', name: 'Butter Chicken', quantity: 2, price: 320, isVeg: false },
          { id: '2', name: 'Garlic Naan', quantity: 3, price: 60, isVeg: true },
          { id: '3', name: 'Masala Chai', quantity: 2, price: 40, isVeg: true },
        ],
        total: 800,
        status: ORDER_STATUS.PROCESSING,
        orderTime: new Date(Date.now() - 15 * 60000).toISOString(),
        estimatedTime: 25,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentMethod: PAYMENT_METHODS.UPI,
      },
      {
        id: 'ORD-002',
        tableNumber: 'T-005',
        tableId: 'table-5',
        items: [
          { id: '4', name: 'Paneer Tikka', quantity: 1, price: 280, isVeg: true },
          { id: '5', name: 'Dal Makhani', quantity: 1, price: 220, isVeg: true },
          { id: '6', name: 'Jeera Rice', quantity: 1, price: 120, isVeg: true },
        ],
        total: 620,
        status: ORDER_STATUS.READY,
        orderTime: new Date(Date.now() - 30 * 60000).toISOString(),
        estimatedTime: 5,
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentMethod: PAYMENT_METHODS.CARD,
      },
      {
        id: 'ORD-003',
        tableNumber: 'T-012',
        tableId: 'table-12',
        items: [
          { id: '7', name: 'Chicken Biryani', quantity: 1, price: 350, isVeg: false },
          { id: '8', name: 'Raita', quantity: 1, price: 80, isVeg: true },
          { id: '9', name: 'Gulab Jamun', quantity: 2, price: 60, isVeg: true },
        ],
        total: 490,
        status: ORDER_STATUS.SERVED,
        orderTime: new Date(Date.now() - 60 * 60000).toISOString(),
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentMethod: PAYMENT_METHODS.CASH,
      },
      {
        id: 'ORD-004',
        tableNumber: 'T-008',
        tableId: 'table-8',
        items: [
          { id: '10', name: 'Veg Thali', quantity: 1, price: 250, isVeg: true },
          { id: '11', name: 'Lassi', quantity: 1, price: 80, isVeg: true },
        ],
        total: 330,
        status: ORDER_STATUS.ORDERED,
        orderTime: new Date(Date.now() - 5 * 60000).toISOString(),
        estimatedTime: 30,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentMethod: PAYMENT_METHODS.UPI,
      },
    ];
    setOrders(demoOrders);
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      order.status === ORDER_STATUS.ORDERED || 
      order.status === ORDER_STATUS.PROCESSING || 
      order.status === ORDER_STATUS.READY
    );
  };

  const getServedOrders = () => {
    return filteredOrders.filter(order => order.status === ORDER_STATUS.SERVED);
  };

  const getStatusColor = (status: string) => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#9E9E9E';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUS.ORDERED: return <Assignment />;
      case ORDER_STATUS.PROCESSING: return <Restaurant />;
      case ORDER_STATUS.READY: return <CheckCircle />;
      case ORDER_STATUS.SERVED: return <LocalShipping />;
      case ORDER_STATUS.CANCELLED: return <Visibility />;
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

  const getTimeSinceOrder = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m ago`;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setSnackbar({ 
      open: true, 
      message: `Order ${orderId} status updated to ${newStatus}`, 
      severity: 'success' 
    });
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
              {order.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <TableRestaurant fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Table {order.tableNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {formatTime(order.orderTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {getTimeSinceOrder(order.orderTime)}
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={getStatusIcon(order.status)}
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                    backgroundColor: item.isVeg ? '#4CAF50' : '#F44336',
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.quantity}x {item.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(item.price * item.quantity)}
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
                Total: {formatCurrency(order.total)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={order.paymentStatus} 
                  size="small" 
                  color={order.paymentStatus === PAYMENT_STATUS.PAID ? 'success' : 'warning'}
                  variant="outlined"
                />
                {order.paymentMethod && (
                  <Chip 
                    label={order.paymentMethod.toUpperCase()} 
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
            {order.status !== ORDER_STATUS.SERVED && order.status !== ORDER_STATUS.CANCELLED && (
              <FormControl size="small" sx={{ flex: 1 }}>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                  size="small"
                  disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                >
                  <MenuItem value={ORDER_STATUS.ORDERED}>Ordered</MenuItem>
                  <MenuItem value={ORDER_STATUS.PROCESSING}>Processing</MenuItem>
                  <MenuItem value={ORDER_STATUS.READY}>Ready</MenuItem>
                  <MenuItem value={ORDER_STATUS.SERVED}>Served</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        {order.estimatedTime && order.status !== ORDER_STATUS.SERVED && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1, backgroundColor: 'info.50', borderRadius: 1 }}>
            <Timer fontSize="small" color="info" />
            <Typography variant="body2" color="info.main">
              Estimated time: {order.estimatedTime} minutes
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
              {isOperator() ? PAGE_TITLES.OPERATOR_DASHBOARD : PAGE_TITLES.ORDERS_MANAGEMENT}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isOperator() 
                ? 'View and update order status for Dino Cafe' 
                : 'Manage and track all orders for Dino Cafe'
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => window.location.reload()}>
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
          { label: 'Ready to Serve', value: orders.filter(o => o.status === ORDER_STATUS.READY).length, color: '#4CAF50', icon: <CheckCircle /> },
          { 
            label: 'Avg Prep Time', 
            value: `${Math.round(orders.filter(o => o.estimatedTime).reduce((sum, order) => sum + (order.estimatedTime || 0), 0) / Math.max(orders.filter(o => o.estimatedTime).length, 1))} min`, 
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
              placeholder={PLACEHOLDERS.SEARCH_ORDERS}
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
                <MenuItem value={ORDER_STATUS.ORDERED}>Ordered</MenuItem>
                <MenuItem value={ORDER_STATUS.PROCESSING}>Processing</MenuItem>
                <MenuItem value={ORDER_STATUS.READY}>Ready</MenuItem>
                <MenuItem value={ORDER_STATUS.SERVED}>Served</MenuItem>
                <MenuItem value={ORDER_STATUS.CANCELLED}>Cancelled</MenuItem>
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
            <Typography variant="h6">Order Details - {selectedOrder?.id}</Typography>
            {selectedOrder && (
              <Chip 
                icon={getStatusIcon(selectedOrder.status)}
                label={`${selectedOrder.status.charAt(0).toUpperCase()}${selectedOrder.status.slice(1)}`}
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
                    <ListItemText primary="Order ID" secondary={selectedOrder.id} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Table" secondary={selectedOrder.tableNumber} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Order Time" secondary={formatTime(selectedOrder.orderTime)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={selectedOrder.status} />
                  </ListItem>
                  {selectedOrder.estimatedTime && (
                    <ListItem>
                      <ListItemText primary="Estimated Time" secondary={`${selectedOrder.estimatedTime} minutes`} />
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
                    <ListItemText primary="Payment Status" secondary={selectedOrder.paymentStatus} />
                  </ListItem>
                  {selectedOrder.paymentMethod && (
                    <ListItem>
                      <ListItemText primary="Payment Method" secondary={selectedOrder.paymentMethod.toUpperCase()} />
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: item.isVeg ? '#4CAF50' : '#F44336',
                          }}
                        />
                      </Box>
                      <ListItemText 
                        primary={`${item.quantity}x ${item.name}`}
                        secondary={item.notes}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </ListItem>
                  ))}
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Total" />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      {formatCurrency(selectedOrder.total)}
                    </Typography>
                  </ListItem>
                </List>
              </Grid>
              {selectedOrder.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Order Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Print />}>
            Print Order
          </Button>
          {selectedOrder && selectedOrder.status !== ORDER_STATUS.SERVED && selectedOrder.status !== ORDER_STATUS.CANCELLED && (
            <Button variant="contained" startIcon={<Edit />}>
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersManagement;