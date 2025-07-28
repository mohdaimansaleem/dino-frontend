import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  LocationOn,
  Notifications,
  Settings,
  Favorite,
  MoreVert,
  Restaurant,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  Receipt,
  Edit,
  Add
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus, UserAddress, AppNotification } from '../types';
import { apiService } from '../services/api';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, addressesData, notificationsData] = await Promise.all([
        apiService.get('/orders/user/my-orders?limit=10'),
        apiService.get('/users/addresses'),
        apiService.get('/notifications?limit=5')
      ]);

      setOrders((ordersData.data as Order[]) || []);
      setAddresses((addressesData.data as UserAddress[]) || []);
      setNotifications((notificationsData.data as AppNotification[]) || []);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'delivered': return 'success';
      case 'served': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <Restaurant />;
      case 'ready': return <CheckCircle />;
      case 'delivered': return <LocalShipping />;
      case 'served': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const getOrderProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'preparing': return 60;
      case 'ready': return 80;
      case 'delivered': return 100;
      case 'served': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 3, 
        background: (theme) => theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.paper} 100%)` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        transition: 'all 0.3s ease'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main' }}
              src={user?.profileImageUrl}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Welcome back, {user?.firstName}!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                icon={<ShoppingBag />}
                label={`${orders.length} Orders`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<LocationOn />}
                label={`${addresses.length} Addresses`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid item>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ color: 'white' }}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <ListItemIcon><Person /></ListItemIcon>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                <ListItemIcon><Settings /></ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { logout(); handleMenuClose(); }}>
                Logout
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {user?.totalOrders || 0}
                  </Typography>
                </Box>
                <ShoppingBag color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h4">
                    ₹{user?.totalSpent?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <Receipt color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Orders
                  </Typography>
                  <Typography variant="h4">
                    {orders.filter(o => !['delivered', 'served', 'cancelled'].includes(o.status)).length}
                  </Typography>
                </Box>
                <Schedule color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Notifications
                  </Typography>
                  <Typography variant="h4">
                    <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="error">
                      {notifications.length}
                    </Badge>
                  </Typography>
                </Box>
                <Notifications color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ShoppingBag />} label="Recent Orders" />
          <Tab icon={<LocationOn />} label="Addresses" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Favorite />} label="Favorites" />
        </Tabs>

        {/* Recent Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Recent Orders</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/restaurants')}
            >
              Order Now
            </Button>
          </Box>
          
          {orders.length === 0 ? (
            <Box textAlign="center" py={4}>
              <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No orders yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start exploring restaurants and place your first order
              </Typography>
              <Button variant="contained" onClick={() => navigate('/restaurants')}>
                Browse Restaurants
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {orders.map((order) => (
                <Grid item xs={12} key={order.id}>
                  <Card 
                    sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" gutterBottom>
                            Order #{order.orderNumber || order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {order.items.length} item(s) from {order.cafeId}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ mb: 1 }}>
                            <Chip
                              icon={getOrderStatusIcon(order.status)}
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={getOrderStatusColor(order.status) as any}
                              size="small"
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getOrderProgress(order.status)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${order.id}`);
                            }}
                          >
                            Track
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Saved Addresses</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/profile?tab=addresses')}
            >
              Add Address
            </Button>
          </Box>
          
          {addresses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No addresses saved
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add your addresses for faster checkout
              </Typography>
              <Button variant="contained" onClick={() => navigate('/profile?tab=addresses')}>
                Add Address
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {addresses.map((address) => (
                <Grid item xs={12} sm={6} key={address.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6">
                          {address.label}
                        </Typography>
                        {address.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {address.addressLine1}<br />
                        {address.addressLine2 && `${address.addressLine2}`}<br />
                        {address.city}, {address.state} {address.postalCode}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Notifications</Typography>
            <Button size="small">Mark All Read</Button>
          </Box>
          
          {notifications.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Notifications sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <Badge variant="dot" invisible={notification.isRead} color="primary">
                        <Notifications />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Favorites Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box textAlign="center" py={4}>
            <Favorite sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Favorites feature coming soon!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Save your favorite restaurants and dishes for quick access
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - #{selectedOrder?.orderNumber || selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                {selectedOrder.items.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography>
                      {item.quantity}x {item.menuItemName}
                      {(item as any).variantName && ` (${(item as any).variantName})`}
                    </Typography>
                    <Typography>₹{(item as any).totalPrice || (item.price * item.quantity)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <Typography>Total</Typography>
                  <Typography>₹{selectedOrder.totalAmount}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Order Status
                </Typography>
                <Chip
                  icon={getOrderStatusIcon(selectedOrder.status)}
                  label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  color={getOrderStatusColor(selectedOrder.status) as any}
                />
                <LinearProgress
                  variant="determinate"
                  value={getOrderProgress(selectedOrder.status)}
                  sx={{ height: 8, borderRadius: 4, mt: 2 }}
                />
              </Grid>
              
              {selectedOrder.specialInstructions && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Special Instructions
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.specialInstructions}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOrderDetailsOpen(false);
              navigate(`/orders/${selectedOrder?.id}`);
            }}
          >
            Track Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;